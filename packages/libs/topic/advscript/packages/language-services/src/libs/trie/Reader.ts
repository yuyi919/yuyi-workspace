/* eslint-disable no-constant-condition */
/* eslint-disable no-prototype-builtins */
import { floor_log2 } from "../tiny-trie/floor_log2";
import { BinaryString } from "../tiny-trie/BinaryString";
import {
  VERSION,
  HEADER_WIDTH_FIELD,
  VERSION_FIELD,
  OFFSET_SIGN_FIELD,
  OFFSET_VAL_FIELD,
  CHAR_WIDTH_FIELD,
  POINTER_WIDTH_FIELD,
} from "../tiny-trie/constants";
import { readBits } from "../tiny-trie/PackedTrie";
import { $, IState, SuffixAutomaton } from "./SuffixAutomaton";

export class SuffixAutomatonReader {
  static readBinary(binary: string) {
    let ptr = 0;

    // Split binary into header and content by checking first field
    const headerCharCount = readBits(binary, ptr, HEADER_WIDTH_FIELD);
    ptr += HEADER_WIDTH_FIELD;
    const header = binary.substr(0, headerCharCount);

    const version = readBits(binary, ptr, VERSION_FIELD);
    ptr += VERSION_FIELD;

    if (version !== VERSION) {
      throw new Error(`Version mismatch! Binary: ${version}, Reader: ${VERSION}`);
    }

    // Main trie data
    const data = binary.substr(headerCharCount);

    // compute pointer offset
    const offsetSign = readBits(header, ptr, OFFSET_SIGN_FIELD);
    ptr += OFFSET_SIGN_FIELD;
    let offset = readBits(header, ptr, OFFSET_VAL_FIELD);
    ptr += OFFSET_VAL_FIELD;

    if (offsetSign) {
      offset = -offset;
    }

    // Pointer offset

    // interpret the field width within each word
    const charWidth = readBits(header, ptr, CHAR_WIDTH_FIELD);
    ptr += CHAR_WIDTH_FIELD;

    const pointerWidth = readBits(header, ptr, POINTER_WIDTH_FIELD);
    ptr += POINTER_WIDTH_FIELD;

    const size = readBits(header, ptr, pointerWidth);
    ptr += pointerWidth;

    // Interpret the rest of the header as the charTable
    const headerFieldChars = Math.ceil(ptr / 6);
    const charTable = header.substr(headerFieldChars);

    const chars = charTable.split("|");
    // Construct inverse table
    const inverseTable = [""];
    const table = chars.reduce(
      (agg, char, i) => {
        agg[(inverseTable[i + 1] = char = atob(char))] = i + 1;
        return agg;
      },
      { "": 0 } as { [key: string]: number }
    );
    const context = createContext(pointerWidth, charWidth);

    const datas = [];
    console.time("read bits");
    for (const o of readBinary(data, context, size)) {
      // console.log(o)
      datas[datas.length] = o;
    }
    console.timeEnd("read bits");
    // console.log([...next()]);
    return {
      data,
      table,
      inverseTable,
      offset,
      charWidth,
      pointerWidth,
      size,
      datas,
      context,
    };
  }

