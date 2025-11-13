package com.example.backend.service;

import com.example.backend.dto.Budget.BudgetRequestDTO;
import com.example.backend.dto.Budget.BudgetResponseDTO;
import com.example.backend.dto.Budget.BudgetSummaryDTO;

import java.util.List;

public interface BudgetService {

    BudgetResponseDTO createBudget(Long userId, BudgetRequestDTO request);

    List<BudgetResponseDTO> getUserBudgets(Long userId, Boolean activeOnly);

    BudgetResponseDTO getBudgetById(Long userId, Long budgetId);

    BudgetResponseDTO updateBudget(Long userId, Long budgetId, BudgetRequestDTO request);

    void deleteBudget(Long userId, Long budgetId);

    // ✅ ADD THIS METHOD
    BudgetSummaryDTO getBudgetSummary(Long userId);

}