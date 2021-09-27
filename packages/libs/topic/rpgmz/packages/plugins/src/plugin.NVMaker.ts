/*:zh
 * @target MZ
 * @plugindesc メッセージウィンドウ表示時に立ち絵を表示します。
 * @author ルルの教会
 * @url https://nine-yusha.com/plugin-spicture/
 *
 * @help LL_StandingPicture.js
 *
 * メッセージ内に専用の制御文字を入力することで、
 * 立ち絵を表示できます。
 *
 * ※立ち絵IDに半角英数字とアンダースコア(_)が使用できるようになりました。
 *   lulu_smileのように[名前_表情名]と付けるとわかりやすいです。
 *
 * 専用制御文字:
 *   \FL[立ち絵ID]       立ち絵1を表示します。 【例】\FL[lulu_smile]
 *   \ML[モーション名]   立ち絵1のモーションを再生します。 【例】\ML[yes]
 *   \FR[立ち絵ID]      立ち絵2を表示します。
 *   \MR[モーション名]  立ち絵2のモーションを再生します。
 *   \FF[R]            立ち絵2にフォーカスを当てます。 (立ち絵1を暗く)
 *   \FF[L]             立ち絵1にフォーカスを当てます。 (立ち絵2を暗く)
 *
 * 立ち絵モーション一覧:
 *   yes(頷く)、yesyes(二回頷く)、no(横に揺れる)、noslow(ゆっくり横に揺れる)
 *   jump(跳ねる)、jumpjump(二回跳ねる)、jumploop(跳ね続ける)
 *   shake(ガクガク)、shakeloop(ガクガクし続ける)
 *   runleft(画面左へ走り去る)、runright(画面右へ走り去る)
 *
 * プラグインコマンド:
 *   立ち絵表示ON・OFF: 立ち絵の表示・非表示を一括制御します。 (初期値: ON)
 *   色調変更: 立ち絵の色調を変更します。
 *
 * 利用規約:
 *   ・著作権表記は必要ございません。
 *   ・利用するにあたり報告の必要は特にございません。
 *   ・商用・非商用問いません。
 *   ・R18作品にも使用制限はありません。
 *   ・ゲームに合わせて自由に改変していただいて問題ございません。
 *   ・プラグイン素材としての再配布（改変後含む）は禁止させていただきます。
 *
 * 作者: ルルの教会
 * 作成日: 2020/11/16
 *
 * @command callText
 * @text 展示文本
 * @desc 展示文本
 *
 * @arg textPath
 * @text 文本文件名
 * @desc 文件路径
 * @type file
 *
 * @command setAutoFocus
 * @text 设置自动焦点立绘
 * @desc 当立绘发言时，自动让暗化其它立绘
 *
 * @arg enabled
 * @text 设置自动焦点立绘(默认为True)
 * @desc 当立绘发言时，自动让暗化其它立绘
 * @default true
 * @type boolean
 *
 *
 * @command setEnabled
 * @text 立ち絵表示ON・OFF
 * @desc 立ち絵の表示・非表示を一括制御します。
 *
 * @arg enabled
 * @text 立ち絵表示
 * @desc OFFにすると立ち絵が表示されなくなります。
 * @default true
 * @type boolean
 *
 * @command setTone
 * @text 色調変更
 * @desc 立ち絵の色調を変更します。
 *
 * @arg toneR
 * @text 赤
 * @desc 色調のR成分です。 (-255～255)
 * @default 0
 * @type number
 * @min -255
 * @max 255
 *
 * @arg toneG
 * @text 緑
 * @desc 色調のG成分です。 (-255～255)
 * @default 0
 * @type number
 * @min -255
 * @max 255
 *
 * @arg toneB
 * @text 青
 * @desc 色調のB成分です。 (-255～255)
 * @default 0
 * @type number
 * @min -255
 * @max 255
 *
 * @arg toneC
 * @text グレー
 * @desc グレースケールの強さです。 (0～255)
 * @default 0
 * @type number
 * @min 0
 * @max 255
 *
 * @param autoFocus
 * @text 自动立绘焦点
 * @desc 当立绘发言时，自动让暗化其它立绘
 * @type boolean
 * @default true
 *
 * @param sPictures
 * @text 立ち絵リスト
 * @desc メッセージウィンドウに表示する立ち絵を定義します。
 * @default []
 * @type struct<sPictures>[]
 *
 * @param picture1Settings
 * @text 立ち絵1(\FL)の設定
 * @desc ※この項目は使用しません
 *
 * @param transition
 * @text 切替効果
 * @desc 出現・消去時の切替効果を指定します。
 * @type select
 * @default 1
 * @option なし
 * @value 0
 * @option フェード
 * @value 1
 * @option フロート左
 * @value 2
 * @option フロート右
 * @value 3
 * @option フロート下
 * @value 4
 * @option フロート上
 * @value 5
 * @parent picture1Settings
 *
 * @param foreFront
 * @text ウィンドウの前面に表示
 * @desc ONにするとメッセージウィンドウよりも前面に表示されます。
 * @type boolean
 * @default false
 * @parent picture1Settings
 *
 * @param picture2Settings
 * @text 立ち絵2(\FR)の設定
 * @desc ※この項目は使用しません
 *
 * @param transition2
 * @text 切替効果
 * @desc 出現・消去時の切替効果を指定します。
 * @type select
 * @default 1
 * @option なし
 * @value 0
 * @option フェード
 * @value 1
 * @option フロート左
 * @value 2
 * @option フロート右
 * @value 3
 * @option フロート下
 * @value 4
 * @option フロート上
 * @value 5
 * @parent picture2Settings
 *
 * @param foreFront2
 * @text ウィンドウの前面に表示
 * @desc ONにするとメッセージウィンドウよりも前面に表示されます。
 * @type boolean
 * @default false
 * @parent picture2Settings
 *
 * @param focusToneAdjust
 * @text フォーカス時の暗さ
 * @desc AA[s]でフォーカスを当てた時の暗さ(-255～0)です。
 * 暗くなりすぎる場合に調整してください。(初期値: -96)
 * @default -96
 * @min -255
 * @max 0
 * @type number
 */

