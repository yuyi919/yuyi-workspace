import { x } from "@yuyi919/rpgmz-plugin-transformer";

/**
 * @x.enums
 */
export type TDiceType =
  /**
   * 测试
   * @type 1
   */
  | 1
  /**
   * 正式
   * @type 2
   */
  | 2;
/**
 * @x.enums
 */
export const enum DiceType {
  /**
   * Lucky!
   */
  Lucky,
  /**
   * DX!
   */
  DX,
  /**
   * IQ!
   * @description 测试
   */
  IQ = "测试2",
  /**
   * HT!
   */
  HT = "3",
}

/**
 * 骰子相关的配置项
 */
@x.Struct()
export class DiceConfig {
  /**
   * 检定结果骰保存的位置,1为成功,2为失败
   */
  @x.Param()
  @x.Text("检定结果骰保存的位置")
  @x.Type("variable")
  diceResultVariableId: number = 1;

  /**
   * 测试
   */
  @x.Param()
  @x.Text("骰子的类型")
  @x.Type("select")
  diceType?: DiceType = DiceType.DX;
  /**
   * 测试
   */
  @x.Param()
  @x.Text("骰子的类型")
  @x.Type("select")
  diceType2?: TDiceType = 1;
}

/**
 * ceshi
 */
@x.Args()
export class DiceCaller {
  /**
   * 展示丢出骰子的角色名称
   */
  @x.Param()
  @x.Type("actor")
  @x.Text("角色Id")
  actorId?: number = 0;

  /**
   * 用对话框展示骰子结果
   */
  @x.Param()
  @x.Text("展示对话信息")
  callMessage?: boolean = true;

  /**
   * 战斗中，使用当前角色，覆盖角色Id
   */
  @x.Param()
  @x.Text("战斗中，使用当前角色，覆盖角色Id")
  battleActor?: boolean = false;

  /**
   * 目标值
   */
  @x.Param()
  @x.Text("目标值")
  target?: number = 10;
  /**
   * 简单说明骰的介绍
   */
  @x.Param()
  @x.Text("骰子的简介")
  text?: string;
}
