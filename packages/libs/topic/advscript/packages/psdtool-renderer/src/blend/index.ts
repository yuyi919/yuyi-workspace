// DO NOT EDIT.
// Generate with: go generate
function lum(r: number, g: number, b: number): number {
  return (r * 77 + g * 151 + b * 28) >> 8;
}

function setLum(r: number, g: number, b: number, lm: number): number {
  lm -= lum(r, g, b);
  return clipColor(r + lm, g + lm, b + lm);
}

function clipColor(r: number, g: number, b: number): number {
  const lm = lum(r, g, b);
  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  if (min < 0) {
    r = lm + ((r - lm) * lm) / (lm - min);
    g = lm + ((g - lm) * lm) / (lm - min);
    b = lm + ((b - lm) * lm) / (lm - min);
  }
  if (max > 255) {
    r = lm + ((r - lm) * (255 - lm)) / (max - lm);
    g = lm + ((g - lm) * (255 - lm)) / (max - lm);
    b = lm + ((b - lm) * (255 - lm)) / (max - lm);
  }
  return (r << 16) | (g << 8) | b;
}

function sat(r: number, g: number, b: number): number {
  return Math.max(r, g, b) - Math.min(r, g, b);
}

function setSat(r: number, g: number, b: number, sat: number): number {
  if (r <= g) {
    if (g <= b) {
      return setSatMinMidMax(r, g, b, sat);
    } else if (r <= b) {
      sat = setSatMinMidMax(r, b, g, sat);
      return (sat & 0xff0000) | ((sat & 0xff) << 8) | ((sat & 0xff00) >> 8);
    }
    sat = setSatMinMidMax(b, r, g, sat);
    return ((sat & 0xffff) << 8) | ((sat & 0xff0000) >> 16);
  } else if (r <= b) {
    sat = setSatMinMidMax(g, r, b, sat);
    return ((sat & 0xff00) << 8) | ((sat & 0xff0000) >> 8) | (sat & 0xff);
  } else if (g <= b) {
    sat = setSatMinMidMax(g, b, r, sat);
    return ((sat & 0xff) << 16) | ((sat & 0xffff00) >> 8);
  }
  sat = setSatMinMidMax(b, g, r, sat);
  return ((sat & 0xff) << 16) | (sat & 0xff00) | ((sat & 0xff0000) >> 16);
}

function setSatMinMidMax(min: number, mid: number, max: number, sat: number): number {
  if (max > min) {
    return ((((mid - min) * sat) / (max - min)) << 8) | sat;
  }
  return 0;
}

function copyAlpha(
  d: Uint8ClampedArray,
  s: Uint8ClampedArray,
  w: number,
  h: number,
  alpha: number
): void {
  for (let i = 0, len = (w * h) << 2; i < len; i += 4) {
    d[i + 3] = s[i + 3] * alpha;
  }
}

function copyOpaque(
  d: Uint8ClampedArray,
  s: Uint8ClampedArray,
  w: number,
  h: number,
  alpha: number
): void {
  const a = 255 * alpha;
  for (let i = 0, len = (w * h) << 2; i < len; i += 4) {
    d[i + 0] = s[i + 0];
    d[i + 1] = s[i + 1];
    d[i + 2] = s[i + 2];
    d[i + 3] = a;
  }
}

function blendNormal(
  d: Uint8ClampedArray,
  s: Uint8ClampedArray,
  w: number,
  h: number,
  alpha: number
): void {
  let sr: number,
    sg: number,
    sb: number,
    sa: number,
    dr: number,
    dg: number,
    db: number,
    da: number;
  let a1: number, a2: number, a3: number, r: number, g: number, b: number, a: number, tmp: number;
  for (let i = 0, len = (w * h) << 2; i < len; i += 4) {
    sr = s[i];
    sg = s[i + 1];
    sb = s[i + 2];
    sa = s[i + 3];
    dr = d[i];
    dg = d[i + 1];
    db = d[i + 2];
    da = d[i + 3];

    tmp = 0 | (sa * alpha * 32897);
    a1 = (tmp * da) >> 23;
    a2 = (tmp * (255 - da)) >> 23;
    a3 = ((8388735 - tmp) * da) >> 23;
    a = a1 + a2 + a3;
    d[i + 3] = a;
    if (a) {
      r = sr;

      g = sg;

      b = sb;

      d[i] = (r * a1 + sr * a2 + dr * a3) / a;
      d[i + 1] = (g * a1 + sg * a2 + dg * a3) / a;
      d[i + 2] = (b * a1 + sb * a2 + db * a3) / a;
    }
  }
}

function blendDarken(
  d: Uint8ClampedArray,
  s: Uint8ClampedArray,
  w: number,
  h: number,
  alpha: number
): void {
  let sr: number,
    sg: number,
    sb: number,
    sa: number,
    dr: number,
    dg: number,
    db: number,
    da: number;
  let a1: number, a2: number, a3: number, r: number, g: number, b: number, a: number, tmp: number;
  for (let i = 0, len = (w * h) << 2; i < len; i += 4) {
    sr = s[i];
    sg = s[i + 1];
    sb = s[i + 2];
    sa = s[i + 3];
    dr = d[i];
    dg = d[i + 1];
    db = d[i + 2];
    da = d[i + 3];

    tmp = 0 | (sa * alpha * 32897);
    a1 = (tmp * da) >> 23;
    a2 = (tmp * (255 - da)) >> 23;
    a3 = ((8388735 - tmp) * da) >> 23;
    a = a1 + a2 + a3;
    d[i + 3] = a;
    if (a) {
      if (sr < dr) {
        r = sr;
      } else {
        r = dr;
      }

      if (sg < dg) {
        g = sg;
      } else {
        g = dg;
      }

      if (sb < db) {
        b = sb;
      } else {
        b = db;
      }

      d[i] = (r * a1 + sr * a2 + dr * a3) / a;
      d[i + 1] = (g * a1 + sg * a2 + dg * a3) / a;
      d[i + 2] = (b * a1 + sb * a2 + db * a3) / a;
    }
  }
}

