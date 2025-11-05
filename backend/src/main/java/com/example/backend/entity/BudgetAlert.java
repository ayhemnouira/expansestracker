package com.example.backend.entity;

import com.example.backend.enums.AlertType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "budget_alerts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "budget_id", nullable = false)
    private Budget budget;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    private AlertType type; // THRESHOLD_REACHED, BUDGET_EXCEEDED

    private String message;

    private Boolean isRead = false;

    @Column(name = "triggered_at")
    private LocalDateTime triggeredAt;

    @CreationTimestamp
    private LocalDateTime createdAt;
}

