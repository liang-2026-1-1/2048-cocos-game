/**
 * 面板管理器
 * 统一管理所有界面面板的创建、显示、隐藏
 * 采用单例模式，提供全局访问
 * 直接实例化面板类，不再使用 prefab
 * 兼容 Cocos Creator 2.x
 */

import { PanelType, PanelConfigItem, PANEL_CONFIGS } from '../config/PanelConfig';
import { ResolutionConfig } from '../config/ResolutionConfig';
import BasePanel from '../panels/BasePanel';
import { UIUtils } from '../utils/UIUtils';

const { ccclass } = cc._decorator;

/**
 * 面板管理器组件
 */
@ccclass
export default class PanelManager {
    // ==================== 单例模式 ====================

    private static _instance: PanelManager = null;

    /**
     * 获取单例实例
     * 如果实例不存在，会自动创建
     */
    public static getInstance(): PanelManager {
        if (!this._instance) {
            this._instance = new PanelManager();
            this._instance.initialize();
            cc.log('[PanelManager] 自动创建单例实例');
        }
        return this._instance;
    }

    /**
     * 初始化（清除状态）
     */
    private initialize(): void {
        this.hideOverlay();
        this.panelCache.clear();
        this.panelStack = [];
        this._panelLayer = null;
        this._tipsLayer = null;
    }

    /**
     * 获取单例实例（只读属性）
     */
    public static get instance(): PanelManager {
        return this.getInstance();
    }

    // ==================== 面板缓存 ====================

    /** 已加载的面板实例缓存 */
    private panelCache: Map<PanelType, cc.Node> = new Map();

    /** 当前显示的面板栈 */
    private panelStack: PanelType[] = [];

    /** 当前遮罩节点 */
    private currentOverlay: cc.Node = null;

    /** 当前关联的面板类型（用于点击遮罩关闭） */
    private currentOverlayPanelType: PanelType = null;

    /** 遮罩透明度 (0.5 = 128) */
    private readonly overlayOpacity: number = 128;

    // ==================== Canvas引用 ====================

    private _canvas: cc.Node = null;

    /** 获取 Canvas 节点 */
    private get canvas(): cc.Node {
        if (!this._canvas || !cc.isValid(this._canvas)) {
            this._canvas = cc.find('Canvas');
        }
        return this._canvas;
    }

    // ==================== 层级管理 ====================

    private _panelLayer: cc.Node = null;
    private _tipsLayer: cc.Node = null;

    /** 获取面板层级节点 */
    public get panelLayer(): cc.Node {
        if (!this._panelLayer || !cc.isValid(this._panelLayer)) {
            this._panelLayer = this.createLayer('PanelLayer');
        }
        return this._panelLayer;
    }

    /** 获取提示层级节点 */
    public get tipsLayer(): cc.Node {
        if (!this._tipsLayer || !cc.isValid(this._tipsLayer)) {
            this._tipsLayer = this.createLayer('TipsLayer');
        }
        return this._tipsLayer;
    }

    /**
     * 创建层级节点
     */
    private createLayer(name: string): cc.Node {
        let layer = this.canvas.getChildByName(name);
        if (!layer) {
            layer = new cc.Node(name);
            // 设置锚点为屏幕中心，这样子节点的居中计算才正确
            layer.setAnchorPoint(0.5, 0.5);
            layer.setPosition(this.canvas.width / 2, this.canvas.height / 2);
            layer.setContentSize(this.canvas.width, this.canvas.height);
            layer.parent = this.canvas;

            // 添加 Widget 组件让层级填满屏幕
            const widget = layer.addComponent(cc.Widget);
            widget.isAlignTop = true;
            widget.isAlignBottom = true;
            widget.isAlignLeft = true;
            widget.isAlignRight = true;
            widget.top = 0;
            widget.bottom = 0;
            widget.left = 0;
            widget.right = 0;

        }
        return layer;
    }

    // ==================== 面板操作 ====================

