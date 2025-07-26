/***** components.ts - 可复用UI组件系统 *****/
import { EventEmitter } from './eventBus';

// 基础组件接口
export interface IComponent {
    render(): string;
    destroy?(): void;
}

// 基础组件类
export abstract class BaseComponent implements IComponent {
    protected element: HTMLElement | null = null;
    protected events: EventEmitter = new EventEmitter();

    abstract render(): string;

    destroy(): void {
        this.element?.remove();
        this.events.removeAllListeners();
    }

    protected mount(container: HTMLElement): void {
        if (this.element) {
            container.appendChild(this.element);
        }
    }
}

// 货币组件
export class CurrencyDisplay {
    static coin(amount: number = 0): string {
        return `
            <div class="currency-item">
                <img src="/UIs/currents/金币.png" alt="金币" class="currency-icon-img">
                <span data-currency="gold">${amount.toLocaleString()}</span>
            </div>
        `;
    }

    static silver(amount: number = 0): string {
        return `
            <div class="currency-item">
                <img src="/UIs/currents/银两.png" alt="银两" class="currency-icon-img">
                <span data-currency="silver">${amount.toLocaleString()}</span>
            </div>
        `;
    }

    static crystal(amount: number = 0): string {
        return `
            <div class="currency-item">
                <img src="/UIs/currents/灵晶.png" alt="灵晶" class="currency-icon-img">
                <span data-currency="crystal">${amount.toLocaleString()}</span>
            </div>
        `;
    }

    static display(currencies: string[], id?: string): string {
        const displayId = id || 'currency-display';
        return `
            <div id="${displayId}">
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
}
// 页面布局组件
export class LayoutComponent {
    static main(currencies: string[], buttons: string[]): string {
        return `
            <div id="game-main">
                ${CurrencyDisplay.mainDisplay(currencies)}
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
                    ${CurrencyDisplay.gardenDisplay(currencies)}
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
}


// 工具函数
export class UIUtils {
    private static debounceTimers: Map<string, number> = new Map();

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

    static updateWithAnimation(element: HTMLElement, newValue: string, options: {
        duration?: number;
        animationClass?: string;
    } = {}): void {
        const duration = options.duration || 500;
        const animationClass = options.animationClass || 'currency-update';
        
        element.classList.add(animationClass);
        element.textContent = newValue;
        
        setTimeout(() => {
            element.classList.remove(animationClass);
        }, duration);
    }

    static debounce(key: string, fn: Function, delay: number = 300): void {
        if (this.debounceTimers.has(key)) {
            window.clearTimeout(this.debounceTimers.get(key));
        }
        
        const timerId = window.setTimeout(() => {
            fn();
            this.debounceTimers.delete(key);
        }, delay);
        
        this.debounceTimers.set(key, timerId);
    }
}
