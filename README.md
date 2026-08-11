<div align="center">

# 💬 Chatter

### A Real-Time Chat Application built with Spring Boot, React, WebSockets, Keycloak, MySQL, Flyway & Docker

![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.1.0-brightgreen?style=for-the-badge&logo=springboot)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![MySQL](https://img.shields.io/badge/MySQL-8-blue?style=for-the-badge&logo=mysql)
![Keycloak](https://img.shields.io/badge/Keycloak-26.5.7-4D4D4D?style=for-the-badge&logo=keycloak)
![WebSocket](https://img.shields.io/badge/WebSocket-STOMP-orange?style=for-the-badge)
![Flyway](https://img.shields.io/badge/Flyway-Database_Migrations-cc0000?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

</div>

---

# 📖 About

**Chatter** is a real-time chat application built with **Spring Boot** and **React**.

The application uses **Keycloak** for authentication and authorization, **WebSockets with STOMP** for real-time communication, **MySQL** for persistent data, and **Flyway** for database migrations.

Users can authenticate through Keycloak, view other registered users, see their online/offline presence, start conversations, exchange messages in real time, receive delivery and read-status updates, and share image, audio, and video files.

The project is designed as a practical implementation of modern backend concepts including **OAuth2/JWT security, WebSockets, message delivery states, presence tracking, file storage, JPA/Hibernate, database migrations, and Docker Compose**.

---

# ✨ Features

* 🔐 Keycloak-based authentication and JWT security
* 👤 Automatic synchronization of authenticated Keycloak users into MySQL
* 👥 View other registered users
* 🟢 Real-time online/offline presence tracking
* 💬 Real-time one-to-one messaging using WebSockets and STOMP
* 📜 Persistent chat history
* ⚡ Optimistic UI for faster message interaction
* 📤 Message delivery states: `SENT`, `DELIVERED`, `SEEN`
* 👀 Read receipts for messages
* 🔄 Automatic delivery of messages sent while a user was offline
* 📎 Upload image, audio, and video files
* 🔒 Authenticated file downloads restricted to chat participants
* 🔑 JWT authentication for both REST APIs and WebSocket connections
* 🔄 Automatic JWT refresh before API/WebSocket operations
* 🗄️ MySQL persistence with Spring Data JPA
* 🔄 Database schema management with Flyway
* 🐳 Containerized with Docker and Docker Compose
* 🌐 React frontend served through Nginx in Docker

---

# 🏗️ Application Flow

## Main flow

1. User opens the Chatter frontend.
2. User is authenticated through Keycloak.
3. Keycloak issues a JWT access token.
4. React sends the token with authenticated REST requests and WebSocket connections.
5. Spring Security validates the JWT.
6. The authenticated user is synchronized with the MySQL `users` table.
7. The user can view other registered users.
8. The frontend establishes a STOMP connection through `/ws`.
9. The backend tracks the user's online presence.
10. User selects another contact and loads the existing chat history.
11. Messages are sent through `/app/chat.send`.
12. The backend persists the message and sends it to the recipient through a user-specific queue.
13. Message state changes from `SENT` to `DELIVERED` when the recipient is online.
14. Messages become `SEEN` when the recipient reads the conversation.
15. Presence changes are broadcast to subscribed clients.
16. Media files are uploaded through the REST API and their URLs are sent as chat messages.

---

## Authentication Flow

<p align="center">

```text
┌──────────────┐
│    React     │
│   Frontend   │
└──────┬───────┘
       │
       │ Login
       ▼
┌──────────────┐
│   Keycloak   │
│   chatter    │
│    realm     │
└──────┬───────┘
       │
       │ JWT Access Token
       ▼
┌──────────────┐
│    React     │
└──────┬───────┘
       │
       │ Bearer Token
       ▼
┌──────────────┐
│ Spring Boot  │
│  Security    │
└──────┬───────┘
       │
       │ JWT validation
       ▼
┌──────────────┐
│   User Sync  │
│    MySQL     │
└──────────────┘
```

</p>

---

## WebSocket Message Flow

<p align="center">

```text
User A
  │
  │ STOMP SEND
  │ /app/chat.send
  ▼
┌─────────────────────┐
│   Spring WebSocket  │
│    ChatController   │
└──────────┬──────────┘
           │
           │ Save message
           ▼
┌─────────────────────┐
│       MySQL         │
│      messages       │
└──────────┬──────────┘
           │
           │ User destination
           ▼
┌─────────────────────┐
│ /user/queue/messages│
└──────────┬──────────┘
           │
           ▼
        User B
```

</p>

---

## Presence Flow

<p align="center">

```text
WebSocket CONNECT
       │
       ▼
JwtChannelInterceptor
       │
       ▼
PresenceTracker
       │
       ├── First active session
       │        │
       │        ▼
       │   User ONLINE
       │        │
       │        ▼
       │ /topic/presence.{userId}
       │
       ▼
WebSocket DISCONNECT
       │
       ▼
PresenceTracker
       │
       ├── Last active session
       │        │
       │        ▼
       │   User OFFLINE
       │        │
       │        ▼
       │ /topic/presence.{userId}
       │
       ▼
Update lastSeen in MySQL
```

</p>

---

# 📌 Results

## Login

The application uses Keycloak to authenticate users before allowing access to Chatter.

<p align="center">

<!-- Add Chatter login screenshot here -->

</p>

---

## Chat Interface

Users can select another registered user and exchange messages in real time.

<p align="center">

<!-- Add Chatter chat screenshot here -->

</p>

---

## Online / Offline Presence

The contact list displays the current presence state of other users and updates it through WebSocket events.

<p align="center">

<!-- Add Chatter presence screenshot here -->

</p>

---

## Message Status

Messages support the following states:

```text
SENT → DELIVERED → SEEN
```

<p align="center">

<!-- Add message status screenshot here -->

</p>

---

## Media Messages

Users can upload and send:

* 🖼️ Images
* 🎵 Audio
* 🎥 Video

Files are stored locally by the backend and accessed through authenticated file endpoints.

<p align="center">

<!-- Add media message screenshot here -->

</p>

---

# 🛠️ Tech Stack

| Category | Technology |
| -------- | ---------- |
| Language | Java 21 |
| Backend Framework | Spring Boot 4.1.0 |
| Frontend | React 19 |
| Build Tool | Maven |
| Database | MySQL 8 |
| ORM | Spring Data JPA / Hibernate |
| Authentication | Keycloak 26.5.7 |
| Security | Spring Security OAuth2 Resource Server / JWT |
| Real-Time Communication | WebSocket + STOMP |
| WebSocket Client | @stomp/stompjs + SockJS |
| Database Migration | Flyway |
| File Storage | Local File System |
| Frontend Build Tool | Vite |
| Frontend Server | Nginx |
| Containerization | Docker / Docker Compose |
| Utilities | Lombok |

---

# 📂 Project Structure

```text
Chatter
├── backend
│   ├── src
│   │   ├── main
│   │   │   ├── java
│   │   │   │   └── com.ragul.Chatter
│   │   │   │       ├── chat
│   │   │   │       ├── common
│   │   │   │       ├── config
│   │   │   │       ├── exception
│   │   │   │       ├── file
│   │   │   │       ├── message
│   │   │   │       ├── user
│   │   │   │       └── websocket
│   │   │   │           └── config
│   │   │   │
│   │   │   └── resources
│   │   │       ├── application.yaml
│   │   │       └── db
│   │   │           └── migration
│   │   │               ├── V1__init_user_schema.sql
│   │   │               ├── V2__init_chat_schema.sql
│   │   │               └── V3__init_message_schema.sql
│   │   │
│   │   └── test
│   │
│   ├── keycloak
│   │   └── realm-export.json
│   ├── Dockerfile
│   └── pom.xml
│
├── Frontend
│   ├── src
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── ChatWindow.jsx
│   │   ├── ContactList.jsx
│   │   ├── AuthedMedia.jsx
│   │   ├── MessageStatus.jsx
│   │   ├── keycloak.js
│   │   ├── main.jsx
│   │   └── socket.js
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── keycloak
│   └── chatter-realm.json
│
└── docker-compose.yml
```

---

# 🌐 REST API

All protected REST endpoints require a valid Keycloak JWT access token.

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/users` | Get all users except the authenticated user |
| GET | `/api/users/{userId}/presence` | Get a user's current presence |
| GET | `/api/chats/{recipientId}/messages` | Get chat history with a user |
| POST | `/api/files/upload` | Upload an image, audio, or video file |
| GET | `/files/{filename}` | Download an uploaded file |

---

# 🔌 WebSocket API

WebSocket endpoint:

```text
/ws
```

SockJS is used by the React frontend for the WebSocket connection.

### Application destinations

| Destination | Description |
| ----------- | ----------- |
| `/app/chat.send` | Send a message |
| `/app/chat.read` | Mark chat messages as read |

### User-specific destinations

| Destination | Description |
| ----------- | ----------- |
| `/user/queue/messages` | Receive real-time messages |
| `/user/queue/messages.status` | Receive message delivery/read-status updates |
| `/user/queue/errors` | Receive WebSocket message errors |

### Presence destination

```text
/topic/presence.{userId}
```

Clients subscribe to a user's presence topic to receive online/offline updates.

---

# 📤 Sample WebSocket Message

## Send Message

Destination:

```text
/app/chat.send
```

Payload:

```json
{
  "recipientId": "recipient-user-id",
  "content": "Hello from Chatter!",
  "type": "TEXT"
}
```

Supported message types:

```text
TEXT
IMAGE
AUDIO
VIDEO
```

---

# 📥 Sample Message Response

```json
{
  "id": 1,
  "chatId": "chat-id",
  "senderId": "sender-user-id",
  "recipientId": "recipient-user-id",
  "content": "Hello from Chatter!",
  "type": "TEXT",
  "state": "SENT",
  "createdDate": "2026-08-11T12:30:00"
}
```

Message state progresses through:

```text
SENT
  ↓
DELIVERED
  ↓
SEEN
```

---

# 🔐 Authentication

Chatter uses **Keycloak** as the identity and access management server.

The authentication flow is based on:

* OpenID Connect
* OAuth 2.0
* JWT access tokens
* Spring Security OAuth2 Resource Server

The frontend uses `keycloak-js` to authenticate users.

The backend validates the JWT for protected REST requests.

WebSocket connections are also authenticated using the JWT supplied through the STOMP `Authorization` header.

The backend synchronizes authenticated Keycloak users into the local MySQL `users` table.

---

# 🗄️ Database

Flyway automatically manages the database schema.

## Main Tables

### `users`

Stores authenticated application users.

```text
id
first_name
last_name
email
last_seen
created_date
last_modified_date
```

### `chats`

Stores conversations between users.

```text
id
sender_id
recipient_id
created_date
last_modified_date
```

### `messages`

Stores messages and their delivery state.

```text
id
content
state
type
chat_id
sender_id
recipient_id
created_date
last_modified_date
```

## Message States

```text
SENT
DELIVERED
SEEN
```

---

# 📎 File Storage

Chatter supports uploading:

* Images
* Audio
* Video

Uploaded files are stored in the configured upload directory.

Default configuration:

```yaml
app:
  upload:
    dir: uploads
```

The Docker deployment mounts this directory to a persistent Docker volume:

```text
/uploads
```

File downloads are protected by checking whether the authenticated user is a participant in the message containing the file.

---

# ⚙️ Configuration

## Backend

The local development configuration uses:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3307/chatter
    username: root
    password: root

  jpa:
    hibernate:
      ddl-auto: validate

  flyway:
    enabled: true

  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://127.0.0.1:9090/realms/chatter
```

For Docker, the backend uses the MySQL and Keycloak Docker service names for internal communication where required.

---

## Keycloak

Default local Keycloak address:

```text
http://127.0.0.1:9090
```

Realm:

```text
chatter
```

Client:

```text
chatter-client
```

Keycloak is imported from the realm configuration during Docker startup.

> Do not use real production credentials in the repository. Replace development credentials before deploying the application outside a local environment.

---

# 🚀 Running Locally

## Clone Repository

```bash
git clone https://github.com/<your-username>/Chatter.git
cd Chatter
```

---

## Start MySQL & Keycloak

Make sure Docker is installed and running.

Start the complete application stack:

```bash
docker compose up --build
```

---

## Frontend

The React application is available at:

```text
http://localhost:5173
```

---

## Backend

The Spring Boot API is available at:

```text
http://localhost:8080
```

---

## Keycloak

Keycloak is available at:

```text
http://127.0.0.1:9090
```

---

# 🐳 Docker

Chatter uses Docker Compose to run the application services.

## Build and start all services

```bash
docker compose up --build
```

## Run in detached mode

```bash
docker compose up -d
```

## View running containers

```bash
docker compose ps
```

## View logs

```bash
docker compose logs -f
```

## Stop containers

```bash
docker compose down
```

---

# 🧩 Docker Services

| Service | Container | Port | Purpose |
| ------- | --------- | ---- | ------- |
| MySQL | `mysql_chatter` | `3307` | Application database |
| Keycloak | `keycloak_chatter` | `9090` | Authentication server |
| Backend | `backend` | `8080` | Spring Boot API and WebSocket server |
| Frontend | `frontend` | `5173` | React application served by Nginx |

---

# 🔄 Message Delivery Architecture

Chatter maintains message state using:

```text
             ┌───────────┐
             │   SENT    │
             └─────┬─────┘
                   │
                   │ Recipient online
                   ▼
             ┌───────────┐
             │ DELIVERED │
             └─────┬─────┘
                   │
                   │ Recipient reads chat
                   ▼
             ┌───────────┐
             │   SEEN    │
             └───────────┘
```

If a recipient is offline, the message remains in the `SENT` state.

When the recipient establishes a WebSocket connection again, pending messages for that user are marked as delivered and delivery-status updates are sent to the appropriate senders.

---

# 🟢 Presence Tracking

Presence is maintained using an in-memory `ConcurrentHashMap`.

The tracker maintains the number of active sessions for each user.

This allows Chatter to correctly handle multiple browser tabs or devices:

```text
User A
 ├── Browser Tab 1
 ├── Browser Tab 2
 └── Browser Tab 3

Active sessions = 3
User = ONLINE
```

The user becomes offline only after their last active WebSocket session disconnects.

The last-seen timestamp is persisted in MySQL when the user goes offline.

---

# 🧪 Testing

The backend contains a Spring Boot application test setup.

Run the Maven test suite with:

```bash
./mvnw test
```

or:

```bash
mvn test
```

---

# 📈 Future Enhancements

* 🔔 Browser notifications for new messages
* 🟢 More detailed presence and last-seen indicators
* ✏️ Message editing
* 🗑️ Message deletion
* ↩️ Message replies
* 🔍 Message search
* 📌 Message pinning
* 😊 Emoji picker and reactions
* 👥 Group conversations
* 📞 Audio/video calling
* ☁️ Object storage for media files
* 📊 Better test coverage
* 📚 Swagger/OpenAPI documentation
* 🔐 Production-ready Keycloak configuration
* 📈 Monitoring with Prometheus and Grafana
* 🐳 Production container hardening
* ☸️ Kubernetes deployment

---

# 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push the branch
5. Open a Pull Request

---

# 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">

### ⭐ If you found this project helpful, consider giving it a star!

Built with ❤️ using **Spring Boot**, **React**, **WebSockets**, **Keycloak**, **MySQL**, **Flyway**, and **Docker**

</div>
