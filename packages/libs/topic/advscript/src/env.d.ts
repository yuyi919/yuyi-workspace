declare interface KagTagPlugin<Param> {
  vital?: keyof Param | false;
  pm: Param;
  start(this: { kag: ITyrano }, pm: Param): any;
  kag: ITyrano["kag"];
}

declare var TYRANO: ITyrano;
declare interface ITyrano {
  kag: {
    config: Record<string, any>;
    ftag: {
      array_tag: { line: number; name: string; pm: Record<string, any>; value: string }[];
      current_order_index: number;
      nextOrder: () => void;
      kag: ITyrano["kag"];
      master_tag?: Record<string, KagTagPlugin<any>>;
      startTag(tagName: string, pm: Record<string, any>);
    };
    parser: {
      kag: ITyrano["kag"];
    };
    stat: ITyranoStat;
    layer: {
      getLayer(layername: string, page?: string);
    };
  };
}

type DefaultRecord = {
  "": string;
  false: "false" | "true";
  true: "false" | "true";
};
type PickDefault<T, D = {}> = {
  [K in keyof T]: UnknownOr<
    T[K] extends keyof DefaultRecord ? DefaultRecord[T[K]] : never,
    K extends keyof D
      ? D[K]
      : T[K] extends number
      ? number
      : T[K] extends string
      ? string
      : T[K] extends boolean
      ? boolean
      : keyof T[K] extends never
      ? Record<string, any>
      : keyof T[K] extends string
      ? PickDefault<T[K], D[K]>
      : never
  >;
};

type UnknownOr<T, E> = [T] extends [never] ? E : T;
type B = UnknownOr<never, 1>;

