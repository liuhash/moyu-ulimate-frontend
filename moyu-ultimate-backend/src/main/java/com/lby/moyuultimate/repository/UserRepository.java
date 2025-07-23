package com.lby.moyuultimate.repository;

import com.lby.moyuultimate.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * 根据用户名查找用户
     */
    Optional<User> findByUsername(String username);
    
    /**
     * 根据邮箱查找用户
     */
    Optional<User> findByEmail(String email);
    
    /**
     * 检查用户名是否存在
     */
    boolean existsByUsername(String username);
    
    /**
     * 检查邮箱是否存在
     */
    boolean existsByEmail(String email);
    
    /**
     * 查找在线用户
     */
    List<User> findByIsOnlineTrue();
    
    /**
     * 根据角色查找用户
     */
    List<User> findByRole(com.lby.moyuultimate.entity.UserRole role);
    
    /**
     * 查找最近登录的用户
     */
    @Query("SELECT u FROM User u WHERE u.lastLoginTime IS NOT NULL ORDER BY u.lastLoginTime DESC")
    List<User> findRecentUsers();
    
    /**
     * 根据用户名模糊查询
     */
    @Query("SELECT u FROM User u WHERE u.username LIKE %:keyword% OR u.displayName LIKE %:keyword%")
    List<User> searchUsers(@Param("keyword") String keyword);
} 