function blendMultiply(
  d: Uint8ClampedArray,
  s: Uint8ClampedArray,
  w: number,
  h: number,
  alpha: number
): void {
  let sr: number,
    sg: number,
    sb: number,
    sa: number,
    dr: number,
    dg: number,
    db: number,
    da: number;
  let a1: number, a2: number, a3: number, r: number, g: number, b: number, a: number, tmp: number;
  for (let i = 0, len = (w * h) << 2; i < len; i += 4) {
    sr = s[i];
    sg = s[i + 1];
    sb = s[i + 2];
    sa = s[i + 3];
    dr = d[i];
    dg = d[i + 1];
    db = d[i + 2];
    da = d[i + 3];

    tmp = 0 | (sa * alpha * 32897);
    a1 = (tmp * da) >> 23;
    a2 = (tmp * (255 - da)) >> 23;
    a3 = ((8388735 - tmp) * da) >> 23;
    a = a1 + a2 + a3;
    d[i + 3] = a;
    if (a) {
      r = (sr * dr * 32897) >> 23;

      g = (sg * dg * 32897) >> 23;

      b = (sb * db * 32897) >> 23;

      d[i] = (r * a1 + sr * a2 + dr * a3) / a;
      d[i + 1] = (g * a1 + sg * a2 + dg * a3) / a;
      d[i + 2] = (b * a1 + sb * a2 + db * a3) / a;
    }
  }
}

function blendColorBurn(
  d: Uint8ClampedArray,
  s: Uint8ClampedArray,
  w: number,
  h: number,
  alpha: number
): void {
  let sr: number,
    sg: number,
    sb: number,
    sa: number,
    dr: number,
    dg: number,
    db: number,
    da: number;
  let a1: number, a2: number, a3: number, r: number, g: number, b: number, a: number, tmp: number;
  for (let i = 0, len = (w * h) << 2; i < len; i += 4) {
    sr = s[i];
    sg = s[i + 1];
    sb = s[i + 2];
    sa = s[i + 3];
    dr = d[i];
    dg = d[i + 1];
    db = d[i + 2];
    da = d[i + 3];

    tmp = 0 | (sa * alpha * 32897);
    a1 = (tmp * da) >> 23;
    a2 = (tmp * (255 - da)) >> 23;
    a3 = ((8388735 - tmp) * da) >> 23;
    a = a1 + a2 + a3;
    d[i + 3] = a;
    if (a) {
      if (dr === 255) {
        r = 255;
      } else if (sr === 0) {
        r = 0;
      } else {
        r = 255 - Math.min(255, ((255 - dr) / sr) * 255);
      }

      if (dg === 255) {
        g = 255;
      } else if (sg === 0) {
        g = 0;
      } else {
        g = 255 - Math.min(255, ((255 - dg) / sg) * 255);
      }

      if (db === 255) {
        b = 255;
      } else if (sb === 0) {
        b = 0;
      } else {
        b = 255 - Math.min(255, ((255 - db) / sb) * 255);
      }

      d[i] = (r * a1 + sr * a2 + dr * a3) / a;
      d[i + 1] = (g * a1 + sg * a2 + dg * a3) / a;
      d[i + 2] = (b * a1 + sb * a2 + db * a3) / a;
    }
  }
}

function blendLinearBurn(
  d: Uint8ClampedArray,
  s: Uint8ClampedArray,
  w: number,
  h: number,
  alpha: number
): void {
  let sr: number,
    sg: number,
    sb: number,
    sa: number,
    dr: number,
    dg: number,
    db: number,
    da: number;
  let a1: number, a2: number, a3: number, r: number, g: number, b: number, a: number, tmp: number;
  for (let i = 0, len = (w * h) << 2; i < len; i += 4) {
    sr = s[i];
    sg = s[i + 1];
    sb = s[i + 2];
    sa = s[i + 3];
    dr = d[i];
    dg = d[i + 1];
    db = d[i + 2];
    da = d[i + 3];

    tmp = 0 | (sa * alpha * 32897);
    a1 = (tmp * da) >> 23;
    a2 = (tmp * (255 - da)) >> 23;
    a3 = ((8388735 - tmp) * da) >> 23;
    a = a1 + a2 + a3;
    d[i + 3] = a;
    if (a) {
      r = Math.max(0, dr + sr - 255);

      g = Math.max(0, dg + sg - 255);

      b = Math.max(0, db + sb - 255);

      d[i] = (r * a1 + sr * a2 + dr * a3) / a;
      d[i + 1] = (g * a1 + sg * a2 + dg * a3) / a;
      d[i + 2] = (b * a1 + sb * a2 + db * a3) / a;
    }
  }
}

function blendDarkerColor(
  d: Uint8ClampedArray,
  s: Uint8ClampedArray,
  w: number,
  h: number,
  alpha: number
): void {
  let sr: number,
    sg: number,
    sb: number,
    sa: number,
    dr: number,
    dg: number,
    db: number,
    da: number;
  let a1: number, a2: number, a3: number, r: number, g: number, b: number, a: number, tmp: number;
  for (let i = 0, len = (w * h) << 2; i < len; i += 4) {
    sr = s[i];
    sg = s[i + 1];
    sb = s[i + 2];
    sa = s[i + 3];
    dr = d[i];
    dg = d[i + 1];
    db = d[i + 2];
    da = d[i + 3];

    tmp = 0 | (sa * alpha * 32897);
    a1 = (tmp * da) >> 23;
    a2 = (tmp * (255 - da)) >> 23;
    a3 = ((8388735 - tmp) * da) >> 23;
    a = a1 + a2 + a3;
    d[i + 3] = a;
    if (a) {
      if (lum(sr, sg, sb) < lum(dr, dg, db)) {
        r = sr;
        g = sg;
        b = sb;
      } else {
        r = dr;
        g = dg;
        b = db;
      }

      d[i] = (r * a1 + sr * a2 + dr * a3) / a;
      d[i + 1] = (g * a1 + sg * a2 + dg * a3) / a;
      d[i + 2] = (b * a1 + sb * a2 + db * a3) / a;
    }
  }
}

function blendLighten(
  d: Uint8ClampedArray,
  s: Uint8ClampedArray,
  w: number,
  h: number,
  alpha: number
): void {
  let sr: number,
    sg: number,
    sb: number,
    sa: number,
    dr: number,
    dg: number,
    db: number,
    da: number;
  let a1: number, a2: number, a3: number, r: number, g: number, b: number, a: number, tmp: number;
  for (let i = 0, len = (w * h) << 2; i < len; i += 4) {
    sr = s[i];
    sg = s[i + 1];
    sb = s[i + 2];
    sa = s[i + 3];
    dr = d[i];
    dg = d[i + 1];
    db = d[i + 2];
    da = d[i + 3];

    tmp = 0 | (sa * alpha * 32897);
    a1 = (tmp * da) >> 23;
    a2 = (tmp * (255 - da)) >> 23;
    a3 = ((8388735 - tmp) * da) >> 23;
    a = a1 + a2 + a3;
    d[i + 3] = a;
    if (a) {
      if (sr > dr) {
        r = sr;
      } else {
        r = dr;
      }

      if (sg > dg) {
        g = sg;
      } else {
        g = dg;
      }

      if (sb > db) {
        b = sb;
      } else {
        b = db;
      }

      d[i] = (r * a1 + sr * a2 + dr * a3) / a;
      d[i + 1] = (g * a1 + sg * a2 + dg * a3) / a;
      d[i + 2] = (b * a1 + sb * a2 + db * a3) / a;
    }
  }
}

