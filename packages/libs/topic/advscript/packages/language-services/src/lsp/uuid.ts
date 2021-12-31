const BASE_LENGTH = 11;
const COUNT_LENGTH = 4;
const COUNT_MAX = 65535; // 0xffff

const HEX_CHART_MAP = "0123456789abcdef".split("");
const HEX_CODE_MAP = HEX_CHART_MAP.map((o) => o.charCodeAt(0));

export const fromCharCodes = String.fromCharCode.apply.bind(String.fromCharCode, null) as (
  codes: number[]
) => string;
// console.log(fromCharCodes(HEX_CODE_MAP))
/**
 * 把整数转换为16进制字符串
 * @param int 整数
 */
export function int2Hex(int: number): string {
  let n = int;
  let m = "";
  while (n > 0) {
    const a = n % 16;
    n = (n - a) / 16;
    m = HEX_CHART_MAP[a] + m;
  }
  return m;
}
// export function int2Hex(int: number): string {
//   if (int === 0) return "0";
//   let n = int;
//   let m = "";
//   while (n > 0) {
//     const a = n % 16;
//     n = (n - a) / 16;
//     switch (a) {
//       case 10:
//         m += "a";
//         break;
//       case 11:
//         m += "b";
//         break;
//       case 12:
//         m += "c";
//         break;
//       case 13:
//         m += "d";
//         break;
//       case 14:
//         m += "e";
//         break;
//       case 15:
//         m += "f";
//         break;
//       default:
//         m += a + "";
//     }
//   }
//   return m;
// }

/**
 * 把16进制字符串转换为整数
 * @param hex 16进制字符
 */
export function hex2Int(hex: string) {
  const len = hex.length;
  let result: number = 0,
    i = 0,
    int: number;
  while (i < len) {
    result =
      result * 16 +
      (48 <= (int = hex.charCodeAt(i++)) && int < 58 ? int - 48 : (int & 0xdf) - 65 + 10);
  }
  return result;
}
// 清晰算法参见下面
// export function hex2Int(hex: string) {
//   const len = hex.length;
//   const nums: number[] = new Array(len);
//   let code: number;
//   for (let i = 0; i < len; i++) {
//     code = hex.charCodeAt(i);
//     if (48 <= code && code < 58) {
//       code -= 48;
//     } else {
//       code = (code & 0xdf) - 65 + 10;
//     }
//     nums[i] = code;
//   }

//   return nums.reduce(function (acc, c) {
//     acc = 16 * acc + c;
//     return acc;
//   }, 0);
// }
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
