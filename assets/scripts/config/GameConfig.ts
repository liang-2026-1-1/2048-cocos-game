/**
 * 游戏配置常量
 * 定义游戏的核心参数、动画时长、颜色主题等
 */

/** 滑动方向枚举 */
export enum Direction {
    None = 0,
    Left = 1,
    Right = 2,
    Up = 3,
    Down = 4
}

/** 游戏配置 */
export class GameConfig {
    // ==================== 网格配置 ====================
    /** 默认网格大小 */
    static readonly DEFAULT_GRID_SIZE: number = 4;
    
    /** 支持的网格大小列表 */
    static readonly GRID_SIZES: number[] = [3, 4, 5, 6];
    
    /** 网格区域总尺寸（像素）- 固定值，设计宽度720，留出边距 */
    static readonly GRID_TOTAL_SIZE: number = 660;
    
    /** 方块间距（像素） */
    static readonly TILE_SPACING: number = 10;
    
    /** 网格内边距（像素） */
    static readonly GRID_PADDING: number = 10;

    /**
     * 根据网格大小计算方块尺寸
     * @param gridSize 网格大小
     * @returns 方块尺寸（像素）
     */
    static getTileSize(gridSize: number): number {
        const totalSize = this.GRID_TOTAL_SIZE - this.GRID_PADDING * 2;
        const spacing = this.TILE_SPACING * (gridSize - 1);
        return Math.floor((totalSize - spacing) / gridSize);
    }

    /**
     * 根据方块数值获取字体大小
     * @param value 方块数值
     * @param tileSize 方块尺寸
     * @returns 字体大小
     */
    static getTileFontSize(value: number, tileSize: number): number {
        // 基础字体大小为方块尺寸的 0.45 倍
        const baseFontSize = Math.floor(tileSize * 0.45);
        
        // 根据数字位数调整字体大小
        const digits = value.toString().length;
        switch (digits) {
            case 1:
            case 2:
                return baseFontSize;
            case 3:
                return Math.floor(baseFontSize * 0.85);
            case 4:
                return Math.floor(baseFontSize * 0.7);
            case 5:
                return Math.floor(baseFontSize * 0.55);
            case 6:
                return Math.floor(baseFontSize * 0.45);
            default:
                return Math.floor(baseFontSize * 0.4);
        }
    }

    // ==================== 游戏规则 ====================
    /** 新方块生成概率 - 数字2的概率 */
    static readonly TILE_2_PROBABILITY: number = 0.9;
    
    /** 初始生成的方块数量 */
    static readonly INITIAL_TILES_COUNT: number = 2;
    
    /** 胜利条件数值 */
    static readonly WIN_VALUE: number = 2048;
    
    /** 最大撤销次数 */
    static readonly MAX_UNDO_COUNT: number = 10;

    // ==================== 动画配置 ====================
    /** 移动动画时长（秒） */
    static readonly MOVE_DURATION: number = 0.12;
    
    /** 合并动画时长（秒） */
    static readonly MERGE_DURATION: number = 0.16;
    
    /** 新生成动画时长（秒） */
    static readonly APPEAR_DURATION: number = 0.15;
    
    /** 游戏结束遮罩动画时长（秒） */
    static readonly OVERLAY_DURATION: number = 0.3;
    
    /** 结果面板动画时长（秒） */
    static readonly RESULT_PANEL_DURATION: number = 0.4;

    // ==================== 输入配置 ====================
    /** 最小滑动距离（像素） */
    static readonly MIN_SWIPE_DISTANCE: number = 30;
    
    /** 最大滑动角度偏差（度） - 用于判断是否为斜向滑动 */
    static readonly MAX_SWIPE_ANGLE_DEVIATION: number = 30;

    // ==================== 存储键名 ====================
    /** 最高分存储键 */
    static readonly STORAGE_BEST_SCORE: string = '2048_best_score';
    
    /** 游戏设置存储键 */
    static readonly STORAGE_SETTINGS: string = '2048_settings';
    
    /** 游戏状态存储键 */
    static readonly STORAGE_GAME_STATE: string = '2048_game_state';

    /** 网格大小存储键 */
    static readonly STORAGE_GRID_SIZE: string = '2048_grid_size';

    // ==================== UI配置 ====================
    /** 分数面板弹出缩放 */
    static readonly SCORE_POP_SCALE: number = 1.2;
    
    /** 方块圆角半径 */
    static readonly TILE_RADIUS: number = 6;
    
    /** 方块阴影模糊度 */
    static readonly TILE_SHADOW_BLUR: number = 4;
    
    /** 方块阴影偏移 */
    static readonly TILE_SHADOW_OFFSET: cc.Vec2 = cc.v2(2, 2);

    // ==================== 颜色配置 ====================
    /** 游戏背景颜色 */
    static readonly BG_COLOR: cc.Color = new cc.Color().fromHEX('#faf8ef');
    
    /** 网格背景颜色 */
    static readonly GRID_BG_COLOR: cc.Color = new cc.Color().fromHEX('#bbada0');
    
    /** 空格子颜色 */
    static readonly EMPTY_CELL_COLOR: cc.Color = new cc.Color().fromHEX('#cdc1b4');
    
    /** 默认文字颜色（深色） */
    static readonly TEXT_DARK_COLOR: cc.Color = new cc.Color().fromHEX('#776e65');
    
    /** 高亮文字颜色（浅色） */
    static readonly TEXT_LIGHT_COLOR: cc.Color = new cc.Color().fromHEX('#f9f6f2');
    
    /** 按钮颜色 */
    static readonly BUTTON_COLOR: cc.Color = new cc.Color().fromHEX('#8f7a66');

    /**
     * 计算网格总尺寸
     * @param gridSize 网格大小
     * @returns 网格总尺寸（像素）
     */
    static getGridTotalSize(gridSize: number): number {
        return this.GRID_TOTAL_SIZE;
    }

    /**
     * 根据网格坐标计算世界坐标
     * @param row 行索引
     * @param col 列索引
     * @param gridSize 网格大小
     * @returns 世界坐标
     */
    static getTilePosition(row: number, col: number, gridSize: number): cc.Vec3 {
        const tileSize = this.getTileSize(gridSize);
        const gridTotalSize = this.getGridTotalSize(gridSize);
        const startPos = -gridTotalSize / 2 + this.GRID_PADDING + tileSize / 2;
        const step = tileSize + this.TILE_SPACING;
        
        return cc.v3(
            startPos + col * step,
            startPos + (gridSize - 1 - row) * step
        );
    }
}
