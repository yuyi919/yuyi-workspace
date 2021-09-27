export function linear(k: number) {
  return k;
}
export function quadraticIn(k: number) {
  return k * k;
}
export function quadraticOut(k: number) {
  return k * (2 - k);
}
export function quadraticInOut(k: number) {
  if ((k *= 2) < 1) {
    return 0.5 * k * k;
  }
  return -0.5 * (--k * (k - 2) - 1);
}
export function cubicIn(k: number) {
  return k * k * k;
}
export function cubicOut(k: number) {
  return --k * k * k + 1;
}
export function cubicInOut(k: number) {
  if ((k *= 2) < 1) {
    return 0.5 * k * k * k;
  }
  return 0.5 * ((k -= 2) * k * k + 2);
}
export function quarticIn(k: number) {
  return k * k * k * k;
}
export function quarticOut(k: number) {
  return 1 - --k * k * k * k;
}
export function quarticInOut(k: number) {
  if ((k *= 2) < 1) {
    return 0.5 * k * k * k * k;
  }
  return -0.5 * ((k -= 2) * k * k * k - 2);
}
export function quinticIn(k: number) {
  return k * k * k * k * k;
}
export function quinticOut(k: number) {
  return --k * k * k * k * k + 1;
}
export function quinticInOut(k: number) {
  if ((k *= 2) < 1) {
    return 0.5 * k * k * k * k * k;
  }
  return 0.5 * ((k -= 2) * k * k * k * k + 2);
}
export function sinusoidalIn(k: number) {
  return 1 - Math.cos((k * Math.PI) / 2);
}
export function sinusoidalOut(k: number) {
  return Math.sin((k * Math.PI) / 2);
}
export function sinusoidalInOut(k: number) {
  return 0.5 * (1 - Math.cos(Math.PI * k));
}
export function exponentialIn(k: number) {
  return k === 0 ? 0 : Math.pow(1024, k - 1);
}
export function exponentialOut(k: number) {
  return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
}
export function exponentialInOut(k: number) {
  if (k === 0) {
    return 0;
  }
  if (k === 1) {
    return 1;
  }
  if ((k *= 2) < 1) {
    return 0.5 * Math.pow(1024, k - 1);
  }
  return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2);
}
export function circularIn(k: number) {
  return 1 - Math.sqrt(1 - k * k);
}
export function circularOut(k: number) {
  return Math.sqrt(1 - --k * k);
}
export function circularInOut(k: number) {
  if ((k *= 2) < 1) {
    return -0.5 * (Math.sqrt(1 - k * k) - 1);
  }
  return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
}
export function elasticIn(k: number) {
  let s: number;
  let a = 0.1;
  const p = 0.4;
  if (k === 0) {
    return 0;
  }
  if (k === 1) {
    return 1;
  }
  if (!a || a < 1) {
    a = 1;
    s = p / 4;
  } else {
    s = (p * Math.asin(1 / a)) / (2 * Math.PI);
  }
  return -(a * Math.pow(2, 10 * (k -= 1)) * Math.sin(((k - s) * (2 * Math.PI)) / p));
}
export function elasticOut(k: number) {
  let s;
  let a = 0.1;
  const p = 0.4;
  if (k === 0) {
    return 0;
  }
  if (k === 1) {
    return 1;
  }
  if (!a || a < 1) {
    a = 1;
    s = p / 4;
  } else {
    s = (p * Math.asin(1 / a)) / (2 * Math.PI);
  }
  return a * Math.pow(2, -10 * k) * Math.sin(((k - s) * (2 * Math.PI)) / p) + 1;
}
export function elasticInOut(k: number) {
  let s;
  let a = 0.1;
  const p = 0.4;
  if (k === 0) {
    return 0;
  }
  if (k === 1) {
    return 1;
  }
  if (!a || a < 1) {
    a = 1;
    s = p / 4;
  } else {
    s = (p * Math.asin(1 / a)) / (2 * Math.PI);
  }
  if ((k *= 2) < 1) {
    return -0.5 * (a * Math.pow(2, 10 * (k -= 1)) * Math.sin(((k - s) * (2 * Math.PI)) / p));
  }
  return a * Math.pow(2, -10 * (k -= 1)) * Math.sin(((k - s) * (2 * Math.PI)) / p) * 0.5 + 1;
}
export function // 在某一动画开始沿指示的路径进行动画处理前稍稍收回该动画的移动
backIn(k: number) {
  const s = 1.70158;
  return k * k * ((s + 1) * k - s);
}
export function backOut(k: number) {
  const s = 1.70158;
  return --k * k * ((s + 1) * k + s) + 1;
}
export function backInOut(k: number) {
  const s = 1.70158 * 1.525;
  if ((k *= 2) < 1) {
    return 0.5 * (k * k * ((s + 1) * k - s));
  }
  return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
}
// 创建弹跳效果
export function bounceIn(k: number) {
  return 1 - bounceOut(1 - k);
}
export function bounceOut(k: number) {
  if (k < 1 / 2.75) {
    return 7.5625 * k * k;
  } else if (k < 2 / 2.75) {
    return 7.5625 * (k -= 1.5 / 2.75) * k + 0.75;
  } else if (k < 2.5 / 2.75) {
    return 7.5625 * (k -= 2.25 / 2.75) * k + 0.9375;
  } else {
    return 7.5625 * (k -= 2.625 / 2.75) * k + 0.984375;
  }
}
export function bounceInOut(k: number) {
  if (k < 0.5) {
    return bounceIn(k * 2) * 0.5;
  }
  return bounceOut(k * 2 - 1) * 0.5 + 0.5;
}
