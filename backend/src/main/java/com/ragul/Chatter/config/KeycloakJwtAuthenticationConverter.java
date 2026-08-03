package com.ragul.Chatter.config;

import lombok.NonNull;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class KeycloakJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    @Override
    public AbstractAuthenticationToken convert(@NonNull Jwt source) {
        return new JwtAuthenticationToken(
                source,
                Stream.concat(
                        new JwtGrantedAuthoritiesConverter().convert(source).stream(),
                        extractResourceRoles(source).stream()
                ).collect(Collectors.toSet())
        );
    }

    private Collection<? extends GrantedAuthority> extractResourceRoles(Jwt jwt) {
        var resourceAccess = new HashMap<>(jwt.getClaim("resource_access"));

        if (resourceAccess == null) {
            return Collections.emptySet();
        }

        var client = (Map<String, List<String>>) resourceAccess.get("account");

        if(client == null){
            return Collections.emptySet();
        }

        var roles = client.get("roles");

        if(roles == null){
            return Collections.emptyList();
        }

        return roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.replace("-", "_")))
                .collect(Collectors.toSet());
    }

}
