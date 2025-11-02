package com.example.backend.service;

import com.example.backend.dto.transaction.CreateTransactionRequestDto;
import com.example.backend.dto.transaction.TransactionResponseDto;
import com.example.backend.dto.transaction.UpdateTransactionRequestDto;

import java.util.List;
public interface TransactionService {
    List<TransactionResponseDto> getUserTransactions(Long userId);
    List<TransactionResponseDto> getTransactionsByMonth(Long userId, int year, int month);
    TransactionResponseDto getTransactionById(Long transactionId, Long userId);
    TransactionResponseDto createTransaction(CreateTransactionRequestDto request, Long userId);
    TransactionResponseDto updateTransaction(Long transactionId, UpdateTransactionRequestDto request, Long userId);
    void deleteTransaction(Long transactionId, Long userId);
    List<TransactionResponseDto> getTransactionsByCategory(Long userId, String category);
    Double getTotalIncome(Long userId);
    Double getTotalExpenses(Long userId);
}