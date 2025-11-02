package com.example.backend.dto.account;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountSummaryDto {
    private Integer totalAccounts;
    private Double totalBalance;
    private Double totalIncome;
    private Double totalExpenses;
}