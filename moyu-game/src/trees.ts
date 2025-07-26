/***** trees.ts 果树系统核心 *****/

/* --------------------- 常量与工具 --------------------- */
export const MAX_TREE_LEVEL = 16;

/**
 * 等级 → 每轮可采摘果实数
 * 公式：level 1 => 38 颗，每升 1 级 -2 颗
 */
export function fruitCountByLevel(level: number): number {
  if (level < 1 || level > MAX_TREE_LEVEL) throw new Error('Tree level out of range');
  return 38 - (level - 1) * 2; // 1:38, 2:36, ...
}

/**
 * 等级 → 结果(重新长满)所需时间 (ms)
 * 设计：1级果树30分钟，每升一级增加30分钟
 */
export function regenTimeByLevel(level: number): number {
  const base = 30 * 60 * 1000; // 30分钟 for level 1
  const step = 30 * 60 * 1000;  // +30分钟 每级
  return base + (level - 1) * step;
}

/* --------------------- Tree 类 --------------------- */

// 果树类 - 主要用于家园网格系统
export class Tree {
    static TREE_TYPES: string[] = [
        "果树", "草莓树", "香蕉树", "菠萝树", "葡萄树", "猕猴桃树", "石榴树", "苹果树", "梨树", "山楂树", "桃树", "李子树", "樱桃树", "核桃树", "板栗树", "银杏树"
    ];

    public currentFruits: number; // 当前可采集数目
    public maxFruits: number; // 最大可采集数目
    public isGrowing: boolean = false; // 是否正在结果中
    public growStartTime: number = 0; // 开始结果的时间戳
    public growDuration: number = 0; // 结果所需总时间 (ms)

    constructor(public level: number) {
        // 根据树的等级设置最大果实数量
        this.maxFruits = this.calculateMaxFruits(level);
        // 初始化时果实数量为最大值
        this.currentFruits = this.maxFruits;
    }

    private calculateMaxFruits(level: number): number {
        // 0级果树可采集数目为38，每升一级减少2个
        return Math.max(2, 38 - (level * 2));
    }

    getFruitType(): string {
        return Tree.TREE_TYPES[this.level] || "未知";
    }

    // 获取果实状态信息
    getFruitStatus(): string {
        return `可采集数目：${this.currentFruits}/${this.maxFruits}`;
    }

    // 采摘一个果实
    harvestOneFruit(): boolean {
        if (this.currentFruits > 0) {
            this.currentFruits--;
            if (this.currentFruits === 0) {
                this.startGrowth();
            }
            return true;
        }
        return false;
    }

    // 采摘所有果实
    harvestAllFruits(): number {
        const harvested = this.currentFruits;
        if (this.currentFruits > 0) {
            this.currentFruits = 0;
            this.startGrowth();
        }
        return harvested;
    }

    // 采摘果实（保持兼容性）
    harvestFruit(): boolean {
        return this.harvestOneFruit();
    }

    // 开始结果过程
    private startGrowth(): void {
        this.isGrowing = true;
        this.growStartTime = Date.now();
        this.growDuration = regenTimeByLevel(this.level);
    }

    // 检查是否结果完成
    updateGrowthStatus(): void {
        if (this.isGrowing && Date.now() >= this.growStartTime + this.growDuration) {
            this.regenerateFruits();
        }
    }

    // 重新长出果实（用于立刻结果功能）
    regenerateFruits(): void {
        this.currentFruits = this.maxFruits;
        this.isGrowing = false;
        this.growStartTime = 0;
        this.growDuration = 0;
    }

    // 立即结果（金币加速）
    instantGrowth(): void {
        if (this.isGrowing) {
            this.regenerateFruits();
        }
    }

    // 获取结果进度 (0-1)
    getGrowthProgress(): number {
        if (!this.isGrowing) return 1;
        const elapsed = Date.now() - this.growStartTime;
        return Math.min(1, elapsed / this.growDuration);
    }

    // 获取剩余结果时间 (ms)
    getRemainingTime(): number {
        if (!this.isGrowing) return 0;
        const elapsed = Date.now() - this.growStartTime;
        return Math.max(0, this.growDuration - elapsed);
    }

    // 格式化剩余时间为 HH:MM:SS
    getFormattedRemainingTime(): string {
        const remaining = this.getRemainingTime();
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // 检查是否有果实可采摘
    hasFruits(): boolean {
        return this.currentFruits > 0;
    }
}

// GameTree类 - 用于高级果树系统（带时间机制）
export class GameTree {
  readonly level: number;
  private fruitsLeft: number;
  private growing = false;

  constructor(level = 1) {
    if (level < 1 || level > MAX_TREE_LEVEL) throw new Error('Tree level out of range');
    this.level = level;
    this.fruitsLeft = fruitCountByLevel(level);
  }

  /** 当前剩余果实数量 */
  get remaining() {
    return this.fruitsLeft;
  }

  /** 是否正在结果中 */
  get isGrowing() {
    return this.growing;
  }

  /** 从树上采摘 1 颗果实；若成功返回 true，否则 false */
  harvestOne(): boolean {
    if (this.fruitsLeft <= 0 || this.growing) return false;
    this.fruitsLeft -= 1;
    if (this.fruitsLeft === 0) {
      this.startRegen();
    }
    return true;
  }

  /* ---------------- 结果计时 ---------------- */
  private async startRegen() {
    this.growing = true;
    const time = regenTimeByLevel(this.level);
    await sleep(time);
    this.fruitsLeft = fruitCountByLevel(this.level);
    this.growing = false;
  }
}

/* ---------------- 小工具函数 ---------------- */
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
} 