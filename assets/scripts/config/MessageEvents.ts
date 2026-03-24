/**
 * 消息事件类型定义
 * 统一管理所有消息事件名称，避免硬编码
 */

/** 游戏相关事件 */
export const GameEvents = {
    /** 游戏开始 */
    GAME_START: 'game_start',
    /** 游戏重启 */
    GAME_RESTART: 'game_restart',
    /** 游戏暂停 */
    GAME_PAUSE: 'game_pause',
    /** 游戏继续 */
    GAME_RESUME: 'game_resume',
    /** 继续游戏（观看广告后） */
    GAME_CONTINUE: 'game_continue',
    /** 游戏结束 */
    GAME_OVER: 'game_over',
    /** 游戏胜利 */
    GAME_WIN: 'game_win',

    /** 分数更新 */
    SCORE_UPDATE: 'game_score_update',
    /** 最高分更新 */
    BEST_SCORE_UPDATE: 'game_best_score_update',

    /** 网格大小改变 */
    GRID_SIZE_CHANGE: 'game_grid_size_change',
    /** 皮肤改变 */
    SKIN_CHANGE: 'game_skin_change',
    /** 方块移动 */
    TILE_MOVE: 'game_tile_move',
    /** 方块合并 */
    TILE_MERGE: 'game_tile_merge',
    /** 新方块生成 */
    TILE_SPAWN: 'game_tile_spawn',
} as const;

/** UI相关事件 */
export const UIEvents = {
    /** 显示提示 */
    SHOW_TOAST: 'ui_show_toast',
    /** 隐藏提示 */
    HIDE_TOAST: 'ui_hide_toast',
    /** 显示加载 */
    SHOW_LOADING: 'ui_show_loading',
    /** 隐藏加载 */
    HIDE_LOADING: 'ui_hide_loading',
    /** 显示对话框 */
    SHOW_DIALOG: 'ui_show_dialog',
    /** 关闭对话框 */
    CLOSE_DIALOG: 'ui_close_dialog',
} as const;

/** 音频相关事件 */
export const AudioEvents = {
    /** 播放音效 */
    PLAY_SOUND: 'audio_play_sound',
    /** 播放音乐 */
    PLAY_MUSIC: 'audio_play_music',
    /** 停止音乐 */
    STOP_MUSIC: 'audio_stop_music',
    /** 音效开关 */
    SOUND_TOGGLE: 'audio_sound_toggle',
    /** 音乐开关 */
    MUSIC_TOGGLE: 'audio_music_toggle',
} as const;

/** 设置相关事件 */
export const SettingsEvents = {
    /** 设置已更新 */
    SETTINGS_UPDATED: 'settings_updated',
    /** 打开设置面板 */
    OPEN_SETTINGS: 'settings_open',
    /** 关闭设置面板 */
    CLOSE_SETTINGS: 'settings_close',
} as const;

/** 存储相关事件 */
export const StorageEvents = {
    /** 数据保存成功 */
    SAVE_SUCCESS: 'storage_save_success',
    /** 数据保存失败 */
    SAVE_FAILED: 'storage_save_failed',
    /** 数据加载成功 */
    LOAD_SUCCESS: 'storage_load_success',
    /** 数据加载失败 */
    LOAD_FAILED: 'storage_load_failed',
} as const;

/** 所有事件类型 */
export type AllEvents = typeof GameEvents & typeof UIEvents & typeof AudioEvents & typeof SettingsEvents & typeof StorageEvents;
