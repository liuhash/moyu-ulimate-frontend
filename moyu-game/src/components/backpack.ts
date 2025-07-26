import { BaseComponent } from './base';

export interface BackpackItem {
    icon: string;
    name: string;
    count: number;
    category?: string;
    level?: number;
}

export class BackpackComponent extends BaseComponent {
    private items: BackpackItem[];
    private width: number;
    private height: number;
    
    constructor(items: BackpackItem[] = [], width: number = 5, height: number = 5) {
        super();
        this.items = items;
        this.width = width;
        this.height = height;
    }

    render(): string {
        const cells = Array(this.height).fill(0).map((_, row) => {
            return Array(this.width).fill(0).map((_, col) => {
                const index = row * this.width + col;
                const item = this.items[index];
                return `
                    <div class="backpack-cell" data-index="${index}">
                        ${item ? this.renderItem(item, index) : ''}
                    </div>
                `;
            }).join('');
        }).join('');

        const backpackHTML = `
            <div class="backpack-container">
                <div class="backpack-grid" data-columns="${this.width}">
                    ${cells}
                </div>
            </div>
        `;

        // 在下一个事件循环中绑定点击事件
        setTimeout(() => this.bindClickEvents(), 0);

        return backpackHTML;
    }

    private bindClickEvents(): void {
        const backpackItems = document.querySelectorAll('.backpack-item.clickable');
        backpackItems.forEach(item => {
            const element = item as HTMLElement;
            
            element.addEventListener('click', () => {
                const category = element.dataset.category || '';
                const level = parseInt(element.dataset.level || '0');
                
                console.log(`点击背包物品: category=${category}, level=${level}`);
                
                // 调用全局函数来处理物品放置
                if (window.garden && typeof window.garden.placeItemFromBackpack === 'function') {
                    window.garden.placeItemFromBackpack(category, level);
                }
            });
            
            // 添加悬停效果
            element.addEventListener('mouseenter', () => {
                element.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.backgroundColor = '';
            });
        });
    }

    private renderItem(item: BackpackItem, index: number): string {
        let defaultIcon;
        if (item.category === 'tree') {
            defaultIcon = '/UIs/trees/果树.png';
        } else if (item.category === 'fruit') {
            defaultIcon = '/UIs/fruits/果.png';
        } else if (item.category === 'seed') {
            defaultIcon = '/UIs/trees/种子.png';
        } else {
            defaultIcon = '/UIs/equipments/equip-default.png';
        }

        return `
            <div class="backpack-item clickable" data-index="${index}" 
                 data-category="${item.category || ''}" data-level="${item.level || 0}">
                <img src="${item.icon || defaultIcon}" alt="${item.name}">
                <span class="item-count">${item.count}</span>
            </div>
        `;
    }

    updateItems(items: BackpackItem[]): void {
        this.items = items;
        this.render();
    }

    getElement(): HTMLElement | null {
        return this.element;
    }
}
