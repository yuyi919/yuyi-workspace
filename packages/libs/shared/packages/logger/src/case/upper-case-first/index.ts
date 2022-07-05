/**
 * Upper case the first character of an input string.
 */
export function upperCaseFirst(input: string) {
  return input[0] ? input[0].toUpperCase() + input.slice(1) : input;
}
