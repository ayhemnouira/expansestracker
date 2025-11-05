package com.example.backend.entity;

import com.example.backend.enums.BudgetPeriod;
import com.example.backend.enums.BudgetStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "budgets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank
    @Column(length = 50)
    private String category;

    @NotNull
    @DecimalMin(value = "0.01", message = "Amount must be positive")
    @Column(precision = 10, scale = 2)
    private BigDecimal amount;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private BudgetPeriod period;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    @Min(0)
    @Max(100)
    private Integer alertThreshold = 80;

    private Boolean isActive = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Calculated field (not stored in DB)
    @Transient
    private BigDecimal spent;

    @Transient
    private BigDecimal remaining;

    @Transient
    private Double percentageUsed;

    @Transient
    private BudgetStatus status;
}