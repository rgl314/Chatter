CREATE TABLE chats (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    sender_id VARCHAR(36) NOT NULL,
    recipient_id VARCHAR(36) NOT NULL,
    created_date DATETIME NOT NULL,
    last_modified_date DATETIME,
    CONSTRAINT fk_chats_sender FOREIGN KEY (sender_id) REFERENCES users(id),
    CONSTRAINT fk_chats_recipient FOREIGN KEY (recipient_id) REFERENCES users(id)
);