function blendScreen(
  d: Uint8ClampedArray,
  s: Uint8ClampedArray,
  w: number,
  h: number,
  alpha: number
): void {
  let sr: number,
    sg: number,
    sb: number,
    sa: number,
    dr: number,
    dg: number,
    db: number,
    da: number;
  let a1: number, a2: number, a3: number, r: number, g: number, b: number, a: number, tmp: number;
  for (let i = 0, len = (w * h) << 2; i < len; i += 4) {
    sr = s[i];
    sg = s[i + 1];
    sb = s[i + 2];
    sa = s[i + 3];
    dr = d[i];
    dg = d[i + 1];
    db = d[i + 2];
    da = d[i + 3];

    tmp = 0 | (sa * alpha * 32897);
    a1 = (tmp * da) >> 23;
    a2 = (tmp * (255 - da)) >> 23;
    a3 = ((8388735 - tmp) * da) >> 23;
    a = a1 + a2 + a3;
    d[i + 3] = a;
    if (a) {
      r = sr + dr - ((sr * dr * 32897) >> 23);

      g = sg + dg - ((sg * dg * 32897) >> 23);

      b = sb + db - ((sb * db * 32897) >> 23);

      d[i] = (r * a1 + sr * a2 + dr * a3) / a;
      d[i + 1] = (g * a1 + sg * a2 + dg * a3) / a;
      d[i + 2] = (b * a1 + sb * a2 + db * a3) / a;
    }
  }
}

function blendColorDodge(
  d: Uint8ClampedArray,
  s: Uint8ClampedArray,
  w: number,
  h: number,
  alpha: number
): void {
  let sr: number,
    sg: number,
    sb: number,
    sa: number,
    dr: number,
    dg: number,
    db: number,
    da: number;
  let a1: number, a2: number, a3: number, r: number, g: number, b: number, a: number, tmp: number;
  for (let i = 0, len = (w * h) << 2; i < len; i += 4) {
    sr = s[i];
    sg = s[i + 1];
    sb = s[i + 2];
    sa = s[i + 3];
    dr = d[i];
    dg = d[i + 1];
    db = d[i + 2];
    da = d[i + 3];

    tmp = 0 | (sa * alpha * 32897);
    a1 = (tmp * da) >> 23;
    a2 = (tmp * (255 - da)) >> 23;
    a3 = ((8388735 - tmp) * da) >> 23;
    a = a1 + a2 + a3;
    d[i + 3] = a;
    if (a) {
      if (dr === 0) {
        r = 0;
      } else if (sr === 255) {
        r = 255;
      } else {
        r = Math.min(255, (dr * 255) / (255 - sr));
      }

      if (dg === 0) {
        g = 0;
      } else if (sg === 255) {
        g = 255;
      } else {
        g = Math.min(255, (dg * 255) / (255 - sg));
      }

      if (db === 0) {
        b = 0;
      } else if (sb === 255) {
        b = 255;
      } else {
        b = Math.min(255, (db * 255) / (255 - sb));
      }

      d[i] = (r * a1 + sr * a2 + dr * a3) / a;
      d[i + 1] = (g * a1 + sg * a2 + dg * a3) / a;
      d[i + 2] = (b * a1 + sb * a2 + db * a3) / a;
    }
  }
}

function blendLinearDodge(
  d: Uint8ClampedArray,
  s: Uint8ClampedArray,
  w: number,
  h: number,
  alpha: number
): void {
  let sr: number,
    sg: number,
    sb: number,
    sa: number,
    dr: number,
    dg: number,
    db: number,
    da: number;
  let a1: number, a2: number, a3: number, r: number, g: number, b: number, a: number, tmp: number;
  for (let i = 0, len = (w * h) << 2; i < len; i += 4) {
    sr = s[i];
    sg = s[i + 1];
    sb = s[i + 2];
    sa = s[i + 3];
    dr = d[i];
    dg = d[i + 1];
    db = d[i + 2];
    da = d[i + 3];

    tmp = 0 | (sa * alpha * 32897);
    a1 = (tmp * da) >> 23;
    a2 = (tmp * (255 - da)) >> 23;
    a3 = ((8388735 - tmp) * da) >> 23;
    a = a1 + a2 + a3;
    d[i + 3] = a;
    if (a) {
      r = sr + dr;

      g = sg + dg;

      b = sb + db;

      d[i] = (r * a1 + sr * a2 + dr * a3) / a;
      d[i + 1] = (g * a1 + sg * a2 + dg * a3) / a;
      d[i + 2] = (b * a1 + sb * a2 + db * a3) / a;
    }
  }
}

function blendLighterColor(
  d: Uint8ClampedArray,
  s: Uint8ClampedArray,
  w: number,
  h: number,
  alpha: number
): void {
  let sr: number,
    sg: number,
    sb: number,
    sa: number,
    dr: number,
    dg: number,
    db: number,
    da: number;
  let a1: number, a2: number, a3: number, r: number, g: number, b: number, a: number, tmp: number;
  for (let i = 0, len = (w * h) << 2; i < len; i += 4) {
    sr = s[i];
    sg = s[i + 1];
    sb = s[i + 2];
    sa = s[i + 3];
    dr = d[i];
    dg = d[i + 1];
    db = d[i + 2];
    da = d[i + 3];

    tmp = 0 | (sa * alpha * 32897);
    a1 = (tmp * da) >> 23;
    a2 = (tmp * (255 - da)) >> 23;
    a3 = ((8388735 - tmp) * da) >> 23;
    a = a1 + a2 + a3;
    d[i + 3] = a;
    if (a) {
      if (lum(sr, sg, sb) > lum(dr, dg, db)) {
        r = sr;
        g = sg;
        b = sb;
      } else {
        r = dr;
        g = dg;
        b = db;
      }

      d[i] = (r * a1 + sr * a2 + dr * a3) / a;
      d[i + 1] = (g * a1 + sg * a2 + dg * a3) / a;
      d[i + 2] = (b * a1 + sb * a2 + db * a3) / a;
    }
  }
}

