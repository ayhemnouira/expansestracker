package com.example.backend.service.impl;

import com.example.backend.dto.Budget.BudgetAlertDTO;
import com.example.backend.entity.Budget;
import com.example.backend.entity.BudgetAlert;
import com.example.backend.entity.User;
import com.example.backend.enums.AlertType;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.exception.UnauthorizedException;
import com.example.backend.repo.BudgetAlertRepository;
import com.example.backend.repo.BudgetRepository;
import com.example.backend.repo.TransactionRepository;
import com.example.backend.service.BudgetAlertService;
import com.example.backend.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BudgetAlertServiceImpl implements BudgetAlertService {

    private final BudgetAlertRepository alertRepository;
    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;
    private final EmailService emailService; // ← Inject email service

    @Override
    @Transactional
    public void checkBudgetsForCategory(Long userId, String category) {
        log.debug("Checking budgets for user {} and category {}", userId, category);

        List<Budget> budgets = budgetRepository
                .findActiveBudgetsForCategory(userId, category, LocalDate.now());

        budgets.forEach(this::checkSingleBudgetAndAlert);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BudgetAlertDTO> getUnreadAlerts(Long userId) {
        log.debug("Fetching unread alerts for user {}", userId);

        // 🔥 CHANGED: Use optimized method
        return alertRepository
                .findUnreadAlertsWithBudget(userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BudgetAlertDTO> getAllAlerts(Long userId, int limit) {
        log.debug("Fetching all alerts for user {} with limit {}", userId, limit);

        // 🔥 CHANGED: Use optimized method
        return alertRepository
                .findAllAlertsWithBudget(userId)
                .stream()
                .limit(limit)
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Long getUnreadCount(Long userId) {
        log.debug("Counting unread alerts for user {}", userId);
        return alertRepository.countUnreadAlerts(userId);
    }

    @Override
    @Transactional
    public void markAsRead(Long userId, Long alertId) {
        log.debug("Marking alert {} as read for user {}", alertId, userId);

        BudgetAlert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found with ID: " + alertId));

        if (!alert.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Not authorized to access this alert");
        }

        alert.setIsRead(true);
        alertRepository.save(alert);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        log.debug("Marking all alerts as read for user {}", userId);

        List<BudgetAlert> unreadAlerts = alertRepository
                .findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);

        unreadAlerts.forEach(alert -> alert.setIsRead(true));
        alertRepository.saveAll(unreadAlerts);

        log.info("Marked {} alerts as read for user {}", unreadAlerts.size(), userId);
    }

    // ==================== PRIVATE HELPER METHODS ====================

    private void checkSingleBudgetAndAlert(Budget budget) {
        BigDecimal spent = calculateSpent(budget);
        BigDecimal amount = budget.getAmount();
        double percentage = calculatePercentage(spent, amount);

        User user = budget.getUser();

        // Check if threshold reached (80% by default)
        if (percentage >= budget.getAlertThreshold() && percentage < 100) {
            boolean alertCreated = createAlertIfNotRecent(
                    budget,
                    AlertType.THRESHOLD_REACHED,
                    String.format("⚠️ You've used %.1f%% of your %s budget (%.2f TND / %.2f TND)",
                            percentage, budget.getCategory(), spent, amount)
            );

            // 📧 Send email if alert was created
            if (alertCreated) {
                try {
                    emailService.sendBudgetAlertEmail(user, budget, spent, percentage);
                    log.info("Budget alert email sent to {}", user.getEmail());
                } catch (Exception e) {
                    log.error("Failed to send budget alert email: {}", e.getMessage());
                }
            }
        }

        // Check if budget exceeded
        if (percentage >= 100) {
            boolean alertCreated = createAlertIfNotRecent(
                    budget,
                    AlertType.BUDGET_EXCEEDED,
                    String.format("🚫 Your %s budget has been exceeded! Spent: %.2f TND / %.2f TND",
                            budget.getCategory(), spent, amount)
            );

            // 📧 Send exceeded email if alert was created
            if (alertCreated) {
                try {
                    emailService.sendBudgetExceededEmail(user, budget, spent, percentage);
                    log.info("Budget exceeded email sent to {}", user.getEmail());
                } catch (Exception e) {
                    log.error("Failed to send budget exceeded email: {}", e.getMessage());
                }
            }
        }
    }

    private boolean createAlertIfNotRecent(Budget budget, AlertType type, String message) {
        // Don't spam - only alert once per day for same issue
        LocalDateTime yesterday = LocalDateTime.now().minusDays(1);

        if (!alertRepository.existsRecentAlert(budget.getId(), type, yesterday)) {
            BudgetAlert alert = BudgetAlert.builder()
                    .budget(budget)
                    .user(budget.getUser())
                    .type(type)
                    .message(message)
                    .triggeredAt(LocalDateTime.now())
                    .isRead(false)
                    .build();

            alertRepository.save(alert);
            log.info("Created {} alert for budget {} (user {})",
                    type, budget.getId(), budget.getUser().getId());
            return true; // Alert was created
        }
        return false; // Alert already exists
    }

    private BigDecimal calculateSpent(Budget budget) {
        Double spent = transactionRepository
                .sumExpensesByUserAndCategoryAndDateRange(
                        budget.getUser().getId(),
                        budget.getCategory(),
                        budget.getStartDate(),
                        budget.getEndDate()
                );

        return spent != null ? BigDecimal.valueOf(spent) : BigDecimal.ZERO;
    }

    private double calculatePercentage(BigDecimal spent, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }
        return spent.divide(amount, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
    }

    private BudgetAlertDTO toDTO(BudgetAlert alert) {
        return BudgetAlertDTO.builder()
                .id(alert.getId())
                .budgetId(alert.getBudget().getId())
                .budgetCategory(alert.getBudget().getCategory())
                .type(alert.getType())
                .message(alert.getMessage())
                .isRead(alert.getIsRead())
                .triggeredAt(alert.getTriggeredAt())
                .createdAt(alert.getCreatedAt())
                .build();
    }
}