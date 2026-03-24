/**
 * 开始面板UI构建器
 * 负责创建开始面板的所有UI组件
 * 兼容 Cocos Creator 2.x
 */

import { GameConfig } from '../config/GameConfig';
import { GlobalConfig } from '../config/GlobalConfig';
import { ResolutionConfig } from '../config/ResolutionConfig';
import { SkinConfig } from '../utils/SkinConfig';
import { UIUtils } from '../utils/UIUtils';


/**
 * 开始面板UI组件引用
 */
export interface StartPanelUIComponents {
    /** 背景节点 */
    background: cc.Node;
    /** 标题节点 */
    titleNode: cc.Node;
    /** 副标题节点 */
    subtitleNode: cc.Node;
    /** 网格大小选择列表 */
    gridSizeButtons: cc.Node[];
    /** 继续游戏按钮 */
    continueButton: cc.Node;
    /** 最高分标签 */
    bestScoreLabel: cc.Label;
}


/**
 * 开始面板UI构建器
 */
export class StartPanelUI {
    private designWidth: number = ResolutionConfig.DESIGN_WIDTH;
    private designHeight: number = ResolutionConfig.DESIGN_HEIGHT;

    /** UI组件引用 */
    private components: StartPanelUIComponents = null;

    /** 网格大小选择回调 */
    private _onGridSizeSelected: (index: number) => void = null;

    /**
     * 设置网格大小选择回调
     */
    public setOnGridSizeSelected(callback: (index: number) => void): void {
        this._onGridSizeSelected = callback;
    }

    /**
     * 构建开始面板UI
     * @param parent 父节点
     */
    public build(parent: cc.Node): StartPanelUIComponents {
        // 创建内容容器，用于居中所有UI元素
        const contentContainer = new cc.Node('ContentContainer');
        contentContainer.parent = parent;
        contentContainer.setAnchorPoint(0.5, 0.5);
        contentContainer.setPosition(0, 0);
        contentContainer.setContentSize(this.designWidth, this.designHeight); // 设置大小，让背景可以填充

        // 添加 Widget 使其填满整个屏幕，避免顶部漏空
        const widget = contentContainer.addComponent(cc.Widget);
        widget.isAlignHorizontalCenter = true;
        widget.isAlignTop = true;
        widget.isAlignBottom = true;
        widget.horizontalCenter = 0;
        widget.top = 0;
        widget.bottom = 0;

        this.createBackground(contentContainer);
        this.createTitle(contentContainer);
        this.createGridSizeSelector(contentContainer);
        this.createButtons(contentContainer);
        this.createFooter(contentContainer);

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

        // 先设置默认背景颜色，避免加载时显示黑色
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

        this.components = {
            background: bg,
            titleNode: null,
            subtitleNode: null,
            gridSizeButtons: [],
            continueButton: null,
            bestScoreLabel: null
        };
    }

    /**
     * 创建网格大小选择区域
     */
    private createGridSizeSelector(parent: cc.Node): void {
        const startY = -10;
        const buttonWidth = 140;
        const buttonHeight = 50;
        const buttonSpacing = 15;

        // 创建网格大小选择按钮（垂直排列）
        GameConfig.GRID_SIZES.forEach((size, index) => {
            const button = this.createGridSizeButton(`${size}×${size}`, buttonWidth, buttonHeight, index);
            button.parent = parent;
            button.setPosition(0, startY - index * (buttonHeight + buttonSpacing));
            this.components.gridSizeButtons.push(button);
        });
    }

    /**
     * 创建网格大小选择按钮
     */
    private createGridSizeButton(text: string, width: number, height: number, index: number): cc.Node {
        const button = new cc.Node('GridSizeButton_' + index);
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
        btn.zoomScale = 0.95;

        // 按钮文本
        const labelNode = new cc.Node('Text');
        labelNode.parent = button;

        const label = labelNode.addComponent(cc.Label);
        label.string = text;
        label.fontSize = 20;
        label.lineHeight = 24;
        label.node.color = cc.Color.WHITE;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;

        // 点击事件 - 直接开始游戏
        button.on(cc.Node.EventType.TOUCH_END, () => {
            this._onGridSizeSelected?.(index);
        }, this);

        return button;
    }

