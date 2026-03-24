/**
 * 网格数据模型
 * 管理 N x N 网格的状态和方块数据
 */

import { TileModel, TileState } from './TileModel';
import { GameConfig } from '../config/GameConfig';

/** 单元格坐标 */
export interface Cell {
    row: number;
    col: number;
}

/** 移动结果 */
export interface MoveResult {
    /** 是否有移动 */
    moved: boolean;
    /** 移动的方块列表 */
    movedTiles: TileModel[];
    /** 合并的方块列表 */
    mergedTiles: TileModel[];
    /** 新增的分数 */
    scoreGain: number;
    /** 移除的方块列表 */
    removedTiles: TileModel[];
}

/**
 * 网格模型类
 */
export class GridModel {
    /** 网格大小 */
    private _size: number;

    /** 网格数据（二维数组） */
    private _grid: (TileModel | null)[][];

    /** 所有方块列表 */
    private _tiles: TileModel[];

    /**
     * 构造函数
     * @param size 网格大小
     */
    constructor(size: number = GameConfig.DEFAULT_GRID_SIZE) {
        this._size = size;
        this._grid = [];
        this._tiles = [];
        this.initGrid();
    }

    /**
     * 初始化网格
     */
    private initGrid(): void {
        this._grid = [];
        for (let row = 0; row < this._size; row++) {
            this._grid[row] = [];
            for (let col = 0; col < this._size; col++) {
                this._grid[row][col] = null;
            }
        }
        this._tiles = [];
        TileModel.resetIdCounter();
    }

    /**
     * 获取网格大小
     */
    get size(): number {
        return this._size;
    }

    /**
     * 设置网格大小（重置网格）
     */
    set size(s: number) {
        if (this._size !== s) {
            this._size = s;
            this.initGrid();
        }
    }

    /**
     * 获取所有方块
     */
    get tiles(): TileModel[] {
        return this._tiles;
    }

    /**
     * 获取方块数量
     */
    get tileCount(): number {
        return this._tiles.length;
    }

    /**
     * 获取指定位置的方块
     * @param row 行索引
     * @param col 列索引
     */
    getTile(row: number, col: number): TileModel | null {
        if (!this.isValidCell(row, col)) {
            return null;
        }
        return this._grid[row][col];
    }

    /**
     * 设置指定位置的方块
     * @param row 行索引
     * @param col 列索引
     * @param tile 方块
     */
    setTile(row: number, col: number, tile: TileModel | null): void {
        if (!this.isValidCell(row, col)) {
            return;
        }
        
        // 清除旧位置
        if (tile) {
            const oldTile = this._grid[tile.row][tile.col];
            if (oldTile === tile && (tile.row !== row || tile.col !== col)) {
                this._grid[tile.row][tile.col] = null;
            }
        }
        
        this._grid[row][col] = tile;
    }

    /**
     * 添加方块到网格
     * @param tile 方块
     */
    addTile(tile: TileModel): void {
        if (!this.isValidCell(tile.row, tile.col)) {
            cc.warn('[GridModel] 无效的方块位置', tile);
            return;
        }
        
        this._grid[tile.row][tile.col] = tile;
        this._tiles.push(tile);
    }

    /**
     * 移除方块
     * @param tile 方块
     */
    removeTile(tile: TileModel): void {
        if (this._grid[tile.row][tile.col] === tile) {
            this._grid[tile.row][tile.col] = null;
        }
        const index = this._tiles.indexOf(tile);
        if (index >= 0) {
            this._tiles.splice(index, 1);
        }
    }

    /**
     * 获取空白格子列表
     */
    getEmptyCells(): Cell[] {
        const cells: Cell[] = [];
        for (let row = 0; row < this._size; row++) {
            for (let col = 0; col < this._size; col++) {
                if (this._grid[row][col] === null) {
                    cells.push({ row, col });
                }
            }
        }
        return cells;
    }

    /**
     * 获取空白格子数量
     */
    getEmptyCellCount(): number {
        return this._size * this._size - this._tiles.length;
    }

    /**
     * 检查位置是否有效
     * @param row 行索引
     * @param col 列索引
     */
    isValidCell(row: number, col: number): boolean {
        return row >= 0 && row < this._size && col >= 0 && col < this._size;
    }

    /**
     * 检查位置是否为空
     * @param row 行索引
     * @param col 列索引
     */
    isEmpty(row: number, col: number): boolean {
        return this.isValidCell(row, col) && this._grid[row][col] === null;
    }

    /**
     * 清空网格
     */
    clear(): void {
        this.initGrid();
    }

    /**
     * 重置所有方块状态
     */
    resetAllTileStates(): void {
        for (const tile of this._tiles) {
            tile.resetState();
        }
    }

    /**
     * 检查游戏是否结束
     */
    isGameOver(): boolean {
        // 如果还有空位，游戏未结束
        if (this.getEmptyCellCount() > 0) {
            return false;
        }

        // 检查是否有可合并的相邻方块
        for (let row = 0; row < this._size; row++) {
            for (let col = 0; col < this._size; col++) {
                const tile = this._grid[row][col];
                if (!tile) continue;

                // 检查右侧
                if (col < this._size - 1) {
                    const rightTile = this._grid[row][col + 1];
                    if (rightTile && tile.value === rightTile.value) {
                        return false;
                    }
                }

                // 检查下方
                if (row < this._size - 1) {
                    const bottomTile = this._grid[row + 1][col];
                    if (bottomTile && tile.value === bottomTile.value) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    /**
     * 检查是否获胜
     */
    isWin(): boolean {
        for (const tile of this._tiles) {
            if (tile.value >= GameConfig.WIN_VALUE) {
                return true;
            }
        }
        return false;
    }

    /**
     * 获取最大数值
     */
    getMaxValue(): number {
        let max = 0;
        for (const tile of this._tiles) {
            if (tile.value > max) {
                max = tile.value;
            }
        }
        return max;
    }

    /**
     * 获取网格快照
     */
    getSnapshot(): { grid: (TileModel | null)[][]; tiles: TileModel[] } {
        const grid: (TileModel | null)[][] = [];
        for (let row = 0; row < this._size; row++) {
            grid[row] = [];
            for (let col = 0; col < this._size; col++) {
                grid[row][col] = this._grid[row][col] ? (this._grid[row][col] as TileModel).clone() : null;
            }
        }
        const tiles = this._tiles.map(tile => tile.clone());
        return { grid, tiles };
    }

    /**
     * 从快照恢复
     */
    restoreFromSnapshot(snapshot: { grid: (TileModel | null)[][]; tiles: TileModel[] }): void {
        this._grid = snapshot.grid;
        this._tiles = snapshot.tiles;
    }

    /**
     * 转换为字符串
     */
    toString(): string {
        let str = '';
        for (let row = 0; row < this._size; row++) {
            for (let col = 0; col < this._size; col++) {
                const tile = this._grid[row][col];
                str += tile ? tile.value.toString().padStart(5) : '    .';
            }
            str += '\n';
        }
        return str;
    }
}
