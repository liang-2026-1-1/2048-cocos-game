# 2048 游戏设计文档

## 架构设计

### 整体架构

本项目采用 **MVC（Model-View-Controller）架构**，实现数据层与视图层的分离，模块职责清晰，易于维护和扩展。

```
┌────────────────────────────────────────────────────────────┐
│                        View 层                              │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   │
│  │   GameView   │   │   TileView   │   │   UIManager  │   │
│  │  游戏主视图   │   │  方块视图     │   │   UI管理器   │   │
│  └──────────────┘   └──────────────┘   └──────────────┘   │
└───────────────────────────┬────────────────────────────────┘
                            │
┌───────────────────────────┼────────────────────────────────┐
│                    Controller 层                            │
│  ┌────────────────────────┴───────────────────────────┐    │
│  │                GameController                        │    │
│  │            游戏主控制器（协调各模块）                  │    │
│  └───────────────────────────┬────────────────────────┘    │
│                              │                              │
│  ┌───────────────────────────┼────────────────────────┐    │
│  │                                                           │
│  │  ┌──────────────────┐      ┌──────────────────────┐│    │
│  │  │  InputManager    │      │  AnimationManager    ││    │
│  │  │   输入管理器      │      │     动画管理器        ││    │
│  │  └──────────────────┘      └──────────────────────┘│    │
│  └─────────────────────────────────────────────────────┘    │
└───────────────────────────┬────────────────────────────────┘
                            │
┌───────────────────────────┼────────────────────────────────┐
│                        Model 层                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    GridModel                         │   │
│  │              网格数据模型（4×4数组）                    │   │
│  └───────────────────────────┬─────────────────────────┘   │
│                              │                              │
│  ┌───────────────────────────┼─────────────────────────┐   │
│  │                     TileModel                        │   │
│  │                方块数据模型                           │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                     GameData                         │   │
│  │           游戏数据（分数、设置、历史状态）              │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

### 模块职责

| 层级 | 模块 | 职责 |
|------|------|------|
| **Model** | TileModel | 单个方块数据，包含数值、位置、状态 |
| **Model** | GridModel | 网格数据管理，方块增删查改，结束判定 |
| **Model** | GameData | 游戏整体数据，分数、设置、历史记录 |
| **View** | TileView | 单个方块的视图渲染和动画 |
| **View** | GameView | 网格背景、方块视图管理 |
| **View** | Panels | UI面板（StartPanel、MainPanel、SettingsPanel、GameOverPanel） |
| **Controller** | GameController | 主控制器，协调各模块，处理游戏流程 |
| **Controller** | InputManager | 触摸事件监听，滑动方向检测 |
| **Controller** | AnimationManager | 统一管理所有动画效果 |
| **Controller** | PanelManager | UI面板的打开、关闭、缓存管理 |
| **Controller** | MessageManager | 模块间消息通信管理 |
| **Utils** | StorageUtil | 本地存储封装 |
| **Utils** | MathUtil | 数学工具函数 |
| **Utils** | UIUtils | UI相关工具函数 |
| **Config** | GameConfig | 游戏配置常量 |
| **Config** | SkinConfig | 皮肤主题配置 |
| **Config** | PanelConfig | 面板配置常量 |
| **Config** | MessageEvents | 消息事件定义 |

## 核心算法

### 1. 移动合并算法

```
输入：n×n 网格状态、滑动方向

算法步骤：
1. 重置所有方块状态（清除 merged 标记）
2. 根据方向构建遍历顺序：先处理靠近目标方向的方块
   - 向下/向右时反转对应轴的遍历顺序，其余保持正序
3. 按遍历顺序逐格处理每个非空方块：
   a. 沿方向向量查找最远可达空位 farthest 及其前方相邻格 next
   b. 优先判断合并：若 next 方块存在、数值相同且本轮未合并
      - 从原位移除方块，记录移动目标为 next 位置
      - 执行合并：目标方块数值翻倍、标记 merged，源方块标记待移除
      - 累加得分
   c. 否则判断移动：若 farthest 不等于当前位置
      - 将方块从原位移到 farthest
