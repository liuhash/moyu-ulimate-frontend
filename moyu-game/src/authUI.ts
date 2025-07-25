/***** authUI.ts - 认证UI组件 *****/
import './styles/common.css';
import './styles/components/modal.css';
import { authManager, LoginRequest, RegisterRequest } from './auth.js';

// 登录表单组件
export class LoginForm {
    private element: HTMLElement | null = null;
    private onSubmit: (success: boolean) => void;

    constructor(onSubmit: (success: boolean) => void) {
        this.onSubmit = onSubmit;
        this.render();
    }

    render(): void {
        this.element = document.createElement('div');
        this.element.className = 'auth-form login-form';
        this.element.innerHTML = `
            <div class="auth-container">
                <h2>登录魔域</h2>
                <form id="loginForm">
                    <div class="form-group">
                        <label for="username">用户名</label>
                        <input type="text" id="username" name="username" required placeholder="请输入用户名">
                    </div>
                    <div class="form-group">
                        <label for="password">密码</label>
                        <input type="password" id="password" name="password" required placeholder="请输入密码">
                    </div>
                    <div class="form-group checkbox-group">
                        <label>
                            <input type="checkbox" id="rememberMe" name="rememberMe">
                            记住我
                        </label>
                    </div>
                    <div class="error-message" id="loginError"></div>
                    <button type="submit" class="btn-primary" id="loginBtn">
                        <span class="btn-text">登录</span>
                        <span class="btn-loading" style="display: none;">登录中...</span>
                    </button>
                </form>
                <div class="auth-links">
                    <a href="#" id="showRegister">还没有账号？立即注册</a>
                </div>
            </div>
        `;

        this.bindEvents();
    }

    private bindEvents(): void {
        const form = this.element!.querySelector('#loginForm') as HTMLFormElement;
        const showRegisterLink = this.element!.querySelector('#showRegister') as HTMLAnchorElement;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin();
        });

        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.onSubmit(false); // 切换到注册
        });
    }

    private async handleLogin(): Promise<void> {
        const form = this.element!.querySelector('#loginForm') as HTMLFormElement;
        const formData = new FormData(form);
        const errorElement = this.element!.querySelector('#loginError') as HTMLElement;
        const submitBtn = this.element!.querySelector('#loginBtn') as HTMLButtonElement;
        const btnText = submitBtn.querySelector('.btn-text') as HTMLElement;
        const btnLoading = submitBtn.querySelector('.btn-loading') as HTMLElement;

        // 清除错误信息
        errorElement.textContent = '';
        errorElement.style.display = 'none';

        // 显示加载状态
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';

        try {
            const credentials: LoginRequest = {
                username: formData.get('username') as string,
                password: formData.get('password') as string,
                rememberMe: formData.has('rememberMe')
            };

            const success = await authManager.login(credentials);
            
            if (success) {
                this.onSubmit(true);
            } else {
                const error = authManager.getError();
                if (error) {
                    errorElement.textContent = error;
                    errorElement.style.display = 'block';
                }
            }
        } catch (error) {
            errorElement.textContent = '登录失败，请稍后重试';
            errorElement.style.display = 'block';
        } finally {
            // 恢复按钮状态
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    }

    getElement(): HTMLElement | null {
        return this.element;
    }
}

// 注册表单组件
export class RegisterForm {
    private element: HTMLElement | null = null;
    private onSubmit: (success: boolean) => void;

    constructor(onSubmit: (success: boolean) => void) {
        this.onSubmit = onSubmit;
        this.render();
    }

