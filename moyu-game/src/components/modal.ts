import { BaseComponent } from './base';

export class ModalComponent extends BaseComponent {
    private content: string;
    private options: { width?: string; closeOnOutsideClick?: boolean };

    constructor(content: string, options: { width?: string; closeOnOutsideClick?: boolean } = {}) {
        super();
        this.content = content;
        this.options = options;
        this.render();
    }

    render(): string {
        const html = `
            <div class="modal-overlay">
                <div class="modal-container" data-width="${this.options.width || '400px'}"
                    <div class="modal-content">
                        ${this.content}
                    </div>
                    ${this.options.closeOnOutsideClick ? '<button class="modal-close">×</button>' : ''}
                </div>
            </div>
        `;

        // 创建元素并保存引用
        const temp = document.createElement('div');
        temp.innerHTML = html;
        this.element = temp.firstElementChild as HTMLElement;

        // 设置宽度
        const container = this.element.querySelector('.modal-container') as HTMLElement;
        if (container) {
            container.style.setProperty('--modal-width', this.options.width || '400px');
        }
        
        // 绑定关闭事件
        if (this.options.closeOnOutsideClick) {
            // 关闭按钮点击事件
            const closeBtn = this.element.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.destroy());
            }
            
            // 点击遮罩层关闭
            this.element.addEventListener('click', (e) => {
                if (e.target === this.element) {
                    this.destroy();
                }
            });
        }

        document.body.appendChild(this.element);
        return html;
    }

    destroy(): void {
        if (this.element) {
            this.element.remove();
            this.element = null;
        }
        this.events.removeAllListeners();
    }
}
