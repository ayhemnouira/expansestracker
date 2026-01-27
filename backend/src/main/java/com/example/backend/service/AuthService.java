package com.example.backend.service;

import com.example.backend.dto.*;

public interface AuthService {
    MessageResponseDto register(RegisterRequestDto request);
    MessageResponseDto verifyEmail(VerifyEmailRequestDto request);
    AuthResponseDto login(LoginRequestDto request);
    AuthResponseDto refreshToken(String refreshToken);
    MessageResponseDto forgotPassword(ForgotPasswordRequestDto request);
    MessageResponseDto resetPassword(ResetPasswordRequestDto request);
    MessageResponseDto logout(String email);  // Changed from Long userId to String email
    MessageResponseDto validateToken(String token);  // NEW METHOD
}