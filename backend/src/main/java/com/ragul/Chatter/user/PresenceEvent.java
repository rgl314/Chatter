package com.ragul.Chatter.user;

import java.time.LocalDateTime;

record PresenceEvent(String userId, boolean online, LocalDateTime timestamp) {}