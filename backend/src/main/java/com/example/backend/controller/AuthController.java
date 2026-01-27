package com.example.backend.controller;

import com.example.backend.dto.*;
import com.example.backend.entity.TwoFactorOTP;
import com.example.backend.entity.User;
import com.example.backend.enums.AuditEventType;
import com.example.backend.service.AuthService;
import com.example.backend.service.SecurityAuditService;
import com.example.backend.service.TwoFactorOtpService;
import com.example.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final TwoFactorOtpService twoFactorOtpService;
    private final SecurityAuditService securityAuditService;
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<MessageResponseDto> register(@Valid @RequestBody RegisterRequestDto request) {
        MessageResponseDto response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/verify-email")
    public ResponseEntity<MessageResponseDto> verifyEmail(@Valid @RequestBody VerifyEmailRequestDto request) {
        MessageResponseDto response = authService.verifyEmail(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@Valid @RequestBody LoginRequestDto request) {
        AuthResponseDto response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<AuthResponseDto> refreshToken(@Valid @RequestBody RefreshTokenRequestDto request) {
        AuthResponseDto response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponseDto> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDto request) {
        try {
            MessageResponseDto response = authService.forgotPassword(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.ok(new MessageResponseDto("If email exists, reset link will be sent"));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponseDto> resetPassword(@Valid @RequestBody ResetPasswordRequestDto request) {
        MessageResponseDto response = authService.resetPassword(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<MessageResponseDto> logout(Authentication authentication) {
        String email = authentication.getName();
        MessageResponseDto response = authService.logout(email);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/validate-token")
    public ResponseEntity<MessageResponseDto> validateToken(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        MessageResponseDto response = authService.validateToken(token);
        return ResponseEntity.ok(response);
    }

    // ==================== 2FA ENDPOINTS ====================

    @PostMapping("/2fa/enable")
    public ResponseEntity<Map<String, Object>> enable2FA(Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userService.findByEmail(email);

            if (user.getTwoFactorEnabled()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "2FA is already enabled"
                ));
            }

            user.setTwoFactorEnabled(true);
            userService.save(user);

            // Audit log
            securityAuditService.logSecurityEvent(
                    String.valueOf(user.getId()),
                    AuditEventType.LOGIN_SUCCESS,
                    "2FA enabled by user",
                    true
            );

            log.info("2FA enabled for user: {}", user.getId());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Two-factor authentication enabled successfully",
                    "twoFactorEnabled", true
            ));

        } catch (Exception e) {
            log.error("Error enabling 2FA: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Failed to enable 2FA"
            ));
        }
    }

    @PostMapping("/2fa/disable")
    public ResponseEntity<Map<String, Object>> disable2FA(Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userService.findByEmail(email);

            if (!user.getTwoFactorEnabled()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "2FA is not enabled"
                ));
            }

            user.setTwoFactorEnabled(false);
            user.setTwoFactorSecret(null);
            userService.save(user);

            // Audit log
            securityAuditService.logSecurityEvent(
                    String.valueOf(user.getId()),
                    AuditEventType.LOGIN_SUCCESS,
                    "2FA disabled by user",
                    true
            );

            log.info("2FA disabled for user: {}", user.getId());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Two-factor authentication disabled successfully",
                    "twoFactorEnabled", false
            ));

        } catch (Exception e) {
            log.error("Error disabling 2FA: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Failed to disable 2FA"
            ));
        }
    }

    @PostMapping("/2fa/verify")
    public ResponseEntity<AuthResponseDto> verify2FA(@Valid @RequestBody Verify2FARequestDto request) {
        log.info("2FA verification attempt for OTP ID: {}", request.getId());

        try {
            TwoFactorOTP twoFactorOTP = twoFactorOtpService.findById(request.getId());

            if (twoFactorOTP == null) {
                log.warn("2FA OTP not found: {}", request.getId());
                throw new IllegalArgumentException("Invalid or expired OTP session");
            }

            if (twoFactorOTP.isExpired()) {
                log.warn("2FA OTP expired: {}", request.getId());
                throw new IllegalArgumentException("OTP has expired. Please login again.");
            }

            if (!twoFactorOtpService.verify(twoFactorOTP, request.getOtp())) {
                // Audit failed attempt
                securityAuditService.logSecurityEvent(
                        String.valueOf(twoFactorOTP.getUserId()),
                        AuditEventType.LOGIN_FAILED,
                        "Invalid 2FA OTP attempt",
                        false
                );

                throw new IllegalArgumentException("Invalid OTP code");
            }

            // Get user
            User user = userService.findById(twoFactorOTP.getUserId());

            // Audit successful verification
            securityAuditService.logSecurityEvent(
                    String.valueOf(user.getId()),
                    AuditEventType.LOGIN_SUCCESS,
                    "2FA verification successful",
                    true
            );

            log.info("2FA verification successful for user: {}", user.getId());

            // Return the JWT from the OTP
            AuthResponseDto response = new AuthResponseDto(
                    new UserDto(user),
                    twoFactorOTP.getJwt(),
                    null // No refresh token in 2FA flow
            );

            // Clean up OTP
            twoFactorOtpService.delete(twoFactorOTP);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error during 2FA verification: {}", e.getMessage());
            throw new IllegalArgumentException("2FA verification failed");
        }
    }

    @GetMapping("/2fa/status")
    public ResponseEntity<Map<String, Object>> get2FAStatus(Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userService.findByEmail(email);

            Map<String, Object> response = new HashMap<>();
            response.put("twoFactorEnabled", user.getTwoFactorEnabled());
            response.put("email", user.getEmail());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error getting 2FA status: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Failed to get 2FA status"
            ));
        }
    }

    // ==================== OAUTH2 INFO ENDPOINT ====================

    @GetMapping("/oauth/providers")
    public ResponseEntity<Map<String, Object>> getOAuthProviders(Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userService.findByEmail(email);

            Map<String, Object> response = new HashMap<>();
            response.put("providers", user.getAuthProviders());
            response.put("hasLocalAuth", user.hasLocalAuth());
            response.put("hasOAuthAuth", user.hasOAuthAuth());
            response.put("googleLinked", user.getGoogleId() != null);
            response.put("githubLinked", user.getGithubId() != null);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error getting OAuth providers: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Failed to get OAuth providers"
            ));
        }
    }


}