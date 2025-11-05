package com.example.backend.repo;

import com.example.backend.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByUserIdAndIsActive(Long userId, Boolean isActive);

    List<Budget> findByUserIdAndCategory(Long userId, String category);

    @Query("SELECT b FROM Budget b WHERE b.user.id = :userId " +
            "AND b.isActive = true " +
            "AND :date BETWEEN b.startDate AND b.endDate")
    List<Budget> findActiveBudgetsForDate(@Param("userId") Long userId,
                                          @Param("date") LocalDate date);

    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END " +
            "FROM Budget b WHERE b.user.id = :userId " +
            "AND b.category = :category " +
            "AND b.isActive = true " +
            "AND :startDate < b.endDate AND :endDate > b.startDate")
    boolean existsOverlappingBudget(@Param("userId") Long userId,
                                    @Param("category") String category,
                                    @Param("startDate") LocalDate startDate,
                                    @Param("endDate") LocalDate endDate);
    List<Budget> findByUserId(Long userId);
    @Query("SELECT b FROM Budget b WHERE b.user.id = :userId " +
            "AND b.category = :category " +
            "AND b.isActive = true " +
            "AND :date BETWEEN b.startDate AND b.endDate")
    List<Budget> findActiveBudgetsForCategory(
            @Param("userId") Long userId,
            @Param("category") String category,
            @Param("date") LocalDate date
    );


}
