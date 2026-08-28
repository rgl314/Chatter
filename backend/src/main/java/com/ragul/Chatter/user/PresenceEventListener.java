package com.ragul.Chatter.user;

import com.ragul.Chatter.chat.ChatMessageResponse;
import com.ragul.Chatter.message.Message;
import com.ragul.Chatter.message.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class PresenceEventListener {

    private final PresenceTracker presenceTracker;
    private final UserRepository userRepository;
    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void handleConnect(SessionConnectedEvent event) {
        String userId = extractUserId(event.getUser());
        if (userId == null) return;

        boolean justCameOnline = presenceTracker.markOnline(userId);

        if (justCameOnline) {
            broadcastPresence(userId, true);

            // Retroactively deliver any messages that were sent while this user was offline
            List<Message> delivered = messageService.markAllDeliveredForUser(userId);
            delivered.stream()
                    .map(Message::getSenderId)
                    .distinct()
                    .forEach(senderId ->
                            messagingTemplate.convertAndSendToUser(
                                    senderId,
                                    "/queue/messages.status",
                                    delivered.stream()
                                            .filter(m -> m.getSenderId().equals(senderId))
                                            .map(ChatMessageResponse::from)
                                            .toList()
                            )
                    );
        }
    }

    @EventListener
    @Transactional
    public void handleDisconnect(SessionDisconnectEvent event) {
        String userId = extractUserId(event.getUser());
        if (userId == null) return;

        boolean justWentOffline = presenceTracker.markOffline(userId);

        if (justWentOffline) {
            userRepository.findById(userId).ifPresent(user -> {
                user.setLastSeen(LocalDateTime.now());
                userRepository.save(user);
            });
            broadcastPresence(userId, false);
        }
    }

    private String extractUserId(Principal principal) {
        return principal != null ? principal.getName() : null;
    }

    private void broadcastPresence(String userId, boolean online) {
        messagingTemplate.convertAndSend(
                "/topic/presence." + userId,
                new PresenceEvent(userId, online, LocalDateTime.now())
        );
    }
}

