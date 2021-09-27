/*:
 * @target MZ
 * @plugindesc Play SE for Each Letter on Message Window
 * @author Sasuke KANNAZUKI
 * @base VisuMZ_1_BattleCore
 * @base BattleVoiceMZ
 * @orderAfter VisuMZ_1_BattleCore
 * @orderAfter BattleVoiceMZ
 *
 * @command playBattleVoice
 * @text 播放战斗语音
 * @desc 用于在战斗序列中播放战斗语音（来自其它插件），只能在战斗序列中使用
 *
 *
 * @command CameraFocusZoomAllTarget
 * @text 战斗镜头聚焦All Target增强
 * @desc 用于在战斗序列中播放战斗语音（来自其它插件），只能在战斗序列中使用
 *
 * @arg duration
 * @text 镜头动态持续时间
 * @desc 镜头动态持续时间
 * @type number
 * @default 30
 *
 * @arg scale
 * @text 镜头缩放比率
 * @desc 镜头缩放比率
 * @type number
 * @default 5
 *
 * @arg waitForCamera
 * @text 等待镜头运动结束
 * @desc 等待镜头运动结束
 * @type boolean
 * @default false
 *
 * @command CameraFocusZoomUser
 * @text 战斗镜头聚焦User增强
 * @desc 用于在战斗序列中播放战斗语音（来自其它插件），只能在战斗序列中使用
 *
 * @arg duration
 * @text 镜头动态持续时间
 * @desc 镜头动态持续时间
 * @type number
 * @default 30
 *
 * @arg scale
 * @text 镜头缩放比率
 * @desc 镜头缩放比率
 * @type number
 * @default 5
 *
 * @arg offsetToJump
 * @text 镜头偏移Y到跳跃中的角色
 * @type boolean
 * @default false
 *
 *
 * @arg waitForCamera
 * @text 等待镜头运动结束
 * @desc 等待镜头运动结束
 * @type boolean
 * @default false
 *
 * @command CameraFocusZoomTarget
 * @text 战斗镜头聚焦Target增强
 * @desc 用于在战斗序列中播放战斗语音（来自其它插件），只能在战斗序列中使用
 *
 * @arg duration
 * @text 镜头动态持续时间
 * @desc 镜头动态持续时间
 * @type number
 * @default 20
 *
 * @arg scale
 * @text 镜头缩放比率
 * @desc 镜头动态持续时间
 * @type number
 * @default 3
 *
 * @arg waitForCamera
 * @text 等待镜头运动结束
 * @desc 等待镜头运动结束
 * @type boolean
 * @default false
 *
 *
 **/
import BattleSeqExtra from "./BattleSeqExtra";
BattleSeqExtra(globalThis as any);
