package com.example.backend.repo;

import com.example.backend.entity.Account;
import com.example.backend.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    // Find all accounts for a user
    List<Account> findByUserId(Long userId);

    // Find all enabled accounts for a user
    List<Account> findByUserIdAndEnabledTrue(Long userId);

    // Find account by ID and user ID (security check)
    Optional<Account> findByIdAndUserId(Long id, Long userId);

    // Find account by shareable ID
    Optional<Account> findByShareableId(String shareableId);

    // Check if account exists for user
    boolean existsByIdAndUserId(Long id, Long userId);

    // Count accounts for user
    Long countByUserId(Long userId);

    // Get total balance across all accounts for user
    @Query("SELECT SUM(a.currentBalance) FROM Account a WHERE a.user.id = :userId AND a.enabled = true")
    Double getTotalBalanceByUserId(@Param("userId") Long userId);

    // Get accounts by type
    List<Account> findByUserIdAndType(Long userId, String type);

}