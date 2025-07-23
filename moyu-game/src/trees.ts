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
 * 设计：基准 60 秒，随等级线性递增 8 秒
 * 可根据平衡性再调整
 */
export function regenTimeByLevel(level: number): number {
  const base = 60_000; // 60s for level 1
  const step = 8_000;  // +8s 每级
  return base + (level - 1) * step;
}

/* --------------------- Tree 类 --------------------- */

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