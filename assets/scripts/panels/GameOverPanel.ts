/**
 * 游戏结束面板
 * 显示游戏结束信息和重新开始选项
 * 设计分辨率：720×1560
 */

import { SkinConfig } from '../utils/SkinConfig';
import { Message } from '../managers/MessageManager';
import { GameEvents } from '../config/MessageEvents';
import BasePanel from './BasePanel';
import { GameOverPanelUI, GameOverPanelUIComponents } from './GameOverPanelUI';

const { ccclass } = cc._decorator;

/**
 * 游戏结束面板组件
 */
@ccclass
export default class GameOverPanel extends BasePanel {
    /** UI构建器 */
    private uiBuilder: GameOverPanelUI = null;

    /** UI组件引用 */
    private ui: GameOverPanelUIComponents = null;

    // ==================== 状态 ====================

    /** 是否为胜利面板 */
    private _isWin: boolean = false;

    /** 当前分数 */
    private _currentScore: number = 0;

    /** 回调函数 */
    private _onShare: () => void = null;
    /**
     * 0:继续 1：重新开始
     */
    private _clickFlag:number = 0;

    /**
     * 设置UI
     */
    protected setupUI(): void {
        // 使用UI构建器创建UI
        this.uiBuilder = new GameOverPanelUI();
        this.ui = this.uiBuilder.build(this.node);
    }

    protected onPanelOpen(){
        super.onPanelOpen();
        this._clickFlag = 0;
        this.setupButtons();
    }

    /**
     * 面板关闭时调用
     */
    protected onPanelClose(): void {
        // 子类可以重写
        super.onPanelClose();
        if(this._clickFlag == 1){
            Message.emit(GameEvents.GAME_RESTART);
        }else{
            Message.emit(GameEvents.GAME_CONTINUE);
        }
    }

    /**
     * 设置按钮事件
     */
    private setupButtons(): void {
        // 重启按钮
        this.onClick(this.ui.restartButton, () => {
            this._clickFlag = 1;
            this.close();
        });

        // 继续按钮
        this.onClick(this.ui.continueButton, () => {
            this._clickFlag = 0;
            this.close();
        });

        // 分享按钮
        this.onClick(this.ui.shareButton, () => {
            this._onShare?.();
        });
    }

    /**
     * 设置事件
     */
    protected setupEvents(): void {
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
     * 更新主题
     */
    private updateTheme(): void {
        if (this.uiBuilder) {
            this.uiBuilder.updateTheme();
        }
    }

    /**
     * 显示面板
     */
    public showGameOver(score: number, isWin: boolean = false, bestScore?: number): void {
        this._isWin = isWin;
        this._currentScore = score;

        // 更新显示模式
        if (this.uiBuilder) {
            this.uiBuilder.setMode(isWin);
        }

        // 更新分数
        if (this.ui && this.ui.scoreLabel) {
            this.ui.scoreLabel.string = score.toString();
        }

        // 更新最高分
        if (this.ui && this.ui.bestScoreLabel && bestScore !== undefined) {
            this.ui.bestScoreLabel.string = `最高分: ${bestScore}`;
        }

        // 显示面板
        this.show();
    }

    /**
     * 设置分享回调
     */
    public setShareCallback(callback: () => void): void {
        this._onShare = callback;
    }
}
