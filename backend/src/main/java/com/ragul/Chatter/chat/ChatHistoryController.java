package com.ragul.Chatter.chat;

import com.ragul.Chatter.message.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
public class ChatHistoryController {

    private final ChatService chatService;
    private final MessageRepository messageRepository;

    @GetMapping("/{recipientId}/messages")
    public ResponseEntity<List<ChatMessageResponse>> getHistory(
            @PathVariable String recipientId,
            Principal principal) {

        String currentUserId = principal.getName();

        Chat chat = chatService.getOrCreateChat(currentUserId, recipientId);

        List<ChatMessageResponse> messages = messageRepository
                .findByChat_IdOrderByCreatedDateAsc(chat.getId())
                .stream()
                .map(ChatMessageResponse::from)
                .toList();

        return ResponseEntity.ok(messages);
    }
}