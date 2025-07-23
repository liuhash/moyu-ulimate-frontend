package com.lby.moyuultimate.repository;

import com.lby.moyuultimate.entity.UserBan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserBanRepository extends JpaRepository<UserBan, Long> {
    
    /**
     * 查找用户的活跃封禁记录
     */
    @Query("SELECT ub FROM UserBan ub WHERE ub.user.id = :userId AND ub.isActive = true")
    Optional<UserBan> findActiveBanByUserId(@Param("userId") Long userId);
    
    /**
     * 查找用户的所有封禁记录
     */
    @Query("SELECT ub FROM UserBan ub WHERE ub.user.id = :userId ORDER BY ub.createdAt DESC")
    List<UserBan> findAllByUserId(@Param("userId") Long userId);
    
    /**
     * 查找所有活跃的封禁记录
     */
    @Query("SELECT ub FROM UserBan ub WHERE ub.isActive = true")
    List<UserBan> findAllActiveBans();
    
    /**
     * 删除用户的所有封禁记录
     */
    @Modifying
    @Query("DELETE FROM UserBan ub WHERE ub.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
    
    /**
     * 查找已过期的临时封禁记录
     */
    @Query("SELECT ub FROM UserBan ub WHERE ub.banType = 'TEMPORARY' AND ub.isActive = true AND ub.banEndTime < CURRENT_TIMESTAMP")
    List<UserBan> findExpiredTemporaryBans();
} 