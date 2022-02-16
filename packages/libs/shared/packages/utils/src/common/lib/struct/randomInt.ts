function rnd(next = rnd.seed) {
  rnd.seed = (next * 9301 + 49297) % 233280;
  return rnd.seed / 233280.0;
}
rnd.seed = new Date().getTime();
rnd.start = rnd.seed;

/**
 * 产生一个随机1-max的整数
 * @param max -
 * @param seed - 不为0的数字
 * @alpha
 */
export function randomInteger(max: number, seed?: number) {
  return seed && rnd.start !== seed && (rnd.seed = rnd.start = seed), Math.ceil(rnd() * max);
}
