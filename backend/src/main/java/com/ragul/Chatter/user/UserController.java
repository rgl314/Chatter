package com.ragul.Chatter.user;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PresenceTracker presenceTracker;

    @GetMapping("/{userId}/presence")
    public ResponseEntity<PresenceStatusResponse> getPresence(@PathVariable String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        boolean online = presenceTracker.isOnline(userId);

        return ResponseEntity.ok(new PresenceStatusResponse(
                userId, online, online ? null : user.getLastSeen()
        ));
    }

    @GetMapping
    public ResponseEntity<List<UserSummaryResponse>> listUsers(Principal principal) {
        String currentUserId = principal.getName();

        List<UserSummaryResponse> users = userRepository.findAll().stream()
                .filter(u -> !u.getId().equals(currentUserId)) // exclude yourself
                .map(UserSummaryResponse::from)
                .toList();

        return ResponseEntity.ok(users);
    }

}
