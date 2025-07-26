/***** gameManager.ts - SPA游戏管理器 *****/
import type { PageType, IPage } from './types.js';
import { EventEmitter } from './eventBus.js';
import { CurrencyDisplay, ButtonComponent, LayoutComponent, UIUtils } from './components';
import { ModalComponent } from './components/modal';
import { BackpackComponent, BackpackItem } from './components/backpack';
import { initSpriteSelects } from './sprite.js';
import { currencyManager } from './currency.js';
import { fruitNames } from './fruits.js';
import { Tree } from './trees.js';

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

export class GameManager {
    private currentPage: PageType = 'main';
    private eventBus: EventEmitter;
    private pageManager: PageManager;
    private bagModal: ModalComponent | null = null;
    private consoleModal: ModalComponent | null = null;
    private currencyModal: ModalComponent | null = null;
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
        
        // 添加货币控制台按钮（右下角）
        const currencyConsoleBtn = document.createElement('button');
        currencyConsoleBtn.id = 'currency-console-btn';
        currencyConsoleBtn.className = 'currency-console-btn';
        currencyConsoleBtn.textContent = '💰';
        currencyConsoleBtn.title = '货币控制台';
        container.appendChild(currencyConsoleBtn);
        
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
        
        // 绑定货币控制台按钮事件
        currencyConsoleBtn.addEventListener('click', () => {
            this.showCurrencyConsoleModal();
        });
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
        