function blendOverlay(
  d: Uint8ClampedArray,
  s: Uint8ClampedArray,
  w: number,
  h: number,
  alpha: number
): void {
  let sr: number,
    sg: number,
    sb: number,
    sa: number,
    dr: number,
    dg: number,
    db: number,
    da: number;
  let a1: number, a2: number, a3: number, r: number, g: number, b: number, a: number, tmp: number;
  for (let i = 0, len = (w * h) << 2; i < len; i += 4) {
    sr = s[i];
    sg = s[i + 1];
    sb = s[i + 2];
    sa = s[i + 3];
    dr = d[i];
    dg = d[i + 1];
    db = d[i + 2];
    da = d[i + 3];

    tmp = 0 | (sa * alpha * 32897);
    a1 = (tmp * da) >> 23;
    a2 = (tmp * (255 - da)) >> 23;
    a3 = ((8388735 - tmp) * da) >> 23;
    a = a1 + a2 + a3;
    d[i + 3] = a;
    if (a) {
      if (dr < 128) {
        r = (sr * dr * 32897) >> 22;
      } else {
        r = 255 - (((255 - ((dr - 128) << 1)) * (255 - sr) * 32897) >> 23);
      }

      if (dg < 128) {
        g = (sg * dg * 32897) >> 22;
      } else {
        g = 255 - (((255 - ((dg - 128) << 1)) * (255 - sg) * 32897) >> 23);
      }

      if (db < 128) {
        b = (sb * db * 32897) >> 22;
      } else {
        b = 255 - (((255 - ((db - 128) << 1)) * (255 - sb) * 32897) >> 23);
      }

      d[i] = (r * a1 + sr * a2 + dr * a3) / a;
      d[i + 1] = (g * a1 + sg * a2 + dg * a3) / a;
      d[i + 2] = (b * a1 + sb * a2 + db * a3) / a;
    }
  }
}

function blendSoftLight(
  d: Uint8ClampedArray,
  s: Uint8ClampedArray,
  w: number,
  h: number,
  alpha: number
): void {
  let sr: number,
    sg: number,
    sb: number,
    sa: number,
    dr: number,
    dg: number,
    db: number,
    da: number;
  let a1: number, a2: number, a3: number, r: number, g: number, b: number, a: number, tmp: number;
  for (let i = 0, len = (w * h) << 2; i < len; i += 4) {
    sr = s[i];
    sg = s[i + 1];
    sb = s[i + 2];
    sa = s[i + 3];
    dr = d[i];
    dg = d[i + 1];
    db = d[i + 2];
    da = d[i + 3];

    tmp = 0 | (sa * alpha * 32897);
    a1 = (tmp * da) >> 23;
    a2 = (tmp * (255 - da)) >> 23;
    a3 = ((8388735 - tmp) * da) >> 23;
    a = a1 + a2 + a3;
    d[i + 3] = a;
    if (a) {
      if (sr < 128) {
        r = dr - (((((255 - (sr << 1)) * dr * 32897) >> 23) * (255 - dr) * 32897) >> 23);
      } else {
        if (dr < 64) {
          tmp = ((((((dr << 4) - 3060) * 32897) >> 23) * dr + 1020) * dr * 32897) >> 23;
        } else {
          tmp = Math.sqrt(dr / 255) * 255;
        }
        r = dr + ((((sr << 1) - 255) * (tmp - dr) * 32897) >> 23);
      }

      if (sg < 128) {
        g = dg - (((((255 - (sg << 1)) * dg * 32897) >> 23) * (255 - dg) * 32897) >> 23);
      } else {
        if (dg < 64) {
          tmp = ((((((dg << 4) - 3060) * 32897) >> 23) * dg + 1020) * dg * 32897) >> 23;
        } else {
          tmp = Math.sqrt(dg / 255) * 255;
        }
        g = dg + ((((sg << 1) - 255) * (tmp - dg) * 32897) >> 23);
      }

      if (sb < 128) {
        b = db - (((((255 - (sb << 1)) * db * 32897) >> 23) * (255 - db) * 32897) >> 23);
      } else {
        if (db < 64) {
          tmp = ((((((db << 4) - 3060) * 32897) >> 23) * db + 1020) * db * 32897) >> 23;
        } else {
          tmp = Math.sqrt(db / 255) * 255;
        }
        b = db + ((((sb << 1) - 255) * (tmp - db) * 32897) >> 23);
      }

      d[i] = (r * a1 + sr * a2 + dr * a3) / a;
      d[i + 1] = (g * a1 + sg * a2 + dg * a3) / a;
      d[i + 2] = (b * a1 + sb * a2 + db * a3) / a;
    }
  }
}

function blendHardLight(
  d: Uint8ClampedArray,
  s: Uint8ClampedArray,
  w: number,
  h: number,
  alpha: number
): void {
  let sr: number,
    sg: number,
    sb: number,
    sa: number,
    dr: number,
    dg: number,
    db: number,
    da: number;
  let a1: number, a2: number, a3: number, r: number, g: number, b: number, a: number, tmp: number;
  for (let i = 0, len = (w * h) << 2; i < len; i += 4) {
    sr = s[i];
    sg = s[i + 1];
    sb = s[i + 2];
    sa = s[i + 3];
    dr = d[i];
    dg = d[i + 1];
    db = d[i + 2];
    da = d[i + 3];

    tmp = 0 | (sa * alpha * 32897);
    a1 = (tmp * da) >> 23;
    a2 = (tmp * (255 - da)) >> 23;
    a3 = ((8388735 - tmp) * da) >> 23;
    a = a1 + a2 + a3;
    d[i + 3] = a;
    if (a) {
      if (sr < 128) {
        r = (dr * sr * 32897) >> 22;
      } else {
        tmp = (sr << 1) - 255;
        r = dr + tmp - ((dr * tmp * 32897) >> 23);
      }

      if (sg < 128) {
        g = (dg * sg * 32897) >> 22;
      } else {
        tmp = (sg << 1) - 255;
        g = dg + tmp - ((dg * tmp * 32897) >> 23);
      }

      if (sb < 128) {
        b = (db * sb * 32897) >> 22;
      } else {
        tmp = (sb << 1) - 255;
        b = db + tmp - ((db * tmp * 32897) >> 23);
      }

      d[i] = (r * a1 + sr * a2 + dr * a3) / a;
      d[i + 1] = (g * a1 + sg * a2 + dg * a3) / a;
      d[i + 2] = (b * a1 + sb * a2 + db * a3) / a;
    }
  }
}

