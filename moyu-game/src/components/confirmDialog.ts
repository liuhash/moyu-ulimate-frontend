/***** confirmDialog.ts - 确认对话框组件 *****/

export interface ConfirmDialogOptions {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

export class ConfirmDialog {
    private overlay: HTMLElement | null = null;
    private dialog: HTMLElement | null = null;

    constructor(private options: ConfirmDialogOptions) {
        this.createDialog();
    }

    private createDialog(): void {
        // 创建遮罩层
        this.overlay = document.createElement('div');
        this.overlay.className = 'confirm-dialog-overlay';
        
        // 创建对话框
        this.dialog = document.createElement('div');
        this.dialog.className = 'confirm-dialog';
        
        const title = this.options.title || '确认';
        const message = this.options.message;
        const confirmText = this.options.confirmText || '确认';
        const cancelText = this.options.cancelText || '取消';
        
        this.dialog.innerHTML = `
            <div class="confirm-dialog-header">
                <h3>${title}</h3>
            </div>
            <div class="confirm-dialog-body">
                <p>${message}</p>
            </div>
            <div class="confirm-dialog-footer">
                <button class="btn-cancel" id="confirm-cancel">${cancelText}</button>
                <button class="btn-confirm" id="confirm-ok">${confirmText}</button>
            </div>
        `;
        
        this.overlay.appendChild(this.dialog);
        document.body.appendChild(this.overlay);
        
        // 绑定事件
        this.bindEvents();
        
        // 显示动画
        setTimeout(() => {
            if (this.overlay) {
                this.overlay.classList.add('show');
            }
        }, 10);
    }

    private bindEvents(): void {
        if (!this.dialog) return;
        
        const confirmBtn = this.dialog.querySelector('#confirm-ok') as HTMLButtonElement;
        const cancelBtn = this.dialog.querySelector('#confirm-cancel') as HTMLButtonElement;
        
        confirmBtn?.addEventListener('click', () => {
            this.options.onConfirm?.();
            this.close();
        });
        
        cancelBtn?.addEventListener('click', () => {
            this.options.onCancel?.();
            this.close();
        });
        
        // 点击遮罩层关闭
        this.overlay?.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.options.onCancel?.();
                this.close();
            }
        });
        
        // ESC键关闭
        document.addEventListener('keydown', this.handleKeyDown);
    }

    private handleKeyDown = (e: KeyboardEvent): void => {
        if (e.key === 'Escape') {
            this.options.onCancel?.();
            this.close();
        }
    };

    private close(): void {
        if (this.overlay) {
            this.overlay.classList.remove('show');
            setTimeout(() => {
                if (this.overlay) {
                    document.body.removeChild(this.overlay);
                    this.overlay = null;
                    this.dialog = null;
                }
            }, 300);
        }
        
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    // 静态方法：快速创建确认对话框
    static show(options: ConfirmDialogOptions): ConfirmDialog {
        return new ConfirmDialog(options);
    }

    // 静态方法：简单的确认对话框
    static confirm(message: string): Promise<boolean> {
        return new Promise((resolve) => {
            new ConfirmDialog({
                message,
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false)
            });
        });
    }
}
