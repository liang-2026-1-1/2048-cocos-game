/**
 * 数学工具类
 * 提供常用数学运算和随机数生成方法
 */

export class MathUtil {
    /**
     * 生成指定范围内的随机整数
     * @param min 最小值（包含）
     * @param max 最大值（包含）
     * @returns 随机整数
     */
    static randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * 生成指定范围内的随机浮点数
     * @param min 最小值（包含）
     * @param max 最大值（不包含）
     * @returns 随机浮点数
     */
    static randomFloat(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    /**
     * 根据概率判断是否发生
     * @param probability 概率值（0-1）
     * @returns 是否发生
     */
    static randomProbability(probability: number): boolean {
        return Math.random() < probability;
    }

    /**
     * 从数组中随机选择一个元素
     * @param array 数组
     * @returns 随机元素
     */
    static randomChoice<T>(array: T[]): T {
        if (!array || array.length === 0) {
            return null;
        }
        return array[this.randomInt(0, array.length - 1)];
    }

    /**
     * 打乱数组（Fisher-Yates 洗牌算法）
     * @param array 数组
     * @returns 打乱后的新数组
     */
    static shuffle<T>(array: T[]): T[] {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = this.randomInt(0, i);
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    /**
     * 限制数值在指定范围内
     * @param value 数值
     * @param min 最小值
     * @param max 最大值
     * @returns 限制后的数值
     */
    static clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }

    /**
     * 线性插值
     * @param start 起始值
     * @param end 结束值
     * @param t 插值因子（0-1）
     * @returns 插值结果
     */
    static lerp(start: number, end: number, t: number): number {
        return start + (end - start) * t;
    }

    /**
     * 计算两点之间的距离
     * @param x1 第一个点的x坐标
     * @param y1 第一个点的y坐标
     * @param x2 第二个点的x坐标
     * @param y2 第二个点的y坐标
     * @returns 距离
     */
    static distance(x1: number, y1: number, x2: number, y2: number): number {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * 计算两点形成的角度（弧度）
     * @param x1 第一个点的x坐标
     * @param y1 第一个点的y坐标
     * @param x2 第二个点的x坐标
     * @param y2 第二个点的y坐标
     * @returns 角度（弧度）
     */
    static angle(x1: number, y1: number, x2: number, y2: number): number {
        return Math.atan2(y2 - y1, x2 - x1);
    }

    /**
     * 弧度转角度
     * @param radian 弧度
     * @returns 角度
     */
    static radianToDegree(radian: number): number {
        return radian * (180 / Math.PI);
    }

    /**
     * 角度转弧度
     * @param degree 角度
     * @returns 弧度
     */
    static degreeToRadian(degree: number): number {
        return degree * (Math.PI / 180);
    }

    /**
     * 判断一个数是否是2的幂
     * @param value 数值
     * @returns 是否是2的幂
     */
    static isPowerOfTwo(value: number): boolean {
        return value > 0 && (value & (value - 1)) === 0;
    }

    /**
     * 计算2的幂次方
     * @param exponent 指数
     * @returns 2的exponent次方
     */
    static powerOfTwo(exponent: number): number {
        return Math.pow(2, exponent);
    }

    /**
     * 计算以2为底的对数
     * @param value 数值
     * @returns 以2为底的对数
     */
    static log2(value: number): number {
        return Math.log2(value);
    }
}
