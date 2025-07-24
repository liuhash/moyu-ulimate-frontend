/***** components.ts - 可复用UI组件 *****/
import { currencyManager } from './currency.js';

// 货币组件
export class CurrencyComponent {
    static coin(amount: number = 0): string {
        return `
            <div class="currency-item">
                <img src="/UIs/currents/金币.png" alt="金币" class="currency-icon-img">
                <span>${amount.toLocaleString()}</span>
            </div>
        `;
    }

    static silver(amount: number = 0): string {
        return `
            <div class="currency-item">
                <img src="/UIs/currents/银两.png" alt="银两" class="currency-icon-img">
                <span>${amount.toLocaleString()}</span>
            </div>
        `;
    }

    static crystal(amount: number = 0): string {
        return `
            <div class="currency-item">
                <img src="/UIs/currents/灵晶.png" alt="灵晶" class="currency-icon-img">
                <span>${amount.toLocaleString()}</span>
            </div>
        `;
    }

    static display(currencies: string[], id?: string): string {
        const displayId = id || 'currency-display';
        return `
            <div id="${displayId}" class="currency-display">
                ${currencies.join('')}
            </div>
        `;
    }

    static mainDisplay(currencies: string[]): string {
        return this.display(currencies, 'main-currency-display');
    }

    static gardenDisplay(currencies: string[]): string {
        return this.display(currencies, 'garden-currency-display');
    }

    static equipmentDisplay(currencies: string[]): string {
        return this.display(currencies, 'equipment-currency-display');
    }
}

// 按钮组件
export class ButtonComponent {
    static primary(text: string, id?: string, className?: string): string {
        return `
            <button ${id ? `id="${id}"` : ''} class="btn-primary ${className || ''}">
                ${text}
            </button>
        `;
    }

    static nav(text: string, targetPage: string): string {
        return `
            <button data-page="${targetPage}" class="nav-button">
                ${text}
            </button>
        `;
    }
}

// 页面布局组件
export class LayoutComponent {
    static main(currencies: string[], buttons: string[]): string {
        return `
            <div id="game-main">
                ${CurrencyComponent.mainDisplay(currencies)}
                <div id="game-main-content">
                    <h1>魔域终极版</h1>
                    <div id="nav-buttons">
                        ${buttons.join('')}
                    </div>
                </div>
            </div>
        `;
    }

    static garden(currencies: string[], actions: string[]): string {
        return `
            <div id="garden-page">
                <div id="garden-page-header">
                    ${ButtonComponent.primary('返回主页', 'home-btn')}
                    ${CurrencyComponent.gardenDisplay(currencies)}
                </div>
                <div id="game-container">
                    <div id="garden"></div>
                    <div id="actions">
                        ${actions.join('')}
                    </div>
                </div>
            </div>
        `;
    }

    static equipment(currencies: string[]): string {
        return `
            <div id="equipment-page">
                ${CurrencyComponent.equipmentDisplay(currencies)}
                <h2>装备背包</h2>
                <div id="equipment-grid"></div>
            </div>
        `;
    }
}

// 模态框组件
export class ModalComponent {
    static create(content: string, width: string = '500px'): string {
        return `
            <div class="modal-overlay">
                <div class="modal-content" style="width: ${width}">
                    ${content}
                </div>
            </div>
        `;
    }
}

// 工具函数
export class UIUtils {
    static createElement(html: string): HTMLElement {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.firstElementChild as HTMLElement;
    }

    static render(container: HTMLElement, html: string): void {
        container.innerHTML = html;
    }

    static append(container: HTMLElement, html: string): void {
        container.insertAdjacentHTML('beforeend', html);
    }
}
