package com.example.backend.enums;

public enum BudgetStatus {
    SAFE,        // < 80%
    WARNING,     // 80-99%
    EXCEEDED,    // >= 100%
    INACTIVE
}
