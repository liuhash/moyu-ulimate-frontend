# 魔域终极版 - 游戏前端

这是魔域终极版游戏的主要前端系统，提供完整的游戏体验和用户交互功能。

## 功能特性

- 🎮 完整的游戏体验
- 🔐 用户认证系统（登录/注册）
- 👤 用户资料管理
- 🎨 现代化游戏界面
- 📱 响应式设计
- 🌳 游戏逻辑管理

## 技术栈

- **框架**: TypeScript + Vite
- **样式**: CSS3 + 游戏化设计
- **HTTP客户端**: 原生Fetch API
- **状态管理**: 原生JavaScript状态管理
- **认证**: JWT Token
- **游戏引擎**: 原生Canvas/WebGL

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
├── auth.ts            # 用户认证管理
├── authUI.ts          # 认证UI组件
├── components.ts      # 通用组件
├── counter.ts         # 计数器组件
├── eventBus.ts        # 事件总线
├── gameManager.ts     # 游戏管理器
├── guards.ts          # 路由守卫
├── main.ts            # 应用入口
├── profile.ts         # 用户资料管理
├── script.ts          # 游戏脚本
├── trees.ts           # 游戏树结构
├── types.ts           # TypeScript类型定义
└── style.css          # 全局样式

UIs/
└── fruits/            # 游戏UI资源
```

## 环境配置

确保后端服务运行在 `http://localhost:8080`

## 访问地址

- 开发环境: http://localhost:5173
- 生产环境: 根据部署配置

## 游戏功能

### 用户系统
- 用户注册和登录
- 用户资料管理
- 游戏进度保存

### 游戏特性
- 完整的游戏逻辑
- 实时游戏状态
- 游戏数据同步

## 开发说明

- 使用TypeScript确保类型安全
- 模块化游戏架构
- 响应式设计，支持多种设备
- 无框架依赖，轻量级实现
- 支持游戏资源管理

## 游戏资源

游戏相关的UI资源存储在 `UIs/` 目录下，包括：
- 游戏图标
- 界面元素
- 动画资源 