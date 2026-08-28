package com.ragul.Chatter.user;

import java.time.LocalDateTime;

record PresenceStatusResponse(String userId, boolean online, LocalDateTime lastSeen) {}