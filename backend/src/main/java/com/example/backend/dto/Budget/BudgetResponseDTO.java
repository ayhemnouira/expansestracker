package com.example.backend.dto.Budget;
import com.example.backend.enums.BudgetPeriod;
import com.example.backend.enums.BudgetStatus;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class BudgetResponseDTO {
    private Long id;
    private String category;
    private BigDecimal amount;
    private BudgetPeriod period;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer alertThreshold;
    private Boolean isActive;

    // Calculated fields
    private BigDecimal spent;
    private BigDecimal remaining;
    private Double percentageUsed;
    private BudgetStatus status;
    private Integer daysRemaining;

    private LocalDateTime createdAt;
}

