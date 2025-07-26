/***** garden.ts - 家园游戏核心逻辑 *****/
import { EventEmitter } from './eventBus.js';
import { BackpackComponent } from './components/backpack';
import { spriteManager } from './sprite.js';
import { Fruit, fruitNames, fruitValues } from './fruits.js';
import { Tree } from './trees.js';
import { ConfirmDialog } from './components/confirmDialog.js';
import { SpeedUpDialog } from './components/speedUpDialog.js';
import { currencyManager } from './currency.js';
import { Tooltip } from './components/tooltip.js';

// 玩家类
class Player {
    public silver: number = 0;
    public crystal: number = 0;
    // key -> count  例如 tree-1 、 fruit-2
    public backpack: { [key: string]: number } = {};

    /**
     * 增加物品
     * @param category  "tree" | "fruit" | "seed"
     * @param level     等级
     * @param count     数量
     */
    addItem(category: string, level: number, count: number = 1): void {
        // 种子使用特殊的key，不带等级
        const key = category === 'seed' ? 'seed' : `${category}-${level}`;
        this.backpack[key] = (this.backpack[key] || 0) + count;
    }

    removeItem(category: string, level: number, count: number = 1): boolean {
        // 种子使用特殊的key，不带等级
        const key = category === 'seed' ? 'seed' : `${category}-${level}`;
        
        if (!this.backpack[key] || this.backpack[key] < count) {
            return false;
        }
        
        this.backpack[key] -= count;
        if (this.backpack[key] === 0) delete this.backpack[key];
        return true;
    }
}

// 种子类
class Seed {
    constructor() {}

    getType(): string {
        return "种子";
    }
}

// 家园类
class Garden {
    public len: number = 15; // 15×8
    public high:number=8;
    public grid: (Tree | Fruit | Seed | null)[][] = Array.from({ length: this.high }, () => Array(this.len).fill(null));
    public player: Player = new Player();
    private progressUpdateInterval: number | null = null;

    constructor() {
        this.updateUI();
        this.startProgressUpdates();
    }

    /* 开始进度条更新定时器 */
    private startProgressUpdates(): void {
        if (this.progressUpdateInterval) {
            clearInterval(this.progressUpdateInterval);
        }
        
        this.progressUpdateInterval = window.setInterval(() => {
            this.updateTreeProgress();
        }, 1000); // 每秒更新一次
    }

    /* 更新所有果树的进度显示 */
    private updateTreeProgress(): void {
        let hasGrowingTrees = false;
        
        for (let x = 0; x < this.high; x++) {
            for (let y = 0; y < this.len; y++) {
                const cell = this.grid[x]?.[y];
                if (cell instanceof Tree && cell.isGrowing) {
                    hasGrowingTrees = true;
                    cell.updateGrowthStatus();
                }
            }
        }
        
        // 如果有正在结果的树，更新UI中的进度条
        if (hasGrowingTrees) {
            this.updateProgressBarsOnly();
        }
    }

    /* 只更新进度条，不重新渲染整个花园 */
    private updateProgressBarsOnly(): void {
        const gardenElement = document.getElementById('garden');
        if (!gardenElement) return;
        
        const cells = gardenElement.querySelectorAll('.cell');
        cells.forEach((cellElement, index) => {
            const x = Math.floor(index / this.len);
            const y = index % this.len;
            const tree = this.grid[x]?.[y];
            
            if (tree instanceof Tree && tree.isGrowing) {
                const progressContainer = cellElement.querySelector('.tree-progress-container');
                if (progressContainer) {
                    const progressFill = progressContainer.querySelector('.tree-progress-fill') as HTMLElement;
                    const timeDisplay = progressContainer.querySelector('.tree-progress-time') as HTMLElement;
                    
                    if (progressFill) {
                        progressFill.style.width = `${tree.getGrowthProgress() * 100}%`;
                    }
                    if (timeDisplay) {
                        timeDisplay.textContent = tree.getFormattedRemainingTime();
                    }
                }
            } else if (tree instanceof Tree && !tree.isGrowing) {
                // 如果果树结果完成，移除进度条并重新渲染
                const progressContainer = cellElement.querySelector('.tree-progress-container');
                if (progressContainer) {
                    this.updateUI(); // 重新渲染整个花园
                    return;
                }
            }
        });
    }

