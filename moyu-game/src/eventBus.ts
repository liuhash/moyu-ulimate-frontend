/***** eventBus.ts - 事件总线 *****/
import type { IEventBus, EventCallback } from './types.js';

export class EventBus implements IEventBus {
    private events: Map<string, EventCallback[]> = new Map();

    on(event: string, callback: EventCallback): void {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event)!.push(callback);
    }

    emit(event: string, data?: any): void {
        if (this.events.has(event)) {
            this.events.get(event)!.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Event callback error:', error);
                }
            });
        }
    }

    off(event: string, callback: EventCallback): void {
        if (this.events.has(event)) {
            const callbacks = this.events.get(event)!;
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    // 清理所有事件
    clear(): void {
        this.events.clear();
    }

    // 获取事件监听器数量
    getListenerCount(event: string): number {
        return this.events.get(event)?.length || 0;
    }
} 