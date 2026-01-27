package com.example.backend.entity;

import com.example.backend.enums.Role;
import com.example.backend.enums.AuthProvider;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String username;

    @Column(nullable = true)
    private String password; // Nullable for OAuth users

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // OAuth2 fields
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_auth_providers", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "provider")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Set<AuthProvider> authProviders = new HashSet<>();

    private String googleId;
    private String githubId;
    private String avatarUrl;

    // 2FA fields
    @Column(nullable = false)
    @Builder.Default
    private Boolean twoFactorEnabled = false;

    private String twoFactorSecret; // For TOTP apps like Google Authenticator

    // Security fields
    @Column(nullable = false)
    @Builder.Default
    private String status = "PENDING";

    @Column(nullable = false)
    @Builder.Default
    private Boolean emailVerified = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean accountLocked = false;

    @Column(nullable = false)
    @Builder.Default
    private Integer failedLoginAttempts = 0;

    private LocalDateTime lastLogin;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (authProviders == null) {
            authProviders = new HashSet<>();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(() -> "ROLE_" + role.name());
    }

    /**
     * IMPORTANT: Spring Security uses this for authentication
     * Returns email for login
     */
    @Override
    public String getUsername() {
        return email;
    }

    /**
     * IMPORTANT: OAuth users don't have password
     * Return empty string instead of null to prevent NPE
     */
    @Override
    public String getPassword() {
        return password != null ? password : "";
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !accountLocked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return emailVerified && "ACTIVE".equals(status);
    }

    /**
     * Use this for displaying username in UI
     */
    public String getDisplayUsername() {
        return username;
    }

    public boolean hasLocalAuth() {
        return authProviders.contains(AuthProvider.LOCAL);
    }

    public boolean hasOAuthAuth() {
        return authProviders.contains(AuthProvider.GOOGLE) ;
    }
}