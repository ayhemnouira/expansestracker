package com.example.backend.repo;

import com.example.backend.entity.Transaction;
import com.example.backend.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // Find all transactions for a user (sorted by date descending)
    List<Transaction> findByUserIdOrderByDateDesc(Long userId);

    // Find transaction by ID and user (security check)
    Optional<Transaction> findByIdAndUserId(Long id, Long userId);

    // Find transactions between dates
    List<Transaction> findByUserIdAndDateBetweenOrderByDateDesc(
            Long userId,
            LocalDate startDate,
            LocalDate endDate
    );

    // Find by category
    List<Transaction> findByUserIdAndCategoryOrderByDateDesc(Long userId, String category);

    // Find by type
    List<Transaction> findByUserIdAndTypeOrderByDateDesc(Long userId, TransactionType type);

    // Custom query: Get total by type for a user
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type")
    Double getTotalByType(@Param("userId") Long userId, @Param("type") TransactionType type);

    // Custom query: Monthly summary
    @Query("SELECT MONTH(t.date) as month, YEAR(t.date) as year, SUM(t.amount) as total " +
            "FROM Transaction t WHERE t.user.id = :userId AND t.type = :type " +
            "GROUP BY YEAR(t.date), MONTH(t.date) ORDER BY year DESC, month DESC")
    List<Object[]> getMonthlySummary(@Param("userId") Long userId, @Param("type") TransactionType type);





    // ✅ FIX: Return Double instead of Optional<BigDecimal>
    @Query("SELECT COALESCE(SUM(t.amount), 0.0) FROM Transaction t " +
            "WHERE t.user.id = :userId " +
            "AND t.type = 'EXPENSE' " +
            "AND t.category = :category " +
            "AND t.date BETWEEN :startDate AND :endDate")
    Double sumExpensesByUserAndCategoryAndDateRange(
            @Param("userId") Long userId,
            @Param("category") String category,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
