declare namespace jest {
  interface Matchers<R, T = {}> {
    toErrorDev(match?: string): R;
    toThrowMinified(match: string): R
  }
}
