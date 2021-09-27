import { x } from "@yuyi919/rpgmz-plugin-transformer";

@x.Struct()
export class TextSeConfig {
  /**
   * 配置se，并根据下面的配置决定启用哪一项
   * @min -1
   */
  @x.Param()
  @x.Text("se配置集合")
  @x.Type(() => TextSeRecordConfig)
  configRecord: TextSeRecordConfig[];

  /**
   * 地图场景启用哪一个se配置
   * 如果设置为-1，则不播放任何se
   * @min -1
   */
  @x.Param()
  @x.Text("地图场景默认启用")
  defaultSE: number = 0;

  /**
   * 战斗场景启用哪一个se配置
   * 如果设置为-1，则不播放任何se
   * @min -1
   */
  @x.Param()
  @x.Text("战斗中默认启用")
  battleDefaultSE: number = 0;

  /**
   * Number of letter that skip without playing SE.
   * When it sets 0, do play at each letter. (Default:2)
   * @min 0
   */
  @x.Param()
  @x.Text("播放se的字符间隔")
  interval: number = 2;
}

@x.Struct()
export class TextSeRecordConfig {
  /**
   * @dir audio/se/
   */
  @x.Param()
  @x.Text("SE")
  @x.Type("file")
  name: string = "Cursor1";

  /**
   *
   * @min 0
   */
  @x.Param()
  @x.Text("音量")
  volume: number = 90;

  /**
   *
   * @max 1000000
   * @min 10
   */
  @x.Param()
  @x.Text("音调")
  pitch: number = 100;
}
