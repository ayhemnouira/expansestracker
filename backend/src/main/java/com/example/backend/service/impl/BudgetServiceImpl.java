package com.example.backend.service.impl;
import com.example.backend.dto.Budget.BudgetRequestDTO;
import com.example.backend.dto.Budget.BudgetResponseDTO;
import com.example.backend.dto.Budget.BudgetSummaryDTO;
import com.example.backend.entity.Budget;
import com.example.backend.entity.User;
import com.example.backend.enums.BudgetPeriod;
import com.example.backend.enums.BudgetStatus;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.exception.UnauthorizedException;
import com.example.backend.repo.BudgetRepository;
import com.example.backend.repo.TransactionRepository;
import com.example.backend.repo.UserRepo;
import com.example.backend.service.BudgetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepo userRepository;

    // ==================== PUBLIC INTERFACE METHODS ====================

    @Override
    @Transactional
    public BudgetResponseDTO createBudget(Long userId, BudgetRequestDTO request) {
        log.debug("Creating budget for user {} with category {}", userId, request.getCategory());

        User user = findUserOrThrow(userId);

        LocalDate startDate = request.getStartDate() != null ?
                request.getStartDate() : LocalDate.now();
        LocalDate endDate = calculateEndDate(startDate, request.getPeriod());

        validateNoOverlappingBudget(userId, request.getCategory(), startDate, endDate);

        Budget budget = buildBudgetEntity(user, request, startDate, endDate);
        Budget saved = budgetRepository.save(budget);

        log.info("Successfully created budget {} for user {}", saved.getId(), userId);
        return enrichBudgetWithCalculations(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BudgetResponseDTO> getUserBudgets(Long userId, Boolean activeOnly) {
        log.debug("Fetching budgets for user {} (activeOnly={})", userId, activeOnly);

        List<Budget> budgets = activeOnly != null && activeOnly ?
                budgetRepository.findByUserIdAndIsActive(userId, true) :
                budgetRepository.findByUserId(userId);

        return budgets.stream()
                .map(this::enrichBudgetWithCalculations)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BudgetResponseDTO getBudgetById(Long userId, Long budgetId) {
        log.debug("Fetching budget {} for user {}", budgetId, userId);

        Budget budget = findBudgetOrThrow(budgetId);
        validateBudgetOwnership(budget, userId);

        return enrichBudgetWithCalculations(budget);
    }

    @Override
    @Transactional
    public BudgetResponseDTO updateBudget(Long userId, Long budgetId, BudgetRequestDTO request) {
        log.debug("Updating budget {} for user {}", budgetId, userId);

        Budget budget = findBudgetOrThrow(budgetId);
        validateBudgetOwnership(budget, userId);

        updateBudgetFields(budget, request);
        Budget updated = budgetRepository.save(budget);

        log.info("Successfully updated budget {} for user {}", budgetId, userId);
        return enrichBudgetWithCalculations(updated);
    }

    @Override
    @Transactional
    public void deleteBudget(Long userId, Long budgetId) {
        log.debug("Deleting budget {} for user {}", budgetId, userId);

        Budget budget = findBudgetOrThrow(budgetId);
        validateBudgetOwnership(budget, userId);

        budget.setIsActive(false);
        budgetRepository.save(budget);

        log.info("Successfully deactivated budget {} for user {}", budgetId, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public BudgetSummaryDTO getBudgetSummary(Long userId) {
        log.debug("Fetching budget summary for user {}", userId);

        List<Budget> activeBudgets = budgetRepository.findByUserIdAndIsActive(userId, true);

        long totalBudgets = activeBudgets.size();
        long safeBudgets = 0;
        long warningBudgets = 0;
        long exceededBudgets = 0;
        BigDecimal totalBudgeted = BigDecimal.ZERO;
        BigDecimal totalSpent = BigDecimal.ZERO;

        for (Budget budget : activeBudgets) {
            BigDecimal spent = calculateSpentAmount(budget);
            double percentage = calculatePercentageUsed(spent, budget.getAmount());
            BudgetStatus status = determineBudgetStatus(percentage, budget);

            totalBudgeted = totalBudgeted.add(budget.getAmount());
            totalSpent = totalSpent.add(spent);

            switch (status) {
                case SAFE -> safeBudgets++;
                case WARNING -> warningBudgets++;
                case EXCEEDED -> exceededBudgets++;
            }
        }

        double overallPercentage = totalBudgeted.compareTo(BigDecimal.ZERO) > 0
                ? calculatePercentageUsed(totalSpent, totalBudgeted)
                : 0.0;

        return BudgetSummaryDTO.builder()
                .totalBudgets(totalBudgets)
                .safeBudgets(safeBudgets)
                .warningBudgets(warningBudgets)
                .exceededBudgets(exceededBudgets)
                .totalBudgeted(totalBudgeted)
                .totalSpent(totalSpent)
                .overallPercentage(overallPercentage)
                .build();
    }

    // ==================== PRIVATE HELPER METHODS ====================

    /**
     * Enriches budget entity with real-time calculations
     */
    private BudgetResponseDTO enrichBudgetWithCalculations(Budget budget) {
        BigDecimal spent = calculateSpentAmount(budget);
        BigDecimal remaining = budget.getAmount().subtract(spent);
        double percentageUsed = calculatePercentageUsed(spent, budget.getAmount());
        BudgetStatus status = determineBudgetStatus(percentageUsed, budget);
        int daysRemaining = calculateDaysRemaining(budget.getEndDate());

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
                .percentageUsed(roundToTwoDecimals(percentageUsed))
                .status(status)
                .daysRemaining(daysRemaining)
                .createdAt(budget.getCreatedAt())
                .build();
    }

    /**
     * ✅ Calculates total spent amount for a budget period
     */
    private BigDecimal calculateSpentAmount(Budget budget) {
        Double spent = transactionRepository
                .sumExpensesByUserAndCategoryAndDateRange(
                        budget.getUser().getId(),
                        budget.getCategory(),
                        budget.getStartDate(),
                        budget.getEndDate()
                );

        // Convert Double to BigDecimal (handle null)
        return spent != null ? BigDecimal.valueOf(spent) : BigDecimal.ZERO;
    }

    /**
     * ✅ Calculates percentage of budget used
     */
    private double calculatePercentageUsed(BigDecimal spent, BigDecimal budgetAmount) {
        if (budgetAmount.compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }
        return spent.divide(budgetAmount, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
    }

    /**
     * ✅ Determines budget status based on percentage and threshold
     */
    private BudgetStatus determineBudgetStatus(double percentage, Budget budget) {
        if (!budget.getIsActive()) {
            return BudgetStatus.INACTIVE;
        }
        if (percentage >= 100) {
            return BudgetStatus.EXCEEDED;
        }
        if (percentage >= budget.getAlertThreshold()) {
            return BudgetStatus.WARNING;
        }
        return BudgetStatus.SAFE;
    }

    /**
     * Calculates days remaining until budget period ends
     */
    private int calculateDaysRemaining(LocalDate endDate) {
        long days = ChronoUnit.DAYS.between(LocalDate.now(), endDate);
        return Math.max(0, (int) days);
    }

    /**
     * Calculates end date based on start date and period
     */
    private LocalDate calculateEndDate(LocalDate startDate, BudgetPeriod period) {
        return switch (period) {
            case WEEKLY -> startDate.plusWeeks(1).minusDays(1);
            case MONTHLY -> startDate.plusMonths(1).minusDays(1);
            case YEARLY -> startDate.plusYears(1).minusDays(1);
            case CUSTOM -> startDate.plusMonths(1).minusDays(1);
        };
    }

    /**
     * Validates that no overlapping budget exists
     */
    private void validateNoOverlappingBudget(Long userId, String category,
                                             LocalDate startDate, LocalDate endDate) {
        if (budgetRepository.existsOverlappingBudget(userId, category, startDate, endDate)) {
            throw new RuntimeException(
                    String.format("A budget for category '%s' already exists in this period", category)
            );
        }
    }

    /**
     * Builds Budget entity from request DTO
     */
    private Budget buildBudgetEntity(User user, BudgetRequestDTO request,
                                     LocalDate startDate, LocalDate endDate) {
        return Budget.builder()
                .user(user)
                .category(request.getCategory())
                .amount(request.getAmount())
                .period(request.getPeriod())
                .startDate(startDate)
                .endDate(endDate)
                .alertThreshold(request.getAlertThreshold())
                .isActive(true)
                .build();
    }

    /**
     * Updates budget fields from request DTO
     */
    private void updateBudgetFields(Budget budget, BudgetRequestDTO request) {
        budget.setCategory(request.getCategory());
        budget.setAmount(request.getAmount());
        budget.setAlertThreshold(request.getAlertThreshold());
    }

    /**
     * Validates that the user owns the budget
     */
    private void validateBudgetOwnership(Budget budget, Long userId) {
        if (!budget.getUser().getId().equals(userId)) {
            log.warn("User {} attempted to access budget {} owned by user {}",
                    userId, budget.getId(), budget.getUser().getId());
            throw new UnauthorizedException("You are not authorized to access this budget");
        }
    }

    /**
     * Finds user by ID or throws exception
     */
    private User findUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
    }

    /**
     * Finds budget by ID or throws exception
     */
    private Budget findBudgetOrThrow(Long budgetId) {
        return budgetRepository.findById(budgetId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with ID: " + budgetId));
    }

    /**
     * Rounds double to 2 decimal places
     */
    private double roundToTwoDecimals(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}