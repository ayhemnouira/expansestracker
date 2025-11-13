package com.example.backend.service;

import com.example.backend.entity.Budget;
import com.example.backend.entity.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
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
                            <p>This is an automated message from TuniFinance.</p>
                            <p>© 2025 TuniFinance. All rights reserved.</p>
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
                            <p>This is an automated message from TuniFinance.</p>
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
}