package com.ragul.Chatter.file;

import com.ragul.Chatter.message.Message;

public record FileUploadResponse(
        String url,
        Message.MessageType type,
        long size,
        String contentType
) {
}
