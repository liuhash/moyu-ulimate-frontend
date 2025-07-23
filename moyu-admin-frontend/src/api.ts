// API基础配置
const API_BASE_URL = 'http://localhost:8080/api'

// 请求拦截器
const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

// 通用请求方法
const request = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

// 类型定义
export interface AdminLoginRequest {
  username: string
  password: string
}

export interface AdminLoginResponse {
  success: boolean
  message?: string
  token?: string
  admin?: {
    id: number
    username: string
  }
}

export interface User {
  id: number
  username: string
  email?: string
  createdAt: string
  banned: boolean
}

export interface BanRecord {
  id: number
  userId: number
  username: string
  banType: 'TEMPORARY' | 'PERMANENT'
  reason: string
  createdAt: string
  unbannedAt?: string
}

export interface UserBanRequest {
  banType: 'TEMPORARY' | 'PERMANENT'
  reason: string
}

export interface Stats {
  totalUsers: number
  activeUsers: number
  bannedUsers: number
  todayRegistrations: number
}

// 管理员登录
export const adminLogin = async (data: AdminLoginRequest): Promise<AdminLoginResponse> => {
  return request('/admin/login', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

// 获取用户列表
export const getUsers = async (): Promise<{ success: boolean; users: User[]; message?: string }> => {
  return request('/admin/users')
}

// 封禁用户
export const banUser = async (userId: number, banData: UserBanRequest): Promise<{ success: boolean; message?: string }> => {
  return request(`/admin/users/${userId}/ban`, {
    method: 'POST',
    body: JSON.stringify(banData)
  })
}

// 解封用户
export const unbanUser = async (userId: number): Promise<{ success: boolean; message?: string }> => {
  return request(`/admin/users/${userId}/unban`, {
    method: 'POST'
  })
}

// 删除用户
export const deleteUser = async (userId: number): Promise<{ success: boolean; message?: string }> => {
  return request(`/admin/users/${userId}`, {
    method: 'DELETE'
  })
}

// 获取封禁记录
export const getBanRecords = async (): Promise<{ success: boolean; bans: BanRecord[]; message?: string }> => {
  return request('/admin/bans')
}

// 获取统计信息
export const getStats = async (): Promise<{ success: boolean; stats: Stats; message?: string }> => {
  return request('/admin/stats')
}

// 游戏相关API（可以后续扩展）
export const gameAPI = {
    // 获取用户游戏数据
    getUserGameData: async (userId: number) => {
        return request(`/game/user/${userId}`, {
            method: 'GET',
        });
    },
    
    // 保存游戏进度
    saveGameProgress: async (gameData: any) => {
        return request('/game/save', {
            method: 'POST',
            body: JSON.stringify(gameData),
        });
    },
    
    // 获取排行榜
    getLeaderboard: async () => {
        return request('/game/leaderboard', {
            method: 'GET',
        });
    },
};

// 用户相关API
export const userAPI = {
    // 获取用户信息
    getUserInfo: async (userId: number) => {
        return request(`/user/${userId}`, {
            method: 'GET',
        });
    },
    
    // 更新用户信息
    updateUserInfo: async (userId: number, userData: any) => {
        return request(`/user/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData),
        });
    },
    
    // 获取在线用户列表
    getOnlineUsers: async () => {
        return request('/user/online', {
            method: 'GET',
        });
    },
};

// 导出默认配置
export default {
    API_BASE_URL,
    gameAPI,
    userAPI,
}; 