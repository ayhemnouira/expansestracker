package com.example.backend.service.scheduler;

import com.example.backend.repo.RefreshTokenRepository;
import com.example.backend.repo.VerificationTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@EnableScheduling
@RequiredArgsConstructor
public class TokenCleanupScheduler {

    private final VerificationTokenRepository verificationTokenRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    /**
     * Runs every day at 2 AM to clean up expired tokens
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void cleanupExpiredTokens() {
        log.info("Starting scheduled cleanup of expired tokens");

        try {
            LocalDateTime now = LocalDateTime.now();

            // Delete expired verification tokens
            int verificationTokensDeleted = verificationTokenRepository
                    .deleteByExpiryDateBeforeOrUsedTrue(now);

            log.info("Deleted {} expired/used verification tokens", verificationTokensDeleted);

            // Delete expired refresh tokens
            int refreshTokensDeleted = refreshTokenRepository
                    .deleteByExpiryDateBeforeOrRevokedTrue(now);

            log.info("Deleted {} expired/revoked refresh tokens", refreshTokensDeleted);

            log.info("Token cleanup completed successfully. Total deleted: {}",
                    verificationTokensDeleted + refreshTokensDeleted);

        } catch (Exception e) {
            log.error("Error during token cleanup: {}", e.getMessage(), e);
        }
    }

    /**
     * Runs every hour to clean up very old audit logs (older than 90 days)
     */
    @Scheduled(cron = "0 0 * * * ?")
    @Transactional
    public void cleanupOldAuditLogs() {
        log.info("Starting cleanup of old audit logs");

        try {
            LocalDateTime cutoffDate = LocalDateTime.now().minusDays(90);

            // This would require a method in SecurityAuditLogRepository
            // int deleted = securityAuditLogRepository.deleteByCreatedAtBefore(cutoffDate);

            // log.info("Deleted {} audit logs older than 90 days", deleted);

        } catch (Exception e) {
            log.error("Error during audit log cleanup: {}", e.getMessage(), e);
        }
    }
}