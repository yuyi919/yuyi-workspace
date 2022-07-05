import { str2Utf16LE, utf16LE2Str } from "@yuyi919/shared-utils";
export class AulUtils {
  /**
   * 文本编码(转换为utf-16LE)
   * @param str - string to encode to string
   * @returns 返回utf-16LE字符串，长度固定为4096(1024*4)
   */
  public static encodeText(str: string) {
    return str2Utf16LE(str).padEnd(4096, "0");
  }
  /**
   * 文本解码
   * @param str - string to decode to string
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
