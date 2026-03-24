/**
 * 输入管理器
 * 处理触摸事件和滑动方向检测
 */

import { Direction, GameConfig } from '../config/GameConfig';
import { MathUtil } from '../utils/MathUtil';

/** 输入回调接口 */
export interface InputCallback {
    /** 滑动回调 */
    onSwipe?: (direction: Direction) => void;
    /** 点击回调 */
    onTap?: (pos: cc.Vec2) => void;
}

/**
 * 输入管理器类
 */
export class InputManager {
    /** 监听节点 */
    private _node: cc.Node = null;

    /** 回调函数 */
    private _callback: InputCallback = null;

    /** 是否启用 */
    private _enabled: boolean = true;

    /** 触摸起始位置 */
    private _startPos: cc.Vec2 = null;

    /** 触摸开始时间 */
    private _startTime: number = 0;

    /** 是否正在触摸 */
    private _isTouching: boolean = false;

    /**
     * 初始化输入管理器
     * @param node 监听触摸事件的节点
     */
    init(node: cc.Node): void {
        this._node = node;
        this.registerEvents();
    }

    /**
     * 注册触摸事件
     */
    private registerEvents(): void {
        if (!this._node) {
            cc.error('[InputManager] 节点未设置');
            return;
        }

        this._node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this._node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this._node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this._node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    /**
     * 取消注册触摸事件
     */
    private unregisterEvents(): void {
        if (!this._node) return;

        this._node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this._node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this._node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this._node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    /**
     * 触摸开始事件处理
     */
    private onTouchStart(event: cc.Event.EventTouch): void {
        if (!this._enabled) return;

        this._startPos = event.getLocation();
        this._startTime = Date.now();
        this._isTouching = true;
        console.log('Touch start');
    }

    /**
     * 触摸移动事件处理
     */
    private onTouchMove(event: cc.Event.EventTouch): void {
        if (!this._enabled || !this._isTouching) return;
        // 可以在这里添加实时拖拽效果
        console.log('Touch move');
    }

    /**
     * 触摸结束事件处理
     */
    private onTouchEnd(event: cc.Event.EventTouch): void {
        if (!this._enabled || !this._isTouching) return;

        const endPos = event.getLocation();
        const direction = this.detectSwipeDirection(this._startPos, endPos);
        console.log(`Touch end: ${direction}`);
        if (direction !== Direction.None) {
            // 有效的滑动
            if (this._callback && this._callback.onSwipe) {
                this._callback.onSwipe(direction);
            }
        } else {
            // 检测是否为点击
            const distance = MathUtil.distance(
                this._startPos.x, this._startPos.y,
                endPos.x, endPos.y
            );
            
            if (distance < 10 && this._callback && this._callback.onTap) {
                this._callback.onTap(endPos);
                console.log('点击');
            }
        }

        this._isTouching = false;
        this._startPos = null;
    }

    /**
     * 检测滑动方向
     * @param startPos 起始位置
     * @param endPos 结束位置
     * @returns 滑动方向
     */
    private detectSwipeDirection(startPos: cc.Vec2, endPos: cc.Vec2): Direction {
        if (!startPos || !endPos) {
            return Direction.None;
        }

        const dx = endPos.x - startPos.x;
        const dy = endPos.y - startPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 检查滑动距离是否足够
        if (distance < GameConfig.MIN_SWIPE_DISTANCE) {
            return Direction.None;
        }

        // 计算角度（度）
        const angle = MathUtil.radianToDegree(Math.atan2(dy, dx));
        
        // 判断方向（考虑角度偏差）
        const deviation = GameConfig.MAX_SWIPE_ANGLE_DEVIATION;

        // 向右 (角度接近 0°)
        if (Math.abs(angle) < deviation) {
            return Direction.Right;
        }
        
        // 向上 (角度接近 90°)
        if (Math.abs(angle - 90) < deviation) {
            return Direction.Up;
        }
        
        // 向左 (角度接近 180° 或 -180°)
        if (Math.abs(angle - 180) < deviation || Math.abs(angle + 180) < deviation) {
            return Direction.Left;
        }
        
        // 向下 (角度接近 -90°)
        if (Math.abs(angle + 90) < deviation) {
            return Direction.Down;
        }

        // 斜向滑动，不处理
        return Direction.None;
    }

    /**
     * 设置回调
     * @param callback 回调接口
     */
    setCallback(callback: InputCallback): void {
        this._callback = callback;
    }

    /**
     * 启用/禁用输入
     */
    setEnabled(enabled: boolean): void {
        this._enabled = enabled;
    }

    /**
     * 获取是否启用
     */
    get enabled(): boolean {
        return this._enabled;
    }

    /**
     * 销毁
     */
    destroy(): void {
        this.unregisterEvents();
        this._node = null;
        this._callback = null;
    }
}
