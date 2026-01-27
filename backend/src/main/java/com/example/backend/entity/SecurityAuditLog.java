package com.example.backend.entity;

import com.example.backend.enums.AuditEventType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "security_audit_logs", indexes = {
        @Index(name = "idx_user_id", columnList = "userId"),
        @Index(name = "idx_event_type", columnList = "eventType"),
        @Index(name = "idx_created_at", columnList = "createdAt")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SecurityAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuditEventType eventType;

    @Column(nullable = false, length = 500)
    private String description;

    private String ipAddress;

    private String userAgent;

    @Column(length = 1000)
    private String metadata; // JSON string for additional data

    @Column(nullable = false)
    private Boolean success;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

