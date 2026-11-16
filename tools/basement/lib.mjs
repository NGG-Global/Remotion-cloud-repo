/**
 * Painting kit for "The Basement" motion comic.
 *
 * Every illustration is authored here as layered SVG and baked once to a
 * raster by tools/basement/bake.mjs. The expensive look (ink wobble, brush
 * texture, paper grain, glows) lives in SVG filters that run only at bake
 * time; the Remotion composition then moves flat images, which keeps the
 * 27,000-frame render cheap.
 *
 * Conventions: coordinates are pixels of the layer canvas (default
 * 1600x900, 1.25x the 720p frame so the camera can push and drift).
 * Randomness is seeded, so a re-bake is byte-stable.
 */

export const W = 1600;
export const H = 900;

export const PAL = {
  ink: "#07080b",
  char: "#111318",
  coal: "#191c22",
  slate: "#252a33",
  navy: "#1b2633",
  blue: "#34465a",
  steel: "#56687c",
  mist: "#8795a3",
  gray: "#66645f",
  dirt: "#463f36",
  wood: "#3b2c20",
  woodLt: "#5e4630",
  amberDk: "#6e4a22",
  amber: "#c08a3e",
  amberHi: "#f0c57a",
  bone: "#d8d0bd",
  paper: "#b9ae97",
  crimsonDk: "#3e070c",
  crimson: "#7c1119",
  blood: "#9a1820",
  cold: "#a9c2d6",
  white: "#eef3f6",
};

/* ---------- randomness ---------- */

export function rng(seed) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  next.range = (lo, hi) => lo + (hi - lo) * next();
  next.int = (lo, hi) => Math.floor(lo + (hi - lo + 1) * next());
  next.pick = (arr) => arr[Math.floor(next() * arr.length)];
  return next;
}

const f = (n) => (Math.round(n * 10) / 10).toString();

/* ---------- document and filters ---------- */

/**
 * Filters used by every layer.
 * - wob: hand-drawn edge wobble (displacement by low-frequency noise).
 * - paint: wobble plus an anisotropic brush-stroke texture laid over the
 *   colour with overlay blending, clipped back to the painted alpha.
 * - paintV: same with vertical strokes (walls, doors, trunks).
 * - ink: stronger wobble for linework.
 * - glow / soft / haze: blurs, only ever used at bake time.
 */
export function filterDefs(seed = 1, strength = 1) {
  const k = 0.55 * strength;
  const off = 0.5 - 0.5 * k;
  const mat = `${k / 3} ${k / 3} ${k / 3} 0 ${off}  ${k / 3} ${k / 3} ${k / 3} 0 ${off}  ${k / 3} ${k / 3} ${k / 3} 0 ${off}  0 0 0 0 1`;
  const paint = (id, freq, s) => `
  <filter id="${id}" x="-2%" y="-2%" width="104%" height="104%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.016" numOctaves="2" seed="${seed}" result="n1"/>
    <feDisplacementMap in="SourceGraphic" in2="n1" scale="${s}" xChannelSelector="R" yChannelSelector="G" result="d"/>
    <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="4" seed="${seed + 7}" result="n2"/>
    <feColorMatrix in="n2" type="matrix" values="${mat}" result="g2"/>
    <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="1" seed="${seed + 3}" result="n3"/>
    <feColorMatrix in="n3" type="matrix" values="0.12 0.12 0.12 0 0.32  0.12 0.12 0.12 0 0.32  0.12 0.12 0.12 0 0.32  0 0 0 0 1" result="g3"/>
    <feBlend in="g2" in2="d" mode="overlay" result="b1"/>
    <feBlend in="g3" in2="b1" mode="overlay" result="b2"/>
    <feComposite in="b2" in2="d" operator="in"/>
  </filter>`;
  return `
  ${paint("paint", "0.006 0.05", 6)}
  ${paint("paintV", "0.05 0.006", 6)}
  ${paint("paintS", "0.03 0.03", 5)}
  <filter id="wob" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="${seed + 11}" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <filter id="ink" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="${seed + 13}" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18"/></filter>
  <filter id="glowS" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
  <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>
  <filter id="haze" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="40"/></filter>
  <filter id="dry" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.02 0.5" numOctaves="3" seed="${seed + 21}" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3.2 2.0" result="m"/>
    <feComposite in="SourceGraphic" in2="m" operator="in"/>
  </filter>`;
}

export function doc(w, h, body, { bg = null, seed = 1, strength = 1, defs = "" } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs>${filterDefs(seed, strength)}${defs}</defs>
${bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : ""}
${body}
</svg>`;
}

/* ---------- gradients ---------- */

let gid = 0;
export function resetIds() {
  gid = 0;
}
/** Returns [defString, url] for a linear gradient. stops: [[offset, color, opacity?], ...] */
export function lin(stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) {
  const id = `lg${gid++}`;
  return [
    `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops
      .map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`)
      .join("")}</linearGradient>`,
    `url(#${id})`,
  ];
}
export function rad(stops, cx = 0.5, cy = 0.5, r = 0.5, fx, fy) {
  const id = `rg${gid++}`;
  return [
    `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"${fx !== undefined ? ` fx="${fx}" fy="${fy}"` : ""}>${stops
      .map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`)
      .join("")}</radialGradient>`,
    `url(#${id})`,
  ];
}
/** Gradient in user space (absolute coordinates). */
export function linU(stops, x1, y1, x2, y2) {
  const id = `lu${gid++}`;
  return [
    `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}">${stops
      .map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`)
      .join("")}</linearGradient>`,
    `url(#${id})`,
  ];
}
export function radU(stops, cx, cy, r) {
  const id = `ru${gid++}`;
  return [
    `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}">${stops
      .map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`)
      .join("")}</radialGradient>`,
    `url(#${id})`,
  ];
}

/* ---------- primitives ---------- */

export const poly = (pts, attrs = "") =>
  `<polygon points="${pts.map(([x, y]) => `${f(x)},${f(y)}`).join(" ")}" ${attrs}/>`;
export const rect = (x, y, w, h, attrs = "") =>
  `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" ${attrs}/>`;
export const ell = (cx, cy, rx, ry, attrs = "") =>
  `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" ${attrs}/>`;
export const line = (x1, y1, x2, y2, attrs = "") =>
  `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" ${attrs}/>`;
export const g = (attrs, ...kids) => `<g ${attrs}>${kids.join("")}</g>`;
export const path = (d, attrs = "") => `<path d="${d}" ${attrs}/>`;

