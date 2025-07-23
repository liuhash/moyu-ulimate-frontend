package com.lby.moyuultimate.entity;

import jakarta.persistence.*;
import com.lby.moyuultimate.entity.BanType;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_bans")
public class UserBan {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "admin_id", nullable = false)
    private Admin admin;
    
    @Column(name = "ban_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private BanType banType;
    
    @Column(name = "ban_reason", nullable = false)
    private String banReason;
    
    @Column(name = "ban_duration")
    private Integer banDuration; // 天数，永久封禁为null
    
    @Column(name = "ban_start_time", nullable = false)
    private LocalDateTime banStartTime;
    
    @Column(name = "ban_end_time")
    private LocalDateTime banEndTime; // 永久封禁为null
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        banStartTime = LocalDateTime.now();
        
        // 计算结束时间
        if (banType == BanType.TEMPORARY && banDuration != null) {
            banEndTime = banStartTime.plusDays(banDuration);
        }
        // 永久封禁的banEndTime为null
    }
    
    // 构造函数
    public UserBan() {}
    
    public UserBan(User user, Admin admin, BanType banType, String banReason, Integer banDuration) {
        this.user = user;
        this.admin = admin;
        this.banType = banType;
        this.banReason = banReason;
        this.banDuration = banDuration;
    }
    
    // 检查是否已过期
    public boolean isExpired() {
        if (banType == BanType.PERMANENT) {
            return false; // 永久封禁永不过期
        }
        return banEndTime != null && LocalDateTime.now().isAfter(banEndTime);
    }
    
    // Getter和Setter方法
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public Admin getAdmin() {
        return admin;
    }
    
    public void setAdmin(Admin admin) {
        this.admin = admin;
    }
    
    public BanType getBanType() {
        return banType;
    }
    
    public void setBanType(BanType banType) {
        this.banType = banType;
    }
    
    public String getBanReason() {
        return banReason;
    }
    
    public void setBanReason(String banReason) {
        this.banReason = banReason;
    }
    
    public Integer getBanDuration() {
        return banDuration;
    }
    
    public void setBanDuration(Integer banDuration) {
        this.banDuration = banDuration;
    }
    
    public LocalDateTime getBanStartTime() {
        return banStartTime;
    }
    
    public void setBanStartTime(LocalDateTime banStartTime) {
        this.banStartTime = banStartTime;
    }
    
    public LocalDateTime getBanEndTime() {
        return banEndTime;
    }
    
    public void setBanEndTime(LocalDateTime banEndTime) {
        this.banEndTime = banEndTime;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

 