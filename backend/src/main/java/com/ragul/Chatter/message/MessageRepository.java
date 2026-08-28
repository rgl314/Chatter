package com.ragul.Chatter.message;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByChat_IdAndRecipientIdAndStateNot(String chatId, String readerId, Message.MessageState state);
    List<Message> findByChat_IdOrderByCreatedDateAsc(String chatId);
    List<Message> findByRecipientIdAndState(String recipientId, Message.MessageState state);
    Optional<Message> findByContent(String content);
}
