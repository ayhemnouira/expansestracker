package com.example.backend.service.impl;

import com.example.backend.dto.*;
import com.example.backend.entity.RefreshToken;
import com.example.backend.entity.User;
import com.example.backend.entity.VerificationToken;
import com.example.backend.enums.AuditEventType;
import com.example.backend.enums.Role;
import com.example.backend.exception.SecurityException;
import com.example.backend.repo.RefreshTokenRepository;
import com.example.backend.repo.UserRepo;
import com.example.backend.repo.VerificationTokenRepository;
import com.example.backend.service.AuthService;
import com.example.backend.service.EmailService;
import com.example.backend.service.RateLimiterService;
import com.example.backend.service.SecurityAuditService;
import com.example.backend.util.JwtTokenUtil;
import com.example.backend.util.OTPGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepo userRepo;
    private final VerificationTokenRepository tokenRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;
    private final EmailService emailService;
    private final RateLimiterService rateLimiterService;
    private final SecurityAuditService securityAuditService;

    private static final Pattern PASSWORD_PATTERN =
            Pattern.compile("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\\S+$).{8,}$");

    @Override
    @Transactional
    public MessageResponseDto register(RegisterRequestDto request) {
        log.info("Registration attempt for email: {}", maskEmail(request.getEmail()));

        // Rate limiting
        rateLimiterService.checkRegistrationRateLimit(request.getEmail());

        // Validate password strength
        if (!isPasswordStrong(request.getPassword())) {
            throw new IllegalArgumentException(
                    "Password must be at least 8 characters with uppercase, lowercase, number and special character"
            );
        }

        // Generic error message for security
        if (userRepo.existsByEmail(request.getEmail())) {
            log.warn("Registration attempt with existing email: {}", maskEmail(request.getEmail()));
            // Don't reveal email exists - return generic success message
            return new MessageResponseDto(
                    "Registration successful! Please check your email for verification code."
            );
        }

        User user = User.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .status("PENDING")
                .emailVerified(false)
                .accountLocked(false)
                .failedLoginAttempts(0)
                .build();

        User savedUser = userRepo.save(user);
        log.info("User created successfully: {}", savedUser.getId());

        // Generate OTP
        String otp = OTPGenerator.generate();

        // Create verification token
        VerificationToken verificationToken = VerificationToken.builder()
                .userId(String.valueOf(savedUser.getId()))
                .token(otp)
                .type("EMAIL_VERIFICATION")
                .expiryDate(LocalDateTime.now().plusMinutes(10))
                .used(false)
                .createdAt(LocalDateTime.now())
                .build();

        tokenRepository.save(verificationToken);

        // Send verification email (async)
        emailService.sendVerificationEmail(savedUser.getEmail(), otp);

        // Audit log
        securityAuditService.logSecurityEvent(
                String.valueOf(savedUser.getId()),
                AuditEventType.REGISTRATION,
                "User registered successfully",
                true
        );

        // Reset rate limit on successful registration
        rateLimiterService.resetRateLimit(request.getEmail(), "register");

        return new MessageResponseDto(
                "Registration successful! Please check your email for verification code."
        );
    }

    @Override
    @Transactional
    public MessageResponseDto verifyEmail(VerifyEmailRequestDto request) {
        log.info("Email verification attempt for: {}", maskEmail(request.getEmail()));

        User user = userRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getEmailVerified()) {
            return new MessageResponseDto("Email already verified. You can login.");
        }

        VerificationToken token = tokenRepository
                .findByTokenAndTypeAndUsedFalseAndExpiryDateAfter(
                        request.getOtp(),
                        "EMAIL_VERIFICATION",
                        LocalDateTime.now()
                )
                .orElseThrow(() -> new SecurityException.TokenExpiredException());

        if (!token.getUserId().equals(String.valueOf(user.getId()))) {
            securityAuditService.logSecurityEvent(
                    String.valueOf(user.getId()),
                    AuditEventType.SUSPICIOUS_ACTIVITY,
                    "OTP mismatch during email verification",
                    false
            );
            throw new SecurityException.InvalidTokenException();
        }

        // Update user
        user.setEmailVerified(true);
        user.setStatus("ACTIVE");
        user.setUpdatedAt(LocalDateTime.now());
        userRepo.save(user);

        // Mark token as used
        token.setUsed(true);
        tokenRepository.save(token);

        log.info("Email verified successfully for user: {}", user.getId());

        // Send welcome email
        emailService.sendWelcomeEmail(user.getEmail());

        // Audit log
        securityAuditService.logSecurityEvent(
                String.valueOf(user.getId()),
                AuditEventType.EMAIL_VERIFICATION,
                "Email verified successfully",
                true
        );

        return new MessageResponseDto("Email verified successfully! You can now login.");
    }

    @Override
    @Transactional
    public AuthResponseDto login(LoginRequestDto request) {
        log.info("Login attempt for email: {}", maskEmail(request.getEmail()));

        // Rate limiting
        rateLimiterService.checkLoginRateLimit(request.getEmail());

        User user = userRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new SecurityException.InvalidCredentialsException());

        // Check email verification
        if (!user.getEmailVerified()) {
            securityAuditService.logSecurityEvent(
                    String.valueOf(user.getId()),
                    AuditEventType.LOGIN_FAILED,
                    "Login attempt with unverified email",
                    false
            );
            throw new SecurityException.EmailNotVerifiedException();
        }

        // Check account lock
        if (user.getAccountLocked()) {
            securityAuditService.logSecurityEvent(
                    String.valueOf(user.getId()),
                    AuditEventType.LOGIN_FAILED,
                    "Login attempt on locked account",
                    false
            );
            throw new SecurityException.AccountLockedException();
        }

        // Check status
        if (!"ACTIVE".equals(user.getStatus())) {
            throw new SecurityException.InvalidCredentialsException();
        }

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            handleFailedLogin(user);
            throw new SecurityException.InvalidCredentialsException();
        }

        // Generate tokens
        String accessToken = jwtTokenUtil.generateAccessToken(user.getEmail());
        String refreshTokenString = UUID.randomUUID().toString();

        // Save refresh token
        RefreshToken refreshToken = RefreshToken.builder()
                .token(refreshTokenString)
                .userId(String.valueOf(user.getId()))
                .expiryDate(LocalDateTime.now().plusDays(7))
                .revoked(false)
                .createdAt(LocalDateTime.now())
                .build();

        refreshTokenRepository.save(refreshToken);

        // Update user - reset failed attempts
        user.setLastLogin(LocalDateTime.now());
        user.setFailedLoginAttempts(0);
        userRepo.save(user);

        // Reset rate limit on successful login
        rateLimiterService.resetRateLimit(request.getEmail(), "login");

        // Audit log
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("loginMethod", "PASSWORD");
        securityAuditService.logSecurityEvent(
                String.valueOf(user.getId()),
                AuditEventType.LOGIN_SUCCESS,
                "User logged in successfully",
                true,
                metadata
        );

        log.info("Login successful for user: {}", user.getId());

        return new AuthResponseDto(
                new UserDto(user),
                accessToken,
                refreshTokenString
        );
    }

    private void handleFailedLogin(User user) {
        user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);

        // Lock account after 5 failed attempts
        if (user.getFailedLoginAttempts() >= 5) {
            user.setAccountLocked(true);
            userRepo.save(user);

            // Send account locked email
            emailService.sendAccountLockedEmail(user.getEmail());

            // Audit log
            securityAuditService.logSecurityEvent(
                    String.valueOf(user.getId()),
                    AuditEventType.ACCOUNT_LOCKED,
                    "Account locked due to multiple failed login attempts",
                    true
            );

            log.warn("Account locked for user: {} due to failed login attempts", user.getId());
        } else {
            userRepo.save(user);

            // Audit failed login
            securityAuditService.logSecurityEvent(
                    String.valueOf(user.getId()),
                    AuditEventType.LOGIN_FAILED,
                    "Invalid password attempt " + user.getFailedLoginAttempts() + "/5",
                    false
            );
        }
    }

    @Override
    @Transactional
    public AuthResponseDto refreshToken(String refreshTokenString) {
        log.info("Refresh token request");

        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenString)
                .orElseThrow(() -> new SecurityException.InvalidTokenException());

        if (refreshToken.isExpired()) {
            throw new SecurityException.TokenExpiredException();
        }

        if (refreshToken.getRevoked()) {
            // Possible token theft - revoke all tokens
            refreshTokenRepository.deleteByUserId(refreshToken.getUserId());

            securityAuditService.logSecurityEvent(
                    refreshToken.getUserId(),
                    AuditEventType.SUSPICIOUS_ACTIVITY,
                    "Attempt to use revoked refresh token - all tokens revoked",
                    false
            );

            throw new SecurityException.InvalidTokenException();
        }

        User user = userRepo.findById(Long.parseLong(refreshToken.getUserId()))
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String newAccessToken = jwtTokenUtil.generateAccessToken(user.getEmail());

        // Audit log
        securityAuditService.logSecurityEvent(
                String.valueOf(user.getId()),
                AuditEventType.TOKEN_REFRESH,
                "Access token refreshed",
                true
        );

        log.info("New access token generated for user: {}", user.getId());

        return new AuthResponseDto(
                new UserDto(user),
                newAccessToken,
                refreshTokenString
        );
    }

    @Override
    @Transactional
    public MessageResponseDto forgotPassword(ForgotPasswordRequestDto request) {
        log.info("Password reset request for: {}", maskEmail(request.getEmail()));

        // Rate limiting
        rateLimiterService.checkPasswordResetRateLimit(request.getEmail());

        // Always return success to prevent email enumeration
        try {
            User user = userRepo.findByEmail(request.getEmail())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            String resetToken = UUID.randomUUID().toString();

            VerificationToken token = VerificationToken.builder()
                    .userId(String.valueOf(user.getId()))
                    .token(resetToken)
                    .type("PASSWORD_RESET")
                    .expiryDate(LocalDateTime.now().plusHours(1))
                    .used(false)
                    .createdAt(LocalDateTime.now())
                    .build();

            tokenRepository.save(token);

            emailService.sendPasswordResetEmail(user.getEmail(), resetToken);

            // Audit log
            securityAuditService.logSecurityEvent(
                    String.valueOf(user.getId()),
                    AuditEventType.PASSWORD_RESET_REQUESTED,
                    "Password reset requested",
                    true
            );

            log.info("Password reset email sent to: {}", maskEmail(request.getEmail()));
        } catch (Exception e) {
            // Log but don't reveal
            log.warn("Password reset attempt for non-existent email: {}", maskEmail(request.getEmail()));
        }

        return new MessageResponseDto("If the email exists, a password reset link has been sent.");
    }

    @Override
    @Transactional
    public MessageResponseDto resetPassword(ResetPasswordRequestDto request) {
        log.info("Password reset attempt with token");

        // Validate new password strength
        if (!isPasswordStrong(request.getNewPassword())) {
            throw new IllegalArgumentException(
                    "Password must be at least 8 characters with uppercase, lowercase, number and special character"
            );
        }

        VerificationToken token = tokenRepository
                .findByTokenAndTypeAndUsedFalseAndExpiryDateAfter(
                        request.getToken(),
                        "PASSWORD_RESET",
                        LocalDateTime.now()
                )
                .orElseThrow(() -> new SecurityException.TokenExpiredException());

        User user = userRepo.findById(Long.parseLong(token.getUserId()))
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());

        // Unlock account if it was locked
        if (user.getAccountLocked()) {
            user.setAccountLocked(false);
            user.setFailedLoginAttempts(0);
        }

        userRepo.save(user);

        token.setUsed(true);
        tokenRepository.save(token);

        // Revoke all refresh tokens for security
        refreshTokenRepository.deleteByUserId(String.valueOf(user.getId()));

        // Send confirmation email
        emailService.sendPasswordChangedEmail(user.getEmail());

        // Audit log
        securityAuditService.logSecurityEvent(
                String.valueOf(user.getId()),
                AuditEventType.PASSWORD_RESET_COMPLETED,
                "Password reset completed successfully",
                true
        );

        log.info("Password reset successful for user: {}", user.getId());

        return new MessageResponseDto("Password reset successful! Please login with your new password.");
    }

    @Override
    @Transactional
    public MessageResponseDto logout(String email) {
        log.info("Logout request for email: {}", maskEmail(email));

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        refreshTokenRepository.deleteByUserId(String.valueOf(user.getId()));

        // Audit log
        securityAuditService.logSecurityEvent(
                String.valueOf(user.getId()),
                AuditEventType.LOGOUT,
                "User logged out",
                true
        );

        log.info("Logout successful for user: {}", user.getId());

        return new MessageResponseDto("Logout successful");
    }

    @Override
    public MessageResponseDto validateToken(String token) {
        boolean isValid = jwtTokenUtil.validateToken(token);

        if (isValid) {
            String email = jwtTokenUtil.getUsernameFromToken(token);
            return new MessageResponseDto("Valid token for user: " + maskEmail(email));
        }

        return new MessageResponseDto("Invalid token");
    }

    // Helper methods
    private boolean isPasswordStrong(String password) {
        return PASSWORD_PATTERN.matcher(password).matches();
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "***";
        String[] parts = email.split("@");
        String username = parts[0];
        String masked = username.substring(0, Math.min(2, username.length())) + "***";
        return masked + "@" + parts[1];
    }
}