    /**
     * 打开面板
     * @param type 面板类型
     * @param callback 面板打开后的回调
     */
    openPanel(type: PanelType, callback?: (panel: cc.Node) => void): void {
        const config = PANEL_CONFIGS.get(type);
        if (!config) {
            cc.error(`[PanelManager] 未找到面板配置: ${type}`);
            return;
        }

        cc.log(`[PanelManager] 打开面板: ${config.panelName}, fullscreen: ${config.fullscreen}`);

        // 检查是否已经打开
        const cachedPanel = this.panelCache.get(type);
        if (cachedPanel && cachedPanel.active) {
            cc.warn(`[PanelManager] 面板已经打开: ${config.panelName}`);
            callback?.(cachedPanel);
            return;
        }

        // 如果是全屏面板，清除遮罩
        if (config.fullscreen) {
            cc.log(`[PanelManager] 清除遮罩（全屏面板）`);
            this.hideOverlay();
        }

        // 如果是单例面板，关闭其他单例面板
        // if (config.singleton) {
        //     this.closeAllSingletonPanels();
        // }

        // 创建或显示面板
        if (cachedPanel) {
            // 使用缓存的面板
            this.showPanel(cachedPanel, config, callback);
        } else {
            // 创建新的面板
            this.createPanel(config, callback);
        }
    }

    /**
     * 关闭面板
     * @param type 面板类型
     * @param destroy 是否销毁
     */
    closePanel(type: PanelType, destroy: boolean = false): void {
        const panel = this.panelCache.get(type);
        if (!panel || !panel.active) {
            return;
        }

        const config = PANEL_CONFIGS.get(type);

        // 非全屏面板：隐藏遮罩 + 播放动画
        if (config && !config.fullscreen) {
            // 隐藏遮罩
            this.hideOverlay();

            // 播放关闭动画
            this.playHideAnimation(panel, () => {
                if (destroy) {
                    panel.destroy();
                    this.panelCache.delete(type);
                } else {
                    panel.active = false;

                }
                // 从栈中移除
                const index = this.panelStack.indexOf(type);
                if (index > -1) {
                    this.panelStack.splice(index, 1);
                }
            });
        } else {
            // 全屏面板：直接隐藏
            if (destroy) {
                panel.destroy();
                this.panelCache.delete(type);
            } else {
                panel.active = false;
            }

            // 从栈中移除
            const index = this.panelStack.indexOf(type);
            if (index > -1) {
                this.panelStack.splice(index, 1);
            }
        }
    }

    /**
     * 关闭所有单例面板
     */
    closeAllSingletonPanels(): void {
        PANEL_CONFIGS.forEach((config, type) => {
            if (config.singleton) {
                this.closePanel(type);
            }
        });
    }

    /**
     * 关闭所有面板
     */
    closeAllPanels(): void {
        this.panelCache.forEach((panel, type) => {
            this.closePanel(type);
        });
    }

    /**
     * 获取当前打开的面板
     */
    getCurrentPanel(): cc.Node | null {
        if (this.panelStack.length === 0) return null;

        const currentType = this.panelStack[this.panelStack.length - 1];
        return this.panelCache.get(currentType) || null;
    }

    /**
     * 获取面板实例
     */
    getPanel(type: PanelType): cc.Node | null {
        return this.panelCache.get(type) || null;
    }

    /**
     * 获取面板组件（类型安全）
     */
    public getComponent<T extends BasePanel>(type: PanelType): T | null {
        const node = this.panelCache.get(type);
        if (!node) return null;
        
        // 假设配置中有 panelClass 字段
        const config = PANEL_CONFIGS.get(type);
        if (!config?.panelClass) return null;
        
        return node.getComponent(config.panelClass) as T;
    }

    /**
     * 检查面板是否已打开
     */
    isPanelOpen(type: PanelType): boolean {
        const panel = this.panelCache.get(type);
        return panel && panel.active;
    }

    // ==================== 内部方法 ====================

