import { int2Hex_reserved as int2Hex, hex2Int } from "../libs/hexUtil";
const BASE_LENGTH = 11;
const COUNT_LENGTH = 4;
const COUNT_MAX = 65535; // 0xffff

export const fromCharCodes = String.fromCharCode.apply.bind(String.fromCharCode, null) as (
  codes: number[]
) => string;
let count = 0;
let lastTime = 0;

export function uuid(st?: number) {
  const now = st !== undefined ? st : Date.now();
  if (typeof now !== "number") {
    throw new Error("St must be a Number!");
  }
  let timehex = int2Hex(now);

  if (timehex.length < BASE_LENGTH) {
    timehex = timehex.padStart(BASE_LENGTH, "0");
  }

  if (now === lastTime && count > COUNT_MAX) {
    throw new Error("Overstep the limits");
  } else if (now - lastTime > 0 || count >= COUNT_MAX) {
    if (lastTime > 0) {
      count = 0;
    }
    lastTime = now;
  }

  let countHex = int2Hex(count++);
  if (countHex.length < COUNT_LENGTH) {
    countHex = countHex.padStart(COUNT_LENGTH - countHex.length, "0");
  }

  return timehex + countHex;
}

export function parseUUID(uuid: string) {
  const st = uuid.slice(0, BASE_LENGTH).split("").reverse().join("");
  const ct = uuid.slice(BASE_LENGTH, COUNT_LENGTH);
  return {
    flg: 0,
    timestamp: hex2Int(st),
    count: hex2Int(ct),
  };
}
