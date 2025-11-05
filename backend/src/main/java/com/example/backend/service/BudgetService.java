package com.example.backend.service;

import com.example.backend.dto.Budget.BudgetRequestDTO;
import com.example.backend.dto.Budget.BudgetResponseDTO;
import com.example.backend.entity.Budget;
import com.example.backend.entity.User;
import com.example.backend.enums.BudgetPeriod;
import com.example.backend.enums.BudgetStatus;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.exception.UnauthorizedException;
import com.example.backend.repo.BudgetRepository;
import com.example.backend.repo.TransactionRepository;
import com.example.backend.repo.UserRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepo userRepository;

    /**
     * Create new budget with validation
     */
    @Transactional
    public BudgetResponseDTO createBudget(Long userId, BudgetRequestDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : LocalDate.now();
        LocalDate endDate = calculateEndDate(startDate, request.getPeriod(), request.getCustomEndDate());

        // Check for overlapping active budgets in same category
        if (budgetRepository.existsOverlappingBudget(userId, request.getCategory(), startDate, endDate)) {
            log.warn("User {} attempted to create overlapping budget in category {}", userId, request.getCategory());
            throw new IllegalStateException("A budget for this category already exists in this period");
        }

        Budget budget = Budget.builder()
                .user(user)
                .category(request.getCategory())
                .amount(request.getAmount())
                .period(request.getPeriod())
                .startDate(startDate)
                .endDate(endDate)
                .alertThreshold(request.getAlertThreshold())
                .isActive(true)
                .build();

        Budget saved = budgetRepository.save(budget);
        log.info("Created budget {} for user {}", saved.getId(), userId);

        return enrichBudgetWithCalculations(saved);
    }

    /**
     * Get all budgets for user
     */
    public List<BudgetResponseDTO> getUserBudgets(Long userId, Boolean activeOnly) {
        List<Budget> budgets = (activeOnly != null && activeOnly)
                ? budgetRepository.findByUserIdAndIsActive(userId, true)
                : budgetRepository.findByUserId(userId);

        return budgets.stream()
                .map(this::enrichBudgetWithCalculations)
                .collect(Collectors.toList());
    }

    /**
     * Get budget by ID
     */
    public BudgetResponseDTO getBudgetById(Long userId, Long budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .filter(b -> b.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));
        return enrichBudgetWithCalculations(budget);
    }

    /**
     * Update budget safely
     */
    @Transactional
    public BudgetResponseDTO updateBudget(Long userId, Long budgetId, BudgetRequestDTO request) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));

        if (!budget.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Not authorized to update this budget");
        }

        LocalDate newStartDate = request.getStartDate() != null ? request.getStartDate() : budget.getStartDate();
        LocalDate newEndDate = calculateEndDate(newStartDate, request.getPeriod(), request.getCustomEndDate());

        // Check overlap if category or period changed
        if (!budget.getCategory().equals(request.getCategory())
                || !budget.getStartDate().equals(newStartDate)
                || !budget.getEndDate().equals(newEndDate)) {

            if (budgetRepository.existsOverlappingBudget(userId, request.getCategory(), newStartDate, newEndDate)) {
                log.warn("User {} attempted to update budget {} resulting in overlap", userId, budgetId);
                throw new IllegalStateException("Updating this budget would create an overlapping budget");
            }
        }

        budget.setCategory(request.getCategory());
        budget.setAmount(request.getAmount());
        budget.setPeriod(request.getPeriod());
        budget.setStartDate(newStartDate);
        budget.setEndDate(newEndDate);
        budget.setAlertThreshold(request.getAlertThreshold());

        Budget updated = budgetRepository.save(budget);
        log.info("Updated budget {} for user {}", budgetId, userId);

        return enrichBudgetWithCalculations(updated);
    }

    /**
     * Deactivate budget (soft delete)
     */
    @Transactional
    public void deleteBudget(Long userId, Long budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));

        if (!budget.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Not authorized to delete this budget");
        }

        budget.setIsActive(false);
        budgetRepository.save(budget);
        log.info("Deactivated budget {} for user {}", budgetId, userId);
    }

    /**
     * Enrich budget with real-time calculations
     */
    private BudgetResponseDTO enrichBudgetWithCalculations(Budget budget) {
        BigDecimal spent = transactionRepository
                .sumExpensesByUserAndCategoryAndDateRange(
                        budget.getUser().getId(),
                        budget.getCategory(),
                        budget.getStartDate(),
                        budget.getEndDate()
                ).orElse(BigDecimal.ZERO);

        BigDecimal remaining = budget.getAmount().subtract(spent);
        Double percentageUsed = budget.getAmount().compareTo(BigDecimal.ZERO) > 0
                ? spent.divide(budget.getAmount(), 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0.0;

        BudgetStatus status = calculateStatus(percentageUsed, budget);
        int daysRemaining = (int) ChronoUnit.DAYS.between(LocalDate.now(), budget.getEndDate());

        return BudgetResponseDTO.builder()
                .id(budget.getId())
                .category(budget.getCategory())
                .amount(budget.getAmount())
                .period(budget.getPeriod())
                .startDate(budget.getStartDate())
                .endDate(budget.getEndDate())
                .alertThreshold(budget.getAlertThreshold())
                .isActive(budget.getIsActive())
                .spent(spent)
                .remaining(remaining)
                .percentageUsed(Math.round(percentageUsed * 100.0) / 100.0)
                .status(status)
                .daysRemaining(Math.max(0, daysRemaining))
                .createdAt(budget.getCreatedAt())
                .build();
    }

    /**
     * Determine budget status
     */
    private BudgetStatus calculateStatus(Double percentageUsed, Budget budget) {
        if (!budget.getIsActive()) return BudgetStatus.INACTIVE;
        if (percentageUsed >= 100) return BudgetStatus.EXCEEDED;
        if (percentageUsed >= budget.getAlertThreshold()) return BudgetStatus.WARNING;
        return BudgetStatus.SAFE;
    }

    /**
     * Calculate end date based on period or custom date
     */
    private LocalDate calculateEndDate(LocalDate startDate, BudgetPeriod period, LocalDate customEndDate) {
        if (period == BudgetPeriod.CUSTOM && customEndDate != null) {
            return customEndDate;
        }

        return switch (period) {
            case WEEKLY -> startDate.plusWeeks(1).minusDays(1);
            case MONTHLY -> startDate.plusMonths(1).minusDays(1);
            case YEARLY -> startDate.plusYears(1).minusDays(1);
            default -> startDate.plusMonths(1).minusDays(1); // fallback
        };
    }
}
