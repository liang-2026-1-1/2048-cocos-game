/**
 * 游戏主控制器
 * 协调各模块，处理游戏流程和核心算法
 * 单例模式，在 MainPanel 打开后创建
 */

import { Direction, GameConfig } from '../config/GameConfig';
import { GridModel } from '../models/GridModel';
import { TileModel } from '../models/TileModel';
import { GameData, GameState } from '../models/GameData';
import { InputManager, InputCallback } from '../managers/InputManager';
import { SkinConfig } from '../utils/SkinConfig';
import { MathUtil } from '../utils/MathUtil';
import GameView from './GameView';
import PanelManager from '../managers/PanelManager';
import { PanelType } from '../config/PanelConfig';
import MainPanel from '../panels/MainPanel';
import { GlobalConfig } from '../config/GlobalConfig';
import { Message } from '../managers/MessageManager';
import { GameEvents } from '../config/MessageEvents';

const { ccclass } = cc._decorator;

/**
 * 游戏主控制器组件（单例）
 */
@ccclass
export default class GameController {
    // ==================== 单例模式 ====================

    private static _instance: GameController = null;

    public static getInstance(): GameController {
        if (!this._instance) {
            this._instance = new GameController();
            cc.log('[GameController] 创建单例实例');
        }
        return this._instance;
    }

    public static get instance(): GameController {
        return this.getInstance();
    }

    // ==================== 视图组件 ====================

    /** 游戏视图 */
    private _gameView: GameView = null;

    // ==================== 核心模块 ====================

    /** 网格模型 */
    private _gridModel: GridModel = null;

    /** 数据模型 */
    private _gameData: GameData = null;
    /** 输入管理器 */
    private _inputManager: InputManager = null;

    /** 游戏状态 */
    private _gameState: 'playing' | 'paused' | 'gameover' | 'win' = 'playing';

    /** 是否正在处理移动 */
    private _isProcessing: boolean = false;

    /** 是否已胜利 */
    private _hasWon: boolean = false;

    /** 视图是否已初始化 */
    private _viewInitialized: boolean = false;



    /**
     * 初始化游戏
     */
    public initGame(): void {
        if (this._viewInitialized) return;

        // 初始化数据模型
        this._gameData = GameData.getInstance();
        this._gridModel = new GridModel(this._gameData.gridSize);

        // 初始化输入管理器（节点稍后在 createGameView 中设置）
        this._inputManager = new InputManager();

        // 创建 GameView
        this.createGameView();

        // 设置回调
        this.setupCallbacks();

        // 加载或开始游戏
        this.loadOrStartGame();
        this.updateUI();
    }

    /**
     * 创建游戏视图
     */
    private createGameView(): void {
        // 获取 MainPanel 的 gridBackground
        const mainPanelNode = PanelManager.get(PanelType.Main);
        if (!mainPanelNode) {
            cc.error('[GameController] MainPanel 未找到');
            return;
        }

        const mainPanel = mainPanelNode.getComponent(MainPanel) as MainPanel;
        if (!mainPanel) {
            cc.error('[GameController] MainPanel 组件未找到');
            return;
        }

        // 创建 GameView 节点
        const gameViewNode = new cc.Node('GameView');
        gameViewNode.parent = mainPanel.getGridContainer() || mainPanelNode;
        this._gameView = gameViewNode.addComponent(GameView) as GameView;

        // 获取 gridBackground
        const gridBg = mainPanel.getGridBackground();
        this._gameView.init(this._gridModel, this._gameData.gridSize, gridBg);
        this._viewInitialized = true;

        // 将 InputManager 的触摸事件注册到 gridBackground 节点
        if (this._inputManager && gridBg) {
            this._inputManager.init(gridBg);
        }

        cc.log('[GameController] GameView 创建完成');
    }

    /**
     * 设置回调
     */
    private setupCallbacks(): void {
        // 输入回调
        const inputCallback: InputCallback = {
            onSwipe: (direction: Direction) => {
                this.handleSwipe(direction);
            }
        };
        this._inputManager.setCallback(inputCallback);

        // 注册消息监听
        Message.on(GameEvents.GAME_RESTART, this.restartGame, this);
        Message.on(GameEvents.GAME_CONTINUE, this.continueGame, this);
    }

