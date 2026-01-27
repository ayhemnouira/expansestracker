package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class Verify2FARequestDto {
    @NotBlank(message = "OTP session ID is required")
    private String id;

    @NotBlank(message = "OTP code is required")
    private String otp;
}