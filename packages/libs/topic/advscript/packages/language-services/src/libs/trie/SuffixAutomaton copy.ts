/* eslint-disable no-self-assign */
/* eslint-disable no-inner-declarations */
/* eslint-disable no-empty */
export interface IState {
  len: number;
  link: number;
  endpos: number;
  char?: string;
  /**
   * 状态id(即 状态在整个自动机中的索引，S=0，以后类推)
   */
  id: number;
  /**
   * 状态转移函数
   */
  next: Record<string, number>;
  // par = [] as number[];
  charId: number;
  group?: number;
}

export type SearchPieces = string | string[];

const prop = {
  get len() {
    return this.root.len[this.id];
  },
  get link() {
    return this.root.link[this.id];
  },
  set link(v) {
    this.root.link[this.id] = v;
  },
  get endpos() {
    return this.root.endpos[this.id];
  },
  get charId() {
    return this.root.charId[this.id];
  },
  // get char() {
  //   // const code = this.root.char[this.id]
  //   return ""// code > -1 ? String.fromCharCode(code) : '';
  // },
  // get next() {
  //   return this.root.next[this.id];
  // },
  // set next(next) {
  //   this.root.next[this.id] = next;
  // },
};

export class SuffixAutomaton {
  static build(str: SearchPieces, size?: number) {
    const atm = new SuffixAutomaton(size ?? ~~(str.length * 2));
    const states = atm.insertPiece(str);
    // console.log(atm);
    return atm;
  }

  static buildList(pieces: SearchPieces[], size?: number) {
    const atm = new SuffixAutomaton(size);
    atm.insertPieces(pieces);
    // console.log(atm);
    return atm;
  }

  static buildRd(states: IState[]) {
    const rd = Array(states.length) as number[][];
    let i = 0;
    // 从S节点之后开始遍历
    while (++i < states.length) {
      const link = states[i].link;
      const linkFrom = rd[link];
      if (linkFrom) {
        linkFrom[linkFrom.length] = i;
      } else {
        rd[link] = [i];
      }
    }
    return rd;
  }

  constructor(public space?: number) {
    if (typeof space === "number") {
      this.states = [];
      this.link = new Int32Array(space).fill(-1);
      this.endpos = new Int32Array(space).fill(-1);
      this.len = new Int32Array(space).fill(-1);
      this.group = new Int32Array(space).fill(-1);
      this.charId = new Int32Array(space).fill(-1);
      // this.char = new Int32Array(space).fill(-1);
      // this.next = [];
      this.pushState(0, -1, -1, {}, "", -1);
      console.log("use space", space);
    } else {
      this.link = [-1];
      this.endpos = [-1];
      this.charId = [-1];
      this.len = [0];
      this.group = [0];
      // this.char = [-1];
      this.states = [this.createState(0, "", {})];
      // this.next = [{}];
    }
  }

  link: RelativeIndexable<number>;
  endpos: RelativeIndexable<number>;
  len: RelativeIndexable<number>;
  charId: RelativeIndexable<number>;
  group: RelativeIndexable<number>;
  char: RelativeIndexable<number>;
  // next: RelativeIndexable<Record<string, number>>;

  public pushState(
    len: number,
    endpos: number,
    link: number,
    next: Record<string, number>,
    char: string,
    charId: number
  ): IState {
    const states = this.states,
      id = states.length;
    this.link[id] = link;
    this.len[id] = len;
    this.endpos[id] = endpos;
    this.charId[id] = charId;
    // this.next[id] = next;
    // this.char[id] = char ? char.charCodeAt(0) : -1
    this.group[id] = this.cursorGroupIndex;
    return (states[id] = {
      id,
      root: this,
      // char: char.charCodeAt(0),
      // len,
      // link,
      // endpos,
      // charId,
      // group: this.cursorGroupIndex,
      next,
      __proto__: prop,
    } as unknown as IState);
    // prop
  }

  states: IState[];
  lastStateId: number = 0;
  cursorGroupIndex?: number | null;

  private createState(id: number, char: string, next: Record<string, number>): IState {
    return Object.setPrototypeOf(
      {
        id,
        char,
        root: this,
        // len,
        // link,
        // endpos,
        // charId,
        // group: this.cursorGroupIndex,
        next,
      },
      prop
    );
  }

