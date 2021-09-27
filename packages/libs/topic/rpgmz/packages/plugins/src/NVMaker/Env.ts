import { TachieConfig } from "./ExStandingPicture";

export class Env {
  static parameters: any;

  /** 聚焦的立绘编号 */
  static focusToneAdjust: number;
  static sPictures: any[];
  /**
   * 处于焦点的例会
   */
  static focusId: number | null;
  static _StandingPictureAutoFocus: boolean;
  static _StandingPictureDisabled: boolean;
  static _StandingPictureTone: [number, number, number, number];

  static GlobalTachieConfig: {
    left: TachieConfig;
    center: TachieConfig;
    right: TachieConfig;
  } = {} as any;

  static sPictureLists: any[] = [];

  static init() {
    const G = Yuyi919.getGlobal();
    Env.parameters = G.getParameters();
    // 设定左侧
    Env.GlobalTachieConfig.left = new TachieConfig(-1, Env.parameters);
    // 设定右侧
    Env.GlobalTachieConfig.right = new TachieConfig(1, Env.parameters);

    Env.focusToneAdjust = Number(Env.parameters["focusToneAdjust"] || -96);
    Env.sPictures = JSON.parse(Env.parameters["sPictures"] || "null");
    Env._StandingPictureAutoFocus = eval(Env.parameters.autoFocus || "true") as boolean;

    if (Env.sPictures) {
      Env.sPictures.forEach((elm: string) => {
        Env.sPictureLists.push(JSON.parse(elm));
      });
    }

    G.registerCommand("setEnabled", (args: { enabled: any }) => {
      const enabled = eval(args.enabled || "true");
      Env._StandingPictureDisabled = !enabled;
    });

    G.registerCommand("setTone", (args: { toneR: any; toneG: any; toneB: any; toneC: any }) => {
      Env._StandingPictureTone = [
        Number(args.toneR),
        Number(args.toneG),
        Number(args.toneB),
        Number(args.toneC),
      ];
    });

    G.registerCommand("setAutoFocus", (args: { enabled: any }) => {
      const enabled = eval(args.enabled || "true");
      Env._StandingPictureAutoFocus = !!enabled;
    });
  }
}
