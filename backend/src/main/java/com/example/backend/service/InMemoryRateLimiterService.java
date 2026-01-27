package com.example.backend.service;

import com.example.backend.exception.SecurityException;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

// Alternative in-memory implementation if Redis is not available
@Slf4j
@Service
public class InMemoryRateLimiterService {

    private final Map<String, AttemptRecord> attemptCache = new ConcurrentHashMap<>();

    @Scheduled(fixedRate = 60000) // Clean up every minute
    public void cleanExpiredEntries() {
        LocalDateTime now = LocalDateTime.now();
        attemptCache.entrySet().removeIf(entry ->
                entry.getValue().getExpiryTime().isBefore(now)
        );
    }

    public void checkRateLimit(String key, int maxAttempts, String errorMessage) {
        AttemptRecord record = attemptCache.computeIfAbsent(key,
                k -> new AttemptRecord(0, LocalDateTime.now().plusMinutes(15)));

        if (LocalDateTime.now().isAfter(record.getExpiryTime())) {
            // Reset if expired
            attemptCache.put(key, new AttemptRecord(1, LocalDateTime.now().plusMinutes(15)));
            return;
        }

        if (record.getAttempts() >= maxAttempts) {
            throw new SecurityException.RateLimitExceededException(errorMessage);
        }

        record.incrementAttempts();
    }
    @Data
    @AllArgsConstructor
    private static class AttemptRecord {
        private int attempts;
        private LocalDateTime expiryTime;

        public void incrementAttempts() {
            this.attempts++;
        }
    }
}
