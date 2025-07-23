/***** types.ts - 全局类型定义 *****/

// 精灵类别
export type SpriteCategory = 'classic' | 'shanhai' | 'shiny' | 'shenwu' | 'limited';

// 物品类别
export type ItemCategory = 'tree' | 'fruit';

// 页面类型
export type PageType = 'main' | 'garden' | 'equipment';

// 坐标接口
export interface Position {
    x: number;
    y: number;
}

// 精灵对象接口
export interface SpriteObject {
    cat: SpriteCategory;
    level: number;
    pos: Position;
}

// 背包物品接口
export interface BackpackItem {
    category: ItemCategory;
    level: number;
    count: number;
}

// 背包数据结构
export interface Backpack {
    [key: string]: number; // key格式: "category-level"
}

// 体力规则接口
export interface StaminaRule {
    base: number;      // 1 阶体力
    increment: number; // 每升 1 级体力增量
}

// 模态框选项接口
export interface ModalOptions {
    width?: string;
    height?: string;
    closeOnOutsideClick?: boolean;
}

// 事件回调类型
export type EventCallback = (data?: any) => void;

// 游戏状态接口
export interface GameState {
    currentPage: PageType;
    money: number;
    backpack: Backpack;
    sprites: SpriteObject[];
}

// 组件基类接口
export interface IComponent {
    element: HTMLElement | null;
    render(): void;
    destroy(): void;
}

// 页面接口
export interface IPage {
    render: () => void;
    cleanup: () => void;
}

// 事件总线接口
export interface IEventBus {
    on(event: string, callback: EventCallback): void;
    emit(event: string, data?: any): void;
    off(event: string, callback: EventCallback): void;
} 