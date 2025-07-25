/***** garden.ts - 家园游戏核心逻辑 *****/
import { EventEmitter } from './eventBus.js';
import { BackpackComponent } from './components/backpack';
import { spriteManager } from './sprite.js';
import type { SpriteObject } from './types.js';

// 水果名称与价值
const fruitNames: string[] = ["果", "草莓", "香蕉", "菠萝", "葡萄", "猕猴桃", "石榴", "苹果", "梨", "山楂", "桃", "李子", "樱桃", "核桃", "板栗", "银杏"];
const fruitValues: number[] = [100, 220, 484, 1064, 2342, 5153, 11338, 24943, 54875, 120726, 265597, 584314, 1285491, 2828080, 6221776, 13687907];

// 玩家类
class Player {
    public silver: number = 0;
    public crystal: number = 0;
    // key -> count  例如 tree-1 、 fruit-2
    public backpack: { [key: string]: number } = {};

    /**
     * 增加物品
     * @param category  "tree" | "fruit"
     * @param level     等级
     * @param count     数量
     */
    addItem(category: string, level: number, count: number = 1): void {
        const key = `${category}-${level}`;
        this.backpack[key] = (this.backpack[key] || 0) + count;
    }

    removeItem(category: string, level: number, count: number = 1): boolean {
        const key = `${category}-${level}`;
        if (!this.backpack[key] || this.backpack[key] < count) return false;
        this.backpack[key] -= count;
        if (this.backpack[key] === 0) delete this.backpack[key];
        return true;
    }
}

// 果树类
class Tree {
    static TREE_TYPES: string[] = [
        "种子", "果树", "草莓树", "香蕉树", "菠萝树", "葡萄树", "猕猴桃树", "石榴树", "苹果树", "梨树", "山楂树", "桃树", "李子树", "樱桃树", "核桃树", "板栗树", "银杏树"
    ];

    constructor(public level: number) {}

    getFruitType(): string {
        return Tree.TREE_TYPES[this.level] || "未知";
    }
}

// 水果类
class Fruit {
    constructor(public level: number) {}

    getFruitType(): string {
        return fruitNames[this.level] || "未知";
    }

    getFruitValue(): number {
        return fruitValues[this.level] || 0;
    }
}

// 家园类
class Garden {
    public len: number = 15; // 15×8
    public high:number=8;
    public grid: (Tree | Fruit | null)[][] = Array.from({ length: this.high }, () => Array(this.len).fill(null));
    public player: Player = new Player();

    constructor() {
        this.updateUI();
    }

    /* 生成种子 —— 直接放到场地第一块空地 */
    generateSeed(): void {
        for (let x = 0; x < this.high; x++) {
            for (let y = 0; y < this.len; y++) {
                if (!this.grid[x]?.[y]) {
                    this.grid[x]![y] = new Tree(0);
                    this.updateUI();
                    return;
                }
            }
        }
        alert('场地已满，无法生成种子');
    }

    /* 合并或者移动树 */
    private getItemIcon(category: string, level: number): string {
        if (category === 'tree') {
            return `/UIs/trees/tree-${level}.png`;
        } else if (category === 'fruit') {
            return `/UIs/fruits/fruit-${level}.png`;
        }
        return '';
    }

    private getItemName(category: string, level: number): string {
        if (category === 'tree') {
            return Tree.TREE_TYPES[level] || '未知树';
        } else if (category === 'fruit') {
            return fruitNames[level] || '未知果';
        }
        return '未知物品';
    }

    mergeOrMoveTree(sx: number, sy: number, dx: number, dy: number): void {
        const source = this.grid[sx]?.[sy];
        const dest = this.grid[dx]?.[dy];
        if (!(source instanceof Tree)) return;

        // 同等级合成
        if (dest instanceof Tree && dest.level === source.level) {
            this.grid[dx]![dy] = new Tree(dest.level + 1);
            this.grid[sx]![sy] = null;
        } else if (!dest) {
            // 仅移动
            this.grid[dx]![dy] = source;
            this.grid[sx]![sy] = null;
        }
        this.updateUI();
    }

