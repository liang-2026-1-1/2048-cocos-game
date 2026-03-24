/**
 * 主面板UI构建器
 * 负责创建主游戏面板的所有UI组件
 * 兼容 Cocos Creator 2.x
 */

import { GameConfig } from '../config/GameConfig';
import { GlobalConfig } from '../config/GlobalConfig';
import { ResolutionConfig } from '../config/ResolutionConfig';
import { SkinConfig } from '../utils/SkinConfig';
import { UIUtils } from '../utils/UIUtils';

/**
 * 主面板UI组件引用
 */
export interface MainPanelUIComponents {
    /** 标题节点 */
    titleNode: cc.Node;
    /** 分数容器 */
    scoreContainer: cc.Node;
    /** 当前分数标签 */
    scoreLabel: cc.Label;
    /** 最高分标签 */
    bestScoreLabel: cc.Label;
    /** 新游戏按钮 */
    newGameButton: cc.Node;
    /** 撤销按钮 */
    undoButton: cc.Node;
    /** 设置按钮 */
    settingsButton: cc.Node;
    /** 游戏网格容器 */
    gridContainer: cc.Node;
    /** 网格背景节点 */
    gridBackground: cc.Node;
}

/**
 * 主面板UI构建器
 */
export class MainPanelUI {
    private designWidth: number = ResolutionConfig.DESIGN_WIDTH;
    private designHeight: number = ResolutionConfig.DESIGN_HEIGHT;

    /** UI组件引用 */
    private components: MainPanelUIComponents = null;

    /**
     * 构建主面板UI
     * @param parent 父节点
     */
    public build(parent: cc.Node): MainPanelUIComponents {
        this.createBackground(parent);
        this.createTopArea(parent);
        this.createScoreArea(parent);
        this.createButtonArea(parent);
        this.createGridArea(parent);

        return this.components;
    }

    /**
     * 创建背景
     */
    private createBackground(parent: cc.Node): void {
        const bg = new cc.Node('Background');
        bg.parent = parent;
        bg.setContentSize(this.designWidth, this.designHeight);

        // 添加 Widget 组件让背景完全填充父节点
        const widget = bg.addComponent(cc.Widget);
        widget.isAlignTop = true;
        widget.isAlignBottom = true;
        widget.isAlignLeft = true;
        widget.isAlignRight = true;
        widget.top = 0;
        widget.bottom = 0;
        widget.left = 0;
        widget.right = 0;
        widget.updateAlignment();

        const sprite = bg.addComponent(cc.Sprite);
        sprite.type = cc.Sprite.Type.SIMPLE;
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        UIUtils.setWhiteTexture(sprite);
        sprite.node.color = UIUtils.colorFromHex('#FAF8EF');

        // 尝试加载背景图片
        cc.resources.load(GlobalConfig.BG_IMAGE_PATH, cc.SpriteFrame, (err, spriteFrame: cc.SpriteFrame) => {
            if (err) {
                cc.log('[StartPanelUI] 使用纯色背景');
                return;
            }
            sprite.spriteFrame = spriteFrame;
            // 更新节点大小以适应图片
            widget.updateAlignment();
            cc.log('[StartPanelUI] 背景图片加载成功');
        });
    }

    /**
     * 创建顶部区域（标题）
     */
    private createTopArea(parent: cc.Node): void {
        // 顶部区域高度 160
        const topY = this.designHeight / 2 - 100;

        // 标题
        const titleNode = new cc.Node('Title');
        titleNode.parent = parent;
        titleNode.setPosition(0, topY);

        const titleLabel = titleNode.addComponent(cc.Label);
        titleLabel.string = '2048';
        titleLabel.fontSize = 64;
        titleLabel.lineHeight = 72;
        titleLabel.node.color = UIUtils.colorFromHex('#776E65');
        titleLabel.fontFamily = 'Arial-BoldMT';

        this.components = {
            titleNode,
            scoreContainer: null,
            scoreLabel: null,
            bestScoreLabel: null,
            newGameButton: null,
            undoButton: null,
            settingsButton: null,
            gridContainer: null,
            gridBackground: null
        };
    }

    /**
     * 创建分数区域
     */
    private createScoreArea(parent: cc.Node): void {
        const scoreY = this.designHeight / 2 - 180;

        // 分数容器
        const scoreContainer = new cc.Node('ScoreContainer');
        scoreContainer.parent = parent;
        scoreContainer.setPosition(0, scoreY);

        // 当前分数框
        const currentScoreBox = this.createScoreBox('SCORE', 140, 80);
        currentScoreBox.container.parent = scoreContainer;
        currentScoreBox.container.setPosition(-80, 0);

        // 最高分框
        const bestScoreBox = this.createScoreBox('BEST', 140, 80);
        bestScoreBox.container.parent = scoreContainer;
        bestScoreBox.container.setPosition(80, 0);

        this.components.scoreContainer = scoreContainer;
        this.components.scoreLabel = currentScoreBox.scoreLabel;
        this.components.bestScoreLabel = bestScoreBox.scoreLabel;
    }

