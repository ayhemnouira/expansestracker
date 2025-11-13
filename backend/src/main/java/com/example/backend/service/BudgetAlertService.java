package com.example.backend.service;

import com.example.backend.dto.Budget.BudgetAlertDTO;
import java.util.List;

/**
 * Service interface for budget alert operations
 */
public interface BudgetAlertService {

    /**
     * Check budgets and create alerts after transaction changes
     * FIXED: Changed from checkBudgetForCategory to checkBudgetsForCategory
     */
    void checkBudgetsForCategory(Long userId, String category);

    /**
     * Get all unread alerts for a user
     */
    List<BudgetAlertDTO> getUnreadAlerts(Long userId);

    /**
     * Get all alerts (read and unread) with limit
     */
    List<BudgetAlertDTO> getAllAlerts(Long userId, int limit);

    /**
     * Get count of unread alerts
     */
    Long getUnreadCount(Long userId);

    /**
     * Mark a specific alert as read
     */
    void markAsRead(Long userId, Long alertId);

    /**
     * Mark all alerts as read for a user
     */
    void markAllAsRead(Long userId);
}