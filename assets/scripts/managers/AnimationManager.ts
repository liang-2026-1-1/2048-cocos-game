/**
 * 动画管理器
 * 统一管理所有动画效果
 */

import { TileModel, TileState } from '../models/TileModel';
import { GameConfig } from '../config/GameConfig';
import { SkinConfig } from '../utils/SkinConfig';

/** 动画完成回调 */
type AnimationCallback = () => void;

/**
 * 动画管理器类
 */
export class AnimationManager {
    /** 方块视图映射（方块ID -> 节点） */
    private _tileNodes: Map<number, cc.Node> = new Map();

    /** 方块容器节点 */
    private _tileContainer: cc.Node = null;

    /** 是否正在播放动画 */
    private _isAnimating: boolean = false;

    /** 动画队列 */
    private _animationQueue: Array<() => Promise<void>> = [];

    /**
     * 初始化动画管理器
     * @param container 方块容器节点
     */
    init(container: cc.Node): void {
        this._tileContainer = container;
    }

    /**
     * 注册方块节点
     * @param tile 方块数据
     * @param node 方块节点
     */
    registerTileNode(tile: TileModel, node: cc.Node): void {
        this._tileNodes.set(tile.id, node);
    }

    /**
     * 取消注册方块节点
     * @param tileId 方块ID
     */
    unregisterTileNode(tileId: number): void {
        this._tileNodes.delete(tileId);
    }

    /**
     * 获取方块节点
     * @param tileId 方块ID
     */
    getTileNode(tileId: number): cc.Node {
        return this._tileNodes.get(tileId);
    }

    /**
     * 播放方块移动动画
     * @param tile 方块数据
     * @param targetPos 目标位置
     * @param callback 完成回调
     */
    playMoveAnimation(tile: TileModel, targetPos: cc.Vec3, callback?: AnimationCallback): void {
        const node = this._tileNodes.get(tile.id);
        if (!node) {
            callback && callback();
            return;
        }

        cc.tween(node)
            .to(GameConfig.MOVE_DURATION, { position: targetPos }, { easing: 'sineOut' })
            .call(() => {
                tile.state = TileState.Normal;
                callback && callback();
            })
            .start();
    }

    /**
     * 播放方块合并动画
     * @param tile 方块数据
     * @param callback 完成回调
     */
    playMergeAnimation(tile: TileModel, callback?: AnimationCallback): void {
        const node = this._tileNodes.get(tile.id);
        if (!node) {
            callback && callback();
            return;
        }

        cc.tween(node)
            .to(GameConfig.MERGE_DURATION * 0.5, { scale: 1.2 }, { easing: 'sineOut' })
            .to(GameConfig.MERGE_DURATION * 0.5, { scale: 1.0 }, { easing: 'sineIn' })
            .call(() => {
                tile.state = TileState.Normal;
                callback && callback();
            })
            .start();
    }

    /**
     * 播放新方块生成动画
     * @param tile 方块数据
     * @param node 方块节点
     * @param callback 完成回调
     */
    playAppearAnimation(tile: TileModel, node: cc.Node, callback?: AnimationCallback): void {
        node.scale = 0;
        node.opacity = 0;

        cc.tween(node)
            .to(GameConfig.APPEAR_DURATION, { scale: 1, opacity: 255 }, { easing: 'backOut' })
            .call(() => {
                tile.state = TileState.Normal;
                callback && callback();
            })
            .start();
    }

    /**
     * 播放方块消失动画
     * @param tile 方块数据
     * @param callback 完成回调
     */
    playRemoveAnimation(tile: TileModel, callback?: AnimationCallback): void {
        const node = this._tileNodes.get(tile.id);
        if (!node) {
            callback && callback();
            return;
        }

        cc.tween(node)
            .to(0.1, { scale: 0, opacity: 0 }, { easing: 'sineIn' })
            .call(() => {
                this.unregisterTileNode(tile.id);
                node.destroy();
                callback && callback();
            })
            .start();
    }

    /**
     * 播放分数增加动画
     * @param scoreNode 分数节点
     * @param fromScore 起始分数
     * @param toScore 目标分数
     * @param duration 持续时间
     */
    playScoreAnimation(scoreNode: cc.Node, fromScore: number, toScore: number, duration: number = 0.3): void {
        if (!scoreNode) return;

        const label = scoreNode.getComponent(cc.Label);
        if (!label) return;

        const diff = toScore - fromScore;
        const startTime = Date.now();
        const update = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            const progress = Math.min(elapsed / duration, 1);
            const currentScore = Math.floor(fromScore + diff * progress);
            label.string = currentScore.toString();

            if (progress < 1) {
                setTimeout(update, 16);
            }
        };
        update();

