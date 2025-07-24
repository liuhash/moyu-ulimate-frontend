/***** sprite.ts - 精灵系统核心逻辑 *****/
import type { SpriteObject, SpriteCategory, Position } from './types.js';

// 精灵类别配置
export const SPRITE_CATEGORIES: SpriteCategory[] = ['classic', 'shanhai', 'shiny', 'shenwu', 'limited'];

// 精灵类别中文名称映射
export const SPRITE_CATEGORY_NAMES: Record<SpriteCategory, string> = {
    'classic': '经典',
    'shanhai': '山海',
    'shiny': '闪光',
    'shenwu': '神武',
    'limited': '限定'
};

// 精灵管理器类
export class SpriteManager {
    private sprites: SpriteObject[] = [];
    private gardenWidth: number = 20; // 花园宽度
    private gardenHeight: number = 10; // 花园高度

    constructor() {}

    /**
     * 生成随机位置（花园中心区域）
     * @returns 随机位置
     */
    private generateRandomPosition(): Position {
        // 在花园中心区域生成位置（避开边缘）
        const centerX = this.gardenWidth / 2;
        const centerY = this.gardenHeight / 2;
        const rangeX = Math.min(6, this.gardenWidth / 2);
        const rangeY = Math.min(3, this.gardenHeight / 2);
        
        return {
            x: centerX + (Math.random() - 0.5) * rangeX,
            y: centerY + (Math.random() - 0.5) * rangeY
        };
    }

    /**
     * 生成远离指定位置的随机位置
     * @param avoidPos 要避开的位置
     * @param minDistance 最小距离
     * @returns 新位置
     */
    private generateAwayPosition(avoidPos: Position, minDistance: number = 5): Position {
        let attempts = 0;
        const maxAttempts = 50;
        
        while (attempts < maxAttempts) {
            const newPos = {
                x: Math.random() * this.gardenWidth,
                y: Math.random() * this.gardenHeight
            };
            
            const distance = Math.sqrt(
                Math.pow(newPos.x - avoidPos.x, 2) + 
                Math.pow(newPos.y - avoidPos.y, 2)
            );
            
            if (distance >= minDistance) {
                return newPos;
            }
            
            attempts++;
        }
        
        // 如果尝试失败，返回一个远离的位置
        return {
            x: Math.max(0, Math.min(this.gardenWidth - 1, avoidPos.x + (Math.random() > 0.5 ? minDistance : -minDistance))),
            y: Math.max(0, Math.min(this.gardenHeight - 1, avoidPos.y + (Math.random() > 0.5 ? minDistance : -minDistance)))
        };
    }

    /**
     * 检查位置是否被占用（基于60px×60px的碰撞箱）
     * @param pos 位置
     * @param excludeSprite 排除的精灵（用于更新时）
     * @returns 是否被占用
     */
    private isPositionOccupied(pos: Position, excludeSprite?: SpriteObject): boolean {
        return this.sprites.some(sprite => {
            if (excludeSprite && sprite === excludeSprite) return false;
            // 基于60px×60px的碰撞箱判断重叠
            const spriteLeft = sprite.pos.x * 66;
            const spriteTop = sprite.pos.y * 66;
            const spriteRight = spriteLeft + 60;
            const spriteBottom = spriteTop + 60;
            
            const posLeft = pos.x * 66;
            const posTop = pos.y * 66;
            const posRight = posLeft + 60;
            const posBottom = posTop + 60;
            
            // 检查矩形是否重叠
            return !(spriteLeft >= posRight || 
                    spriteRight <= posLeft || 
                    spriteTop >= posBottom || 
                    spriteBottom <= posTop);
        });
    }

