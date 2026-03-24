/**
 * 主界面面板
 * 包含游戏网格、分数显示、控制按钮等核心游戏UI
 * 设计分辨率：720×1560
 */

import { GameConfig } from '../config/GameConfig';
import { PanelType } from '../config/PanelConfig';
import GameController from '../core/GameController';
import PanelManager from '../managers/PanelManager';
import { Message } from '../managers/MessageManager';
import { GameEvents } from '../config/MessageEvents';
import BasePanel from './BasePanel';
import { MainPanelUI, MainPanelUIComponents } from './MainPanelUI';
import { GameData } from '../models/GameData';

const { ccclass } = cc._decorator;

/**
 * 主界面面板组件
 */
@ccclass
export default class MainPanel extends BasePanel {
    /** UI构建器 */
    private uiBuilder: MainPanelUI = null;

    /** UI组件引用 */
    private ui: MainPanelUIComponents = null;

    // ==================== 布局配置 ====================

    // ==================== 回调函数 ====================
    // 已废弃：直接在按钮点击方法中调用 GameController 方法

    /**
     * 设置UI
     */
    protected setupUI(): void {
        // 使用UI构建器创建UI
        this.uiBuilder = new MainPanelUI();
        this.ui = this.uiBuilder.build(this.node);
    }

    protected onPanelOpen(){
        super.onPanelOpen();
        this.setupButtons();
        GameController.getInstance().initGame();
        this.onBestScoreUpdated(GameData.instance.loadBestScoreForGrid(GameData.instance.gridSize));
    }

    /**
     * 面板关闭时调用
     */
    protected onPanelClose(): void {
        super.onPanelClose();
        // 移除 MessageManager 监听
        Message.off(GameEvents.SKIN_CHANGE, this.onSkinChanged, this);
        Message.off(GameEvents.SCORE_UPDATE, this.onScoreUpdated, this);
        Message.off(GameEvents.BEST_SCORE_UPDATE, this.onBestScoreUpdated, this);
    }

    /**
     * 设置按钮
     */
    private setupButtons(): void {
        this.onClick(this.ui.newGameButton, this.onNewGameButtonClick.bind(this));
        this.onClick(this.ui.undoButton, this.onUndoButtonClick.bind(this));
        this.onClick(this.ui.settingsButton, this.onSettingsButtonClick.bind(this));
    }

    /**
     * 新游戏按钮点击处理
     */
    private onNewGameButtonClick(): void {
        GameController.getInstance().restartGame();
    }

    /**
     * 撤销按钮点击处理
     */
    private onUndoButtonClick(): void {
        GameController.getInstance().undoMove();
    }

    /**
     * 设置按钮点击处理
     */
    private onSettingsButtonClick(): void {
        PanelManager.open(PanelType.Settings);
    }

    /**
     * 设置事件
     */
    protected setupEvents(): void {
        // 通过 MessageManager 监听皮肤切换事件
        Message.on(GameEvents.SKIN_CHANGE, this.onSkinChanged, this);
        // 通过 MessageManager 监听分数更新事件
        Message.on(GameEvents.SCORE_UPDATE, this.onScoreUpdated, this);
        // 通过 MessageManager 监听最高分更新事件
        Message.on(GameEvents.BEST_SCORE_UPDATE, this.onBestScoreUpdated, this);
    }

    /**
     * 销毁时移除监听
     */
    onDestroy(): void {
        // 移除 MessageManager 监听
        Message.off(GameEvents.SKIN_CHANGE, this.onSkinChanged, this);
        Message.off(GameEvents.SCORE_UPDATE, this.onScoreUpdated, this);
        Message.off(GameEvents.BEST_SCORE_UPDATE, this.onBestScoreUpdated, this);
    }

    /**
     * 皮肤切换响应
     */
    private onSkinChanged(): void {
        this.updateTheme();
    }

    /**
     * 分数更新响应
     */
    private onScoreUpdated(score: number): void {
        this.updateScore(score);
    }

    /**
     * 最高分更新响应
     */
    private onBestScoreUpdated(bestScore: number): void {
        this.updateBestScore(bestScore);
    }

    /**
     * 更新主题
     */
    private updateTheme(): void {
        if (this.uiBuilder) {
            this.uiBuilder.updateTheme();
        }
    }

    // ==================== 公共方法 ====================

    /**
     * 更新分数显示
     */
    public updateScore(score: number, animated: boolean = true): void {
        if (!this.ui || !this.ui.scoreLabel) return;

        if (animated) {
            this.animateScore(score);
        } else {
            this.ui.scoreLabel.string = score.toString();
        }
    }

    /**
     * 更新最高分显示
     */
    public updateBestScore(score: number): void {
        if (this.ui && this.ui.bestScoreLabel) {
            this.ui.bestScoreLabel.string = score.toString();
        }
    }

    /**
     * 分数动画
     */
    private animateScore(score: number): void {
        const oldScore = parseInt(this.ui.scoreLabel.string) || 0;
        const diff = score - oldScore;
        const duration = 0.3;
        const startTime = Date.now();

        const update = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            const progress = Math.min(elapsed / duration, 1);
            const currentScore = Math.floor(oldScore + diff * progress);
            this.ui.scoreLabel.string = currentScore.toString();

            if (progress < 1) {
                setTimeout(update, 16);
            }
        };
        update();

        // 弹跳效果
        if (this.ui.scoreLabel.node) {
            cc.tween(this.ui.scoreLabel.node)
                .to(0.1, { scale: GameConfig.SCORE_POP_SCALE })
                .to(0.1, { scale: 1.0 })
                .start();
        }
    }

    /**
     * 获取网格容器
     */
    public getGridContainer(): cc.Node | null {
        return this.ui?.gridContainer || null;
    }

    /**
     * 获取网格背景
     */
    public getGridBackground(): cc.Node | null {
        return this.ui?.gridBackground || null;
    }
}
