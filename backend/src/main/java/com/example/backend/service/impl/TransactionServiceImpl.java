package com.example.backend.service.impl;

import com.example.backend.dto.transaction.CreateTransactionRequestDto;
import com.example.backend.dto.transaction.TransactionResponseDto;
import com.example.backend.dto.transaction.UpdateTransactionRequestDto;
import com.example.backend.entity.Account;
import com.example.backend.entity.Transaction;
import com.example.backend.entity.User;
import com.example.backend.enums.TransactionType;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.exception.UnauthorizedException;
import com.example.backend.repo.AccountRepository;
import com.example.backend.repo.TransactionRepository;
import com.example.backend.repo.UserRepo;
import com.example.backend.service.BudgetAlertService;
import com.example.backend.service.TransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final UserRepo userRepository;
    private final BudgetAlertService budgetAlertService;

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponseDto> getUserTransactions(Long userId) {
        log.info("Fetching all transactions for user: {}", userId);

        return transactionRepository.findByUserIdOrderByDateDesc(userId)
                .stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponseDto> getTransactionsByMonth(Long userId, int year, int month) {
        log.info("Fetching transactions for user: {} - {}/{}", userId, year, month);

        // Validate month
        if (month < 1 || month > 12) {
            throw new IllegalArgumentException("Month must be between 1 and 12");
        }

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        return transactionRepository
                .findByUserIdAndDateBetweenOrderByDateDesc(userId, startDate, endDate)
                .stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TransactionResponseDto getTransactionById(Long transactionId, Long userId) {
        log.info("Fetching transaction: {} for user: {}", transactionId, userId);

        Transaction transaction = transactionRepository.findByIdAndUserId(transactionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Transaction not found with id: " + transactionId
                ));

        return convertToResponseDto(transaction);
    }

    @Override
    @Transactional
    public TransactionResponseDto createTransaction(CreateTransactionRequestDto request, Long userId) {
        log.info("Creating transaction for user: {}", userId);

        // Validate and get account
        Account account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Account not found with id: " + request.getAccountId()
                ));

        // Security check: Ensure account belongs to user
        if (!account.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You don't have permission to use this account");
        }

        // Get user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Create transaction
        Transaction transaction = Transaction.builder()
                .name(request.getName())
                .amount(request.getAmount())
                .date(request.getDate())
                .category(request.getCategory())
                .type(request.getType())
                .account(account)
                .user(user)
                .build();

        // Update account balance
        updateAccountBalance(account, request.getAmount(), request.getType(), true);

        // Save transaction
        Transaction savedTransaction = transactionRepository.save(transaction);

        // 🔥 TRIGGER BUDGET ALERTS (ONLY FOR EXPENSES)
        if (request.getType() == TransactionType.EXPENSE) {
            log.debug("Checking budgets after expense creation for category: {}", request.getCategory());
            try {
                budgetAlertService.checkBudgetForCategory(userId, request.getCategory());
            } catch (Exception e) {
                // Don't fail transaction if alert check fails
                log.error("Failed to check budget alerts after transaction creation", e);
            }
        }

        log.info("Transaction created successfully with id: {}", savedTransaction.getId());
        return convertToResponseDto(savedTransaction);
    }

    @Override
    @Transactional
    public TransactionResponseDto updateTransaction(
            Long transactionId,
            UpdateTransactionRequestDto request,
            Long userId) {

        log.info("Updating transaction: {} for user: {}", transactionId, userId);

        // Find transaction with security check
        Transaction transaction = transactionRepository.findByIdAndUserId(transactionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Transaction not found with id: " + transactionId
                ));

        Account account = transaction.getAccount();

        // Store old values for alert checking
        String oldCategory = transaction.getCategory();
        TransactionType oldType = transaction.getType();

        // Reverse old balance change
        updateAccountBalance(account, transaction.getAmount(), transaction.getType(), false);

        // Update transaction fields
        transaction.setName(request.getName());
        transaction.setAmount(request.getAmount());
        transaction.setDate(request.getDate());
        transaction.setCategory(request.getCategory());
        transaction.setType(request.getType());

        // Apply new balance change
        updateAccountBalance(account, request.getAmount(), request.getType(), true);

        // Save
        Transaction updatedTransaction = transactionRepository.save(transaction);

        // 🔥 TRIGGER BUDGET ALERTS AFTER UPDATE
        // Check both old and new categories if they're different and expenses
        try {
            if (oldType == TransactionType.EXPENSE) {
                log.debug("Checking old category budget: {}", oldCategory);
                budgetAlertService.checkBudgetForCategory(userId, oldCategory);
            }

            if (request.getType() == TransactionType.EXPENSE &&
                    !request.getCategory().equals(oldCategory)) {
                log.debug("Checking new category budget: {}", request.getCategory());
                budgetAlertService.checkBudgetForCategory(userId, request.getCategory());
            }
        } catch (Exception e) {
            log.error("Failed to check budget alerts after transaction update", e);
        }

        log.info("Transaction updated successfully: {}", transactionId);
        return convertToResponseDto(updatedTransaction);
    }

    @Override
    @Transactional
    public void deleteTransaction(Long transactionId, Long userId) {
        log.info("Deleting transaction: {} for user: {}", transactionId, userId);

        // Find transaction with security check
        Transaction transaction = transactionRepository.findByIdAndUserId(transactionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Transaction not found with id: " + transactionId
                ));

        // Store category before deletion
        String category = transaction.getCategory();
        TransactionType type = transaction.getType();

        // Reverse balance change
        Account account = transaction.getAccount();
        updateAccountBalance(account, transaction.getAmount(), transaction.getType(), false);

        // Delete transaction
        transactionRepository.delete(transaction);

        // 🔥 TRIGGER BUDGET ALERTS AFTER DELETION
        // Budget might go from EXCEEDED back to WARNING or SAFE
        if (type == TransactionType.EXPENSE) {
            log.debug("Checking budget after expense deletion for category: {}", category);
            try {
                budgetAlertService.checkBudgetForCategory(userId, category);
            } catch (Exception e) {
                log.error("Failed to check budget alerts after transaction deletion", e);
            }
        }

        log.info("Transaction deleted successfully: {}", transactionId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponseDto> getTransactionsByCategory(Long userId, String category) {
        log.info("Fetching transactions for user: {} in category: {}", userId, category);

        return transactionRepository.findByUserIdAndCategoryOrderByDateDesc(userId, category)
                .stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Double getTotalIncome(Long userId) {
        log.info("Calculating total income for user: {}", userId);

        Double total = transactionRepository.getTotalByType(userId, TransactionType.INCOME);
        return total != null ? total : 0.0;
    }

    @Override
    @Transactional(readOnly = true)
    public Double getTotalExpenses(Long userId) {
        log.info("Calculating total expenses for user: {}", userId);

        Double total = transactionRepository.getTotalByType(userId, TransactionType.EXPENSE);
        return total != null ? total : 0.0;
    }

    /**
     * Helper method: Update account balance based on transaction type
     * @param account The account to update
     * @param amount The transaction amount
     * @param type The transaction type (INCOME/EXPENSE)
     * @param isAdding True if adding transaction, false if removing
     */
    private void updateAccountBalance(Account account, Double amount, TransactionType type, boolean isAdding) {
        Double currentBalance = account.getCurrentBalance();

        if (isAdding) {
            // Adding new transaction
            if (type == TransactionType.INCOME) {
                account.setCurrentBalance(currentBalance + amount);
            } else {
                account.setCurrentBalance(currentBalance - amount);
            }
        } else {
            // Removing/reversing transaction
            if (type == TransactionType.INCOME) {
                account.setCurrentBalance(currentBalance - amount);
            } else {
                account.setCurrentBalance(currentBalance + amount);
            }
        }

        accountRepository.save(account);
        log.debug("Updated account {} balance to: {}", account.getId(), account.getCurrentBalance());
    }

    /**
     * Helper method: Convert Transaction entity to DTO
     * Fixed: Accesses account properties within @Transactional boundary
     * @param transaction The transaction entity
     * @return TransactionResponseDto
     */
    private TransactionResponseDto convertToResponseDto(Transaction transaction) {
        // Access account properties while session is still open
        Account account = transaction.getAccount();

        return TransactionResponseDto.builder()
                .id(transaction.getId())
                .name(transaction.getName())
                .amount(transaction.getAmount())
                .date(transaction.getDate())
                .category(transaction.getCategory())
                .type(transaction.getType())
                .accountId(account.getId())
                .accountName(account.getName())
                .build();
    }
}