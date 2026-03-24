/**
 * 场景自动初始化脚本
 * 用于一键配置空场景，添加必要的Canvas、Camera、PanelManager等节点
 * 使用方法：将此脚本挂载到空场景的根节点上
 */

import PanelManager from './managers/PanelManager';
import { ResolutionConfig } from './config/ResolutionConfig';
import { GameConfig } from './config/GameConfig';

const { ccclass, property, executeInEditMode } = cc._decorator;

/**
 * 场景初始化组件
 * 在编辑器模式下也可执行，方便场景配置
 */
@ccclass
@executeInEditMode
export default class SceneSetup extends cc.Component {
    // ==================== 配置选项 ====================
    
    /** 是否自动创建Canvas */
    @property
    autoCreateCanvas: boolean = true;
    
    /** 是否自动创建Camera */
    @property
    autoCreateCamera: boolean = true;
    
    /** 是否自动创建PanelManager */
    @property
    autoCreatePanelManager: boolean = true;
    
    /** 是否显示调试信息 */
    @property
    showDebugInfo: boolean = false;
    
    // ==================== 节点引用 ====================
    
    private _canvas: cc.Node = null;
    private _camera: cc.Node = null;
    private _panelManagerNode: cc.Node = null;
    
    /**
     * 生命周期：加载
     */
    onLoad(): void {
        if (CC_EDITOR) {
            // 编辑器模式下初始化场景结构
            this.setupSceneInEditor();
        } else {
            // 运行时初始化
            this.setupScene();
        }
    }
    
    /**
     * 生命周期：开始
     */
    start(): void {
        if (!CC_EDITOR) {
            this.logSceneInfo();
        }
    }
    
    /**
     * 编辑器模式下设置场景
     */
    private setupSceneInEditor(): void {
        cc.log('[SceneSetup] 编辑器模式 - 初始化场景结构');
        
        // 设置设计分辨率
        this.setupDesignResolution();
        
        // 创建Canvas
        if (this.autoCreateCanvas) {
            this.createCanvas();
        }
        
        // 创建Camera
        if (this.autoCreateCamera) {
            this.createCamera();
        }
        
        // 创建PanelManager
        if (this.autoCreatePanelManager) {
            this.createPanelManager();
        }
    }
    
    /**
     * 运行时设置场景
     */
    private setupScene(): void {
        cc.log('[SceneSetup] 运行时 - 初始化场景');
        
        // 查找或创建Canvas
        this._canvas = cc.find('Canvas');
        if (!this._canvas && this.autoCreateCanvas) {
            this._canvas = this.createCanvas();
        }
        
        // 查找或创建Camera
        this._camera = cc.find('Main Camera');
        if (!this._camera && this.autoCreateCamera) {
            this._camera = this.createCamera();
        }
        
        // 查找或创建PanelManager
        if (this._canvas) {
            this._panelManagerNode = this._canvas.getChildByName('PanelManager');
            if (!this._panelManagerNode && this.autoCreatePanelManager) {
                this._panelManagerNode = this.createPanelManager();
            }
        }
        
        // 设置场景背景色
        this.setupBackgroundColor();
    }
    
    /**
     * 设置设计分辨率
     */
    private setupDesignResolution(): void {
        // 在Cocos Creator 2.x中，设计分辨率在场景设置中配置
        // 这里只是打印信息
        cc.log(`[SceneSetup] 设计分辨率: ${ResolutionConfig.DESIGN_WIDTH}×${ResolutionConfig.DESIGN_HEIGHT}`);
    }
    
    /**
     * 创建Canvas节点
     */
    private createCanvas(): cc.Node {
        let canvasNode = cc.find('Canvas');
        
        if (!canvasNode) {
            canvasNode = new cc.Node('Canvas');
            canvasNode.parent = this.node;
            
            // 添加Canvas组件
            const canvas = canvasNode.addComponent(cc.Canvas);
            
            // 设置设计分辨率
            canvas.designResolution = cc.size(ResolutionConfig.DESIGN_WIDTH, ResolutionConfig.DESIGN_HEIGHT);
            canvas.fitWidth = true;
            canvas.fitHeight = false;
            
            // 添加Widget组件（用于自适应）
            const widget = canvasNode.addComponent(cc.Widget);
            widget.isAlignTop = true;
            widget.isAlignBottom = true;
            widget.isAlignLeft = true;
            widget.isAlignRight = true;
            widget.top = 0;
            widget.bottom = 0;
            widget.left = 0;
            widget.right = 0;
            
            cc.log('[SceneSetup] Canvas节点创建完成');
        }
        
        this._canvas = canvasNode;
        return canvasNode;
    }
    
    /**
     * 创建Camera节点
     */
    private createCamera(): cc.Node {
        let cameraNode = cc.find('Main Camera');
        
        if (!cameraNode) {
            cameraNode = new cc.Node('Main Camera');
            cameraNode.parent = this.node;
            
            // 添加Camera组件
            const camera = cameraNode.addComponent(cc.Camera);
            camera.backgroundColor = cc.color().fromHEX('#faf8ef');
            camera.depth = -1;
            camera.zoomRatio = 1;
            
            cc.log('[SceneSetup] Camera节点创建完成');
        }
        
        this._camera = cameraNode;
        return cameraNode;
    }
    
    /**
     * 创建PanelManager节点
     */
    private createPanelManager(): cc.Node {
        if (!this._canvas) {
            cc.warn('[SceneSetup] Canvas不存在，无法创建PanelManager');
            return null;
        }
        
        let pmNode = this._canvas.getChildByName('PanelManager');
        
        if (!pmNode) {
            pmNode = new cc.Node('PanelManager');
            pmNode.parent = this._canvas;
            
            // 添加PanelManager组件
            pmNode.addComponent(PanelManager);
            
            cc.log('[SceneSetup] PanelManager节点创建完成');
        }
        
        this._panelManagerNode = pmNode;
        return pmNode;
    }
    
    /**
     * 设置背景颜色
     */
    private setupBackgroundColor(): void {
        if (this._camera) {
            const camera = this._camera.getComponent(cc.Camera);
            if (camera) {
                camera.backgroundColor = cc.color().fromHEX(GameConfig.BG_COLOR.toHEX());
            }
        }
    }
    
    /**
     * 打印场景信息
     */
    private logSceneInfo(): void {
        if (!this.showDebugInfo) return;
        
        cc.log('=== 场景信息 ===');
        cc.log(`设计分辨率: ${ResolutionConfig.DESIGN_WIDTH}×${ResolutionConfig.DESIGN_HEIGHT}`);
        cc.log(`Canvas: ${this._canvas ? '✓' : '✗'}`);
        cc.log(`Camera: ${this._camera ? '✓' : '✗'}`);
        cc.log(`PanelManager: ${this._panelManagerNode ? '✓' : '✗'}`);
        cc.log('================');
    }
    
    /**
     * 获取Canvas节点
     */
    public getCanvas(): cc.Node | null {
        return this._canvas;
    }
    
    /**
     * 获取PanelManager节点
     */
    public getPanelManagerNode(): cc.Node | null {
        return this._panelManagerNode;
    }
    
    /**
     * 编辑器菜单：一键配置场景
     */
    public setupFromMenu(): void {
        cc.log('[SceneSetup] 从菜单执行场景配置');
        this.setupSceneInEditor();
    }
}
