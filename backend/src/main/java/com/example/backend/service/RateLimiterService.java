package com.example.backend.service;

import com.example.backend.exception.SecurityException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class RateLimiterService {

    private final RedisTemplate<String, String> redisTemplate;

    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final int MAX_REGISTRATION_ATTEMPTS = 3;
    private static final int MAX_PASSWORD_RESET_ATTEMPTS = 3;
    private static final Duration WINDOW_DURATION = Duration.ofMinutes(15);

    public void checkLoginRateLimit(String identifier) {
        checkRateLimit("login:" + identifier, MAX_LOGIN_ATTEMPTS,
                "Too many login attempts. Please try again in 15 minutes.");
    }

    public void checkRegistrationRateLimit(String identifier) {
        checkRateLimit("register:" + identifier, MAX_REGISTRATION_ATTEMPTS,
                "Too many registration attempts. Please try again in 15 minutes.");
    }

    public void checkPasswordResetRateLimit(String identifier) {
        checkRateLimit("reset:" + identifier, MAX_PASSWORD_RESET_ATTEMPTS,
                "Too many password reset attempts. Please try again in 15 minutes.");
    }

    private void checkRateLimit(String key, int maxAttempts, String errorMessage) {
        String attempts = redisTemplate.opsForValue().get(key);
        int currentAttempts = attempts != null ? Integer.parseInt(attempts) : 0;

        if (currentAttempts >= maxAttempts) {
            log.warn("Rate limit exceeded for key: {}", key);
            throw new SecurityException.RateLimitExceededException(errorMessage);
        }

        // Increment counter
        redisTemplate.opsForValue().increment(key);

        // Set expiry on first attempt
        if (currentAttempts == 0) {
            redisTemplate.expire(key, WINDOW_DURATION.toMinutes(), TimeUnit.MINUTES);
        }
    }

    public void resetRateLimit(String identifier, String type) {
        redisTemplate.delete(type + ":" + identifier);
    }
}


