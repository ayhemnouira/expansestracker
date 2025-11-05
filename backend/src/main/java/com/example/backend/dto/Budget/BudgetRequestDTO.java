package com.example.backend.dto.Budget;

import com.example.backend.enums.BudgetPeriod;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class BudgetRequestDTO {
    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "Period is required")
    private BudgetPeriod period;

    private LocalDate startDate; // Optional, defaults to today

    @Min(0)
    @Max(100)
    private Integer alertThreshold = 80;

    // NEW: Optional custom end date for CUSTOM period budgets
    private LocalDate customEndDate;
}
