/**
 * 游戏数据管理
 * 管理分数、设置和历史状态
 */

import { GridModel } from './GridModel';
import { TileModel, TileState } from './TileModel';
import { GameConfig } from '../config/GameConfig';
import { StorageUtil } from '../utils/StorageUtil';

/** 游戏状态接口 */
export interface GameState {
    /** 当前分数 */
    score: number;
    /** 网格数据 */
    gridData: { value: number; row: number; col: number }[];
    /** 网格大小 */
    gridSize: number;
}

/** 游戏设置接口 */
export interface GameSettings {
    /** 网格大小 */
    gridSize: number;
    /** 皮肤ID */
    skinId: string;
    /** 音效开关 */
    soundEnabled: boolean;
}

/**
 * 游戏数据管理类
 */
export class GameData {
    /** 当前分数 */
    private _score: number = 0;

    /** 最高分 */
    private _bestScore: number = 0;

    /** 网格大小 */
    private _gridSize: number = GameConfig.DEFAULT_GRID_SIZE;

    /** 当前皮肤ID */
    private _skinId: string = 'classic';

    /** 音效开关 */
    private _soundEnabled: boolean = true;

    /** 历史记录栈（用于撤销） */
    private _history: GameState[] = [];

    /** 是否已初始化 */
    private _initialized: boolean = false;

    /**
     * 构造函数
     */
    constructor() {
        this.loadSettings();
        this.loadBestScore();
    }

    private static _instance: GameData = null;

    public static getInstance(): GameData {
        if (!this._instance) {
            this._instance = new GameData();
            cc.log('[GameData] 创建单例实例');
        }
        return this._instance;
    }

    public static get instance(): GameData {
        return this.getInstance();
    }

    // ==================== 分数管理 ====================

    /**
     * 获取当前分数
     */
    get score(): number {
        return this._score;
    }

    /**
     * 设置当前分数
     */
    set score(s: number) {
        this._score = s;
        if (this._score > this._bestScore) {
            this._bestScore = this._score;
            this.saveBestScore();
        }
    }

    /**
     * 增加分数
     * @param gain 增加的分数
     */
    addScore(gain: number): void {
        this.score += gain;
    }

    /**
     * 获取最高分
     */
    get bestScore(): number {
        return this._bestScore;
    }

    /**
     * 重置分数
     */
    resetScore(): void {
        this._score = 0;
    }

    // ==================== 设置管理 ====================

    /**
     * 获取网格大小
     */
    get gridSize(): number {
        return this._gridSize;
    }

    /**
     * 设置网格大小
     */
    set gridSize(size: number) {
        if (GameConfig.GRID_SIZES.indexOf(size) >= 0) {
            this._gridSize = size;
            this.saveSettings();
            StorageUtil.setNumber(GameConfig.STORAGE_GRID_SIZE, size);
        }
    }

    /**
     * 获取皮肤ID
     */
    get skinId(): string {
        return this._skinId;
    }

    /**
     * 设置皮肤ID
     */
    set skinId(id: string) {
        this._skinId = id;
        this.saveSettings();
    }

    /**
     * 获取音效开关
     */
    get soundEnabled(): boolean {
        return this._soundEnabled;
    }

    /**
     * 设置音效开关
     */
    set soundEnabled(enabled: boolean) {
        this._soundEnabled = enabled;
        this.saveSettings();
    }

    // ==================== 历史记录（撤销功能）====================

    /**
     * 获取历史记录数量
     */
    get historyCount(): number {
        return this._history.length;
    }

    /**
     * 保存状态到历史
     * @param grid 网格模型
     */
    saveState(grid: GridModel): void {
        const state = this.createGameState(grid);
        this._history.push(state);

        // 限制历史记录数量
        if (this._history.length > GameConfig.MAX_UNDO_COUNT) {
            this._history.shift();
        }
    }

    /**
     * 从历史恢复状态
     * @returns 上一个游戏状态，如果没有则返回null
     */
    restoreState(): GameState | null {
        if (this._history.length === 0) {
            return null;
        }
        return this._history.pop();
    }

