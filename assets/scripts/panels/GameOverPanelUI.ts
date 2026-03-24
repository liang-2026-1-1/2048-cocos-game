/**
 * 游戏结束面板UI构建器
 * 负责创建游戏结束面板的所有UI组件
 * 兼容 Cocos Creator 2.x
 */

import { ResolutionConfig } from '../config/ResolutionConfig';
import { SkinConfig } from '../utils/SkinConfig';
import { UIUtils } from '../utils/UIUtils';

/**
 * 游戏结束面板UI组件引用
 */
export interface GameOverPanelUIComponents {
    /** 内容容器 */
    contentContainer: cc.Node;
    /** 标题标签 */
    titleLabel: cc.Label;
    /** 分数标签 */
    scoreLabel: cc.Label;
    /** 最高分标签 */
    bestScoreLabel: cc.Label;
    /** 重新开始按钮 */
    restartButton: cc.Node;
    /** 继续按钮（胜利时显示） */
    continueButton: cc.Node;
    /** 分享按钮 */
    shareButton: cc.Node;
}

/**
 * 游戏结束面板UI构建器
 */
export class GameOverPanelUI {
    private designWidth: number = ResolutionConfig.DESIGN_WIDTH;
    private designHeight: number = ResolutionConfig.DESIGN_HEIGHT;

    /** UI组件引用 */
    private components: GameOverPanelUIComponents = null;

    /**
     * 构建游戏结束面板UI
     * @param parent 父节点
     */
    public build(parent: cc.Node): GameOverPanelUIComponents {
        // 初始化组件
        this.components = {
            contentContainer: null,
            titleLabel: null,
            scoreLabel: null,
            bestScoreLabel: null,
            restartButton: null,
            continueButton: null,
            shareButton: null
        };

        this.createContentPanel(parent);

        return this.components;
    }

    /**
     * 创建内容面板
     */
    private createContentPanel(parent: cc.Node): void {
        // 内容容器
        const contentContainer = new cc.Node('ContentContainer');
        contentContainer.parent = parent;
        contentContainer.setAnchorPoint(0.5, 0.5);
        contentContainer.setPosition(0, 50);
        contentContainer.setContentSize(400, 400);

        // 添加 Widget 使其居中
        const widget = contentContainer.addComponent(cc.Widget);
        widget.isAlignHorizontalCenter = true;
        widget.isAlignVerticalCenter = true;
        widget.horizontalCenter = 0;
        widget.verticalCenter = 0;

        const contentSprite = contentContainer.addComponent(cc.Sprite);
        contentSprite.type = cc.Sprite.Type.SLICED;
        contentSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        UIUtils.setWhiteTexture(contentSprite);
        contentSprite.node.color = UIUtils.colorFromHex('#FAF8EF');

        this.components.contentContainer = contentContainer;

        // 创建内部元素
        this.createPanelContent(contentContainer);
    }

    /**
     * 创建面板内容
     */
    private createPanelContent(container: cc.Node): void {
        let currentY = 140;

        // 标题
        const titleNode = new cc.Node('Title');
        titleNode.parent = container;
        titleNode.setPosition(0, currentY);

        const titleLabel = titleNode.addComponent(cc.Label);
        titleLabel.string = '游戏结束';
        titleLabel.fontSize = 40;
        titleLabel.lineHeight = 48;
        titleLabel.node.color = UIUtils.colorFromHex('#776E65');
        titleLabel.fontFamily = 'Arial-BoldMT';
        titleLabel.verticalAlign = cc.Label.VerticalAlign.CENTER;
        this.components.titleLabel = titleLabel;

        currentY -= 60;

        // 当前分数
        const scoreTitleNode = new cc.Node('ScoreTitle');
        scoreTitleNode.parent = container;
        scoreTitleNode.setPosition(0, currentY);

        const scoreTitleLabel = scoreTitleNode.addComponent(cc.Label);
        scoreTitleLabel.string = '得分';
        scoreTitleLabel.fontSize = 20;
        scoreTitleLabel.lineHeight = 24;
        scoreTitleLabel.node.color = UIUtils.colorFromHex('#8F7A66');

        currentY -= 40;

        const scoreNode = new cc.Node('Score');
        scoreNode.parent = container;
        scoreNode.setPosition(0, currentY);

        const scoreLabel = scoreNode.addComponent(cc.Label);
        scoreLabel.string = '0';
        scoreLabel.fontSize = 48;
        scoreLabel.lineHeight = 56;
        scoreLabel.node.color = UIUtils.colorFromHex('#776E65');
        this.components.scoreLabel = scoreLabel;

        currentY -= 60;

        // 最高分
        const bestScoreNode = new cc.Node('BestScore');
        bestScoreNode.parent = container;
        bestScoreNode.setPosition(0, currentY);

        const bestScoreLabel = bestScoreNode.addComponent(cc.Label);
        bestScoreLabel.string = '最高分: 0';
        bestScoreLabel.fontSize = 20;
        bestScoreLabel.lineHeight = 24;
        bestScoreLabel.node.color = UIUtils.colorFromHex('#8F7A66');
        this.components.bestScoreLabel = bestScoreLabel;

        currentY -= 60;

        // 重新开始按钮
        const restartButton = this.createButton('重新开始', 180, 50, '#8F7A66');
        restartButton.parent = container;
        restartButton.setPosition(0, currentY);
        this.components.restartButton = restartButton;

        currentY -= 70;

        // 继续按钮（胜利时显示，默认隐藏）
        const continueButton = this.createButton('继续游戏', 180, 50, '#8F7A66');
        continueButton.parent = container;
        continueButton.setPosition(0, currentY);
        continueButton.active = false;
        this.components.continueButton = continueButton;

        currentY -= 70;

        // 分享按钮
        const shareButton = this.createButton('分享', 120, 40, '#BBADA0');
        shareButton.parent = container;
        shareButton.setPosition(0, currentY);
        shareButton.active = false;
        this.components.shareButton = shareButton;
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
        label.fontSize = 22;
        label.lineHeight = 26;
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

        [this.components.restartButton, this.components.continueButton].forEach(btn => {
            if (btn && btn.active) {
                const sprite = btn.getComponent(cc.Sprite);
                if (sprite) {
                    sprite.node.color = cc.color().fromHEX(theme.buttonColor);
                }
            }
        });
    }

    /**
     * 设置显示模式（胜利/失败）
     */
    public setMode(isWin: boolean): void {
        if (this.components.titleLabel) {
            this.components.titleLabel.string = isWin ? '恭喜获胜！' : '游戏结束';
            this.components.titleLabel.node.color = isWin
                ? UIUtils.colorFromHex('#EDC22E')
                : UIUtils.colorFromHex('#776E65');
        }

        if (this.components.continueButton) {
            this.components.continueButton.active = isWin;
        }
    }
}
