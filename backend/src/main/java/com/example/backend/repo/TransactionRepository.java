package com.example.backend.repo;

import com.example.backend.entity.Transaction;
import com.example.backend.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // 🔥 NEW OPTIMIZED METHOD: Replaces findByUserIdOrderByDateDesc
    @Query("SELECT DISTINCT t FROM Transaction t " +
            "LEFT JOIN FETCH t.account " +
            "LEFT JOIN FETCH t.documents " +
            "WHERE t.user.id = :userId " +
            "ORDER BY t.date DESC")
    List<Transaction> findByUserIdWithDetailsOrderByDateDesc(@Param("userId") Long userId);

    // 🔥 NEW OPTIMIZED METHOD: For date range queries
    @Query("SELECT DISTINCT t FROM Transaction t " +
            "LEFT JOIN FETCH t.account " +
            "LEFT JOIN FETCH t.documents " +
            "WHERE t.user.id = :userId " +
            "AND t.date BETWEEN :startDate AND :endDate " +
            "ORDER BY t.date DESC")
    List<Transaction> findByUserIdAndDateBetweenWithDetails(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // 🔥 NEW OPTIMIZED METHOD: For category queries
    @Query("SELECT DISTINCT t FROM Transaction t " +
            "LEFT JOIN FETCH t.account " +
            "LEFT JOIN FETCH t.documents " +
            "WHERE t.user.id = :userId " +
            "AND LOWER(t.category) = LOWER(:category) " +
            "ORDER BY t.date DESC")
    List<Transaction> findByUserIdAndCategoryWithDetails(
            @Param("userId") Long userId,
            @Param("category") String category
    );

    // Keep old methods for backward compatibility (or remove if not used elsewhere)
    List<Transaction> findByUserIdOrderByDateDesc(Long userId);

    Optional<Transaction> findByIdAndUserId(Long id, Long userId);

    List<Transaction> findByUserIdAndDateBetweenOrderByDateDesc(
            Long userId,
            LocalDate startDate,
            LocalDate endDate
    );

    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId " +
            "AND LOWER(t.category) = LOWER(:category) " +
            "ORDER BY t.date DESC")
    List<Transaction> findByUserIdAndCategoryOrderByDateDesc(
            @Param("userId") Long userId,
            @Param("category") String category
    );

    List<Transaction> findByUserIdAndTypeOrderByDateDesc(Long userId, TransactionType type);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type")
    Double getTotalByType(@Param("userId") Long userId, @Param("type") TransactionType type);

    @Query("SELECT MONTH(t.date) as month, YEAR(t.date) as year, SUM(t.amount) as total " +
            "FROM Transaction t WHERE t.user.id = :userId AND t.type = :type " +
            "GROUP BY YEAR(t.date), MONTH(t.date) ORDER BY year DESC, month DESC")
    List<Object[]> getMonthlySummary(@Param("userId") Long userId, @Param("type") TransactionType type);

    @Query("SELECT COALESCE(SUM(t.amount), 0.0) FROM Transaction t " +
            "WHERE t.user.id = :userId " +
            "AND t.type = 'EXPENSE' " +
            "AND LOWER(t.category) = LOWER(:category) " +
            "AND t.date BETWEEN :startDate AND :endDate")
    Double sumExpensesByUserAndCategoryAndDateRange(
            @Param("userId") Long userId,
            @Param("category") String category,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    Long countByAccountId(Long accountId);
}