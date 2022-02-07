/* eslint-disable no-constant-condition */
/* eslint-disable no-prototype-builtins */
import { SuffixAutomatonReader } from "./Reader";
// import { str2Utf16LE, utf16LE2Str } from "../hexUtil";

/* eslint-disable no-self-assign */
/* eslint-disable no-inner-declarations */
/* eslint-disable no-empty */
export const enum $ {
  id,
  len,
  endpos,
  link,
  charId,
  charSourcePos,
  group,
  next,
}

function State(
  id: number,
  len: number,
  endpos: number,
  link: number,
  charId: number,
  charSourcePos: number,
  group: number,
  next: number[],
  map?: string[]
) {
  return map
    ? Object.defineProperties(
        [id, len, endpos, link, charId, charSourcePos, group, next] as IState,
        {
          view: {
            get() {
              return viewState(this, map);
            },
          },
        }
      )
    : ([id, len, endpos, link, charId, charSourcePos, group, next] as IState);
}

export function viewState(state: IState, atm: SuffixAutomaton | string[]) {
  const map = atm instanceof Array ? atm : atm.charsetView;
  return {
    id: state[$.id],
    len: state[$.len],
    endpos: state[$.endpos],
    link: state[$.link],
    charId: map?.[state[$.charId]] ?? state[$.charId],
    charSourcePos: state[$.charSourcePos],
    group: state[$.group],
    next: map ? state[$.next].reduce((r, v, i) => ({ ...r, [map[i]]: v }), {}) : state[$.next],
  };
}

export type IState = [
  /**
   * 状态id(即 状态在整个自动机中的索引，S=0，以后类推)
   */
  id: number,
  len: number,
  endpos: number,
  link: number,
  charId: number,
  charSourcePos: number,
  group: number,
  /**
   * 状态转移函数
   */
  next: number[]
];

export type SearchPieces = string | string[];

type PiecesGenerator = Generator<{
  id: number;
  char: string;
  group?: number | string;
}>;

export class SuffixAutomaton {
  static build(pieces: SearchPieces, wrapper?: (item: string) => string): SuffixAutomaton;
  static build<T>(pieces: T[], wrapper: (item: T) => string): SuffixAutomaton;
  static build(pieces: SearchPieces, wrapper?: (item: string) => string) {
    const atm = new SuffixAutomaton();
    atm.insertNextPiece(pieces, wrapper);
    return atm;
  }
  static buildList(pieces: SearchPieces[], wrapper?: (item: string) => string): SuffixAutomaton;
  static buildList<T>(pieces: T[][], wrapper: (item: T) => string): SuffixAutomaton;
  static buildList(pieces: SearchPieces[], wrapper?: (item: string) => string) {
    const atm = new SuffixAutomaton();
    atm.insertPieces(pieces, wrapper);
    return atm;
  }
  static buildWithGenerator(pieces: PiecesGenerator) {
    const atm = new SuffixAutomaton();
    atm.insertWithGenerator(pieces);
    return atm;
  }
  static buildRd(states: IState[]) {
    const rd = Array<number[]>(states.length);
    let i = 0;
    // 从S节点之后开始遍历
    while (++i < states.length) {
      const link = states[i][$.link];
      const linkFrom = rd[link];
      if (linkFrom) {[]
        linkFrom[linkFrom.length] = i;
      } else {
        rd[link] = [i];
      }
    }
    return rd;
  }

  constructor() {
    this.pushState(0, -1, -1, 0, -1, [-1]);
  }

  public pushState(
    len: number,
    endpos: number,
    link: number,
    charId: number,
    charSourcePos: number,
    next: number[]
  ): IState {
    const { states, group } = this,
      id = states.length++;
    return (states[id] = State(id, len, endpos, link, charId, charSourcePos, group, next, this.charsetView));
  }
  public charset: Record<string, number> = Object.create(null, { "": { value: 0 } });
  public charsetView = [""];
  public charGroupset: Record<string, number> = Object.create(null, { "": { value: 0 } });
  protected charsetLen = 0;
  protected charGroupsetLen = 0;

  static test(count = 100000) {
    const input = new Array(count)
      .fill("0")
      .map(() => Math.random() + "")
      .join("");
    console.log(input.length);
    console.time("create atm");
    const atm = this.build(input);
    console.timeEnd("create atm");
    console.log(atm.charset, atm.states.length);
    const encoded = atm.encode();
    if (count < 100) {
      return {
        input,
        atm,
        encoded,
        get decoded() {
          return SuffixAutomatonReader.readBinary(encoded);
        },
      };
    }
  }

