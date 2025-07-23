/***** components.ts - 通用组件库 *****/
import type { IComponent, ModalOptions, EventCallback } from './types.js';

// 组件基类
export abstract class Component implements IComponent {
    public element: HTMLElement | null = null;

    abstract render(): void;

    destroy(): void {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

// 关闭按钮组件
export class CloseButton extends Component {
    private onClose: EventCallback;
    private className: string;

    constructor(onClose: EventCallback, className: string = 'panel-close') {
        super();
        this.onClose = onClose;
        this.className = className;
        this.render();
    }

    render(): void {
        this.element = document.createElement('button');
        this.element.className = this.className;
        this.element.textContent = 'X';
        this.element.addEventListener('click', this.onClose);
        
        // 设置样式
        this.element.style.position = 'absolute';
        this.element.style.right = '0';
        this.element.style.top = '0';
        this.element.style.transform = 'translate(50%, -50%)';
        this.element.style.width = '30px';
        this.element.style.height = '30px';
        this.element.style.borderRadius = '50%';
        this.element.style.display = 'flex';
        this.element.style.alignItems = 'center';
        this.element.style.justifyContent = 'center';
        this.element.style.border = 'none';
        this.element.style.background = '#ff6b6b';
        this.element.style.color = 'white';
        this.element.style.cursor = 'pointer';
        this.element.style.fontSize = '14px';
        this.element.style.zIndex = '10001';
    }

    destroy(): void {
        if (this.element) {
            this.element.removeEventListener('click', this.onClose);
        }
        super.destroy();
    }
}

// 返回按钮组件
export class BackButton extends Component {
    private onBack: EventCallback;
    private text: string;

    constructor(onBack: EventCallback, text: string = '返回') {
        super();
        this.onBack = onBack;
        this.text = text;
        this.render();
    }

    render(): void {
        this.element = document.createElement('button');
        this.element.className = 'back-btn';
        this.element.textContent = this.text;
        this.element.addEventListener('click', this.onBack);
        
        // 设置样式
        this.element.style.position = 'fixed';
        this.element.style.top = '20px';
        this.element.style.right = '20px';
        this.element.style.padding = '10px 15px';
        this.element.style.background = '#ff6b6b';
        this.element.style.color = 'white';
        this.element.style.border = 'none';
        this.element.style.borderRadius = '5px';
        this.element.style.cursor = 'pointer';
        this.element.style.fontSize = '14px';
        this.element.style.zIndex = '1000';
    }

    destroy(): void {
        if (this.element) {
            this.element.removeEventListener('click', this.onBack);
        }
        super.destroy();
    }
}

// 模态框组件基类
export class Modal extends Component {
    private content: string | HTMLElement;
    private options: Required<ModalOptions>;
    private closeButton: CloseButton | null = null;

    constructor(content: string | HTMLElement, options: ModalOptions = {}) {
        super();
        this.content = content;
        this.options = {
            width: 'auto',
            height: 'auto',
            closeOnOutsideClick: true,
            ...options
        };
        this.render();
    }

    render(): void {
        // 创建遮罩层
        this.element = document.createElement('div');
        this.element.className = 'modal-overlay';
        this.element.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        // 创建内容容器
        const contentContainer = document.createElement('div');
        contentContainer.className = 'modal-content';
        contentContainer.style.cssText = `
            background: white;
            border-radius: 8px;
            padding: 20px;
            position: relative;
            max-width: 90vw;
            max-height: 90vh;
            overflow: auto;
            width: ${this.options.width};
            height: ${this.options.height};
        `;

        // 添加关闭按钮
        this.closeButton = new CloseButton(() => this.close());
        if (this.closeButton.element) {
            contentContainer.appendChild(this.closeButton.element);
        }

        // 添加内容
        if (typeof this.content === 'string') {
            contentContainer.innerHTML += this.content;
        } else if (this.content instanceof HTMLElement) {
            contentContainer.appendChild(this.content);
        }

        this.element.appendChild(contentContainer);

        // 点击遮罩层关闭
        if (this.options.closeOnOutsideClick) {
            this.element.addEventListener('click', (e: Event) => {
                if (e.target === this.element) {
                    this.close();
                }
            });
        }

        // 添加到页面
        document.body.appendChild(this.element);
    }

    close(): void {
        this.destroy();
    }

    destroy(): void {
        if (this.closeButton) {
            this.closeButton.destroy();
        }
        super.destroy();
    }
} 