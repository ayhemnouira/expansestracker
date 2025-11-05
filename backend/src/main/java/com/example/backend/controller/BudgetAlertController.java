package com.example.backend.controller;

import com.example.backend.Response.ApiResponse;
import com.example.backend.dto.Budget.BudgetAlertDTO;
import com.example.backend.entity.User;
import com.example.backend.service.BudgetAlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
@Tag(name = "Budget Alerts", description = "Budget alert notification endpoints")
public class BudgetAlertController {

    private final BudgetAlertService alertService;

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Get all unread alerts", description = "Retrieve all unread budget alerts for the authenticated user")
    public ResponseEntity<ApiResponse<List<BudgetAlertDTO>>> getAlerts(
            @AuthenticationPrincipal User user) { // ✅ Direct cast to User

        List<BudgetAlertDTO> alerts = alertService.getUnreadAlerts(user.getId());

        return ResponseEntity.ok(
                ApiResponse.success("Alerts retrieved successfully", alerts));
    }

    @GetMapping("/count")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Get unread alert count", description = "Get the count of unread alerts for badge display")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(
            @AuthenticationPrincipal User user) { // ✅ Direct cast to User

        Long count = alertService.getUnreadCount(user.getId());

        return ResponseEntity.ok(
                ApiResponse.success("Unread count retrieved", count));
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Mark alert as read", description = "Mark a specific alert as read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @AuthenticationPrincipal User user, // ✅ Direct cast to User
            @PathVariable Long id) {

        alertService.markAsRead(user.getId(), id);

        return ResponseEntity.ok(
                ApiResponse.success("Alert marked as read", null));
    }

    @PutMapping("/read-all")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Mark all alerts as read", description = "Mark all unread alerts as read for the user")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal User user) { // ✅ Direct cast to User

        alertService.markAllAsRead(user.getId());

        return ResponseEntity.ok(
                ApiResponse.success("All alerts marked as read", null));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Get all alerts", description = "Retrieve all alerts (read and unread)")
    public ResponseEntity<ApiResponse<List<BudgetAlertDTO>>> getAllAlerts(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "10") int limit) { // ✅ Pagination

        List<BudgetAlertDTO> alerts = alertService.getAllAlerts(user.getId(), limit);

        return ResponseEntity.ok(
                ApiResponse.success("All alerts retrieved successfully", alerts));
    }
}