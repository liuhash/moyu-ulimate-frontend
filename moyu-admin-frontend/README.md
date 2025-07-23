# 魔域终极版 - 管理员前端

这是魔域终极版游戏的管理员前端系统，提供用户管理、封禁管理等功能。

## 功能特性

- 🔐 管理员登录认证
- 👥 用户管理（查看、封禁、解封、删除）
- 🚫 封禁记录管理
- 📊 用户统计信息
- 🎨 现代化UI界面

## 技术栈

- **框架**: TypeScript + Vite
- **样式**: CSS3 + 现代化设计
- **HTTP客户端**: 原生Fetch API
- **状态管理**: 原生JavaScript状态管理
- **认证**: JWT Token

## 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览构建结果
```bash
npm run preview
```

## 项目结构

```
src/
├── admin-login.ts      # 管理员登录页面
├── admin-panel.ts      # 管理员主面板
├── api.ts             # API接口配置
├── auth.ts            # 认证相关逻辑
├── authUI.ts          # 认证UI组件
├── components.ts      # 通用组件
├── eventBus.ts        # 事件总线
├── guards.ts          # 路由守卫
├── main.ts            # 应用入口
├── profile.ts         # 用户资料管理
├── types.ts           # TypeScript类型定义
└── style.css          # 全局样式
```

## 环境配置

确保后端服务运行在 `http://localhost:8080`

## 访问地址

- 开发环境: http://localhost:5174
- 生产环境: 根据部署配置

## 管理员功能

### 用户管理
- 查看所有用户列表
- 查看用户详细信息
- 封禁/解封用户
- 删除用户账户

### 封禁管理
- 查看封禁记录
- 管理封禁类型（临时/永久）
- 封禁原因记录

## 开发说明

- 使用TypeScript确保类型安全
- 模块化设计，便于维护
- 响应式设计，支持多种设备
- 无框架依赖，轻量级实现 