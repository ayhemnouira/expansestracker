package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "accounts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "official_name")
    private String officialName;

    @Column(nullable = false)
    private String type; // depository, credit, loan, investment

    private String subtype; // checking, savings, credit card, etc.

    @Column(name = "current_balance", nullable = false)
    private Double currentBalance;

    @Column(name = "available_balance")
    private Double availableBalance;

    private String mask; // Last 4 digits (e.g., "1234")

    @Column(name = "institution_id")
    private String institutionId;

    @Column(name = "shareable_id", unique = true)
    private String shareableId;

    @Builder.Default
    @Column(nullable = false)
    private Boolean enabled = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Relationship: One account has many transactions
    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Transaction> transactions = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (availableBalance == null) {
            availableBalance = currentBalance;
        }
        if (shareableId == null) {
            shareableId = generateShareableId();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    private String generateShareableId() {
        return "share_" + System.currentTimeMillis() + "_" + (int)(Math.random() * 1000);
    }
}