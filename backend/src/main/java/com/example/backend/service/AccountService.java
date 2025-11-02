package com.example.backend.service;

import com.example.backend.dto.account.*;

import java.util.List;

public interface AccountService {
    List<AccountResponseDto> getUserAccounts(Long userId);
    List<AccountResponseDto> getEnabledAccounts(Long userId);
    AccountResponseDto getAccountById(Long accountId, Long userId);
    AccountResponseDto getAccountByShareableId(String shareableId);
    AccountResponseDto createAccount(CreateAccountRequestDto request, Long userId);
    AccountResponseDto updateAccount(Long accountId, UpdateAccountRequestDto request, Long userId);
    void deleteAccount(Long accountId, Long userId);
    AccountSummaryDto getAccountSummary(Long userId);
    List<AccountResponseDto> getAccountsByType(Long userId, String type);
}