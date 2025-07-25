import { BaseComponent } from './base';

export class CurrencyComponent extends BaseComponent {
    private type: 'coin' | 'silver' | 'crystal';
    private amount: number;

    constructor(type: 'coin' | 'silver' | 'crystal', amount: number = 0) {
        super();
        this.type = type;
        this.amount = amount;
    }

    render(): string {
        const iconMap = {
            coin: '/UIs/currents/金币.png',
            silver: '/UIs/currents/银两.png',
            crystal: '/UIs/currents/灵晶.png'
        };

        const labelMap = {
            coin: '金币',
            silver: '银两',
            crystal: '灵晶'
        };

        return `
            <div class="currency-item">
                <img src="${iconMap[this.type]}" alt="${labelMap[this.type]}" class="currency-icon-img">
                <span>${this.amount.toLocaleString()}</span>
            </div>
        `;
    }

    setAmount(amount: number): void {
        this.amount = amount;
        if (this.element) {
            const span = this.element.querySelector('span');
            if (span) {
                span.textContent = this.amount.toLocaleString();
            }
        }
    }

    getAmount(): number {
        return this.amount;
    }
}