    /* 收获场上所有水果（Fruit 对象）和种子（level0 Tree）到背包 */
    harvestFruits(): void {
        for (let x = 0; x < this.high; x++) {
            for (let y = 0; y < this.len; y++) {
                const cell = this.grid[x]?.[y];
                if (cell instanceof Fruit) {
                    this.player.addItem('fruit', cell.level, 1);
                    this.grid[x]![y] = null;
                } else if (cell instanceof Tree && cell.level === 0) {
                    this.player.addItem('tree', 0, 1);
                    this.grid[x]![y] = null;
                }
            }
        }
        this.updateUI();
    }

    updateUI(): void {
        const gardenElement = document.getElementById('garden');
        if (!gardenElement) return;
        
        gardenElement.innerHTML = '';
        
        // 添加花园整体的拖拽事件
        gardenElement.addEventListener('dragover', (e: DragEvent) => e.preventDefault());
        gardenElement.addEventListener('drop', (e: DragEvent) => this.handleGardenDrop(e));
        
        for (let i = 0; i < this.high; i++) {
            for (let j = 0; j < this.len; j++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.x = i.toString();
                cell.dataset.y = j.toString();
                // 无论格子内容如何，均允许拖拽释放
                cell.addEventListener('dragover', (e: DragEvent) => e.preventDefault());
                cell.addEventListener('drop', (e: DragEvent) => this.handleDrop(e, i, j));

                if (this.grid[i]?.[j] instanceof Tree) {
                    const tree = this.grid[i]![j] as Tree;
                    if (tree.level === 0) {
                        cell.classList.add('seed');
                        cell.textContent = `🌱`;
                    } else {
                        cell.classList.add('tree');
                        cell.textContent = `🌳 L${tree.level} ${tree.getFruitType()}`;
                    }
                    cell.draggable = true;
                    cell.addEventListener('dragstart', (e: DragEvent) => this.handleDragStart(e, i, j));
                } else if (this.grid[i]?.[j] instanceof Fruit) {
                    const fruit = this.grid[i]![j] as Fruit;
                    cell.classList.add('fruit');
                    cell.textContent = `🍎 ${fruit.getFruitType()}`;
                }
                cell.addEventListener('click', () => this.handleCellClick(i, j));
                gardenElement.appendChild(cell);
            }
        }
        
        // 渲染所有精灵
        spriteManager.renderAllSprites(gardenElement);
        
        // 更新货币显示
        const silverElement = document.getElementById('silver');
        const crystalElement = document.getElementById('crystal');
        if (silverElement) silverElement.textContent = this.player.silver.toString();
        if (crystalElement) crystalElement.textContent = this.player.crystal.toString();
    }

    /**
     * 只更新精灵显示，不重新渲染整个花园
     */
    updateSpritesOnly(): void {
        const gardenElement = document.getElementById('garden');
        if (!gardenElement) return;
        
        spriteManager.renderAllSprites(gardenElement);
    }

    private handleDragStart = (e: DragEvent, x: number, y: number): void => {
        if (e.dataTransfer) {
            e.dataTransfer.setData('source', 'grid');
            e.dataTransfer.setData('x', x.toString());
            e.dataTransfer.setData('y', y.toString());
        }
    };

