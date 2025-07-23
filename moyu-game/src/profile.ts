/***** profile.ts - 用户配置文件管理 *****/
import { authManager, UserInfo } from './auth.js';
import { Component } from './components.js';
import { Modal } from './components.js';

// 用户配置接口
export interface UserSettings {
    theme: 'light' | 'dark' | 'auto';
    language: 'zh-CN' | 'en-US';
    notifications: {
        email: boolean;
        push: boolean;
        sound: boolean;
    };
    privacy: {
        showOnlineStatus: boolean;
        allowFriendRequests: boolean;
        showProfileToPublic: boolean;
    };
    game: {
        autoSave: boolean;
        confirmActions: boolean;
        showTutorials: boolean;
    };
}

// 默认配置
const DEFAULT_SETTINGS: UserSettings = {
    theme: 'light',
    language: 'zh-CN',
    notifications: {
        email: true,
        push: true,
        sound: true
    },
    privacy: {
        showOnlineStatus: true,
        allowFriendRequests: true,
        showProfileToPublic: false
    },
    game: {
        autoSave: true,
        confirmActions: true,
        showTutorials: true
    }
};

// 用户配置管理器
export class ProfileManager {
    private static instance: ProfileManager;
    private settings: UserSettings;
    private readonly SETTINGS_KEY = 'moyu_user_settings';

    private constructor() {
        this.settings = this.loadSettings();
    }

    public static getInstance(): ProfileManager {
        if (!ProfileManager.instance) {
            ProfileManager.instance = new ProfileManager();
        }
        return ProfileManager.instance;
    }

    // 加载配置
    private loadSettings(): UserSettings {
        try {
            const saved = localStorage.getItem(this.SETTINGS_KEY);
            if (saved) {
                return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('加载用户配置失败:', error);
        }
        return { ...DEFAULT_SETTINGS };
    }

    // 保存配置
    private saveSettings(): void {
        try {
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(this.settings));
        } catch (error) {
            console.error('保存用户配置失败:', error);
        }
    }

    // 获取配置
    public getSettings(): UserSettings {
        return { ...this.settings };
    }

    // 更新配置
    public updateSettings(updates: Partial<UserSettings>): void {
        this.settings = { ...this.settings, ...updates };
        this.saveSettings();
        this.applySettings();
    }

    // 重置配置
    public resetSettings(): void {
        this.settings = { ...DEFAULT_SETTINGS };
        this.saveSettings();
        this.applySettings();
    }

    // 应用配置
    private applySettings(): void {
        // 应用主题
        this.applyTheme();
        
        // 应用语言
        this.applyLanguage();
        
        // 应用通知设置
        this.applyNotificationSettings();
    }

    // 应用主题
    private applyTheme(): void {
        const { theme } = this.settings;
        const root = document.documentElement;
        
        // 移除现有主题类
        root.classList.remove('theme-light', 'theme-dark');
        
        // 应用新主题
        if (theme === 'dark' || (theme === 'auto' && this.isDarkModePreferred())) {
            root.classList.add('theme-dark');
        } else {
            root.classList.add('theme-light');
        }
    }

    // 检查是否偏好深色模式
    private isDarkModePreferred(): boolean {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    // 应用语言
    private applyLanguage(): void {
        // 这里可以实现国际化
        document.documentElement.lang = this.settings.language;
    }

    // 应用通知设置
    private applyNotificationSettings(): void {
        // 这里可以实现通知设置
        console.log('应用通知设置:', this.settings.notifications);
    }

    // 初始化
    public init(): void {
        this.applySettings();
        
        // 监听系统主题变化
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
                if (this.settings.theme === 'auto') {
                    this.applyTheme();
                }
            });
        }
    }
}

// 用户资料编辑组件
export class ProfileEditor extends Component {
    private userInfo: UserInfo;
    private onSave: (userInfo: UserInfo) => void;

    constructor(userInfo: UserInfo, onSave: (userInfo: UserInfo) => void) {
        super();
        this.userInfo = userInfo;
        this.onSave = onSave;
        this.render();
    }

    render(): void {
        this.element = document.createElement('div');
        this.element.className = 'profile-editor';
        this.element.innerHTML = `
            <div class="profile-form">
                <h3>编辑个人资料</h3>
                <form id="profileForm">
                    <div class="form-group">
                        <label for="editUsername">用户名</label>
                        <input type="text" id="editUsername" name="username" value="${this.userInfo.username}" required>
                    </div>
                    <div class="form-group">
                        <label for="editEmail">邮箱</label>
                        <input type="email" id="editEmail" name="email" value="${this.userInfo.email || ''}">
                    </div>
                    <div class="form-group">
                        <label for="editAvatar">头像URL</label>
                        <input type="url" id="editAvatar" name="avatar" value="${this.userInfo.avatar || ''}">
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn-primary">保存</button>
                        <button type="button" class="btn-secondary" id="cancelBtn">取消</button>
                    </div>
                </form>
            </div>
        `;

        this.bindEvents();
    }

    private bindEvents(): void {
        const form = this.element!.querySelector('#profileForm') as HTMLFormElement;
        const cancelBtn = this.element!.querySelector('#cancelBtn') as HTMLButtonElement;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSave();
        });

        cancelBtn.addEventListener('click', () => {
            this.destroy();
        });
    }

    private handleSave(): void {
        const form = this.element!.querySelector('#profileForm') as HTMLFormElement;
        const formData = new FormData(form);

        const updatedUser: UserInfo = {
            ...this.userInfo,
            username: formData.get('username') as string,
            email: formData.get('email') as string || undefined,
            avatar: formData.get('avatar') as string || undefined
        };

        this.onSave(updatedUser);
        this.destroy();
    }
}

