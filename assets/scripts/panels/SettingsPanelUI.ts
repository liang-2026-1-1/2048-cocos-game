/**
 * 设置面板UI构建器
 * 负责创建设置面板的所有UI组件
 * 兼容 Cocos Creator 2.x
 */

import { GameConfig } from '../config/GameConfig';
import { ResolutionConfig } from '../config/ResolutionConfig';
import { SkinConfig } from '../utils/SkinConfig';
import { UIUtils } from '../utils/UIUtils';

/**
 * 设置面板UI组件引用
 */
export interface SettingsPanelUIComponents {
    /** 内容容器 */
    contentContainer: cc.Node;
    /** 关闭按钮 */
    closeButton: cc.Node;
    /** 网格大小按钮组 */
    gridSizeButtons: cc.Node[];
    /** 皮肤选择按钮组 */
    skinButtons: cc.Node[];
}

/**
 * 设置面板UI构建器
 */
export class SettingsPanelUI {
    private designWidth: number = ResolutionConfig.DESIGN_WIDTH;
    private designHeight: number = ResolutionConfig.DESIGN_HEIGHT;

    /** UI组件引用 */
    private components: SettingsPanelUIComponents = null;

    /**
     * 构建设置面板UI
     * @param parent 父节点
     */
    public build(parent: cc.Node): SettingsPanelUIComponents {
        // 初始化组件
        this.components = {
            contentContainer: null,
            closeButton: null,
            gridSizeButtons: [],
            skinButtons: []
        };

        this.createContentPanel(parent);

        return this.components;
    }

    /**
     * 创建内容面板
     */
    private createContentPanel(parent: cc.Node): void {

        // 内容容器 - 使用锚点和位置居中，不使用 Widget
        const contentContainer = new cc.Node('ContentContainer');
        contentContainer.parent = parent;
        contentContainer.setAnchorPoint(0.5, 0.5);
        // 微调Y轴位置：正值向上，负值向下
        contentContainer.setPosition(0, 50);  // 向上偏移50像素
        contentContainer.setContentSize(450, 500);

        const worldPos = contentContainer.convertToWorldSpaceAR(cc.v2(0, 0));


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
        let currentY = 200;

        // 标题
        const titleNode = new cc.Node('Title');
        titleNode.parent = container;
        titleNode.setPosition(0, currentY);

        const titleLabel = titleNode.addComponent(cc.Label);
        titleLabel.string = '设置';
        titleLabel.fontSize = 36;
        titleLabel.lineHeight = 42;
        titleLabel.node.color = UIUtils.colorFromHex('#776E65');
        titleLabel.fontFamily = 'Arial-BoldMT';
        titleLabel.verticalAlign = cc.Label.VerticalAlign.CENTER;

        // 关闭按钮（右上角）
        const closeButton = new cc.Node('CloseButton');
        closeButton.parent = container;
        closeButton.setPosition(190, 200);
        closeButton.setContentSize(40, 40);

        const closeSprite = closeButton.addComponent(cc.Sprite);
        closeSprite.type = cc.Sprite.Type.SLICED;
        closeSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        UIUtils.setWhiteTexture(closeSprite);
        closeSprite.node.color = UIUtils.colorFromHex('#BBADA0');

        const closeBtn = closeButton.addComponent(cc.Button);
        closeBtn.transition = cc.Button.Transition.SCALE;
        closeBtn.duration = 0.1;
        closeBtn.zoomScale = 0.9;

        const closeLabelNode = new cc.Node('Text');
        closeLabelNode.parent = closeButton;
        const closeLabel = closeLabelNode.addComponent(cc.Label);
        closeLabel.string = '×';
        closeLabel.fontSize = 32;
        closeLabel.node.color = cc.Color.WHITE;
        closeLabel.verticalAlign = cc.Label.VerticalAlign.CENTER;
        this.components.closeButton = closeButton;

        currentY -= 80;

        // 网格大小设置
        currentY = this.createGridSizeSection(container, currentY);

        // 皮肤选择
        currentY = this.createSkinSection(container, currentY);
    }

