# 魔域终极版 - 后端服务

这是魔域终极版游戏的Java后端服务，提供用户认证、游戏数据管理、管理员功能等API服务。

## 功能特性

- 🔐 JWT用户认证系统
- 👥 用户管理（注册、登录、资料管理）
- 🛡️ 管理员系统（登录、用户管理、封禁管理）
- 🎮 游戏数据管理
- 📊 数据统计和分析
- 🔒 安全权限控制

## 技术栈

- **框架**: Spring Boot 3.x
- **数据库**: MySQL 8.0
- **认证**: JWT (JSON Web Token)
- **构建工具**: Maven
- **Java版本**: 20
- **安全**: Spring Security

## 快速开始

### 环境要求

- Java 20+
- MySQL 8.0+
- Maven 3.6+

### 数据库配置

1. 创建数据库：
```sql
CREATE DATABASE moyu_game CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 修改数据库连接配置（`src/main/resources/application.properties`）：
```properties
spring.datasource.username=你的MySQL用户名
spring.datasource.password=你的MySQL密码
```

### 启动服务

```bash
# 使用Maven启动
mvn spring-boot:run

# 或者先构建再运行
mvn clean package
java -jar target/moyu-ultimate-0.0.1-SNAPSHOT.jar
```

## 项目结构

```
src/main/java/com/lby/moyuultimate/
├── config/
│   └── SecurityConfig.java          # 安全配置
├── controller/
│   ├── AuthController.java          # 用户认证控制器
│   └── AdminController.java         # 管理员控制器
├── dto/
│   ├── LoginRequest.java            # 登录请求DTO
│   ├── RegisterRequest.java         # 注册请求DTO
│   ├── AuthResponse.java            # 认证响应DTO
│   ├── AdminLoginRequest.java       # 管理员登录请求DTO
│   └── UserBanRequest.java          # 用户封禁请求DTO
├── entity/
│   ├── User.java                    # 用户实体
│   ├── Admin.java                   # 管理员实体
│   ├── UserBan.java                 # 用户封禁记录实体
│   └── BanType.java                 # 封禁类型枚举
├── repository/
│   ├── UserRepository.java          # 用户数据访问层
│   ├── AdminRepository.java         # 管理员数据访问层
│   └── UserBanRepository.java       # 封禁记录数据访问层
├── service/
│   ├── AuthService.java             # 用户认证服务
│   ├── AdminService.java            # 管理员服务
│   └── JwtService.java              # JWT服务
└── MoyuUltimateApplication.java     # 应用启动类
```

## API接口

### 用户认证接口

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户资料

### 管理员接口

- `POST /api/admin/login` - 管理员登录
- `GET /api/admin/users` - 获取用户列表
- `POST /api/admin/users/{id}/ban` - 封禁用户
- `POST /api/admin/users/{id}/unban` - 解封用户
- `DELETE /api/admin/users/{id}` - 删除用户

## 配置说明

### 数据库配置
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/moyu_game
spring.datasource.username=root
spring.datasource.password=password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
```

### JWT配置
```properties
jwt.secret=your-secret-key
jwt.expiration=86400000
```

### 服务器配置
```properties
server.port=8080
server.servlet.context-path=/
```

## 安全说明

- 使用JWT进行无状态认证
- 密码使用BCrypt加密存储
- 实现了基于角色的权限控制
- 支持用户封禁功能

## 开发说明

- 使用Spring Boot 3.x最新特性
- 采用分层架构设计
- 支持热重载开发
- 完整的错误处理机制

## 部署说明

### 生产环境配置
1. 修改数据库连接为生产环境配置
2. 设置安全的JWT密钥
3. 配置HTTPS
4. 设置适当的日志级别

### Docker部署
```dockerfile
FROM openjdk:20-jdk-slim
COPY target/moyu-ultimate-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
``` 