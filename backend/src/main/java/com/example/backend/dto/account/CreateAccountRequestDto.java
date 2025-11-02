package com.example.backend.dto.account;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAccountRequestDto {

    @NotBlank(message = "Account name is required")
    @Size(min = 2, max = 100, message = "Account name must be between 2 and 100 characters")
    private String name;

    private String officialName;

    @NotBlank(message = "Account type is required")
    @Pattern(regexp = "depository|credit|loan|investment",
            message = "Type must be one of: depository, credit, loan, investment")
    private String type;

    private String subtype; // checking, savings, credit card, etc.

    @NotNull(message = "Initial balance is required")
    @DecimalMin(value = "0.0", message = "Initial balance cannot be negative")
    private Double initialBalance;

    private String mask; // Last 4 digits

    private String institutionId; // e.g., "bna_001", "stb_001"
}