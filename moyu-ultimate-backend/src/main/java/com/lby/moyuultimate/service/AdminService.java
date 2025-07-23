package com.lby.moyuultimate.service;

import com.lby.moyuultimate.dto.AdminLoginRequest;
import com.lby.moyuultimate.dto.AuthResponse;
import com.lby.moyuultimate.dto.UserBanRequest;
import com.lby.moyuultimate.entity.Admin;
import com.lby.moyuultimate.entity.User;
import com.lby.moyuultimate.entity.UserBan;
import com.lby.moyuultimate.entity.BanType;
import com.lby.moyuultimate.repository.AdminRepository;
import com.lby.moyuultimate.repository.UserRepository;
import com.lby.moyuultimate.repository.UserBanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AdminService {
    
    @Autowired
    private AdminRepository adminRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserBanRepository userBanRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtService jwtService;
    
    /**
     * 管理员登录
     */
    public AuthResponse login(AdminLoginRequest loginRequest) {
        try {
            // 查找管理员
            Optional<Admin> adminOpt = adminRepository.findByUsername(loginRequest.getUsername());
            if (adminOpt.isEmpty()) {
                return new AuthResponse(false, "管理员账号或密码错误");
            }
            
            Admin admin = adminOpt.get();
            
            // 验证密码
            if (!passwordEncoder.matches(loginRequest.getPassword(), admin.getPassword())) {
                return new AuthResponse(false, "管理员账号或密码错误");
            }
            
            // 验证管理员密钥
            if (!admin.getAdminSecret().equals(loginRequest.getSecret())) {
                return new AuthResponse(false, "管理员密钥错误");
            }
            
            // 检查管理员是否激活
            if (!admin.getIsActive()) {
                return new AuthResponse(false, "管理员账号已被禁用");
            }
            
            // 更新登录时间
            admin.setLastLoginTime(LocalDateTime.now());
            adminRepository.save(admin);
            
            // 生成管理员JWT token
            String token = jwtService.generateAdminToken(admin);
            
            // 构建响应
            AuthResponse response = new AuthResponse(token, admin.getId(), admin.getUsername(), true);
            response.setDisplayName(admin.getDisplayName());
            response.setMessage("管理员登录成功");
            
            return response;
            
        } catch (Exception e) {
            return new AuthResponse(false, "管理员登录失败：" + e.getMessage());
        }
    }
    
    /**
     * 获取所有用户列表
     */
    public Map<String, Object> getAllUsers(String token) {
        try {
            // 验证管理员token
            if (!jwtService.isAdminTokenValid(token)) {
                throw new Exception("无效的管理员token");
            }
            
            List<User> users = userRepository.findAll();
            
            // 为每个用户添加封禁状态
            for (User user : users) {
                Optional<UserBan> activeBan = userBanRepository.findActiveBanByUserId(user.getId());
                user.setIsBanned(activeBan.isPresent());
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("users", users);
            response.put("total", users.size());
            response.put("online", users.stream().filter(u -> u.getIsOnline() && !u.getIsBanned()).count());
            response.put("banned", users.stream().filter(u -> u.getIsBanned()).count());
            
            return response;
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return errorResponse;
        }
    }
    
    /**
     * 封禁用户
     */
    public AuthResponse banUser(Long userId, UserBanRequest banRequest, String token) {
        try {
            // 验证管理员token
            if (!jwtService.isAdminTokenValid(token)) {
                return new AuthResponse(false, "无效的管理员token");
            }
            
            // 获取管理员信息
            Long adminId = jwtService.extractAdminId(token);
            Optional<Admin> adminOpt = adminRepository.findById(adminId);
            if (adminOpt.isEmpty()) {
                return new AuthResponse(false, "管理员不存在");
            }
            
            // 获取用户信息
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return new AuthResponse(false, "用户不存在");
            }
            
            User user = userOpt.get();
            Admin admin = adminOpt.get();
            
            // 检查是否已经封禁
            Optional<UserBan> existingBan = userBanRepository.findActiveBanByUserId(userId);
            if (existingBan.isPresent()) {
                return new AuthResponse(false, "用户已被封禁");
            }
            
            // 创建封禁记录
            UserBan userBan = new UserBan();
            userBan.setUser(user);
            userBan.setAdmin(admin);
            userBan.setBanReason(banRequest.getReason());
            
            if ("permanent".equals(banRequest.getBanType())) {
                userBan.setBanType(BanType.PERMANENT);
                userBan.setBanDuration(null);
            } else {
                userBan.setBanType(BanType.TEMPORARY);
                userBan.setBanDuration(banRequest.getDuration());
            }
            
            userBanRepository.save(userBan);
            
            return new AuthResponse(true, "用户封禁成功");
            
        } catch (Exception e) {
            return new AuthResponse(false, "封禁用户失败：" + e.getMessage());
        }
    }
    
    /**
     * 解封用户
     */
    public AuthResponse unbanUser(Long userId, String token) {
        try {
            // 验证管理员token
            if (!jwtService.isAdminTokenValid(token)) {
                return new AuthResponse(false, "无效的管理员token");
            }
            
            // 查找活跃的封禁记录
            Optional<UserBan> banOpt = userBanRepository.findActiveBanByUserId(userId);
            if (banOpt.isEmpty()) {
                return new AuthResponse(false, "用户未被封禁");
            }
            
            UserBan userBan = banOpt.get();
            userBan.setIsActive(false);
            userBanRepository.save(userBan);
            
            return new AuthResponse(true, "用户解封成功");
            
        } catch (Exception e) {
            return new AuthResponse(false, "解封用户失败：" + e.getMessage());
        }
    }
    
    /**
     * 删除用户
     */
    public AuthResponse deleteUser(Long userId, String token) {
        try {
            // 验证管理员token
            if (!jwtService.isAdminTokenValid(token)) {
                return new AuthResponse(false, "无效的管理员token");
            }
            
            // 检查用户是否存在
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return new AuthResponse(false, "用户不存在");
            }
            
            // 删除用户相关的封禁记录
            userBanRepository.deleteByUserId(userId);
            
            // 删除用户
            userRepository.deleteById(userId);
            
            return new AuthResponse(true, "用户删除成功");
            
        } catch (Exception e) {
            return new AuthResponse(false, "删除用户失败：" + e.getMessage());
        }
    }
}

 