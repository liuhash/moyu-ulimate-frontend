package com.lby.moyuultimate.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class UserBanRequest {
    
    @NotNull(message = "封禁类型不能为空")
    private String banType; // "temporary" 或 "permanent"
    
    private Integer duration; // 天数，永久封禁时为null
    
    @NotBlank(message = "封禁原因不能为空")
    private String reason;
    
    // 构造函数
    public UserBanRequest() {}
    
    public UserBanRequest(String banType, Integer duration, String reason) {
        this.banType = banType;
        this.duration = duration;
        this.reason = reason;
    }
    
    // Getter和Setter方法
    public String getBanType() {
        return banType;
    }
    
    public void setBanType(String banType) {
        this.banType = banType;
    }
    
    public Integer getDuration() {
        return duration;
    }
    
    public void setDuration(Integer duration) {
        this.duration = duration;
    }
    
    public String getReason() {
        return reason;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
} 