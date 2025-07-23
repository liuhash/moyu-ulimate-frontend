/***** auth.ts - 用户认证和状态管理 *****/

// 用户信息接口
export interface UserInfo {
    id: string;
    username: string;
    email?: string;
    avatar?: string;
    level: number;
    exp: number;
    createdAt: string;
    lastLoginAt: string;
}

// 登录请求接口
export interface LoginRequest {
    username: string;
    password: string;
    rememberMe?: boolean;
}

// 注册请求接口
export interface RegisterRequest {
    username: string;
    password: string;
    email?: string;
}

// 认证状态接口
export interface AuthState {
    isAuthenticated: boolean;
    user: UserInfo | null;
    token: string | null;
    loading: boolean;
    error: string | null;
}

// 认证事件类型
export type AuthEventType = 'login' | 'logout' | 'register' | 'tokenRefresh' | 'profileUpdate';

// 认证事件回调
export type AuthEventCallback = (event: AuthEventType, data?: any) => void;

// 用户认证管理器
export class AuthManager {
    private static instance: AuthManager;
    private state: AuthState;
    private eventCallbacks: Map<AuthEventType, AuthEventCallback[]> = new Map();
    private readonly TOKEN_KEY = 'moyu_auth_token';
    private readonly USER_KEY = 'moyu_user_info';
    private readonly REMEMBER_KEY = 'moyu_remember_me';

    private constructor() {
        this.state = {
            isAuthenticated: false,
            user: null,
            token: null,
            loading: false,
            error: null
        };
        this.initializeFromStorage();
    }

    public static getInstance(): AuthManager {
        if (!AuthManager.instance) {
            AuthManager.instance = new AuthManager();
        }
        return AuthManager.instance;
    }

    // 初始化时从存储中恢复状态
    private initializeFromStorage(): void {
        try {
            const token = this.getStorageItem(this.TOKEN_KEY);
            const userStr = this.getStorageItem(this.USER_KEY);
            
            if (token && userStr) {
                const user = JSON.parse(userStr) as UserInfo;
                this.state.token = token;
                this.state.user = user;
                this.state.isAuthenticated = true;
                console.log('从存储中恢复用户状态:', user.username);
            }
        } catch (error) {
            console.error('恢复用户状态失败:', error);
            this.clearStorage();
        }
    }

    // 获取存储项（根据记住我选项选择存储方式）
    private getStorageItem(key: string): string | null {
        const rememberMe = localStorage.getItem(this.REMEMBER_KEY) === 'true';
        return rememberMe ? localStorage.getItem(key) : sessionStorage.getItem(key);
    }

    // 设置存储项
    private setStorageItem(key: string, value: string): void {
        const rememberMe = localStorage.getItem(this.REMEMBER_KEY) === 'true';
        if (rememberMe) {
            localStorage.setItem(key, value);
        } else {
            sessionStorage.setItem(key, value);
        }
    }

    // 清除存储
    private clearStorage(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        sessionStorage.removeItem(this.TOKEN_KEY);
        sessionStorage.removeItem(this.USER_KEY);
    }

    // 登录方法
    public async login(credentials: LoginRequest): Promise<boolean> {
        this.state.loading = true;
        this.state.error = null;

        try {
            // 模拟API调用
            const response = await this.mockLoginAPI(credentials);
            
            if (response.success && response.user && response.token) {
                this.state.isAuthenticated = true;
                this.state.user = response.user;
                this.state.token = response.token;
                this.state.error = null;

                // 保存到存储
                this.setStorageItem(this.TOKEN_KEY, response.token);
                this.setStorageItem(this.USER_KEY, JSON.stringify(response.user));
                
                if (credentials.rememberMe) {
                    localStorage.setItem(this.REMEMBER_KEY, 'true');
                } else {
                    sessionStorage.setItem(this.REMEMBER_KEY, 'false');
                }

                this.emitEvent('login', response.user);
                console.log('登录成功:', response.user.username);
                return true;
            } else {
                this.state.error = response.error || '登录失败';
                return false;
            }
        } catch (error) {
            this.state.error = '网络错误，请稍后重试';
            console.error('登录错误:', error);
            return false;
        } finally {
            this.state.loading = false;
        }
    }

