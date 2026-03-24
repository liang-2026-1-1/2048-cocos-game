/**
 * 面板配置
 * 定义所有面板的类型、名称等配置信息
 * 不再使用 prefab，改为直接实例化面板类
 */

import StartPanel from '../panels/StartPanel';
import MainPanel from '../panels/MainPanel';
import GameOverPanel from '../panels/GameOverPanel';
import SettingsPanel from '../panels/SettingsPanel';

/** 面板类型枚举 */
export enum PanelType {
    /** 开始界面面板 - 1001 */
    Start = 1001,
    /** 主界面面板 - 1002 */
    Main = 1002,
    /** 游戏结束面板 - 1003 */
    GameOver = 1003,
    /** 游戏胜利面板 - 1004 */
    GameWin = 1004,
    /** 设置面板 - 1005 */
    Settings = 1005
}

/** 面板配置接口 */
export interface PanelConfigItem {
    /** 面板类型 */
    type: PanelType;
    /** 面板名称 */
    panelName: string;
    /** 面板类构造函数 */
    panelClass: typeof cc.Component;
    /** 是否缓存 */
    cache: boolean;
    /** 是否单例（同时只能有一个实例） */
    singleton: boolean;
    /** 是否全屏界面（全屏不播放缩放动画，不显示遮罩） */
    fullscreen: boolean;
}

/** 面板配置表 */
export const PANEL_CONFIGS: Map<PanelType, PanelConfigItem> = new Map([
    [PanelType.Start, {
        type: PanelType.Start,
        panelName: 'StartPanel',
        panelClass: StartPanel as typeof cc.Component,
        cache: true,
        singleton: true,
        fullscreen: true
    }],
    [PanelType.Main, {
        type: PanelType.Main,
        panelName: 'MainPanel',
        panelClass: MainPanel as typeof cc.Component,
        cache: true,
        singleton: true,
        fullscreen: true
    }],
    [PanelType.GameOver, {
        type: PanelType.GameOver,
        panelName: 'GameOverPanel',
        panelClass: GameOverPanel as typeof cc.Component,
        cache: true,
        singleton: true,
        fullscreen: false
    }],
    [PanelType.GameWin, {
        type: PanelType.GameWin,
        panelName: 'GameWinPanel',
        panelClass: GameOverPanel as typeof cc.Component, // 使用 GameOverPanel 复用
        cache: true,
        singleton: true,
        fullscreen: false
    }],
    [PanelType.Settings, {
        type: PanelType.Settings,
        panelName: 'SettingsPanel',
        panelClass: SettingsPanel as typeof cc.Component,
        cache: true,
        singleton: true,
        fullscreen: false
    }]
]);
