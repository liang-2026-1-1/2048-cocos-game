/**
 * 游戏视图组件
 * 管理网格渲染和所有方块视图
 */

import { TileModel, TileState } from '../models/TileModel';
import { GridModel } from '../models/GridModel';
import { GameConfig } from '../config/GameConfig';
import { SkinConfig } from '../utils/SkinConfig';
import TileView from './TileView';

const { ccclass, property } = cc._decorator;

/**
 * 游戏视图组件类
 */
@ccclass
export default class GameView extends cc.Component {
    /** 网格背景节点 */
    @property(cc.Node)
    gridBg: cc.Node = null;

    /** 方块容器节点 */
    @property(cc.Node)
    tileContainer: cc.Node = null;

    /** 网格模型 */
    private _gridModel: GridModel = null;

    /** 方块视图映射 (tileId -> TileView) */
    private _tileViews: Map<number, TileView> = new Map();

    /** 网格大小 */
    private _gridSize: number = GameConfig.DEFAULT_GRID_SIZE;

    /** 是否正在播放动画 */
    private _isAnimating: boolean = false;

    /** 动画完成计数器 */
    private _animationCounter: number = 0;

    /** 所有动画完成回调 */
    private _allAnimationsDone: () => void = null;

    /**
     * 初始化游戏视图
     * @param gridModel 网格模型
     * @param gridSize 网格大小
     * @param gridBg 网格背景节点（可选）
     */
    init(gridModel: GridModel, gridSize: number, gridBg?: cc.Node): void {
        this._gridModel = gridModel;
        this._gridSize = gridSize;

        // 使用传入的网格背景或查找/创建
        if (gridBg) {
            this.gridBg = gridBg;
        }

        this.createGridBackground();
        this.clearAllTiles();
    }

    /**
     * 创建网格背景
     */
    private createGridBackground(): void {
        // 如果 gridBg 未绑定，尝试查找子节点中的 GridBackground
        if (!this.gridBg) {
            this.gridBg = this.node.getChildByName('GridBackground');
            if (!this.gridBg) {
                // 如果没有找到，使用 this.node
                this.gridBg = this.node;
            }
        }

        const totalSize = GameConfig.getGridTotalSize(this._gridSize);
        this.gridBg.setContentSize(totalSize, totalSize);

        // 创建背景颜色
        const sprite = this.gridBg.getComponent(cc.Sprite) || this.gridBg.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;

        const color = SkinConfig.currentTheme.gridBgColor;
        const texture = this.createRoundedRectTexture(cc.color().fromHEX(color), totalSize, GameConfig.TILE_RADIUS * 2);
        sprite.spriteFrame = new cc.SpriteFrame(texture);

        // 创建空格子
        this.createEmptyCells();
    }

    /**
     * 创建空格子背景
     */
    private createEmptyCells(): void {
        // 清除旧的空格子
        const oldCells = this.gridBg.getChildByName('EmptyCells');
        if (oldCells) {
            oldCells.destroy();
        }

        const cellsContainer = new cc.Node('EmptyCells');
        cellsContainer.parent = this.gridBg;
        cellsContainer.setSiblingIndex(0);

        const tileSize = GameConfig.getTileSize(this._gridSize);

        for (let row = 0; row < this._gridSize; row++) {
            for (let col = 0; col < this._gridSize; col++) {
                const cellNode = new cc.Node(`Cell_${row}_${col}`);
                const cellSprite = cellNode.addComponent(cc.Sprite);
                cellSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
                cellNode.setContentSize(tileSize, tileSize);

                const color = SkinConfig.currentTheme.emptyCellColor;
                const texture = this.createRoundedRectTexture(cc.color().fromHEX(color), tileSize, GameConfig.TILE_RADIUS);
                cellSprite.spriteFrame = new cc.SpriteFrame(texture);

                const pos = GameConfig.getTilePosition(row, col, this._gridSize);
                cellNode.setPosition(pos);
                cellNode.parent = cellsContainer;
            }
        }
    }

    /**
     * 创建圆角矩形纹理
     */
    private createRoundedRectTexture(color: cc.Color, size: number, radius: number): cc.Texture2D {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

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
     * 创建方块容器
     */
    private ensureTileContainer(): void {
        if (!this.tileContainer) {
            this.tileContainer = new cc.Node('TileContainer');
            this.tileContainer.parent = this.node;
            this.tileContainer.setSiblingIndex(1);
        }
    }

    /**
     * 创建方块视图
     * @param tile 方块数据
     * @param playAppear 是否播放出现动画
     */
    createTileView(tile: TileModel, playAppear: boolean = true): TileView {
        this.ensureTileContainer();

        const tileNode = new cc.Node();
        tileNode.parent = this.tileContainer;
        
        const tileView = tileNode.addComponent(TileView) as TileView;
        tileView.init(tile, this._gridSize);
        
        this._tileViews.set(tile.id, tileView);

        if (playAppear) {
            tileView.playAppearAnimation();
        }

        return tileView;
    }

    /**
     * 获取方块视图
     * @param tileId 方块ID
     */
    getTileView(tileId: number): TileView {
        return this._tileViews.get(tileId);
    }

    /**
     * 移除方块视图
     * @param tileId 方块ID
     */
    removeTileView(tileId: number): void {
        const tileView = this._tileViews.get(tileId);
        if (tileView) {
            tileView.node.destroy();
            this._tileViews.delete(tileId);
        }
    }

    /**
     * 更新网格大小
     * @param gridSize 新的网格大小
     */
    updateGridSize(gridSize: number): void {
        if (this._gridSize !== gridSize) {
            this._gridSize = gridSize;
            this.createGridBackground();
            this.clearAllTiles();
        }
    }

    /**
     * 刷新皮肤主题
     */
    refreshSkin(): void {
        this.createGridBackground();
        
        // 刷新所有方块视图
        this._tileViews.forEach((tileView) => {
            tileView.updateAppearance();
        });
    }

    /**
     * 清除所有方块
     */
    clearAllTiles(): void {
        this._tileViews.forEach((tileView) => {
            if (cc.isValid(tileView.node)) {
                tileView.node.destroy();
            }
        });
        this._tileViews.clear();
    }

    /**
     * 开始动画计数
     * @param totalCount 总动画数量
     * @param callback 所有动画完成回调
     */
    beginAnimationCount(totalCount: number, callback: () => void): void {
        this._animationCounter = totalCount;
        this._allAnimationsDone = callback;
        this._isAnimating = true;

        if (totalCount === 0) {
            this.endAnimationCount();
        }
    }

    /**
     * 结束一个动画
     */
    endOneAnimation(): void {
        this._animationCounter--;
        if (this._animationCounter <= 0) {
            this.endAnimationCount();
        }
    }

    /**
     * 结束所有动画
     */
    private endAnimationCount(): void {
        this._isAnimating = false;
        this._animationCounter = 0;
        if (this._allAnimationsDone) {
            this._allAnimationsDone();
            this._allAnimationsDone = null;
        }
    }

    /**
     * 是否正在播放动画
     */
    get isAnimating(): boolean {
        return this._isAnimating;
    }

    /**
     * 获取方块容器节点
     */
    getTileContainer(): cc.Node {
        this.ensureTileContainer();
        return this.tileContainer;
    }

    /**
     * 获取网格大小
     */
    get gridSize(): number {
        return this._gridSize;
    }
}
