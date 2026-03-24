/**
 * 本地存储工具类
 * 封装 Cocos Creator 的 localStorage API
 */

export class StorageUtil {
    /**
     * 存储数据到本地
     * @param key 存储键名
     * @param value 存储值（自动序列化）
     */
    static set(key: string, value: any): void {
        try {
            const data = JSON.stringify(value);
            cc.sys.localStorage.setItem(key, data);
        } catch (error) {
            cc.error(`[StorageUtil] 保存数据失败: ${key}`, error);
        }
    }

    /**
     * 从本地读取数据
     * @param key 存储键名
     * @param defaultValue 默认值
     * @returns 解析后的数据或默认值
     */
    static get<T>(key: string, defaultValue: T = null): T {
        try {
            const data = cc.sys.localStorage.getItem(key);
            if (data === null || data === undefined || data === '') {
                return defaultValue;
            }
            return JSON.parse(data) as T;
        } catch (error) {
            cc.error(`[StorageUtil] 读取数据失败: ${key}`, error);
            return defaultValue;
        }
    }

    /**
     * 删除本地存储的数据
     * @param key 存储键名
     */
    static remove(key: string): void {
        try {
            cc.sys.localStorage.removeItem(key);
        } catch (error) {
            cc.error(`[StorageUtil] 删除数据失败: ${key}`, error);
        }
    }

    /**
     * 清空所有本地存储
     */
    static clear(): void {
        try {
            cc.sys.localStorage.clear();
        } catch (error) {
            cc.error('[StorageUtil] 清空存储失败', error);
        }
    }

    /**
     * 检查键是否存在
     * @param key 存储键名
     * @returns 是否存在
     */
    static has(key: string): boolean {
        const data = cc.sys.localStorage.getItem(key);
        return data !== null && data !== undefined && data !== '';
    }

    /**
     * 保存数字类型数据
     * @param key 存储键名
     * @param value 数字值
     */
    static setNumber(key: string, value: number): void {
        cc.sys.localStorage.setItem(key, value.toString());
    }

    /**
     * 读取数字类型数据
     * @param key 存储键名
     * @param defaultValue 默认值
     * @returns 数字值
     */
    static getNumber(key: string, defaultValue: number = 0): number {
        const data = cc.sys.localStorage.getItem(key);
        if (data === null || data === undefined || data === '') {
            return defaultValue;
        }
        const num = parseFloat(data);
        return isNaN(num) ? defaultValue : num;
    }

    /**
     * 保存布尔类型数据
     * @param key 存储键名
     * @param value 布尔值
     */
    static setBoolean(key: string, value: boolean): void {
        cc.sys.localStorage.setItem(key, value ? '1' : '0');
    }

    /**
     * 读取布尔类型数据
     * @param key 存储键名
     * @param defaultValue 默认值
     * @returns 布尔值
     */
    static getBoolean(key: string, defaultValue: boolean = false): boolean {
        const data = cc.sys.localStorage.getItem(key);
        if (data === null || data === undefined || data === '') {
            return defaultValue;
        }
        return data === '1';
    }
}