/*~struct~sPictures:zh
 *
 * @param id
 * @text 立ち絵ID
 * @desc 立ち絵IDです。立ち絵を制御文字で呼び出す際に使用します。
 * 半角英数字(_)で入力してください。(例: lulu_smile)
 * @type string
 *
 * @param imageName
 * @text 画像ファイル名
 * @desc 立ち絵として表示する画像ファイルを選択してください。
 * @dir img/pictures
 * @type file
 * @require 1
 *
 * @param origin
 * @text 原点
 * @desc 立ち絵の原点です。
 * @default 0
 * @type select
 * @option 左上
 * @value 0
 * @option 中央
 * @value 1
 *
 * @param x
 * @text X座標 (立ち絵1)
 * @desc 立ち絵1(F)で呼び出された時の表示位置(X)です。
 * @default 464
 * @min -2000
 * @max 2000
 * @type number
 *
 * @param y
 * @text Y座標 (立ち絵1)
 * @desc 立ち絵1(F)で呼び出された時の表示位置(Y)です。
 * @default 96
 * @min -2000
 * @max 2000
 * @type number
 *
 * @param x2
 * @text X座標 (立ち絵2)
 * @desc 立ち絵2(FR)で呼び出された時の表示位置(X)です。
 * @default 20
 * @min -2000
 * @max 2000
 * @type number
 *
 * @param y2
 * @text Y座標 (立ち絵2)
 * @desc 立ち絵2(FR)で呼び出された時の表示位置(Y)です。
 * @default 96
 * @min -2000
 * @max 2000
 * @type number
 *
 * @param reverse
 * @text 立ち絵2の左右反転
 * @desc 立ち絵2(FR)で呼び出された時の表示方法です。
 * @default 1
 * @type select
 * @option 左右反転しない
 * @value 1
 * @option 左右反転する
 * @value -1
 *
 * @param scaleX
 * @text X拡大率
 * @desc 立ち絵の拡大率(X)です。
 * @default 100
 * @min -2000
 * @max 2000
 * @type number
 *
 * @param scaleY
 * @text Y拡大率
 * @desc 立ち絵の拡大率(Y)です。
 * @default 100
 * @min -2000
 * @max 2000
 * @type number
 *
 * @param opacity
 * @text 不透明度
 * @desc 立ち絵の不透明度(0～255)です。
 * @default 255
 * @type number
 * @min 0
 * @max 255
 *
 * @param blendMode
 * @text 合成方法
 * @desc 立ち絵の合成方法です。
 * @default 0
 * @type select
 * @option 通常
 * @value 0
 * @option 加算
 * @value 1
 * @option 除算
 * @value 2
 * @option スクリーン
 * @value 3
 */
import Plugin from "./NVMaker";
Plugin(globalThis as any);
