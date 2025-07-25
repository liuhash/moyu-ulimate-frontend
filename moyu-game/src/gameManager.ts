/***** gameManager.ts - SPA游戏管理器 *****/
import type { PageType, IPage } from './types.js';
import { EventEmitter } from './eventBus.js';
import { CurrencyDisplay, ButtonComponent, LayoutComponent, UIUtils } from './components';
import { ModalComponent } from './components/modal';
import { BackpackComponent, BackpackItem } from './components/backpack';
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

import { BackButtonComponent } from './components/backButton';

export class GameManager {
    private currentPage: PageType = 'main';
    private eventBus: EventEmitter;
    private pageManager: PageManager;
    private bagModal: ModalComponent | null = null;
    private consoleModal: ModalComponent | null = null;
    private equipmentModal: ModalComponent | null = null;

    constructor() {
        this.eventBus = new EventEmitter();
        this.pageManager = new PageManager();
        this.init();
    }

    private init(): void {
        this.registerPages();
        this.showPage('main');
        this.bindEvents();
        
        // 初始化货币系统
        currencyManager.load();
        
        // 监听货币变化
        currencyManager.onCurrencyChange((type, _value) => {
            if (type === 'all') {
                this.updateAllCurrencyDisplays();
            } else {
                this.updateCurrencyDisplay(type);
            }
        });
    }

    private updateCurrencyDisplay(type: string): void {
        // 使用防抖处理更新
        UIUtils.debounce(`currency-${type}`, () => {
            const elements = document.querySelectorAll(`[data-currency="${type}"]`);
            let value = '0';
            
            switch (type) {
                case 'gold':
                    value = currencyManager.gold.toLocaleString();
                    break;
                case 'silver':
                    value = currencyManager.silver.toLocaleString();
                    break;
                case 'crystal':
                    value = currencyManager.crystal.toLocaleString();
                    break;
            }

            elements.forEach(element => {
                UIUtils.updateWithAnimation(element as HTMLElement, value, {
                    duration: 500,
                    animationClass: 'currency-update'
                });
            });
        });
    }

    private updateAllCurrencyDisplays(): void {
        ['gold', 'silver', 'crystal'].forEach(type => {
            this.updateCurrencyDisplay(type);
        });
    }

    private registerPages(): void {
        // 注册所有页面
        this.pageManager.registerPage('main', this.renderMainPage.bind(this), this.cleanupMainPage.bind(this));
        this.pageManager.registerPage('garden', this.renderGardenPage.bind(this), this.cleanupGardenPage.bind(this));
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
            CurrencyDisplay.coin(currencyManager.gold),
            CurrencyDisplay.silver(currencyManager.silver)
        ];
        
        const buttons = [
            ButtonComponent.primary('家园', 'garden-btn'),
            ButtonComponent.primary('装备背包', 'equipment-btn')
        ];
        
        UIUtils.render(container, LayoutComponent.main(currencies, buttons));
        
        // 绑定装备背包按钮事件
        const equipmentBtn = document.getElementById('equipment-btn');
        if (equipmentBtn) {
            equipmentBtn.addEventListener('click', () => {
                this.showEquipmentModal();
            });
        }
        
        // 绑定家园按钮事件
        const gardenBtn = document.getElementById('garden-btn');
        if (gardenBtn) {
            gardenBtn.addEventListener('click', () => {
                this.eventBus.emit('pageChange', 'garden');
            });
        }
    }

    private renderGardenPage(): void {
        const container = document.getElementById('app');
        if (!container) return;
        
        const currencies = [
            CurrencyDisplay.coin(currencyManager.gold),
            CurrencyDisplay.silver(currencyManager.silver),
            CurrencyDisplay.crystal(currencyManager.crystal)
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
            <div class="console-section">
                <label>果树类型:</label>
                <select id="tree-type-select"></select>
                <label>等级:</label>
                <select id="tree-level-select"></select>
                <button id="generate-tree-btn">生成果树</button>
            </div>
            <div class="console-section">
                <label>精灵类型:</label>
                <select id="sprite-cat-select"></select>
                <label>等级:</label>
                <select id="sprite-level-select"></select>
                <button id="generate-sprite-btn">生成精灵</button>
            </div>
        `;

        this.consoleModal = new ModalComponent(consoleContent, {
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
        // 在家园中的背包
        if (this.bagModal) {
            this.bagModal.destroy();
        }

        // 从garden实例获取背包物品
        const items = window.garden ? this.getGardenBackpackItems() : [];
        const backpack = new BackpackComponent(items, 12, 5);
        
        const bagContent = `
            <div class="modal-header">
                <h3>家园背包</h3>
            </div>
            <div class="modal-body">
                <div id="garden-backpack-container">
                    ${backpack.render()}
                </div>
                <div class="backpack-actions">
                    <button id="harvest-btn" class="btn-primary">一键收纳</button>
                    <button id="combine-btn" class="btn-primary">一键合成</button>
                </div>
            </div>
        `;

        this.bagModal = new ModalComponent(bagContent, {
            width: '600px',
            closeOnOutsideClick: true
        });

        // 绑定事件
        this.bindBagEvents();
    }

    private showEquipmentModal(): void {
        // 主界面的装备背包
        if (this.equipmentModal) {
            this.equipmentModal.destroy();
        }

        // 这里应该从某个装备管理器获取装备列表
        const items = this.getEquipmentItems();
        const backpack = new BackpackComponent(items, 12, 5);
        
        const equipmentContent = `
            <div class="modal-header">
                <h3>装备背包</h3>
            </div>
            <div class="modal-body">
                <div id="equipment-backpack-container">
                    ${backpack.render()}
                </div>
            </div>
        `;

        this.equipmentModal = new ModalComponent(equipmentContent, {
            width: '800px',
            closeOnOutsideClick: true
        });
    }

    private getGardenBackpackItems(): BackpackItem[] {
        if (!window.garden || !window.garden.player || !window.garden.player.backpack) {
            return [];
        }

        return Object.entries(window.garden.player.backpack).map(([key, count]) => {
            const [category, levelStr] = key.split('-');
            const level = parseInt(levelStr || '0');
            let icon = '', name = '';

            if (category === 'tree') {
                icon = `/UIs/trees/tree-${level}.png`;
                name = `${level}级树`;
            } else if (category === 'fruit') {
                icon = `/UIs/fruits/fruit-${level}.png`;
                name = `${level}级果实`;
            }

            return {
                icon,
                name,
                count: count as number,
                category,
                level
            };
        });
    }

    private getEquipmentItems(): BackpackItem[] {
        // TODO: 实现装备列表获取逻辑
        return [];
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



    private updateGardenUI(): void {
        if (this.currentPage === 'garden' && window.garden) {
            window.garden.updateUI();
        }
    }

    // 获取事件总线实例
    getEventBus(): EventEmitter {
        return this.eventBus;
    }
}

// 全局类型声明
declare global {
    interface Window {
        garden: any;
        gameManager: GameManager;
    }
    
    function initGardenGame(eventBus: EventEmitter): void;
    function initConsoleSelects(): void;
    function consoleGenerateTree(): void;
    function consoleGenerateSprite(): void;
    function combineBackpack(): void;
}