    /**
     * 清空历史记录
     */
    clearHistory(): void {
        this._history = [];
    }

    /**
     * 检查是否可以撤销
     */
    canUndo(): boolean {
        return this._history.length > 0;
    }

    // ==================== 存储操作 ====================

    /**
     * 创建游戏状态
     */
    private createGameState(grid: GridModel): GameState {
        const gridData = grid.tiles.map(tile => ({
            value: tile.value,
            row: tile.row,
            col: tile.col
        }));
        return {
            score: this._score,
            gridData: gridData,
            gridSize: grid.size
        };
    }

    /**
     * 从状态恢复游戏
     */
    restoreFromState(state: GameState, grid: GridModel): void {
        this._score = state.score;
        grid.clear();
        
        for (const tileData of state.gridData) {
            const tile = new TileModel(tileData.value, tileData.row, tileData.col);
            tile.state = TileState.Normal;
            grid.addTile(tile);
        }
    }

    /**
     * 保存游戏状态到本地（按网格大小区分）
     */
    saveGameState(grid: GridModel): void {
        const state = this.createGameState(grid);
        const stateKey = `${GameConfig.STORAGE_GAME_STATE}_${grid.size}`;
        StorageUtil.set(stateKey, state);
    }

    /**
     * 从本地加载游戏状态（按网格大小区分）
     * @param gridSize 网格大小
     */
    loadGameState(gridSize: number): GameState | null {
        const stateKey = `${GameConfig.STORAGE_GAME_STATE}_${gridSize}`;
        return StorageUtil.get<GameState>(stateKey);
    }

    /**
     * 清除保存的游戏状态
     * @param gridSize 网格大小（可选，不传则清除所有）
     */
    clearSavedGameState(gridSize?: number): void {
        if (gridSize !== undefined) {
            const stateKey = `${GameConfig.STORAGE_GAME_STATE}_${gridSize}`;
            StorageUtil.remove(stateKey);
        } else {
            // 清除所有网格大小的游戏状态
            GameConfig.GRID_SIZES.forEach(size => {
                const stateKey = `${GameConfig.STORAGE_GAME_STATE}_${size}`;
                StorageUtil.remove(stateKey);
            });
        }
    }

    /**
     * 保存最高分
     */
    private saveBestScore(): void {
        const bestScoreKey = `${GameConfig.STORAGE_BEST_SCORE}_${this._gridSize}`;
        StorageUtil.setNumber(bestScoreKey, this._bestScore);
    }

    /**
     * 加载最高分
     */
    private loadBestScore(): void {
        const bestScoreKey = `${GameConfig.STORAGE_BEST_SCORE}_${this._gridSize}`;
        this._bestScore = StorageUtil.getNumber(bestScoreKey, 0);
    }

    /**
     * 加载最高分（根据网格大小）
     */
    loadBestScoreForGrid(gridSize: number): number {
        const bestScoreKey = `${GameConfig.STORAGE_BEST_SCORE}_${gridSize}`;
        return StorageUtil.getNumber(bestScoreKey, 0);
    }

    /**
     * 保存设置
     */
    private saveSettings(): void {
        const settings: GameSettings = {
            gridSize: this._gridSize,
            skinId: this._skinId,
            soundEnabled: this._soundEnabled
        };
        StorageUtil.set(GameConfig.STORAGE_SETTINGS, settings);
    }

    /**
     * 加载设置
     */
    private loadSettings(): void {
        const settings = StorageUtil.get<GameSettings>(GameConfig.STORAGE_SETTINGS);
        if (settings) {
            this._gridSize = settings.gridSize || GameConfig.DEFAULT_GRID_SIZE;
            this._skinId = settings.skinId || 'classic';
            this._soundEnabled = settings.soundEnabled !== undefined ? settings.soundEnabled : true;
        }
        this._initialized = true;
    }

    /**
     * 检查是否已初始化
     */
    get initialized(): boolean {
        return this._initialized;
    }

    /**
     * 重置所有数据
     */
    reset(): void {
        this._score = 0;
        this._history = [];
        this.clearSavedGameState(this._gridSize);
    }
}
