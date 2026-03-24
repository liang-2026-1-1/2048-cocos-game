/**
 * 设置面板
 * 提供游戏设置选项：网格大小、皮肤切换等
 * 设计分辨率：720×1560
 */

import { GameConfig } from '../config/GameConfig';
import { SkinConfig } from '../utils/SkinConfig';
import GameController from '../core/GameController';
import { Message } from '../managers/MessageManager';
import { GameEvents } from '../config/MessageEvents';
import BasePanel from './BasePanel';
import { SettingsPanelUI, SettingsPanelUIComponents } from './SettingsPanelUI';
import PanelManager from '../managers/PanelManager';
import { PanelType } from '../config/PanelConfig';

const { ccclass } = cc._decorator;

/**
 * 设置面板组件
 */
@ccclass
export default class SettingsPanel extends BasePanel {
    /** UI构建器 */
    private uiBuilder: SettingsPanelUI = null;

    /** UI组件引用 */
    private ui: SettingsPanelUIComponents = null;

    // ==================== 状态 ====================

    private _currentGridSize: number = GameConfig.DEFAULT_GRID_SIZE;
    private _currentSkinIndex: number = 0;

    /**
     * 设置UI
     */
    protected setupUI(): void {
        cc.log(`[SettingsPanel] ===== 设置UI开始 =====`);

        // 使用UI构建器创建UI
        this.uiBuilder = new SettingsPanelUI();
        this.ui = this.uiBuilder.build(this.node);


    }


    /**
     * 设置事件
     */
    protected setupEvents(): void {
        this.setupButtonEvents();
        // 通过 MessageManager 监听皮肤切换
        Message.on(GameEvents.SKIN_CHANGE, this.onSkinChanged, this);
        
    }

    /**
     * 销毁时移除监听
     */
    onDestroy(): void {
        Message.off(GameEvents.SKIN_CHANGE, this.onSkinChanged, this);
    }

    /**
     * 设置按钮事件
     */
    private setupButtonEvents(): void {
        // 关闭按钮
        this.onClick(this.ui.closeButton, this.onCloseButtonClick.bind(this));
        // 网格大小按钮
        this.ui.gridSizeButtons.forEach((btn, index) => {
            if (btn) {
                btn.on(cc.Node.EventType.TOUCH_END, () => {
                    this.playButtonAnimation(btn);
                    this.onGridSizeButtonClicked(index);
                }, this);
            }
        });

        // 皮肤选择按钮
        this.ui.skinButtons.forEach((btn, index) => {
            if (btn) {
                btn.on(cc.Node.EventType.TOUCH_END, () => {
                    this.playButtonAnimation(btn);
                    this.onSkinButtonClicked(index);
                }, this);
            }
        });
    }

    private onCloseButtonClick(): void {
        this.playButtonAnimation(this.ui.closeButton);
        this.close();
        PanelManager.close(PanelType.Settings);
    }

    /**
     * 网格大小按钮点击
     */
    private onGridSizeButtonClicked(index: number): void {
        const size = GameConfig.GRID_SIZES[index];
        if (size && size !== this._currentGridSize) {
            this._currentGridSize = size;
            this.updateGridSizeSelection(size);
            GameController.getInstance().changeGridSize(size);
        }
    }

    /**
     * 皮肤按钮点击
     */
    private onSkinButtonClicked(index: number): void {
        if (index !== this._currentSkinIndex) {
            this._currentSkinIndex = index;
            this.updateSkinSelection(index);

            const theme = SkinConfig.getThemeByIndex(index);
            if (theme) {
                GameController.getInstance().changeSkin(theme.id);
            }
        }
    }

    /**
     * 皮肤切换响应
     */
    private onSkinChanged(): void {
        this.updateButtonColors();
    }

    /**
     * 更新网格大小选择状态
     */
    private updateGridSizeSelection(size: number): void {
        this._currentGridSize = size;
        if (this.uiBuilder) {
            this.uiBuilder.updateGridSizeSelection(size);
        }
    }

    /**
     * 更新皮肤选择状态
     */
    private updateSkinSelection(index: number): void {
        this._currentSkinIndex = index;
        if (this.uiBuilder) {
            this.uiBuilder.updateSkinSelection(index);
        }
    }

    /**
     * 更新按钮颜色
     */
    private updateButtonColors(): void {
        this.updateGridSizeSelection(this._currentGridSize);
        this.updateSkinSelection(this._currentSkinIndex);
    }

    /**
     * 面板打开时初始化
     */
    protected onPanelOpen(): void {
        super.onPanelOpen();
        // 从 GameController 获取当前设置状态
        this._currentGridSize = GameController.getInstance().gridSize;
        this._currentSkinIndex = SkinConfig.getCurrentThemeIndex();
        this.updateGridSizeSelection(this._currentGridSize);
        this.updateSkinSelection(this._currentSkinIndex);
    }

    /**
     * 面板关闭时调用
     */
    protected onPanelClose(): void {
        super.onPanelClose();
        Message.off(GameEvents.SKIN_CHANGE, this.onSkinChanged, this);
    }
}
