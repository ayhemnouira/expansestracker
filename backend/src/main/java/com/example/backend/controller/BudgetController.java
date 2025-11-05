package com.example.backend.controller;

import com.example.backend.Response.ApiResponse;
import com.example.backend.dto.Budget.BudgetRequestDTO;
import com.example.backend.dto.Budget.BudgetResponseDTO;
import com.example.backend.entity.User;
import com.example.backend.service.BudgetService;
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
    public ResponseEntity<ApiResponse<BudgetResponseDTO>> createBudget(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody BudgetRequestDTO request) {

        BudgetResponseDTO budget = budgetService.createBudget(currentUser.getId(), request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Budget created successfully", budget));
    }

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<List<BudgetResponseDTO>>> getBudgets(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(required = false) Boolean activeOnly) {

        List<BudgetResponseDTO> budgets = budgetService.getUserBudgets(currentUser.getId(), activeOnly);

        return ResponseEntity.ok(ApiResponse.success("Budgets retrieved successfully", budgets));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<BudgetResponseDTO>> getBudget(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long id) {

        BudgetResponseDTO budget = budgetService.getBudgetById(currentUser.getId(), id);

        return ResponseEntity.ok(ApiResponse.success("Budget retrieved successfully", budget));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<BudgetResponseDTO>> updateBudget(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long id,
            @Valid @RequestBody BudgetRequestDTO request) {

        BudgetResponseDTO budget = budgetService.updateBudget(currentUser.getId(), id, request);

        return ResponseEntity.ok(ApiResponse.success("Budget updated successfully", budget));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<Void>> deleteBudget(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long id) {

        budgetService.deleteBudget(currentUser.getId(), id);

        return ResponseEntity.ok(ApiResponse.success("Budget deleted successfully", null));
    }
}