// 设置面板组件
export class SettingsPanel extends Component {
    private profileManager: ProfileManager;
    private onClose: () => void;

    constructor(onClose: () => void) {
        super();
        this.profileManager = ProfileManager.getInstance();
        this.onClose = onClose;
        this.render();
    }

    render(): void {
        const settings = this.profileManager.getSettings();
        
        this.element = document.createElement('div');
        this.element.className = 'settings-panel';
        this.element.innerHTML = `
            <div class="settings-container">
                <div class="settings-header">
                    <h3>设置</h3>
                    <button class="close-btn" id="closeSettings">×</button>
                </div>
                <div class="settings-content">
                    <div class="settings-section">
                        <h4>外观</h4>
                        <div class="form-group">
                            <label for="themeSelect">主题</label>
                            <select id="themeSelect">
                                <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>浅色</option>
                                <option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>深色</option>
                                <option value="auto" ${settings.theme === 'auto' ? 'selected' : ''}>跟随系统</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="languageSelect">语言</label>
                            <select id="languageSelect">
                                <option value="zh-CN" ${settings.language === 'zh-CN' ? 'selected' : ''}>中文</option>
                                <option value="en-US" ${settings.language === 'en-US' ? 'selected' : ''}>English</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="settings-section">
                        <h4>通知</h4>
                        <div class="checkbox-group">
                            <label>
                                <input type="checkbox" id="emailNotif" ${settings.notifications.email ? 'checked' : ''}>
                                邮件通知
                            </label>
                        </div>
                        <div class="checkbox-group">
                            <label>
                                <input type="checkbox" id="pushNotif" ${settings.notifications.push ? 'checked' : ''}>
                                推送通知
                            </label>
                        </div>
                        <div class="checkbox-group">
                            <label>
                                <input type="checkbox" id="soundNotif" ${settings.notifications.sound ? 'checked' : ''}>
                                声音提醒
                            </label>
                        </div>
                    </div>
                    
                    <div class="settings-section">
                        <h4>隐私</h4>
                        <div class="checkbox-group">
                            <label>
                                <input type="checkbox" id="showOnline" ${settings.privacy.showOnlineStatus ? 'checked' : ''}>
                                显示在线状态
                            </label>
                        </div>
                        <div class="checkbox-group">
                            <label>
                                <input type="checkbox" id="allowFriends" ${settings.privacy.allowFriendRequests ? 'checked' : ''}>
                                允许好友请求
                            </label>
                        </div>
                        <div class="checkbox-group">
                            <label>
                                <input type="checkbox" id="showProfile" ${settings.privacy.showProfileToPublic ? 'checked' : ''}>
                                公开个人资料
                            </label>
                        </div>
                    </div>
                    
                    <div class="settings-section">
                        <h4>游戏</h4>
                        <div class="checkbox-group">
                            <label>
                                <input type="checkbox" id="autoSave" ${settings.game.autoSave ? 'checked' : ''}>
                                自动保存
                            </label>
                        </div>
                        <div class="checkbox-group">
                            <label>
                                <input type="checkbox" id="confirmActions" ${settings.game.confirmActions ? 'checked' : ''}>
                                操作确认
                            </label>
                        </div>
                        <div class="checkbox-group">
                            <label>
                                <input type="checkbox" id="showTutorials" ${settings.game.showTutorials ? 'checked' : ''}>
                                显示教程
                            </label>
                        </div>
                    </div>
                </div>
                <div class="settings-footer">
                    <button class="btn-secondary" id="resetSettings">重置设置</button>
                    <button class="btn-primary" id="saveSettings">保存设置</button>
                </div>
            </div>
        `;

        this.bindEvents();
    }

    private bindEvents(): void {
        const closeBtn = this.element!.querySelector('#closeSettings') as HTMLButtonElement;
        const saveBtn = this.element!.querySelector('#saveSettings') as HTMLButtonElement;
        const resetBtn = this.element!.querySelector('#resetSettings') as HTMLButtonElement;

        closeBtn.addEventListener('click', () => {
            this.onClose();
        });

        saveBtn.addEventListener('click', () => {
            this.handleSave();
        });

        resetBtn.addEventListener('click', () => {
            this.handleReset();
        });
    }

    private handleSave(): void {
        const settings: UserSettings = {
            theme: (this.element!.querySelector('#themeSelect') as HTMLSelectElement).value as 'light' | 'dark' | 'auto',
            language: (this.element!.querySelector('#languageSelect') as HTMLSelectElement).value as 'zh-CN' | 'en-US',
            notifications: {
                email: (this.element!.querySelector('#emailNotif') as HTMLInputElement).checked,
                push: (this.element!.querySelector('#pushNotif') as HTMLInputElement).checked,
                sound: (this.element!.querySelector('#soundNotif') as HTMLInputElement).checked
            },
            privacy: {
                showOnlineStatus: (this.element!.querySelector('#showOnline') as HTMLInputElement).checked,
                allowFriendRequests: (this.element!.querySelector('#allowFriends') as HTMLInputElement).checked,
                showProfileToPublic: (this.element!.querySelector('#showProfile') as HTMLInputElement).checked
            },
            game: {
                autoSave: (this.element!.querySelector('#autoSave') as HTMLInputElement).checked,
                confirmActions: (this.element!.querySelector('#confirmActions') as HTMLInputElement).checked,
                showTutorials: (this.element!.querySelector('#showTutorials') as HTMLInputElement).checked
            }
        };

        this.profileManager.updateSettings(settings);
        this.onClose();
    }

    private handleReset(): void {
        if (confirm('确定要重置所有设置吗？')) {
            this.profileManager.resetSettings();
            this.onClose();
        }
    }
}

// 导出单例实例
export const profileManager = ProfileManager.getInstance(); 