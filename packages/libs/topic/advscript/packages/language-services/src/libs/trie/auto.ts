/* eslint-disable no-self-assign */
/* eslint-disable no-inner-declarations */
/* eslint-disable no-empty */
import { IState, SearchPieces, SuffixAutomaton, $ } from "./SuffixAutomaton";

type SearchResult = {
  text: SearchPieces;
  start: number;
  end: number;
  sourceEnd: number;
  sourceStart: number;
  length: number;
  best: number;
};

export class SuffixAutomatonRunner {
  // // random tests
  public main2() {
    const s1 = ["[", "ID", "Space", "Param", "]"]; //,this.getRandomString(nextInt(10));
    const s2 = ["ID", "Space", "Param", "]"]; // this.getRandomString(nextInt(10));
    console.log(s1, s2);
    console.time("lcs");
    const res1 = this.lcs(s1, s2, 0);
    console.timeEnd("lcs");
    console.time("slowLcs");
    const res2 = this.slowLcs(s1, s2);
    console.timeEnd("slowLcs");
    console.log(res1, res2, this.occurrences(s1, s2));
    if (res1 && res1.length !== res2) throw new Error();
    console.log(this.multipleLcs(s1, s2));
  }

  public main() {
    const s1 = [
      ["[", "ID", "Space", "Param", "]"],
      ["[", "WS", "ID", "Space", "]"],
    ]; //["[", "ID", "Space", "Param", "]"]; //,this.getRandomString(nextInt(10));
    const s2 = ["ID", "Space"]; ////["ID", "Space", "Param", "]"]; // this.getRandomString(nextInt(10));
    console.log(s1, s2);
    console.time("lcs");
    const res1 = this.multLcs(s1, s2, 0);
    console.timeEnd("lcs");
    console.time("slowLcs");
    const res2 = this.multSlowLcs(s1, s2);
    console.timeEnd("slowLcs");
    console.log(res1, res2);
    console.log(this.multOccurrences(s1, s2));
  }

  *searchLinkRoot(states: IState[], start: number) {
    let linkTo = start;
    while (linkTo !== 0 && states[linkTo]) {
      yield states[linkTo];
      linkTo = states[linkTo][$.link];
    }
  }

