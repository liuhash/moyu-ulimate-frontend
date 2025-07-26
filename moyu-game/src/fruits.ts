/***** fruits.ts - 果实类型与逻辑管理 *****/

// 水果名称与价值
export const fruitNames: string[] = [
    "果", "草莓", "香蕉", "菠萝", "葡萄", "猕猴桃", "石榴", 
    "苹果", "梨", "山楂", "桃", "李子", "樱桃", "核桃", "板栗", "银杏"
];

export const fruitValues: number[] = [
    100, 220, 484, 1064, 2342, 5153, 11338, 24943, 54875, 
    120726, 265597, 584314, 1285491, 2828080, 6221776, 13687907
];

// 水果类
export class Fruit {
    constructor(public level: number) {}

    getFruitType(): string {
        return fruitNames[this.level] || "未知";
    }

    getFruitValue(): number {
        return fruitValues[this.level] || 0;
    }

    // 获取果实图标路径
    getIcon(): string {
        const fruitName = fruitNames[this.level] || '果';
        return `/UIs/fruits/${fruitName}.png`;
    }

    // 获取果实显示名称
    getDisplayName(): string {
        return fruitNames[this.level] || '未知果';
    }

    // 静态方法：通过等级获取果实名称
    static getFruitNameByLevel(level: number): string {
        return fruitNames[level] || '未知果';
    }

    // 静态方法：通过等级获取果实价值
    static getFruitValueByLevel(level: number): number {
        return fruitValues[level] || 0;
    }

    // 静态方法：通过等级获取果实图标
    static getFruitIconByLevel(level: number): string {
        const fruitName = fruitNames[level] || '果';
        return `/UIs/fruits/${fruitName}.png`;
    }

    // 静态方法：获取最大果实等级
    static getMaxLevel(): number {
        return fruitNames.length - 1;
    }

    // 静态方法：验证果实等级是否有效
    static isValidLevel(level: number): boolean {
        return level >= 0 && level < fruitNames.length;
    }

    // 静态方法：获取所有果实名称列表
    static getAllFruitNames(): string[] {
        return [...fruitNames];
    }

    // 静态方法：获取所有果实价值列表
    static getAllFruitValues(): number[] {
        return [...fruitValues];
    }
}

// 果实工厂类
export class FruitFactory {
    // 创建果实实例
    static createFruit(level: number): Fruit | null {
        if (!Fruit.isValidLevel(level)) {
            console.warn(`无效的果实等级: ${level}`);
            return null;
        }
        return new Fruit(level);
    }

    // 批量创建果实
    static createFruits(level: number, count: number): Fruit[] {
        const fruits: Fruit[] = [];
        for (let i = 0; i < count; i++) {
            const fruit = this.createFruit(level);
            if (fruit) {
                fruits.push(fruit);
            }
        }
        return fruits;
    }
}

// 果实管理器类
export class FruitManager {
    // 计算多个果实的总价值
    static calculateTotalValue(fruits: Fruit[]): number {
        return fruits.reduce((total, fruit) => total + fruit.getFruitValue(), 0);
    }

    // 按等级分组果实
    static groupFruitsByLevel(fruits: Fruit[]): Map<number, Fruit[]> {
        const groups = new Map<number, Fruit[]>();
        
        fruits.forEach(fruit => {
            const level = fruit.level;
            if (!groups.has(level)) {
                groups.set(level, []);
            }
            groups.get(level)!.push(fruit);
        });
        
        return groups;
    }

    // 统计果实数量按等级
    static countFruitsByLevel(fruits: Fruit[]): Map<number, number> {
        const counts = new Map<number, number>();
        
        fruits.forEach(fruit => {
            const level = fruit.level;
            counts.set(level, (counts.get(level) || 0) + 1);
        });
        
        return counts;
    }

    // 过滤指定等级的果实
    static filterFruitsByLevel(fruits: Fruit[], level: number): Fruit[] {
        return fruits.filter(fruit => fruit.level === level);
    }

    // 排序果实（按等级）
    static sortFruitsByLevel(fruits: Fruit[], ascending: boolean = true): Fruit[] {
        return fruits.sort((a, b) => ascending ? a.level - b.level : b.level - a.level);
    }

    // 获取最高等级的果实
    static getHighestLevelFruits(fruits: Fruit[]): Fruit[] {
        if (fruits.length === 0) return [];
        
        const maxLevel = Math.max(...fruits.map(fruit => fruit.level));
        return this.filterFruitsByLevel(fruits, maxLevel);
    }

    // 获取最低等级的果实
    static getLowestLevelFruits(fruits: Fruit[]): Fruit[] {
        if (fruits.length === 0) return [];
        
        const minLevel = Math.min(...fruits.map(fruit => fruit.level));
        return this.filterFruitsByLevel(fruits, minLevel);
    }
}

// 果实配置接口
export interface FruitConfig {
    name: string;
    value: number;
    icon: string;
}

// 果实配置管理器
export class FruitConfigManager {
    // 获取所有果实配置
    static getAllConfigs(): FruitConfig[] {
        return fruitNames.map((name, index) => ({
            name,
            value: fruitValues[index],
            icon: `/UIs/fruits/${name}.png`
        }));
    }

    // 通过等级获取配置
    static getConfigByLevel(level: number): FruitConfig | null {
        if (!Fruit.isValidLevel(level)) {
            return null;
        }

        return {
            name: fruitNames[level],
            value: fruitValues[level],
            icon: `/UIs/fruits/${fruitNames[level]}.png`
        };
    }

    // 通过名称获取等级
    static getLevelByName(name: string): number {
        const index = fruitNames.indexOf(name);
        return index >= 0 ? index : -1;
    }

    // 验证果实配置
    static validateConfig(): boolean {
        return fruitNames.length === fruitValues.length;
    }
}
