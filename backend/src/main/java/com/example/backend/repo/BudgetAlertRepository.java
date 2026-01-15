package com.example.backend.repo;

import com.example.backend.entity.BudgetAlert;
import com.example.backend.enums.AlertType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BudgetAlertRepository extends JpaRepository<BudgetAlert, Long> {

    // 🔥 NEW OPTIMIZED METHOD
    @Query("SELECT a FROM BudgetAlert a " +
            "LEFT JOIN FETCH a.budget " +
            "WHERE a.user.id = :userId " +
            "AND a.isRead = false " +
            "ORDER BY a.createdAt DESC")
    List<BudgetAlert> findUnreadAlertsWithBudget(@Param("userId") Long userId);

    // 🔥 NEW OPTIMIZED METHOD
    @Query("SELECT a FROM BudgetAlert a " +
            "LEFT JOIN FETCH a.budget " +
            "WHERE a.user.id = :userId " +
            "ORDER BY a.createdAt DESC")
    List<BudgetAlert> findAllAlertsWithBudget(@Param("userId") Long userId);

    // Keep old methods for backward compatibility
    List<BudgetAlert> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);
    List<BudgetAlert> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT COUNT(a) FROM BudgetAlert a WHERE a.user.id = :userId AND a.isRead = false")
    Long countUnreadAlerts(@Param("userId") Long userId);

    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END " +
            "FROM BudgetAlert a WHERE a.budget.id = :budgetId " +
            "AND a.type = :type " +
            "AND a.triggeredAt > :since")
    boolean existsRecentAlert(
            @Param("budgetId") Long budgetId,
            @Param("type") AlertType type,
            @Param("since") LocalDateTime since
    );
}