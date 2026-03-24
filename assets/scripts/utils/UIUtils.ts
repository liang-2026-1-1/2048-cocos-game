/**
 * UI工具类
 * 提供UI创建的通用方法
 * 兼容 Cocos Creator 2.x
 */

/**
 * UI工具类
 */
export class UIUtils {
    /** 白色纹理缓存 */
    private static _whiteTexture: cc.Texture2D = null;

    /**
     * 获取白色纹理
     */
    public static get whiteTexture(): cc.Texture2D {
        if (!this._whiteTexture) {
            this._whiteTexture = new cc.Texture2D();
            this._whiteTexture.initWithData(
                new Uint8Array([255, 255, 255, 255]),
                cc.Texture2D.PixelFormat.RGBA8888,
                1, 1
            );
        }
        return this._whiteTexture;
    }

    /**
     * 创建白色 SpriteFrame
     */
    public static createWhiteSpriteFrame(): cc.SpriteFrame {
        return new cc.SpriteFrame(this.whiteTexture);
    }

    /**
     * 从十六进制创建颜色
     */
    public static colorFromHex(hex: string): cc.Color {
        return cc.color().fromHEX(hex);
    }

    /**
     * 为 Sprite 设置白色纹理
     */
    public static setWhiteTexture(sprite: cc.Sprite): void {
        sprite.spriteFrame = this.createWhiteSpriteFrame();
    }
}