4. 批量从网格中移除所有待移除方块
5. 返回移动结果（是否移动、纯移动方块列表、合并方块列表、待移除方块列表、新增分数）

时间复杂度：O(n²)
空间复杂度：O(n)
```

### 2. 游戏结束判定算法

```
算法步骤：
1. 检查是否存在空格
   - 如果有空格，游戏未结束

2. 遍历每个方块：
   - 检查右侧方块是否相同
   - 检查下方方块是否相同
   - 如果存在相同，游戏未结束

3. 如果以上都不满足，游戏结束

时间复杂度：O(n²)
```

### 3. 方块生成算法

```
算法步骤：
1. 获取所有空白格子列表
2. 随机选择一个空白格子
3. 生成数值：
   - 90% 概率生成 2
   - 10% 概率生成 4
4. 在选中位置创建新方块
```

### 4. 滑动方向检测算法

```
算法步骤：
1. 记录触摸起始位置和结束位置
2. 计算位移向量 (dx, dy)
3. 计算滑动距离：distance = √(dx² + dy²)
4. 如果距离 < 最小阈值，判定为点击
5. 计算角度：angle = atan2(dy, dx)
6. 根据角度判断方向：
   - 接近 0° → 向右
   - 接近 90° → 向上
   - 接近 180° → 向左
   - 接近 -90° → 向下
7. 如果角度偏差过大，判定为斜向滑动，忽略
```

## 数据流

```
用户滑动
    │
    ▼
InputManager 检测方向
    │
    ▼
GameController 接收方向
    │
    ├─→ GameData 保存状态（用于撤销）
    │
    ├─→ GridModel 执行移动算法
    │       │
    │       ├─→ 更新方块位置
    │       ├─→ 执行合并
    │       └─→ 返回结果
    │
    ├─→ GameData 更新分数
    │
    ├─→ GameView 播放动画
    │       │
    │       ├─→ 移动动画
    │       ├─→ 合并动画
    │       └─→ 移除动画
    │
    ├─→ 生成新方块
    │
    ├─→ 检查游戏状态
    │
    └─→ GameData 保存游戏状态
```

## 状态管理

### 方块状态

```typescript
enum TileState {
    Normal,    // 正常状态
    Moving,    // 移动中
    Merging,   // 合并中
    Appearing, // 新生成
    ToRemove   // 待移除
}
```

### 游戏状态

```typescript
type GameState = 'playing' | 'paused' | 'gameover' | 'win'
```

### 历史状态（撤销功能）

每次移动前保存当前状态快照：

```typescript
interface GameState {
    score: number;           // 当前分数
    gridData: Array<{        // 网格数据
        value: number;
        row: number;
        col: number;
    }>;
    gridSize: number;        // 网格大小
}
```

## 动画系统

### 动画类型

| 动画 | 时长 | 缓动函数 | 说明 |
|------|------|----------|------|
| 移动 | 120ms | sineOut | 从起点缓动到终点 |
| 合并 | 160ms | sineOut/sineIn | 放大到1.2再缩回1.0 |
| 生成 | 150ms | backOut | 从0缩放到1 |
| 遮罩 | 300ms | - | 透明度从0到180 |
| 面板 | 400ms | backOut | 从0缩放到1 |

### 动画同步机制

使用计数器实现多个动画同步完成：

```typescript
let animationCount = totalAnimations;

const onAnimationComplete = () => {
    animationCount--;
    if (animationCount <= 0) {
        // 所有动画完成
        callback();
    }
};
```

## 皮肤系统

### 主题配置

```typescript
interface SkinTheme {
    name: string;              // 主题名称
    id: string;                // 主题ID
    bgColor: string;           // 背景色
    gridBgColor: string;       // 网格背景色
    emptyCellColor: string;    // 空格子颜色
    textDarkColor: string;     // 深色文字
    textLightColor: string;    // 浅色文字
    buttonColor: string;       // 按钮颜色
    tileColors: Map<number, TileColors>; // 方块颜色映射
}
```

### 预定义主题

- **经典**：原版2048配色
- **糖果**：粉色系配色
- **暗黑**：深色系配色
- **海洋**：蓝色系配色

## 本地存储

### 存储内容

| 键名 | 类型 | 说明 |
|------|------|------|
| `2048_best_score_{size}` | number | 各网格大小最高分 |
| `2048_settings` | object | 游戏设置 |
| `2048_game_state` | object | 保存的游戏状态 |

### 存储时机

- **最高分**：每次分数更新时检查并保存
- **设置**：设置变更时立即保存
- **游戏状态**：每次有效移动后保存

## 性能优化

### 1. 对象池（可选扩展）

对于频繁创建销毁的 Tile 节点，可以使用对象池：

```typescript
class TilePool {
    private pool: cc.Node[] = [];
    