function blendVividLight(
  d: Uint8ClampedArray,
  s: Uint8ClampedArray,
  w: number,
  h: number,
  alpha: number
): void {
  let sr: number,
    sg: number,
    sb: number,
    sa: number,
    dr: number,
    dg: number,
    db: number,
    da: number;
  let a1: number, a2: number, a3: number, r: number, g: number, b: number, a: number, tmp: number;
  for (let i = 0, len = (w * h) << 2; i < len; i += 4) {
    sr = s[i];
    sg = s[i + 1];
    sb = s[i + 2];
    sa = s[i + 3];
    dr = d[i];
    dg = d[i + 1];
    db = d[i + 2];
    da = d[i + 3];

    tmp = 0 | (sa * alpha * 32897);
    a1 = (tmp * da) >> 23;
    a2 = (tmp * (255 - da)) >> 23;
    a3 = ((8388735 - tmp) * da) >> 23;
    a = a1 + a2 + a3;
    d[i + 3] = a;
    if (a) {
      if (sr < 128) {
        tmp = sr << 1;
        if (sr === 0) {
          r = tmp;
        } else {
          r = Math.max(0, 255 - ((255 - dr) * 255) / tmp);
        }
      } else {
        tmp = ((sr - 128) << 1) + 1;
        /* if (dr === 0) {
                    r = 255;
                } else */
        if (tmp === 255) {
          r = tmp;
        } else {
          r = Math.min(255, (dr * 255) / (255 - tmp));
        }
      }

      if (sg < 128) {
        tmp = sg << 1;
        if (sg === 0) {
          g = tmp;
        } else {
          g = Math.max(0, 255 - ((255 - dg) * 255) / tmp);
        }
      } else {
        tmp = ((sg - 128) << 1) + 1;
        /* if (dg === 0) {
                    g = 255;
                } else */
        if (tmp === 255) {
          g = tmp;
        } else {
          g = Math.min(255, (dg * 255) / (255 - tmp));
        }
      }

      if (sb < 128) {
        tmp = sb << 1;
        if (sb === 0) {
          b = tmp;
        } else {
          b = Math.max(0, 255 - ((255 - db) * 255) / tmp);
        }
      } else {
        tmp = ((sb - 128) << 1) + 1;
        /* if (db === 0) {
                    b = 255;
                } else */
        if (tmp === 255) {
          b = tmp;
        } else {
          b = Math.min(255, (db * 255) / (255 - tmp));
        }
      }

      d[i] = (r * a1 + sr * a2 + dr * a3) / a;
      d[i + 1] = (g * a1 + sg * a2 + dg * a3) / a;
      d[i + 2] = (b * a1 + sb * a2 + db * a3) / a;
    }
  }
}

function blendLinearLight(
  d: Uint8ClampedArray,
  s: Uint8ClampedArray,
  w: number,
  h: number,
  alpha: number
): void {
  let sr: number,
    sg: number,
    sb: number,
    sa: number,
    dr: number,
    dg: number,
    db: number,
    da: number;
  let a1: number, a2: number, a3: number, r: number, g: number, b: number, a: number, tmp: number;
  for (let i = 0, len = (w * h) << 2; i < len; i += 4) {
    sr = s[i];
    sg = s[i + 1];
    sb = s[i + 2];
    sa = s[i + 3];
    dr = d[i];
    dg = d[i + 1];
    db = d[i + 2];
    da = d[i + 3];

    tmp = 0 | (sa * alpha * 32897);
    a1 = (tmp * da) >> 23;
    a2 = (tmp * (255 - da)) >> 23;
    a3 = ((8388735 - tmp) * da) >> 23;
    a = a1 + a2 + a3;
    d[i + 3] = a;
    if (a) {
      if (sr < 128) {
        r = dr + (sr << 1) - 255;
      } else {
        r = dr + ((sr - 128) << 1);
      }

      if (sg < 128) {
        g = dg + (sg << 1) - 255;
      } else {
        g = dg + ((sg - 128) << 1);
      }

      if (sb < 128) {
        b = db + (sb << 1) - 255;
      } else {
        b = db + ((sb - 128) << 1);
      }

      d[i] = (r * a1 + sr * a2 + dr * a3) / a;
      d[i + 1] = (g * a1 + sg * a2 + dg * a3) / a;
      d[i + 2] = (b * a1 + sb * a2 + db * a3) / a;
    }
  }
}

function blendPinLight(
  d: Uint8ClampedArray,
  s: Uint8ClampedArray,
  w: number,
  h: number,
  alpha: number
): void {
  let sr: number,
    sg: number,
    sb: number,
    sa: number,
    dr: number,
    dg: number,
    db: number,
    da: number;
  let a1: number, a2: number, a3: number, r: number, g: number, b: number, a: number, tmp: number;
  for (let i = 0, len = (w * h) << 2; i < len; i += 4) {
    sr = s[i];
    sg = s[i + 1];
    sb = s[i + 2];
    sa = s[i + 3];
    dr = d[i];
    dg = d[i + 1];
    db = d[i + 2];
    da = d[i + 3];

    tmp = 0 | (sa * alpha * 32897);
    a1 = (tmp * da) >> 23;
    a2 = (tmp * (255 - da)) >> 23;
    a3 = ((8388735 - tmp) * da) >> 23;
    a = a1 + a2 + a3;
    d[i + 3] = a;
    if (a) {
      if (sr < 128) {
        tmp = sr << 1;
        if (tmp < dr) {
          r = tmp;
        } else {
          r = dr;
        }
      } else {
        tmp = (sr - 128) << 1;
        if (tmp > dr) {
          r = tmp;
        } else {
          r = dr;
        }
      }

      if (sg < 128) {
        tmp = sg << 1;
        if (tmp < dg) {
          g = tmp;
        } else {
          g = dg;
        }
      } else {
        tmp = (sg - 128) << 1;
        if (tmp > dg) {
          g = tmp;
        } else {
          g = dg;
        }
      }

      if (sb < 128) {
        tmp = sb << 1;
        if (tmp < db) {
          b = tmp;
        } else {
          b = db;
        }
      } else {
        tmp = (sb - 128) << 1;
        if (tmp > db) {
          b = tmp;
        } else {
          b = db;
        }
      }

      d[i] = (r * a1 + sr * a2 + dr * a3) / a;
      d[i + 1] = (g * a1 + sg * a2 + dg * a3) / a;
      d[i + 2] = (b * a1 + sb * a2 + db * a3) / a;
    }
  }
}

