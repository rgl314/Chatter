package com.ragul.Chatter.user;

import com.ragul.Chatter.chat.Chat;
import com.ragul.Chatter.common.BaseAuditingEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Entity
@Table(name = "users")
public class User extends BaseAuditingEntity {

    @Id
    private String id;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Column(name = "last_seen")
    private LocalDateTime lastSeen;

    @Builder.Default
    @OneToMany(mappedBy = "sender")
    private List<Chat> sentChats = new ArrayList<>();;

    @Builder.Default
    @OneToMany(mappedBy = "recipient")
    private List<Chat> receivedChats  = new ArrayList<>();;

}
