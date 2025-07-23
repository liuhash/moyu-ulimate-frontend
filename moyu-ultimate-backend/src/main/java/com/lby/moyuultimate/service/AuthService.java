package com.lby.moyuultimate.service;

import com.lby.moyuultimate.dto.AuthResponse;
import com.lby.moyuultimate.dto.LoginRequest;
import com.lby.moyuultimate.dto.RegisterRequest;
import com.lby.moyuultimate.entity.User;
import com.lby.moyuultimate.entity.UserRole;
import com.lby.moyuultimate.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtService jwtService;
    
    /**
     * 用户登录
     */
    public AuthResponse login(LoginRequest loginRequest) {
        try {
            // 查找用户
            Optional<User> userOpt = userRepository.findByUsername(loginRequest.getUsername());
            if (userOpt.isEmpty()) {
                return new AuthResponse(false, "用户名或密码错误");
            }
            
            User user = userOpt.get();
            
            // 验证密码
            if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                return new AuthResponse(false, "用户名或密码错误");
            }
            
            // 更新登录信息
            user.setIsOnline(true);
            user.setLastLoginTime(LocalDateTime.now());
            userRepository.save(user);
            
            // 生成JWT token
            String token = jwtService.generateToken(user);
            
            // 构建响应
            AuthResponse response = new AuthResponse(token, user.getId(), user.getUsername(), true);
            response.setDisplayName(user.getDisplayName());
            response.setEmail(user.getEmail());
            response.setRole(user.getRole());
            response.setIsOnline(user.getIsOnline());
            response.setLastLoginTime(user.getLastLoginTime());
            response.setMessage("登录成功");
            
            return response;
            
        } catch (Exception e) {
            return new AuthResponse(false, "登录失败：" + e.getMessage());
        }
    }
    
    /**
     * 用户注册
     */
    public AuthResponse register(RegisterRequest registerRequest) {
        try {
            // 验证密码确认
            if (!registerRequest.getPassword().equals(registerRequest.getConfirmPassword())) {
                return new AuthResponse(false, "两次输入的密码不一致");
            }
            
            // 检查用户名是否已存在
            if (userRepository.existsByUsername(registerRequest.getUsername())) {
                return new AuthResponse(false, "用户名已存在");
            }
            
            // 检查邮箱是否已存在（如果提供了邮箱）
            if (registerRequest.getEmail() != null && !registerRequest.getEmail().isEmpty()) {
                if (userRepository.existsByEmail(registerRequest.getEmail())) {
                    return new AuthResponse(false, "邮箱已被使用");
                }
            }
            
            // 创建新用户（所有用户都是普通用户）
            User user = new User();
            user.setUsername(registerRequest.getUsername());
            user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
            user.setEmail(registerRequest.getEmail());
            user.setDisplayName(registerRequest.getDisplayName() != null ? 
                registerRequest.getDisplayName() : registerRequest.getUsername());
            user.setRole(UserRole.USER); // 所有注册用户都是普通用户
            user.setIsOnline(false);
            
            // 保存用户
            User savedUser = userRepository.save(user);
            
            return new AuthResponse(true, "注册成功");
            
        } catch (Exception e) {
            return new AuthResponse(false, "注册失败：" + e.getMessage());
        }
    }
    
    /**
     * 用户登出
     */
    public AuthResponse logout(Long userId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setIsOnline(false);
                userRepository.save(user);
            }
            return new AuthResponse(true, "登出成功");
        } catch (Exception e) {
            return new AuthResponse(false, "登出失败：" + e.getMessage());
        }
    }
    
    /**
     * 验证token
     */
    public AuthResponse validateToken(String token) {
        try {
            String username = jwtService.extractUsername(token);
            Optional<User> userOpt = userRepository.findByUsername(username);
            
            if (userOpt.isPresent() && jwtService.isTokenValid(token, userOpt.get())) {
                User user = userOpt.get();
                AuthResponse response = new AuthResponse(true, "Token有效");
                response.setUserId(user.getId());
                response.setUsername(user.getUsername());
                response.setDisplayName(user.getDisplayName());
                response.setEmail(user.getEmail());
                response.setRole(user.getRole());
                response.setIsOnline(user.getIsOnline());
                return response;
            } else {
                return new AuthResponse(false, "Token无效");
            }
        } catch (Exception e) {
            return new AuthResponse(false, "Token验证失败：" + e.getMessage());
        }
    }
} 