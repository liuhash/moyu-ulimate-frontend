/***** gameManager.ts - SPA游戏管理器 *****/
import type { PageType, IEventBus, IPage } from './types.js';
import { EventBus } from './eventBus.js';
import { CurrencyComponent, ButtonComponent, LayoutComponent, UIUtils } from './components.js';
import { initSpriteSelects } from './sprite.js';
import { currencyManager } from './currency.js';

// 页面管理器
class PageManager {
    private pages: Map<PageType, IPage> = new Map();

    registerPage(name: PageType, renderFn: () => void, cleanupFn: () => void): void {
        this.pages.set(name, { render: renderFn, cleanup: cleanupFn });
    }

    renderPage(name: PageType): void {
        const page = this.pages.get(name);
        if (page && page.render) {
            page.render();
        }
    }

    cleanupPage(name: PageType): void {
        const page = this.pages.get(name);
        if (page && page.cleanup) {
            page.cleanup();
        }
    }
}

// 模态框类
class Modal {
    private element: HTMLElement | null = null;
    private overlay: HTMLElement | null = null;

    constructor(content: string, options: { width?: string; closeOnOutsideClick?: boolean } = {}) {
        this.create(content, options);
    }

    private create(content: string, options: { width?: string; closeOnOutsideClick?: boolean }): void {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        const modal = document.createElement('div');
        modal.className = 'modal-content';
        modal.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            max-width: 90%;
            max-height: 90%;
            overflow: auto;
            width: ${options.width || '500px'};
        `;
        modal.innerHTML = content;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        this.overlay = overlay;
        this.element = modal;

        if (options.closeOnOutsideClick !== false) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.destroy();
                }
            });
        }
    }

    destroy(): void {
        if (this.overlay) {
            document.body.removeChild(this.overlay);
            this.overlay = null;
            this.element = null;
        }
    }
}

// 返回按钮类
class BackButton {
    private element: HTMLElement | null = null;
    private callback: () => void;

    constructor(callback: () => void, text: string = '返回') {
        this.callback = callback;
        this.create(text);
    }

    private create(text: string): void {
        const button = document.createElement('button');
        button.className = 'back-button';
        button.textContent = text;
        button.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            transition: all 0.3s ease;
        `;

        button.addEventListener('click', this.callback);
        this.element = button;
    }

    destroy(): void {
        if (this.element) {
            this.element.remove();
            this.element = null;
        }
    }

    getElement(): HTMLElement | null {
        return this.element;
    }
}

export class GameManager {
    private currentPage: PageType = 'main';
    private eventBus: EventBus;
    private pageManager: PageManager;
    private backButton: BackButton | null = null;
    private bagModal: Modal | null = null;
    private consoleModal: Modal | null = null;

    constructor() {
        this.eventBus = new EventBus();
        this.pageManager = new PageManager();
        this.init();
    }

    private init(): void {
        this.registerPages();
        this.showPage('main');
        this.bindEvents();
        
        // 初始化货币系统
        currencyManager.load();
    }

    private registerPages(): void {
        // 注册所有页面
        this.pageManager.registerPage('main', this.renderMainPage.bind(this), this.cleanupMainPage.bind(this));
        this.pageManager.registerPage('garden', this.renderGardenPage.bind(this), this.cleanupGardenPage.bind(this));
        this.pageManager.registerPage('equipment', this.renderEquipmentPage.bind(this), this.cleanupEquipmentPage.bind(this));
    }

    private bindEvents(): void {
        // 绑定全局事件
        this.eventBus.on('pageChange', (pageName: PageType) => this.showPage(pageName));
        this.eventBus.on('gardenUpdate', () => this.updateGardenUI());
    }

    showPage(pageName: PageType): void {
        console.log(`切换到页面: ${pageName}`);
        
        // 清理当前页面
        this.cleanupCurrentPage();
        
        // 更新当前页面状态
        this.currentPage = pageName;
        
        // 渲染新页面
        this.pageManager.renderPage(pageName);
        
        // 触发页面切换事件
        this.eventBus.emit('pageRendered', pageName);
    }

    private cleanupCurrentPage(): void {
        if (this.currentPage) {
            this.pageManager.cleanupPage(this.currentPage);
        }
    }

    // 页面渲染方法 - 使用组件化架构
    private renderMainPage(): void {
        const container = document.getElementById('app');
        if (!container) return;
        
        const currencies = [
            CurrencyComponent.coin(currencyManager.gold),
            CurrencyComponent.silver(currencyManager.silver)
        ];
        
        const buttons = [
            ButtonComponent.nav('家园', 'garden'),
            ButtonComponent.nav('背包', 'equipment')
        ];
        
        UIUtils.render(container, LayoutComponent.main(currencies, buttons));
        
        // 绑定导航事件
        container.querySelectorAll('[data-page]').forEach(btn => {
            btn.addEventListener('click', (e: Event) => {
                const target = e.target as HTMLElement;
                this.eventBus.emit('pageChange', target.dataset.page as PageType);
            });
        });
    }

    private renderGardenPage(): void {
        const container = document.getElementById('app');
        if (!container) return;
        
        const currencies = [
            CurrencyComponent.coin(currencyManager.gold),
            CurrencyComponent.silver(currencyManager.silver),
            CurrencyComponent.crystal(currencyManager.crystal)
        ];
        
        const actions = [
            ButtonComponent.primary('控制台', 'console-btn'),
            ButtonComponent.primary('背包', 'bag-btn')
        ];
        
        UIUtils.render(container, LayoutComponent.garden(currencies, actions));
        
        // 绑定返回主页按钮
        const homeBtn = document.getElementById('home-btn');
        if (homeBtn) {
            homeBtn.addEventListener('click', () => {
                this.eventBus.emit('pageChange', 'main');
            });
        }

        // 初始化家园逻辑
        this.initGardenLogic();
    }