  static encode(atm: SuffixAutomaton) {
    const chunks = atm.states;
    const size = chunks.length;
    // const lens = chunks.map((o) => o[Id.len]);
    // const endPos = this.states.map((o) => o[Id.endpos]);
    // const group = this.states.map((o) => o[Id.group]);
    // const group = this.states.map((o) => o[Id.link]);
    const offsetMin = 0; // Math.min(...lens) + 1;
    // const offsetMax = Math.max(...lens) + 1;

    // Assign a unique integer ID to each character. The actual ID is
    // arbitrary. For the convenience of not having to serialize the \0
    // character, the TERMINAL is always encoded at the 0 index, and it is
    // not included in the charTable.
    const charMap = atm.charset;
    const charTableAsArray = Object.entries(charMap)
      .filter(Boolean)
      .sort((a, b) => a[1] - b[1])
      .map((o) => btoa(o[0]));
    // Determine the number of bits that can index the entire charTable.
    const charEncodingWidth = floor_log2(charTableAsArray.length) + 1;

    const pointerEncodingWidth = floor_log2(size) + 2; // * size;

    // The binary with of node encodings is variable. There are three parts
    // that get encoded:
    //
    //  1) character index (corresponding to character table),
    //  2) pointer (as offset from start of word to next node),
    //  3) last (flag to indicate whether this is the last block in this
    //     subtree)
    //
    // The width of the first two items are determined as the binary width
    // of the unsigned integer representing the maximum in the range. The
    // width of the third is a constant 1 binary digit.
    //
    // E.g., if the charTable is 28 characters in length, then the binary
    // digit representing 27 (the last item in the array) is:
    //
    //   1 1011
    //
    // So the width is determined to be 5. If the pointer range has a
    // maximum of 250, represented in binary as:
    //
    //   1111 1010
    //
    // Giving a width of 8. With these specifications, a node such as:
    //
    //   charIndex: 8, pointer: 100, last: false
    //
    // Would be encoded as:
    //
    //   --A---|----B-----|C|XXXXX
    //   0100 0|011 0010 0|1|00 00
    //
    // Which can be represented in Base64 as:
    //
    //   QyQ==
    //
    // TODO could be more clever and combine the first two fields.

    const encodedTrie = new BinaryString();

    for (let i = 0; i < size; i++) {
      const chunk = chunks[i];
      // encodedTrie.write(chunk[Id.endpos] + 1, size);
      // encodedTrie.write(0, 1);
      // console.log(chunks);
      encodeState(encodedTrie, chunk, charEncodingWidth, pointerEncodingWidth);
    }
    // chunks.forEach((chunk, _, list) => {
    // });

    encodedTrie.flush();

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Encode header
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    const headerString = new BinaryString();
    // TODO encode unicode
    const outputCharTable = charTableAsArray.join("|");

    // Header width designates the ASCII-character count at the beginning
    // of the file that encodes the header.
    const headerWidth =
      Math.ceil(
        (HEADER_WIDTH_FIELD +
          VERSION_FIELD +
          OFFSET_SIGN_FIELD +
          OFFSET_VAL_FIELD +
          CHAR_WIDTH_FIELD +
          POINTER_WIDTH_FIELD +
          pointerEncodingWidth) /
          6
      ) + outputCharTable.length;
    // Mark the offset as positive or negative
    const offsetSign = +(offsetMin < 0);

    headerString.write(headerWidth, HEADER_WIDTH_FIELD);
    headerString.write(VERSION, VERSION_FIELD);
    headerString.write(offsetSign, OFFSET_SIGN_FIELD);
    headerString.write(offsetSign ? -offsetMin : offsetMin, OFFSET_VAL_FIELD);
    headerString.write(charEncodingWidth, CHAR_WIDTH_FIELD);
    headerString.write(pointerEncodingWidth, POINTER_WIDTH_FIELD);
    headerString.write(size, pointerEncodingWidth);
    headerString.flush();

    // Concat the header, charTable, and trie
    return `${headerString.getData()}${outputCharTable}${encodedTrie.getData()}`;
  }
}
export type Context = ReturnType<typeof createContext>;
function createContext(pointerWidth: number, charWidth: number) {
  const idMap = [$.len, $.endpos, $.link, $.charSourcePos, $.group] as const;

  // const plusLength = 1;
  const pointerLength = pointerWidth * idMap.length; // + plusLength;
  const charLength = charWidth * 2;
  // Number of bits in a word
  const wordWidth = pointerLength + charLength;

  // Mask for reading pointer
  const pointerMask = (0x1 << pointerWidth) - 1;
  // Mask for reading characters
  const charMask = (0x1 << charWidth) - 1;
  // Offset of charTable
  const charShift = charWidth;

  return {
    pointerLength,
    charLength,
    charShift,
    charMask,
    pointerMask,
    idMap,
    wordWidth,
    pointerWidth,
    charWidth,
  };
}

function* readBitsBatch(data: string, size: number, batchSize: number, start: number) {
  const max = size * batchSize;
  if (max < 31) {
    const chunk = readBits(data, start, max);
    for (let i = 0; i < size; i++) {
      yield { chunk, offset: i, offsetInBatch: batchSize * (size - i - 1) };
    }
    return;
  }
  const batch = ~~(31 / batchSize);
  for (let prev = 0, i = batch; i <= size + batch; i += batch) {
    const max = i > size ? size : i;
    // console.log("readBits(data, ", start + prev * batchSize, ", ", (max - prev) * batchSize, ")");
    const chunk = readBits(data, start + prev * batchSize, (max - prev) * batchSize);
    for (let batchi = prev; batchi < max; batchi++) {
      // console.log(
      //   `((${chunk} >> (${pointerShift} + ${batchSize} * (${max} - ${batchi} - 1))) & ${pointerMask})`
      // );
      yield { chunk, offset: batchi, offsetInBatch: batchSize * (max - batchi - 1) };
      // yield { chunk, offset: batchi, offsetInBatch: batchSize * ~-(max - batchi) };
    }
    prev = i;
  }
}
function* readBinary(data: string, context: Context, size = 0, wordPointer = 0) {
  const {
    pointerLength,
    pointerWidth,
    charWidth,
    charLength,
    charShift,
    charMask,
    pointerMask,
    idMap,
    wordWidth,
  } = context;
  let id = -1;
  // const full = charWidth + pointerWidth * size;
  while (++id < size) {
    const bits = wordPointer;
    const chunk = readBits(data, bits + pointerLength, charLength);
    // Read the character index
    const charId = (chunk >> charShift) & charMask;
    // 获取next
    const nextSize = chunk & charMask;
    const next = [-1];
    const pointers = [id, 0, -1, -1, charId, -1, 0, next] as IState;
    for (const { chunk, offsetInBatch, offset } of readBitsBatch(
      data,
      idMap.length,
      pointerWidth,
      bits
    )) {
      const value = (chunk >> offsetInBatch) & pointerMask;
      pointers[idMap[offset]] += value;
    }
    // let index: number;
    // [key(char) + value(pointer)]
    const nextLengthStep = charWidth + pointerWidth;
    const nextLength = nextSize * nextLengthStep;
    for (const { chunk, offsetInBatch, offset } of readBitsBatch(
      data,
      nextSize,
      nextLengthStep,
      bits + wordWidth
    )) {
      const index = (chunk >> (offsetInBatch + pointerWidth)) & charMask;
      const value = (chunk >> offsetInBatch) & pointerMask;
      next[index] = value;
    }
    yield pointers;
    // Object.defineProperties(pointers, {
    //   char: {
    //     get() {
    //       return inverseTable[(this as IState)[Id.charId]];
    //     },
    //   },
    // });
    wordPointer += wordWidth + nextLength;
  }
}

