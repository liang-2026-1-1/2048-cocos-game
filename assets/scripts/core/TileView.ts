/**
 * 方块视图组件
 * 单个方块的视图表现
 */

import { TileModel, TileState } from '../models/TileModel';
import { GameConfig } from '../config/GameConfig';
import { SkinConfig } from '../utils/SkinConfig';

const { ccclass, property } = cc._decorator;

/**
 * 方块视图组件类
 */
@ccclass
export default class TileView extends cc.Component {
    /** 方块数据 */
    private _tileData: TileModel = null;

    /** 背景精灵 */
    private _bgSprite: cc.Sprite = null;

    /** 数字标签 */
    private _label: cc.Label = null;

    /** 网格大小 */
    private _gridSize: number = GameConfig.DEFAULT_GRID_SIZE;

    /**
     * 初始化方块视图
     * @param tile 方块数据
     * @param gridSize 网格大小
     */
    init(tile: TileModel, gridSize: number): void {
        this._tileData = tile;
        this._gridSize = gridSize;
        
        const tileSize = GameConfig.getTileSize(gridSize);
        this.node.name = `Tile_${tile.id}`;
        this.node.setContentSize(tileSize, tileSize);
        
        this.createBackground();
        this.createLabel();
        this.updatePosition(tile.row, tile.col);
        this.updateAppearance();
    }

    /**
     * 创建背景
     */
    private createBackground(): void {
        // 移除旧的背景节点
        const oldBg = this.node.getChildByName('Background');
        if (oldBg) {
            oldBg.destroy();
        }

        const tileSize = GameConfig.getTileSize(this._gridSize);
        const bgNode = new cc.Node('Background');
        bgNode.setPosition(0, 0);
        this._bgSprite = bgNode.addComponent(cc.Sprite);
        this._bgSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        bgNode.setContentSize(tileSize, tileSize);
        bgNode.parent = this.node;
        bgNode.setSiblingIndex(0);
    }

    /**
     * 创建标签
     */
    private createLabel(): void {
        // 移除旧的标签节点
        const oldLabel = this.node.getChildByName('Label');
        if (oldLabel) {
            oldLabel.destroy();
        }

        const labelNode = new cc.Node('Label');
        labelNode.setPosition(0, 0);
        this._label = labelNode.addComponent(cc.Label);
        this._label.fontFamily = 'Arial';
        this._label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        this._label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        labelNode.parent = this.node;
        labelNode.setSiblingIndex(1);
    }

    /**
     * 更新外观（颜色和数值）
     */
    updateAppearance(): void {
        if (!this._tileData) return;

        const value = this._tileData.value;
        const tileSize = GameConfig.getTileSize(this._gridSize);
        
        // 更新背景颜色
        this.updateBackgroundColor(value);
        
        // 更新标签
        this._label.string = value.toString();
        this._label.fontSize = GameConfig.getTileFontSize(value, tileSize);
        this._label.lineHeight = GameConfig.getTileFontSize(value, tileSize);
        this.node.getChildByName('Label').color = SkinConfig.getTileTextColor(value);
    }

    /**
     * 更新背景颜色
     */
    private updateBackgroundColor(value: number): void {
        if (!this._bgSprite) return;

        const color = SkinConfig.getTileBgColor(value);
        const texture = this.createRoundedRectTexture(color);
        this._bgSprite.spriteFrame = new cc.SpriteFrame(texture);
    }

    /**
     * 创建圆角矩形纹理
     */
    private createRoundedRectTexture(color: cc.Color): cc.Texture2D {
        const size = GameConfig.getTileSize(this._gridSize);
        const radius = GameConfig.TILE_RADIUS;
        
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // 绘制圆角矩形
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
     * 更新位置
     * @param row 行索引
     * @param col 列索引
     */
    updatePosition(row: number, col: number): void {
        const pos = GameConfig.getTilePosition(row, col, this._gridSize);
        this.node.setPosition(pos);
    }

    /**
     * 获取方块数据
     */
    get tileData(): TileModel {
        return this._tileData;
    }

    /**
     * 设置方块数据
     */
    set tileData(tile: TileModel) {
        this._tileData = tile;
        this.updateAppearance();
    }

    /**
     * 播放移动动画
     * @param targetRow 目标行
     * @param targetCol 目标列
     * @param duration 持续时间
     * @param callback 完成回调
     */
    playMoveAnimation(targetRow: number, targetCol: number, duration: number = GameConfig.MOVE_DURATION, callback?: () => void): void {
        const targetPos = GameConfig.getTilePosition(targetRow, targetCol, this._gridSize);
        
        cc.tween(this.node)
            .to(duration, { position: targetPos }, { easing: 'sineOut' })
            .call(() => {
                if (this._tileData) {
                    this._tileData.state = TileState.Normal;
                }
                callback && callback();
            })
            .start();
    }

    /**
     * 播放合并动画
     * @param callback 完成回调
     */
    playMergeAnimation(callback?: () => void): void {
        cc.tween(this.node)
            .to(GameConfig.MERGE_DURATION * 0.5, { scale: 1.2 }, { easing: 'sineOut' })
            .call(() => {
                this.updateAppearance();
            })
            .to(GameConfig.MERGE_DURATION * 0.5, { scale: 1.0 }, { easing: 'sineIn' })
            .call(() => {
                if (this._tileData) {
                    this._tileData.state = TileState.Normal;
                }
                callback && callback();
            })
            .start();
    }

    /**
     * 播放出现动画
     * @param callback 完成回调
     */
    playAppearAnimation(callback?: () => void): void {
        this.node.scale = 0;
        this.node.opacity = 255;

        cc.tween(this.node)
            .to(GameConfig.APPEAR_DURATION, { scale: 1 }, { easing: 'backOut' })
            .call(() => {
                if (this._tileData) {
                    this._tileData.state = TileState.Normal;
                }
                callback && callback();
            })
            .start();
    }

    /**
     * 播放消失动画
     * @param callback 完成回调
     */
    playRemoveAnimation(callback?: () => void): void {
        cc.tween(this.node)
            .to(0.1, { scale: 0, opacity: 0 }, { easing: 'sineIn' })
            .call(() => {
                callback && callback();
            })
            .start();
    }
}
