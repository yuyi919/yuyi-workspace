/* eslint-disable @typescript-eslint/ban-types */
const PROTO: SuperToken = {
  is(...args: TokenType[]) {
    return args.indexOf(this.type) !== -1;
  },
  is_dialogue() {
    return (this as token).is(TokenType.character, TokenType.dialogue, TokenType.parenthetical);
  },
  name() {
    let character = this.text;
    const p = character.indexOf("(");
    if (p !== -1) {
      character = character.substring(0, p);
    }
    character = character.trim();
    return character;
  },
  location() {
    let location = this.text.trim();
    location = location.replace(/^(INT\.?\/EXT\.?)|(I\/E)|(INT\.?)|(EXT\.?)/, "");
    const dash = location.lastIndexOf(" - ");
    if (dash !== -1) {
      location = location.substring(0, dash);
    }
    return location.trim();
  },
  has_scene_time(time: any) {
    const suffix = this.text.substring(this.text.indexOf(" - "));
    return this.is("scene_heading") && suffix.indexOf(time) !== -1;
  },
  location_type() {
    const location = this.text.trim();
    if (/^I(NT.?)?\/E(XT.?)?/.test(location)) {
      return "mixed";
    } else if (/^INT.?/.test(location)) {
      return "int";
    } else if (/^EXT.?/.test(location)) {
      return "ext";
    }
    return "other";
  },
};
export function create_token<T extends TokenType>(
  text?: string,
  cursor?: number,
  line?: number,
  new_line_length?: number,
  type?: T
) {
  const token: token = {
    text: text,
    type: type,
    start: cursor,
    end: cursor,
    line: line,
    ignore: false,
    number: undefined,
    dual: undefined,
    html: undefined,
    level: undefined,
    time: undefined,
    character: undefined,
    takeNumber: -1,
    ...({} as typeof PROTO),
  };
  Object.setPrototypeOf(token, PROTO);
  if (text) token.end = cursor + text.length - 1 + new_line_length;
  return token;
}
export interface SuperToken {
  is<T extends TokenType>(...args: T[]): this is token<T>;
  is_dialogue: () => this is token<
    TokenType.character | TokenType.dialogue | TokenType.parenthetical
  >;
  name(): any;
  location(): any;
  has_scene_time(time: any): boolean;
  location_type(): "mixed" | "int" | "ext" | "other";
}
export interface token<T extends TokenType = TokenType> extends SuperToken {
  text: string;
  type: T;
  start: number;
  end: number;
  line: number;
  number: string;
  dual: string;
  html: string;
  level: number;
  time: number;
  takeNumber: number;
  character: string;
  ignore: boolean;
}

export enum TokenType {
  character,
  parenthetical,
  dialogue,

  separator,
  dialogue_end,
  dual_dialogue_end,

  action,
  centered,
  transition,

  synopsis,
  section,
  page_break,
  dual_dialogue_begin,
  dialogue_begin,
  lyric,
  scene_heading,
  title,
  credit,
  source,
  authors,
  author,
  notes,
  draft_date,
  revision,
  date,
  contact,
  contact_info,
  copyright,
  boneyard_begin,
  boneyard_end,
  note,
}
// const t = create_token("a", 0, 0, 0, TokenType.character);
// if (t.is(TokenType.dialogue, TokenType.character)) {
//   t.type;
// }
