package com.lby.moyuultimate.repository;

import com.lby.moyuultimate.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {
    
    /**
     * 根据用户名查找管理员
     */
    Optional<Admin> findByUsername(String username);
    
    /**
     * 检查管理员用户名是否存在
     */
    boolean existsByUsername(String username);
    
    /**
     * 根据用户名和激活状态查找管理员
     */
    Optional<Admin> findByUsernameAndIsActiveTrue(String username);
} 