    /**
     * 添加精灵（自动处理位置冲突）
     * @param sprite 精灵对象
     */
    addSprite(sprite: SpriteObject): void {
        // 如果精灵没有指定位置，生成随机位置
        if (sprite.pos.x === 0 && sprite.pos.y === 0) {
            sprite.pos = this.generateRandomPosition();
        }
        
        // 检查位置冲突，但不处理合并（合并由moveSprite处理）
        if (this.isPositionOccupied(sprite.pos)) {
            // 找到冲突的精灵，让它离开
            const conflictingSprite = this.sprites.find(s => {
                // 基于60px×60px的碰撞箱判断重叠
                const spriteLeft = s.pos.x * 66;
                const spriteTop = s.pos.y * 66;
                const spriteRight = spriteLeft + 60;
                const spriteBottom = spriteTop + 60;
                
                const newSpriteLeft = sprite.pos.x * 66;
                const newSpriteTop = sprite.pos.y * 66;
                const newSpriteRight = newSpriteLeft + 60;
                const newSpriteBottom = newSpriteTop + 60;
                
                // 检查矩形是否重叠
                return !(spriteLeft >= newSpriteRight || 
                        spriteRight <= newSpriteLeft || 
                        spriteTop >= newSpriteBottom || 
                        spriteBottom <= newSpriteTop);
            });
            
            if (conflictingSprite) {
                // 让冲突的精灵随机离开
                conflictingSprite.pos = this.generateAwayPosition(sprite.pos, 5);
            }
        }
        
        this.sprites.push(sprite);
    }

    /**
     * 移除精灵（基于60px×60px的碰撞箱）
     * @param x 坐标x
     * @param y 坐标y
     */
    removeSprite(x: number, y: number): void {
        this.sprites = this.sprites.filter(sprite => {
            // 基于60px×60px的碰撞箱判断是否包含指定点
            const spriteLeft = sprite.pos.x * 66;
            const spriteTop = sprite.pos.y * 66;
            const spriteRight = spriteLeft + 60;
            const spriteBottom = spriteTop + 60;
            
            const pointX = x * 66;
            const pointY = y * 66;
            
            // 保留不在指定点碰撞箱内的精灵
            return !(pointX >= spriteLeft && pointX < spriteRight && 
                    pointY >= spriteTop && pointY < spriteBottom);
        });
    }

    /**
     * 获取指定位置的精灵（基于60px×60px的碰撞箱）
     * @param x 坐标x
     * @param y 坐标y
     * @returns 精灵对象或null
     */
    getSpriteAt(x: number, y: number): SpriteObject | null {
        return this.sprites.find(sprite => {
            // 基于60px×60px的碰撞箱判断是否包含指定点
            const spriteLeft = sprite.pos.x * 66;
            const spriteTop = sprite.pos.y * 66;
            const spriteRight = spriteLeft + 60;
            const spriteBottom = spriteTop + 60;
            
            const pointX = x * 66;
            const pointY = y * 66;
            
            return pointX >= spriteLeft && pointX < spriteRight && 
                   pointY >= spriteTop && pointY < spriteBottom;
        }) || null;
    }

    /**
     * 获取所有精灵
     * @returns 精灵数组
     */
    getAllSprites(): SpriteObject[] {
        return [...this.sprites];
    }

    /**
     * 调试方法：打印所有精灵信息
     */
    debugSprites(): void {
        console.log('当前所有精灵:', this.sprites.map(s => ({
            cat: s.cat,
            level: s.level,
            pos: s.pos
        })));
    }

    /**
     * 强制同步精灵显示
     */
    forceSyncSprites(): void {
        console.log('强制同步精灵显示');
        this.debugSprites();
        
        // 清理无效的精灵（但不改变有效精灵的位置）
        const validSprites = this.sprites.filter(sprite => 
            sprite && 
            typeof sprite.pos.x === 'number' && 
            typeof sprite.pos.y === 'number' &&
            typeof sprite.level === 'number' &&
            typeof sprite.cat === 'string' &&
            sprite.level > 0 &&
            sprite.level <= this.getMaxLevel(sprite.cat)
        );
        
        // 只更新数组，不改变精灵位置
        if (validSprites.length !== this.sprites.length) {
            console.log(`清理无效精灵: ${this.sprites.length} -> ${validSprites.length}`);
            this.sprites = validSprites;
        }
        
        console.log('当前精灵数量:', this.sprites.length);
        
        // 强制更新UI（使用setTimeout确保DOM更新完成）
        if ((window as any).garden) {
            setTimeout(() => {
                (window as any).garden.updateSpritesOnly();
                console.log('UI更新完成');
            }, 10);
        }
    }