    render(): void {
        this.element = document.createElement('div');
        this.element.className = 'auth-form register-form';
        this.element.innerHTML = `
            <div class="auth-container">
                <h2>注册账号</h2>
                <form id="registerForm">
                    <div class="form-group">
                        <label for="regUsername">用户名</label>
                        <input type="text" id="regUsername" name="username" required placeholder="请输入用户名（至少3个字符）">
                    </div>
                    <div class="form-group">
                        <label for="regEmail">邮箱（可选）</label>
                        <input type="email" id="regEmail" name="email" placeholder="请输入邮箱">
                    </div>
                    <div class="form-group">
                        <label for="regPassword">密码</label>
                        <input type="password" id="regPassword" name="password" required placeholder="请输入密码（至少6个字符）">
                    </div>
                    <div class="form-group">
                        <label for="confirmPassword">确认密码</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" required placeholder="请再次输入密码">
                    </div>
                    <div class="error-message" id="registerError"></div>
                    <button type="submit" class="btn-primary" id="registerBtn">
                        <span class="btn-text">注册</span>
                        <span class="btn-loading" style="display: none;">注册中...</span>
                    </button>
                </form>
                <div class="auth-links">
                    <a href="#" id="showLogin">已有账号？立即登录</a>
                </div>
            </div>
        `;

        this.bindEvents();
    }

    private bindEvents(): void {
        const form = this.element!.querySelector('#registerForm') as HTMLFormElement;
        const showLoginLink = this.element!.querySelector('#showLogin') as HTMLAnchorElement;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleRegister();
        });

        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.onSubmit(false); // 切换到登录
        });
    }

    private async handleRegister(): Promise<void> {
        const form = this.element!.querySelector('#registerForm') as HTMLFormElement;
        const formData = new FormData(form);
        const errorElement = this.element!.querySelector('#registerError') as HTMLElement;
        const submitBtn = this.element!.querySelector('#registerBtn') as HTMLButtonElement;
        const btnText = submitBtn.querySelector('.btn-text') as HTMLElement;
        const btnLoading = submitBtn.querySelector('.btn-loading') as HTMLElement;

        // 清除错误信息
        errorElement.textContent = '';
        errorElement.style.display = 'none';

        // 验证密码确认
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;
        
        if (password !== confirmPassword) {
            errorElement.textContent = '两次输入的密码不一致';
            errorElement.style.display = 'block';
            return;
        }

        // 显示加载状态
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';

        try {
            const userData: RegisterRequest = {
                username: formData.get('username') as string,
                password: password,
                email: formData.get('email') as string || undefined
            };

            const success = await authManager.register(userData);
            
            if (success) {
                // 注册成功后自动登录
                const loginSuccess = await authManager.login({
                    username: userData.username,
                    password: userData.password
                });
                
                if (loginSuccess) {
                    this.onSubmit(true);
                }
            } else {
                const error = authManager.getError();
                if (error) {
                    errorElement.textContent = error;
                    errorElement.style.display = 'block';
                }
            }
        } catch (error) {
            errorElement.textContent = '注册失败，请稍后重试';
            errorElement.style.display = 'block';
        } finally {
            // 恢复按钮状态
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    }

    getElement(): HTMLElement | null {
        return this.element;
    }
}

// 用户信息显示组件
export class UserInfoDisplay {
    private element: HTMLElement | null = null;
    private userInfo: any;

    constructor(userInfo: any) {
        this.userInfo = userInfo;
        this.render();
    }

    render(): void {
        this.element = document.createElement('div');
        this.element.className = 'user-info-display';
        this.element.innerHTML = `
            <div class="user-avatar">
                <img src="${this.userInfo.avatar || 'https://via.placeholder.com/40'}" alt="头像">
            </div>
            <div class="user-details">
                <div class="username">${this.userInfo.username}</div>
                <div class="user-level">等级 ${this.userInfo.level}</div>
            </div>
            <button class="logout-btn" id="logoutBtn">登出</button>
        `;

        this.bindEvents();
    }

    private bindEvents(): void {
        const logoutBtn = this.element!.querySelector('#logoutBtn') as HTMLButtonElement;
        logoutBtn.addEventListener('click', () => {
            authManager.logout();
            // 触发页面刷新或重定向
            window.location.reload();
        });
    }

    getElement(): HTMLElement | null {
        return this.element;
    }
}
