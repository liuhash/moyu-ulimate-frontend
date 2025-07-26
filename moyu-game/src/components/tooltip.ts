/***** tooltip.ts - 悬停提示组件 *****/

export class Tooltip {
    private static instance: Tooltip;
    private tooltipElement: HTMLElement | null = null;
    private isVisible: boolean = false;

    private constructor() {
        this.createTooltip();
    }

    static getInstance(): Tooltip {
        if (!Tooltip.instance) {
            Tooltip.instance = new Tooltip();
        }
        return Tooltip.instance;
    }

    private createTooltip(): void {
        this.tooltipElement = document.createElement('div');
        this.tooltipElement.className = 'game-tooltip';
        this.tooltipElement.style.position = 'absolute';
        this.tooltipElement.style.zIndex = '10001';
        this.tooltipElement.style.pointerEvents = 'none';
        this.tooltipElement.style.opacity = '0';
        this.tooltipElement.style.transition = 'opacity 0.2s ease';
        document.body.appendChild(this.tooltipElement);
    }

    show(text: string, x: number, y: number): void {
        if (!this.tooltipElement) return;

        this.tooltipElement.textContent = text;
        this.tooltipElement.style.left = `${x + 10}px`;
        this.tooltipElement.style.top = `${y - 10}px`;
        this.tooltipElement.style.opacity = '1';
        this.isVisible = true;
    }

    hide(): void {
        if (!this.tooltipElement) return;

        this.tooltipElement.style.opacity = '0';
        this.isVisible = false;
    }

    updatePosition(x: number, y: number): void {
        if (!this.tooltipElement || !this.isVisible) return;

        this.tooltipElement.style.left = `${x + 10}px`;
        this.tooltipElement.style.top = `${y - 10}px`;
    }

    // 为元素添加悬停提示
    static addTooltip(element: HTMLElement, getText: () => string): void {
        const tooltip = Tooltip.getInstance();
        
        element.addEventListener('mouseenter', (e: MouseEvent) => {
            const text = getText();
            tooltip.show(text, e.clientX, e.clientY);
        });

        element.addEventListener('mousemove', (e: MouseEvent) => {
            tooltip.updatePosition(e.clientX, e.clientY);
        });

        element.addEventListener('mouseleave', () => {
            tooltip.hide();
        });
    }
}