    /**
     * 清理资源
     */
    public cleanup(): void {
        // 移除消息监听
        Message.off(GameEvents.GAME_RESTART, this.restartGame, this);
        Message.off(GameEvents.GAME_CONTINUE, this.continueGame, this);
    }

    /**
     * 加载或开始新游戏
     */
    private loadOrStartGame(): void {
        const savedState = this._gameData.loadGameState(this._gameData.gridSize);

        if (savedState && savedState.gridData.length > 0) {
            this.restoreGame(savedState);
        } else {
            this.startNewGame();
        }
    }

    /**
     * 恢复游戏
     */
    private restoreGame(state: GameState): void {
        this._gameData.restoreFromState(state, this._gridModel);

        for (const tile of this._gridModel.tiles) {
            if (this._gameView) {
                this._gameView.createTileView(tile, false);
            }
        }

        this._gameState = 'playing';
        this.updateUI();
    }

    /**
     * 开始新游戏
     */
    private startNewGame(): void {
        this._gameData.reset();
        this._gridModel.clear();
        this._gridModel.size = this._gameData.gridSize;

        for (let i = 0; i < GameConfig.INITIAL_TILES_COUNT; i++) {
            this.spawnNewTile();
        }

        this._gameState = 'playing';
        this._hasWon = false;
        this.updateUI();
    }

    /**
     * 重新开始游戏
     */
    restartGame(): void {
        this._gameData.reset();
        this._gameData.clearHistory();
        this._gameData.clearSavedGameState(this._gameData.gridSize);

        if (this._gameView) {
            this._gameView.clearAllTiles();
        }

        this._gridModel.clear();

        for (let i = 0; i < GameConfig.INITIAL_TILES_COUNT; i++) {
            this.spawnNewTile();
        }

        this._gameState = 'playing';
        this._hasWon = false;
        this.updateUI();
        this.hideAllPanels();
    }

    /**
     * 处理滑动输入
     */
    private handleSwipe(direction: Direction): void {
        if (this._isProcessing || this._gameState !== 'playing') {
            return;
        }

        if (direction === Direction.None) {
            return;
        }

        this.processMove(direction);
    }

    /**
     * 处理移动逻辑
     */
    private processMove(direction: Direction): void {
        this._isProcessing = true;

        this._gameData.saveState(this._gridModel);

        const result = this.move(direction);

        if (result.moved) {
            this._gameData.addScore(result.scoreGain);
            this.updateScoreDisplay();

            this.playMoveAnimations(result, () => {
                this.spawnNewTile();
                this._gameData.saveGameState(this._gridModel);
                this.checkGameState();
                this._isProcessing = false;
            });
        } else {
            this._gameData.restoreState();
            this._isProcessing = false;
        }
    }

    /**
     * 执行移动算法
     */
    private move(direction: Direction): {
        moved: boolean;
        movedTiles: TileModel[];
        mergedTiles: TileModel[];
        scoreGain: number;
        removedTiles: TileModel[];
    } {
        const movedTiles: TileModel[] = [];
        const mergedTiles: TileModel[] = [];
        const removedTiles: TileModel[] = [];
        let scoreGain = 0;
        let hasMoved = false;

        this._gridModel.resetAllTileStates();

        const traversals = this.buildTraversals(direction);

        for (const row of traversals.rows) {
            for (const col of traversals.cols) {
                const tile = this._gridModel.getTile(row, col);
                if (!tile) continue;

                const { farthest, next } = this.findFarthestPosition(row, col, direction);
                const nextTile = next ? this._gridModel.getTile(next.row, next.col) : null;

                if (nextTile && nextTile.canMergeWith(tile)) {
                    tile.mergeTo(nextTile);

                    mergedTiles.push(nextTile);
                    removedTiles.push(tile);
                    scoreGain += nextTile.value;
                    hasMoved = true;
                } else if (farthest.row !== row || farthest.col !== col) {
                    this._gridModel.setTile(row, col, null);
                    this._gridModel.setTile(farthest.row, farthest.col, tile);
                    tile.moveTo(farthest.row, farthest.col);

                    movedTiles.push(tile);
                    hasMoved = true;
                }
            }
        }

        for (const tile of removedTiles) {
            this._gridModel.removeTile(tile);
        }

        return {
            moved: hasMoved,
            movedTiles,
            mergedTiles,
            scoreGain,
            removedTiles
        };
    }