    private handleGardenDrop = (e: DragEvent): void => {
        if (!e.dataTransfer) return;
        
        const source = e.dataTransfer.getData('source');
        if (source === 'sprite') {
            const sx = parseFloat(e.dataTransfer.getData('x'));
            const sy = parseFloat(e.dataTransfer.getData('y'));
            
            // 计算拖拽位置相对于花园的坐标
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const cellWidth = rect.width / this.len;  // 动态计算单元格宽度
            const cellHeight = rect.height / this.high;  // 动态计算单元格高度
            const x = (e.clientX - rect.left) / cellWidth;
            const y = (e.clientY - rect.top) / cellHeight;
            
            console.log(`花园拖拽: 从 (${sx}, ${sy}) 到 (${x.toFixed(2)}, ${y.toFixed(2)})`);
            
            // 处理精灵移动和合并
            const result = spriteManager.moveSprite(sx, sy, x, y);
            console.log('移动结果:', result);
            
            // 强制更新UI
            setTimeout(() => {
                this.updateSpritesOnly();
            }, 50);
        }
    };

    private handleDrop = (e: DragEvent, x: number, y: number): void => {
        if (!e.dataTransfer) return;
        
        const source = e.dataTransfer.getData('source');
        if (source === 'grid') {
            const sx = parseInt(e.dataTransfer.getData('x'));
            const sy = parseInt(e.dataTransfer.getData('y'));
            this.mergeOrMoveTree(sx, sy, x, y);
        } else if (source === 'backpack') {
            const category = e.dataTransfer.getData('category');
            const level = parseInt(e.dataTransfer.getData('level'));
            if (category === 'tree') {
                if (!this.grid[x]?.[y]) {
                    this.grid[x]![y] = new Tree(level);
                    this.player.removeItem('tree', level, 1);
                } else if (this.grid[x]?.[y] instanceof Tree && this.grid[x]![y]!.level === level) {
                    this.grid[x]![y] = new Tree(level + 1);
                    this.player.removeItem('tree', level, 1);
                }
                this.updateUI();
            } else if (category === 'fruit') {
                if (!this.grid[x]?.[y]) {
                    this.grid[x]![y] = new Fruit(level);
                    this.player.removeItem('fruit', level, 1);
                    this.updateUI();
                }
            }
        } else if (source === 'sprite') {
            const sx = parseFloat(e.dataTransfer.getData('x'));
            const sy = parseFloat(e.dataTransfer.getData('y'));
            const targetX = x + 0.5; // 将格子坐标转换为连续坐标
            const targetY = y + 0.5;
            
            // 处理精灵移动和合并
            spriteManager.moveSprite(sx, sy, targetX, targetY);
            // 只更新精灵显示，不重新渲染整个花园
            this.updateSpritesOnly();
        }
    };

    /* 点击水果出售 */
    private handleCellClick = (x: number, y: number): void => {
        const cell = this.grid[x]?.[y];
        if (cell instanceof Fruit) {
            const confirmSell = confirm(`出售所有 ${fruitNames[cell.level] || '未知'} 吗？`);
            if (confirmSell) {
                let count = 0;
                for (let i = 0; i < this.high; i++) {
                    for (let j = 0; j < this.len; j++) {
                        if (this.grid[i]?.[j] instanceof Fruit && this.grid[i]![j]!.level === cell.level) {
                            count++;
                            this.grid[i]![j] = null;
                        }
                    }
                }
                const totalValue = count * (fruitValues[cell.level] || 0);
                this.player.silver += totalValue;
                this.updateUI();
            }
        }
    }

    /* --------------- 背包渲染 --------------- */
    renderBackpack(): void {
        const container = document.getElementById('garden-backpack-container');
        if (!container) return;

        // 使用BackpackComponent渲染背包
        const items = Object.entries(this.player.backpack).map(([key, count]) => {
            const [category, level] = key.split('-');
            return {
                icon: this.getItemIcon(category, parseInt(level)),
                name: this.getItemName(category, parseInt(level)),
                count: count,
                category: category,
                level: parseInt(level)
            };
        });

        const backpack = new BackpackComponent(items, 12, 5);
        container.innerHTML = backpack.render();

        // 为每个物品添加拖拽事件
        const cells = container.querySelectorAll('.backpack-item');
        cells.forEach(cell => {
            (cell as HTMLElement).draggable = true;
            cell.addEventListener('dragstart', (e: Event) => {
                const dragEvent = e as DragEvent;
                const item = items[parseInt((cell.parentElement as HTMLElement).dataset.index || '0')];
                if (dragEvent.dataTransfer && item) {
                    dragEvent.dataTransfer.setData('source', 'backpack');
                    dragEvent.dataTransfer.setData('category', item.category);
                    dragEvent.dataTransfer.setData('level', item.level.toString());
                }
            });
        });
    }
}

