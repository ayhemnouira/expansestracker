package com.example.backend.config;

import com.example.backend.entity.TwoFactorOTP;
import com.example.backend.entity.User;
import com.example.backend.enums.AuthProvider;
import com.example.backend.enums.AuditEventType;
import com.example.backend.enums.Role;
import com.example.backend.repo.UserRepo;
import com.example.backend.service.EmailService;
import com.example.backend.service.SecurityAuditService;
import com.example.backend.service.TwoFactorOtpService;
import com.example.backend.util.JwtTokenUtil;
import com.example.backend.util.OTPGenerator;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenUtil jwtTokenUtil;
    private final UserRepo userRepo;
    private final TwoFactorOtpService twoFactorOtpService;
    private final EmailService emailService;
    private final SecurityAuditService securityAuditService;

    @Value("${app.oauth2.redirect-base-url:http://localhost:5173}")
    private String redirectBaseUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        String provider = oauthToken.getAuthorizedClientRegistrationId().toUpperCase();
        OAuth2User oAuth2User = oauthToken.getPrincipal();

        log.info("OAuth2 login attempt with provider: {}", provider);

        try {
            User user = processOAuthUser(oAuth2User, provider);

            // Check if 2FA is enabled
            if (user.getTwoFactorEnabled()) {
                handle2FAFlow(request, response, user);
            } else {
                handleDirectLogin(request, response, user);
            }

        } catch (Exception e) {
            log.error("OAuth2 authentication error: {}", e.getMessage());
            String redirectUrl = redirectBaseUrl + "/login?error=" + e.getMessage();
            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
        }
    }

    private User processOAuthUser(OAuth2User oAuth2User, String provider) throws Exception {
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String providerId = oAuth2User.getAttribute("sub"); // Works for both Google and GitHub
        String avatarUrl = oAuth2User.getAttribute("picture"); // Google

        if (avatarUrl == null) {
            avatarUrl = oAuth2User.getAttribute("avatar_url"); // GitHub
        }

        if (email == null) {
            throw new Exception("email_not_provided");
        }

        User user = userRepo.findByEmail(email).orElse(null);

        if (user == null) {
            // Create new user with OAuth
            user = createOAuthUser(email, name, provider, providerId, avatarUrl);
            log.info("New OAuth user created: {}", user.getId());

            // Send welcome email
            emailService.sendWelcomeEmail(user.getEmail());

            // Audit log
            securityAuditService.logSecurityEvent(
                    String.valueOf(user.getId()),
                    AuditEventType.REGISTRATION,
                    "User registered via " + provider,
                    true
            );
        } else {
            // Existing user - handle linking
            user = handleExistingUser(user, provider, providerId, avatarUrl);
        }

        return user;
    }

    private User createOAuthUser(String email, String name, String provider,
                                 String providerId, String avatarUrl) {
        User user = User.builder()
                .email(email)
                .username(name != null ? name : email.split("@")[0])
                .role(Role.USER)
                .status("ACTIVE")
                .emailVerified(true) // OAuth emails are pre-verified
                .accountLocked(false)
                .failedLoginAttempts(0)
                .twoFactorEnabled(false)
                .avatarUrl(avatarUrl)
                .build();

        // Add OAuth provider
        user.getAuthProviders().add(AuthProvider.valueOf(provider));

        // Set provider-specific ID
        if ("GOOGLE".equals(provider)) {
            user.setGoogleId(providerId);
        } else if ("GITHUB".equals(provider)) {
            user.setGithubId(providerId);
        }

        return userRepo.save(user);
    }

    private User handleExistingUser(User user, String provider, String providerId, String avatarUrl)
            throws Exception {

        AuthProvider authProvider = AuthProvider.valueOf(provider);

        // Check if user has local auth only
        if (user.hasLocalAuth() && !user.hasOAuthAuth()) {
            throw new Exception("account_exists_with_password");
        }

        // Add new OAuth provider if not present
        if (!user.getAuthProviders().contains(authProvider)) {
            user.getAuthProviders().add(authProvider);

            // Set provider-specific ID
            if ("GOOGLE".equals(provider)) {
                user.setGoogleId(providerId);
            } else if ("GITHUB".equals(provider)) {
                user.setGithubId(providerId);
            }

            // Update avatar if user doesn't have one
            if (user.getAvatarUrl() == null && avatarUrl != null) {
                user.setAvatarUrl(avatarUrl);
            }

            user.setUpdatedAt(LocalDateTime.now());
            user = userRepo.save(user);

            log.info("OAuth provider {} linked to existing user: {}", provider, user.getId());

            // Audit log
            securityAuditService.logSecurityEvent(
                    String.valueOf(user.getId()),
                    AuditEventType.LOGIN_SUCCESS,
                    "Account linked with " + provider,
                    true
            );
        }

        return user;
    }

    private void handle2FAFlow(HttpServletRequest request, HttpServletResponse response, User user)
            throws IOException {

        log.info("2FA required for user: {}", user.getId());

        // Generate JWT (will be used after 2FA verification)
        String jwt = jwtTokenUtil.generateAccessToken(user.getEmail());

        // Generate OTP
        String otp = OTPGenerator.generate();

        // Delete old OTP if exists
        TwoFactorOTP oldOtp = twoFactorOtpService.findByUserId(user.getId());
        if (oldOtp != null) {
            twoFactorOtpService.delete(oldOtp);
        }

        // Create new OTP
        TwoFactorOTP twoFactorOTP = twoFactorOtpService.create(user.getId(), otp, jwt);

        // Send OTP email
        try {
            emailService.sendTwoFactorOtpEmail(user.getEmail(), otp);
        } catch (Exception e) {
            log.error("Failed to send 2FA email: {}", e.getMessage());
            throw new IOException("email_send_failed");
        }

        // Audit log
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("otpId", twoFactorOTP.getId());
        securityAuditService.logSecurityEvent(
                String.valueOf(user.getId()),
                AuditEventType.LOGIN_SUCCESS,
                "2FA OTP sent via OAuth login",
                true,
                metadata
        );

        // Redirect to 2FA verification page
        String redirectUrl = redirectBaseUrl + "/verify-2fa?id=" + twoFactorOTP.getId();
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }

    private void handleDirectLogin(HttpServletRequest request, HttpServletResponse response, User user)
            throws IOException {

        log.info("Direct login for OAuth user: {}", user.getId());

        // Generate JWT
        String jwt = jwtTokenUtil.generateAccessToken(user.getEmail());

        // Update last login
        user.setLastLogin(LocalDateTime.now());
        userRepo.save(user);

        // Audit log
        securityAuditService.logSecurityEvent(
                String.valueOf(user.getId()),
                AuditEventType.LOGIN_SUCCESS,
                "OAuth login successful",
                true
        );

        // Redirect to frontend with token
        String redirectUrl = redirectBaseUrl + "/auth/callback?token=" + jwt;
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}