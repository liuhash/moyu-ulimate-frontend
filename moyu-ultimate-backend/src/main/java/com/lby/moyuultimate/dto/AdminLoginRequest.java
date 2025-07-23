package com.lby.moyuultimate.dto;

import jakarta.validation.constraints.NotBlank;

public class AdminLoginRequest {
    
    @NotBlank(message = "管理员用户名不能为空")
    private String username;
    
    @NotBlank(message = "管理员密码不能为空")
    private String password;
    
    @NotBlank(message = "管理员密钥不能为空")
    private String secret;
    
    // 构造函数
    public AdminLoginRequest() {}
    
    public AdminLoginRequest(String username, String password, String secret) {
        this.username = username;
        this.password = password;
        this.secret = secret;
    }
    
    // Getter和Setter方法
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public String getSecret() {
        return secret;
    }
    
    public void setSecret(String secret) {
        this.secret = secret;
    }
} 