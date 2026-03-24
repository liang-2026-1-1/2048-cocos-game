/**
 * 消息管理器
 * 实现发布-订阅模式，用于不同模块之间的通信
 * 单例模式，全局访问
 */

/** 事件回调类型 */
type EventCallback = (data?: any) => void;

/** 监听器信息 */
interface ListenerInfo {
    callback: EventCallback;
    context: any;
    once: boolean;
}

const { ccclass } = cc._decorator;

/**
 * 消息管理器类
 */
@ccclass
export default class MessageManager {
    // ==================== 单例模式 ====================

    private static _instance: MessageManager = null;

    /**
     * 获取单例实例
     */
    public static getInstance(): MessageManager {
        if (!this._instance) {

            this._instance = new MessageManager();
            cc.log('[MessageManager] 创建单例实例');
        }
        return this._instance;
    }

    public static get instance(): MessageManager {
        return this.getInstance();
    }

    // ==================== 事件管理 ====================

    /** 事件监听器映射表 */
    private _listeners: Map<string, ListenerInfo[]> = new Map();


    // ==================== 核心方法 ====================

    /**
     * 监听事件
     * @param event 事件名称
     * @param callback 回调函数
     * @param context 上下文对象（可选，用于移除监听时识别）
     */
    public on(event: string, callback: EventCallback, context?: any): void {
        this.addListener(event, callback, context, false);
    }

    /**
     * 监听事件（一次性）
     * 触发一次后自动移除
     * @param event 事件名称
     * @param callback 回调函数
     * @param context 上下文对象（可选）
     */
    public once(event: string, callback: EventCallback, context?: any): void {
        this.addListener(event, callback, context, true);
    }

    /**
     * 派发事件
     * @param event 事件名称
     * @param data 传递的数据（可选）
     */
    public emit(event: string, data?: any): void {
        const listeners = this._listeners.get(event);
        if (!listeners || listeners.length === 0) {
            return;
        }

        // 复制一份监听器数组，防止在回调中修改数组
        const listenersCopy = [...listeners];

        // 需要移除的监听器
        const toRemove: ListenerInfo[] = [];

        for (const listener of listenersCopy) {
            try {
                // 调用回调
                if (listener.context) {
                    listener.callback.call(listener.context, data);
                } else {
                    listener.callback(data);
                }

                // 标记一次性监听器
                if (listener.once) {
                    toRemove.push(listener);
                }
            } catch (error) {
                cc.error(`[MessageManager] 事件回调执行错误: ${event}`, error);
            }
        }

        // 移除一次性监听器
        for (const listener of toRemove) {
            this.removeListener(event, listener.callback, listener.context);
        }
    }

    /**
     * 移除监听
     * @param event 事件名称
     * @param callback 回调函数（可选，不传则移除该事件所有监听）
     * @param context 上下文对象（可选）
     */
    public off(event: string, callback?: EventCallback, context?: any): void {
        if (!callback) {
            // 移除该事件的所有监听
            this._listeners.delete(event);
            return;
        }

        this.removeListener(event, callback, context);
    }

    // ==================== 辅助方法 ====================

    /**
     * 添加监听器
     */
    private addListener(event: string, callback: EventCallback, context: any, once: boolean): void {
        if (!callback) {
            cc.warn(`[MessageManager] 监听事件 ${event} 时回调函数为空`);
            return;
        }

        let listeners = this._listeners.get(event);
        if (!listeners) {
            listeners = [];
            this._listeners.set(event, listeners);
        }

        // 检查是否已存在相同的监听器
        const exists = listeners.some(
            l => l.callback === callback && l.context === context
        );

        if (exists) {
            cc.warn(`[MessageManager] 已存在相同的监听器: ${event}`);
            return;
        }

        listeners.push({ callback, context, once });
    }

    /**
     * 移除监听器
     */
    private removeListener(event: string, callback: EventCallback, context?: any): void {
        const listeners = this._listeners.get(event);
        if (!listeners) {
            return;
        }

        const index = listeners.findIndex(
            l => l.callback === callback && l.context === context
        );

        if (index !== -1) {
            listeners.splice(index, 1);
        }

        // 如果该事件没有监听器了，删除整个事件
        if (listeners.length === 0) {
            this._listeners.delete(event);
        }
    }

    /**
     * 移除某个上下文的所有监听
     * @param context 上下文对象
     */
    public offByContext(context: any): void {
        this._listeners.forEach((listeners, event) => {
            const filtered = listeners.filter(l => l.context !== context);
            if (filtered.length === 0) {
                this._listeners.delete(event);
            } else {
                this._listeners.set(event, filtered);
            }
        });
    }

    /**
     * 移除所有监听器
     */
    public removeAllListeners(): void {
        this._listeners.clear();
    }

    /**
     * 检查是否存在某个事件的监听
     * @param event 事件名称
     */
    public hasListeners(event: string): boolean {
        const listeners = this._listeners.get(event);
        return listeners && listeners.length > 0;
    }

    /**
     * 获取某个事件的监听器数量
     * @param event 事件名称
     */
    public getListenerCount(event: string): number {
        const listeners = this._listeners.get(event);
        return listeners ? listeners.length : 0;
    }
}

// ==================== 静态便捷方法 ====================

/**
 * 快速访问消息管理器
 */
export const Message = {
    /** 监听事件 */
    on: (event: string, callback: EventCallback, context?: any): void => {
        MessageManager.getInstance().on(event, callback, context);
    },

    /** 监听事件（一次性） */
    once: (event: string, callback: EventCallback, context?: any): void => {
        MessageManager.getInstance().once(event, callback, context);
    },

    /** 派发事件 */
    emit: (event: string, data?: any): void => {
        MessageManager.getInstance().emit(event, data);
    },

    /** 移除监听 */
    off: (event: string, callback?: EventCallback, context?: any): void => {
        MessageManager.getInstance().off(event, callback, context);
    },

    /** 移除某个上下文的所有监听 */
    offByContext: (context: any): void => {
        MessageManager.getInstance().offByContext(context);
    }
};
