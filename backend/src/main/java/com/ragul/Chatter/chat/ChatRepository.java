package com.ragul.Chatter.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatRepository extends JpaRepository<Chat, String> {

    @Query("""
        SELECT c FROM Chat c
        WHERE (c.sender.id = :userA AND c.recipient.id = :userB)
           OR (c.sender.id = :userB AND c.recipient.id = :userA)
        """)
    Optional<Chat> findChatBetween(String userA, String userB);

}
