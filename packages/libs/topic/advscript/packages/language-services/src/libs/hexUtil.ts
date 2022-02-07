import { chunk, isNumber } from "lodash";

const HEX_CHART_MAP = "0123456789abcdef";
// const HEX_CODE_MAP = HEX_CHART_MAP.map((o) => o.charCodeAt(0));

export const fromCharCodes = String.fromCharCode.apply.bind(String.fromCharCode, null) as (
  codes: number[]
) => string;

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

/**
 * 把整数转换为16进制字符串，并且反转字符顺序
 * @param int 整数
 * @remarks 同int2Hex，但是少做了一步反转顺序
 */
export function int2Hex_reserved(int: number): string {
  let n = int;
  let m = "";
  while (n > 0) {
    const a = n % 16;
    n = (n - a) / 16;
    m += HEX_CHART_MAP[a];
  }
  return m;
}

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

export function str2Utf16LE(str: string) {
  let i = -1,
    result = "";
  while (++i < str.length) {
    const hexStr = int2Hex(str.charCodeAt(i));
    result += hexStr.length === 2 ? hexStr + "00" : hexStr[2] + hexStr[3] + hexStr[0] + hexStr[1];
  }
  return result;
}

export function str2Utf16LE2(str: string) {
  const result = new Int16Array(str.length);
  let i = -1;
  while (++i < str.length) {
    result[i] = str.charCodeAt(i);
  }
  return result;
}

export function utf16LE2Str(str: string) {
  let i = 0,
    result = "";
  const length = str.length;
  do {
    const hex = hex2Int(str[i + 2] + str[i + 3] + str[i] + str[i + 1]);
    if (hex === 0) {
      break;
    } else {
      result += String.fromCharCode(hex);
    }
  } while ((i += 4) < length);
  return result;
}

export class AulUtils {
  /**
   * 文本编码(转换为utf-16LE)
   * @param str string to encode to string
   * @returns 返回utf-16LE字符串，长度固定为4096(1024*4)
   */
  public static encodeText(str: string) {
    return str2Utf16LE(str).padEnd(4096, "0");
  }
  /**
   * 文本解码
   * @param str string to decode to string
   * @returns string
   */
  public static decodeText(str: string) {
    if (str.length % 4) return ""; // 不为4的倍数则返回空字符串
    return utf16LE2Str(str);
  }
  // /**
  //  * 文本编码
  //  *
  //  * @param str string to encode to string
  //  * @returns hex string
  //  */
  // public static encode(str: string): string {
  //   if (str === "") return "";
  //   const hexCharCode = [];
  //   for (let i = 0; i < str.length; i++) {
  //     const hex = str.charCodeAt(i).toString(16);
  //     // console.error(i, str.charAt(i), hex)
  //     const ch = chunk(hex, 2).sort(() => -1);
  //     if (ch.length === 1) {
  //       if (ch[0].length === 1) {
  //         ch[0].unshift("0");
  //       }
  //       ch.push(["00"]);
  //     }
  //     hexCharCode.push(ch.flat(1).join(""));
  //   }
  //   let string = hexCharCode.join("");
  //   while (string.length < 4096) {
  //     string += "0";
  //   }
  //   return string;
  // }

  // /**
  //  * 文本解码
  //  *
  //  * @param str string to decode to string
  //  * @returns string
  //  */
  // public static decode(str: string): string {
  //   let times = 0;
  //   return chunk(str, 4)
  //     .map(([a, b, c, d]) => {
  //       const hex = parseInt(`0x${c || 0}${d || 0}${a || 0}${b || 0}`);
  //       hex === 0x0000 && times++;
  //       if (times > 1) {
  //         return "";
  //       }
  //       const r = hex === 0x0000 || !isNumber(hex) ? "" : String.fromCharCode(hex);
  //       // console.error(hex, r)
  //       return r;
  //     })
  //     .join("");
  // }
}
