-- 魔域终极版数据库初始化脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS moyu_game 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE moyu_game;

-- 创建用户表（由JPA自动创建，这里只是参考）
-- CREATE TABLE users (
--     id BIGINT AUTO_INCREMENT PRIMARY KEY,
--     username VARCHAR(50) NOT NULL UNIQUE,
--     password VARCHAR(255) NOT NULL,
--     email VARCHAR(100) UNIQUE,
--     display_name VARCHAR(100),
--     avatar_url VARCHAR(255),
--     user_role VARCHAR(20) DEFAULT 'USER',
--     is_online BOOLEAN DEFAULT FALSE,
--     last_login_time DATETIME,
--     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );

-- 插入测试用户（密码是BCrypt加密后的"123456"）
-- 注意：实际使用时，密码应该通过应用注册功能创建
INSERT INTO users (username, password, display_name, user_role, is_online, created_at, updated_at) 
VALUES 
('testuser', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', '测试用户', 'USER', false, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- 插入管理员账号（密码是BCrypt加密后的"admin123"，密钥是"moyu2025"）
INSERT INTO admins (username, password, admin_secret, display_name, is_active, created_at, updated_at) 
VALUES 
('admin', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOe6g7pfO8VqZxH3YzH3YzH3YzH3YzH3Y', 'moyu2025', '系统管理员', true, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- 查看创建的用户
SELECT id, username, display_name, user_role, is_online, created_at FROM users; 