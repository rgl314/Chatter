package com.ragul.Chatter.chat;

import com.ragul.Chatter.message.Message;

import java.time.LocalDateTime;

public record ChatMessageResponse(
        Long id,
        String chatId,
        String senderId,
        String recipientId,
        String content,
        Message.MessageType type,
        Message.MessageState state,
        LocalDateTime createdDate
) {
    public static ChatMessageResponse from(Message message) {
        return new ChatMessageResponse(
                message.getId(),
                message.getChat().getId(),
                message.getSenderId(),
                message.getRecipientId(),
                message.getContent(),
                message.getType(),
                message.getState(),
                message.getCreatedDate()
        );
    }
}