    /**
     * 创建面板（直接实例化，不使用 prefab）
     */
    private createPanel(config: PanelConfigItem, callback?: (panel: cc.Node) => void): void {
        // 创建面板节点
        const panel = new cc.Node(config.panelName);


        // 全屏面板：设置填满屏幕的 Widget
        if (config.fullscreen) {
            // 设置设计分辨率大小 (Cocos Creator 2.x API)
            panel.setContentSize(ResolutionConfig.DESIGN_WIDTH, ResolutionConfig.DESIGN_HEIGHT);

            // 添加 Widget 组件让面板适配 Canvas
            const widget = panel.addComponent(cc.Widget);
            widget.isAlignTop = true;
            widget.isAlignBottom = true;
            widget.isAlignLeft = true;
            widget.isAlignRight = true;
            widget.top = 0;
            widget.bottom = 0;
            widget.left = 0;
            widget.right = 0;

            cc.log(`[PanelManager] 全屏面板配置: 设置尺寸 ${ResolutionConfig.DESIGN_WIDTH}x${ResolutionConfig.DESIGN_HEIGHT}`);
        } else {
            // 非全屏面板：设置锚点和位置，让面板居中
            panel.setAnchorPoint(0.5, 0.5);
            panel.setPosition(0, 0);
            // 设置一个足够大的内容区域，让内部 Widget 有正确的参考
            panel.setContentSize(ResolutionConfig.DESIGN_WIDTH, ResolutionConfig.DESIGN_HEIGHT);
            
            // 添加 Widget 让非全屏面板也居中对齐
            const widget = panel.addComponent(cc.Widget);
            widget.isAlignHorizontalCenter = true;
            widget.isAlignVerticalCenter = true;
            widget.horizontalCenter = 0;
            widget.verticalCenter = 0;
            widget.isAlignTop = false;
            widget.isAlignBottom = false;
            widget.isAlignLeft = false;
            widget.isAlignRight = false;
            // 设置对齐模式为ALWAYS，确保立即生效
            widget.alignMode = cc.Widget.AlignMode.ALWAYS;

        }

        // 添加面板组件
        if (config.panelClass) {
            panel.addComponent(config.panelClass);
        }

        // 缓存面板
        if (config.cache) {
            this.panelCache.set(config.type, panel);
        }

        cc.log(`[PanelManager] 创建面板完成: ${config.panelName}`);

        // 显示面板
        this.showPanel(panel, config, callback);
    }

    /**
     * 显示面板
     */
    private showPanel(panel: cc.Node, config: PanelConfigItem, callback?: (panel: cc.Node) => void): void {


        // 将面板添加到 panelLayer 层级
        if (!panel.parent) {
            panel.parent = this.panelLayer;

        }

        panel.active = true;

        // 手动计算居中位置（Widget可能不生效，所以手动设置）
        if (!config.fullscreen) {
            const parent = panel.parent;
            const centerX = parent.width * 0.5 - parent.width * parent.anchorX;
            const centerY = parent.height * 0.5 - parent.height * parent.anchorY;
            

            panel.setPosition(centerX, centerY);
            
         
        } else {
            panel.setPosition(0, 0);
        }

        // 更新 Widget 组件对齐（即使不生效也调用）
        const widget = panel.getComponent(cc.Widget);
        if (widget) {
            widget.updateAlignment();
        }

        // 添加到栈
        this.panelStack.push(config.type);

        // 非全屏界面：显示遮罩 + 播放动画
        if (!config.fullscreen) {
            // 创建遮罩层（传入面板索引，让遮罩在面板下方）
            const panelIndex = panel.getSiblingIndex();
            this.showOverlay(config.type, panelIndex);

            // 播放显示动画
            this.playShowAnimation(panel, () => {
                callback?.(panel);
            });
        } else {
            // 全屏界面：清除遮罩 + 直接显示
            this.hideOverlay();

            panel.scale = 1;
            panel.opacity = 255;
            callback?.(panel);
        }
    }

