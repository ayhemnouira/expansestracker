package com.example.backend.dto.Budget;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetSummaryDTO {
    private Long totalBudgets;
    private Long safeBudgets;
    private Long warningBudgets;
    private Long exceededBudgets;
    private BigDecimal totalBudgeted;
    private BigDecimal totalSpent;
    private Double overallPercentage;
}