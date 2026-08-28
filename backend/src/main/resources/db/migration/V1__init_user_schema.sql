CREATE TABLE users (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    last_seen DATETIME NOT NULL,
    created_date DATETIME NOT NULL,
    last_modified_date DATETIME
);

