package com.ragul.Chatter.chat;

import com.ragul.Chatter.message.Message;

public record ChatMessageRequest (
        String recipientId,
        String content,
        Message.MessageType type
){
}
