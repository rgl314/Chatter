package com.ragul.Chatter.chat;

import com.ragul.Chatter.user.User;
import com.ragul.Chatter.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository chatRepository;
    private final UserRepository userRepository;

    @Transactional
    public Chat getOrCreateChat(String senderId, String recipientId) {
        return chatRepository.findChatBetween(senderId, recipientId)
                .orElseGet(() -> {
                    User sender = userRepository.getReferenceById(senderId);
                    User recipient = userRepository.getReferenceById(recipientId);

                    Chat chat = Chat.builder()
                            .sender(sender)
                            .recipient(recipient)
                            .build();

                    return chatRepository.save(chat);
                });
    }

}
