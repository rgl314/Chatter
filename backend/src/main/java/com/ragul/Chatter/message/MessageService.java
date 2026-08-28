package com.ragul.Chatter.message;

import com.ragul.Chatter.chat.Chat;
import com.ragul.Chatter.chat.ChatMessageRequest;
import com.ragul.Chatter.chat.ChatService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final ChatService chatService;

    @Transactional
    public Message sendMessage(String senderId, ChatMessageRequest request) {
        Chat chat = chatService.getOrCreateChat(senderId, request.recipientId());

        Message message = Message.builder()
                .content(request.content())
                .type(request.type())
                .state(Message.MessageState.SENT)
                .chat(chat)
                .senderId(senderId)
                .recipientId(request.recipientId())
                .build();

        return messageRepository.save(message);
    }

    @Transactional
    public Message markDelivered(Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new EntityNotFoundException("Message not found: " + messageId));

        if (message.getState() == Message.MessageState.SENT) {
            message.setState(Message.MessageState.DELIVERED);
        }
        return message;
    }

    @Transactional
    public List<Message> markSeen(String chatId, String readerId) {
        // every message in this chat addressed TO the reader, not yet SEEN
        List<Message> unseen = messageRepository
                .findByChat_IdAndRecipientIdAndStateNot(chatId, readerId, Message.MessageState.SEEN);

        unseen.forEach(m -> m.setState(Message.MessageState.SEEN));
        return unseen; // dirty entities, flushed on transaction commit
    }

    // MessageService.java
    @Transactional
    public List<Message> markAllDeliveredForUser(String recipientId) {
        List<Message> pending = messageRepository.findByRecipientIdAndState(recipientId, Message.MessageState.SENT);
        pending.forEach(m -> m.setState(Message.MessageState.DELIVERED));
        return pending;
    }

}
