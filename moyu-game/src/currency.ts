/***** currency.ts - 货币管理系统 *****/
import { EventEmitter } from './eventBus';

// 货币管理器
export class CurrencyManager {
    private static instance: CurrencyManager;
    public gold: number = 0;
    public silver: number = 0;
    public crystal: number = 0;
    private eventBus: EventEmitter;

    private constructor() {
        this.eventBus = new EventEmitter();
    }

    static getInstance(): CurrencyManager {
        if (!CurrencyManager.instance) {
            CurrencyManager.instance = new CurrencyManager();
        }
        return CurrencyManager.instance;
    }

    addGold(amount: number): void {
        this.gold += amount;
        this.eventBus.emit('currencyChanged', { type: 'gold', value: this.gold });
    }

    addSilver(amount: number): void {
        this.silver += amount;
        this.eventBus.emit('currencyChanged', { type: 'silver', value: this.silver });
    }

    addCrystal(amount: number): void {
        this.crystal += amount;
        this.eventBus.emit('currencyChanged', { type: 'crystal', value: this.crystal });
    }

    removeGold(amount: number): boolean {
        if (this.gold >= amount) {
            this.gold -= amount;
            this.eventBus.emit('currencyChanged', { type: 'gold', value: this.gold });
            return true;
        }
        return false;
    }

    removeSilver(amount: number): boolean {
        if (this.silver >= amount) {
            this.silver -= amount;
            this.eventBus.emit('currencyChanged', { type: 'silver', value: this.silver });
            return true;
        }
        return false;
    }

    removeCrystal(amount: number): boolean {
        if (this.crystal >= amount) {
            this.crystal -= amount;
            this.eventBus.emit('currencyChanged', { type: 'crystal', value: this.crystal });
            return true;
        }
        return false;
    }

    onCurrencyChange(callback: (type: string, value: number) => void): void {
        this.eventBus.on('currencyChanged', (data: { type: string, value: number }) => {
            callback(data.type, data.value);
        });
    }

    // 保存到本地存储
    save(): void {
        localStorage.setItem('moyu_currency', JSON.stringify({
            gold: this.gold,
            silver: this.silver,
            crystal: this.crystal
        }));
    }

    // 从本地存储加载
    load(): void {
        const saved = localStorage.getItem('moyu_currency');
        if (saved) {
            const data = JSON.parse(saved);
            this.gold = data.gold || 0;
            this.silver = data.silver || 0;
            this.crystal = data.crystal || 0;
            this.eventBus.emit('currencyChanged', { type: 'all', value: null });
        }
    }

    // 重置货币
    reset(): void {
        this.gold = 0;
        this.silver = 0;
        this.crystal = 0;
        this.eventBus.emit('currencyChanged', { type: 'all', value: null });
        this.save();
    }
}

// 全局实例
export const currencyManager = CurrencyManager.getInstance();
