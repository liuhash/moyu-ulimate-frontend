package com.lby.moyuultimate.controller;

import com.lby.moyuultimate.dto.AuthResponse;
import com.lby.moyuultimate.dto.LoginRequest;
import com.lby.moyuultimate.dto.RegisterRequest;
import com.lby.moyuultimate.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    /**
     * 用户登录
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 用户注册
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        AuthResponse response = authService.register(registerRequest);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 用户登出
     */
    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout(HttpServletRequest request) {
        // 从请求头中获取用户ID（实际项目中应该从JWT token中解析）
        String userIdStr = request.getHeader("X-User-ID");
        Long userId = null;
        if (userIdStr != null) {
            try {
                userId = Long.parseLong(userIdStr);
            } catch (NumberFormatException e) {
                // 忽略错误
            }
        }
        
        AuthResponse response = authService.logout(userId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 验证token
     */
    @PostMapping("/validate")
    public ResponseEntity<AuthResponse> validateToken(@RequestHeader("Authorization") String token) {
        // 移除"Bearer "前缀
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        
        AuthResponse response = authService.validateToken(token);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 健康检查
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("魔域终极版后端服务运行正常");
    }
} 