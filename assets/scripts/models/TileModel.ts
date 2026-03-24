/**
 * 方块数据模型
 * 定义单个方块的数据结构
 */

/** 方块状态枚举 */
export enum TileState {
    /** 正常状态 */
    Normal = 0,
    /** 移动中 */
    Moving = 1,
    /** 合并中 */
    Merging = 2,
    /** 新生成 */
    Appearing = 3,
    /** 待移除 */
    ToRemove = 4
}

/** 方块数据接口 */
export interface TileData {
    /** 唯一标识 */
    id: number;
    /** 数值（2, 4, 8, 16...） */
    value: number;
    /** 行索引 */
    row: number;
    /** 列索引 */
    col: number;
    /** 当前状态 */
    state: TileState;
    /** 本轮是否已合并 */
    merged: boolean;
    /** 移动前位置 */
    prevRow: number;
    prevCol: number;
}

/**
 * 方块模型类
 */
export class TileModel {
    private static _idCounter: number = 0;

    /** 方块数据 */
    private _data: TileData;

    /**
     * 构造函数
     * @param value 初始数值
     * @param row 行索引
     * @param col 列索引
     */
    constructor(value: number, row: number, col: number) {
        this._data = {
            id: ++TileModel._idCounter,
            value: value,
            row: row,
            col: col,
            state: TileState.Appearing,
            merged: false,
            prevRow: row,
            prevCol: col
        };
    }

    /**
     * 重置ID计数器
     */
    static resetIdCounter(): void {
        TileModel._idCounter = 0;
    }

    /**
     * 获取方块ID
     */
    get id(): number {
        return this._data.id;
    }

    /**
     * 获取数值
     */
    get value(): number {
        return this._data.value;
    }

    /**
     * 设置数值
     */
    set value(v: number) {
        this._data.value = v;
    }

    /**
     * 获取行索引
     */
    get row(): number {
        return this._data.row;
    }

    /**
     * 设置行索引
     */
    set row(r: number) {
        this._data.prevRow = this._data.row;
        this._data.row = r;
    }

    /**
     * 获取列索引
     */
    get col(): number {
        return this._data.col;
    }

    /**
     * 设置列索引
     */
    set col(c: number) {
        this._data.prevCol = this._data.col;
        this._data.col = c;
    }

    /**
     * 获取位置
     */
    get position(): { row: number; col: number } {
        return { row: this._data.row, col: this._data.col };
    }

    /**
     * 设置位置
     */
    set position(pos: { row: number; col: number }) {
        this.row = pos.row;
        this.col = pos.col;
    }

    /**
     * 获取之前位置
     */
    get prevPosition(): { row: number; col: number } {
        return { row: this._data.prevRow, col: this._data.prevCol };
    }

    /**
     * 获取状态
     */
    get state(): TileState {
        return this._data.state;
    }

    /**
     * 设置状态
     */
    set state(s: TileState) {
        this._data.state = s;
    }

    /**
     * 获取是否已合并
     */
    get merged(): boolean {
        return this._data.merged;
    }

    /**
     * 设置是否已合并
     */
    set merged(m: boolean) {
        this._data.merged = m;
    }

    /**
     * 获取原始数据（用于序列化）
     */
    get data(): TileData {
        return { ...this._data };
    }

    /**
     * 从数据恢复状态
     */
    set data(d: TileData) {
        this._data = { ...d };
    }

    /**
     * 合并到目标方块
     * @param target 目标方块
     */
    mergeTo(target: TileModel): void {
        target.value = this.value * 2;
        target.merged = true;
        target.state = TileState.Merging;
        this.state = TileState.ToRemove;
    }

    /**
     * 移动到新位置
     * @param row 新行索引
     * @param col 新列索引
     */
    moveTo(row: number, col: number): void {
        if (this._data.row !== row || this._data.col !== col) {
            this.row = row;
            this.col = col;
            this.state = TileState.Moving;
        }
    }

    /**
     * 重置状态
     */
    resetState(): void {
        this._data.merged = false;
        this._data.state = TileState.Normal;
        this._data.prevRow = this._data.row;
        this._data.prevCol = this._data.col;
    }

    /**
     * 克隆方块
     */
    clone(): TileModel {
        const tile = new TileModel(this.value, this.row, this.col);
        tile._data = { ...this._data };
        return tile;
    }

    /**
     * 判断两个方块是否相邻
     * @param other 另一个方块
     */
    isAdjacent(other: TileModel): boolean {
        const rowDiff = Math.abs(this.row - other.row);
        const colDiff = Math.abs(this.col - other.col);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    /**
     * 判断是否可以与另一个方块合并
     * @param other 另一个方块
     */
    canMergeWith(other: TileModel): boolean {
        if (!other) return false;
        if (this.merged || other.merged) return false;
        return this.value === other.value;
    }

    /**
     * 转换为字符串
     */
    toString(): string {
        return `Tile(${this.value}@[${this.row},${this.col}])`;
    }
}
