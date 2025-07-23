# 魔域终极版 - 快速启动指南

## 🚀 5分钟快速启动

### 1. 数据库准备
```sql
-- 在MySQL中执行
CREATE DATABASE moyu_game CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 修改数据库配置
编辑 `src/main/resources/application.properties`：
```properties
spring.datasource.username=你的MySQL用户名
spring.datasource.password=你的MySQL密码
```

### 3. 启动后端
```bash
mvn clean package
java -jar target/moyu-ultimate-0.0.1-SNAPSHOT.jar
```

### 4. 启动前端
```bash
cd ../moyu-frontend
npm install
npm run dev
```

### 5. 测试API
```bash
# 健康检查
curl http://localhost:8080/api/auth/health

# 用户登录
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'
```

## 📝 测试账号
- 用户名：`admin`
- 密码：`123456`

## 🌐 访问地址
- 前端：http://localhost:5173
- 后端API：http://localhost:8080/api

## 🔧 常见问题

### 1. 数据库连接失败
- 检查MySQL服务是否启动
- 确认用户名密码是否正确
- 确认数据库是否存在

### 2. 端口被占用
- 修改 `application.properties` 中的 `server.port`
- 或杀死占用端口的进程

### 3. 前端无法连接后端
- 检查后端是否正常启动
- 确认CORS配置是否正确
- 检查API地址是否正确

## 📚 下一步
- 查看完整文档：`README.md`
- 了解API接口：`README.md#API接口`
- 开发指南：`README.md#开发指南` 