/***** speedUpDialog.ts - 果树快进对话框 *****/

export interface SpeedUpDialogOptions {
    treeName: string;
    remainingTime: string;
    goldCost: number;
    onConfirm: () => void;
    onCancel: () => void;
}

export class SpeedUpDialog {
    private static instance: SpeedUpDialog | null = null;
    private overlay: HTMLElement | null = null;
    private dialog: HTMLElement | null = null;

    private constructor() {}

    static show(options: SpeedUpDialogOptions): void {
        if (!SpeedUpDialog.instance) {
            SpeedUpDialog.instance = new SpeedUpDialog();
        }
        SpeedUpDialog.instance.createDialog(options);
    }

    static hide(): void {
        if (SpeedUpDialog.instance) {
            SpeedUpDialog.instance.closeDialog();
        }
    }

    private createDialog(options: SpeedUpDialogOptions): void {
        // 清理现有对话框
        this.closeDialog();

        // 创建遮罩层
        this.overlay = document.createElement('div');
        this.overlay.className = 'speedup-overlay';
        
        // 创建对话框
        this.dialog = document.createElement('div');
        this.dialog.className = 'speedup-dialog';
        
        this.dialog.innerHTML = `
            <div class="speedup-header">
                <h3>果树快进</h3>
            </div>
            <div class="speedup-content">
                <p><strong>果树：</strong>${options.treeName}</p>
                <p><strong>剩余时间：</strong>${options.remainingTime}</p>
                <p><strong>加速费用：</strong>${options.goldCost.toLocaleString()} 金币</p>
                <p>确定要使用金币让果树立即结满果实吗？</p>
            </div>
            <div class="speedup-buttons">
                <button class="speedup-btn speedup-confirm">确定</button>
                <button class="speedup-btn speedup-cancel">取消</button>
            </div>
        `;

        // 绑定事件
        const confirmBtn = this.dialog.querySelector('.speedup-confirm') as HTMLButtonElement;
        const cancelBtn = this.dialog.querySelector('.speedup-cancel') as HTMLButtonElement;

        confirmBtn.addEventListener('click', () => {
            options.onConfirm();
            this.closeDialog();
        });

        cancelBtn.addEventListener('click', () => {
            options.onCancel();
            this.closeDialog();
        });

        // 点击遮罩层关闭
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                options.onCancel();
                this.closeDialog();
            }
        });

        // 添加到页面
        this.overlay.appendChild(this.dialog);
        document.body.appendChild(this.overlay);

        // 添加动画
        requestAnimationFrame(() => {
            this.overlay?.classList.add('show');
        });
    }

    private closeDialog(): void {
        if (this.overlay) {
            this.overlay.classList.remove('show');
            setTimeout(() => {
                if (this.overlay && this.overlay.parentNode) {
                    this.overlay.parentNode.removeChild(this.overlay);
                }
                this.overlay = null;
                this.dialog = null;
            }, 300);
        }
    }
}
