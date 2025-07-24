/***** currency.ts - 货币管理系统 *****/

// 货币管理器
export class CurrencyManager {
    private static instance: CurrencyManager;
    public gold: number = 0;
    public silver: number = 0;
    public crystal: number = 0;

    private constructor() {}

    static getInstance(): CurrencyManager {
        if (!CurrencyManager.instance) {
            CurrencyManager.instance = new CurrencyManager();
        }
        return CurrencyManager.instance;
    }

    addGold(amount: number): void {
        this.gold += amount;
        this.updateDisplay();
    }

    addSilver(amount: number): void {
        this.silver += amount;
        this.updateDisplay();
    }

    addCrystal(amount: number): void {
        this.crystal += amount;
        this.updateDisplay();
    }

    removeGold(amount: number): boolean {
        if (this.gold >= amount) {
            this.gold -= amount;
            this.updateDisplay();
            return true;
        }
        return false;
    }

    removeSilver(amount: number): boolean {
        if (this.silver >= amount) {
            this.silver -= amount;
            this.updateDisplay();
            return true;
        }
        return false;
    }

    removeCrystal(amount: number): boolean {
        if (this.crystal >= amount) {
            this.crystal -= amount;
            this.updateDisplay();
            return true;
        }
        return false;
    }

    updateDisplay(): void {
        const goldElement = document.getElementById('gold');
        const silverElement = document.getElementById('silver');
        const crystalElement = document.getElementById('crystal');
        
        if (goldElement) goldElement.textContent = this.gold.toLocaleString();
        if (silverElement) silverElement.textContent = this.silver.toLocaleString();
        if (crystalElement) crystalElement.textContent = this.crystal.toLocaleString();
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
            this.updateDisplay();
        }
    }

    // 重置货币
    reset(): void {
        this.gold = 0;
        this.silver = 0;
        this.crystal = 0;
        this.updateDisplay();
        this.save();
    }
}

// 货币显示组件
export class CurrencyDisplay {
    private container: HTMLElement | null = null;

    constructor() {
        this.createDisplay();
    }

    private createDisplay(): void {
        // 创建货币显示容器
        const display = document.createElement('div');
        display.id = 'currency-display';
        display.innerHTML = `
            <div class="currency-item">
                <img src="/UIs/currents/金币.png" alt="金币" class="currency-icon-img">
                <span id="gold">0</span>
            </div>
            <div class="currency-item">
                <img src="/UIs/currents/银两.png" alt="银两" class="currency-icon-img">
                <span id="silver">0</span>
            </div>
            <div class="currency-item">
                <img src="/UIs/currents/灵晶.png" alt="灵晶" class="currency-icon-img">
                <span id="crystal">0</span>
            </div>
        `;
        this.container = display;
    }

    getElement(): HTMLElement {
        return this.container!;
    }

    update(): void {
        CurrencyManager.getInstance().updateDisplay();
    }
}

// 全局实例
export const currencyManager = CurrencyManager.getInstance();
