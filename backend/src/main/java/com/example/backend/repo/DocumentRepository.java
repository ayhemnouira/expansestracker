package com.example.backend.repo;

import com.example.backend.entity.Document;
import com.example.backend.enums.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    // Find all documents for a user (not deleted)
    List<Document> findByUserIdAndIsDeletedFalseOrderByUploadedAtDesc(Long userId);

    // Find documents by type
    List<Document> findByUserIdAndDocumentTypeAndIsDeletedFalseOrderByUploadedAtDesc(
            Long userId, DocumentType type);

    // Find a specific document (with security check)
    Optional<Document> findByIdAndUserIdAndIsDeletedFalse(Long id, Long userId);

    // Find documents by transaction
    List<Document> findByTransactionIdAndIsDeletedFalseOrderByUploadedAtDesc(Long transactionId);

    // Find documents by date range
    @Query("SELECT d FROM Document d WHERE d.user.id = :userId " +
            "AND d.isDeleted = false " +
            "AND d.uploadedAt BETWEEN :startDate AND :endDate " +
            "ORDER BY d.uploadedAt DESC")
    List<Document> findByUserAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Count documents for a user
    long countByUserIdAndIsDeletedFalse(Long userId);
}