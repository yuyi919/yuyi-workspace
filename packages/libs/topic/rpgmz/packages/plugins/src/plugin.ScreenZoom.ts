/*:zh
 * @target MZ
 * @plugindesc プレイヤーや特定のイベントを中心に、画面をズームアップします。
 * @author 神無月サスケ
 *
 * @command set
 * @text 设置缩放
 * @desc 指定された中心点および倍率でズームします
 *
 * @arg EventId
 * @text 中心点事件id
 * @desc プレイヤーの時は-1に、現在のイベントの時は0に
 * @type number
 * @min -1
 * @default -1
 *
 * @arg OffsetX
 * @desc 中心点よりずらすX座標
 * @type number
 * @min -9999
 * @default 0
 *
 * @arg OffsetY
 * @desc 中心点よりずらすY座標
 * @type number
 * @min -9999
 * @default 0
 *
 * @arg scale
 * @text 缩放倍率
 * @desc 小数点2桁まで指定可能です。
 * @decimals 2
 * @type number
 * @default 1.00
 * @min 0.50
 *
 * @arg FramesToZoom
 * @text 缩放持续帧数
 * @desc ズームにかかるフレーム数
 * 即座にズームさせるときは1に。
 * @type number
 * @default 1
 *
 * @arg isPictureZoom
 * @text 是否也要缩放图片？
 * @desc falseの時は、ピクチャをズームしません。
 * @on する
 * @off しない
 * @type boolean
 * @default false
 *
 * @command reset
 * @text 还原缩放效果
 * @desc 拡大を中止し、元の画面に戻す
 *
 * @arg FramesToZoom
 * @text 缩放持续帧数
 * @desc ズームにかかるフレーム数
 * 即座にズームさせるときは1に。
 * @type number
 * @default 60
 *
 * @command Zoom200
 * @text 200%拡大
 * @desc カスタム。即ズーム表示
 *
 * @arg EventId
 * @text 中心点事件id
 * @desc プレイヤーの時は-1に、現在のイベントの時は0に
 * @type number
 * @min -1
 * @default -1
 *
 * @arg isPictureZoom
 * @text 是否也要缩放图片？
 * @desc falseの時は、ピクチャをズームしません。
 * @on する
 * @off しない
 * @type boolean
 * @default false
 *
 * @command Zoom300
 * @text 300%拡大
 * @desc カスタム。即ズーム表示
 *
 * @arg EventId
 * @text 中心点事件id
 * @desc プレイヤーの時は-1に、現在のイベントの時は0に
 * @type number
 * @min -1
 * @default -1
 *
 * @arg isPictureZoom
 * @text 是否也要缩放图片？
 * @desc falseの時は、ピクチャをズームしません。
 * @on する
 * @off しない
 * @type boolean
 * @default false
 *
 * @help
 * このプラグインは、RPGツクールMZに対応しています。
 *
 * このプラグインは、プレイヤーや特定のイベントを中心に、
 * 画面をズームアップする演出を行えます。
 *
 * ■概要
 * 設定はプラグインコマンドで行います。
 * ズームアップするフレーム数を1にした場合、即座にズームアップされます。
 * またオフセットを設定することで、拡大の中心をその座標分移動可能です。
 *
 * ■注意
 * ズームを終了するときは必ず「ズーム終了」を呼び出してください。
 * これを忘れると、ピクチャの表示レイヤに不具合が起こります。
 *
 * ■ライセンス表記
 * このプラグインは MIT ライセンスで配布されます。
 * ご自由にお使いください。
 * http://opensource.org/licenses/mit-license.php
 */
import Plugin from "./ScreenZoom";
Plugin(globalThis as any);