    get(): cc.Node {
        return this.pool.pop() || this.createTile();
    }
    
    put(node: cc.Node): void {
        this.pool.push(node);
    }
}
```

### 2. 动画优化

- 使用 `cc.tween` 而非 `update` 更新
- 避免在动画中频繁调用 `getComponent`
- 缓存节点引用

### 3. 渲染优化

- 使用 `cc.Sprite` 的 `sizeMode` 避免动态计算
- 减少节点层级嵌套

## 扩展性设计

### 添加新主题

1. 在 `SkinConfig.ts` 中定义新主题
2. 添加到 `THEMES` 数组
3. UI 中会自动显示新主题选项

### 添加新网格大小

1. 在 `GameConfig.GRID_SIZES` 中添加新尺寸
2. UI 中会自动显示新选项

### 添加新动画

1. 在 `AnimationManager` 或 `TileView` 中添加新方法
2. 在控制器中调用

## 面板系统

### 面板架构

采用 **面板管理器 + 面板基类** 的设计模式：

```
PanelManager (单例)
    │
    ├── 面板缓存 (Map<PanelType, cc.Node>)
    │
    └── 面板生命周期管理
        ├── open()  - 打开面板
        ├── close() - 关闭面板
        └── clear() - 清理缓存
```

### 面板类型

| 面板 | 说明 | UI类 |
|------|------|------|
| StartPanel | 开始界面，显示游戏标题和开始按钮 | StartPanelUI.ts |
| MainPanel | 主界面，包含分数、按钮、游戏区域 | MainPanelUI.ts |
| SettingsPanel | 设置面板，网格大小和皮肤切换 | SettingsPanelUI.ts |
| GameOverPanel | 游戏结束面板，显示分数和重新开始 | GameOverPanelUI.ts |

### BasePanel 基类

所有面板继承自 `BasePanel`，提供统一的生命周期方法：

```typescript
class BasePanel extends cc.Component {
    // 初始化（子类重写）
    protected onInit(): void {}

    // 打开动画（子类重写）
    protected onOpen(callback?: Function): void {
        // 默认缩放动画
        this.node.scale = 0;
        cc.tween(this.node)
            .to(0.4, { scale: 1 }, { easing: 'backOut' })
            .call(() => callback?.())
            .start();
    }

    // 关闭动画（子类重写）
    protected onClose(callback?: Function): void {
        cc.tween(this.node)
            .to(0.3, { scale: 0 }, { easing: 'backIn' })
            .call(() => callback?.())
            .start();
    }
}
```

## 消息系统

### 消息管理器

使用观察者模式实现模块间解耦通信：

```typescript
// 订阅消息
MessageManager.on(MessageEvents.SCORE_UPDATE, this.updateScore, this);

// 发送消息
MessageManager.emit(MessageEvents.SCORE_UPDATE, { score: 100 });

// 取消订阅
MessageManager.off(MessageEvents.SCORE_UPDATE, this.updateScore, this);
```

### 预定义消息事件

| 事件名 | 数据 | 说明 |
|--------|------|------|
| SCORE_UPDATE | { score, bestScore } | 分数更新 |
| GAME_OVER | { score, isWin } | 游戏结束 |
| SKIN_CHANGE | { skinId } | 皮肤切换 |
| GRID_SIZE_CHANGE | { size } | 网格大小切换 |
| UNDO_STATE_CHANGE | { canUndo } | 撤销状态变化 |
