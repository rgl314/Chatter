package com.ragul.Chatter.user;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class PresenceTracker {

    // maps userId -> number of active sessions (a user might have multiple tabs/devices open)
    private final Map<String, AtomicInteger> onlineUsers = new ConcurrentHashMap<>();

    public boolean markOnline(String userId) {
        AtomicInteger count = onlineUsers.computeIfAbsent(userId, id -> new AtomicInteger(0));
        int newCount = count.incrementAndGet();
        return newCount == 1; // true only when this is their FIRST session (they just came online)
    }

    public boolean markOffline(String userId) {
        AtomicInteger count = onlineUsers.get(userId);
        if (count == null) return false;

        int newCount = count.decrementAndGet();
        if (newCount <= 0) {
            onlineUsers.remove(userId);
            return true; // true only when their LAST session closed (they just went offline)
        }
        return false;
    }

    public boolean isOnline(String userId) {
        return onlineUsers.containsKey(userId);
    }
}