/**
 * 皮肤配置类
 * 定义不同的颜色主题和视觉风格
 */

import { GameConfig } from '../config/GameConfig';
import { Message } from '../managers/MessageManager';
import { GameEvents } from '../config/MessageEvents';

/** 方块颜色配置 */
export interface TileColors {
    /** 背景色 */
    bg: string;
    /** 文字颜色 */
    text: string;
}

/** 皮肤主题配置 */
export interface SkinTheme {
    /** 主题名称 */
    name: string;
    /** 主题ID */
    id: string;
    /** 游戏背景色 */
    bgColor: string;
    /** 网格背景色 */
    gridBgColor: string;
    /** 空格子颜色 */
    emptyCellColor: string;
    /** 默认文字颜色 */
    textDarkColor: string;
    /** 高亮文字颜色 */
    textLightColor: string;
    /** 按钮颜色 */
    buttonColor: string;
    /** 方块颜色映射 */
    tileColors: Map<number, TileColors>;
}

/**
 * 皮肤配置管理
 */
export class SkinConfig {
    // ==================== 预定义主题 ====================
    
    /** 经典主题 */
    static readonly CLASSIC: SkinTheme = {
        name: '经典',
        id: 'classic',
        bgColor: '#faf8ef',
        gridBgColor: '#bbada0',
        emptyCellColor: '#cdc1b4',
        textDarkColor: '#776e65',
        textLightColor: '#f9f6f2',
        buttonColor: '#8f7a66',
        tileColors: new Map([
            [2, { bg: '#eee4da', text: '#776e65' }],
            [4, { bg: '#ede0c8', text: '#776e65' }],
            [8, { bg: '#f2b179', text: '#f9f6f2' }],
            [16, { bg: '#f59563', text: '#f9f6f2' }],
            [32, { bg: '#f67c5f', text: '#f9f6f2' }],
            [64, { bg: '#f65e3b', text: '#f9f6f2' }],
            [128, { bg: '#edcf72', text: '#f9f6f2' }],
            [256, { bg: '#edcc61', text: '#f9f6f2' }],
            [512, { bg: '#edc850', text: '#f9f6f2' }],
            [1024, { bg: '#edc53f', text: '#f9f6f2' }],
            [2048, { bg: '#edc22e', text: '#f9f6f2' }],
            [4096, { bg: '#3c3a32', text: '#f9f6f2' }],
            [8192, { bg: '#3c3a32', text: '#f9f6f2' }],
        ])
    };

    /** 糖果主题 */
    static readonly CANDY: SkinTheme = {
        name: '糖果',
        id: 'candy',
        bgColor: '#ffeef8',
        gridBgColor: '#ffb6c1',
        emptyCellColor: '#ffc0cb',
        textDarkColor: '#8b4789',
        textLightColor: '#ffffff',
        buttonColor: '#ff69b4',
        tileColors: new Map([
            [2, { bg: '#ffb6c1', text: '#8b4789' }],
            [4, { bg: '#ff69b4', text: '#ffffff' }],
            [8, { bg: '#ff1493', text: '#ffffff' }],
            [16, { bg: '#c71585', text: '#ffffff' }],
            [32, { bg: '#db7093', text: '#ffffff' }],
            [64, { bg: '#ff00ff', text: '#ffffff' }],
            [128, { bg: '#ba55d3', text: '#ffffff' }],
            [256, { bg: '#9370db', text: '#ffffff' }],
            [512, { bg: '#8a2be2', text: '#ffffff' }],
            [1024, { bg: '#9400d3', text: '#ffffff' }],
            [2048, { bg: '#8b008b', text: '#ffffff' }],
            [4096, { bg: '#4b0082', text: '#ffffff' }],
            [8192, { bg: '#2e0854', text: '#ffffff' }],
        ])
    };

    /** 暗黑主题 */
    static readonly DARK: SkinTheme = {
        name: '暗黑',
        id: 'dark',
        bgColor: '#1a1a2e',
        gridBgColor: '#16213e',
        emptyCellColor: '#0f3460',
        textDarkColor: '#e0e0e0',
        textLightColor: '#ffffff',
        buttonColor: '#e94560',
        tileColors: new Map([
            [2, { bg: '#3a3f5c', text: '#e0e0e0' }],
            [4, { bg: '#4a4f6c', text: '#e0e0e0' }],
            [8, { bg: '#5a5f7c', text: '#ffffff' }],
            [16, { bg: '#6a6f8c', text: '#ffffff' }],
            [32, { bg: '#7a7f9c', text: '#ffffff' }],
            [64, { bg: '#8a8fac', text: '#ffffff' }],
            [128, { bg: '#9a9fbc', text: '#ffffff' }],
            [256, { bg: '#aaafcc', text: '#ffffff' }],
            [512, { bg: '#babfdc', text: '#ffffff' }],
            [1024, { bg: '#cacfec', text: '#1a1a2e' }],
            [2048, { bg: '#dadffc', text: '#1a1a2e' }],
            [4096, { bg: '#e94560', text: '#ffffff' }],
            [8192, { bg: '#ff6b6b', text: '#ffffff' }],
        ])
    };