        // 清理背包刷新定时器
        if (this.bagRefreshTimer) {
            clearInterval(this.bagRefreshTimer);
            this.bagRefreshTimer = null;
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
                <button id="generate-seed-btn">生成种子</button>
            </div>
            <div class="console-section">
                <label>果树类型:</label>
                <select id="tree-type-select"></select>
                <button id="generate-tree-btn">生成果树</button>
            </div>
            <div class="console-section">
                <label>精灵类型:</label>
                <select id="sprite-cat-select"></select>
                <label>等级:</label>
                <select id="sprite-level-select"></select>
                <button id="generate-sprite-btn">生成精灵</button>
            </div>
            <div class="console-section">
                <button id="harvest-one-btn">采集一次</button>
                <button id="harvest-all-btn">采集所有果树</button>
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

    private showCurrencyConsoleModal(): void {
        const currencyConsoleContent = `
            <h3>货币控制台</h3>
            <div class="currency-console-section">
                <div class="currency-item">
                    <label>金币:</label>
                    <input type="number" id="gold-input" placeholder="输入金币数量" min="0" value="${currencyManager.gold}">
                </div>
                <div class="currency-item">
                    <label>银两:</label>
                    <input type="number" id="silver-input" placeholder="输入银两数量" min="0" value="${currencyManager.silver}">
                </div>
                <div class="currency-item">
                    <label>灵晶:</label>
                    <input type="number" id="crystal-input" placeholder="输入灵晶数量" min="0" value="${currencyManager.crystal}">
                </div>
                <div class="currency-actions">
                    <button id="apply-currency-btn" class="primary-btn">应用更改</button>
                    <button id="reset-currency-btn" class="danger-btn">重置所有货币</button>
                </div>
            </div>
        `;

        this.currencyModal = new ModalComponent(currencyConsoleContent, {
            width: '400px',
            closeOnOutsideClick: true
        });

        // 绑定货币控制事件
        setTimeout(() => {
            this.bindCurrencyConsoleEvents();
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
                <p style="font-size: 12px; color: #666; margin: 5px 0;">
                    提示：点击物品即可自动放置到家园空格子中
                </p>
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
        
        // 启动定期刷新机制，每500ms检查一次背包变化
        this.startBagRefreshTimer();
    }

    private startBagRefreshTimer(): void {
        if (this.bagRefreshTimer) {
            clearInterval(this.bagRefreshTimer);
        }
        
        let lastBackpackState = window.garden ? JSON.stringify(window.garden.player.backpack) : '';
        
        this.bagRefreshTimer = setInterval(() => {
            if (!this.bagModal || !window.garden) {
                if (this.bagRefreshTimer) {
                    clearInterval(this.bagRefreshTimer);
                    this.bagRefreshTimer = null;
                }
                return;
            }
            
            const currentBackpackState = JSON.stringify(window.garden.player.backpack);
            if (currentBackpackState !== lastBackpackState) {
                this.refreshBagModal();
                lastBackpackState = currentBackpackState;
            }
        }, 500);
    }

    private bagRefreshTimer: NodeJS.Timeout | null = null;

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
            let category: string, level: number;
            let icon = '', name = '';

            // 特殊处理种子格式
            if (key === 'seed') {
                category = 'seed';
                level = 0;
                icon = `/UIs/trees/种子.png`;
                name = '种子';
            } else {
                // 处理 tree-X 和 fruit-X 格式
                const [cat, levelStr] = key.split('-');
                category = cat;
                level = parseInt(levelStr || '0');
                
                if (category === 'tree') {
                    const treeName = Tree.TREE_TYPES[level] || '果树';
                    icon = `/UIs/trees/${treeName}.png`;
                    name = `${level + 1}级树`;
                } else if (category === 'fruit') {
                    const fruitName = fruitNames[level] || '果';
                    icon = `/UIs/fruits/${fruitName}.png`;
                    name = fruitNames[level] || '未知果实';
                }
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
        const generateSeedBtn = document.getElementById('generate-seed-btn');
        const generateTreeBtn = document.getElementById('generate-tree-btn');
        const generateSpriteBtn = document.getElementById('generate-sprite-btn');
        const harvestOneBtn = document.getElementById('harvest-one-btn');
        const harvestAllBtn = document.getElementById('harvest-all-btn');
        
        if (generateSeedBtn) {
            generateSeedBtn.addEventListener('click', () => {
                consoleGenerateSeed();
            });
        }
        
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
        
        if (harvestOneBtn) {
            harvestOneBtn.addEventListener('click', () => {
                consoleHarvestOneFruit();
            });
        }
        
        if (harvestAllBtn) {
            harvestAllBtn.addEventListener('click', () => {
                consoleHarvestAllTrees();
            });
        }
    }

    private bindCurrencyConsoleEvents(): void {
        // 货币控制按钮
        const applyCurrencyBtn = document.getElementById('apply-currency-btn');
        const resetCurrencyBtn = document.getElementById('reset-currency-btn');
        
        const goldInput = document.getElementById('gold-input') as HTMLInputElement;
        const silverInput = document.getElementById('silver-input') as HTMLInputElement;
        const crystalInput = document.getElementById('crystal-input') as HTMLInputElement;
        
        // 应用货币更改
        if (applyCurrencyBtn) {
            applyCurrencyBtn.addEventListener('click', () => {
                const goldAmount = parseInt(goldInput.value) || 0;
                const silverAmount = parseInt(silverInput.value) || 0;
                const crystalAmount = parseInt(crystalInput.value) || 0;
                
                // 设置货币数量
                currencyManager.gold = 0;
                currencyManager.silver = 0;
                currencyManager.crystal = 0;
                
                currencyManager.addGold(goldAmount);
                currencyManager.addSilver(silverAmount);
                currencyManager.addCrystal(crystalAmount);
                currencyManager.save();
                
                console.log(`货币已更新 - 金币: ${goldAmount}, 银两: ${silverAmount}, 灵晶: ${crystalAmount}`);
                
                // 关闭模态框
                if (this.currencyModal) {
                    this.currencyModal.destroy();
                    this.currencyModal = null;
                }
            });
        }
        
        // 重置所有货币
        if (resetCurrencyBtn) {
            resetCurrencyBtn.addEventListener('click', () => {
                if (confirm('确定要重置所有货币为0吗？此操作不可撤销！')) {
                    currencyManager.reset();
                    console.log('所有货币已重置为0');
                    
                    // 更新输入框显示
                    if (goldInput) goldInput.value = '0';
                    if (silverInput) silverInput.value = '0';
                    if (crystalInput) crystalInput.value = '0';
                }
            });
        }
    }

    private refreshBagModal(): void {
        if (!this.bagModal) return;
        
        // 重新获取背包物品
        const items = window.garden ? this.getGardenBackpackItems() : [];
        const backpack = new BackpackComponent(items, 12, 5);
        
        // 更新背包容器内容
        const container = document.getElementById('garden-backpack-container');
        if (container) {
            container.innerHTML = backpack.render();
        }
    }

    private bindBagEvents(): void {
        // 功能按钮
        const harvestBtn = document.getElementById('harvest-btn');
        const combineBtn = document.getElementById('combine-btn');
        
        if (harvestBtn) {
            harvestBtn.addEventListener('click', () => {
                if (window.garden) {
                    window.garden.harvestFruits();
                    // 立即刷新背包UI（双重保险）
                    setTimeout(() => this.refreshBagModal(), 100);
                }
            });
        }
        
        if (combineBtn) {
            combineBtn.addEventListener('click', () => {
                combineBackpack();
                // 立即刷新背包UI（双重保险）
                setTimeout(() => this.refreshBagModal(), 100);
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
    function consoleGenerateSeed(): void;
    function consoleGenerateTree(): void;
    function consoleHarvestOneFruit(): void;
    function consoleHarvestAllTrees(): void;
    function consoleGenerateSprite(): void;
    function combineBackpack(): void;
}
