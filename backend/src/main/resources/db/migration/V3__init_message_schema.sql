CREATE TABLE messages (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    content TEXT NOT NULL,
    state VARCHAR(20) NOT NULL,
    type VARCHAR(20) NOT NULL,
    chat_id VARCHAR(36) NOT NULL,
    sender_id VARCHAR(36) NOT NULL,
    recipient_id VARCHAR(36) NOT NULL,
    created_date DATETIME NOT NULL,
    last_modified_date DATETIME,
    CONSTRAINT fk_messages_chat FOREIGN KEY (chat_id) REFERENCES chats(id)
);

CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(recipient_id);