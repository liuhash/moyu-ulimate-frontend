/***** eventBus.ts - 事件总线 *****/

export class EventEmitter {
    private events: { [key: string]: Function[] } = {};

    on(event: string, callback: Function): void {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    emit(event: string, ...args: any[]): void {
        const callbacks = this.events[event];
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error('Event callback error:', error);
                }
            });
        }
    }

    removeListener(event: string, callback: Function): void {
        const callbacks = this.events[event];
        if (callbacks) {
            this.events[event] = callbacks.filter(cb => cb !== callback);
        }
    }

    removeAllListeners(): void {
        this.events = {};
    }
} 