/** Smooth closed path through points (Catmull-Rom to Bezier). */
export function smooth(pts, closed = true, t = 0.5) {
  const n = pts.length;
  const p = (i) => pts[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = p(i - 1), p1 = p(i), p2 = p(i + 1), p3 = p(i + 2);
    const c1 = [p1[0] + ((p2[0] - p0[0]) * t) / 3, p1[1] + ((p2[1] - p0[1]) * t) / 3];
    const c2 = [p2[0] - ((p3[0] - p1[0]) * t) / 3, p2[1] - ((p3[1] - p1[1]) * t) / 3];
    d += ` C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
  }
  return d + (closed ? "Z" : "");
}

/** Brush stroke: a tapered ribbon along a polyline, like a loaded brush. */
export function stroke(pts, w0, w1, fill, attrs = "") {
  const n = pts.length;
  const L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const t = i / (n - 1);
    const w = (w0 + (w1 - w0) * t) * Math.sin(Math.PI * Math.min(1, 0.15 + t * 0.85)) * 0.5 + 0.3;
    L.push([pts[i][0] + nx * w, pts[i][1] + ny * w]);
    R.push([pts[i][0] - nx * w, pts[i][1] - ny * w]);
  }
  return path(smooth([...L, ...R.reverse()], true, 0.4), `fill="${fill}" ${attrs}`);
}

/** Many loose brush strokes in a box: the painted texture of a surface. */
export function scumble(r, x, y, w, h, n, colors, { len = [40, 140], width = [2, 7], angle = 0, jitter = 0.25, opacity = [0.15, 0.4] } = {}) {
  let out = "";
  for (let i = 0; i < n; i++) {
    const cx = x + r() * w, cy = y + r() * h;
    const l = r.range(len[0], len[1]);
    const a = angle + r.range(-jitter, jitter);
    const pts = [];
    for (let k = 0; k <= 4; k++) {
      const t = k / 4 - 0.5;
      pts.push([cx + Math.cos(a) * l * t + r.range(-2, 2), cy + Math.sin(a) * l * t + r.range(-2, 2)]);
    }
    out += stroke(pts, r.range(width[0], width[1]), r.range(width[0], width[1]), r.pick(colors), `opacity="${f(r.range(opacity[0], opacity[1]))}"`);
  }
  return out;
}

/** Diagonal ink hatching clipped to a shape (pass the clip id). */
export function hatch(r, clipId, x, y, w, h, { gap = 9, angle = -0.9, color = PAL.ink, width = 1.4, opacity = 0.55 } = {}) {
  let out = "";
  const ca = Math.cos(angle), sa = Math.sin(angle);
  const diag = Math.hypot(w, h);
  const cx = x + w / 2, cy = y + h / 2;
  for (let d = -diag / 2; d < diag / 2; d += gap * r.range(0.7, 1.3)) {
    const ox = cx - sa * d, oy = cy + ca * d;
    const l = diag / 2;
    out += line(ox - ca * l, oy - sa * l, ox + ca * l, oy + sa * l, `stroke="${color}" stroke-width="${f(width * r.range(0.6, 1.3))}" opacity="${f(opacity * r.range(0.6, 1))}"`);
  }
  return `<g clip-path="url(#${clipId})" filter="url(#ink)">${out}</g>`;
}

/** Ink splatter / dry speckle. */
export function speckle(r, x, y, w, h, n, color, size = [0.6, 2.4], opacity = 0.5) {
  let out = "";
  for (let i = 0; i < n; i++) {
    out += ell(x + r() * w, y + r() * h, r.range(size[0], size[1]), r.range(size[0], size[1]), `fill="${color}" opacity="${f(opacity * r.range(0.3, 1))}"`);
  }
  return out;
}

/** Soft light pool. Blend 'screen' adds light; 'normal' tints. */
export function glow(cx, cy, rx, ry, color, opacity = 0.6, blend = "screen") {
  const [d, u] = rad([[0, color, 1], [0.35, color, 0.45], [1, color, 0]]);
  return `<defs>${d}</defs>${ell(cx, cy, rx, ry, `fill="${u}" opacity="${f(opacity)}" style="mix-blend-mode:${blend}"`)}`;
}

/** Cone of light from (x,y) toward angle (radians), with soft edges. */
export function cone(x, y, angle, spread, len, color, opacity = 0.35) {
  const [d, u] = linU([[0, color, 0.95], [0.55, color, 0.35], [1, color, 0]], x, y, x + Math.cos(angle) * len, y + Math.sin(angle) * len);
  const a1 = angle - spread, a2 = angle + spread;
  const pts = [[x + Math.cos(angle + Math.PI / 2) * 4, y + Math.sin(angle + Math.PI / 2) * 4], [x + Math.cos(a1) * len, y + Math.sin(a1) * len], [x + Math.cos(a2) * len, y + Math.sin(a2) * len], [x - Math.cos(angle + Math.PI / 2) * 4, y - Math.sin(angle + Math.PI / 2) * 4]];
  return `<defs>${d}</defs><g filter="url(#glowS)" style="mix-blend-mode:screen" opacity="${f(opacity)}">${poly(pts, `fill="${u}"`)}</g>`;
}

/** Vignette and paper finish baked into an opaque background layer. */
export function finish(w, h, { vignette = 0.75, tint = null, tintOpacity = 0.12, seed = 5 } = {}) {
  const [d, u] = rad([[0.45, "#000", 0], [1, "#000", vignette]], 0.5, 0.48, 0.75);
  const id = `paperN${seed}`;
  return `<defs>${d}<filter id="${id}" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${seed}"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.48  0 0 0 0 0.45  0 0 0 0.9 -0.42"/>
  </filter></defs>
  <rect width="${w}" height="${h}" filter="url(#${id})" style="mix-blend-mode:overlay" opacity="0.55"/>
  ${tint ? `<rect width="${w}" height="${h}" fill="${tint}" opacity="${tintOpacity}" style="mix-blend-mode:color"/>` : ""}
  <rect width="${w}" height="${h}" fill="${u}"/>`;
}

/* ---------- figure rig ---------- */

/**
 * A faceless human figure built from tapered capsules. There is no face
 * geometry at all: heads are hair masses, hoods or caps seen from behind or
 * as silhouettes, which enforces the no-faces rule by construction.
 *
 * Angles are degrees. Limbs: 0 = hanging straight down, positive swings
 * toward screen right. Torso/head: 0 = upright, positive leans right.
 */
const BUILDS = {
  // widths are in head units (u); h scales overall height
  teen: { h: 1, sh: 1.9, waist: 1.2, hip: 1.3, belly: 0, limb: 1, hand: 1, head: 1, neck: 1 },
  athlete: { h: 1.03, sh: 2.15, waist: 1.25, hip: 1.3, belly: 0, limb: 1.08, hand: 1, head: 0.97, neck: 1.1 },
  stocky: { h: 0.98, sh: 2.15, waist: 1.5, hip: 1.45, belly: 0.25, limb: 1.15, hand: 1.05, head: 1.03, neck: 1.25 },
  lanky: { h: 1.06, sh: 1.8, waist: 1.1, hip: 1.2, belly: 0, limb: 0.9, hand: 1, head: 0.96, neck: 0.95 },
  adult: { h: 1.02, sh: 2.05, waist: 1.45, hip: 1.45, belly: 0.2, limb: 1.08, hand: 1.05, head: 1, neck: 1.2 },
  giant: { h: 1.12, sh: 2.85, waist: 2.6, hip: 2.4, belly: 0.6, limb: 1.75, arm: 1.3, hand: 1.45, head: 1.08, neck: 2.2 },
};

export const POSE = {
  stand: {},
  walk: { lThigh: -14, lShin: -4, rThigh: 18, rShin: 26, lUp: 14, lFore: 8, rUp: -14, rFore: -24 },
  hunch: { torso: 4, head: 16, lUp: -6, rUp: 6, lFore: 16, rFore: -16 },
  pocket: { lUp: -10, lFore: 22, rUp: 10, rFore: -22 },
  walkB: { lThigh: -6, lShin: 8, rThigh: 7, rShin: 2, lUp: -4, lFore: -2, rUp: 4, rFore: 3 },
  walkB2: { lThigh: 6, lShin: 1, rThigh: -5, rShin: 9, lUp: -3, lFore: 2, rUp: 3, rFore: -2 },
  standB: { lUp: -3, lFore: -1, rUp: 3, rFore: 1 },
  point: { rUp: 95, rFore: 92, torso: 3 },
  fist: { rUp: 160, rFore: 176, lUp: -6 },
  kick: { torso: 14, rThigh: -84, rShin: -92, lThigh: 4, lShin: 2, lUp: -30, lFore: -10, rUp: 40, rFore: 70 },
  shoulder: { torso: -26, head: -14, lUp: -70, lFore: -40, rUp: 20, rFore: 40, lThigh: 16, lShin: 6, rThigh: -24, rShin: -6 },
  crouch: { torso: 22, head: 22, lThigh: -82, lShin: 8, rThigh: -62, rShin: 14, hipDrop: 0.26, lUp: -20, lFore: -50, rUp: -10, rFore: -30 },
  collapse: { torso: 64, head: 40, lThigh: -88, lShin: -4, rThigh: -72, rShin: -24, hipDrop: 0.36, lUp: -60, lFore: -40, rUp: 20, rFore: 30 },
  reach: { rUp: 70, rFore: 80, torso: 3 },
  raise: { rUp: 160, rFore: 170, lUp: -160, lFore: -170 },
  flinch: { torso: -8, head: -24, lUp: 120, lFore: 170, rUp: 140, rFore: -160 },
  phone: { rUp: 24, rFore: 150, head: 3 },
  phoneL: { lUp: -24, lFore: -150, head: -3 },
  grab: { rUp: 70, rFore: 60, lUp: 40, lFore: 70, torso: 6 },
  swing: { torso: -16, rUp: -170, rFore: -150, lUp: 40, lFore: 20, lThigh: -20, rThigh: 18, rShin: 20 },
  sit: { lThigh: -90, lShin: 0, rThigh: -88, rShin: 4, hipDrop: 0.25, lUp: -10, lFore: 40, rUp: 10, rFore: 50 },
  slump: { torso: 14, head: 36, lUp: 4, rUp: -4, lFore: 2, rFore: -2 },
  hang: { lUp: -168, lFore: -178, rUp: 168, rFore: 178, lThigh: 3, rThigh: -3, head: 30 },
  comb: { rUp: 150, rFore: -140, head: 4, lUp: -4 },
  shove: { torso: 10, rUp: 80, rFore: 85, lUp: 70, lFore: 80, lThigh: -10, rThigh: 16, rShin: 22 },
  handOn: { rUp: 60, rFore: 30, lUp: -6 },
};

function capsule(ax, ay, ar, bx, by, br) {
  const dx = bx - ax, dy = by - ay;
  const d = Math.hypot(dx, dy) || 0.001;
  const ux = dx / d, uy = dy / d;
  const nx = -uy, ny = ux;
  const sinA = Math.max(-0.99, Math.min(0.99, (ar - br) / d));
  const cosA = Math.sqrt(1 - sinA * sinA);
  const p1 = [ax + (nx * cosA + ux * sinA) * ar, ay + (ny * cosA + uy * sinA) * ar];
  const p2 = [bx + (nx * cosA + ux * sinA) * br, by + (ny * cosA + uy * sinA) * br];
  const p3 = [bx - (nx * cosA - ux * sinA) * br, by - (ny * cosA - uy * sinA) * br];
  const p4 = [ax - (nx * cosA - ux * sinA) * ar, ay - (ny * cosA - uy * sinA) * ar];
  return `M${f(p1[0])},${f(p1[1])} L${f(p2[0])},${f(p2[1])} A${f(br)},${f(br)} 0 1 0 ${f(p3[0])},${f(p3[1])} L${f(p4[0])},${f(p4[1])} A${f(ar)},${f(ar)} 0 1 0 ${f(p1[0])},${f(p1[1])}Z`;
}

const rad2 = (deg) => (deg * Math.PI) / 180;
const limbEnd = (x, y, len, deg) => [x + Math.sin(rad2(deg)) * len, y + Math.cos(rad2(deg)) * len];
const upEnd = (x, y, len, deg) => [x + Math.sin(rad2(deg)) * len, y - Math.cos(rad2(deg)) * len];

/**
 * Returns { parts: [{d, layer}], joints } in figure space: origin at the
 * feet, y up negative, height ~ size px.
 * opts: build, pose (object or key), size, hood, cap, hair, coat, bag,
 *       face: 'left'|'right' only bends the head silhouette, never features.
 */
export function figureParts(opts = {}) {
  const b = BUILDS[opts.build ?? "teen"];
  const P = { ...(typeof opts.pose === "string" ? POSE[opts.pose] : opts.pose ?? {}) };
  const S = (opts.size ?? 400) * b.h;
  const u = S / 7.4; // head units
  const legLen = u * 3.5;
  const thigh = legLen * 0.52, shin = legLen * 0.48;
  const torsoLen = u * 2.55;
  const upArm = u * 1.45, foreArm = u * 1.3;
  const shW = u * b.sh * 0.5, waistW = u * b.waist * 0.5, hipW = u * b.hip * 0.5;
  const lw = b.limb;
  const hipDrop = (P.hipDrop ?? 0) * S;
  const hx = P.hipX ?? 0;
  const hy = -legLen - u * 0.12 + hipDrop;
  const torso = P.torso ?? 0;
  const [cx, cy] = upEnd(hx, hy, torsoLen, torso);
  const ta = rad2(torso);
  const perp = [Math.cos(ta), Math.sin(ta)];
  const shL = [cx - perp[0] * shW * 0.88, cy - perp[1] * shW * 0.88 + u * 0.2];
  const shR = [cx + perp[0] * shW * 0.88, cy + perp[1] * shW * 0.88 + u * 0.2];
  const [nx, ny] = upEnd(cx, cy, u * 0.35, torso);
  const headA = torso + (P.head ?? 0);
  const [hcx, hcy] = upEnd(nx, ny, u * 0.55 * b.head, headA);
  const parts = [];
  const add = (d, layer = 0) => parts.push({ d, layer });

  // legs
  const hipL = [hx - hipW * 0.5, hy], hipR = [hx + hipW * 0.5, hy];
  const legW = u * 0.36 * lw;
  for (const [side, hp] of [["l", hipL], ["r", hipR]]) {
    const ta2 = P[`${side}Thigh`] ?? 0;
    const knee = limbEnd(hp[0], hp[1], thigh, ta2);
    const ankle = limbEnd(knee[0], knee[1], shin, P[`${side}Shin`] ?? ta2);
    add(capsule(hp[0], hp[1], legW, knee[0], knee[1], legW * 0.82), side === "l" ? -1 : 1);
    add(capsule(knee[0], knee[1], legW * 0.8, ankle[0], ankle[1], legW * 0.58), side === "l" ? -1 : 1);
    const dir = opts.facing === "left" ? -1 : 1;
    add(`M${f(ankle[0] - u * 0.22 * dir)},${f(ankle[1] - u * 0.08)} q${f(u * 0.5 * dir)},${f(-u * 0.12)} ${f(u * 0.62 * dir)},${f(u * 0.14)} l0,${f(u * 0.12)} l${f(-u * 0.78 * dir)},0 z`, side === "l" ? -1 : 1);
  }
  // torso
  const hipPts = [[hx + hipW, hy + u * 0.18], [hx - hipW, hy + u * 0.18]];
  const mid = upEnd(hx, hy, torsoLen * 0.45, torso * 0.6);
  const bel = b.belly * u;
  const torsoPts = [
    shL,
    [cx - perp[0] * shW * 0.55, cy - perp[1] * shW * 0.55 - u * 0.08],
    [cx + perp[0] * shW * 0.55, cy + perp[1] * shW * 0.55 - u * 0.08],
    shR,
    [shR[0] + perp[0] * u * 0.05, shR[1] + u * 0.35],
    [mid[0] + perp[0] * (waistW + bel * 0.7), mid[1] + perp[1] * (waistW + bel)],
    hipPts[0],
    [hx, hy + u * 0.26 + bel * 0.25],
    hipPts[1],
    [mid[0] - perp[0] * (waistW + bel * 0.7), mid[1] - perp[1] * (waistW + bel)],
    [shL[0] - perp[0] * u * 0.05, shL[1] + u * 0.35],
  ];
  if (opts.coat) {
    const cl = opts.coat * u;
    torsoPts.splice(6, 3, [hx + hipW * 1.15 + perp[0] * 4, hy + cl], [hx, hy + cl + u * 0.1], [hx - hipW * 1.15, hy + cl]);
  }
  add(smooth(torsoPts, true, 0.45), 0);
  // neck + head
  add(capsule(cx, cy + u * 0.1, u * 0.27 * b.neck, nx, ny, u * 0.24 * b.neck), 0);
  const hr = u * 0.5 * b.head;
  const hAng = headA;
  add(`<ellipse-head cx="${hcx}" cy="${hcy}" rx="${hr * 0.86}" ry="${hr}" rot="${hAng}"/>`, 2);
  if (opts.hood) {
    // hood up: a draped cowl, peaked at the crown and spreading onto the shoulders
    add(smooth([[nx - u * 0.75, ny + u * 0.55], [hcx - hr * 1.25, hcy + hr * 0.2], [hcx - hr * 1.05, hcy - hr * 0.75], [hcx - hr * 0.2, hcy - hr * 1.4], [hcx + hr * 0.15, hcy - hr * 1.45], [hcx + hr * 1.05, hcy - hr * 0.8], [hcx + hr * 1.25, hcy + hr * 0.2], [nx + u * 0.75, ny + u * 0.55]], true, 0.5), 2);
  }
  if (opts.beanie) {
    add(smooth([[hcx - hr * 1.0, hcy - hr * 0.15], [hcx - hr * 0.85, hcy - hr * 0.95], [hcx, hcy - hr * 1.35], [hcx + hr * 0.85, hcy - hr * 0.95], [hcx + hr * 1.0, hcy - hr * 0.15]], true, 0.6), 2);
  }
  if (opts.cap) {
    add(smooth([[hcx - hr * 0.95, hcy - hr * 0.15], [hcx - hr * 0.7, hcy - hr * 1.0], [hcx + hr * 0.7, hcy - hr * 1.0], [hcx + hr * 0.95, hcy - hr * 0.15]], true, 0.5), 2);
    add(`M${f(hcx + hr * 0.7)},${f(hcy - hr * 0.3)} l${f(hr * 0.9)},${f(hr * 0.12)} l${f(-hr * 0.1)},${f(hr * 0.2)} l${f(-hr * 0.85)},${f(-hr * 0.05)}z`, 2);
  }
  if (opts.hair === "messy") {
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI * 0.98 + (i / 8) * Math.PI * 0.96;
      const px = hcx + Math.cos(a) * hr * 0.85, py = hcy + Math.sin(a) * hr * 0.9;
      const tx = px + Math.cos(a + 0.4) * hr * 0.45, ty = py + Math.sin(a + 0.4) * hr * 0.45;
      add(`M${f(px - hr * 0.2)},${f(py + hr * 0.1)} Q${f(tx)},${f(ty - 2)} ${f(tx)},${f(ty)} L${f(px + hr * 0.2)},${f(py + hr * 0.12)}z`, 2);
    }
  }
  if (opts.hair === "short") {
    add(smooth([[hcx - hr * 0.95, hcy - hr * 0.05], [hcx - hr * 0.8, hcy - hr * 0.95], [hcx, hcy - hr * 1.12], [hcx + hr * 0.85, hcy - hr * 0.9], [hcx + hr * 0.98, hcy - hr * 0.05]], true, 0.6), 2);
  }
  if (opts.collar) {
    add(smooth([[nx - u * 0.55, ny + u * 0.45], [nx - u * 0.42, ny - u * 0.12], [nx, ny + u * 0.05], [nx + u * 0.42, ny - u * 0.12], [nx + u * 0.55, ny + u * 0.45]], true, 0.5), 1);
  }
  if (opts.hoodie) {
    // bulk of a hoodie: hood lying on the back plus a looser torso
    add(smooth([[nx - u * 0.5, ny + u * 0.75], [nx - u * 0.42, ny + u * 0.08], [nx, ny + u * 0.22], [nx + u * 0.42, ny + u * 0.08], [nx + u * 0.5, ny + u * 0.75]], true, 0.5), 1);
  }
  // arms
  const armW = u * 0.27 * (b.arm ?? lw);
  const handR = u * 0.24 * b.hand;
  const hands = {};
  for (const [side, sp] of [["l", shL], ["r", shR]]) {
    const ua = P[`${side}Up`] ?? (side === "l" ? 6 : -6);
    const fa = P[`${side}Fore`] ?? ua * 0.6;
    const el = limbEnd(sp[0], sp[1], upArm, ua);
    const wr = limbEnd(el[0], el[1], foreArm, fa);
    add(capsule(sp[0], sp[1], armW * 1.08, el[0], el[1], armW * 0.85), side === "l" ? -2 : 2);
    add(capsule(el[0], el[1], armW * 0.82, wr[0], wr[1], armW * 0.62), side === "l" ? -2 : 2);
    const hd = limbEnd(wr[0], wr[1], handR * 0.9, fa);
    add(capsule(wr[0], wr[1], handR * 0.8, hd[0], hd[1], handR * 0.95), side === "l" ? -2 : 2);
    hands[side] = hd;
  }
  return { parts, hands, head: [hcx, hcy, hr], shoulders: [shL, shR], hip: [hx, hy], u, S };
}

function partSvg(p) {
  if (p.d.startsWith("<ellipse-head")) {
    const m = Object.fromEntries([...p.d.matchAll(/(\w+)="([^"]+)"/g)].map((x) => [x[1], parseFloat(x[2])]));
    return `<ellipse cx="${f(m.cx)}" cy="${f(m.cy)}" rx="${f(m.rx)}" ry="${f(m.ry)}" transform="rotate(${f(m.rot)} ${f(m.cx)} ${f(m.cy)})"/>`;
  }
  return `<path d="${p.d}"/>`;
}

let figId = 0;
/**
 * Draws a silhouette figure at (x, y) = feet position.
 *
 * The capsules are merged into one organic contour by a blur-and-threshold
 * filter (no visible joints), then lit with a rim on the side facing the
 * light. rim: colour or null; light: direction the light comes FROM
 * ([-1,-0.4] = upper left). extra(fp): svg drawn in figure space after the
 * body and outside the merge (props, phone glow). tone: interior shading.
 */
export function figure(x, y, opts = {}) {
  const fp = figureParts(opts);
  const id = `fig${figId++}`;
  const fill = opts.fill ?? PAL.ink;
  const rim = opts.rim ?? null;
  const light = opts.light ?? [-1, -0.4];
  const flip = opts.flip ? -1 : 1;
  const sorted = [...fp.parts].sort((a, b) => a.layer - b.layer);
  const shapes = sorted.map(partSvg).join("") + (opts.add ? opts.add(fp) : "");
  const rw = opts.rimWidth ?? Math.max(1.5, fp.u * 0.07);
  const blur = Math.max(0.8, fp.u * 0.055);
  const ln = Math.hypot(light[0], light[1]) || 1;
  const dx = (-light[0] / ln) * rw * flip, dy = (-light[1] / ln) * rw;
  const extra = typeof opts.extra === "function" ? opts.extra(fp) : opts.extra ?? "";
  const tone = opts.tone ? `<g clip-path="url(#${id}c)">${opts.tone(fp)}</g>` : "";
  return `<defs>
  <filter id="${id}f" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB">
    <feGaussianBlur in="SourceAlpha" stdDeviation="${f(blur)}" result="bl"/>
    <feComponentTransfer in="bl" result="sh0"><feFuncA type="linear" slope="12" intercept="-5"/></feComponentTransfer>
    <feTurbulence type="fractalNoise" baseFrequency="${f(0.9 / fp.u * 2) }" numOctaves="2" seed="${figId}" result="n"/>
    <feDisplacementMap in="sh0" in2="n" scale="${f(Math.max(1.5, fp.u * 0.05))}" xChannelSelector="R" yChannelSelector="G" result="shp"/>
    <feFlood flood-color="${fill}" result="fc"/><feComposite in="fc" in2="shp" operator="in" result="body"/>
    <feOffset in="shp" dx="${f(dx)}" dy="${f(dy)}" result="off"/>
    <feComposite in="shp" in2="off" operator="out" result="rimA"/>
    <feGaussianBlur in="rimA" stdDeviation="${f(Math.max(0.4, rw * 0.25))}" result="rimB"/>
    <feFlood flood-color="${rim ?? fill}" flood-opacity="${rim ? opts.rimOpacity ?? 0.95 : 0}"/><feComposite in2="rimB" operator="in" result="rim"/>
    <feMerge><feMergeNode in="body"/><feMergeNode in="rim"/></feMerge>
  </filter>
  <clipPath id="${id}c">${shapes}</clipPath></defs>
  <g transform="translate(${f(x)},${f(y)}) scale(${flip},1)">
    <g filter="url(#${id}f)">${shapes}</g>${tone}${extra}
  </g>`;
}

/* ---------- environment kit ---------- */

/** Night sky with cloud bands. */
export function nightSky(r, w, h, { top = "#0b1018", bottom = "#24303d", moon = null } = {}) {
  const [d, u] = lin([[0, top], [1, bottom]]);
  let clouds = "";
  for (let i = 0; i < 9; i++) {
    const cy = r.range(0.05, 0.6) * h;
    clouds += stroke([[r.range(-200, w * 0.4), cy], [r.range(w * 0.3, w * 0.6), cy + r.range(-30, 30)], [r.range(w * 0.6, w + 200), cy + r.range(-40, 40)]], r.range(20, 70), r.range(20, 70), r.pick(["#2a3542", "#1a222c", "#33404e"]), `opacity="${f(r.range(0.25, 0.55))}" filter="url(#haze)"`);
  }
  const m = moon ? `${glow(moon[0], moon[1], moon[2] * 6, moon[2] * 6, "#9fb3c6", 0.35)}${ell(moon[0], moon[1], moon[2], moon[2], `fill="#cfd8de" opacity="0.85"`)}` : "";
  return `<defs>${d}</defs><rect width="${w}" height="${h}" fill="${u}"/>${m}${clouds}`;
}

/** Suburban house silhouette with optional lit windows. */
export function house(r, x, y, w, h, { roof = 0.5, fill = PAL.char, edge = PAL.slate, windows = [], porch = false, chimney = true, garage = false } = {}) {
  const rh = h * roof;
  let out = "";
  out += poly([[x - 14, y - h + rh], [x + w / 2, y - h], [x + w + 14, y - h + rh]], `fill="${fill}"`);
  out += rect(x, y - h + rh, w, h - rh, `fill="${fill}"`);
  if (chimney) out += rect(x + w * 0.72, y - h + rh * 0.15, w * 0.07, rh * 0.6, `fill="${fill}"`);
  if (garage) out += rect(x + w, y - h * 0.42, w * 0.45, h * 0.42, `fill="${fill}"`) + poly([[x + w, y - h * 0.42], [x + w * 1.45, y - h * 0.42], [x + w * 1.45, y - h * 0.48], [x + w, y - h * 0.6]], `fill="${fill}"`) + rect(x + w * 1.05, y - h * 0.34, w * 0.35, h * 0.34, `fill="${PAL.ink}" opacity="0.6"`);
  // siding lines catching faint light
  for (let yy = y - h + rh + 10; yy < y - 4; yy += 11) out += line(x + 2, yy, x + w - 2, yy, `stroke="${edge}" stroke-width="1" opacity="${f(r.range(0.12, 0.3))}"`);
  for (const wd of windows) {
    const [wx, wy, ww, wh, lit] = wd;
    const ax = x + wx * w, ay = y - h + wy * h;
    out += rect(ax - 3, ay - 3, ww + 6, wh + 6, `fill="${PAL.ink}"`);
    if (lit) {
      out += rect(ax, ay, ww, wh, `fill="${lit}"`);
      out += glow(ax + ww / 2, ay + wh / 2, ww * 1.6, wh * 1.4, lit, 0.35);
    } else out += rect(ax, ay, ww, wh, `fill="#0d1218"`) + rect(ax, ay, ww, wh * 0.4, `fill="#3d4d5e" opacity="0.18"`);
    out += line(ax + ww / 2, ay, ax + ww / 2, ay + wh, `stroke="${PAL.ink}" stroke-width="3"`) + line(ax, ay + wh / 2, ax + ww, ay + wh / 2, `stroke="${PAL.ink}" stroke-width="3"`);
  }
  if (porch) out += rect(x + w * 0.38, y - h * 0.3, w * 0.24, h * 0.3, `fill="${PAL.ink}" opacity="0.7"`);
  return out;
}

/** Leafy tree mass (dark), drawn as clustered blobs. */
export function tree(r, x, y, s, fill = PAL.ink, { trunk = true } = {}) {
  let out = trunk ? stroke([[x, y], [x + r.range(-8, 8), y - s * 0.4], [x + r.range(-15, 15), y - s * 0.7]], s * 0.09, s * 0.05, fill) : "";
  for (let i = 0; i < 14; i++) {
    const a = r() * Math.PI * 2;
    const rr = r.range(0.1, 0.45) * s;
    out += ell(x + Math.cos(a) * rr * 1.1, y - s * 0.78 + Math.sin(a) * rr * 0.8, r.range(0.14, 0.3) * s, r.range(0.12, 0.25) * s, `fill="${fill}"`);
  }
  return out;
}

/** Bare winter tree, branching ink. */
export function bareTree(r, x, y, s, color = PAL.ink, depth = 5) {
  let out = "";
  const branch = (bx, by, a, len, w, d) => {
    if (d === 0 || len < 4) return;
    const ex = bx + Math.cos(a) * len, ey = by + Math.sin(a) * len;
    out += stroke([[bx, by], [(bx + ex) / 2 + r.range(-4, 4), (by + ey) / 2 + r.range(-4, 4)], [ex, ey]], w, w * 0.6, color);
    const n = r.int(2, 3);
    for (let i = 0; i < n; i++) branch(ex, ey, a + r.range(-0.7, 0.7), len * r.range(0.6, 0.8), w * 0.62, d - 1);
  };
  branch(x, y, -Math.PI / 2 + r.range(-0.1, 0.1), s * 0.35, s * 0.05, depth);
  return out;
}

/** Streetlamp with light pool. */
export function streetlamp(x, y, hgt, { color = PAL.amber, lit = true, pool = true } = {}) {
  let out = "";
  out += rect(x - 3, y - hgt, 6, hgt, `fill="${PAL.ink}"`);
  out += path(`M${x},${y - hgt} q30,-14 58,-4`, `stroke="${PAL.ink}" stroke-width="5" fill="none"`);
  out += poly([[x + 46, y - hgt - 4], [x + 72, y - hgt - 4], [x + 66, y - hgt + 6], [x + 52, y - hgt + 6]], `fill="${PAL.ink}"`);
  if (lit) {
    out += glow(x + 59, y - hgt + 6, 60, 40, PAL.amberHi, 0.9);
    out += cone(x + 59, y - hgt + 6, Math.PI / 2, 0.42, hgt + 30, color, 0.32);
    if (pool) out += glow(x + 59, y + 4, hgt * 0.55, 34, color, 0.4);
  }
  return out;
}

/** Car seen from the side (simple sedan silhouette). */
export function car(x, y, len, { fill = PAL.char, glass = "#1a2531", rim = PAL.steel, lights = false, tail = false, flip = false, sporty = false } = {}) {
  const h = len * (sporty ? 0.24 : 0.3);
  const s = flip ? -1 : 1;
  const X = (v) => x + v * s;
  let out = "";
  const body = smooth([[X(0), y - h * 0.25], [X(len * 0.02), y - h * 0.55], [X(len * 0.22), y - h * 0.62], [X(len * 0.33), y - h * (sporty ? 0.95 : 1)], [X(len * 0.7), y - h * (sporty ? 0.93 : 1)], [X(len * 0.82), y - h * 0.62], [X(len), y - h * 0.55], [X(len * 1.0), y - h * 0.2], [X(len * 0.96), y], [X(len * 0.04), y]], true, 0.35);
  out += path(body, `fill="${fill}"`);
  out += poly([[X(len * 0.35), y - h * 0.92], [X(len * 0.5), y - h * 0.92], [X(len * 0.5), y - h * 0.64], [X(len * 0.26), y - h * 0.64]], `fill="${glass}"`);
  out += poly([[X(len * 0.53), y - h * 0.92], [X(len * 0.68), y - h * 0.92], [X(len * 0.78), y - h * 0.64], [X(len * 0.53), y - h * 0.64]], `fill="${glass}"`);
  out += path(`M${X(len * 0.05)},${y - h * 0.5} L${X(len * 0.97)},${y - h * 0.5}`, `stroke="${rim}" stroke-width="2" opacity="0.5"`);
  for (const wx of [0.2, 0.8]) {
    out += ell(X(len * wx), y, len * 0.075, len * 0.075, `fill="${PAL.ink}"`);
    out += ell(X(len * wx), y, len * 0.035, len * 0.035, `fill="${PAL.slate}"`);
  }
  if (lights) out += glow(X(len * 1.0), y - h * 0.4, 70, 30, PAL.amberHi, 0.8) + cone(X(len), y - h * 0.4, flip ? Math.PI : 0, 0.18, len * 1.2, "#e8d9a8", 0.3);
  if (tail) out += glow(X(0), y - h * 0.4, 40, 18, "#c0202a", 0.7);
  return out;
}

/** Wooden plank wall texture. */
export function planks(r, x, y, w, h, { base = PAL.wood, dark = PAL.ink, light = PAL.woodLt, vertical = true, gap = 46 } = {}) {
  let out = rect(x, y, w, h, `fill="${base}"`);
  if (vertical) {
    for (let px = x; px < x + w; px += gap * r.range(0.85, 1.15)) {
      out += line(px, y, px + r.range(-2, 2), y + h, `stroke="${dark}" stroke-width="${f(r.range(2, 4))}" opacity="0.8"`);
      out += scumble(r, px + 4, y, gap - 8, h, 6, [light, dark], { angle: Math.PI / 2, len: [80, 260], width: [1, 3], jitter: 0.03, opacity: [0.08, 0.25] });
    }
  } else {
    for (let py = y; py < y + h; py += gap * r.range(0.85, 1.15)) {
      out += line(x, py, x + w, py + r.range(-2, 2), `stroke="${dark}" stroke-width="${f(r.range(2, 4))}" opacity="0.8"`);
      out += scumble(r, x, py + 4, w, gap - 8, 8, [light, dark], { angle: 0, len: [80, 260], width: [1, 3], jitter: 0.03, opacity: [0.08, 0.25] });
    }
  }
  return out;
}

/** Concrete/plaster wall with stains. */
export function grime(r, x, y, w, h, base, { stains = 14, dark = PAL.ink, light = PAL.mist, drips = 0 } = {}) {
  let out = rect(x, y, w, h, `fill="${base}"`);
  out += scumble(r, x, y, w, h, Math.round((w * h) / 9000), [dark, light, base], { angle: Math.PI / 2, len: [40, 180], width: [3, 12], jitter: 0.5, opacity: [0.05, 0.16] });
  for (let i = 0; i < stains; i++) out += ell(x + r() * w, y + r() * h, r.range(20, 120), r.range(20, 90), `fill="${dark}" opacity="${f(r.range(0.05, 0.18))}" filter="url(#soft)"`);
  for (let i = 0; i < drips; i++) {
    const dx = x + r() * w, dy = y + r() * h * 0.4;
    out += stroke([[dx, dy], [dx + r.range(-2, 2), dy + r.range(40, 160)]], r.range(2, 6), 1, dark, `opacity="${f(r.range(0.15, 0.35))}"`);
  }
  return out;
}

/** Phone flashlight: bright beam from a hand position. */
export function phoneBeam(x, y, angle, len, spread = 0.32, opacity = 0.5) {
  return cone(x, y, angle, spread, len, "#e9f2f8", opacity) + glow(x, y, 26, 26, "#ffffff", 0.95) + glow(x + Math.cos(angle) * len * 0.85, y + Math.sin(angle) * len * 0.85, len * 0.3, len * 0.22, "#dfe9f1", opacity * 0.6);
}

/* ---------- cast (silhouette identities; nobody has a face) ---------- */
export const CAST = {
  narr: { build: "teen", hoodie: true },
  tyler: { build: "athlete", collar: true },
  chris: { build: "stocky", hair: "messy" },
  tom: { build: "lanky", beanie: true },
  g: { build: "giant" },
  dad: { build: "adult" },
};
export const who = (k, extra = {}) => ({ ...CAST[k], ...extra });

/* ---------- one-point perspective room ---------- */
/**
 * Box room seen from inside. Back wall rect (bx, by, bw, bh) on a W x H
 * canvas. Returns polygons for floor, ceiling, left and right walls.
 */
export function room(bx, by, bw, bh, w = W, h = H, ext = 0) {
  return {
    back: [[bx, by], [bx + bw, by], [bx + bw, by + bh], [bx, by + bh]],
    floor: [[bx, by + bh], [bx + bw, by + bh], [w + ext, h + ext], [-ext, h + ext]],
    ceil: [[-ext, -ext], [w + ext, -ext], [bx + bw, by], [bx, by]],
    left: [[-ext, -ext], [bx, by], [bx, by + bh], [-ext, h + ext]],
    right: [[w + ext, -ext], [bx + bw, by], [bx + bw, by + bh], [w + ext, h + ext]],
  };
}
/** Point on the floor/ceiling/wall plane by interpolating between back-wall edge and frame edge. */
export const lerp2 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/**
 * Darkness with light holes: covers the scene in black except for soft
 * elliptical pools. lights: [{x, y, rx, ry, power}] power 0..1.
 */
export function darkness(w, h, lights, amount = 0.92, color = "#020203") {
  const id = `dk${figId++}`;
  const holes = lights
    .map((l) => {
      const [d, u] = radU([[0, "#000", 1], [0.45, "#000", 0.75 * (l.power ?? 1)], [1, "#000", 0]], 0, 0, 1);
      return `<defs>${d}</defs><ellipse cx="0" cy="0" rx="1" ry="1" fill="${u}" transform="translate(${f(l.x)},${f(l.y)}) rotate(${f(l.rot ?? 0)}) scale(${f(l.rx)},${f(l.ry)})"/>`;
    })
    .join("");
  return `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="#fff"/>${holes}</mask></defs>
  <rect width="${w}" height="${h}" fill="${color}" opacity="${amount}" mask="url(#${id})"/>`;
}

/* ---------- merged silhouettes for props and hands ---------- */
let gooId = 0;
/** Applies the organic merge + rim light to any shapes (hands, arms, props). */
export function goo(shapes, { fill = PAL.ink, rim = null, light = [-1, -0.4], blur = 3, rw = 3, rimOpacity = 0.95, wobble = 2 } = {}) {
  const id = `goo${gooId++}`;
  const ln = Math.hypot(light[0], light[1]) || 1;
  const dx = (-light[0] / ln) * rw, dy = (-light[1] / ln) * rw;
  return `<defs><filter id="${id}" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB">
    <feGaussianBlur in="SourceAlpha" stdDeviation="${f(blur)}" result="bl"/>
    <feComponentTransfer in="bl" result="sh0"><feFuncA type="linear" slope="12" intercept="-5"/></feComponentTransfer>
    <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="${gooId}" result="n"/>
    <feDisplacementMap in="sh0" in2="n" scale="${wobble}" xChannelSelector="R" yChannelSelector="G" result="shp"/>
    <feFlood flood-color="${fill}"/><feComposite in2="shp" operator="in" result="body"/>
    <feOffset in="shp" dx="${f(dx)}" dy="${f(dy)}" result="off"/>
    <feComposite in="shp" in2="off" operator="out" result="rimA"/>
    <feGaussianBlur in="rimA" stdDeviation="${f(Math.max(0.4, rw * 0.25))}" result="rimB"/>
    <feFlood flood-color="${rim ?? fill}" flood-opacity="${rim ? rimOpacity : 0}"/><feComposite in2="rimB" operator="in" result="rim"/>
    <feMerge><feMergeNode in="body"/><feMergeNode in="rim"/></feMerge>
  </filter></defs><g filter="url(#${id})">${shapes}</g>`;
}

/**
 * Hand silhouette shapes (no filter): wrist at (x, y), fingers pointing
 * along `angle` (radians), palm length `s`. pose: open | grip | fist | point | claw.
 * sleeve: length of forearm/sleeve drawn back from the wrist.
 */
export function handShapes(x, y, angle, s, { pose = "open", sleeve = 0, sleeveW = 0.5, mirror = false } = {}) {
  const ca = Math.cos(angle), sa = Math.sin(angle);
  const m = mirror ? -1 : 1;
  const P = (u, v) => [x + ca * u * s - sa * v * s * m, y + sa * u * s + ca * v * s * m];
  let out = "";
  const cap = (a, ar, b, br) => `<path d="${capsulePath(a[0], a[1], ar * s, b[0], b[1], br * s)}"/>`;
  // palm
  out += path(smooth([P(0, -0.3), P(0.55, -0.42), P(0.95, -0.4), P(1.0, 0.0), P(0.95, 0.38), P(0.5, 0.36), P(0, 0.28)], true, 0.5));
  const fingers = [[-0.3, 1.0], [-0.1, 1.08], [0.1, 1.02], [0.28, 0.85]];
  const curl = { open: [1, 1, 1, 1], grip: [0.45, 0.45, 0.45, 0.42], fist: [0.22, 0.22, 0.22, 0.2], point: [1.05, 0.25, 0.22, 0.2], claw: [0.75, 0.8, 0.75, 0.65] }[pose];
  fingers.forEach(([v, len], i) => {
    const spread = pose === "open" || pose === "claw" ? v * 0.35 : v * 0.08;
    const base = P(0.95, v);
    const L = len * 0.75 * curl[i];
    const tip = P(0.95 + L, v + spread * L);
    if (pose === "claw") {
      const mid = P(0.95 + L * 0.6, v + spread * L * 0.6);
      const tip2 = P(0.95 + L * 0.7, v + spread * L + 0.25);
      out += cap(base, 0.11, mid, 0.1) + cap(mid, 0.1, tip2, 0.08);
    } else out += cap(base, 0.11, tip, 0.085);
  });
  // thumb
  const tb = P(0.35, -0.38);
  const tt = pose === "fist" || pose === "grip" ? P(0.8, -0.3) : P(0.85, -0.85);
  out += cap(tb, 0.14, tt, 0.09);
  if (sleeve > 0) {
    out += cap(P(0.05, 0), sleeveW * 0.44, P(-sleeve / s, 0), sleeveW * 0.56);
  }
  return out;
}

export function capsulePath(ax, ay, ar, bx, by, br) {
  const dx = bx - ax, dy = by - ay;
  const d = Math.hypot(dx, dy) || 0.001;
  const ux = dx / d, uy = dy / d;
  const nx = -uy, ny = ux;
  const sinA = Math.max(-0.99, Math.min(0.99, (ar - br) / d));
  const cosA = Math.sqrt(1 - sinA * sinA);
  const p1 = [ax + (nx * cosA + ux * sinA) * ar, ay + (ny * cosA + uy * sinA) * ar];
  const p2 = [bx + (nx * cosA + ux * sinA) * br, by + (ny * cosA + uy * sinA) * br];
  const p3 = [bx - (nx * cosA - ux * sinA) * br, by - (ny * cosA - uy * sinA) * br];
  const p4 = [ax - (nx * cosA - ux * sinA) * ar, ay - (ny * cosA - uy * sinA) * ar];
  return `M${f(p1[0])},${f(p1[1])} L${f(p2[0])},${f(p2[1])} A${f(br)},${f(br)} 0 1 0 ${f(p3[0])},${f(p3[1])} L${f(p4[0])},${f(p4[1])} A${f(ar)},${f(ar)} 0 1 0 ${f(p1[0])},${f(p1[1])}Z`;
}

/** Hand-lettered label (props only: signs, papers). */
export function text(x, y, str, size, fill, { anchor = "start", weight = 700, family = "Georgia, serif", spacing = 0, rotate = 0, opacity = 1 } = {}) {
  return `<text x="${f(x)}" y="${f(y)}" font-family="${family}" font-size="${f(size)}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${spacing}" opacity="${opacity}" transform="rotate(${rotate} ${f(x)} ${f(y)})">${str}</text>`;
}

/** Smoke wisp: soft rising curl. */
export function smoke(r, x, y, hgt, color = "#9aa6b0", opacity = 0.25) {
  const pts = [];
  for (let i = 0; i <= 6; i++) pts.push([x + Math.sin(i * 1.3 + r() * 2) * (8 + i * 6), y - (hgt * i) / 6]);
  return `<g filter="url(#glowS)" opacity="${opacity}">${stroke(pts, 4, 26, color)}</g>`;
}