function encodeState(
  encodedTrie: BinaryString,
  chunk: IState,
  charEncodingWidth: number,
  pointerEncodingWidth: number
) {
  encodedTrie.write(chunk[$.len], pointerEncodingWidth);
  encodedTrie.write(chunk[$.endpos] + 1, pointerEncodingWidth);
  encodedTrie.write(chunk[$.link] + 1, pointerEncodingWidth);
  // encodedTrie.write(chunk[Id.link] + 1, pointerEncodingWidth);
  encodedTrie.write(chunk[$.charSourcePos] + 1, pointerEncodingWidth);
  encodedTrie.write(chunk[$.group] as number, pointerEncodingWidth);

  encodedTrie.write(chunk[$.charId], charEncodingWidth);

  const nexts = chunk[$.next];
  const nextChunk = [] as [number, number][];
  for (const [i, value] of Object.entries(nexts)) {
    const index = ~~i;
    // if (index > 15 && index < 20) {
    // chunks.push((chunk[Id.next][i] ?? -1) + 1);
    if (value > -1) {
      nextChunk[nextChunk.length] = { 0: index, 1: value } as [number, number];
    }
    // }
  }
  encodedTrie.write(nextChunk.length, charEncodingWidth);
  for (const data of nextChunk) {
    encodedTrie.write(data[0], charEncodingWidth);
    encodedTrie.write(data[1], pointerEncodingWidth);
  }
}

globalThis.testBinaryString = () => {
  const charWidth = 6;
  const pointerWidth = 9;
  const bitStr = new BinaryString();
  encodeState(
    bitStr,
    [
      0,
      0,
      -1,
      -1,
      0,
      -1,
      0,
      [
        -1, 1, 4, 58, 15, 236, 74, 23, 237, 277, 316, 194, 203, 292, 124, 134, 149, 358, 167, 169,
        171, 160, 306, 177, 192, 214, 317, 319, 216, 366, 290, 230, 233, 257, 291, 294, 295, 301,
        298, 334, 325, 339, 330, 331, 348, 355, 360, 361,
      ],
    ] as IState,
    charWidth,
    pointerWidth
  );
  const data = bitStr.getData();
  console.log(data);
  const { pointerLength, charLength, charShift, charMask, pointerMask, idMap, wordWidth } =
    createContext(pointerWidth, charWidth);
  const bits = 0;
  const chunk = readBits(data, bits + pointerLength, charLength);
  // Read the character index
  const charId = (chunk >> charShift) & charMask;
  // 获取next
  const nextSize = chunk & charMask;
  const next = [-1];
  const pointers = [0, 0, -1, -1, charId, -1, 0, next] as IState;
  for (const { chunk, offsetInBatch, offset } of readBitsBatch(
    data,
    idMap.length,
    pointerWidth,
    bits
  )) {
    const value = (chunk >> offsetInBatch) & pointerMask;
    pointers[idMap[offset]] += value;
  }
  // let index: number;
  // [value(pointer) + key(char)]
  const nextLengthStep = charWidth + pointerWidth;
  for (const { chunk, offsetInBatch, offset } of readBitsBatch(
    data,
    nextSize,
    nextLengthStep,
    bits + wordWidth
  )) {
    // console.log(offset, chunk, offsetInBatch, pointerWidth, charMask, pointerMask)
    const index = (chunk >> (offsetInBatch + pointerWidth)) & charMask;
    const value = (chunk >> offsetInBatch) & pointerMask;
    next[index] = value;
    // console.log(chunk, index, value);
  }
  return pointers;
};
