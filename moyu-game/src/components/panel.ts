import { BaseComponent } from './base';

export class PanelComponent extends BaseComponent {
    private title: string;
    private content: string;
    
    constructor(title: string, content: string) {
        super();
        this.title = title;
        this.content = content;
    }

    render(): string {
        return `
            <div class="panel">
                <div class="panel-header">
                    <h3>${this.title}</h3>
                </div>
                <div class="panel-content">
                    ${this.content}
                </div>
            </div>
        `;
    }
}