    /**
     * 创建分数显示框
     */
    private createScoreBox(title: string, width: number, height: number): {
        container: cc.Node;
        titleLabel: cc.Label;
        scoreLabel: cc.Label;
    } {
        const container = new cc.Node(title + 'Box');
        container.setContentSize(width, height);

        const sprite = container.addComponent(cc.Sprite);
        sprite.type = cc.Sprite.Type.SLICED;
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        UIUtils.setWhiteTexture(sprite);
        sprite.node.color = UIUtils.colorFromHex('#BBADA0');

        // 标题
        const titleNode = new cc.Node('Title');
        titleNode.parent = container;
        titleNode.setPosition(0, 18);
        const titleLabel = titleNode.addComponent(cc.Label);
        titleLabel.string = title;
        titleLabel.fontSize = 16;
        titleLabel.lineHeight = 20;
        titleLabel.node.color = UIUtils.colorFromHex('#EEE4DA');

        // 分数
        const scoreNode = new cc.Node('Score');
        scoreNode.parent = container;
        scoreNode.setPosition(0, -8);
        const scoreLabel = scoreNode.addComponent(cc.Label);
        scoreLabel.string = '0';
        scoreLabel.fontSize = 28;
        scoreLabel.lineHeight = 32;
        scoreLabel.node.color = cc.Color.WHITE;

        return { container, titleLabel, scoreLabel };
    }

    /**
     * 创建按钮区域
     */
    private createButtonArea(parent: cc.Node): void {
        const buttonY = this.designHeight / 2 - 280;
        const buttonSpacing = 110;
        const startX = -buttonSpacing;

        // 新游戏按钮
        const newGameButton = this.createButton('New Game', 100, 50);
        newGameButton.parent = parent;
        newGameButton.setPosition(startX, buttonY);
        this.components.newGameButton = newGameButton;

        // 撤销按钮
        const undoButton = this.createButton('Undo', 100, 50);
        undoButton.parent = parent;
        undoButton.setPosition(0, buttonY);
        this.components.undoButton = undoButton;

        // 设置按钮
        const settingsButton = this.createButton('Settings', 100, 50);
        settingsButton.parent = parent;
        settingsButton.setPosition(buttonSpacing, buttonY);
        this.components.settingsButton = settingsButton;
    }

    /**
     * 创建网格区域
     */
    private createGridArea(parent: cc.Node): void {
        // 网格容器 - 放在屏幕中下部分
        const gridContainer = new cc.Node('GridContainer');
        gridContainer.parent = parent;
        gridContainer.setPosition(0, -100);

        // 网格背景 - 使用默认网格大小计算尺寸
        const gridBackground = new cc.Node('GridBackground');
        gridBackground.parent = gridContainer;
        gridBackground.setPosition(0, 0);
        const gridTotalSize = GameConfig.getGridTotalSize(GameConfig.DEFAULT_GRID_SIZE);
        gridBackground.setContentSize(gridTotalSize, gridTotalSize);

        const bgSprite = gridBackground.addComponent(cc.Sprite);
        bgSprite.type = cc.Sprite.Type.SLICED;
        bgSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        UIUtils.setWhiteTexture(bgSprite);
        bgSprite.node.color = UIUtils.colorFromHex('#BBADA0');

        this.components.gridContainer = gridContainer;
        this.components.gridBackground = gridBackground;
    }

    /**
     * 创建按钮
     */
    private createButton(text: string, width: number, height: number): cc.Node {
        const button = new cc.Node(text + 'Button');
        button.setContentSize(width, height);

        const sprite = button.addComponent(cc.Sprite);
        sprite.type = cc.Sprite.Type.SLICED;
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        UIUtils.setWhiteTexture(sprite);
        sprite.node.color = UIUtils.colorFromHex('#8F7A66');

        // 添加按钮组件
        const btn = button.addComponent(cc.Button);
        btn.transition = cc.Button.Transition.SCALE;
        btn.duration = 0.1;
        btn.zoomScale = 0.9;

        // 按钮文本
        const labelNode = new cc.Node('Text');
        labelNode.parent = button;

        const label = labelNode.addComponent(cc.Label);
        label.string = text;
        label.fontSize = 18;
        label.lineHeight = 22;
        label.node.color = cc.Color.WHITE;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;

        return button;
    }

    /**
     * 更新主题颜色
     */
    public updateTheme(): void {
        const theme = SkinConfig.currentTheme;

        if (this.components.gridBackground) {
            const sprite = this.components.gridBackground.getComponent(cc.Sprite);
            if (sprite) {
                sprite.node.color = cc.color().fromHEX(theme.gridBgColor);
            }
        }

        [this.components.newGameButton, this.components.undoButton, this.components.settingsButton].forEach(btn => {
            if (btn) {
                const sprite = btn.getComponent(cc.Sprite);
                if (sprite) {
                    sprite.node.color = cc.color().fromHEX(theme.buttonColor);
                }
            }
        });
    }
}