function blendHardMix(
  d: Uint8ClampedArray,
  s: Uint8ClampedArray,
  w: number,
  h: number,
  alpha: number
): void {
  let sr: number,
    sg: number,
    sb: number,
    sa: number,
    dr: number,
    dg: number,
    db: number,
    da: number;
  let a1: number, a2: number, a3: number, r: number, g: number, b: number, a: number, tmp: number;
  for (let i = 0, len = (w * h) << 2; i < len; i += 4) {
    sr = s[i];
    sg = s[i + 1];
    sb = s[i + 2];
    sa = s[i + 3];
    dr = d[i];
    dg = d[i + 1];
    db = d[i + 2];
    da = d[i + 3];

    tmp = 0 | (sa * alpha * 32897);
    a1 = (tmp * da) >> 23;
    a2 = (tmp * (255 - da)) >> 23;
    a3 = ((8388735 - tmp) * da) >> 23;
    a = a1 + a2 + a3;
    d[i + 3] = a;
    if (a) {
      if (sr < 128) {
        tmp = sr << 1;
        if (sr !== 0) {
          tmp = Math.max(0, 255 - ((255 - dr) * 255) / tmp);
        }
      } else {
        if (dr === 0) {
          tmp = 0;
        } else {
          tmp = ((sr - 128) << 1) + 1;
          if (tmp !== 255) {
            tmp = Math.min(255, (dr * 255) / (255 - tmp));
          }
        }
      }
      r = tmp < 128 ? 0 : 255;

      if (sg < 128) {
        tmp = sg << 1;
        if (sg !== 0) {
          tmp = Math.max(0, 255 - ((255 - dg) * 255) / tmp);
        }
      } else {
        if (dg === 0) {
          tmp = 0;
        } else {
          tmp = ((sg - 128) << 1) + 1;
          if (tmp !== 255) {
            tmp = Math.min(255, (dg * 255) / (255 - tmp));
          }
        }
      }
      g = tmp < 128 ? 0 : 255;

      if (sb < 128) {
        tmp = sb << 1;
        if (sb !== 0) {
          tmp = Math.max(0, 255 - ((255 - db) * 255) / tmp);
        }
      } else {
        if (db === 0) {
          tmp = 0;
        } else {
          tmp = ((sb - 128) << 1) + 1;
          if (tmp !== 255) {
            tmp = Math.min(255, (db * 255) / (255 - tmp));
          }
        }
      }
      b = tmp < 128 ? 0 : 255;

      d[i] = (r * a1 + sr * a2 + dr * a3) / a;
      d[i + 1] = (g * a1 + sg * a2 + dg * a3) / a;
      d[i + 2] = (b * a1 + sb * a2 + db * a3) / a;
    }
  }
}

function blendDifference(
  d: Uint8ClampedArray,
  s: Uint8ClampedArray,
  w: number,
  h: number,
  alpha: number
): void {
  let sr: number,
    sg: number,
    sb: number,
    sa: number,
    dr: number,
    dg: number,
    db: number,
    da: number;
  let a1: number, a2: number, a3: number, r: number, g: number, b: number, a: number, tmp: number;
  for (let i = 0, len = (w * h) << 2; i < len; i += 4) {
    sr = s[i];
    sg = s[i + 1];
    sb = s[i + 2];
    sa = s[i + 3];
    dr = d[i];
    dg = d[i + 1];
    db = d[i + 2];
    da = d[i + 3];

    tmp = 0 | (sa * alpha * 32897);
    a1 = (tmp * da) >> 23;
    a2 = (tmp * (255 - da)) >> 23;
    a3 = ((8388735 - tmp) * da) >> 23;
    a = a1 + a2 + a3;
    d[i + 3] = a;
    if (a) {
      tmp = dr - sr;
      r = tmp < 0 ? -tmp : tmp;

      tmp = dg - sg;
      g = tmp < 0 ? -tmp : tmp;

      tmp = db - sb;
      b = tmp < 0 ? -tmp : tmp;

      d[i] = (r * a1 + sr * a2 + dr * a3) / a;
      d[i + 1] = (g * a1 + sg * a2 + dg * a3) / a;
      d[i + 2] = (b * a1 + sb * a2 + db * a3) / a;
    }
  }
}

function blendExclusion(
  d: Uint8ClampedArray,
  s: Uint8ClampedArray,
  w: number,
  h: number,
  alpha: number
): void {
  let sr: number,
    sg: number,
    sb: number,
    sa: number,
    dr: number,
    dg: number,
    db: number,
    da: number;
  let a1: number, a2: number, a3: number, r: number, g: number, b: number, a: number, tmp: number;
  for (let i = 0, len = (w * h) << 2; i < len; i += 4) {
    sr = s[i];
    sg = s[i + 1];
    sb = s[i + 2];
    sa = s[i + 3];
    dr = d[i];
    dg = d[i + 1];
    db = d[i + 2];
    da = d[i + 3];

    tmp = 0 | (sa * alpha * 32897);
    a1 = (tmp * da) >> 23;
    a2 = (tmp * (255 - da)) >> 23;
    a3 = ((8388735 - tmp) * da) >> 23;
    a = a1 + a2 + a3;
    d[i + 3] = a;
    if (a) {
      r = dr + sr - ((dr * sr * 32897) >> 22);

      g = dg + sg - ((dg * sg * 32897) >> 22);

      b = db + sb - ((db * sb * 32897) >> 22);

      d[i] = (r * a1 + sr * a2 + dr * a3) / a;
      d[i + 1] = (g * a1 + sg * a2 + dg * a3) / a;
      d[i + 2] = (b * a1 + sb * a2 + db * a3) / a;
    }
  }
}

function blendSubtract(
  d: Uint8ClampedArray,
  s: Uint8ClampedArray,
  w: number,
  h: number,
  alpha: number
): void {
  let sr: number,
    sg: number,
    sb: number,
    sa: number,
    dr: number,
    dg: number,
    db: number,
    da: number;
  let a1: number, a2: number, a3: number, r: number, g: number, b: number, a: number, tmp: number;
  for (let i = 0, len = (w * h) << 2; i < len; i += 4) {
    sr = s[i];
    sg = s[i + 1];
    sb = s[i + 2];
    sa = s[i + 3];
    dr = d[i];
    dg = d[i + 1];
    db = d[i + 2];
    da = d[i + 3];

    tmp = 0 | (sa * alpha * 32897);
    a1 = (tmp * da) >> 23;
    a2 = (tmp * (255 - da)) >> 23;
    a3 = ((8388735 - tmp) * da) >> 23;
    a = a1 + a2 + a3;
    d[i + 3] = a;
    if (a) {
      r = Math.max(0, dr - sr);

      g = Math.max(0, dg - sg);

      b = Math.max(0, db - sb);

      d[i] = (r * a1 + sr * a2 + dr * a3) / a;
      d[i + 1] = (g * a1 + sg * a2 + dg * a3) / a;
      d[i + 2] = (b * a1 + sb * a2 + db * a3) / a;
    }
  }
}

