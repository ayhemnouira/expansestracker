package com.example.backend.service.impl;

import com.example.backend.dto.AuthResponseDto;
import com.example.backend.dto.LoginRequestDto;
import com.example.backend.dto.RegisterRequestDto;
import com.example.backend.dto.UserDto;
import com.example.backend.entity.User;
import com.example.backend.enums.Role;
import com.example.backend.repo.UserRepo;
import com.example.backend.service.AuthService;
import com.example.backend.util.JwtTokenUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {
    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;
    // Constructor with both dependencies?
    public AuthServiceImpl(UserRepo userRepo, PasswordEncoder passwordEncoder,JwtTokenUtil jwtTokenUtil) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenUtil = jwtTokenUtil;
    }
    @Override
    public AuthResponseDto login(LoginRequestDto loginRequestDto) {
        String email = loginRequestDto.getEmail();

        // 1. Find user by email
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));


        // 2. Verify password
        if (!passwordEncoder.matches(loginRequestDto.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        // 3. Return DTO
        String accessToken = jwtTokenUtil.generateAccessToken(user.getEmail());
        String refreshToken = jwtTokenUtil.generateRefreshToken(user.getEmail());

        return new AuthResponseDto(
                new UserDto(user),
                accessToken,
                refreshToken
        );
    }


    @Override
    public AuthResponseDto register(RegisterRequestDto registerRequestDto) {

        String email = registerRequestDto.getEmail();
        if(userRepo.existsByEmail(email)){
            throw new IllegalArgumentException("Email already in use");
        }
        User user = new User();
        user.setEmail(registerRequestDto.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequestDto.getPassword()));
        user.setRole(Role.USER);
        user.setUsername(registerRequestDto.getUsername());
        User savedUser = userRepo.save(user);
        String accessToken = jwtTokenUtil.generateAccessToken(savedUser.getEmail());
        String refreshToken = jwtTokenUtil.generateRefreshToken(savedUser.getEmail());

        // Return response with tokens
        return new AuthResponseDto(
                new UserDto(savedUser),
                accessToken,
                refreshToken
        );
    }

    @Override
    public AuthResponseDto refreshToken(String refreshToken) {
        if (!jwtTokenUtil.validateToken(refreshToken)) {
            throw new IllegalArgumentException("Invalid refresh token");
        }

        String email = jwtTokenUtil.getUsernameFromToken(refreshToken);
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Generate new access token
        String newAccessToken = jwtTokenUtil.generateAccessToken(email);

        return new AuthResponseDto(
                new UserDto(user),
                newAccessToken,
                refreshToken  // Keep same refresh token
        );
    }
}
