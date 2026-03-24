/**
 * 面板基类
 * 所有界面面板的基类，提供通用的生命周期管理和动画效果
 * 提供代码创建 UI 的基础方法
 * 兼容 Cocos Creator 2.x
 *
 * 注意：遮罩层由 PanelManager 统一管理
 */

import { ResolutionConfig } from '../config/ResolutionConfig';

const { ccclass } = cc._decorator;

/**
 * 面板基类组件
 */
@ccclass
export default abstract class BasePanel extends cc.Component {
    /** 面板是否已初始化 */
    protected _initialized: boolean = false;


    /** 设计分辨率 */
    protected readonly designWidth: number = ResolutionConfig.DESIGN_WIDTH;
    protected readonly designHeight: number = ResolutionConfig.DESIGN_HEIGHT;

    /**
     * 生命周期：加载
     */
    onLoad(): void {
        this.init();
    }

    /**
     * 生命周期：开始
     */
    start(): void {
        
    }

    protected onEnable(): void {
        this.onPanelOpen();
    }

    protected onDisable(): void {
        this.onPanelClose();
    }

    /**
     * 初始化面板
     */
    protected init(): void {
        if (this._initialized) return;

        // 如果节点有 Widget 组件，由 Widget 控制大小
        // 否则设置设计分辨率大小
        const widget = this.node.getComponent(cc.Widget);
        if (!widget) {
            this.node.setContentSize(this.designWidth, this.designHeight);
        }

        // 调用子类实现
        this.setupUI();
        this._initialized = true;

        cc.log(`[${this.constructor.name}] 面板初始化完成`);
    }

    /**
     * 设置UI（子类实现）
     */
    protected abstract setupUI(): void;

    /**
     * 设置事件（子类实现）
     */
    protected abstract setupEvents(): void;

    /**
     * 面板打开时调用
     */
    protected onPanelOpen(): void {
        this.setupEvents();
        // 子类可以重写
    }

    /**
     * 面板关闭时调用
     */
    protected onPanelClose(): void {
        // 子类可以重写
    }

    /**
     * 关闭面板
     */
    public close(): void {
        this.onPanelClose();
        this.node.emit('panel-close');
    }

    /**
     * 显示面板（由PanelManager调用）
     */
    public show(): void {
        this.node.active = true;
        this.onPanelOpen();
    }

    /**
     * 隐藏面板（由PanelManager调用）
     */
    public hide(): void {
        this.onPanelClose();
        this.node.active = false;
    }


    /**
     * 播放按钮动画
     */
    protected playButtonAnimation(button: cc.Node): void {
        cc.tween(button)
            .to(0.05, { scale: 0.9 })
            .to(0.1, { scale: 1.0 })
            .start();
    }

    // ==================== 事件绑定方法 ====================

    /**
     * 绑定按钮点击事件
     * @param node 目标节点
     * @param handler 处理方法
     * @param eventType 事件类型，默认 cc.Node.EventType.TOUCH_END
     * @param playAnimation 是否播放按钮动画，默认 true
     */
    protected onClick(node: cc.Node, handler: () => void, eventType?: string, playAnimation: boolean = true): void {
        if (!node) return;
        
        const type = eventType || cc.Node.EventType.TOUCH_END ;
        node.on(type, function(this: BasePanel) {
            if (playAnimation) {
                this.playButtonAnimation(node);
            }
            handler.call(this);
        }, this);
    }

    /**
     * 绑定节点触摸事件
     * @param node 目标节点
     * @param eventType 事件类型
     * @param handler 处理方法
     */
    protected onEvent(node: cc.Node, eventType: string, handler: (event: cc.Event.EventTouch) => void): void {
        if (!node) return;
        
        node.on(eventType, function(this: BasePanel, event: cc.Event.EventTouch) {
            handler.call(this, event);
        }, this);
    }

}