    /* 清理资源 */
    destroy(): void {
        if (this.progressUpdateInterval) {
            clearInterval(this.progressUpdateInterval);
            this.progressUpdateInterval = null;
        }
    }

    /* 生成种子 —— 直接放到场地第一块空地 */
    generateSeed(): void {
        for (let x = 0; x < this.high; x++) {
            for (let y = 0; y < this.len; y++) {
                if (!this.grid[x]?.[y]) {
                    this.grid[x]![y] = new Seed();
                    this.updateUI();
                    return;
                }
            }
        }
        alert('场地已满，无法生成种子');
    }

    /* 合并或者移动树 */
    private getItemIcon(category: string, level: number): string {
        if (category === 'seed') {
            return `/UIs/trees/种子.png`;
        } else if (category === 'tree') {
            const treeName = Tree.TREE_TYPES[level] || '果树';
            return `/UIs/trees/${treeName}.png`;
        } else if (category === 'fruit') {
            const fruitName = fruitNames[level] || '果';
            return `/UIs/fruits/${fruitName}.png`;
        }
        return '';
    }

    private getItemName(category: string, level: number): string {
        if (category === 'seed') {
            return '种子';
        } else if (category === 'tree') {
            return Tree.TREE_TYPES[level] || '未知树';
        } else if (category === 'fruit') {
            return fruitNames[level] || '未知果';
        }
        return '未知物品';
    }

    mergeOrSwapObjects(sx: number, sy: number, dx: number, dy: number): void {
        const source = this.grid[sx]?.[sy];
        const dest = this.grid[dx]?.[dy];
        
        // 如果源位置没有对象，直接返回
        if (!source) return;

        // 检查是否可以合并
        let canMerge = false;
        if (source instanceof Tree && dest instanceof Tree && dest.level === source.level) {
            // 同等级树合成（检查最大等级限制）
            if (dest.level < Tree.TREE_TYPES.length - 1) {
                this.grid[dx]![dy] = new Tree(dest.level + 1);
                this.grid[sx]![sy] = null;
                canMerge = true;
            }
        } else if (source instanceof Fruit && dest instanceof Fruit && dest.level === source.level) {
            // 同等级果实合成（检查最大等级限制）
            if (dest.level < fruitNames.length - 1) {
                this.grid[dx]![dy] = new Fruit(dest.level + 1);
                this.grid[sx]![sy] = null;
                canMerge = true;
            }
        } else if (source instanceof Seed && dest instanceof Seed) {
            // 两个种子合成1级树
            this.grid[dx]![dy] = new Tree(0);
            this.grid[sx]![sy] = null;
            canMerge = true;
        }
        
        if (!canMerge) {
            if (!dest) {
                // 移动到空格子
                this.grid[dx]![dy] = source;
                this.grid[sx]![sy] = null;
            } else {
                // 目标格子有对象但无法合并，交换位置
                // 支持所有类型的对象（树、种子、果实）
                this.grid[dx]![dy] = source;
                this.grid[sx]![sy] = dest;
            }
        }
        
        this.updateUI();
    }

