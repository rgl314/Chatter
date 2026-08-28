package com.ragul.Chatter.user;

import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional
    public User syncUser(Jwt jwt) {
        String id = jwt.getSubject();

        return userRepository.findById(id)
                .orElseGet(() -> userRepository.save(
                        User.builder()
                                .id(id)
                                .firstName(jwt.getClaimAsString("given_name"))
                                .lastName(jwt.getClaimAsString("family_name"))
                                .email(jwt.getClaimAsString("email"))
                                .lastSeen(LocalDateTime.now())
                                .build()
                ));
    }

}
