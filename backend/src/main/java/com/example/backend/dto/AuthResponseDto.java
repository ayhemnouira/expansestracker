package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDto {
    private UserDto user;
    private String accessToken;
    private String refreshToken;
    private Boolean requires2FA;
    private String twoFactorId;

    public AuthResponseDto(UserDto user, String accessToken, String refreshToken) {
        this.user = user;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.requires2FA = false;
    }
}