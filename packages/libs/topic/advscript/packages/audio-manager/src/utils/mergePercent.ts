export function mergePercent(percent: number | undefined, percent2: number | undefined) {
  return percent === undefined && percent2 === undefined
    ? undefined
    : (Math.round((percent = (percent ?? 1) * 100)) *
        Math.round((percent2 = (percent2 ?? 1) * 100))) /
        10000;
}
