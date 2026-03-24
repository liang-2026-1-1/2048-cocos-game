/**
 * 开始界面面板
 * 游戏启动时显示，提供开始游戏、继续游戏等选项
 * 设计分辨率：720×1560
 */

import { GameConfig } from '../config/GameConfig';
import { GlobalConfig } from '../config/GlobalConfig';
import { PanelType } from '../config/PanelConfig';
import PanelManager from '../managers/PanelManager';
import { StorageUtil } from '../utils/StorageUtil';
import { Message } from '../managers/MessageManager';
import { GameEvents } from '../config/MessageEvents';
import GameController from '../core/GameController';
import BasePanel from './BasePanel';
import { StartPanelUI, StartPanelUIComponents } from './StartPanelUI';
import { GameData } from '../models/GameData';

const { ccclass } = cc._decorator;

/**
 * 开始界面面板组件
 */
@ccclass
export default class StartPanel extends BasePanel {
    /** UI构建器 */
    private uiBuilder: StartPanelUI = null;

    /** UI组件引用 */
    private ui: StartPanelUIComponents = null;

    // ==================== 状态 ====================

    /** 是否有存档 */
    private _hasSavedGame: boolean = false;


    /**
     * 设置UI
     */
    protected setupUI(): void {
        // 使用UI构建器创建UI
        this.uiBuilder = new StartPanelUI();
        this.ui = this.uiBuilder.build(this.node);
    }

    /**
     * 面板打开时初始化
     */
    protected onPanelOpen(): void {
        super.onPanelOpen();
        // 设置网格大小选择回调 - 点击直接开始游戏
        this.uiBuilder.setOnGridSizeSelected(this.onGridSizeSelected.bind(this));

        // 根据是否有存档显示/隐藏继续按钮
        if (this.ui.continueButton) {
            this.ui.continueButton.active = this._hasSavedGame;
        }
    }

    /**
     * 面板关闭时调用
     */
    protected onPanelClose(): void {
        super.onPanelClose();
        Message.off(GameEvents.SKIN_CHANGE, this.updateTheme, this);
    }

    /**
     * 设置事件
     */
    protected setupEvents(): void {
        // 继续游戏按钮
        this.onClick(this.ui.continueButton, this.onContinueButtonClick);

        // 通过 MessageManager 监听皮肤切换
        Message.on(GameEvents.SKIN_CHANGE, this.updateTheme, this);
    }

    /**
     * 销毁时移除监听
     */
    onDestroy(): void {
        Message.off(GameEvents.SKIN_CHANGE, this.updateTheme, this);
    }

    /**
     * 继续游戏按钮点击处理
     */
    private onContinueButtonClick(): void {
        // 从本地存储读取上次选择的网格大小
        GameData.instance.gridSize = StorageUtil.getNumber(GameConfig.STORAGE_GRID_SIZE, GameConfig.DEFAULT_GRID_SIZE);

        this.close();

        PanelManager.open(PanelType.Main);
    }

    /**
     * 网格大小选择处理
     */
    private onGridSizeSelected(index: number): void {

        GameData.instance.gridSize = GameConfig.GRID_SIZES[index];

        this.close();
        PanelManager.open(PanelType.Main);
        
    }

    /**
     * 更新主题
     */
    private updateTheme(): void {
        if (this.uiBuilder) {
            this.uiBuilder.updateTheme();
        }
    }

    /**
     * 设置是否有存档
     */
    public setHasSavedGame(hasSaved: boolean): void {
        this._hasSavedGame = hasSaved;

        if (this.uiBuilder) {
            this.uiBuilder.setContinueButtonVisible(hasSaved);
        }
    }

    /**
     * 更新最高分显示
     */
    public updateBestScore(score: number): void {
        if (this.ui && this.ui.bestScoreLabel) {
            this.ui.bestScoreLabel.string = `最高分: ${score}`;
        }
    }


}
