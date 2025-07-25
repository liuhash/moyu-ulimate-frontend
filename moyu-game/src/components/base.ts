import { EventEmitter } from '../eventBus';

export interface IComponent {
    render(): string;
    destroy?(): void;
}

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
