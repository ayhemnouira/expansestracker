package com.example.backend.controller;

import com.example.backend.dto.account.*;
import com.example.backend.entity.User;
import com.example.backend.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @GetMapping
    public ResponseEntity<List<AccountResponseDto>> getUserAccounts(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false, defaultValue = "false") boolean enabledOnly) {

        List<AccountResponseDto> accounts = enabledOnly
                ? accountService.getEnabledAccounts(user.getId())
                : accountService.getUserAccounts(user.getId());

        return ResponseEntity.ok(accounts);
    }
    @GetMapping("/{id}")
    public ResponseEntity<AccountResponseDto> getAccountById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        AccountResponseDto account = accountService.getAccountById(id, user.getId());
        return ResponseEntity.ok(account);
    }
    @GetMapping("/share/{shareableId}")
    public ResponseEntity<AccountResponseDto> getAccountByShareableId(
            @PathVariable String shareableId) {

        AccountResponseDto account = accountService.getAccountByShareableId(shareableId);
        return ResponseEntity.ok(account);
    }
    @GetMapping("/summary")
    public ResponseEntity<AccountSummaryDto> getAccountSummary(
            @AuthenticationPrincipal User user) {

        AccountSummaryDto summary = accountService.getAccountSummary(user.getId());
        return ResponseEntity.ok(summary);
    }
    @GetMapping("/type/{type}")
    public ResponseEntity<List<AccountResponseDto>> getAccountsByType(
            @PathVariable String type,
            @AuthenticationPrincipal User user) {

        List<AccountResponseDto> accounts = accountService.getAccountsByType(user.getId(), type);
        return ResponseEntity.ok(accounts);
    }
    @PostMapping
    public ResponseEntity<AccountResponseDto> createAccount(
            @Valid @RequestBody CreateAccountRequestDto request,
            @AuthenticationPrincipal User user) {

        AccountResponseDto account = accountService.createAccount(request, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(account);
    }
    @PutMapping("/{id}")
    public ResponseEntity<AccountResponseDto> updateAccount(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAccountRequestDto request,
            @AuthenticationPrincipal User user) {

        AccountResponseDto account = accountService.updateAccount(id, request, user.getId());
        return ResponseEntity.ok(account);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        accountService.deleteAccount(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}