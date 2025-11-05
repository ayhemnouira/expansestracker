package com.example.backend.controller;

import com.example.backend.dto.transaction.CreateTransactionRequestDto;
import com.example.backend.dto.transaction.TransactionResponseDto;
import com.example.backend.dto.transaction.UpdateTransactionRequestDto;
import com.example.backend.entity.User;
import com.example.backend.service.TransactionService; // ✅ Import interface, not implementation
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public ResponseEntity<List<TransactionResponseDto>> getUserTransactions(
            @AuthenticationPrincipal User user) {
        List<TransactionResponseDto> transactions = transactionService.getUserTransactions(user.getId());
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/month")
    public ResponseEntity<List<TransactionResponseDto>> getTransactionsByMonth(
            @RequestParam int year,
            @RequestParam int month,
            @AuthenticationPrincipal User user) {

        List<TransactionResponseDto> transactions = transactionService.getTransactionsByMonth(
                user.getId(), year, month
        );
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponseDto> getTransactionById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        TransactionResponseDto transaction = transactionService.getTransactionById(id, user.getId());
        return ResponseEntity.ok(transaction);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<TransactionResponseDto>> getTransactionsByCategory(
            @PathVariable String category,
            @AuthenticationPrincipal User user) {

        List<TransactionResponseDto> transactions = transactionService.getTransactionsByCategory(
                user.getId(), category
        );
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Double>> getTransactionSummary(
            @AuthenticationPrincipal User user) {

        Double totalIncome = transactionService.getTotalIncome(user.getId());
        Double totalExpenses = transactionService.getTotalExpenses(user.getId());

        Map<String, Double> summary = new HashMap<>();
        summary.put("totalIncome", totalIncome);
        summary.put("totalExpenses", totalExpenses);
        summary.put("balance", totalIncome - totalExpenses);

        return ResponseEntity.ok(summary);
    }

    @PostMapping
    public ResponseEntity<TransactionResponseDto> createTransaction(
            @Valid @RequestBody CreateTransactionRequestDto request,
            @AuthenticationPrincipal User user) {

        TransactionResponseDto transaction = transactionService.createTransaction(request, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(transaction);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponseDto> updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTransactionRequestDto request,
            @AuthenticationPrincipal User user) {

        TransactionResponseDto transaction = transactionService.updateTransaction(id, request, user.getId());
        return ResponseEntity.ok(transaction);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        transactionService.deleteTransaction(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}