    /**
     * 测试合并功能
     */
    testMerge(): void {
        console.log('测试合并功能');
        if (this.sprites.length < 2) {
            console.log('精灵数量不足，无法测试合并');
            return;
        }
        
        const sprite1 = this.sprites[0];
        const sprite2 = this.sprites[1];
        
        console.log(`测试合并: ${sprite1.cat}L${sprite1.level} + ${sprite2.cat}L${sprite2.level}`);
        console.log('是否可以合并:', this.canMerge(sprite1, sprite2));
        
        if (this.canMerge(sprite1, sprite2)) {
            console.log('执行测试合并');
            this.mergeSprites(sprite1, sprite2, sprite2.pos.x, sprite2.pos.y);
        }
    }

    /**
     * 验证精灵位置
     */
    validatePositions(): void {
        console.log('验证精灵位置:');
        this.sprites.forEach((sprite, index) => {
            console.log(`精灵 ${index + 1}: ${sprite.cat}L${sprite.level} 位置 (${sprite.pos.x}, ${sprite.pos.y})`);
        });
    }

    /**
     * 移动精灵
     * @param fromX 起始x坐标
     * @param fromY 起始y坐标
     * @param toX 目标x坐标
     * @param toY 目标y坐标
     * @returns 是否移动成功
     */
    moveSprite(fromX: number, fromY: number, toX: number, toY: number): boolean {
        const sprite = this.getSpriteAt(fromX, fromY);
        if (!sprite) {
            console.log('未找到起始位置的精灵');
            return false;
        }

        console.log(`移动精灵: ${sprite.cat}L${sprite.level} 从 (${fromX}, ${fromY}) 到 (${toX}, ${toY})`);

        // 检查目标位置是否已有其他精灵（排除自己，基于碰撞箱）
        const targetSprite = this.sprites.find(s => {
            if (s === sprite) return false; // 排除自己
            
            // 基于60px×60px的碰撞箱判断重叠
            const spriteLeft = s.pos.x * 66;
            const spriteTop = s.pos.y * 66;
            const spriteRight = spriteLeft + 60;
            const spriteBottom = spriteTop + 60;
            
            const targetLeft = toX * 66;
            const targetTop = toY * 66;
            const targetRight = targetLeft + 60;
            const targetBottom = targetTop + 60;
            
            // 检查矩形是否重叠
            return !(spriteLeft >= targetRight || 
                    spriteRight <= targetLeft || 
                    spriteTop >= targetBottom || 
                    spriteBottom <= targetTop);
        });
        
        if (targetSprite) {
            console.log(`目标位置有精灵: ${targetSprite.cat}L${targetSprite.level}`);
            // 先判断是否合并
            if (this.canMerge(sprite, targetSprite)) {
                console.log('执行合并逻辑');
                const result = this.mergeSprites(sprite, targetSprite, toX, toY);
                if (result) {
                    console.log('合并成功，移动完成');
                    return true;
                } else {
                    console.log('合并失败，继续移动逻辑');
                }
            } else {
                console.log('不能合并，执行弹开逻辑');
                // 不能合并，让目标精灵弹开
                const newPos = this.generateAwayPosition({ x: toX, y: toY }, 5);
                console.log(`弹开精灵到新位置: (${newPos.x}, ${newPos.y})`);
                targetSprite.pos = newPos;
            }
        }
        
        // 无论是否合并或弹开，都将精灵移动到目标位置
        console.log(`将精灵移动到目标位置: (${toX}, ${toY})`);
        sprite.pos.x = toX;
        sprite.pos.y = toY;
        
        console.log('移动完成，当前精灵状态:');
        this.debugSprites();
        
        // 强制同步显示
        this.forceSyncSprites();
        
        return true;
    }

    /**
     * 检查两个精灵是否可以合并
     * @param sprite1 精灵1
     * @param sprite2 精灵2
     * @returns 是否可以合并
     */
    private canMerge(sprite1: SpriteObject, sprite2: SpriteObject): boolean {
        // 相同类型且相同等级才能合并
        return sprite1.cat === sprite2.cat && sprite1.level === sprite2.level;
    }

