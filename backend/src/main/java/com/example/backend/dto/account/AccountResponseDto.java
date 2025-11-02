package com.example.backend.dto.account;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountResponseDto {
    private Long id;
    private String name;
    private String officialName;
    private String type;
    private String subtype;
    private Double currentBalance;
    private Double availableBalance;
    private String mask;
    private String institutionId;
    private String shareableId;
    private Boolean enabled;
    private Integer transactionCount; // Number of transactions
}