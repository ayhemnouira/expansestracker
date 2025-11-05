package com.example.backend.dto.Budget;

import com.example.backend.enums.AlertType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class BudgetAlertDTO {
    private Long id;
    private Long budgetId;
    private String budgetCategory;
    private AlertType type;
    private String message;
    private Boolean isRead;
    private LocalDateTime triggeredAt;
    private LocalDateTime createdAt;
}
