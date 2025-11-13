package com.example.backend.controller;

import com.example.backend.entity.Budget;
import com.example.backend.entity.User;
import com.example.backend.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * TEMPORARY CONTROLLER - For testing email functionality
 * DELETE THIS FILE after confirming emails work!
 */
@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class EmailTestController {

    private final EmailService emailService;

    @GetMapping("/email")
    public String testEmail() {
        try {
            // Create dummy user
            User testUser = User.builder()
                    .id(1L)
                    .email("zuko7299@gmail.com") // Your email to receive test
                    .username("TestUser")
                    .build();

            // Create dummy budget
            Budget testBudget = Budget.builder()
                    .id(1L)
                    .category("Food")
                    .amount(BigDecimal.valueOf(1000))
                    .startDate(LocalDate.now())
                    .endDate(LocalDate.now().plusMonths(1))
                    .user(testUser)
                    .build();

            // Send test alert email
            emailService.sendBudgetAlertEmail(
                    testUser,
                    testBudget,
                    BigDecimal.valueOf(850),
                    85.0
            );

            return "✅ Test email sent to " + testUser.getEmail() +
                    "\nCheck your inbox (and spam folder)!";

        } catch (Exception e) {
            return "❌ Email failed: " + e.getMessage();
        }
    }

    @GetMapping("/email-exceeded")
    public String testExceededEmail() {
        try {
            User testUser = User.builder()
                    .id(1L)
                    .email("zuko7299@gmail.com")
                    .username("TestUser")
                    .build();

            Budget testBudget = Budget.builder()
                    .id(1L)
                    .category("Shopping")
                    .amount(BigDecimal.valueOf(500))
                    .startDate(LocalDate.now())
                    .endDate(LocalDate.now().plusMonths(1))
                    .user(testUser)
                    .build();

            emailService.sendBudgetExceededEmail(
                    testUser,
                    testBudget,
                    BigDecimal.valueOf(650),
                    130.0
            );

            return "✅ Budget exceeded email sent!";

        } catch (Exception e) {
            return "❌ Email failed: " + e.getMessage();
        }
    }
}