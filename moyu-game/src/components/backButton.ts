import { BaseComponent } from './base';

export class BackButtonComponent extends BaseComponent {
    private callback: () => void;
    private text: string;

    constructor(callback: () => void, text: string = '返回') {
        super();
        this.callback = callback;
        this.text = text;
        this.render();
    }

    render(): string {
        const html = `
            <button class="back-button">${this.text}</button>
        `;

        const temp = document.createElement('div');
        temp.innerHTML = html;
        this.element = temp.firstElementChild as HTMLElement;

        if (this.element) {
            this.element.addEventListener('click', this.callback);
        }

        return html;
    }

    destroy(): void {
        if (this.element) {
            this.element.remove();
            this.element = null;
        }
    }
}