        // 弹跳效果
        cc.tween(scoreNode)
            .to(0.1, { scale: GameConfig.SCORE_POP_SCALE })
            .to(0.1, { scale: 1.0 })
            .start();
    }

    /**
     * 播放游戏结束动画
     * @param overlay 遮罩节点
     * @param panel 结果面板节点
     * @param callback 完成回调
     */
    playGameOverAnimation(overlay: cc.Node, panel: cc.Node, callback?: AnimationCallback): void {
        // 遮罩淡入
        overlay.opacity = 0;
        overlay.active = true;
        
        cc.tween(overlay)
            .to(GameConfig.OVERLAY_DURATION, { opacity: 180 })
            .start();

        // 面板弹出
        panel.scale = 0;
        panel.active = true;
        
        cc.tween(panel)
            .delay(GameConfig.OVERLAY_DURATION * 0.5)
            .to(GameConfig.RESULT_PANEL_DURATION, { scale: 1 }, { easing: 'backOut' })
            .call(() => {
                callback && callback();
            })
            .start();
    }

    /**
     * 播放游戏胜利动画
     * @param overlay 遮罩节点
     * @param panel 胜利面板节点
     * @param callback 完成回调
     */
    playWinAnimation(overlay: cc.Node, panel: cc.Node, callback?: AnimationCallback): void {
        // 类似游戏结束动画，但可以添加更华丽的特效
        this.playGameOverAnimation(overlay, panel, callback);
    }

    /**
     * 隐藏结果面板
     * @param overlay 遮罩节点
     * @param panel 面板节点
     * @param callback 完成回调
     */
    hideResultPanel(overlay: cc.Node, panel: cc.Node, callback?: AnimationCallback): void {
        cc.tween(panel)
            .to(0.2, { scale: 0 }, { easing: 'sineIn' })
            .call(() => {
                panel.active = false;
            })
            .start();

        cc.tween(overlay)
            .to(0.2, { opacity: 0 })
            .call(() => {
                overlay.active = false;
                callback && callback();
            })
            .start();
    }

    /**
     * 创建方块节点
     * @param tile 方块数据
     * @param gridSize 网格大小
     * @returns 方块节点
     */
    createTileNode(tile: TileModel, gridSize: number): cc.Node {
        const node = new cc.Node(`Tile_${tile.id}`);
        const tileSize = GameConfig.getTileSize(gridSize);
        
        // 添加背景精灵
        const bgSprite = node.addComponent(cc.Sprite);
        bgSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        node.setContentSize(tileSize, tileSize);
        
        // 创建背景
        this.updateTileAppearance(node, tile.value, gridSize);
        
        // 添加标签
        const labelNode = new cc.Node('Label');
        const label = labelNode.addComponent(cc.Label);
        label.string = tile.value.toString();
        label.fontSize = GameConfig.getTileFontSize(tile.value, tileSize);
        label.fontFamily = 'Arial';
        label.lineHeight = GameConfig.getTileFontSize(tile.value, tileSize);
        labelNode.color = SkinConfig.getTileTextColor(tile.value);
        labelNode.setPosition(0, 0);
        labelNode.parent = node;

        // 设置位置
        const pos = GameConfig.getTilePosition(tile.row, tile.col, gridSize);
        node.setPosition(pos);

        // 注册节点
        this.registerTileNode(tile, node);

        return node;
    }

    /**
     * 更新方块外观
     * @param node 方块节点
     * @param value 方块数值
     * @param gridSize 网格大小（可选）
     */
    updateTileAppearance(node: cc.Node, value: number, gridSize?: number): void {
        const sprite = node.getComponent(cc.Sprite);
        if (!sprite) return;

        // 获取方块尺寸（如果提供了gridSize则动态计算，否则使用节点当前尺寸）
        const tileSize = gridSize ? GameConfig.getTileSize(gridSize) : node.width;

        // 创建纯色背景
        const color = SkinConfig.getTileBgColor(value);
        const texture = this.createColorTexture(color, tileSize);
        sprite.spriteFrame = new cc.SpriteFrame(texture);

        // 更新标签
        const labelNode = node.getChildByName('Label');
        if (labelNode) {
            const label = labelNode.getComponent(cc.Label);
            if (label) {
                label.string = value.toString();
                label.fontSize = GameConfig.getTileFontSize(value, tileSize);
                label.lineHeight = GameConfig.getTileFontSize(value, tileSize);
                labelNode.color = SkinConfig.getTileTextColor(value);
            }
        }
    }

    /**
     * 创建纯色纹理
     * @param color 颜色
     * @param size 尺寸
     */
    private createColorTexture(color: cc.Color, size: number): cc.Texture2D {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // 绘制圆角矩形
        const radius = GameConfig.TILE_RADIUS;
        ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(size - radius, 0);
        ctx.quadraticCurveTo(size, 0, size, radius);
        ctx.lineTo(size, size - radius);
        ctx.quadraticCurveTo(size, size, size - radius, size);
        ctx.lineTo(radius, size);
        ctx.quadraticCurveTo(0, size, 0, size - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.fill();

        const texture = new cc.Texture2D();
        texture.initWithElement(canvas);
        texture.handleLoadedTexture();
        
        return texture;
    }

    /**
     * 更新方块节点位置
     * @param tile 方块数据
     * @param gridSize 网格大小
     */
    updateTileNodePosition(tile: TileModel, gridSize: number): void {
        const node = this._tileNodes.get(tile.id);
        if (!node) return;

        const pos = GameConfig.getTilePosition(tile.row, tile.col, gridSize);
        node.setPosition(pos);
    }

    /**
     * 清除所有方块节点
     */
    clearAllTileNodes(): void {
        this._tileNodes.forEach((node) => {
            if (cc.isValid(node)) {
                node.destroy();
            }
        });
        this._tileNodes.clear();
    }

    /**
     * 是否正在播放动画
     */
    get isAnimating(): boolean {
        return this._isAnimating;
    }

    /**
     * 销毁
     */
    destroy(): void {
        this.clearAllTileNodes();
        this._tileContainer = null;
    }
}