    /** 海洋主题 */
    static readonly OCEAN: SkinTheme = {
        name: '海洋',
        id: 'ocean',
        bgColor: '#e3f2fd',
        gridBgColor: '#64b5f6',
        emptyCellColor: '#90caf9',
        textDarkColor: '#0d47a1',
        textLightColor: '#ffffff',
        buttonColor: '#1976d2',
        tileColors: new Map([
            [2, { bg: '#bbdefb', text: '#0d47a1' }],
            [4, { bg: '#90caf9', text: '#0d47a1' }],
            [8, { bg: '#64b5f6', text: '#ffffff' }],
            [16, { bg: '#42a5f5', text: '#ffffff' }],
            [32, { bg: '#2196f3', text: '#ffffff' }],
            [64, { bg: '#1e88e5', text: '#ffffff' }],
            [128, { bg: '#1976d2', text: '#ffffff' }],
            [256, { bg: '#1565c0', text: '#ffffff' }],
            [512, { bg: '#0d47a1', text: '#ffffff' }],
            [1024, { bg: '#0277bd', text: '#ffffff' }],
            [2048, { bg: '#01579b', text: '#ffffff' }],
            [4096, { bg: '#0097a7', text: '#ffffff' }],
            [8192, { bg: '#00838f', text: '#ffffff' }],
        ])
    };

    /** 所有可用主题 */
    static readonly THEMES: SkinTheme[] = [
        SkinConfig.CLASSIC,
        SkinConfig.CANDY,
        SkinConfig.DARK,
        SkinConfig.OCEAN
    ];

    /** 当前主题 */
    private static _currentTheme: SkinTheme = SkinConfig.CLASSIC;

    /**
     * 获取当前主题
     */
    static get currentTheme(): SkinTheme {
        return this._currentTheme;
    }

    /**
     * 切换主题
     * @param themeId 主题ID
     */
    static setTheme(themeId: string): void {
        const theme = this.THEMES.find(t => t.id === themeId);
        if (theme) {
            this._currentTheme = theme;
            // 派发皮肤切换事件
            Message.emit(GameEvents.SKIN_CHANGE, { skinId: themeId });
        }
    }

    /**
     * 获取方块颜色
     * @param value 方块数值
     * @returns 方块颜色配置
     */
    static getTileColor(value: number): TileColors {
        const colors = this._currentTheme.tileColors.get(value);
        if (colors) {
            return colors;
        }
        // 默认返回最高级的颜色
        return this._currentTheme.tileColors.get(8192);
    }

    /**
     * 将十六进制颜色字符串转换为 cc.Color
     * @param hex 十六进制颜色字符串
     * @returns cc.Color 对象
     */
    static hexToColor(hex: string): cc.Color {
        return new cc.Color().fromHEX(hex);
    }

    /**
     * 获取方块背景色
     * @param value 方块数值
     * @returns cc.Color 对象
     */
    static getTileBgColor(value: number): cc.Color {
        const colors = this.getTileColor(value);
        return this.hexToColor(colors.bg);
    }

    /**
     * 获取方块文字颜色
     * @param value 方块数值
     * @returns cc.Color 对象
     */
    static getTileTextColor(value: number): cc.Color {
        const colors = this.getTileColor(value);
        return this.hexToColor(colors.text);
    }

    /**
     * 获取所有主题名称列表
     * @returns 主题名称数组
     */
    static getThemeNames(): string[] {
        return this.THEMES.map(t => t.name);
    }

    /**
     * 根据索引获取主题
     * @param index 主题索引
     * @returns 主题配置
     */
    static getThemeByIndex(index: number): SkinTheme {
        return this.THEMES[index] || this.CLASSIC;
    }

    /**
     * 获取当前主题索引
     * @returns 主题索引
     */
    static getCurrentThemeIndex(): number {
        return this.THEMES.findIndex(t => t.id === this._currentTheme.id);
    }
}
