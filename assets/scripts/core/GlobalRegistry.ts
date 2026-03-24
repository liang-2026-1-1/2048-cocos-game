import PanelManager from "../managers/PanelManager";
import { GameData } from "../models/GameData";
import { MathUtil } from "../utils/MathUtil";
import GameController from "./GameController";


/****************
 *@description:挂载 类 到 window  调试 用 ，代码可注释  
 *@author: xjl
 *@date: 2022-12-06 17:30:54
 *@version: x.x.x
*************************************************************************/
export default class RegClzToWindow {
    public constructor() {

    }

    public static init() {
        if (!CC_DEBUG) {
            return;
        }

        this.regClz(PanelManager);
        this.regClz(GameController);
        this.regClz(GameData);
        this.regClz(MathUtil);
    }

    private static regClz(clz) {
        let clz_nams: string = clz.prototype.constructor.name;
        if (!clz_nams) {
            return;
        }
        window[clz_nams] = clz;
    }
}
RegClzToWindow.init();