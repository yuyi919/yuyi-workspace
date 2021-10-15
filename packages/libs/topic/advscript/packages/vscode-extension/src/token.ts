/* eslint-disable @typescript-eslint/ban-types */
export function create_token(
  text?: string,
  cursor?: number,
  line?: number,
  new_line_length?: number,
  type?: string
) {
  const t: token = {
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
    is: function (...args: string[]) {
      return args.indexOf(this.type) !== -1;
    },
    is_dialogue: function () {
      return this.is("character", "parenthetical", "dialogue");
    },
    name: function () {
      let character = this.text;
      const p = character.indexOf("(");
      if (p !== -1) {
        character = character.substring(0, p);
      }
      character = character.trim();
      return character;
    },
    location: function () {
      let location = this.text.trim();
      location = location.replace(/^(INT\.?\/EXT\.?)|(I\/E)|(INT\.?)|(EXT\.?)/, "");
      const dash = location.lastIndexOf(" - ");
      if (dash !== -1) {
        location = location.substring(0, dash);
      }
      return location.trim();
    },
    has_scene_time: function (time: any) {
      const suffix = this.text.substring(this.text.indexOf(" - "));
      return this.is("scene_heading") && suffix.indexOf(time) !== -1;
    },
    location_type: function () {
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
  if (text) t.end = cursor + text.length - 1 + new_line_length;
  return t;
}
export interface token {
  text: string;
  type: string;
  start: number;
  end: number;
  line: number;
  number: string;
  dual: string;
  html: string;
  level: number;
  time: number;
  takeNumber: number;
  is: Function;
  is_dialogue: Function;
  name: Function;
  location: Function;
  has_scene_time: Function;
  location_type: Function;
  character: string;
  ignore: boolean;
}
