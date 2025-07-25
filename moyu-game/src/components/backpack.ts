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

        return `
            <div class="backpack-container">
                <div class="backpack-grid" data-columns="${this.width}">
                    ${cells}
                </div>
            </div>
        `;
    }

    private renderItem(item: BackpackItem, index: number): string {
        let defaultIcon;
        if (item.category === 'tree') {
            defaultIcon = '/UIs/trees/tree-default.png';
        } else if (item.category === 'fruit') {
            defaultIcon = '/UIs/fruits/fruit-default.png';
        } else {
            defaultIcon = '/UIs/equipments/equip-default.png';
        }

        return `
            <div class="backpack-item" draggable="true" data-index="${index}" 
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