  static readBinary(str: string) {
    return SuffixAutomatonReader.readBinary(str);
  }
  encode() {
    return SuffixAutomatonReader.encode(this);
  }

  states = [] as IState[];
  lastStateId: number = 0;
  group: number = 0;

  insertPieces(pieces: SearchPieces[], wrapper?: (item: string) => string): IState[];
  insertPieces<T>(pieces: T[][], wrapper: (item: T) => string): IState[];
  insertPieces(pieces: SearchPieces[], wrapper?: (item: string) => string) {
    let group = -1;
    while (++group < pieces.length) {
      this.group = group;
      this.lastStateId = 0;
      this.insertNextPiece(pieces[group], wrapper);
    }
    this.group = 0;
    return this.states;
  }

  insertNextGroup(piece: SearchPieces, wrapper?: (item: string) => string): IState[];
  insertNextGroup<T>(piece: T[], wrapper: (item: T) => string): IState[];
  insertNextGroup(piece: SearchPieces, wrapper?: (item: string) => string, group?: number) {
    if (group != null) {
      this.group = group;
    } else if (typeof this.group === "number") {
      this.group++;
    }
    return this.insertNextPiece(piece, wrapper);
  }

  insertNextPiece(piece: SearchPieces, wrapper?: (item: string) => string): IState[];
  insertNextPiece<T>(piece: T[], wrapper: (item: T) => string): IState[];
  insertNextPiece(piece: SearchPieces, wrapper?: (item: string) => string) {
    let charSourcePos = -1;
    while (++charSourcePos < piece.length) {
      const char = piece[charSourcePos];
      const warpChar = wrapper ? wrapper(char) : char;
      const charId = warpChar
        ? this.charset[warpChar] || (this.charset[warpChar] = ++this.charsetLen)
        : 0;
      this.lastStateId = this.insertChar(charSourcePos, charId);
      this.charsetView[charId] = char;
    }
    return this.states;
  }

  insertWithGenerator(pieces: PiecesGenerator) {
    this.group = -1;
    let _group: any;
    for (const { id, char, group } of pieces) {
      if (group !== _group) {
        this.lastStateId = 0;
        _group = group;
        this.group =
          this.charGroupset[group] || (this.charGroupset[group] = ++this.charGroupsetLen);
      }
      this.lastStateId = this.insertChar(
        id,
        char ? this.charset[char] || (this.charset[char] = ++this.charsetLen) : 0
      );
    }
    this.group = -1;
    return this.states;
  }

  /**
   * NOTE
   * 拆分nextState，将
   * `forwardState.len < prevState.len + 1`
   * 的部分[clone]出来
   */
  cloneState(prevState: IState, charSourcePos: number, charId?: number) {
    const forwardLen = prevState[$.len] + 1,
      forwardStateId = prevState[$.next][charId],
      forwardState = this.states[forwardStateId];
    if (forwardLen === forwardState[$.len]) {
      return forwardStateId;
    }
    const clone = this.pushState(forwardLen, -1, forwardState[$.link], charId, charSourcePos, [
      ...forwardState[$.next],
    ]);
    const cloneId = (forwardState[$.link] = clone[$.id]);
    this.doStateShift(prevState[$.id], forwardState[$.id], cloneId, charId);
    return cloneId;
  }

  public insertChar(charSourcePos: number, charId?: number) {
    const lastId = this.lastStateId,
      lastState = this.states[lastId];
    // // NOTE 特判
    // if (lastState[Id.next][charId] > -1) {
    //   return this.cloneState(lastState, charSourcePos, charId);
    // }
    const prevLen = lastState[$.len],
      currState = this.pushState(prevLen + 1, prevLen, 0, charId, charSourcePos, [-1]),
      prevState = this.resolvePrevStateWithLink(lastId, currState[$.id], charId);
    currState[$.link] = prevState ? this.cloneState(prevState, charSourcePos, charId) : 0;
    return currState[$.id];
  }

  doStateShift(pos: number, targetId: number, cloneId: number, charId: number) {
    const states = this.states;
    for (
      let state = states[pos];
      state && state[$.next][charId] === targetId;
      state = states[state[$.link]] // 更新state缓存
    )
      state[$.next][charId] = cloneId;
  }

  /**
   * 一边查找一边更新next为currPos
   * @param startId
   * @param currId
   * @param charId
   */
  resolvePrevStateWithLink(startId: number, currId: number, charId: number) {
    const states = this.states;
    let state: IState = states[startId];
    for (
      ;
      state && !(state[$.next][charId] > -1); // NOTE: 在js中next[charId]可能为undefined，所以改成!(>)
      state = states[state[$.link]] // 更新state缓存
    )
      state[$.next][charId] = currId;
    return state;
  }
}
