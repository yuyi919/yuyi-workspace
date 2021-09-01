/**
 * 获得字符串实际长度，中文占2，英文占1
 * @param str 字符串
 */
export function getRealLength(str: string) {
  let realLength = 0;
  const len = str.length;
  let charCode = -1;
  for (let i = 0; i < len; i++) {
    charCode = str.charCodeAt(i);
    if (charCode >= 0 && charCode <= 128) {
      realLength += 1;
    } else {
      realLength += 2;
    }
  }
  return realLength;
}
