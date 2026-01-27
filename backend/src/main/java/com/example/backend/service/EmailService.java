package com.example.backend.service;

import com.example.backend.entity.Budget;
import com.example.backend.entity.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.mail.enabled:true}")
    private boolean mailEnabled;

    @Async("taskExecutor")
    public void sendBudgetAlertEmail(User user, Budget budget, BigDecimal spent, double percentage) {
        if (!mailEnabled) {
            log.info("Email sending is disabled. Skipping alert email.");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("⚠️ Budget Alert: " + budget.getCategory());

            String htmlContent = buildBudgetAlertEmailHtml(user, budget, spent, percentage);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Budget alert email sent successfully to {}", user.getEmail());

        } catch (MessagingException e) {
            log.error("Failed to send budget alert email to {}: {}", user.getEmail(), e.getMessage());
        }
    }

    @Async("taskExecutor")
    public void sendBudgetExceededEmail(User user, Budget budget, BigDecimal spent, double percentage) {
        if (!mailEnabled) {
            log.info("Email sending is disabled. Skipping exceeded email.");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("🚨 Budget Exceeded: " + budget.getCategory());

            String htmlContent = buildBudgetExceededEmailHtml(user, budget, spent, percentage);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Budget exceeded email sent successfully to {}", user.getEmail());

        } catch (MessagingException e) {
            log.error("Failed to send budget exceeded email to {}: {}", user.getEmail(), e.getMessage());
        }
    }

    private String buildBudgetAlertEmailHtml(User user, Budget budget, BigDecimal spent, double percentage) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        BigDecimal remaining = budget.getAmount().subtract(spent);

        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #f59e0b 0%%, #d97706 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
                    .alert-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
                    .stats { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
                    .stat-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
                    .stat-label { font-weight: 600; color: #6b7280; }
                    .stat-value { font-weight: 700; color: #111827; }
                    .warning { color: #d97706; font-size: 18px; font-weight: 700; }
                    .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
                    .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>⚠️ Budget Alert</h1>
                        <p>You're approaching your budget limit</p>
                    </div>
                    <div class="content">
                        <p>Hello <strong>%s</strong>,</p>
                        
                        <div class="alert-box">
                            <p class="warning">You've used %.1f%% of your budget for "%s"</p>
                        </div>
                        
                        <div class="stats">
                            <div class="stat-row">
                                <span class="stat-label">Budget Category:</span>
                                <span class="stat-value">%s</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">Budget Amount:</span>
                                <span class="stat-value">%.2f TND</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">Amount Spent:</span>
                                <span class="stat-value">%.2f TND</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">Remaining:</span>
                                <span class="stat-value">%.2f TND</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">Period:</span>
                                <span class="stat-value">%s - %s</span>
                            </div>
                        </div>
                        
                        <p><strong>💡 Tip:</strong> Consider reviewing your expenses in this category to stay within budget.</p>
                        
                        <p style="text-align: center;">
                            <a href="http://localhost:3000/budgets" class="button">View Budget Details</a>
                        </p>
                        
                        <div class="footer">
                            <p>This is an automated message from expensesTracker.</p>
                            <p>© 2025 expensesTracker. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """,
                user.getDisplayUsername(),
                percentage,
                budget.getCategory(),
                budget.getCategory(),
                budget.getAmount(),
                spent,
                remaining,
                budget.getStartDate().format(formatter),
                budget.getEndDate().format(formatter)
        );
    }

    private String buildBudgetExceededEmailHtml(User user, Budget budget, BigDecimal spent, double percentage) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        BigDecimal exceeded = spent.subtract(budget.getAmount());

        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #dc2626 0%%, #991b1b 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
                    .alert-box { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 5px; }
                    .stats { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
                    .stat-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
                    .stat-label { font-weight: 600; color: #6b7280; }
                    .stat-value { font-weight: 700; color: #111827; }
                    .danger { color: #dc2626; font-size: 18px; font-weight: 700; }
                    .exceeded { color: #dc2626; font-weight: 700; }
                    .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
                    .button { display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🚨 Budget Exceeded!</h1>
                        <p>You've gone over your budget limit</p>
                    </div>
                    <div class="content">
                        <p>Hello <strong>%s</strong>,</p>
                        
                        <div class="alert-box">
                            <p class="danger">You've exceeded your budget for "%s" by %.1f%%</p>
                        </div>
                        
                        <div class="stats">
                            <div class="stat-row">
                                <span class="stat-label">Budget Category:</span>
                                <span class="stat-value">%s</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">Budget Amount:</span>
                                <span class="stat-value">%.2f TND</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">Amount Spent:</span>
                                <span class="stat-value exceeded">%.2f TND</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">Amount Exceeded:</span>
                                <span class="stat-value exceeded">%.2f TND</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">Period:</span>
                                <span class="stat-value">%s - %s</span>
                            </div>
                        </div>
                        
                        <p><strong>⚠️ Action Required:</strong> Review your expenses and consider adjusting your budget or reducing spending in this category.</p>
                        
                        <p style="text-align: center;">
                            <a href="http://localhost:5173/api/budgets" class="button">Review Budget Now</a>
                        </p>
                        
                        <div class="footer">
                            <p>This is an automated message from expensesTracker.</p>
                            <p>© 2025 ExpensesTracker. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """,
                user.getDisplayUsername(),
                budget.getCategory(),
                percentage - 100,
                budget.getCategory(),
                budget.getAmount(),
                spent,
                exceeded,
                budget.getStartDate().format(formatter),
                budget.getEndDate().format(formatter)
        );
    }
    public void sendVerificationEmail(String to, String otp) {
        log.info("Sending verification email to: {}", to);

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@expensetracker.com");
            message.setTo(to);
            message.setSubject("Verify Your Email - Expense Tracker");
            message.setText(String.format(
                    "Welcome to Expense Tracker!\n\n" +
                            "Your email verification code is: %s\n\n" +
                            "This code expires in 10 minutes.\n\n" +
                            "If you didn't create an account, please ignore this email.\n\n" +
                            "Best regards,\n" +
                            "Expense Tracker Team",
                    otp
            ));

            mailSender.send(message);
            log.info("Verification email sent successfully to: {}", to);

        } catch (Exception e) {
            log.error("Failed to send verification email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send email. Please try again later.");
        }
    }


    public void sendPasswordResetEmail(String to, String resetToken) {
        log.info("Sending password reset email to: {}", to);

        try {
            String resetLink = "https://expansestrackera.vercel.app/reset-password?token=" + resetToken;

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@expensetracker.com");
            message.setTo(to);
            message.setSubject("Reset Your Password - Expense Tracker");
            message.setText(String.format(
                    "Hello,\n\n" +
                            "You requested to reset your password.\n\n" +
                            "Click the link below to reset your password:\n" +
                            "%s\n\n" +
                            "This link expires in 1 hour.\n\n" +
                            "If you didn't request this, please ignore this email.\n\n" +
                            "Best regards,\n" +
                            "Expense Tracker Team",
                    resetLink
            ));

            mailSender.send(message);
            log.info("Password reset email sent successfully to: {}", to);

        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send email. Please try again later.");
        }
    }


    public void sendWelcomeEmail(String to) {
        log.info("Sending welcome email to: {}", to);

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@expensetracker.com");
            message.setTo(to);
            message.setSubject("Welcome to Expense Tracker!");
            message.setText(
                    "Welcome to Expense Tracker!\n\n" +
                            "Your account has been successfully verified.\n\n" +
                            "Start tracking your expenses today!\n\n" +
                            "Best regards,\n" +
                            "Expense Tracker Team"
            );

            mailSender.send(message);
            log.info("Welcome email sent successfully to: {}", to);

        } catch (Exception e) {
            log.error("Failed to send welcome email to {}: {}", to, e.getMessage());
        }

    }
    // Add these methods to your existing EmailService class

    @Async("taskExecutor")
    public void sendAccountLockedEmail(String to) {
        if (!mailEnabled) {
            log.info("Email sending is disabled. Skipping account locked email.");
            return;
        }

        log.info("Sending account locked email to: {}", to);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("🔒 Account Security Alert - expensesTracker");

            String htmlContent = buildAccountLockedEmailHtml(to);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Account locked email sent successfully to {}", to);

        } catch (MessagingException e) {
            log.error("Failed to send account locked email to {}: {}", to, e.getMessage());
        }
    }

    @Async("taskExecutor")
    public void sendPasswordChangedEmail(String to) {
        if (!mailEnabled) {
            log.info("Email sending is disabled. Skipping password changed email.");
            return;
        }

        log.info("Sending password changed email to: {}", to);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("✅ Password Changed Successfully - expensesTracker");

            String htmlContent = buildPasswordChangedEmailHtml(to);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Password changed email sent successfully to {}", to);

        } catch (MessagingException e) {
            log.error("Failed to send password changed email to {}: {}", to, e.getMessage());
        }
    }

    private String buildAccountLockedEmailHtml(String email) {
        return String.format("""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #dc2626 0%%, #991b1b 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
                .alert-box { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 5px; }
                .info-box { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
                .button { display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                h2 { color: #dc2626; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔒 Security Alert</h1>
                    <p>Your account has been locked</p>
                </div>
                <div class="content">
                    <div class="alert-box">
                        <p><strong>Your account has been temporarily locked due to multiple failed login attempts.</strong></p>
                    </div>
                    
                    <h2>What happened?</h2>
                    <p>We detected 5 consecutive failed login attempts on your account. As a security measure, we've temporarily locked your account to protect it from unauthorized access.</p>
                    
                    <div class="info-box">
                        <p><strong>To unlock your account:</strong></p>
                        <ol>
                            <li>Reset your password using the "Forgot Password" link</li>
                            <li>Contact our support team if you didn't attempt these logins</li>
                        </ol>
                    </div>
                    
                    <p><strong>⚠️ Didn't try to login?</strong></p>
                    <p>If this wasn't you, someone may be trying to access your account. We recommend:</p>
                    <ul>
                        <li>Reset your password immediately</li>
                        <li>Enable two-factor authentication</li>
                        <li>Review recent account activity</li>
                    </ul>
                    
                    <p style="text-align: center;">
                        <a href="http://localhost:3000/forgot-password" class="button">Reset Password</a>
                    </p>
                    
                    <div class="footer">
                        <p>If you need assistance, contact us at support@expensesTracker.com</p>
                        <p>This is an automated security message from expensesTracker.</p>
                        <p>© 2025 expensesTracker. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """);
    }

    private String buildPasswordChangedEmailHtml(String email) {
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy 'at' HH:mm");

        return String.format("""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981 0%%, #059669 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
                .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 5px; }
                .info-box { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
                .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
                .button { display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Password Changed</h1>
                    <p>Your password has been updated successfully</p>
                </div>
                <div class="content">
                    <div class="success-box">
                        <p><strong>Your password was successfully changed on %s</strong></p>
                    </div>
                    
                    <p>This is a confirmation that your expensesTracker account password has been changed.</p>
                    
                    <div class="info-box">
                        <p><strong>For your security:</strong></p>
                        <ul>
                            <li>All active sessions have been logged out</li>
                            <li>You'll need to login again with your new password</li>
                            <li>Your account has been unlocked (if it was locked)</li>
                        </ul>
                    </div>
                    
                    <div class="warning-box">
                        <p><strong>⚠️ Didn't change your password?</strong></p>
                        <p>If you didn't make this change, your account may be compromised. Take action immediately:</p>
                        <ul>
                            <li>Reset your password again</li>
                            <li>Contact our support team</li>
                            <li>Review recent account activity</li>
                        </ul>
                        <p style="text-align: center;">
                            <a href="mailto:support@expensesTracker.com" class="button">Contact Support</a>
                        </p>
                    </div>
                    
                    <div class="footer">
                        <p>Need help? Contact us at support@expensesTracker.com</p>
                        <p>This is an automated security message from expensesTracker.</p>
                        <p>© 2025 expensesTracker. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """, now.format(formatter));
    }
    @Async("taskExecutor")
    public void sendTwoFactorOtpEmail(String to, String otp) {
        if (!mailEnabled) {
            log.info("Email sending is disabled. Skipping 2FA email.");
            return;
        }

        log.info("Sending 2FA OTP email to: {}", to);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("🔐 Your Two-Factor Authentication Code - TuniFinance");

            String htmlContent = build2FAEmailHtml(otp);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("2FA OTP email sent successfully to {}", to);

        } catch (MessagingException e) {
            log.error("Failed to send 2FA OTP email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send 2FA email. Please try again.");
        }
    }

    private String build2FAEmailHtml(String otp) {
        return String.format("""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; }
                .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { padding: 30px; }
                .otp-box { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
                .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 10px 0; }
                .info-box { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
                .warning { color: #dc2626; font-weight: 600; margin-top: 20px; }
                .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Two-Factor Authentication</h1>
                    <p>Security Code for Your Account</p>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>You're receiving this email because a two-factor authentication code was requested for your TuniFinance account.</p>
                    
                    <div class="otp-box">
                        <p style="margin: 0; font-size: 14px;">Your verification code is:</p>
                        <div class="otp-code">%s</div>
                        <p style="margin: 0; font-size: 12px;">Enter this code to complete your login</p>
                    </div>
                    
                    <div class="info-box">
                        <p style="margin: 5px 0;"><strong>⏰ This code expires in 10 minutes</strong></p>
                        <p style="margin: 5px 0;">For your security, do not share this code with anyone</p>
                    </div>
                    
                    <p class="warning">⚠️ If you didn't attempt to log in, someone may be trying to access your account. Please secure your account immediately by changing your password.</p>
                    
                    <div class="footer">
                        <p>This is an automated security message from TuniFinance.</p>
                        <p>© 2025 TuniFinance. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """, otp);
    }
}
