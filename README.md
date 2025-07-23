# 魔域终极版 (Moyu Ultimate)

这是一个包含游戏前端、管理员前端和后端的完整项目。

## 项目结构

```
moyu-ultimate/
├── moyu-game/              # 游戏前端 (端口: 5173)
├── moyu-admin-frontend/    # 管理员前端 (端口: 5174)
└── moyu-ultimate-backend/  # Java后端 (端口: 8080)
```

## 快速开始

### 1. 启动后端服务
```bash
cd moyu-ultimate-backend
mvn spring-boot:run
```

### 2. 启动游戏前端
```bash
cd moyu-game
npm install
npm run dev
```

### 3. 启动管理员前端
```bash
cd moyu-admin-frontend
npm install
npm run dev
```

## 访问地址

- 游戏前端: http://localhost:5173
- 管理员前端: http://localhost:5174
- 后端API: http://localhost:8080

## 技术栈

- **后端**: Spring Boot + MySQL + JWT
- **游戏前端**: TypeScript + Vite
- **管理员前端**: TypeScript + Vite

## 开发说明

- 游戏前端和管理员前端是独立的前端项目
- 后端提供统一的API服务
- 所有前端项目都使用TypeScript开发
- 数据库使用MySQL，支持用户管理、游戏数据存储等功能

## 项目概述

这是一个前后端分离的游戏项目，采用现代化的技术栈：

- **前端**: TypeScript + Vite + 原生Web技术
- **后端**: Java + Spring Boot + MySQL
- **架构**: RESTful API + JWT认证

## 技术栈

### 后端技术栈
- **Java 20** - 编程语言
- **Spring Boot 3.5.3** - 应用框架
- **Spring Security** - 安全框架
- **Spring Data JPA** - 数据访问
- **MySQL 8.0** - 数据库
- **JWT** - 身份认证
- **Maven** - 构建工具

### 用户角色
- **USER** - 普通用户（所有注册用户都是普通用户）

### 前端技术栈
- **TypeScript 5.8.3** - 编程语言
- **Vite 6.3.5** - 构建工具
- **原生Web API** - HTTP请求、DOM操作
- **localStorage/sessionStorage** - 本地存储

## API接口

### 认证接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/auth/login` | 用户登录 |
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/logout` | 用户登出 |
| POST | `/api/auth/validate` | 验证token |
| GET | `/api/auth/health` | 健康检查 |

### 请求示例

#### 登录
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "123456",
    "rememberMe": true
  }'
```

#### 注册
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "123456",
    "confirmPassword": "123456",
    "email": "user@example.com",
    "displayName": "新用户"
  }'
```

## 开发指南

### 后端开发

1. **添加新的实体类**：
   - 在 `entity/` 包下创建实体类
   - 使用JPA注解映射数据库表

2. **添加新的API接口**：
   - 在 `controller/` 包下创建控制器
   - 在 `service/` 包下实现业务逻辑
   - 在 `repository/` 包下定义数据访问接口

3. **数据库迁移**：
   - 使用 `spring.jpa.hibernate.ddl-auto=update` 自动更新表结构
   - 生产环境建议使用Flyway或Liquibase

### 前端开发

1. **API调用**：
   - 使用 `src/api.ts` 中定义的API方法
   - 所有API调用都通过统一的请求封装

2. **状态管理**：
   - 使用 `src/auth.ts` 管理认证状态
   - 使用localStorage/sessionStorage持久化数据

3. **UI组件**：
   - 在 `src/` 目录下创建新的组件文件
   - 使用TypeScript确保类型安全

## 部署说明

### 后端部署

1. 构建JAR包：
```bash
mvn clean package -DskipTests
```

2. 运行应用：
```bash
java -jar target/moyu-ultimate-0.0.1-SNAPSHOT.jar
```

### 前端部署

1. 构建生产版本：
```bash
npm run build
```

2. 部署 `dist/` 目录到Web服务器

## 安全考虑

1. **密码加密**：使用BCrypt加密存储密码
2. **JWT认证**：使用JWT进行无状态认证
3. **CORS配置**：限制跨域请求来源
4. **输入验证**：使用Bean Validation验证输入
5. **SQL注入防护**：使用JPA参数化查询

## 扩展功能

### 计划中的功能
- [ ] WebSocket实时通信
- [ ] 游戏数据同步
- [ ] 用户排行榜
- [ ] 好友系统
- [ ] 聊天功能
- [ ] 游戏存档
- [ ] 成就系统

### 技术扩展
- [ ] Redis缓存
- [ ] 消息队列
- [ ] 文件上传
- [ ] 邮件服务
- [ ] 短信验证
- [ ] 第三方登录

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

本项目采用MIT许可证。

## 联系方式

- 项目维护者：LBY
- 邮箱：lby24011252@ustc.edu.cn
- 项目地址：