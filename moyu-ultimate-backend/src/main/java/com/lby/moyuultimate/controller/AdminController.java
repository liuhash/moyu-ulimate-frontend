package com.lby.moyuultimate.controller;

import com.lby.moyuultimate.dto.AdminLoginRequest;
import com.lby.moyuultimate.dto.AuthResponse;
import com.lby.moyuultimate.dto.UserBanRequest;
import com.lby.moyuultimate.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AdminController {
    
    @Autowired
    private AdminService adminService;
    
    /**
     * 管理员登录
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AdminLoginRequest loginRequest) {
        AuthResponse response = adminService.login(loginRequest);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 获取所有用户列表
     */
    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getAllUsers(@RequestHeader("Authorization") String token) {
        // 移除"Bearer "前缀
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        
        Map<String, Object> response = adminService.getAllUsers(token);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 封禁用户
     */
    @PostMapping("/users/{userId}/ban")
    public ResponseEntity<AuthResponse> banUser(
            @PathVariable Long userId,
            @Valid @RequestBody UserBanRequest banRequest,
            @RequestHeader("Authorization") String token) {
        
        // 移除"Bearer "前缀
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        
        AuthResponse response = adminService.banUser(userId, banRequest, token);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 解封用户
     */
    @PostMapping("/users/{userId}/unban")
    public ResponseEntity<AuthResponse> unbanUser(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String token) {
        
        // 移除"Bearer "前缀
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        
        AuthResponse response = adminService.unbanUser(userId, token);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 删除用户
     */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<AuthResponse> deleteUser(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String token) {
        
        // 移除"Bearer "前缀
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        
        AuthResponse response = adminService.deleteUser(userId, token);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 管理员健康检查
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("管理员系统运行正常");
    }
} 