    private renderEquipmentPage(): void {
        const container = document.getElementById('app');
        if (!container) return;
        
        const currencies = [
            CurrencyComponent.coin(currencyManager.gold),
            CurrencyComponent.silver(currencyManager.silver)
        ];
        
        UIUtils.render(container, LayoutComponent.equipment(currencies));
        
        // 添加返回按钮
        this.backButton = new BackButton(() => {
            this.eventBus.emit('pageChange', 'main');
        }, '返回主页');
        if (this.backButton.getElement()) {
            container.appendChild(this.backButton.getElement()!);
        }

        // 初始化装备背包
        this.initEquipmentGrid();
    }

    // 清理方法
    private cleanupMainPage(): void {
        // 主页面清理逻辑
    }

    private cleanupGardenPage(): void {
        // 清理家园相关资源
        if (window.garden) {
            // 清理定时器等
        }
        // 清理模态框
        if (this.bagModal) {
            this.bagModal.destroy();
            this.bagModal = null;
        }
        if (this.consoleModal) {
            this.consoleModal.destroy();
            this.consoleModal = null;
        }
    }

    private cleanupEquipmentPage(): void {
        // 装备页面清理逻辑
        if (this.backButton) {
            this.backButton.destroy();
            this.backButton = null;
        }
    }

    // 初始化方法
    private initGardenLogic(): void {
        // 初始化家园游戏逻辑
        if (typeof initGardenGame === 'function') {
            initGardenGame(this.eventBus);
        }
        
        // 绑定事件
        this.bindGardenEvents();
    }

    private bindGardenEvents(): void {
        // 控制台按钮 - 使用模态框
        const consoleBtn = document.getElementById('console-btn');
        if (consoleBtn) {
            consoleBtn.addEventListener('click', () => {
                this.showConsoleModal();
            });
        }
        
        // 背包按钮 - 使用模态框
        const bagBtn = document.getElementById('bag-btn');
        if (bagBtn) {
            bagBtn.addEventListener('click', () => {
                this.showBagModal();
            });
        }
    }

    private showConsoleModal(): void {
        const consoleContent = `
            <h3>控制台</h3>
            <div style="margin-bottom:10px; position:relative;">
                <label>果树类型:</label>
                <select id="tree-type-select"></select>
                <label>等级:</label>
                <select id="tree-level-select"></select>
                <button id="generate-tree-btn">生成果树</button>
            </div>
            <div style="margin-bottom:10px;">
                <label>精灵类型:</label>
                <select id="sprite-cat-select"></select>
                <label>等级:</label>
                <select id="sprite-level-select"></select>
                <button id="generate-sprite-btn">生成精灵</button>
            </div>
        `;

        this.consoleModal = new Modal(consoleContent, {
            width: '500px',
            closeOnOutsideClick: true
        });

        // 初始化控制台
        setTimeout(() => {
            initConsoleSelects();
            initSpriteSelects();
            this.bindConsoleEvents();
        }, 0);
    }

    private showBagModal(): void {
        const bagContent = `
            <h3>背包</h3>
            <div id="backpack-grid"></div>
            <div style="margin-top:12px;">
                <button id="harvest-btn">一键收纳</button>
                <button id="combine-btn">一键合成</button>
            </div>
        `;

        this.bagModal = new Modal(bagContent, {
            width: '600px',
            closeOnOutsideClick: true
        });

        // 初始化背包
        setTimeout(() => {
            if (window.garden) {
                window.garden.renderBackpack();
            }
            this.bindBagEvents();
        }, 0);
    }

    private bindConsoleEvents(): void {
        // 控制台生成按钮
        const generateTreeBtn = document.getElementById('generate-tree-btn');
        const generateSpriteBtn = document.getElementById('generate-sprite-btn');
        
        if (generateTreeBtn) {
            generateTreeBtn.addEventListener('click', () => {
                consoleGenerateTree();
            });
        }
        
        if (generateSpriteBtn) {
            generateSpriteBtn.addEventListener('click', () => {
                consoleGenerateSprite();
            });
        }
    }

    private bindBagEvents(): void {
        // 功能按钮
        const harvestBtn = document.getElementById('harvest-btn');
        const combineBtn = document.getElementById('combine-btn');
        
        if (harvestBtn) {
            harvestBtn.addEventListener('click', () => {
                if (window.garden) window.garden.harvestFruits();
            });
        }
        
        if (combineBtn) {
            combineBtn.addEventListener('click', () => {
                combineBackpack();
            });
        }
    }

    private initEquipmentGrid(): void {
        const container = document.getElementById('equipment-grid');
        if (!container) return;
        
        for (let i = 0; i < 60; i++) {
            const slot = document.createElement('div');
            slot.classList.add('equipment-slot');
            slot.textContent = '空';
            container.appendChild(slot);
        }
    }

    private updateGardenUI(): void {
        if (this.currentPage === 'garden' && window.garden) {
            window.garden.updateUI();
        }
    }

    // 获取事件总线实例
    getEventBus(): EventBus {
        return this.eventBus;
    }
}

// 全局类型声明
declare global {
    interface Window {
        garden: any;
        gameManager: GameManager;
    }
    
    function initGardenGame(eventBus: EventBus): void;
    function initConsoleSelects(): void;
    function consoleGenerateTree(): void;
    function consoleGenerateSprite(): void;
    function combineBackpack(): void;
}
