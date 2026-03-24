/**
 * 分辨率配置常量
 * 定义设计分辨率相关的参数，可在不同项目中复用
 */

/** 分辨率配置 */
export class ResolutionConfig {
    /** 设计分辨率宽度 */
    static readonly DESIGN_WIDTH: number = 720;
    
    /** 设计分辨率高度 */
    static readonly DESIGN_HEIGHT: number = 1560;
    
    /** 设计分辨率策略 - 固定宽度，高度自适应 */
    static readonly RESOLUTION_POLICY: number = cc.ResolutionPolicy.FIXED_WIDTH;
}
