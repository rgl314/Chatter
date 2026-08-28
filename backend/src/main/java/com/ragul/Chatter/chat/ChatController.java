package com.ragul.Chatter.chat;

import com.ragul.Chatter.message.Message;
import com.ragul.Chatter.message.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final MessageService messageService;
    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;
    private final SimpUserRegistry simpUserRegistry;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessageRequest request, Principal principal) {

        String senderId = principal.getName();
        Message saved = messageService.sendMessage(senderId, request);

        messagingTemplate.convertAndSendToUser(
                request.recipientId(),
                "/queue/messages",
                ChatMessageResponse.from(saved)
        );

        boolean recipientOnline = simpUserRegistry.getUser(request.recipientId()) != null;
        System.out.println("DEBUG: recipientId=" + request.recipientId() + " recipientOnline=" + recipientOnline);

        Message result = saved;
        if (recipientOnline) {
            result = messageService.markDelivered(saved.getId());
        }

        messagingTemplate.convertAndSendToUser(
                senderId,
                "/queue/messages",
                ChatMessageResponse.from(result)
        );
    }

    @MessageMapping("/chat.read")
    public void markAsRead(@Payload ReadReceiptRequest request, Principal principal) {

        if (request.recipientId() == null) {
            return;
        }

        String readerId = principal.getName();

        Chat chat = chatService.getOrCreateChat(readerId, request.recipientId());
        List<Message> nowSeen = messageService.markSeen(chat.getId(), readerId);

        nowSeen.stream()
                .map(Message::getSenderId)
                .distinct()
                .forEach(senderId ->
                        messagingTemplate.convertAndSendToUser(
                                senderId,
                                "/queue/messages.status",
                                nowSeen.stream()
                                        .filter(m -> m.getSenderId().equals(senderId))
                                        .map(ChatMessageResponse::from)
                                        .toList()
                        )
                );
    }

    @MessageExceptionHandler
    public void handleException(Throwable ex, Principal principal) {
        ex.printStackTrace();

        if (principal != null) {
            messagingTemplate.convertAndSendToUser(
                    principal.getName(),
                    "/queue/errors",
                    new ErrorResponse("MESSAGE_FAILED", ex.getMessage())
            );
        }
    }

}
