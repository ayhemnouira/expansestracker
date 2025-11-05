package com.example.backend.controller;
import com.example.backend.Response.ApiResponse;
import com.example.backend.dto.Budget.BudgetRequestDTO;
import com.example.backend.dto.Budget.BudgetResponseDTO;
import com.example.backend.dto.Budget.BudgetSummaryDTO;
import com.example.backend.entity.User;
import com.example.backend.service.BudgetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
@Tag(name = "Budgets", description = "Budget management endpoints")
public class BudgetController {

    private final BudgetService budgetService;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Create budget", description = "Create a new budget for a category")
    public ResponseEntity<ApiResponse<BudgetResponseDTO>> createBudget(
            @AuthenticationPrincipal User user, // ✅ Direct cast
            @Valid @RequestBody BudgetRequestDTO request) {

        BudgetResponseDTO budget = budgetService.createBudget(user.getId(), request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Budget created successfully", budget));
    }

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Get all budgets", description = "Retrieve all budgets for the authenticated user")
    public ResponseEntity<ApiResponse<List<BudgetResponseDTO>>> getBudgets(
            @AuthenticationPrincipal User user, // ✅ Direct cast
            @RequestParam(required = false) Boolean activeOnly) {

        List<BudgetResponseDTO> budgets = budgetService.getUserBudgets(user.getId(), activeOnly);

        return ResponseEntity.ok(
                ApiResponse.success("Budgets retrieved successfully", budgets));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Get budget by ID", description = "Retrieve a specific budget by ID")
    public ResponseEntity<ApiResponse<BudgetResponseDTO>> getBudget(
            @AuthenticationPrincipal User user, // ✅ Direct cast
            @PathVariable Long id) {

        BudgetResponseDTO budget = budgetService.getBudgetById(user.getId(), id);

        return ResponseEntity.ok(
                ApiResponse.success("Budget retrieved successfully", budget));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Update budget", description = "Update an existing budget")
    public ResponseEntity<ApiResponse<BudgetResponseDTO>> updateBudget(
            @AuthenticationPrincipal User user, // ✅ Direct cast
            @PathVariable Long id,
            @Valid @RequestBody BudgetRequestDTO request) {

        BudgetResponseDTO budget = budgetService.updateBudget(user.getId(), id, request);

        return ResponseEntity.ok(
                ApiResponse.success("Budget updated successfully", budget));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Delete budget", description = "Soft delete a budget (mark as inactive)")
    public ResponseEntity<ApiResponse<Void>> deleteBudget(
            @AuthenticationPrincipal User user, // ✅ Direct cast
            @PathVariable Long id) {

        budgetService.deleteBudget(user.getId(), id);

        return ResponseEntity.ok(
                ApiResponse.success("Budget deleted successfully", null));
    }

    @GetMapping("/summary")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Get budget summary", description = "Get summary statistics of all budgets")
    public ResponseEntity<ApiResponse<BudgetSummaryDTO>> getBudgetSummary(
            @AuthenticationPrincipal User user) { // ✅ Direct cast

        BudgetSummaryDTO summary = budgetService.getBudgetSummary(user.getId());

        return ResponseEntity.ok(
                ApiResponse.success("Budget summary retrieved successfully", summary));
    }
}