    /**
     * 合并两个精灵
     * @param sprite1 精灵1（被拖拽的精灵）
     * @param sprite2 精灵2（目标位置的精灵）
     * @param x 目标x坐标
     * @param y 目标y坐标
     * @returns 是否合并成功
     */
    private mergeSprites(sprite1: SpriteObject, sprite2: SpriteObject, x: number, y: number): boolean {
        const maxLevel = this.getMaxLevel(sprite1.cat);
        
        // 检查是否达到最高等级
        if (sprite1.level >= maxLevel) {
            console.log('已达到最高等级，无法合并');
            return false;
        }

        console.log(`合并精灵: ${sprite1.cat}L${sprite1.level} + ${sprite2.cat}L${sprite2.level} = ${sprite1.cat}L${sprite1.level + 1}`);

        // 直接修改目标精灵的等级，而不是创建新精灵
        const oldLevel = sprite2.level;
        sprite2.level = sprite1.level + 1;
        console.log(`目标精灵等级从 ${oldLevel} 升级到 ${sprite2.level}`);
        
        // 移除被拖拽的精灵
        const beforeCount = this.sprites.length;
        this.sprites = this.sprites.filter(s => s !== sprite1);
        const afterCount = this.sprites.length;
        console.log(`移除被拖拽精灵，数量从 ${beforeCount} 减少到 ${afterCount}`);
        
        console.log('合并完成，当前精灵数量:', this.sprites.length);
        this.debugSprites();
        
        // 强制同步显示
        this.forceSyncSprites();
        
        // 验证合并后的精灵是否可以继续合并
        setTimeout(() => {
            const canContinueMerge = this.sprites.some(s1 => 
                this.sprites.some(s2 => 
                    s1 !== s2 && this.canMerge(s1, s2)
                )
            );
            console.log('合并后是否可以继续合并:', canContinueMerge);
        }, 100);
        
        return true;
    }

    /**
     * 检查位置是否有效
     * @param x 坐标x
     * @param y 坐标y
     * @returns 是否有效
     */
    isValidPosition(x: number, y: number): boolean {
        return x >= 0 && x < this.gardenWidth && y >= 0 && y < this.gardenHeight;
    }

    /**
     * 获取精灵的最大等级
     * @param category 精灵类别
     * @returns 最大等级
     */
    getMaxLevel(category: SpriteCategory): number {
        return category === 'limited' ? 1 : 16;
    }

    /**
     * 渲染精灵到UI元素
     * @param cell 格子元素
     * @param x 坐标x
     * @param y 坐标y
     */
    renderSpriteToCell(cell: HTMLElement, x: number, y: number): void {
        const sprite = this.getSpriteAt(x, y);
        if (sprite) {
            const span = document.createElement('span');
            span.style.fontSize = '10px';
            span.textContent = `\n${SPRITE_CATEGORY_NAMES[sprite.cat]}L${sprite.level}`;
            cell.appendChild(span);
        }
    }

    /**
     * 渲染所有精灵到花园
     * @param gardenElement 花园元素
     */
    renderAllSprites(gardenElement: HTMLElement): void {
        console.log('开始渲染精灵，当前精灵数量:', this.sprites.length);
        
        // 清除现有的精灵显示
        const existingSprites = gardenElement.querySelectorAll('.sprite-overlay');
        console.log('清除现有精灵显示，数量:', existingSprites.length);
        existingSprites.forEach(el => el.remove());
        
        // 确保精灵列表中没有重复或无效的精灵
        this.sprites = this.sprites.filter(sprite => 
            sprite && 
            typeof sprite.pos.x === 'number' && 
            typeof sprite.pos.y === 'number' &&
            typeof sprite.level === 'number' &&
            typeof sprite.cat === 'string'
        );
        
        console.log('过滤后的精灵数量:', this.sprites.length);
        
        this.sprites.forEach((sprite, index) => {
            console.log(`渲染精灵 ${index + 1}: ${sprite.cat}L${sprite.level} 位置 (${sprite.pos.x}, ${sprite.pos.y})`);
            
            const spriteElement = document.createElement('div');
            spriteElement.className = 'sprite-overlay';
            spriteElement.style.position = 'absolute';
            spriteElement.style.left = `${sprite.pos.x * 66}px`; // 60px格子 + 6px间距
            spriteElement.style.top = `${sprite.pos.y * 66}px`;
            spriteElement.style.width = '60px';
            spriteElement.style.height = '60px';
            spriteElement.style.display = 'flex';
            spriteElement.style.alignItems = 'center';
            spriteElement.style.justifyContent = 'center';
            spriteElement.style.fontSize = '12px';
            spriteElement.style.color = '#333';
            spriteElement.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            spriteElement.style.borderRadius = '4px';
            spriteElement.style.cursor = 'grab';
            spriteElement.style.userSelect = 'none';
            spriteElement.textContent = `${SPRITE_CATEGORY_NAMES[sprite.cat]}L${sprite.level}`;
            
            // 添加拖拽事件
            spriteElement.draggable = true;
            spriteElement.addEventListener('dragstart', (e: DragEvent) => {
                if (e.dataTransfer) {
                    e.dataTransfer.setData('source', 'sprite');
                    e.dataTransfer.setData('x', sprite.pos.x.toString());
                    e.dataTransfer.setData('y', sprite.pos.y.toString());
                    console.log(`开始拖拽精灵: ${sprite.cat}L${sprite.level} 位置 (${sprite.pos.x}, ${sprite.pos.y})`);
                }
                spriteElement.style.cursor = 'grabbing';
            });
            
            spriteElement.addEventListener('dragend', () => {
                spriteElement.style.cursor = 'grab';
                console.log('拖拽结束');
            });
            
            gardenElement.appendChild(spriteElement);
        });
        
        console.log('精灵渲染完成');
    }
}