    /**
     * 创建标题区域
     */
    private createTitle(parent: cc.Node): void {
        // 主标题
        const titleNode = new cc.Node('Title');
        titleNode.parent = parent;
        titleNode.setPosition(0, 200);

        const titleLabel = titleNode.addComponent(cc.Label);
        titleLabel.string = '2048';
        titleLabel.fontSize = 80;
        titleLabel.lineHeight = 90;
        titleLabel.node.color = UIUtils.colorFromHex('#776E65');
        titleLabel.fontFamily = 'Arial-BoldMT';
        titleLabel.verticalAlign = cc.Label.VerticalAlign.CENTER;

        // 副标题
        const subtitleNode = new cc.Node('Subtitle');
        subtitleNode.parent = parent;
        subtitleNode.setPosition(0, 120);

        const subtitleLabel = subtitleNode.addComponent(cc.Label);
        subtitleLabel.string = '合并数字，挑战2048！';
        subtitleLabel.fontSize = 24;
        subtitleLabel.lineHeight = 28;
        subtitleLabel.node.color = UIUtils.colorFromHex('#8F7A66');
        subtitleLabel.verticalAlign = cc.Label.VerticalAlign.TOP;

        this.components.titleNode = titleNode;
        this.components.subtitleNode = subtitleNode;
    }

    /**
     * 创建按钮区域
     */
    private createButtons(parent: cc.Node): void {
        const buttonY = -180;
        const buttonWidth = 200;
        const buttonHeight = 60;

        // 继续游戏按钮（默认隐藏）
        const continueButton = this.createButton('继续游戏', buttonWidth, buttonHeight, '#BBADA0');
        continueButton.parent = parent;
        continueButton.setPosition(0, buttonY);
        continueButton.active = false;
        this.components.continueButton = continueButton;
    }

    /**
     * 创建底部信息
     */
    private createFooter(parent: cc.Node): void {
        // 最高分显示
        const bestScoreNode = new cc.Node('BestScore');
        bestScoreNode.parent = parent;
        bestScoreNode.setPosition(0, -350);

        const bestScoreLabel = bestScoreNode.addComponent(cc.Label);
        bestScoreLabel.string = '最高分: 0';
        bestScoreLabel.fontSize = 28;
        bestScoreLabel.lineHeight = 24;
        bestScoreLabel.node.color = UIUtils.colorFromHex('#776E65');
        bestScoreLabel.verticalAlign = cc.Label.VerticalAlign.CENTER;
        bestScoreLabel.node.active = false;
        this.components.bestScoreLabel = bestScoreLabel;
    }

    /**
     * 创建按钮
     */
    private createButton(text: string, width: number, height: number, bgColor: string): cc.Node {
        const button = new cc.Node(text + 'Button');
        button.setContentSize(width, height);

        const sprite = button.addComponent(cc.Sprite);
        sprite.type = cc.Sprite.Type.SLICED;
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        UIUtils.setWhiteTexture(sprite);
        sprite.node.color = UIUtils.colorFromHex(bgColor);

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
        label.fontSize = 24;
        label.lineHeight = 28;
        label.node.color = cc.Color.WHITE;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        return button;
    }

    /**
     * 更新主题颜色
     */
    public updateTheme(): void {
        const theme = SkinConfig.currentTheme;

        if (this.components.continueButton && this.components.continueButton.active) {
            const sprite = this.components.continueButton.getComponent(cc.Sprite);
            if (sprite) {
                sprite.node.color = cc.color().fromHEX(theme.buttonColor);
            }
        }
    }

    /**
     * 设置继续按钮显示状态
     */
    public setContinueButtonVisible(visible: boolean): void {
        if (this.components.continueButton) {
            this.components.continueButton.active = visible;
        }
    }
}
