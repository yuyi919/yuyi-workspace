const HEX_CHART_MAP = "0123456789abcdef";
// const HEX_CODE_MAP = HEX_CHART_MAP.map((o) => o.charCodeAt(0));

/**
 * 参照 String.fromCharCode
 * @public
 */
export const fromCharCodes = /* @__PURE__ */ String.fromCharCode.apply.bind(
  String.fromCharCode,
  null
) as (codes: number[]) => string;

/**
 * 把整数转换为16进制字符串
 * @param int - 整数
 * @public
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
 * @param int - 整数
 * @remarks 同int2Hex，但是少做了一步反转顺序
 * @public
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
 * @param hex - 16进制字符
 * @public
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

/**
 *
 * @param str -
 * @public
 */
export function str2Utf16LE(str: string) {
  let i = -1,
    result = "";
  while (++i < str.length) {
    const hexStr = int2Hex(str.charCodeAt(i));
    result += hexStr.length === 2 ? hexStr + "00" : hexStr[2] + hexStr[3] + hexStr[0] + hexStr[1];
  }
  return result;
}

/**
 *
 * @param str -
 * @public
 */
export function str2Utf16LE2(str: string) {
  const result = new Int16Array(str.length);
  let i = -1;
  while (++i < str.length) {
    result[i] = str.charCodeAt(i);
  }
  return result;
}

/**
 *
 * @param str -
 * @public
 */
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
