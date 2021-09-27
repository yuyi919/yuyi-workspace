/*:zh
 * @target MZ
 * @plugindesc Play SE for Each Letter on Message Window
 * @author Sasuke KANNAZUKI
 *
 * @command callDice
 * @text 丢个骰子
 * @desc 指定された中心点および倍率でズームします
 *
 * @arg actorId
 * @text 角色Id
 * @desc 展示丢出骰子的角色名称
 * @type actor
 * @default 0
 * 
 * @arg callMessage
 * @text 展示对话信息
 * @desc 用对话框展示骰子结果
 * @type boolean
 * @default true
 * 
 * @arg battleActor
 * @text 战斗中，使用当前角色，覆盖角色Id
 * @type boolean
 * @default false
 *
 * @arg target 
 * @text 目标值
 * @type number
 * 
 * @arg text
 * @text 骰子的简介
 * @desc 简单说明骰的介绍
 * @type text
 * 
 * @param diceResultVariableId
 * @text 检定结果骰保存的位置
 * @desc 检定结果骰保存的位置,1为成功,2为失败
 * when 0 is set, not play as default.
 * @type variable
 * @default 1
 * 
 * @param default SE
 * @text Map's Default SE ID
 * @desc Be 0, 1 or 2.
 * when 0 is set, not play as default.
 * @type number
 * @max 2
 * @min 0
 * @default 1
 *
 * @param battle default SE
 * @text Battle's Default SE ID
 * @desc Be 0, 1 or 2.
 * when 0 is set, not play as default.
 * @type number
 * @max 2
 * @min 0
 * @default 0
 *
 * @param interval
 * @text Interval Letter Number
 * @desc Number of letter that skip without playing SE.
 * When it sets 0, do play at each letter. (Default:2)
 * @type number
 * @min 0
 * @default 2
 *
 * @param name1
 * @text File Name of SE ID:1
 * @desc
 * @default Cursor1
 * @require 1
 * @dir audio/se/
 * @type file
 *
 * @param volume1
 * @parent name1
 * @text Volume of SE ID:1
 * @desc
 * @type number
 * @min 0
 * @default 90
 *
 * @param pitch1
 * @parent name1
 * @text Pitch of SE ID:1
 * @desc
 * @type number
 * @max 1000000
 * @min 10
 * @default 100
 *
 * @param name2
 * @text File Name of SE ID:2
 * @desc
 * @default Cursor2
 * @require 1
 * @dir audio/se/
 * @type file
 *
 * @param volume2
 * @parent name2
 * @text Volume of SE ID:2
 * @desc Default:90
 * @type number
 * @min 0
 * @default 90
 *
 * @param pitch2
 * @parent name2
 * @text Pitch of SE ID:2
 * @desc Default:100
 * @type number
 * @max 1000000
 * @min 10
 * @default 125
 *
 * @help This plugin does not provide plugin commands.
 * This plugin runs under RPG Maker MZ.
 *
 * This plugin enables to play SE(=Sound Effect) on message window
 * when each letter displays.
 *
 * You can set 2 SEs, and select which to use case by case.
 *
 * [Summary]
 * At message window, SE can change by following notation:
 * \SE[0] : stop SE
 * \SE[1] : play SE ID 1 at each letter.
 * \SE[2] : play SE ID 2 at each letter.
 * This setting is reset when map or scene changes.
 * Note that 'scene change' includes open/close menu on map.
 *
 * When \> is set in message window,
 * It forces to play char SE once.
 *
 * [License]
 * this plugin is released under MIT license.
 * http://opensource.org/licenses/mit-license.php
 *


 */
/*:ja
 * @target MZ
 * @plugindesc メッセージウィンドウで文字ごとにSEを演奏します。
 * @author 神無月サスケ
 *
 * @param default SE
 * @text マップでのデフォルトSE番号
 * @desc マップに入るたびにこの値に初期化されます。
 * 0,1,2のいずれかにしてください。0は無音です。
 * @type number
 * @max 2
 * @min 0
 * @default 1
 *
 * @param battle default SE
 * @text バトルでのデフォルトSE番号
 * @desc バトルに入るたびにこの値に初期化されます。
 * 0,1,2のいずれかにしてください。0は無音です。
 * @type number
 * @max 2
 * @min 0
 * @default 0
 *
 * @param interval
 * @text インターバル
 * @desc 何文字スキップして音を鳴らすか(推奨値:2)。
 * 0の場合、全ての文字で音を鳴らします。
 * @type number
 * @min 0
 * @default 2
 *
 * @param name1
 * @text SE1のファイル名
 * @desc
 * @default Cursor1
 * @require 1
 * @dir audio/se/
 * @type file
 *
 * @param volume1
 * @parent name1
 * @text SE1のボリューム
 * @desc
 * @type number
 * @min 0
 * @default 90
 *
 * @param pitch1
 * @parent name1
 * @text SE1のピッチ
 * @desc
 * @type number
 * @max 1000000
 * @min 10
 * @default 100
 *
 * @param name2
 * @text SE2のファイル名
 * @desc
 * @default Cursor2
 * @require 1
 * @dir audio/se/
 * @type file
 *
 * @param volume2
 * @parent name2
 * @text SE2のボリューム
 * @desc デフォルト:90
 * @type number
 * @min 0
 * @default 75
 *
 * @param pitch2
 * @parent name2
 * @text SE2のピッチ
 * @desc デフォルト:100
 * @type number
 * @max 1000000
 * @min 10
 * @default 125
 *
 * @help このプラグインには、プラグインコマンドはありません。
 * このプラグインは、RPGツクールMZに対応しています。
 *
 * このプラグインは、メッセージウィンドウで文字表示の際に、
 * ポポポポ……といった感じでSE(効果音)を鳴らすことを可能にします。
 *
 * 2種類の効果音が指定可能で、ケースに応じて使い分けることが可能です。
 *
 * ■概要
 * メッセージウィンドウで以下の書式で書くことでSEを切り替えられます。
 * \SE[0] : SEを止めます。
 * \SE[1] : SE1を鳴らします。
 * \SE[2] : SE2を鳴らします。
 * この設定は、マップかシーンが切り替わるとデフォルトにリセットされます。
 * ※シーン切り替えには、メニューの開閉も含まれます。
 *
 * 文中で \> が設定された場合、インターバル(interval)の値に関わらず、
 * 強制的に1回だけSEが演奏されます。
 *
 * ■ライセンス表記
 * このプラグインは MIT ライセンスで配布されます。
 * ご自由にお使いください。
 * http://opensource.org/licenses/mit-license.php
 */
export * from "./MsgExtra";
import { parameters } from "./MsgExtra";
//@ts-ignore
window.Yuyi919_MsgExtra = parameters;
