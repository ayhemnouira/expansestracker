package com.example.backend.repo;

import com.example.backend.entity.SecurityAuditLog;
import com.example.backend.enums.AuditEventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface SecurityAuditLogRepository extends JpaRepository<SecurityAuditLog, Long> {

    long countByUserId(String userId);

    long countByUserIdAndEventTypeAndSuccessFalse(String userId, AuditEventType eventType);

    long countByUserIdAndEventTypeAndSuccessFalseAndCreatedAtAfter(
            String userId, AuditEventType eventType, LocalDateTime after);

    Optional<SecurityAuditLog> findFirstByUserIdAndEventTypeOrderByCreatedAtDesc(
            String userId, AuditEventType eventType);

    @Modifying
    int deleteByCreatedAtBefore(LocalDateTime cutoffDate);
}