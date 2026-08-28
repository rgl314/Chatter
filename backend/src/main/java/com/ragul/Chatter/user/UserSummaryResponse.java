package com.ragul.Chatter.user;

public record UserSummaryResponse(
        String id,
        String firstName,
        String lastName,
        String email
) {
    public static UserSummaryResponse from(User user) {
        return new UserSummaryResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail()
        );
    }
}