    // 注册方法
    public async register(userData: RegisterRequest): Promise<boolean> {
        this.state.loading = true;
        this.state.error = null;

        try {
            // 模拟API调用
            const response = await this.mockRegisterAPI(userData);
            
            if (response.success && response.user) {
                this.emitEvent('register', response.user);
                console.log('注册成功:', response.user.username);
                return true;
            } else {
                this.state.error = response.error || '注册失败';
                return false;
            }
        } catch (error) {
            this.state.error = '网络错误，请稍后重试';
            console.error('注册错误:', error);
            return false;
        } finally {
            this.state.loading = false;
        }
    }

    // 登出方法
    public logout(): void {
        this.state.isAuthenticated = false;
        this.state.user = null;
        this.state.token = null;
        this.state.error = null;

        this.clearStorage();
        this.emitEvent('logout');
        console.log('用户已登出');
    }

    // 更新用户信息
    public updateProfile(updates: Partial<UserInfo>): void {
        if (this.state.user) {
            this.state.user = { ...this.state.user, ...updates };
            this.setStorageItem(this.USER_KEY, JSON.stringify(this.state.user));
            this.emitEvent('profileUpdate', this.state.user);
        }
    }

    // 检查是否已认证
    public isAuthenticated(): boolean {
        return this.state.isAuthenticated;
    }

    // 获取当前用户
    public getCurrentUser(): UserInfo | null {
        return this.state.user;
    }

    // 获取认证令牌
    public getToken(): string | null {
        return this.state.token;
    }

    // 获取加载状态
    public isLoading(): boolean {
        return this.state.loading;
    }

    // 获取错误信息
    public getError(): string | null {
        return this.state.error;
    }

    // 清除错误
    public clearError(): void {
        this.state.error = null;
    }

    // 事件监听
    public on(event: AuthEventType, callback: AuthEventCallback): void {
        if (!this.eventCallbacks.has(event)) {
            this.eventCallbacks.set(event, []);
        }
        this.eventCallbacks.get(event)!.push(callback);
    }

    // 移除事件监听
    public off(event: AuthEventType, callback: AuthEventCallback): void {
        const callbacks = this.eventCallbacks.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    // 触发事件
    private emitEvent(event: AuthEventType, data?: any): void {
        const callbacks = this.eventCallbacks.get(event);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(event, data);
                } catch (error) {
                    console.error('事件回调错误:', error);
                }
            });
        }
    }

    // 模拟登录API
    private async mockLoginAPI(credentials: LoginRequest): Promise<{
        success: boolean;
        user?: UserInfo;
        token?: string;
        error?: string;
    }> {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 简单的验证逻辑
        if (credentials.username === 'admin' && credentials.password === '123456') {
            const user: UserInfo = {
                id: '1',
                username: credentials.username,
                email: 'admin@moyu.com',
                avatar: 'https://via.placeholder.com/50',
                level: 1,
                exp: 0,
                createdAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString()
            };

            return {
                success: true,
                user,
                token: 'mock_jwt_token_' + Date.now()
            };
        } else {
            return {
                success: false,
                error: '用户名或密码错误'
            };
        }
    }

    // 模拟注册API
    private async mockRegisterAPI(userData: RegisterRequest): Promise<{
        success: boolean;
        user?: UserInfo;
        error?: string;
    }> {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 简单的验证逻辑
        if (userData.username.length < 3) {
            return {
                success: false,
                error: '用户名至少需要3个字符'
            };
        }

        if (userData.password.length < 6) {
            return {
                success: false,
                error: '密码至少需要6个字符'
            };
        }

        const user: UserInfo = {
            id: Date.now().toString(),
            username: userData.username,
            email: userData.email,
            avatar: 'https://via.placeholder.com/50',
            level: 1,
            exp: 0,
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
        };

        return {
            success: true,
            user
        };
    }
}

// 导出单例实例
export const authManager = AuthManager.getInstance(); 