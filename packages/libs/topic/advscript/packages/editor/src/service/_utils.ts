export function createRequest(callback: (key: string) => any, timeout?: number, debug?: string) {
  const map = new Map<string, number>();
  function clean(arg: string) {
    const request = map.get(arg);
    clearTimeout(request);
    map.delete(arg);
  }
  return {
    clean,
    do(arg: string) {
      debug && console.log(debug, arg);
      clean(arg);
      map.set(
        arg,
        setTimeout(
          (arg: string) => {
            map.delete(arg);
            callback(arg);
          },
          timeout,
          arg
        ) as unknown as number
      );
    }
  };
}