    /**
     * 构建遍历顺序
     */
    private buildTraversals(direction: Direction): { rows: number[]; cols: number[] } {
        const size = this._gridModel.size;
        const rows: number[] = [];
        const cols: number[] = [];

        for (let i = 0; i < size; i++) {
            rows.push(i);
            cols.push(i);
        }

        // 向上移动：从下往上遍历，rows 需要反转
        if (direction === Direction.Up) rows.reverse();
        // 向左移动：从右往左遍历，cols 需要反转
        if (direction === Direction.Left) cols.reverse();

        return { rows, cols };
    }

    /**
     * 查找最远可到达位置
     */
    private findFarthestPosition(row: number, col: number, direction: Direction): {
        farthest: { row: number; col: number };
        next: { row: number; col: number } | null;
    } {
        const vector = this.getDirectionVector(direction);
        let prevRow = row;
        let prevCol = col;
        let currRow = row + vector.row;
        let currCol = col + vector.col;

        while (this._gridModel.isValidCell(currRow, currCol) && this._gridModel.isEmpty(currRow, currCol)) {
            prevRow = currRow;
            prevCol = currCol;
            currRow += vector.row;
            currCol += vector.col;
        }

        const farthest = { row: prevRow, col: prevCol };
        const next = this._gridModel.isValidCell(currRow, currCol) ? { row: currRow, col: currCol } : null;

        return { farthest, next };
    }

    /**
     * 获取方向向量
     */
    private getDirectionVector(direction: Direction): { row: number; col: number } {
        const vectors = {
            [Direction.Up]: { row: -1, col: 0 },
            [Direction.Down]: { row: 1, col: 0 },
            [Direction.Left]: { row: 0, col: -1 },
            [Direction.Right]: { row: 0, col: 1 },
            [Direction.None]: { row: 0, col: 0 }
        };
        return vectors[direction];
    }

    /**
     * 播放移动动画
     */
    private playMoveAnimations(result: {
        movedTiles: TileModel[];
        mergedTiles: TileModel[];
        removedTiles: TileModel[];
    }, callback: () => void): void {
        let animationCount = result.movedTiles.length + result.mergedTiles.length + result.removedTiles.length;

        const checkComplete = () => {
            animationCount--;
            if (animationCount <= 0) {
                callback();
            }
        };

        if (animationCount === 0) {
            callback();
            return;
        }

        for (const tile of result.movedTiles) {
            const tileView = this._gameView.getTileView(tile.id);
            if (tileView) {
                tileView.playMoveAnimation(tile.row, tile.col, GameConfig.MOVE_DURATION, checkComplete);
            } else {
                checkComplete();
            }
        }

        for (const tile of result.mergedTiles) {
            const tileView = this._gameView.getTileView(tile.id);
            if (tileView) {
                tileView.playMergeAnimation(checkComplete);
            } else {
                checkComplete();
            }
        }

        for (const tile of result.removedTiles) {
            const tileView = this._gameView.getTileView(tile.id);
            if (tileView) {
                tileView.playRemoveAnimation(() => {
                    this._gameView.removeTileView(tile.id);
                    checkComplete();
                });
            } else {
                checkComplete();
            }
        }
    }

    /**
     * 生成新方块
     */
    private spawnNewTile(): void {
        const emptyCells = this._gridModel.getEmptyCells();
        if (emptyCells.length === 0) return;

        const cell = MathUtil.randomChoice(emptyCells);
        const value = MathUtil.randomProbability(GameConfig.TILE_2_PROBABILITY) ? 2 : 4;

        const tile = new TileModel(value, cell.row, cell.col);
        this._gridModel.addTile(tile);

        if (this._gameView) {
            this._gameView.createTileView(tile, true);
        }
    }

