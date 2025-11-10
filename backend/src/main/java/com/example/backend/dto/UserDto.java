package com.example.backend.dto;
import com.example.backend.entity.User;
import com.example.backend.enums.Role;
import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String role;  // ← CHANGE THIS TO String, NOT Role

    public UserDto(User user) {
        this.id = user.getId();
        this.username = user.getDisplayUsername();
        this.email = user.getEmail();
        this.role = user.getRole().name();  // ← This returns String, so field must be String
    }
}