    /**
     * 创建网格大小选择区域
     */
    private createGridSizeSection(container: cc.Node, startY: number): number {
        let currentY = startY;

        // 标题
        const labelNode = new cc.Node('GridSizeLabel');
        labelNode.parent = container;
        labelNode.setPosition(-150, currentY);

        const label = labelNode.addComponent(cc.Label);
        label.string = '网格大小:';
        label.fontSize = 22;
        label.lineHeight = 26;
        label.node.color = UIUtils.colorFromHex('#776E65');
        label.horizontalAlign = cc.Label.HorizontalAlign.LEFT;

        currentY -= 50;

        // 网格大小选项按钮
        const gridSizeButtons: cc.Node[] = [];
        const gridSizes = ['3×3', '4×4', '5×5', '6×6'];
        const buttonWidth = 80;
        const spacing = 95;
        const startX = -(gridSizes.length - 1) * spacing / 2;

        gridSizes.forEach((text, index) => {
            const button = this.createOptionButton(text, buttonWidth, 45);
            button.parent = container;
            button.setPosition(startX + index * spacing, currentY);
            gridSizeButtons.push(button);
        });

        this.components.gridSizeButtons = gridSizeButtons;

        return currentY - 70;
    }

    /**
     * 创建皮肤选择区域
     */
    private createSkinSection(container: cc.Node, startY: number): number {
        let currentY = startY;

        // 标题
        const labelNode = new cc.Node('SkinLabel');
        labelNode.parent = container;
        labelNode.setPosition(-150, currentY);

        const label = labelNode.addComponent(cc.Label);
        label.string = '皮肤主题:';
        label.fontSize = 22;
        label.lineHeight = 26;
        label.node.color = UIUtils.colorFromHex('#776E65');
        label.horizontalAlign = cc.Label.HorizontalAlign.LEFT;

        currentY -= 50;

        // 皮肤选项按钮
        const skinButtons: cc.Node[] = [];
        const skins = ['经典', '糖果', '暗黑', '海洋'];
        const buttonWidth = 80;
        const spacing = 95;
        const startX = -(skins.length - 1) * spacing / 2;

        skins.forEach((text, index) => {
            const button = this.createOptionButton(text, buttonWidth, 45);
            button.parent = container;
            button.setPosition(startX + index * spacing, currentY);
            skinButtons.push(button);
        });

        this.components.skinButtons = skinButtons;

        return currentY - 70;
    }

    /**
     * 创建选项按钮
     */
    private createOptionButton(text: string, width: number, height: number): cc.Node {
        const button = new cc.Node(text + 'Button');
        button.setContentSize(width, height);

        const sprite = button.addComponent(cc.Sprite);
        sprite.type = cc.Sprite.Type.SLICED;
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        UIUtils.setWhiteTexture(sprite);
        sprite.node.color = UIUtils.colorFromHex('#BBADA0');

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
        // 更新按钮颜色由外部逻辑控制
    }

    /**
     * 更新网格大小选择状态
     */
    public updateGridSizeSelection(selectedSize: number): void {
        const theme = SkinConfig.currentTheme;

        this.components.gridSizeButtons.forEach((btn, index) => {
            if (!btn) return;

            const targetSize = GameConfig.GRID_SIZES[index];
            const selected = targetSize === selectedSize;

            const sprite = btn.getComponent(cc.Sprite);
            if (sprite) {
                const color = selected ? theme.buttonColor : theme.emptyCellColor;
                sprite.node.color = cc.color().fromHEX(color);
            }
        });
    }

    /**
     * 更新皮肤选择状态
     */
    public updateSkinSelection(selectedIndex: number): void {
        const theme = SkinConfig.currentTheme;

        this.components.skinButtons.forEach((btn, index) => {
            if (!btn) return;

            const selected = index === selectedIndex;
            const sprite = btn.getComponent(cc.Sprite);

            if (sprite) {
                const color = selected ? theme.buttonColor : theme.emptyCellColor;
                sprite.node.color = cc.color().fromHEX(color);
            }
        });
    }
}
