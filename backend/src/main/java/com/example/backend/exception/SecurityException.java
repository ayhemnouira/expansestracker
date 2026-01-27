package com.example.backend.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class SecurityException extends RuntimeException {
    private final HttpStatus status;
    private final String errorCode;

    public SecurityException(String message, HttpStatus status, String errorCode) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
    }

    // Predefined security exceptions
    public static class InvalidCredentialsException extends SecurityException {
        public InvalidCredentialsException() {
            super("Invalid credentials provided", HttpStatus.UNAUTHORIZED, "AUTH_001");
        }
    }

    public static class AccountLockedException extends SecurityException {
        public AccountLockedException() {
            super("Account temporarily locked due to security reasons. Please contact support.",
                    HttpStatus.FORBIDDEN, "AUTH_002");
        }
    }

    public static class EmailNotVerifiedException extends SecurityException {
        public EmailNotVerifiedException() {
            super("Email verification required. Please check your email.",
                    HttpStatus.FORBIDDEN, "AUTH_003");
        }
    }

    public static class TokenExpiredException extends SecurityException {
        public TokenExpiredException() {
            super("Token has expired. Please request a new one.",
                    HttpStatus.UNAUTHORIZED, "AUTH_004");
        }
    }

    public static class InvalidTokenException extends SecurityException {
        public InvalidTokenException() {
            super("Invalid or malformed token provided",
                    HttpStatus.UNAUTHORIZED, "AUTH_005");
        }
    }

    public static class RateLimitExceededException extends SecurityException {
        public RateLimitExceededException(String message) {
            super(message, HttpStatus.TOO_MANY_REQUESTS, "AUTH_006");
        }
    }
}