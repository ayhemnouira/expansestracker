package com.example.backend.service.impl;

import com.example.backend.dto.account.*;
import com.example.backend.entity.Account;

import com.example.backend.entity.User;
import com.example.backend.enums.TransactionType;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.exception.UnauthorizedException;

import com.example.backend.repo.AccountRepository;
import com.example.backend.repo.TransactionRepository;
import com.example.backend.repo.UserRepo;
import com.example.backend.service.AccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final UserRepo userRepository;
    private final TransactionRepository transactionRepository;

    @Override
    public List<AccountResponseDto> getUserAccounts(Long userId) {
        log.info("Fetching all accounts for user: {}", userId);

        return accountRepository.findByUserId(userId)
                .stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AccountResponseDto> getEnabledAccounts(Long userId) {
        log.info("Fetching enabled accounts for user: {}", userId);

        return accountRepository.findByUserIdAndEnabledTrue(userId)
                .stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public AccountResponseDto getAccountById(Long accountId, Long userId) {
        log.info("Fetching account: {} for user: {}", accountId, userId);

        Account account = accountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Account not found with id: " + accountId
                ));

        return convertToResponseDto(account);
    }

    @Override
    public AccountResponseDto getAccountByShareableId(String shareableId) {
        log.info("Fetching account by shareable ID: {}", shareableId);

        Account account = accountRepository.findByShareableId(shareableId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Account not found with shareable ID: " + shareableId
                ));

        return convertToResponseDto(account);
    }

    @Override
    @Transactional
    public AccountResponseDto createAccount(CreateAccountRequestDto request, Long userId) {
        log.info("Creating account for user: {}", userId);

        // Get user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Create account
        Account account = Account.builder()
                .name(request.getName())
                .officialName(request.getOfficialName())
                .type(request.getType())
                .subtype(request.getSubtype())
                .currentBalance(request.getInitialBalance())
                .availableBalance(request.getInitialBalance())
                .mask(request.getMask())
                .institutionId(request.getInstitutionId())
                .enabled(true)
                .user(user)
                .build();

        Account savedAccount = accountRepository.save(account);

        log.info("Account created successfully with id: {}", savedAccount.getId());
        return convertToResponseDto(savedAccount);
    }

    @Override
    @Transactional
    public AccountResponseDto updateAccount(
            Long accountId,
            UpdateAccountRequestDto request,
            Long userId) {

        log.info("Updating account: {} for user: {}", accountId, userId);

        // Find account with security check
        Account account = accountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Account not found with id: " + accountId
                ));

        // Update fields
        account.setName(request.getName());
        account.setOfficialName(request.getOfficialName());
        account.setSubtype(request.getSubtype());
        account.setMask(request.getMask());

        if (request.getEnabled() != null) {
            account.setEnabled(request.getEnabled());
        }

        Account updatedAccount = accountRepository.save(account);

        log.info("Account updated successfully: {}", accountId);
        return convertToResponseDto(updatedAccount);
    }

    @Override
    @Transactional
    public void deleteAccount(Long accountId, Long userId) {
        log.info("Deleting account: {} for user: {}", accountId, userId);

        // Find account with security check
        Account account = accountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Account not found with id: " + accountId
                ));

        // Check if account has transactions
        if (!account.getTransactions().isEmpty()) {
            // Soft delete - just disable the account
            account.setEnabled(false);
            accountRepository.save(account);
            log.info("Account disabled (has transactions): {}", accountId);
        } else {
            // Hard delete - no transactions
            accountRepository.delete(account);
            log.info("Account deleted permanently: {}", accountId);
        }
    }

    @Override
    public AccountSummaryDto getAccountSummary(Long userId) {
        log.info("Calculating account summary for user: {}", userId);

        Long totalAccounts = accountRepository.countByUserId(userId);
        Double totalBalance = accountRepository.getTotalBalanceByUserId(userId);

        // Get transaction totals
        Double totalIncome = transactionRepository.getTotalByType(userId, TransactionType.INCOME);
        Double totalExpenses = transactionRepository.getTotalByType(userId, TransactionType.EXPENSE);

        return AccountSummaryDto.builder()
                .totalAccounts(totalAccounts != null ? totalAccounts.intValue() : 0)
                .totalBalance(totalBalance != null ? totalBalance : 0.0)
                .totalIncome(totalIncome != null ? totalIncome : 0.0)
                .totalExpenses(totalExpenses != null ? totalExpenses : 0.0)
                .build();
    }

    @Override
    public List<AccountResponseDto> getAccountsByType(Long userId, String type) {
        log.info("Fetching {} accounts for user: {}", type, userId);

        return accountRepository.findByUserIdAndType(userId, type)
                .stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Helper: Convert Account entity to DTO
     */
    private AccountResponseDto convertToResponseDto(Account account) {
        return AccountResponseDto.builder()
                .id(account.getId())
                .name(account.getName())
                .officialName(account.getOfficialName())
                .type(account.getType())
                .subtype(account.getSubtype())
                .currentBalance(account.getCurrentBalance())
                .availableBalance(account.getAvailableBalance())
                .mask(account.getMask())
                .institutionId(account.getInstitutionId())
                .shareableId(account.getShareableId())
                .enabled(account.getEnabled())
                .transactionCount(account.getTransactions().size())
                .build();
    }
}