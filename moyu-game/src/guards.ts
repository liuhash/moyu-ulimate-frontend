/***** guards.ts - 路由守卫和权限控制 *****/
import { authManager } from './auth.js';

// 路由守卫接口
export interface RouteGuard {
    canActivate(): boolean;
    redirectTo?: string;
}

// 认证守卫
export class AuthGuard implements RouteGuard {
    canActivate(): boolean {
        return authManager.isAuthenticated();
    }

    get redirectTo(): string {
        return '/login';
    }
}

// 游客守卫（未登录用户可访问）
export class GuestGuard implements RouteGuard {
    canActivate(): boolean {
        return !authManager.isAuthenticated();
    }

    get redirectTo(): string {
        return '/';
    }
}

// 权限守卫
export class PermissionGuard implements RouteGuard {
    private requiredPermissions: string[];

    constructor(permissions: string[]) {
        this.requiredPermissions = permissions;
    }

    canActivate(): boolean {
        if (!authManager.isAuthenticated()) {
            return false;
        }

        const user = authManager.getCurrentUser();
        if (!user) {
            return false;
        }

        // 这里可以根据用户角色或权限进行判断
        // 目前简单实现：等级大于等于1的用户有基本权限
        return user.level >= 1;
    }

    get redirectTo(): string {
        return '/unauthorized';
    }
}

// 路由配置接口
export interface RouteConfig {
    path: string;
    component: any;
    guard?: RouteGuard;
    children?: RouteConfig[];
}

// 路由管理器
export class Router {
    private routes: RouteConfig[] = [];
    private currentRoute: RouteConfig | null = null;

    constructor(routes: RouteConfig[]) {
        this.routes = routes;
        this.init();
    }

    private init(): void {
        // 监听浏览器历史变化
        window.addEventListener('popstate', () => {
            this.handleRouteChange();
        });

        // 初始路由
        this.handleRouteChange();
    }

    private handleRouteChange(): void {
        const path = window.location.pathname;
        const route = this.findRoute(path);

        if (route) {
            // 检查路由守卫
            if (route.guard && !route.guard.canActivate()) {
                this.navigateTo(route.guard.redirectTo || '/login');
                return;
            }

            this.currentRoute = route;
            this.renderRoute(route);
        } else {
            // 404 处理
            this.handleNotFound();
        }
    }

    private findRoute(path: string): RouteConfig | null {
        return this.routes.find(route => route.path === path) || null;
    }

    private renderRoute(route: RouteConfig): void {
        const app = document.getElementById('app');
        if (!app) return;

        // 清理现有内容
        app.innerHTML = '';

        // 渲染组件
        if (route.component) {
            const component = new route.component();
            if (component.element) {
                app.appendChild(component.element);
            }
        }
    }

    private handleNotFound(): void {
        const app = document.getElementById('app');
        if (!app) return;

        app.innerHTML = `
            <div class="auth-container">
                <h1>404</h1>
                <p>页面未找到</p>
                <button onclick="window.history.back()">返回上一页</button>
            </div>
        `;
    }

    public navigateTo(path: string): void {
        window.history.pushState({}, '', path);
        this.handleRouteChange();
    }

    public getCurrentRoute(): RouteConfig | null {
        return this.currentRoute;
    }
}

// 权限检查工具函数
export class PermissionChecker {
    // 检查用户是否有指定权限
    static hasPermission(permission: string): boolean {
        if (!authManager.isAuthenticated()) {
            return false;
        }

        const user = authManager.getCurrentUser();
        if (!user) {
            return false;
        }

        // 根据用户等级判断权限
        switch (permission) {
            case 'admin':
                return user.level >= 10;
            case 'moderator':
                return user.level >= 5;
            case 'user':
                return user.level >= 1;
            default:
                return false;
        }
    }

    // 检查用户是否有多个权限中的任意一个
    static hasAnyPermission(permissions: string[]): boolean {
        return permissions.some(permission => this.hasPermission(permission));
    }

    // 检查用户是否有所有指定权限
    static hasAllPermissions(permissions: string[]): boolean {
        return permissions.every(permission => this.hasPermission(permission));
    }
}

// 认证状态监听器
export class AuthStateListener {
    private listeners: Map<string, Function[]> = new Map();

    constructor() {
        this.init();
    }

    private init(): void {
        // 监听认证状态变化
        authManager.on('login', () => {
            this.notifyListeners('authStateChanged', { isAuthenticated: true });
        });

        authManager.on('logout', () => {
            this.notifyListeners('authStateChanged', { isAuthenticated: false });
        });

        authManager.on('profileUpdate', (user) => {
            this.notifyListeners('userProfileUpdated', user);
        });
    }

    public addListener(event: string, callback: Function): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(callback);
    }

    public removeListener(event: string, callback: Function): void {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    private notifyListeners(event: string, data: any): void {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('监听器回调错误:', error);
                }
            });
        }
    }
}

// 导出单例实例
export const authStateListener = new AuthStateListener(); 