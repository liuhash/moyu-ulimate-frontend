package com.lby.moyuultimate.dto;

import com.lby.moyuultimate.entity.UserRole;
import java.time.LocalDateTime;

public class AuthResponse {
    
    private String token;
    private String refreshToken;
    private Long userId;
    private String username;
    private String displayName;
    private String email;
    private UserRole role;
    private Boolean isOnline;
    private LocalDateTime lastLoginTime;
    private String message;
    private Boolean success;
    
    // 构造函数
    public AuthResponse() {}
    
    public AuthResponse(Boolean success, String message) {
        this.success = success;
        this.message = message;
    }
    
    public AuthResponse(String token, Long userId, String username, Boolean success) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.success = success;
    }
    
    // Getter和Setter方法
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getRefreshToken() {
        return refreshToken;
    }
    
    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public UserRole getRole() {
        return role;
    }
    
    public void setRole(UserRole role) {
        this.role = role;
    }
    
    public Boolean getIsOnline() {
        return isOnline;
    }
    
    public void setIsOnline(Boolean isOnline) {
        this.isOnline = isOnline;
    }
    
    public LocalDateTime getLastLoginTime() {
        return lastLoginTime;
    }
    
    public void setLastLoginTime(LocalDateTime lastLoginTime) {
        this.lastLoginTime = lastLoginTime;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public Boolean getSuccess() {
        return success;
    }
    
    public void setSuccess(Boolean success) {
        this.success = success;
    }
} 