  test() {
    const arr = new Array(100)
      .fill("0")
      .map(() => Math.random() + "")
      .join("");
    const sub = new Array(100)
      .fill("0")
      .map(() => Math.random() + "")
      .join("");
    console.log(arr.length, sub.length);
    // console.time("create atm");
    // const atm = this.buildSuffixAutomaton(arr);
    // console.timeEnd("create atm");
    console.time("lcs");
    const r1 = this.lcs(arr, sub);
    console.timeEnd("lcs");
    console.log(r1.slice(0, 100));
    console.time("slowLcs");
    const r2 = this.findLongestCommonStr(arr, sub);
    console.timeEnd("slowLcs");
    // if (r1.length !== r2) throw Error(r1 + ":" + r2);
    console.log(r2);
  }
  slowLcs(a: SearchPieces, b: SearchPieces): number {
    const lcs = Array<number[]>(a.length)
      .fill(null)
      .map(() => Array<number>(b.length).fill(0));
    let res = 0;
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < b.length; j++) {
        if (a[i] === b[j]) lcs[i][j] = 1 + (i > 0 && j > 0 ? lcs[i - 1][j - 1] : 0);
        res = Math.max(res, lcs[i][j]);
      }
    }
    return res;
  }
  findLongestCommonStr(s1, s2) {
    let commonStr = "";
    const L1 = s1.length,
      L2 = s2.length;
    // 比较s1,s2的长度，看谁长谁短
    const shortStr = L1 > L2 ? s2 : s1;
    const longStr = L1 > L2 ? s1 : s2;
    // 短的字符串的长度
    const strLen = shortStr.length;

    // 遍历短的字符串，从大到小递减
    for (let j = strLen; j > 0; j--) {
      // 不同的长度有总共有i个可能，从做到右遍历
      for (let i = 0; i <= strLen - j; i++) {
        // 截取出短字符串的部分字符串
        commonStr = shortStr.substr(i, j);
        // 为了便于观测运行的过程，打印看一下会直观很多
        // console.log("commonStr:", commonStr, "i:", i, "j:", j);

        // 放在长字符串里看看有没有匹配的，如果有直接返回
        if (longStr.indexOf(commonStr) >= 0) return commonStr;
      }
    }
    // 没有的话返回空字符串
    return "";
  }
  _lcs(atm: SuffixAutomaton, b: SearchPieces, startIndex = 0): SearchResult {
    const stateList = atm.states
    let len = 0,
      bestLen = 0,
      bestStateId = 0,
      bestPos = -1,
      bestSourcePos = -1;
    for (
      let i = startIndex, stateId = startIndex;
      i < b.length && stateId < stateList.length;
      ++i
    ) {
      const charId = atm.charset[b[i]];
      if (!(stateList[stateId][$.next][charId] > -1)) {
        for (
          ;
          stateId !== -1 && !(stateList[stateId][$.next][charId] > -1);
          stateId = stateList[stateId][$.link]
        ) {}
        if (stateId === -1) {
          stateId = 0;
          len = 0;
          continue;
        }
        len = stateList[stateId][$.len];
      }
      ++len;
      stateId = stateList[stateId][$.next][charId] ?? -1;
      if (bestLen < len) {
        for (const state of this.searchLinkRoot(stateList, stateId)) {
          bestSourcePos = state[$.charSourcePos];
        }
        bestLen = len;
        bestPos = i;
        bestStateId = stateId;
      }
    }
    const start = bestPos - bestLen + 1,
      end = bestPos + 1,
      text = b.slice(start, end);
    return (
      text.length && {
        text,
        start,
        end,
        sourceStart: bestSourcePos - bestLen + 1,
        sourceEnd: bestSourcePos + 1,
        length: bestLen,
        best: bestStateId,
      }
    );
  }

  multipleLcs(input: SearchPieces, b: SearchPieces, startIndex?: number) {
    const result = [] as SearchResult[];
    const atm = SuffixAutomaton.build(input)
    const stateList: IState[] = atm.states;
    let r: SearchResult;
    // try {
    do {
      r = this._lcs(atm, b, r?.end ?? startIndex);
      r && result.push(r);
    } while (r);
    // } catch (error) {
    //   debugger;
    // }
    return result;
  }

  lcs(a: SearchPieces, b: SearchPieces, startIndex?: number) {
    // if (a.length > b.length) {
    //   [b, a] = [a, b];
    // }
    return this._lcs(this.buildSuffixAutomaton(a), b, startIndex)?.text;
  }
  lcsWith(atm: SuffixAutomaton, b: SearchPieces, startIndex?: number) {
    // if (a.length > b.length) {
    //   [b, a] = [a, b];
    // }
    return this._lcs(atm, b, startIndex)?.text;
  }

  multLcs(a: SearchPieces[], b: SearchPieces, startIndex?: number) {
    return this._lcs(SuffixAutomaton.buildList(a), b, startIndex)?.text;
  }

  buildSuffixAutomaton(haystack: SearchPieces) {
    return SuffixAutomaton.build(haystack);
  }

  /**
   * 求出每个状态所代表的子串中出现最多的子串出现的次数
   * @param haystack
   * @param needle
   */
  occurrences(haystack: SearchPieces, needle: SearchPieces): number[] {
    if (haystack.length < needle.length) {
      return [];
    }
    const atm = SuffixAutomaton.build(haystack);
    const list = [] as number[];
    const result = this._lcs(atm, needle);
    if (result) {
      const { text: common, best } = result;
      if (common.toString() !== needle.toString()) return [];
      const rightDeep = SuffixAutomaton.buildRd(atm.states);
      for (const { pos } of this.dfs(atm.states, rightDeep, best, needle.length)) list.push(pos);
      return list;
    }
  }
  /**
   * 求出每个状态所代表的子串中出现最多的子串出现的次数
   * @param haystack
   * @param needle
   */
  multOccurrences(haystack: SearchPieces[], needle: SearchPieces) {
    if (haystack.length < needle.length) {
      return [];
    }
    const atm = SuffixAutomaton.buildList(haystack);
    const list = [] as { group: number | string; pos: number }[];
    const result = this._lcs(atm, needle);
    if (result) {
      const { text: common, best } = result;
      if (common.toString() !== needle.toString()) return [];
      const rightDeep = SuffixAutomaton.buildRd(atm.states);
      for (const { pos, id } of this.dfs(atm.states, rightDeep, best, needle.length))
        list.push({
          pos,
          group: atm[id][$.group],
        });
      return list;
    }
  }

  /**
   * 递归深度优先搜索
   * @param states
   * @param rightDeep
   * @param stateId
   * @param length
   * @param posList
   */
  *dfs(
    states: IState[],
    rightDeep: number[][],
    stateId: number,
    length: number
  ): Generator<{ pos: number; id: number }> {
    if (states[stateId][$.endpos] !== -1 || stateId === 0)
      yield { pos: states[stateId][$.endpos] - length + 1, id: stateId };
    if (rightDeep[stateId]) {
      for (const x of rightDeep[stateId]) {
        yield* this.dfs(states, rightDeep, x, length);
      }
    }
  }

  multSlowLcs(a: SearchPieces[], b: SearchPieces) {
    return a.map((a) => this.slowLcs(a, b));
  }

  getRandomString(n: number): string {
    let r = "";
    for (let i = 0; i < n; i++) {
      r += "a" + nextInt(3);
    }
    return r;
  }
}

function nextInt(n: number) {
  return parseInt((Math.random() * n).toFixed(0));
}