    /**
     * 检查游戏状态
     */
    public checkGameState(): void {
        if (!this._hasWon && this._gridModel.isWin()) {
            this._hasWon = true;
            this._gameState = 'win';
            this.showWinPanel();
            return;
        }

        if (this._gridModel.isGameOver()) {
            this._gameState = 'gameover';
            this.showGameOver();
            GameData.instance.clearSavedGameState(this._gameData.gridSize);
        }
    }

    /**
     * 撤销移动
     */
    undoMove(): void {
        if (this._isProcessing || !this._gameData.canUndo()) {
            return;
        }

        const state = this._gameData.restoreState();
        if (!state) return;

        if (this._gameView) {
            this._gameView.clearAllTiles();
        }

        this._gameData.restoreFromState(state, this._gridModel);

        for (const tile of this._gridModel.tiles) {
            if (this._gameView) {
                this._gameView.createTileView(tile, false);
            }
        }

        this._gameState = 'playing';
        this.updateScoreDisplay();
        this.hideAllPanels();
        // ✅ 添加：保存撤销后的状态
        this._gameData.saveGameState(this._gridModel);
    }

    /**
     * 改变网格大小
     */
    public changeGridSize(size: number): void {
        if (this._gameData.gridSize === size) return;

        this._gameData.gridSize = size;
        this._gridModel.size = size;

        if (this._gameView) {
            const mainPanelNode = PanelManager.get(PanelType.Main);
            const gridBg = mainPanelNode?.getComponent(MainPanel)?.getGridBackground();
            this._gameView.init(this._gridModel, size, gridBg);
        }

        this.loadOrStartGame();
    }

    /**
     * 改变皮肤
     */
    public changeSkin(skinId: string): void {
        SkinConfig.setTheme(skinId);
        this._gameData.skinId = skinId;

        if (this._gameView) {
            this._gameView.refreshSkin();
        }
    }

    /**
     * 继续游戏（胜利后）
     */
    private continueGame(): void {
        this._gameState = 'playing';
        this.hideAllPanels();
    }


    /** 获取当前网格大小 */
    public get gridSize(): number {
        return this._gameData?.gridSize;
    }

    /**
     * 更新UI显示
     */
    private updateUI(): void {
        this.updateScoreDisplay();
        this.updateBestScoreDisplay();
    }

    /**
     * 更新分数显示 - 通过 MessageManager 派发事件
     */
    private updateScoreDisplay(): void {
        Message.emit(GameEvents.SCORE_UPDATE, this._gameData.score);
    }

    /**
     * 更新最高分显示 - 通过 MessageManager 派发事件
     */
    private updateBestScoreDisplay(): void {
        const bestScore = this._gameData.loadBestScoreForGrid(this._gameData.gridSize);
        Message.emit(GameEvents.BEST_SCORE_UPDATE, bestScore);
    }

    /**
     * 显示游戏结束面板
     */
    private showGameOver(): void {
        PanelManager.open(PanelType.GameOver, (panel) => {
            const gameOverPanel = panel.getComponent('GameOverPanel') as any;
            if (gameOverPanel?.showGameOver) {
                gameOverPanel.showGameOver(this._gameData.score, false, this._gameData.loadBestScoreForGrid(this._gameData.gridSize));
            }
        });
    }

    /**
     * 显示胜利面板
     */
    public showWinPanel(): void {
        PanelManager.open(PanelType.GameWin, (panel) => {
            const gameOverPanel = panel.getComponent('GameOverPanel') as any;
            if (gameOverPanel?.showGameOver) {
                gameOverPanel.showGameOver(this._gameData.score, true, this._gameData.loadBestScoreForGrid(this._gameData.gridSize));
            }
        });
    }

    /**
     * 隐藏所有面板
     */
    private hideAllPanels(): void {
        PanelManager.close(PanelType.GameOver);
        PanelManager.close(PanelType.GameWin);
    }
}