// 全局精灵管理器实例
export const spriteManager = new SpriteManager();

/* ---------------- 控制台相关函数 ---------------- */

/**
 * 初始化精灵选择器
 */
export function initSpriteSelects(): void {
    const catSel = document.getElementById('sprite-cat-select') as HTMLSelectElement;
    const lvlSel = document.getElementById('sprite-level-select') as HTMLSelectElement;
    
    if (catSel && catSel.children.length === 0) {
        SPRITE_CATEGORIES.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = SPRITE_CATEGORY_NAMES[cat];
            catSel.appendChild(opt);
        });
        catSel.addEventListener('change', () => reloadSpriteLevelOptions());
        reloadSpriteLevelOptions();
    }

    function reloadSpriteLevelOptions(): void {
        if (!lvlSel) return;
        lvlSel.innerHTML = '';
        const cat = catSel.value as SpriteCategory;
        const max = spriteManager.getMaxLevel(cat);
        for (let i = 1; i <= max; i++) {
            const opt = document.createElement('option');
            opt.value = i.toString();
            opt.textContent = `L${i}`;
            lvlSel.appendChild(opt);
        }
    }
}

/**
 * 控制台生成精灵函数
 */
export function consoleGenerateSprite(): void {
    const catSel = document.getElementById('sprite-cat-select') as HTMLSelectElement;
    const lvlSel = document.getElementById('sprite-level-select') as HTMLSelectElement;

    const cat = (catSel?.value || 'classic') as SpriteCategory;
    const level = parseInt(lvlSel?.value || '1');

    // 创建精灵对象（位置为0,0，会在addSprite中自动生成）
    const spriteObj: SpriteObject = { 
        cat, 
        level, 
        pos: { x: 0, y: 0 } 
    };
    
    spriteManager.addSprite(spriteObj);
    
    // 触发UI更新（需要外部调用）
    if ((window as any).garden) {
        (window as any).garden.updateUI();
    }
}

/**
 * 移除指定位置的精灵
 * @param x 坐标x
 * @param y 坐标y
 */
export function removeSpriteAt(x: number, y: number): void {
    spriteManager.removeSprite(x, y);
    if ((window as any).garden) {
        (window as any).garden.updateUI();
    }
}

    /**
     * 获取所有精灵
     * @returns 精灵数组
     */
    export function getAllSprites(): SpriteObject[] {
        return spriteManager.getAllSprites();
    }

    /**
     * 处理精灵拖拽到任意位置
     * @param fromX 起始x坐标
     * @param fromY 起始y坐标
     * @param toX 目标x坐标
     * @param toY 目标y坐标
     */
    export function handleSpriteDrag(fromX: number, fromY: number, toX: number, toY: number): void {
        spriteManager.moveSprite(fromX, fromY, toX, toY);
        // 触发UI更新
        if ((window as any).garden) {
            (window as any).garden.updateUI();
        }
    }

// 全局类型声明
declare global {
    interface Window {
        spriteManager: SpriteManager;
        consoleGenerateSprite: typeof consoleGenerateSprite;
        removeSpriteAt: typeof removeSpriteAt;
        handleSpriteDrag: typeof handleSpriteDrag;
        debugSprites: () => void;
        forceSyncSprites: () => void;
        testMerge: () => void;
        validatePositions: () => void;
    }
} 