  insertPieces(pieces: SearchPieces[]) {
    let group = -1;
    while (++group < pieces.length) {
      this.lastStateId = 0;
      this.cursorGroupIndex = group;
      this.insertPiece(pieces[group]);
    }
    this.cursorGroupIndex = null;
    return this.states;
  }
  insertPiece(piece: SearchPieces) {
    let charId = -1;
    while (++charId < piece.length) {
      const char = piece[charId];
      this.lastStateId = this.insertChar(charId, char);
    }
    return this.states;
  }

  /**
   * NOTE
   * 拆分nextState，将
   * `forwardState.len < prevState.len + 1`
   * 的部分[clone]出来
   */
  cloneState(prevState: IState, charId: number, char?: string) {
    const forwardLen = prevState.len + 1,
      forwardStateId = prevState.next[char],
      forwardState = this.states[forwardStateId];
    if (forwardLen === forwardState.len) {
      return forwardStateId;
    }
    const clone = this.pushState(
      forwardLen,
      -1,
      forwardState.link,
      { ...forwardState.next },
      char,
      charId
    );
    const cloneId = (forwardState.link = clone.id);
    this.doStateShift(prevState.id, forwardState.id, cloneId, char);
    return cloneId;
  }

  public insertChar(charId: number, char?: string) {
    const lastId = this.lastStateId,
      lastState = this.states[lastId];
    // NOTE 特判
    if (lastState.next[char] > -1) {
      return this.cloneState(lastState, charId, char);
    }
    const prevLen = lastState.len,
      currState = this.pushState(prevLen + 1, prevLen, 0, {}, char, charId),
      prevState = this.resolvePrevStateWithLink(lastId, currState.id, char);
    currState.link = prevState ? this.cloneState(prevState, charId, char) : 0;
    return currState.id;
  }

  public insertChar2(charId: number, char?: string) {
    const states = this.states;
    const lastState = states[this.lastStateId];
    // NOTE 特判1
    if (lastState.next[char] > -1 && lastState.len + 1 == states[lastState.next[char]].len)
      return lastState.next[char];
    const prevLen = lastState.len;
    const currentState = this.pushState(prevLen + 1, prevLen, 0, {}, char, charId);
    const prevState = this.resolvePrevStateWithLink(lastState.id, currentState.id, char);
    if (!prevState) {
      currentState.link = 0;
    } else {
      const prevId = prevState.id,
        forwardLen = prevState.len + 1,
        nextId = states[prevId].next[char], //states[prevId].next[char],
        nextState = states[nextId];
      /**
       * NOTE
       * 需要拆分nextState，将
       * ```typescript
       *  nextState.len < prevLinkState.len + 1
       * ```
       * 的部分[clone]出来
       */
      if (forwardLen === nextState.len) {
        currentState.link = nextId;
      } else {
        // let flag = 0;
        // if (forwardLen === currentState.len) flag = 1; // NOTE 特判2，直接写在返回值上
        const clone = this.pushState(
          forwardLen,
          -1,
          nextState.link,
          { ...nextState.next },
          char,
          charId
        );
        const cloneId = (currentState.link = nextState.link = clone.id);
        this.doStateShift(prevId, nextId, cloneId, char);
        return forwardLen === currentState.len ? cloneId : currentState.id;
        /**
         * NOTE 注意返回值
         * 返回值为char插入到SAM中的节点编号（即 [currentState.id]），
         * 如果char不是某个字符串的最后一个字符，那么这次返回值将作为下一次插入时的last
         */
      }
    }
    return currentState.id;
  }

  doStateShift(pos: number, targetId: number, cloneId: number, char: string) {
    const states = this.states;
    for (
      let state = states[pos];
      state && state.next[char] === targetId;
      state = states[state.link] // 更新state缓存
    )
      state.next[char] = cloneId;
  }

  /**
   * 一边查找一边更新next为currPos
   * @param startId
   * @param currId
   * @param char
   */
  resolvePrevStateWithLink(startId: number, currId: number, char: string) {
    const states = this.states;
    let state: IState = states[startId];
    for (
      ;
      state && !(state.next[char] > -1); // NOTE: 在js中next[char]可能为undefined，所以改成!(>)
      state = states[state.link] // 更新state缓存
    )
      state.next[char] = currId;
    return state;
  }

  // findNextId(index: number, char: string) {
  //   const states = this.states,
  //     id = states[index].next[char];
  //   return id != null ? id : -1;
  // }
  // findNext(index: number, char: string) {
  //   const states = this.states,
  //     id = states[index].next[char];
  //   return id > -1 ? states[id] : undefined;
  // }

  // hasNextState(index: number, char: string) {
  //   return this.states[index].next[char] > -1;
  // }
}
