/**
 * 主场景脚本
 * 用于场景初始化和基础设置
 */

import { ResolutionConfig } from './config/ResolutionConfig';
import PanelManager from './managers/PanelManager';
import { PanelType } from './config/PanelConfig';

const { ccclass } = cc._decorator;

/**
 * 主场景组件
 */
@ccclass
export default class MainScene extends cc.Component {
    onLoad() {
        // 设置设计分辨率 - 720×1560 固定宽度策略
        cc.view.setDesignResolutionSize(
            ResolutionConfig.DESIGN_WIDTH, 
            ResolutionConfig.DESIGN_HEIGHT, 
            ResolutionConfig.RESOLUTION_POLICY
        );
        
        // 显示FPS（调试用，可注释掉）
        // cc.debug.setDisplayStats(true);
        
        cc.log('[MainScene] 游戏场景加载完成，设计分辨率：720×1560');
    }

    start() {
        cc.log('[MainScene] 游戏开始');
        // 打开开始面板
        PanelManager.open(PanelType.Start);
    }
}