// 全局 garden 实例
let garden: Garden | null = null;

/* ---------------- 家园游戏初始化函数 ---------------- */
export function initGardenGame(eventBus: EventEmitter): void {
    // 创建花园实例
    garden = new Garden();
    (window as any).garden = garden;
    
    // 初始化控制台
    initConsoleSelects();
    
    // 绑定事件
    bindGardenEvents(eventBus);
    
    // 触发UI更新
    garden.updateUI();
}

function bindGardenEvents(_eventBus: EventEmitter): void {
    // 事件绑定现在由GameManager处理
    // 这里只保留必要的初始化逻辑
}

/* ---------------- 控制台初始化 ---------------- */
export function initConsoleSelects(): void {
    const treeLevelSel = document.getElementById('tree-level-select') as HTMLSelectElement;
    const treeTypeSel = document.getElementById('tree-type-select') as HTMLSelectElement;

    if (treeLevelSel && treeLevelSel.children.length === 0) {
        for (let i = 1; i <= 16; i++) {
            const opt = document.createElement('option');
            opt.value = i.toString();
            opt.textContent = `L${i}`;
            treeLevelSel.appendChild(opt);
        }
    }

    if (treeTypeSel && treeTypeSel.children.length === 0) {
        Tree.TREE_TYPES.forEach((name, idx) => {
            const opt = document.createElement('option');
            opt.value = idx.toString();
            opt.textContent = name;
            treeTypeSel.appendChild(opt);
        });
    }


}

export function consoleGenerateTree(): void {
    const level = parseInt((document.getElementById('tree-level-select') as HTMLSelectElement)?.value || '1');
    // 目前 typeIdx 未使用，但保留供未来功能扩展
    // const typeIdx = parseInt((document.getElementById('tree-type-select') as HTMLSelectElement)?.value || '0');
    // 在场上找到第一空格并放置指定等级树
    if (!garden) return;
    
    for (let x = 0; x < garden.high; x++) {
        for (let y = 0; y < garden.len; y++) {
            if (!garden.grid[x]?.[y]) {
                garden.grid[x]![y] = new Tree(level);
                garden.updateUI();
                return;
            }
        }
    }
    alert('没有空余格子');
}

/* --------------------------- 背包 UI --------------------------- */
export function renderBackpack(): void {
    // 已初始化后调用实例方法
    if ((window as any).garden) {
        (window as any).garden.renderBackpack();
    }
}

/* --------------------------- 合成按钮 --------------------------- */
export function combineBackpack(): void {
    if (!garden) return;
    
    let combined = false;
    // 策略：遍历两次，先树再水果
    ['tree', 'fruit'].forEach(category => {
        const maxLevel = category === 'tree' ? Tree.TREE_TYPES.length - 1 : fruitNames.length - 1;
        for (let level = 0; level < maxLevel; level++) {
            const key = `${category}-${level}`;
            // const nextKey = `${category}-${level + 1}`; // 未使用的变量，已注释掉
            while ((garden!.player.backpack[key] || 0) >= 2) {
                garden!.player.removeItem(category, level, 2);
                garden!.player.addItem(category, level + 1, 1);
                combined = true;
            }
        }
    });
    if (!combined) {
        alert('不能合成');
    }
    garden.updateUI();
}

// 全局类型声明
declare global {
    interface Window {
        garden: any;
    }
}