function blendDivide(
  d: Uint8ClampedArray,
  s: Uint8ClampedArray,
  w: number,
  h: number,
  alpha: number
): void {
  let sr: number,
    sg: number,
    sb: number,
    sa: number,
    dr: number,
    dg: number,
    db: number,
    da: number;
  let a1: number, a2: number, a3: number, r: number, g: number, b: number, a: number, tmp: number;
  for (let i = 0, len = (w * h) << 2; i < len; i += 4) {
    sr = s[i];
    sg = s[i + 1];
    sb = s[i + 2];
    sa = s[i + 3];
    dr = d[i];
    dg = d[i + 1];
    db = d[i + 2];
    da = d[i + 3];

    tmp = 0 | (sa * alpha * 32897);
    a1 = (tmp * da) >> 23;
    a2 = (tmp * (255 - da)) >> 23;
    a3 = ((8388735 - tmp) * da) >> 23;
    a = a1 + a2 + a3;
    d[i + 3] = a;
    if (a) {
      if (dr === 0) {
        r = 0;
      } else if (sr === 0) {
        r = 255;
      } else {
        r = Math.min(255, (dr / sr) * 255);
      }

      if (dg === 0) {
        g = 0;
      } else if (sg === 0) {
        g = 255;
      } else {
        g = Math.min(255, (dg / sg) * 255);
      }

      if (db === 0) {
        b = 0;
      } else if (sb === 0) {
        b = 255;
      } else {
        b = Math.min(255, (db / sb) * 255);
      }

      d[i] = (r * a1 + sr * a2 + dr * a3) / a;
      d[i + 1] = (g * a1 + sg * a2 + dg * a3) / a;
      d[i + 2] = (b * a1 + sb * a2 + db * a3) / a;
    }
  }
}

function blendHue(
  d: Uint8ClampedArray,
  s: Uint8ClampedArray,
  w: number,
  h: number,
  alpha: number
): void {
  let sr: number,
    sg: number,
    sb: number,
    sa: number,
    dr: number,
    dg: number,
    db: number,
    da: number;
  let a1: number, a2: number, a3: number, r: number, g: number, b: number, a: number, tmp: number;
  for (let i = 0, len = (w * h) << 2; i < len; i += 4) {
    sr = s[i];
    sg = s[i + 1];
    sb = s[i + 2];
    sa = s[i + 3];
    dr = d[i];
    dg = d[i + 1];
    db = d[i + 2];
    da = d[i + 3];

    tmp = 0 | (sa * alpha * 32897);
    a1 = (tmp * da) >> 23;
    a2 = (tmp * (255 - da)) >> 23;
    a3 = ((8388735 - tmp) * da) >> 23;
    a = a1 + a2 + a3;
    d[i + 3] = a;
    if (a) {
      tmp = setSat(sr, sg, sb, sat(dr, dg, db));
      r = (tmp & 0xff0000) >> 16;
      g = (tmp & 0xff00) >> 8;
      b = tmp & 0xff;
      tmp = setLum(r, g, b, lum(dr, dg, db));
      r = (tmp & 0xff0000) >> 16;
      g = (tmp & 0xff00) >> 8;
      b = tmp & 0xff;

      d[i] = (r * a1 + sr * a2 + dr * a3) / a;
      d[i + 1] = (g * a1 + sg * a2 + dg * a3) / a;
      d[i + 2] = (b * a1 + sb * a2 + db * a3) / a;
    }
  }
}

function blendSaturation(
  d: Uint8ClampedArray,
  s: Uint8ClampedArray,
  w: number,
  h: number,
  alpha: number
): void {
  let sr: number,
    sg: number,
    sb: number,
    sa: number,
    dr: number,
    dg: number,
    db: number,
    da: number;
  let a1: number, a2: number, a3: number, r: number, g: number, b: number, a: number, tmp: number;
  for (let i = 0, len = (w * h) << 2; i < len; i += 4) {
    sr = s[i];
    sg = s[i + 1];
    sb = s[i + 2];
    sa = s[i + 3];
    dr = d[i];
    dg = d[i + 1];
    db = d[i + 2];
    da = d[i + 3];

    tmp = 0 | (sa * alpha * 32897);
    a1 = (tmp * da) >> 23;
    a2 = (tmp * (255 - da)) >> 23;
    a3 = ((8388735 - tmp) * da) >> 23;
    a = a1 + a2 + a3;
    d[i + 3] = a;
    if (a) {
      tmp = setSat(dr, dg, db, sat(sr, sg, sb));
      r = (tmp & 0xff0000) >> 16;
      g = (tmp & 0xff00) >> 8;
      b = tmp & 0xff;
      tmp = setLum(r, g, b, lum(dr, dg, db));
      r = (tmp & 0xff0000) >> 16;
      g = (tmp & 0xff00) >> 8;
      b = tmp & 0xff;

      d[i] = (r * a1 + sr * a2 + dr * a3) / a;
      d[i + 1] = (g * a1 + sg * a2 + dg * a3) / a;
      d[i + 2] = (b * a1 + sb * a2 + db * a3) / a;
    }
  }
}

function blendColor(
  d: Uint8ClampedArray,
  s: Uint8ClampedArray,
  w: number,
  h: number,
  alpha: number
): void {
  let sr: number,
    sg: number,
    sb: number,
    sa: number,
    dr: number,
    dg: number,
    db: number,
    da: number;
  let a1: number, a2: number, a3: number, r: number, g: number, b: number, a: number, tmp: number;
  for (let i = 0, len = (w * h) << 2; i < len; i += 4) {
    sr = s[i];
    sg = s[i + 1];
    sb = s[i + 2];
    sa = s[i + 3];
    dr = d[i];
    dg = d[i + 1];
    db = d[i + 2];
    da = d[i + 3];

    tmp = 0 | (sa * alpha * 32897);
    a1 = (tmp * da) >> 23;
    a2 = (tmp * (255 - da)) >> 23;
    a3 = ((8388735 - tmp) * da) >> 23;
    a = a1 + a2 + a3;
    d[i + 3] = a;
    if (a) {
      tmp = setLum(sr, sg, sb, lum(dr, dg, db));
      r = (tmp & 0xff0000) >> 16;
      g = (tmp & 0xff00) >> 8;
      b = tmp & 0xff;

      d[i] = (r * a1 + sr * a2 + dr * a3) / a;
      d[i + 1] = (g * a1 + sg * a2 + dg * a3) / a;
      d[i + 2] = (b * a1 + sb * a2 + db * a3) / a;
    }
  }
}

