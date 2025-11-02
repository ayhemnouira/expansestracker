package com.example.backend.dto.transaction;

import com.example.backend.enums.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponseDto {
    private Long id;
    private String name;
    private Double amount;
    private LocalDate date;
    private String category;
    private TransactionType type;
    private Long accountId;
    private String accountName;
}