    /* 收获场上所有水果（Fruit 对象）和种子（Seed 对象）到背包 */
    harvestFruits(): void {
        for (let x = 0; x < this.high; x++) {
            for (let y = 0; y < this.len; y++) {
                const cell = this.grid[x]?.[y];
                if (cell instanceof Fruit) {
                    this.player.addItem('fruit', cell.level, 1);
                    this.grid[x]![y] = null;
                } else if (cell instanceof Seed) {
                    this.player.addItem('seed', 0, 1);
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

                if (this.grid[i]?.[j] instanceof Seed) {
                    cell.classList.add('seed');
                    
                    // 创建图片元素显示种子
                    const seedImg = document.createElement('img');
                    seedImg.src = '/UIs/trees/种子.png';
                    seedImg.alt = '种子';
                    seedImg.style.width = '100%';
                    seedImg.style.height = '100%';
                    seedImg.style.objectFit = 'contain';
                    cell.appendChild(seedImg);
                    
                    cell.draggable = true;
                    cell.addEventListener('dragstart', (e: DragEvent) => this.handleDragStart(e, i, j));
                } else if (this.grid[i]?.[j] instanceof Tree) {
                    const tree = this.grid[i]![j] as Tree;
                    cell.classList.add('tree');
                    cell.style.position = 'relative';
                    
                    // 更新果树状态
                    tree.updateGrowthStatus();
                    
                    // 创建图片元素显示树
                    const treeImg = document.createElement('img');
                    const treeName = Tree.TREE_TYPES[tree.level] || '果树';
                    treeImg.src = `/UIs/trees/${treeName}.png`;
                    treeImg.alt = treeName;
                    treeImg.style.width = '100%';
                    treeImg.style.height = '100%';
                    treeImg.style.objectFit = 'contain';
                    cell.appendChild(treeImg);
                    
                    // 如果果树正在结果，添加进度条
                    if (tree.isGrowing) {
                        console.log(`创建进度条 - 果树等级: ${tree.level}, 进度: ${tree.getGrowthProgress()}, 剩余时间: ${tree.getFormattedRemainingTime()}`);
                        
                        const progressContainer = document.createElement('div');
                        progressContainer.className = 'tree-progress-container';
                        
                        // 进度条本体
                        const progressBar = document.createElement('div');
                        progressBar.className = 'tree-progress-bar';
                        
                        const progressFill = document.createElement('div');
                        progressFill.className = 'tree-progress-fill';
                        progressFill.style.width = `${tree.getGrowthProgress() * 100}%`;
                        progressBar.appendChild(progressFill);
                        
                        // 时间显示（在进度条内部居中）
                        const timeDisplay = document.createElement('div');
                        timeDisplay.className = 'tree-progress-time';
                        timeDisplay.textContent = tree.getFormattedRemainingTime();
                        progressBar.appendChild(timeDisplay);
                        
                        // 快进按钮（在进度条右侧）
                        const speedUpBtn = document.createElement('div');
                        speedUpBtn.className = 'tree-speedup-btn';
                        speedUpBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this.showSpeedUpDialog(tree, treeName);
                        });
                        
                        progressContainer.appendChild(progressBar);
                        progressContainer.appendChild(speedUpBtn);
                        cell.appendChild(progressContainer);
                        
                        console.log('进度条已添加到DOM');
                    }
                    
                    // 添加悬停提示显示果实状态
                    Tooltip.addTooltip(cell, () => tree.getFruitStatus());
                    
                    cell.draggable = true;
                    cell.addEventListener('dragstart', (e: DragEvent) => this.handleDragStart(e, i, j));
                } else if (this.grid[i]?.[j] instanceof Fruit) {
                    const fruit = this.grid[i]![j] as Fruit;
                    cell.classList.add('fruit');
                    
                    // 创建图片元素显示果实
                    const fruitImg = document.createElement('img');
                    fruitImg.src = fruit.getIcon();
                    fruitImg.alt = fruit.getFruitType();
                    fruitImg.style.width = '100%';
                    fruitImg.style.height = '100%';
                    fruitImg.style.objectFit = 'contain';
                    cell.appendChild(fruitImg);
                    
                    // 添加拖拽功能
                    cell.draggable = true;
                    cell.addEventListener('dragstart', (e: DragEvent) => this.handleDragStart(e, i, j));
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
            this.mergeOrSwapObjects(sx, sy, x, y);
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

    /* 点击单元格处理 */
    private handleCellClick = (x: number, y: number): void => {
        const cell = this.grid[x]?.[y];
        
        // 点击水果出售
        if (cell instanceof Fruit) {
            const fruitName = fruitNames[cell.level] || '未知';
            const fruitValue = fruitValues[cell.level] || 0;
            
            // 计算能出售的数量
            let count = 0;
            for (let i = 0; i < this.high; i++) {
                for (let j = 0; j < this.len; j++) {
                    const gridCell = this.grid[i]?.[j];
                    if (gridCell instanceof Fruit && gridCell.level === cell.level) {
                        count++;
                    }
                }
            }
            
            const totalValue = count * fruitValue;
            
            // 使用新的确认对话框
            ConfirmDialog.show({
                title: '出售果实',
                message: `确定要出售所有 ${fruitName} (${count}个) 吗？\n将获得 ${totalValue.toLocaleString()} 灵晶`,
                confirmText: '出售',
                cancelText: '取消',
                onConfirm: () => {
                    // 执行出售
                    for (let i = 0; i < this.high; i++) {
                        for (let j = 0; j < this.len; j++) {
                            const gridCell = this.grid[i]?.[j];
                            if (gridCell instanceof Fruit && gridCell.level === cell.level) {
                                this.grid[i]![j] = null;
                            }
                        }
                    }
                    
                    // 将资金加到灵晶中
                    currencyManager.addCrystal(totalValue);
                    this.updateUI();
                },
                onCancel: () => {
                    // 取消时不执行任何操作
                }
            });
        }
    }

    /* 采集所有果树的一个果实 */
    harvestOneFruitFromAllTrees(): void {
        let harvestedTreeCount = 0;
        let totalFruitsHarvested = 0;
        
        // 遍历所有格子，找到有果实的果树并采集一个果实
        for (let x = 0; x < this.high; x++) {
            for (let y = 0; y < this.len; y++) {
                const cell = this.grid[x]?.[y];
                if (cell instanceof Tree && cell.hasFruits()) {
                    // 采集一个果实
                    const harvested = cell.harvestOneFruit();
                    if (harvested) {
                        harvestedTreeCount++;
                        totalFruitsHarvested++;
                        // 生成果实到花园中
                        this.generateFruitNearTree(x, y, cell.level);
                    }
                }
            }
        }
        
        if (harvestedTreeCount > 0) {
            console.log(`采集完成！从 ${harvestedTreeCount} 棵果树采集了 ${totalFruitsHarvested} 个果实。`);
            this.updateUI();
        } else {
            console.log('没有可采集的果树！');
        }
    }

    /* 在果树附近生成果实 */
    private generateFruitNearTree(treeX: number, treeY: number, fruitLevel: number): void {
        // 尝试在果树周围8个方向放置果实
        const positions = [
            [treeX-1, treeY-1], [treeX-1, treeY], [treeX-1, treeY+1],
            [treeX, treeY-1], [treeX, treeY+1],
            [treeX+1, treeY-1], [treeX+1, treeY], [treeX+1, treeY+1]
        ];
        
        // 找到第一个空位放置果实
        for (const [fx, fy] of positions) {
            if (fx >= 0 && fx < this.high && fy >= 0 && fy < this.len) {
                const targetCell = this.grid[fx]?.[fy];
                if (!targetCell) {
                    this.grid[fx]![fy] = new Fruit(fruitLevel);
                    return;
                }
            }
        }
        
        // 如果周围没有空位，就在任意空位放置
        for (let fx = 0; fx < this.high; fx++) {
            for (let fy = 0; fy < this.len; fy++) {
                if (!this.grid[fx]?.[fy]) {
                    this.grid[fx]![fy] = new Fruit(fruitLevel);
                    return;
                }
            }
        }
    }

    /* 从背包自动放置物品到空格子 */
    placeItemFromBackpack(category: string, level: number): void {
        // 检查背包中是否有该物品
        const key = category === 'seed' ? 'seed' : `${category}-${level}`;
        const itemCount = this.player.backpack[key] || 0;
        
        if (itemCount === 0) {
            console.log(`背包中没有 ${category}-${level} 物品`);
            return;
        }
        
        // 找到所有空格子
        const emptySlots: {x: number, y: number}[] = [];
        for (let x = 0; x < this.high; x++) {
            for (let y = 0; y < this.len; y++) {
                if (!this.grid[x]?.[y]) {
                    emptySlots.push({x, y});
                }
            }
        }
        
        if (emptySlots.length === 0) {
            console.log('没有空余格子可以放置');
            return;
        }
        
        // 计算能放置的数量（背包数量和空格子数量的较小值）
        const canPlaceCount = Math.min(itemCount, emptySlots.length);
        
        console.log(`准备放置 ${canPlaceCount} 个 ${category}，背包有 ${itemCount} 个，空格子 ${emptySlots.length} 个`);
        
        // 放置物品
        for (let i = 0; i < canPlaceCount; i++) {
            const slot = emptySlots[i];
            const x = slot.x;
            const y = slot.y;
            
            if (category === 'seed') {
                this.grid[x]![y] = new Seed();
                this.player.removeItem('seed', 0, 1);
            } else if (category === 'tree') {
                this.grid[x]![y] = new Tree(level);
                this.player.removeItem('tree', level, 1);
            } else if (category === 'fruit') {
                this.grid[x]![y] = new Fruit(level);
                this.player.removeItem('fruit', level, 1);
            }
        }
        
        console.log(`成功放置了 ${canPlaceCount} 个物品`);
        this.updateUI();
    }

    /* --------------- 快进对话框 --------------- */
    private showSpeedUpDialog(tree: Tree, treeName: string): void {
        const remainingTime = tree.getFormattedRemainingTime();
        const goldCost = this.calculateSpeedUpCost(tree);
        
        SpeedUpDialog.show({
            treeName: treeName,
            remainingTime: remainingTime,
            goldCost: goldCost,
            onConfirm: () => {
                // 检查金币是否足够
                if (currencyManager.gold >= goldCost) {
                    currencyManager.removeGold(goldCost);
                    tree.instantGrowth();
                    this.updateUI();
                } else {
                    alert('金币不足！');
                }
            },
            onCancel: () => {
                // 取消操作
            }
        });
    }

    private calculateSpeedUpCost(tree: Tree): number {
        // 基于剩余时间和果树等级计算金币消耗
        const remainingHours = tree.getRemainingTime() / (1000 * 60 * 60);
        const baseCost = 100; // 基础费用
        const levelMultiplier = tree.level + 1; // 等级系数
        return Math.ceil(remainingHours * baseCost * levelMultiplier);
    }

    /* --------------- 背包渲染 --------------- */
    renderBackpack(): void {
        const container = document.getElementById('garden-backpack-container');
        if (!container) return;

        // 使用BackpackComponent渲染背包
        const items = Object.entries(this.player.backpack).map(([key, count]) => {
            let category: string, level: number;
            
            // 特殊处理种子格式
            if (key === 'seed') {
                category = 'seed';
                level = 0;
            } else {
                // 处理 tree-X 和 fruit-X 格式
                const [cat, levelStr] = key.split('-');
                category = cat;
                level = parseInt(levelStr || '0');
            }
            
            return {
                icon: this.getItemIcon(category, level),
                name: this.getItemName(category, level),
                count: count,
                category: category,
                level: level
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
    const treeTypeSel = document.getElementById('tree-type-select') as HTMLSelectElement;

    if (treeTypeSel && treeTypeSel.children.length === 0) {
        Tree.TREE_TYPES.forEach((name, idx) => {
            const opt = document.createElement('option');
            opt.value = idx.toString();
            opt.textContent = name;
            treeTypeSel.appendChild(opt);
        });
    }
}

export function consoleGenerateSeed(): void {
    if (!garden) return;
    
    garden.generateSeed();
}

export function consoleGenerateTree(): void {
    const level = parseInt((document.getElementById('tree-type-select') as HTMLSelectElement)?.value || '0');
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

export function consoleHarvestOneFruit(): void {
    if (!garden) return;
    
    garden.harvestOneFruitFromAllTrees();
}

export function consoleHarvestAllTrees(): void {
    if (!garden) return;
    
    let harvestedTreeCount = 0;
    let totalFruitsHarvested = 0;
    
    // 遍历所有格子，找到果树并采集果实
    for (let x = 0; x < garden.high; x++) {
        for (let y = 0; y < garden.len; y++) {
            const cell = garden.grid[x]?.[y];
            if (cell instanceof Tree && cell.hasFruits()) {
                harvestedTreeCount++;
                
                // 采集所有果实
                const fruitsHarvested = cell.harvestAllFruits();
                totalFruitsHarvested += fruitsHarvested;
                
                // 果实等级 = 果树等级
                const fruitLevel = cell.level;
                
                // 生成对应数量的果实到花园中
                for (let fruitIndex = 0; fruitIndex < fruitsHarvested; fruitIndex++) {
                    // 在果树周围找空位放置果实
                    const positions = [
                        [x-1, y-1], [x-1, y], [x-1, y+1],
                        [x, y-1], [x, y+1],
                        [x+1, y-1], [x+1, y], [x+1, y+1]
                    ];
                    
                    // 找到第一个空位放置果实
                    let fruitPlaced = false;
                    for (const [fx, fy] of positions) {
                        if (fx >= 0 && fx < garden.high && fy >= 0 && fy < garden.len) {
                            const targetCell = garden.grid[fx]?.[fy];
                            if (!targetCell) {
                                garden.grid[fx]![fy] = new Fruit(fruitLevel);
                                fruitPlaced = true;
                                break;
                            }
                        }
                    }
                    
                    // 如果周围没有空位，就在任意空位放置
                    if (!fruitPlaced) {
                        for (let fx = 0; fx < garden.high && !fruitPlaced; fx++) {
                            for (let fy = 0; fy < garden.len && !fruitPlaced; fy++) {
                                if (!garden.grid[fx]?.[fy]) {
                                    garden.grid[fx]![fy] = new Fruit(fruitLevel);
                                    fruitPlaced = true;
                                    break;
                                }
                            }
                        }
                    }
                    
                    // 如果仍然没有找到空位，就停止生成更多果实
                    if (!fruitPlaced) {
                        break;
                    }
                }
            }
        }
    }
    
    if (harvestedTreeCount > 0) {
        alert(`采集完成！从 ${harvestedTreeCount} 棵果树采集了 ${totalFruitsHarvested} 个果实。已开始结果的果树将显示进度条。`);
        garden.updateUI();
    } else {
        alert('没有可采集的果树！');
    }
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
    if (!garden) {
        console.log('garden未初始化');
        return;
    }
    
    let combined = false;
    
    // 种子合成成果树
    const seedKey = 'seed';
    const seedCount = garden.player.backpack[seedKey] || 0;
    
    if (seedCount >= 2) {
        while ((garden.player.backpack[seedKey] || 0) >= 2) {
            garden.player.removeItem('seed', 0, 2);
            garden.player.addItem('tree', 0, 1);
            combined = true;
        }
    }
    
    // 策略：遍历两次，先树再水果
    ['tree', 'fruit'].forEach(category => {
        const maxLevel = category === 'tree' ? Tree.TREE_TYPES.length - 1 : fruitNames.length - 1;
        for (let level = 0; level < maxLevel; level++) {
            const key = `${category}-${level}`;
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

/* ---------------- 清理函数 ---------------- */
export function cleanupGardenGame(): void {
    if (garden) {
        garden.destroy();
        garden = null;
        (window as any).garden = null;
    }
}

// 全局类型声明
declare global {
    interface Window {
        garden: any;
    }
}