function blendLuminosity(
  d: Uint8ClampedArray,
  s: Uint8ClampedArray,
  w: number,
  h: number,
  alpha: number
): void {
  let sr: number,
    sg: number,
    sb: number,
    sa: number,
    dr: number,
    dg: number,
    db: number,
    da: number;
  let a1: number, a2: number, a3: number, r: number, g: number, b: number, a: number, tmp: number;
  for (let i = 0, len = (w * h) << 2; i < len; i += 4) {
    sr = s[i];
    sg = s[i + 1];
    sb = s[i + 2];
    sa = s[i + 3];
    dr = d[i];
    dg = d[i + 1];
    db = d[i + 2];
    da = d[i + 3];

    tmp = 0 | (sa * alpha * 32897);
    a1 = (tmp * da) >> 23;
    a2 = (tmp * (255 - da)) >> 23;
    a3 = ((8388735 - tmp) * da) >> 23;
    a = a1 + a2 + a3;
    d[i + 3] = a;
    if (a) {
      tmp = setLum(dr, dg, db, lum(sr, sg, sb));
      r = (tmp & 0xff0000) >> 16;
      g = (tmp & 0xff00) >> 8;
      b = tmp & 0xff;

      d[i] = (r * a1 + sr * a2 + dr * a3) / a;
      d[i + 1] = (g * a1 + sg * a2 + dg * a3) / a;
      d[i + 2] = (b * a1 + sb * a2 + db * a3) / a;
    }
  }
}

const blendModes: {
  [b: string]: (
    d: Uint8ClampedArray,
    s: Uint8ClampedArray,
    w: number,
    h: number,
    alpha: number
  ) => void;
} = {
  "copy-alpha": copyAlpha,
  "copy-opaque": copyOpaque,

  // 'pass-through': blendPassThrough,
  "source-over": blendNormal,
  // 'dissolve': blendDissolve,

  darken: blendDarken,
  multiply: blendMultiply,
  "color-burn": blendColorBurn,
  "linear-burn": blendLinearBurn,
  "darker-color": blendDarkerColor,

  lighten: blendLighten,
  screen: blendScreen,
  "color-dodge": blendColorDodge,
  "linear-dodge": blendLinearDodge,
  "lighter-color": blendLighterColor,

  overlay: blendOverlay,
  "soft-light": blendSoftLight,
  "hard-light": blendHardLight,
  "vivid-light": blendVividLight,
  "linear-light": blendLinearLight,
  "pin-light": blendPinLight,
  "hard-mix": blendHardMix,

  difference: blendDifference,
  exclusion: blendExclusion,
  subtract: blendSubtract,
  divide: blendDivide,

  hue: blendHue,
  saturation: blendSaturation,
  color: blendColor,
  luminosity: blendLuminosity
};

const implementedBlendModes = enumImplementedBlendModes();

export function blend(
  dest: CanvasRenderingContext2D,
  src: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  dx: number,
  dy: number,
  w: number,
  h: number,
  alpha: number,
  blendMode: string
): void {
  if (blendMode === "normal") {
    blendMode = "source-over";
  }
  if (blendMode in implementedBlendModes) {
    dest.save();
    dest.globalAlpha = alpha;
    dest.globalCompositeOperation = blendMode as GlobalCompositeOperation;
    dest.drawImage(src.canvas, sx, sy, w, h, dx, dy, w, h);
    dest.restore();
    // console.log('native: '+blendMode);
    return;
  }

  if (dx < 0) {
    w -= dx;
    sx -= dx;
    dx = 0;
  }
  if (sx < 0) {
    w -= sx;
    dx -= sx;
    sx = 0;
  }
  if (dy < 0) {
    h -= dy;
    sy -= dy;
    dy = 0;
  }
  if (sy < 0) {
    h -= sy;
    dy -= sy;
    sy = 0;
  }
  w = Math.min(w, src.canvas.width - sx, dest.canvas.width - dx);
  h = Math.min(h, src.canvas.height - sy, dest.canvas.height - dy);
  if (w <= 0 || h <= 0 || alpha === 0) {
    return;
  }
  const imgData = dest.getImageData(dx, dy, w, h);
  const d = imgData.data;
  const s = src.getImageData(sx, sy, w, h).data;
  if (!(blendMode in blendModes)) {
    throw new Error("unimplemeneted blend mode: " + blendMode);
  }
  blendModes[blendMode](d, s, w, h, alpha);
  dest.putImageData(imgData, dx, dy);
  // console.log('js: '+blendMode);
}

function enumImplementedBlendModes(): { [b: string]: undefined } {
  const r: { [b: string]: undefined } = {};
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  if (!ctx) {
    throw new Error("cannot get CanvasRenderingContext2D");
  }
  for (const bm of Object.keys(blendModes)) {
    ctx.globalCompositeOperation = bm as GlobalCompositeOperation;
    if (ctx.globalCompositeOperation === bm) {
      r[bm] = undefined;
    }
  }
  return r;
}

function detectBrokenColorDodge(): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg" +
      "0kAAAAGUlEQVQI1wXBAQEAAAgCIOz/5TJI20UGhz5D2wX8PWbkFQAAAABJRU5ErkJggg==";
    img.onload = (e) => {
      const c = document.createElement("canvas");
      c.width = 257;
      c.height = 256;

      const ctx = c.getContext("2d");
      if (!ctx) {
        throw new Error("cannot get CanvasRenderingContext2D");
      }
      ctx.fillStyle = "rgb(255, 255, 255)";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.globalAlpha = 0.5;
      ctx.globalCompositeOperation = "color-dodge";
      ctx.drawImage(img, 0, 0);

      const d = ctx.getImageData(0, 0, 1, 1);
      resolve(d.data[0] < 128);
    };
  });
}

detectBrokenColorDodge().then((isBroken) => {
  if (isBroken) {
    delete implementedBlendModes["color-dodge"];
  }
});