    /**
     * 创建并显示遮罩层
     * @param panelType 面板类型
     * @param panelIndex 面板在 layer 中的索引，遮罩将插入到该索引位置（面板下方）
     */
    private showOverlay(panelType: PanelType, panelIndex: number = 0): void {
        // 先移除旧遮罩
        this.hideOverlay();

        // 安全检查：如果面板是全屏的，不显示遮罩
        const config = PANEL_CONFIGS.get(panelType);
        if (config?.fullscreen) {
            cc.log(`[PanelManager] 全屏面板 ${panelType}，跳过遮罩创建`);
            return;
        }

        cc.log(`[PanelManager] 创建遮罩，面板类型: ${panelType}, 面板索引: ${panelIndex}`);

        const overlay = new cc.Node('Overlay');

        // 添加 Sprite 组件显示黑色背景
        const sprite = overlay.addComponent(cc.Sprite);
        sprite.type = cc.Sprite.Type.SIMPLE;
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        UIUtils.setWhiteTexture(sprite);
        overlay.color = cc.Color.BLACK;
        overlay.opacity = 0; // 从透明开始，用于淡入动画

        // 点击遮罩关闭面板
        overlay.on(cc.Node.EventType.TOUCH_END, () => {
            if(panelType == PanelType.GameOver){
                return;
            }
            this.closePanel(panelType);
        }, this);

        // 插入到 panelLayer 层级
        overlay.parent = this.panelLayer;

        // 将遮罩插入到面板下方（使用面板索引，确保在面板下面）
        overlay.setSiblingIndex(panelIndex);

        // 设置遮罩大小为 panelLayer 大小，确保填满屏幕
        overlay.setContentSize(this.panelLayer.width, this.panelLayer.height);

        // 添加 Widget 组件让遮罩填满整个屏幕
        const overlayWidget = overlay.addComponent(cc.Widget);
        overlayWidget.isAlignTop = true;
        overlayWidget.isAlignBottom = true;
        overlayWidget.isAlignLeft = true;
        overlayWidget.isAlignRight = true;
        overlayWidget.top = 0;
        overlayWidget.bottom = 0;
        overlayWidget.left = 0;
        overlayWidget.right = 0;

        cc.log(`[PanelManager] 遮罩插入到索引: ${overlay.getSiblingIndex()}, 面板索引: ${panelIndex}`);

        // 淡入动画
        cc.tween(overlay)
            .to(0.3, { opacity: this.overlayOpacity })
            .start();

        this.currentOverlay = overlay;
        this.currentOverlayPanelType = panelType;
    }

    /**
     * 隐藏遮罩层
     */
    private hideOverlay(): void {
        if (this.currentOverlay) {
            const overlay = this.currentOverlay;
            cc.tween(overlay)
                .to(0.2, { opacity: 0 })
                .call(() => {
                    overlay.destroy();
                })
                .start();
            this.currentOverlay = null;
            this.currentOverlayPanelType = null;
        }
    }

    /**
     * 播放显示动画（仅非全屏面板）
     */
    private playShowAnimation(panel: cc.Node, callback?: () => void): void {
        panel.scale = 0;
        panel.opacity = 255;

        cc.tween(panel)
            .to(0.3, { scale: 1 }, { easing: 'backOut' })
            .call(() => callback?.())
            .start();
    }

    /**
     * 播放隐藏动画（仅非全屏面板）
     */
    private playHideAnimation(panel: cc.Node, callback?: () => void): void {
        cc.tween(panel)
            .to(0.2, { scale: 0 }, { easing: 'sineIn' })
            .call(() => callback?.())
            .start();
    }

    // ==================== 静态便捷方法 ====================

    /**
     * 打开面板（静态方法）
     */
    public static open(type: PanelType, callback?: (panel: cc.Node) => void): void {
        this.getInstance().openPanel(type, callback);
    }

    /**
     * 关闭面板（静态方法）
     */
    public static close(type: PanelType, destroy: boolean = false): void {
        if (this._instance) {
            this._instance.closePanel(type, destroy);
        }
    }

    /**
     * 关闭所有面板（静态方法）
     */
    public static closeAll(): void {
        if (this._instance) {
            this._instance.closeAllPanels();
        }
    }

    /**
     * 获取面板实例（静态方法）
     */
    public static get(type: PanelType): cc.Node | null {
        if (!this._instance) return null;
        return this._instance.getPanel(type);
    }

    /**
     * 检查面板是否已打开（静态方法）
     */
    public static isOpen(type: PanelType): boolean {
        if (!this._instance) return false;
        return this._instance.isPanelOpen(type);
    }
}
