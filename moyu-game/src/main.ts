/***** main.ts - 应用入口文件 *****/
import { GameManager } from './gameManager.js';
import { initGardenGame, initConsoleSelects, consoleGenerateTree, combineBackpack } from './garden.js';
import { consoleGenerateSprite, initSpriteSelects, handleSpriteDrag } from './sprite.js';
import { authManager } from './auth.js';
import { LoginForm, RegisterForm, UserInfoDisplay } from './authUI.js';
import { profileManager } from './profile.js';

// 将函数挂载到全局，供GameManager调用
(window as any).initGardenGame = initGardenGame;
(window as any).initConsoleSelects = initConsoleSelects;
(window as any).consoleGenerateTree = consoleGenerateTree;
(window as any).consoleGenerateSprite = consoleGenerateSprite;
(window as any).handleSpriteDrag = handleSpriteDrag;
(window as any).combineBackpack = combineBackpack;
(window as any).debugSprites = () => {
    if ((window as any).spriteManager) {
        (window as any).spriteManager.debugSprites();
    }
};
(window as any).forceSyncSprites = () => {
    if ((window as any).spriteManager) {
        (window as any).spriteManager.forceSyncSprites();
    }
};
(window as any).testMerge = () => {
    if ((window as any).spriteManager) {
        (window as any).spriteManager.testMerge();
    }
};
(window as any).validatePositions = () => {
    if ((window as any).spriteManager) {
        (window as any).spriteManager.validatePositions();
    }
};

// 应用主类
class MoyuApp {
    private gameManager: GameManager | null = null;
    private currentAuthForm: LoginForm | RegisterForm | null = null;
    private userInfoDisplay: UserInfoDisplay | null = null;

    constructor() {
        this.init();
    }

    private init(): void {
        // 初始化配置管理器
        profileManager.init();
        
        // 检查用户认证状态
        if (authManager.isAuthenticated()) {
            this.showGame();
        } else {
            this.showLogin();
        }

        // 监听认证事件
        authManager.on('login', () => {
            this.showGame();
        });

        authManager.on('logout', () => {
            this.showLogin();
        });
    }

    private showLogin(): void {
        const app = document.getElementById('app');
        if (!app) return;

        // 清理现有内容
        app.innerHTML = '';
        
        // 显示登录表单
        this.currentAuthForm = new LoginForm((success: boolean) => {
            if (success) {
                // 登录成功，显示游戏
                this.showGame();
            } else {
                // 切换到注册
                this.showRegister();
            }
        });

        if (this.currentAuthForm.element) {
            app.appendChild(this.currentAuthForm.element);
        }
    }

    private showRegister(): void {
        const app = document.getElementById('app');
        if (!app) return;

        // 清理现有内容
        app.innerHTML = '';
        
        // 显示注册表单
        this.currentAuthForm = new RegisterForm((success: boolean) => {
            if (success) {
                // 注册并登录成功，显示游戏
                this.showGame();
            } else {
                // 切换到登录
                this.showLogin();
            }
        });

        if (this.currentAuthForm.element) {
            app.appendChild(this.currentAuthForm.element);
        }
    }

    private showGame(): void {
        const app = document.getElementById('app');
        if (!app) return;

        // 清理现有内容
        app.innerHTML = '';
        
        // 显示用户信息
        const currentUser = authManager.getCurrentUser();
        if (currentUser) {
            this.userInfoDisplay = new UserInfoDisplay(currentUser);
            if (this.userInfoDisplay.element) {
                document.body.appendChild(this.userInfoDisplay.element);
            }
        }

        // 初始化游戏管理器
        this.gameManager = new GameManager();
        (window as any).gameManager = this.gameManager;

        console.log('魔域终极版 - TypeScript版本已启动');
    }
}

// 启动应用
new MoyuApp(); 