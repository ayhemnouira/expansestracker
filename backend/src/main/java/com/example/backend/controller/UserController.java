package com.example.backend.controller;

import com.example.backend.dto.UserDto;
import com.example.backend.entity.User;
import com.example.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getCurrentUserProfile(Authentication authentication) {
        try {
            String email = authentication.getName();
            log.info("Fetching profile for user: {}", email);

            User user = userService.findByEmail(email);

            if (user == null) {
                log.error("User not found: {}", email);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "error", "User not found"
                ));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("user", new UserDto(user));

            log.info("Profile fetched successfully for user: {}", user.getId());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error getting user profile: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Failed to get user profile",
                    "message", e.getMessage()
            ));
        }
    }
}