type O = PickDefault<TyranoCoreStatic>;
type TyranoCoreStatic = {
  map_label: {}; //ラベル情報保持
  map_macro: {}; //マクロの情報保持

  vertical: "false"; //縦書き

  f: {}; //ゲーム変数はstatの中
  mp: {}; //マクロもstat

  current_layer: "message0"; //現在のメッセージレイヤ
  current_page: "fore";
  is_stop: false; //停止中。クリックしても先に進ませない
  is_wait: false; //wait中。
  is_trans: false; //trans中

  is_wait_anim: false; //[wa]中

  is_strong_stop: false; // [s]タグで立ち止まってる状態。強力な停止中。解除するにはジャンプやマクロが呼び出せれる
  strong_stop_recover_index: 0; //[s]タグ指定中に保存した場合、戻ってくるindex [_s]時のindexを保持しておく

  is_nowait: false; //ノーウェイト、テキスト瞬間表示状態

  current_message_str: "ゲームスタート"; //現在表示中のメッセージ
  current_save_str: ""; //セーブの時に使用するメッセージ

  current_keyframe: ""; //キーフレームの名前、スタートしている場合はキーフレーム名が入る
  map_keyframe: {}; //キーフレームアニメーション情報を登録

  is_script: false; //スクリプト解析中。
  buff_script: ""; //スクリプトを格納しておく

  is_html: false; //htmlタグ解析中
  map_html: {}; //htmlタグに関するステータス

  cssload: {}; //読み込んだCSSを保持する

  save_img: ""; //セーブイメージ。ここにパスが入っている場合はその画像をサムネに使う。

  stack: { if: []; call: []; macro: [] }; //if文のスタック

  set_text_span: false; //メッセージ中のspanを新しく作成するときに真にする
  current_scenario: "first.ks"; //シナリオファイルを指定する
  is_skip: false;
  is_auto: false;
  current_bgm: ""; //現在再生中のBGM
  current_bgm_vol: ""; //現在再生中のBGMボリューム
  current_bgm_html5: "false"; //現在再生中のhtml5パラメータ

  current_se: {}; //現在再生中のループ効果音

  load_auto_next: false; // ロード時にオートネクストするかどうか。showsave周りのときtrueになる。

  current_bgcamera: ""; //bgcamerの有効性

  enable_keyconfig: true; //キーコンフィグが有効 or 無効

  current_bgmovie: {
    storage: "";
    volume: "";
  }; //再生中の背景動画

  current_camera: {};
  current_camera_layer: "";

  is_move_camera: false; //カメラの演出中かどうか
  is_wait_camera: false; //カメラの演出を待ってるかどうか

  current_line: 0; //実行中の命令の実際のファイル行　エラーや警告時に使用

  is_hide_message: false; //メッセージエリアが非表示状態か否か

  is_click_text: false; //テキストメッセージがクリックされた常態化否か
  is_adding_text: false; //テキストメッセージを追加中か否か

  flag_ref_page: false; //このフラグが立っている場合、次のクリックで画面がクリアされます。

  ruby_str: ""; //ここに文字列が入っている場合は、次の１文字出力時にルビとして適応する

  mark: 0; //マーカーを引いてるときはここに1 が入る。 マーカー終了まちは2
  style_mark: ""; //マーカーのスタイルをテキストでもつ。

  ch_speed: ""; //文字表示スピード

  skip_link: "true"; //選択肢のあと、スキップを継続するかどうか。

  log_join: "false"; //特定のタグの時に、ログが分裂しないようにするため。trueなら前のログに連結させる
  log_clear: false; // p cm などの文字クリアの時は、強制的に次のログ追加をjoinではなく、addにする

  f_chara_ptext: "false";

  flag_glyph: "false"; //クリック待ちボタンが指定されているか否か
  path_glyph: "nextpage.gif"; //glyph画像ファイル名

  current_cursor: "auto"; //現在のカーソル指定

  //表示フォント指定
  font: {
    enable: false;
    color: "";
    bold: "";
    size: "";
    face: "";
    italic: "";
    effect: "";
    effect_speed: "0.2s";
  };

  //qr系の設定
  qr: {
    mode: "off";
    define: {};
  };

  //表示位置調整
  locate: {
    x: 0;
    y: 0;
  };

  //リセットされた時に適応されるオリジナルフォント設定
  default_font: {
    color: "";
    bold: "";
    size: "";
    face: "";
    italic: "";
    edge: "";
    shadow: "";
    effect: "";
    effect_speed: "";
  };

  //ふきだしで使用するパラメータ郡
  fuki: {
    def_style: {}; //ポジションで指定されたスタイルを保持する
    def_style_inner: {};
    def_pm: {}; //positionで指定されたパラメータを保持する
    active: false;
    marginr: 0;
    marginb: 0;

    others_style: {};
  };

  //システム系で使用するHTMLの場所を保持
  sysview: {
    save: "./tyrano/html/save.html";
    load: "./tyrano/html/load.html";
    backlog: "./tyrano/html/backlog.html";
    menu: "./tyrano/html/menu.html";
  };

  /*** キャラクター操作系 ***/
  //キャラクターの立ち位置を自動的に調整する事ができます
  chara_pos_mode: "true";
  chara_effect: "swing";
  chara_ptext: "";
  chara_time: "600";
  chara_memory: "false";
  chara_anim: "true"; //キャラクター追加時、位置が変わる場合にアニメーションで表示するか否か
  pos_change_time: "600"; //キャラクター自動配置のスピード

  chara_talk_focus: "none";
  chara_brightness_value: "60";
  chara_blur_value: "2";

  chara_talk_anim: "none"; //キャラクターが話す時にアニメーションするかどうか
  chara_talk_anim_time: 230;
  chara_talk_anim_value: 30;

  apply_filter_str: "";

  video_stack: null;
  is_wait_bgmovie: false;

  //定義されたキャラクター情報
  charas: {};
  jcharas: {};

  play_bgm: true; //BGMを再生するか否か
  play_se: true; //SEを再生するか否か

  play_speak: false; // 読み上げを行うか否か

  map_se_volume: {}; //セーブスロットごとにボリューム値を保持できる
  map_bgm_volume: {}; // 同上

  //ボイス周りの設定 vocoinfig
  map_vo: {
    vobuf: {}; //ボイスとして指定するplayseのbuf
    vochara: {}; //キャラ毎にボイスの設定が入る。
  };
  vostart: false; //vo管理が有効か否か

  log_write: true; //バックログを記録するか否か

  buff_label_name: ""; //ラベル管理のもの、通過時にここに配置されて次にlabelに到達した時に記録される

  already_read: false; //現在の場所が既読済みか否かを保持する。ラベル通過時に判定

  visible_menu_button: false; //メニューボタンの表示状態

  resizecall: {
    storage: "";
    target: "";
  };

  vchat: {
    is_active: false;
    chara_name_color: "0x70c7ff"; //キャラネーム欄の色
    max_log_count: 200; //最大ログ数。200を超えると削除されていく
    charas: {}; //キャラ一覧
  };

  title: ""; //ゲームのタイトル
};

interface ITyranoStat extends PickDefault<TyranoCoreStatic> {
  kag: ITyrano["kag"];
  [key: string]: any;
}

interface JQueryStatic {
  loadText(file_path: string, callback: (text: string) => any);

  /**
   * 透明度を適切な値に変更
   * @param val 0-255
   * @return 0-1
   */
  convertOpacity(val: number): number;
}
