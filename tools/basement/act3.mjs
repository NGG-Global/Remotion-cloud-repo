/**
 * ACT III: Mr. G and the round chamber.  ACT IV: the aftermath.
 *
 * Geography of the chamber panorama (CW x CH), left to right:
 *   iron maiden | spiked chair | rack | steel operating table under the lamp |
 *   vat on the gas burner, hook above | wooden tool table | the secret door.
 * Mr. G is a huge silhouette in every shot: never a face, only mass, hands,
 * the slicked hair and the comb.
 */
import { L } from "./act1.mjs";
import {
  PAL, W, H, rect, poly, line, ell, g, path, smooth, stroke, scumble, speckle, grime, planks, glow, cone, finish,
  figure, who, room, lerp2, darkness, lin, linU, radU, rad, goo, handShapes, capsulePath, text, nightSky, bareTree,
} from "./lib.mjs";

const HARSH = "#e4f0ea";
const FIRE = "#e07a28";
const CRIM = PAL.crimson;
export const CW = 3000, CH = 1000;
// device positions on the panorama, also used by the composition's camera
export const CHAMBER = { maiden: 330, chair: 760, rack: 1110, table: 1560, vat: 2160, tools: 2620, door: 2900 };

/* ---------- helpers for devices ---------- */
function stoneWall(r, w, h, base = "#2e2b27") {
  let s = rect(0, 0, w, h, `fill="${base}"`);
  let st = "";
  for (let row = 0; row < 14; row++) {
    const y = row * 52;
    for (let x = (row % 2) * -60; x < w; x += r.range(90, 150)) {
      const bw = r.range(80, 140);
      st += rect(x + 3, y + 3, bw - 6, 46, `fill="${r.pick(["#34302b", "#2a2723", "#3a352f", "#25221e"])}" rx="6"`);
    }
  }
  return s + g(`filter="url(#paint)"`, st) + g(`filter="url(#paintS)"`, scumble(r, 0, 0, w, h, Math.round(w / 12), ["#14120f", "#4a443c", "#3a1a14"], { angle: Math.PI / 2, len: [40, 200], width: [4, 14], jitter: 0.3, opacity: [0.06, 0.18] }));
}
function maidenOutline(cx, top, wdt, hgt) {
  const hw = wdt / 2;
  return smooth([[cx - hw * 0.55, top + hgt * 0.05], [cx, top], [cx + hw * 0.55, top + hgt * 0.05], [cx + hw * 0.75, top + hgt * 0.18], [cx + hw, top + hgt * 0.24], [cx + hw * 0.92, top + hgt * 0.6], [cx + hw * 0.7, top + hgt], [cx - hw * 0.7, top + hgt], [cx - hw * 0.92, top + hgt * 0.6], [cx - hw, top + hgt * 0.24], [cx - hw * 0.75, top + hgt * 0.18]], true, 0.4);
}
function spikes(x0, y0, x1, y1, n, len, dir, color = "#8a8e90") {
  let s = "";
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
    s += poly([[x - 5, y - 6], [x + dir * len, y], [x - 5, y + 6]], `fill="${color}"`);
  }
  return s;
}
/** Iron maiden, small, as seen in the chamber panorama (doors open). */
function maidenSmall(cx, floor, hgt) {
  const w = hgt * 0.42, top = floor - hgt;
  let s = path(maidenOutline(cx, top, w, hgt), `fill="#1e1c1a"`);
  s += path(maidenOutline(cx, top + hgt * 0.06, w * 0.78, hgt * 0.9), `fill="#060505"`);
  for (let i = 0; i < 6; i++) s += spikes(cx - w * 0.3, top + hgt * (0.2 + i * 0.12), cx + w * 0.3, top + hgt * (0.2 + i * 0.12), 4, 10, 0, "#5a5e60");
  // open doors seen nearly edge-on
  s += poly([[cx - w * 0.5, top + hgt * 0.08], [cx - w * 1.05, top + hgt * 0.14], [cx - w * 1.05, floor - hgt * 0.04], [cx - w * 0.4, floor]], `fill="#24211e"`);
  s += poly([[cx + w * 0.5, top + hgt * 0.08], [cx + w * 1.05, top + hgt * 0.14], [cx + w * 1.05, floor - hgt * 0.04], [cx + w * 0.4, floor]], `fill="#24211e"`);
  for (let i = 0; i < 7; i++) {
    const y = top + hgt * (0.18 + i * 0.11);
    s += spikes(cx - w * 1.0, y, cx - w * 0.55, y, 3, 14, 1, "#6a6e70") + spikes(cx + w * 0.55, y, cx + w * 1.0, y, 3, 14, -1, "#6a6e70");
  }
  return s;
}
function surgicalTable(cx, floor, len) {
  const top = floor - len * 0.36;
  return rect(cx - len / 2, top, len, 26, `fill="#9aa4aa"`) + rect(cx - len / 2, top + 26, len, 12, `fill="#3a4044"`) + rect(cx - len / 2, top, len, 8, `fill="#e8f0f4" opacity="0.8"`)
    + rect(cx - len * 0.35, top + 38, 16, floor - top - 38, `fill="#4a5256"`) + rect(cx + len * 0.35 - 16, top + 38, 16, floor - top - 38, `fill="#4a5256"`)
    + rect(cx - len * 0.38, floor - 60, len * 0.76, 10, `fill="#3a4044"`)
    + rect(cx - len * 0.3, top - 6, 30, 40, `fill="#2a1e14"`) + rect(cx + len * 0.22, top - 6, 30, 40, `fill="#2a1e14"`);
}
function vatShape(cx, floor, w, h) {
  const top = floor - h - 90;
  let s = "";
  // burner frame and ring
  s += rect(cx - w * 0.45, floor - 90, 14, 90, `fill="#141414"`) + rect(cx + w * 0.45 - 14, floor - 90, 14, 90, `fill="#141414"`) + rect(cx - w * 0.5, floor - 100, w, 16, `fill="#1a1a1a"`);
  s += rect(cx - w * 0.3, floor - 60, w * 0.6, 12, `fill="#2a2a2a"`) + rect(cx + w * 0.32, floor - 30, 80, 10, `fill="#3a3a3a"`) + ell(cx + w * 0.32 + 90, floor - 25, 12, 12, `fill="#5a2a1a"`);
  // the vat: riveted iron cylinder
  s += rect(cx - w / 2, top, w, h, `fill="#3a3a38"`);
  s += ell(cx, top, w / 2, w * 0.09, `fill="#1a1a18"`) + ell(cx, top, w / 2 - 14, w * 0.09 - 6, `fill="#0a0a09"`);
  s += ell(cx, top + h, w / 2, w * 0.09, `fill="#2a2a28"`);
  for (const y of [top + h * 0.2, top + h * 0.75]) s += rect(cx - w / 2, y, w, 14, `fill="#262624"`) + Array.from({ length: 9 }, (_, i) => ell(cx - w / 2 + 20 + i * ((w - 40) / 8), y + 7, 4, 4, `fill="#6a6a66"`)).join("");
  s += rect(cx - w / 2 + 16, top + 10, 22, h - 20, `fill="#8a8a84" opacity="0.35"`);
  return s;
}
function toolTable(cx, floor, len, detail = 1) {
  const top = floor - 230;
  let s = rect(cx - len / 2, top, len, 30, `fill="#4a3422"`) + rect(cx - len / 2, top + 30, len, 10, `fill="#2a1c12"`);
  s += rect(cx - len * 0.45, top + 40, 18, floor - top - 40, `fill="#2a1c12"`) + rect(cx + len * 0.45 - 18, top + 40, 18, floor - top - 40, `fill="#2a1c12"`);
  // tools: knives, cleaver, hammer, saw, scalpels; rope coil
  const k = len / 400;
  s += poly([[cx - 170 * k, top - 4], [cx - 90 * k, top - 10], [cx - 90 * k, top - 2]], `fill="#c8d0d4"`) + rect(cx - 205 * k, top - 10, 36 * k, 8, `fill="#1a120c"`);
  s += poly([[cx - 80 * k, top - 2], [cx - 30 * k, top - 34 * k], [cx - 20 * k, top - 2]], `fill="#a8b0b4"`) + rect(cx - 40 * k, top - 52 * k, 8, 22 * k, `fill="#1a120c"`);
  s += rect(cx, top - 12 * k, 90 * k, 10, `fill="#2a1a10"`) + rect(cx + 70 * k, top - 26 * k, 26 * k, 26 * k, `fill="#5a5e60"`);
  s += poly([[cx + 110 * k, top - 4], [cx + 200 * k, top - 4], [cx + 200 * k, top - 30 * k], [cx + 110 * k, top - 22 * k]], `fill="#8a9296"`) + Array.from({ length: Math.round(8 * detail) }, (_, i) => poly([[cx + 112 * k + i * 11 * k, top - 4], [cx + 117 * k + i * 11 * k, top + 3], [cx + 122 * k + i * 11 * k, top - 4]], `fill="#8a9296"`)).join("");
  s += ell(cx - 130 * k, top - 14 * k, 44 * k, 14 * k, `fill="none" stroke="#9a8a6a" stroke-width="${6 * k}"`) + ell(cx - 130 * k, top - 20 * k, 36 * k, 12 * k, `fill="none" stroke="#8a7a5a" stroke-width="${6 * k}"`);
  return s;
}

/* ------------------------------------------------------------------ */
/* Coin room, reverse angle: the doorway where Mr. G appears             */
/* ------------------------------------------------------------------ */
const doorPlate = L("door-plate", (r) => {
  let s = g(`filter="url(#paintV)"`, rect(0, 0, W, H, `fill="#4e4a40"`), scumble(r, 0, 0, W, H, 100, ["#5e584c", "#2a2620", "#4a2a1e"], { angle: Math.PI / 2, len: [60, 260], width: [4, 14], jitter: 0.1, opacity: [0.08, 0.2] }));
  // cases flanking the door
  s += g(`filter="url(#paint)"`, rect(60, 200, 380, 520, `fill="#1a1612"`), rect(76, 216, 348, 488, `fill="#3a3a3a"`), rect(1160, 200, 380, 520, `fill="#1a1612"`), rect(1176, 216, 348, 488, `fill="#3a3a3a"`),
    poly([[76, 216], [180, 216], [76, 500]], `fill="#ffffff" opacity="0.12"`), poly([[1176, 216], [1280, 216], [1176, 500]], `fill="#ffffff" opacity="0.12"`));
  // the doorway into the dark corridor
  s += g(`filter="url(#paintV)"`, rect(560, 110, 480, 680, `fill="#121212"`), rect(590, 140, 420, 650, `fill="#0a0b0b"`), poly([[590, 140], [1010, 140], [880, 330], [720, 330]], `fill="#151616"`), rect(720, 330, 160, 200, `fill="#060606"`));
  s += g(`filter="url(#paint)"`, rect(0, 780, W, 120, `fill="#2a2620"`), scumble(r, 0, 780, W, 120, 50, ["#14120e", "#4a443c"], { angle: 0, len: [100, 300], width: [2, 6], opacity: [0.2, 0.4] }));
  s += glow(800, 0, 900, 360, HARSH, 0.45);
  s += finish(W, H, { vignette: 0.7, tint: "#3a5a48", tintOpacity: 0.12 });
  return s;
}, { opaque: true, seed: 301 });
// Mr. G filling the doorway behind the boys
const doorG = L("door-g", () => figure(800, 830, { ...who("g"), pose: { lUp: -14, lFore: -6, rUp: 16, rFore: 24 }, size: 610, rim: "#9aa8a0", light: [0, -1], rimWidth: 4, fill: "#030303" }), { seed: 302 });
const doorBoys = L("door-boys", () =>
  figure(690, 850, { ...who("chris"), pose: { lUp: -4, rUp: 4, head: 12 }, size: 470, rim: HARSH, light: [0, -1], fill: "#060606" })
  + figure(930, 856, { ...who("tom"), pose: { lUp: -4, rUp: 4, head: 20, torso: 4 }, size: 490, rim: HARSH, light: [0, -1], fill: "#060606" })
  + `<g opacity="0.9">${stroke([[700, 440], [702, 520], [698, 600]], 4, 2, CRIM)}</g>`,
{ seed: 303 });
// Tyler stepping forward with his fists up (back to camera, foreground)
const doorTyler = L("door-tyler", () => figure(330, 1200, { ...who("tyler"), pose: { rUp: 25, rFore: 195, lUp: -25, lFore: -195, torso: 4 }, size: 980, rim: HARSH, light: [0.4, -1], fill: "#050505" }), { seed: 304 });
// Tom shoved toward us
const doorTomShoved = L("door-tom-shoved", () =>
  figure(690, 850, { ...who("chris"), pose: { lUp: -4, rUp: 4, head: 12 }, size: 470, rim: HARSH, light: [0, -1], fill: "#060606" })
  + figure(1040, 980, { ...who("tom"), pose: { torso: -16, head: -20, lUp: -30, lFore: -60, rUp: 30, rFore: 50, lThigh: -16, rThigh: 18, rShin: 28 }, size: 600, rim: HARSH, light: [0, -1], fill: "#060606" }),
{ seed: 305 });

/* Blood falling on the concrete */
const bloodFloor = L("blood-floor", (r) => {
  let s = g(`filter="url(#paint)"`, rect(0, 0, W, H, `fill="#4a463e"`), scumble(r, 0, 0, W, H, 160, ["#5a564c", "#2a2620", "#3a362e"], { angle: 0, len: [100, 400], width: [4, 14], opacity: [0.15, 0.35] }), speckle(r, 0, 0, W, H, 500, "#1a1814", [1, 4], 0.5));
  // sneakers at the top of frame
  s += g(`filter="url(#paint)"`, path(smooth([[480, -20], [470, 120], [520, 200], [700, 210], [720, 150], [680, -20]], true, 0.4), `fill="#14141a"`), path(smooth([[900, -20], [880, 130], [940, 210], [1110, 200], [1110, 120], [1080, -20]], true, 0.4), `fill="#14141a"`));
  // drops and a widening pool
  s += g(`filter="url(#wob)"`, ell(820, 520, 140, 60, `fill="${CRIM}"`), ell(780, 500, 70, 26, `fill="#a01a20" opacity="0.6"`), ...Array.from({ length: 14 }, () => ell(r.range(620, 1040), r.range(380, 700), r.range(6, 16), r.range(4, 10), `fill="${CRIM}"`)));
  s += darkness(W, H, [{ x: 800, y: 420, rx: 760, ry: 520, power: 1 }], 0.6);
  s += finish(W, H, { vignette: 0.85, tint: "#3a1a14", tintOpacity: 0.12 });
  return s;
}, { opaque: true, seed: 311 });

/* G's hand on Chris's shoulder (back of Chris's head, backlit) */
function handOnShoulder(r, onHead) {
  let s = rect(0, 0, W, H, `fill="#5a5a50"`) + glow(800, 200, 900, 500, HARSH, 0.6);
  s += g(`filter="url(#paintV)"`, scumble(r, 0, 0, W, H, 80, ["#6a665a", "#3a3830"], { angle: Math.PI / 2, len: [100, 300], width: [6, 20], opacity: [0.1, 0.25] }));
  // Chris from behind: head and shoulders, filling the lower frame
  s += figure(700, 2100, { ...who("chris"), pose: { head: 16 }, size: 2000, rim: HARSH, light: [0, -1], rimWidth: 7, fill: "#070707" });
  // G's enormous hand
  const hs = onHead ? handShapes(1000, 90, 2.5, 220, { pose: "claw", sleeve: 520, sleeveW: 1.15 }) : handShapes(1150, 390, 2.55, 230, { pose: "claw", sleeve: 560, sleeveW: 1.2 });
  s += goo(hs, { fill: "#020202", rim: "#b8c4bc", light: [0, -1], blur: 8, rw: 6 });
  s += finish(W, H, { vignette: 0.8, tint: "#3a5a48", tintOpacity: 0.1 });
  return s;
}
const gHand = L("g-hand", (r) => handOnShoulder(r, false), { opaque: true, seed: 321 });
const gHandHead = L("g-hand-head", (r) => handOnShoulder(r, true), { opaque: true, seed: 322 });
// Tom, head bowed, shaking: tight silhouette against the case glass
const tomCry = L("tom-cry", (r) => {
  let s = rect(0, 0, W, H, `fill="#3a3a34"`) + glow(1100, 300, 700, 500, HARSH, 0.5);
  s += g(`filter="url(#paint)"`, rect(900, 80, 600, 700, `fill="#1a1612"`), rect(920, 100, 560, 660, `fill="#4a4a48"`), poly([[920, 100], [1100, 100], [920, 500]], `fill="#ffffff" opacity="0.14"`));
  s += figure(640, 1500, { ...who("tom"), pose: { torso: 10, head: 38, lUp: -10, lFore: 30, rUp: 10, rFore: -30 }, size: 1500, rim: HARSH, light: [1, -0.6], rimWidth: 6, fill: "#060606" });
  s += finish(W, H, { vignette: 0.85, tint: "#3a5a48", tintOpacity: 0.12 });
  void r;
  return s;
}, { opaque: true, seed: 323 });

/* The gun: G's hand drawing a revolver */
const gun = L("gun", (r) => {
  let s = rect(0, 0, W, H, `fill="#0a0a0a"`);
  // G's torso filling the frame (dark shirt, belt)
  s += g(`filter="url(#paint)"`, path(smooth([[200, -50], [1400, -50], [1560, 400], [1500, 950], [100, 950], [40, 400]], true, 0.4), `fill="#121212"`), rect(60, 640, 1500, 70, `fill="#070707"`), rect(760, 630, 110, 90, `fill="#5a5a52"`), rect(780, 650, 70, 50, `fill="#121212"`));
  s += g(`filter="url(#paintV)"`, scumble(r, 100, 0, 1400, 900, 70, ["#202020", "#050505"], { angle: Math.PI / 2, len: [100, 400], width: [6, 20], jitter: 0.2, opacity: [0.2, 0.5] }));
  // revolver, drawn plainly so it reads at a glance: barrel, cylinder, frame, hammer
  s += `<g transform="rotate(-16 900 480)" filter="url(#paint)">
    ${rect(930, 430, 380, 46, `fill="#26282a"`)}${rect(930, 430, 380, 9, `fill="#d8e0e4"`)}${rect(1290, 420, 16, 14, `fill="#26282a"`)}
    ${rect(860, 412, 120, 92, `fill="#1e2022" rx="18"`)}${line(866, 440, 976, 440, `stroke="#8a9296" stroke-width="4"`)}${line(866, 470, 976, 470, `stroke="#5a6266" stroke-width="3"`)}
    ${path(`M840,420 l-30,-26 l18,-6 l34,22z`, `fill="#26282a"`)}
    ${path(`M900,500 q-10,40 30,52 l14,-10 q-24,-6 -22,-42z`, `fill="none" stroke="#26282a" stroke-width="8"`)}
  </g>`;
  s += goo(handShapes(760, 600, -0.45, 200, { pose: "fist", sleeve: 380, sleeveW: 1.2 }), { fill: "#030303", rim: "#c8d0cc", light: [0, -1], blur: 8, rw: 6 });
  s += glow(1100, 380, 400, 200, "#dfe8ee", 0.25);
  s += darkness(W, H, [{ x: 1000, y: 450, rx: 700, ry: 420, power: 1 }], 0.7);
  s += finish(W, H, { vignette: 0.9 });
  return s;
}, { opaque: true, seed: 331 });

/* The shot: profile silhouettes against the harsh doorway light */
const exec = L("exec", (r) => {
  let s = rect(0, 0, W, H, `fill="#d8e4dc"`) + glow(900, 400, 800, 500, "#ffffff", 0.8);
  s += g(`filter="url(#paint)"`, rect(0, 760, W, 140, `fill="#2a2620"`), rect(0, 0, 220, H, `fill="#121212"`), rect(1380, 0, 220, H, `fill="#121212"`));
  // Chris, head bowed, in front; G behind with his arm out, the barrel at the back of Chris's head
  s += figure(640, 860, { ...who("chris"), pose: { torso: -8, head: -28, lUp: 4, rUp: 4 }, size: 540, rim: null, fill: "#060606" });
  s += figure(960, 880, { ...who("g"), pose: { lUp: -76, lFore: -84, rUp: 10, rFore: 20 }, size: 640, rim: null, fill: "#030303", flip: false,
    extra: (fp) => rect(fp.hands.l[0] - 70, fp.hands.l[1] - 14, 90, 22, `fill="#030303"`) });
  s += finish(W, H, { vignette: 0.7 });
  void r;
  return s;
}, { opaque: true, seed: 341 });
// aftermath of the shot: crimson spray across the case glass and the floor, a limp hand
const splatter = L("splatter", (r) => {
  let s = g(`filter="url(#paint)"`, rect(0, 0, W, H, `fill="#3a3a36"`), rect(200, 60, 1200, 600, `fill="#1a1612"`), rect(220, 80, 1160, 560, `fill="#4a4a48"`), poly([[220, 80], [420, 80], [220, 400]], `fill="#ffffff" opacity="0.14"`), rect(0, 680, W, 220, `fill="#2a2620"`));
  let sp = "";
  for (let i = 0; i < 90; i++) { const a = r.range(-1.2, 0.6), d = r.range(20, 520); const x = 540 + Math.cos(a) * d, y = 380 + Math.sin(a) * d * 0.6; sp += ell(x, y, r.range(3, 18) * (1 - d / 700), r.range(3, 14) * (1 - d / 700), `fill="${r.pick([CRIM, "#5a0a10", "#9a1a20"])}" opacity="${r.range(0.6, 1).toFixed(2)}"`); }
  for (let i = 0; i < 12; i++) { const x = r.range(400, 900), y = r.range(300, 500); sp += stroke([[x, y], [x + r.range(-3, 3), y + r.range(60, 200)]], r.range(3, 8), 1, CRIM, `opacity="0.8"`); }
  s += `<g filter="url(#wob)">${sp}</g>`;
  s += goo(handShapes(760, 820, 0.2, 130, { pose: "claw", sleeve: 500, sleeveW: 1 }), { fill: "#060606", rim: "#a8b4ac", light: [0, -1], blur: 5, rw: 4 });
  s += finish(W, H, { vignette: 0.85, tint: "#3a1a14", tintOpacity: 0.12 });
  return s;
}, { opaque: true, seed: 342 });

/* Low angle on G: the bulb behind his head, gun aimed at the lens */
function gLow(r, fire) {
  let s = rect(0, 0, W, H, fire ? "#2a1408" : "#3a3e3a");
  if (!fire) s = rect(0, 0, W, H, `fill="#3a3e3a"`);
  else s = rect(0, 0, W, H, `fill="#2a1408"`);
  s += glow(820, 160, 700, 420, fire ? FIRE : HARSH, 0.8) + ell(820, 120, 30, 30, `fill="${fire ? "#ffd8a0" : "#ffffff"}"`);
  s += g(`filter="url(#paint)"`, poly([[0, 0], [W, 0], [W, 200], [0, 260]], `fill="#1a1a18" opacity="0.6"`));
  // looking up: huge legs and torso foreshortened, head small against the light
  s += figure(820, 1500, { ...who("g"), pose: { lUp: -24, lFore: -10, rUp: 40, rFore: 100, lThigh: -10, rThigh: 10 }, size: 1260, rim: fire ? "#ffb070" : "#dfe8e4", light: [0, -1], rimWidth: 6, fill: "#020202",
    extra: (fp) => `<g transform="translate(${fp.hands.r[0]},${fp.hands.r[1]})">${rect(-10, -60, 120, 46, `fill="#020202"`)}${ell(112, -37, 16, 16, `fill="#000"`)}${ell(112, -37, 22, 22, `fill="none" stroke="${fire ? "#ffb070" : "#c8d4d0"}" stroke-width="3"`)}</g>` });
  s += finish(W, H, { vignette: 0.85, tint: fire ? "#4a1a08" : "#3a5a48", tintOpacity: 0.12 });
  void r;
  return s;
}
const gLowLit = L("g-low", (r) => gLow(r, false), { opaque: true, seed: 351 });
const gLowFire = L("g-low-fire", (r) => gLow(r, true), { opaque: true, seed: 352 });

/* The painting lifted off the wall: the small knob */
function knobPlate(r, lifted, open) {
  let s = g(`filter="url(#paintV)"`, rect(0, 0, W, H, `fill="#4e4a40"`), scumble(r, 0, 0, W, H, 90, ["#5e584c", "#2a2620"], { angle: Math.PI / 2, len: [60, 260], width: [4, 14], jitter: 0.1, opacity: [0.08, 0.2] }));
  if (open) {
    // the wall section swung open: a black arch with a faint round room beyond
    s += g(`filter="url(#paint)"`, rect(380, 60, 840, 820, `fill="#050505"`), poly([[1220, 60], [1420, 20], [1420, 900], [1220, 880]], `fill="#3e3a32"`), ell(800, 640, 300, 60, `fill="#141210"`), glow(800, 420, 260, 300, "#7a8a84", 0.25));
  } else {
    s += rect(380, 60, 4, 820, `fill="#2a2620" opacity="0.6"`) + rect(1216, 60, 4, 820, `fill="#2a2620" opacity="0.6"`);
    s += rect(780, 430, 50, 50, `fill="#2a2620"`) + ell(805, 455, 18, 18, `fill="#b08a40"`) + rect(800, 440, 10, 30, `fill="#6a5020"`);
    if (!lifted) s += g(`filter="url(#paint)"`, rect(560, 220, 500, 460, `fill="#6a5022"`), rect(580, 240, 460, 420, `fill="#2a1a10"`), glow(810, 500, 160, 80, "#a04018", 0.6));
    else {
      s += g(`filter="url(#paint)" transform="rotate(-8 1300 600)"`, rect(1150, 380, 500, 460, `fill="#6a5022"`), rect(1170, 400, 460, 420, `fill="#2a1a10"`));
      s += goo(handShapes(1120, 620, -0.3, 140, { pose: "grip", sleeve: 300 }) + handShapes(1500, 880, -1.2, 140, { pose: "grip", sleeve: 300 }), { fill: "#060606", rim: HARSH, light: [0, -1], blur: 5, rw: 4 });
    }
  }
  s += glow(800, 0, 900, 400, HARSH, 0.35);
  s += finish(W, H, { vignette: 0.8, tint: "#3a5a48", tintOpacity: 0.1 });
  return s;
}
const knob = L("knob", (r) => knobPlate(r, false, false), { opaque: true, seed: 361 });
const knobLifted = L("knob-lifted", (r) => knobPlate(r, true, false), { opaque: true, seed: 361 });
const wallOpen = L("wall-open", (r) => knobPlate(r, true, true), { opaque: true, seed: 361 });
const wallEnter = L("wall-enter", () =>
  figure(640, 860, { ...who("tyler"), pose: "walkB", size: 420, rim: HARSH, light: [0, -1], fill: "#050505" })
  + figure(800, 870, { ...who("tom"), pose: "walkB2", size: 440, rim: HARSH, light: [0, -1], fill: "#050505" })
  + figure(960, 880, { ...who("narr"), pose: "walkB", size: 440, rim: HARSH, light: [0, -1], fill: "#050505" })
  + figure(1400, 1250, { ...who("g"), pose: { lUp: -20, rUp: 30, rFore: 70 }, size: 1100, rim: HARSH, light: [-0.5, -1], fill: "#020202" }),
{ seed: 362 });

/* ------------------------------------------------------------------ */
/* The round chamber: panorama in three light states                      */
/* ------------------------------------------------------------------ */
function chamber(r, mode) {
  // mode: lamp | fire | dark
  const floorY = 760;
  let s = stoneWall(r, CW, CH);
  // curved floor/wall junction and ceiling beams
  s += g(`filter="url(#paint)"`, path(`M0,${floorY - 60} Q${CW / 2},${floorY - 160} ${CW},${floorY - 60} V${CH} H0Z`, `fill="#26231f"`),
    scumble(r, 0, floorY - 120, CW, 360, 140, ["#3a362f", "#121110", "#2a1612"], { angle: 0, len: [100, 400], width: [3, 9], opacity: [0.15, 0.35] }),
    ...Array.from({ length: 7 }, (_, i) => stroke([[i * 500 - 100, -20], [i * 500 + 60, 120]], 40, 30, "#100e0c")));
  s += g(`filter="url(#paint)"`,
    maidenSmall(CHAMBER.maiden, floorY + 20, 460),
    // spiked chair, side-on
    rect(CHAMBER.chair - 70, floorY - 170, 140, 20, `fill="#1e1c1a"`), rect(CHAMBER.chair + 50, floorY - 380, 22, 230, `fill="#1e1c1a"`), rect(CHAMBER.chair - 70, floorY - 150, 18, 160, `fill="#1e1c1a"`), rect(CHAMBER.chair + 50, floorY - 150, 18, 160, `fill="#1e1c1a"`),
    ...Array.from({ length: 10 }, (_, i) => poly([[CHAMBER.chair - 66 + i * 13, floorY - 170], [CHAMBER.chair - 60 + i * 13, floorY - 192], [CHAMBER.chair - 54 + i * 13, floorY - 170]], `fill="#6a6e70"`)),
    poly([[CHAMBER.chair - 6, floorY - 190], [CHAMBER.chair, floorY - 250], [CHAMBER.chair + 6, floorY - 190]], `fill="#9aa0a2"`),
    // the rack: frame, rollers, ropes
    rect(CHAMBER.rack - 210, floorY - 200, 420, 24, `fill="#3a2a1c"`), rect(CHAMBER.rack - 200, floorY - 176, 20, 176, `fill="#2a1c12"`), rect(CHAMBER.rack + 180, floorY - 176, 20, 176, `fill="#2a1c12"`),
    ell(CHAMBER.rack - 190, floorY - 210, 30, 30, `fill="#2a1c12"`), ell(CHAMBER.rack + 190, floorY - 210, 30, 30, `fill="#2a1c12"`), line(CHAMBER.rack - 190, floorY - 236, CHAMBER.rack - 40, floorY - 214, `stroke="#8a7a5a" stroke-width="4"`), line(CHAMBER.rack + 190, floorY - 236, CHAMBER.rack + 40, floorY - 214, `stroke="#8a7a5a" stroke-width="4"`),
    // operating table
    surgicalTable(CHAMBER.table, floorY + 30, 560),
    // the vat over the burner, chain and hook from the ceiling
    vatShape(CHAMBER.vat, floorY + 20, 360, 300),
    line(CHAMBER.vat, 0, CHAMBER.vat, floorY - 520, `stroke="#2a2a28" stroke-width="10" stroke-dasharray="16 6"`), path(`M${CHAMBER.vat},${floorY - 520} q0,40 -24,44 q-24,0 -20,-26`, `stroke="#5a5a56" stroke-width="10" fill="none"`),
    // tool table
    toolTable(CHAMBER.tools, floorY + 40, 420),
  );
  // the secret door at the far right: light from the coin room
  s += g(`filter="url(#paint)"`, rect(CHAMBER.door - 80, floorY - 520, 200, 560, `fill="#c8d8d0"`), rect(CHAMBER.door - 100, floorY - 540, 20, 580, `fill="#1a1816"`));
  // surgical lamp over the table
  s += line(CHAMBER.table, 0, CHAMBER.table, 230, `stroke="#0a0a0a" stroke-width="6"`) + path(`M${CHAMBER.table - 110},280 Q${CHAMBER.table},200 ${CHAMBER.table + 110},280Z`, `fill="#1a1c1c"`);
  if (mode !== "dark") {
    s += ell(CHAMBER.table, 280, 90, 14, `fill="#ffffff"`) + glow(CHAMBER.table, 300, 260, 60, "#ffffff", 0.9) + cone(CHAMBER.table, 284, Math.PI / 2, 0.55, 560, "#e8f4f8", 0.4);
    s += glow(CHAMBER.door, floorY - 250, 360, 400, "#c8d8d0", 0.4);
  }
  if (mode === "fire") {
    // the burner lit: blue flames and an orange bloom climbing the vat and the wall
    for (let i = 0; i < 14; i++) { const x = CHAMBER.vat - 100 + i * 15; s += stroke([[x, floorY - 40], [x + r.range(-4, 4), floorY - 40 - r.range(30, 70)]], 12, 2, r.pick(["#4a8ae8", "#6aa8f0", "#e8a040"]), `opacity="0.9"`); }
    s += glow(CHAMBER.vat, floorY - 60, 600, 360, FIRE, 0.65) + glow(CHAMBER.vat, floorY - 40, 200, 60, "#8ab8ff", 0.6);
  }
  const lights = mode === "dark" ? [{ x: CHAMBER.door, y: floorY - 260, rx: 300, ry: 420, power: 0.6 }]
    : [{ x: CHAMBER.table, y: floorY - 120, rx: 900, ry: 620, power: 1 }, { x: CHAMBER.door, y: floorY - 260, rx: 360, ry: 460, power: 0.8 }, ...(mode === "fire" ? [{ x: CHAMBER.vat, y: floorY - 180, rx: 700, ry: 560, power: 1 }] : [])];
  s += darkness(CW, CH, lights, mode === "dark" ? 0.94 : 0.8);
  s += finish(CW, CH, { vignette: 0.6, tint: mode === "fire" ? "#4a1a08" : "#2a3a3a", tintOpacity: 0.14 });
  return s;
}
const chamberLamp = L("chamber-lamp", (r) => chamber(r, "lamp"), { w: CW, h: CH, opaque: true, seed: 401 });
const chamberFire = L("chamber-fire", (r) => chamber(r, "fire"), { w: CW, h: CH, opaque: true, seed: 401 });
const chamberDark = L("chamber-dark", (r) => chamber(r, "dark"), { w: CW, h: CH, opaque: true, seed: 401 });
// a fully lit plate used under the dark one for the "naming" reveal
const chamberReveal = L("chamber-reveal", (r) => chamber(r, "lamp").replace(/<rect width="3000" height="1000" fill="#020203" opacity="0.8"[^>]*\/>/, ""), { w: CW, h: CH, opaque: true, seed: 401 });

// cast on the chamber panorama
const RIM = "#c8d8d4";
const C = (name, body, seed) => L(name, body, { w: CW, h: CH, seed });
const FL = 790;
const castEnter = C("ch-enter", () =>
  figure(CHAMBER.table + 300, FL, { ...who("tyler"), pose: "walkB", size: 380, rim: RIM, light: [-0.4, -1] })
  + figure(CHAMBER.table + 420, FL + 4, { ...who("tom"), pose: "walkB2", size: 400, rim: RIM, light: [-0.4, -1] })
  + figure(CHAMBER.table + 540, FL + 8, { ...who("narr"), pose: "walkB", size: 400, rim: RIM, light: [-0.4, -1] })
  + figure(CHAMBER.door - 40, FL + 20, { ...who("g"), pose: { rUp: 40, rFore: 80 }, size: 520, rim: RIM, light: [-1, -0.4] }), 411);
// standoff: G (left of table) with gun on Tyler; Tyler at centre; narrator and Tom right
const standoff = (tylerPose, gPose, extra = "") => () =>
  figure(CHAMBER.table - 330, FL + 10, { ...who("g"), pose: gPose, size: 540, rim: RIM, light: [1, -0.6] })
  + figure(CHAMBER.table + 120, FL + 20, { ...who("tyler"), pose: tylerPose, size: 400, rim: RIM, light: [-0.4, -1], flip: true })
  + figure(CHAMBER.table + 420, FL + 30, { ...who("tom"), pose: "standB", size: 410, rim: RIM, light: [-1, -0.6] })
  + figure(CHAMBER.table + 540, FL + 36, { ...who("narr"), pose: "standB", size: 410, rim: RIM, light: [-1, -0.6] }) + extra;
const castStand = C("ch-stand", standoff({ lUp: -6, rUp: 6, head: 10 }, { lUp: -6, rUp: 80, rFore: 86 }), 412);
const castComb = C("ch-comb", standoff({ lUp: -6, rUp: 6, head: 14, torso: 4 }, { lUp: -150, lFore: 140, rUp: 80, rFore: 86 }), 413);
const castPoint = C("ch-point", standoff({ rUp: 95, rFore: 90, lUp: -4, head: -4 }, { lUp: -6, rUp: 80, rFore: 86, head: 10 }), 414);
// Tyler hurrying to the tool table for the rope
const castRope = C("ch-rope", () =>
  figure(CHAMBER.table - 330, FL + 10, { ...who("g"), pose: { lUp: -6, rUp: 80, rFore: 86 }, size: 540, rim: RIM, light: [1, -0.6] })
  + figure(CHAMBER.tools - 120, FL + 30, { ...who("tyler"), pose: { ...{ lThigh: -18, lShin: -6, rThigh: 20, rShin: 34 }, torso: 14, rUp: 70, rFore: 60, lUp: -30, lFore: -50 }, size: 400, rim: RIM, light: [-0.4, -1] })
  + figure(CHAMBER.table + 420, FL + 30, { ...who("tom"), pose: "standB", size: 410, rim: RIM, light: [-1, -0.6] })
  + figure(CHAMBER.table + 540, FL + 36, { ...who("narr"), pose: "standB", size: 410, rim: RIM, light: [-1, -0.6] }), 415);
// close two-shot in profile: Tyler offers the rope, G's stun gun
const castOffer = C("ch-offer", () =>
  figure(CHAMBER.table - 240, FL + 10, { ...who("g"), pose: { lUp: 70, lFore: 80, rUp: 10, rFore: 20 }, size: 560, rim: RIM, light: [1, -0.6], extra: (fp) => rect(fp.hands.l[0] - 6, fp.hands.l[1] - 14, 50, 26, `fill="#050505"`) })
  + figure(CHAMBER.table + 30, FL + 20, { ...who("tyler"), pose: { lUp: -70, lFore: -80, rUp: -6, head: -6 }, size: 410, rim: RIM, light: [-0.4, -1], extra: (fp) => ell(fp.hands.l[0], fp.hands.l[1] + 20, 26, 40, `fill="none" stroke="#8a7a5a" stroke-width="6"`) }), 416);
const castStunned = C("ch-stunned", () =>
  figure(CHAMBER.table - 240, FL + 10, { ...who("g"), pose: { torso: 22, head: 24, lUp: 30, lFore: 50, rUp: 20, rFore: 40 }, size: 560, rim: RIM, light: [1, -0.6] })
  + figure(CHAMBER.table + 60, FL + 40, { ...who("tyler"), pose: { torso: 88, head: 4, lThigh: -88, rThigh: -88, lShin: -88, rShin: -88, hipDrop: 0.43, lUp: 170, lFore: 170, rUp: 170, rFore: 170 }, size: 410, rim: RIM, light: [-0.4, -1] }), 417);
// dragging Tyler to the vat
const castDrag = C("ch-drag", () =>
  figure(CHAMBER.vat - 280, FL + 14, { ...who("g"), pose: { torso: 14, head: 8, lUp: -40, lFore: -50, rUp: -30, rFore: -46, lThigh: 16, lShin: 26, rThigh: -14, rShin: -4 }, size: 560, rim: "#ffb070", light: [1, -0.4] })
  + figure(CHAMBER.vat - 720, FL + 40, { ...who("tyler"), pose: { torso: 82, head: 10, lThigh: -88, rThigh: -92, lShin: -88, rShin: -92, hipDrop: 0.43, lUp: 96, lFore: 94, rUp: 100, rFore: 96 }, size: 410, rim: RIM, light: [-0.4, -1] }), 418);
// G at the vat, back to us, "let's make some soup"
const castCook = C("ch-cook", () => figure(CHAMBER.vat + 40, FL + 60, { ...who("g"), pose: { lUp: -6, rUp: 30, rFore: 70, head: 10 }, size: 600, rim: "#ffb070", light: [0, -1] }), 419);
// G facing the two boys, who sit against the wall (right)
const castNext = C("ch-next", () =>
  figure(CHAMBER.table + 260, FL + 20, { ...who("g"), pose: { lUp: -10, rUp: 20, rFore: 40 }, size: 560, rim: "#ffb070", light: [-1, -0.4] })
  + figure(CHAMBER.tools - 40, FL + 40, { ...who("tom"), pose: { lThigh: -88, rThigh: -80, hipDrop: 0.25, head: 20, lUp: -10, lFore: 50, rUp: 10, rFore: 60 }, size: 410, rim: RIM, light: [-1, -0.4], flip: true })
  + figure(CHAMBER.tools + 120, FL + 44, { ...who("narr"), pose: { lThigh: -88, rThigh: -80, hipDrop: 0.25, head: 10, lUp: -10, lFore: 50, rUp: 10, rFore: 60 }, size: 410, rim: RIM, light: [-1, -0.4], flip: true }), 420);
// Tom breaks for the door; then down
const castRun = C("ch-run", () =>
  figure(CHAMBER.table - 200, FL + 10, { ...who("g"), pose: { lUp: -6, rUp: 92, rFore: 90 }, size: 560, rim: "#ffb070", light: [1, -0.6] })
  + figure(CHAMBER.tools + 40, FL + 30, { ...who("tom"), pose: { torso: 20, head: 6, lThigh: -40, lShin: 10, rThigh: 40, rShin: 70, lUp: 60, lFore: 100, rUp: -50, rFore: -10 }, size: 420, rim: RIM, light: [-0.6, -1] }), 421);
const castTomDown = C("ch-tomdown", () =>
  figure(CHAMBER.table - 200, FL + 10, { ...who("g"), pose: { lUp: -6, rUp: 92, rFore: 90 }, size: 560, rim: "#ffb070", light: [1, -0.6] })
  + figure(CHAMBER.tools - 80, FL + 50, { ...who("tom"), pose: { torso: -84, head: -6, lThigh: 80, rThigh: 70, lShin: 100, rShin: 60, hipDrop: 0.43, lUp: -160, lFore: -170, rUp: 160, rFore: 170 }, size: 420, rim: RIM, light: [-0.6, -1] }), 422);
// G hauling Tom toward the table
const castHaul = C("ch-haul", () =>
  figure(CHAMBER.table + 380, FL + 14, { ...who("g"), pose: { torso: -14, head: -6, lUp: -60, lFore: -80, rUp: -50, rFore: -70, lThigh: -16, rThigh: 18, rShin: 26 }, size: 560, rim: RIM, light: [1, -0.4], flip: true })
  + figure(CHAMBER.table + 690, FL + 44, { ...who("tom"), pose: { torso: -82, head: -10, lThigh: 88, rThigh: 80, lShin: 92, rShin: 70, hipDrop: 0.43, lUp: -150, lFore: -170, rUp: -160, rFore: -175 }, size: 420, rim: RIM, light: [-0.6, -1] }), 423);
// the charge: three beats moving left across the floor toward the maiden
const tackle = (x, lean) => () =>
  figure(x - 150, FL + 10, { ...who("g"), pose: { torso: -lean, head: -lean * 0.8, lUp: -150 + lean, lFore: -170 + lean, rUp: 50, rFore: 100, lThigh: -12 - lean * 0.4, lShin: -8, rThigh: 18, rShin: 24 }, size: 620, rim: RIM, light: [1, -0.4] })
  + figure(x + 90, FL + 20, { ...who("narr"), pose: { torso: -52, head: -30, lUp: -95, lFore: -60, rUp: -60, rFore: -100, lThigh: -26, lShin: -6, rThigh: 40, rShin: 58 }, size: 460, rim: RIM, light: [1, -0.4] });
const castTackle1 = C("ch-tackle1", tackle(CHAMBER.table - 220, 6), 424);
const castTackle2 = C("ch-tackle2", tackle(CHAMBER.rack + 100, 18), 425);
const castTackle3 = C("ch-tackle3", tackle(CHAMBER.chair + 140, 30), 426);
// leaving: the narrator holding Tom up, limping to the door
const castLeave = C("ch-leave", () =>
  figure(CHAMBER.tools + 120, FL + 20, { ...who("narr"), pose: { lUp: -40, lFore: -20, rUp: 10, torso: 6, lThigh: -10, rThigh: 8 }, size: 400, rim: RIM, light: [1, -0.4] })
  + figure(CHAMBER.tools + 210, FL + 24, { ...who("tom"), pose: { lUp: -120, lFore: -100, rThigh: -20, rShin: 10, torso: -6, head: 12 }, size: 410, rim: RIM, light: [1, -0.4] }), 427);

/* ------------------------------------------------------------------ */
/* Close-ups in the chamber                                              */
/* ------------------------------------------------------------------ */
const tools = L("tools", (r) => {
  let s = stoneWall(r, W, H, "#262420");
  s += g(`filter="url(#paint)"`, rect(0, 470, W, 430, `fill="#4a3422"`), scumble(r, 0, 470, W, 430, 80, ["#5a4430", "#2a1c12"], { angle: 0, len: [200, 600], width: [3, 8], jitter: 0.02, opacity: [0.2, 0.4] }));
  s += g(`filter="url(#paint)" transform="translate(800 700) scale(3.2) translate(-800 -700)"`, toolTable(800, 930, 420, 1.5));
  s += glow(800, 520, 700, 300, "#e8f4f8", 0.35);
  s += darkness(W, H, [{ x: 800, y: 560, rx: 820, ry: 440, power: 1 }], 0.8);
  s += finish(W, H, { vignette: 0.85, tint: "#2a3a3a", tintOpacity: 0.12 });
  return s;
}, { opaque: true, seed: 431 });

// G from behind, combing back the greasy hair; the gun still on Tyler beyond
function combPlate(r, up) {
  let s = stoneWall(r, W, H, "#24221e") + glow(1200, 300, 800, 500, HARSH, 0.45);
  s += figure(1300, 900, { ...who("tyler"), pose: { lUp: -6, rUp: 6, head: 14 }, size: 380, rim: RIM, light: [-0.4, -1], fill: "#060606" });
  s += figure(620, 1900, { ...who("g"), pose: up ? { lUp: -168, lFore: 118, rUp: 70, rFore: 80 } : { lUp: -150, lFore: 150, rUp: 70, rFore: 80 }, size: 1500, rim: "#d8e4e0", light: [0.5, -1], rimWidth: 8, fill: "#030303",
    extra: (fp) => {
      const [hx, hy] = fp.hands.l;
      const [cx, cy, hr] = fp.head;
      const comb = `<g transform="translate(${hx + 30},${hy - 20}) rotate(${up ? 24 : -6})">${rect(-110, -14, 220, 26, `fill="#0a0a0a"`)}${Array.from({ length: 26 }, (_, i) => rect(-106 + i * 8.4, 10, 4.4, 30, `fill="#0a0a0a"`)).join("")}${rect(-110, -14, 220, 5, `fill="#8a8a8a"`)}</g>`;
      const sheen = [0, 1].map((i) => stroke([[cx - hr * 0.7, cy - hr * (0.55 - i * 0.18)], [cx - hr * 0.1, cy - hr * (0.95 - i * 0.2)], [cx + hr * 0.6, cy - hr * (0.7 - i * 0.2)]], 5 - i, 1, "#b8c4c0", `opacity="${0.6 - i * 0.12}"`)).join("");
      return sheen + comb;
    } });
  s += finish(W, H, { vignette: 0.85, tint: "#2a3a3a", tintOpacity: 0.12 });
  return s;
}
const combUp = L("comb-up", (r) => combPlate(r, true), { opaque: true, seed: 441 });
const combDown = L("comb-down", (r) => combPlate(r, false), { opaque: true, seed: 441 });

// Tyler's legs: the spreading stain (stain drawn as its own layer so it can grow)
const legs = L("legs", (r) => {
  let s = stoneWall(r, W, H, "#22201c") + glow(800, 200, 900, 500, HARSH, 0.35);
  s += g(`filter="url(#paint)"`, rect(0, 780, W, 120, `fill="#2a2620"`));
  s += goo(`<path d="${capsulePath(640, -100, 120, 600, 860, 90)}"/><path d="${capsulePath(960, -100, 120, 1000, 860, 90)}"/><ellipse cx="580" cy="880" rx="140" ry="50"/><ellipse cx="1030" cy="880" rx="140" ry="50"/>`, { fill: "#34465a", rim: "#9aaabb", light: [0, -1], blur: 10, rw: 6 });
  s += g(`filter="url(#paintV)"`, scumble(r, 480, 0, 640, 860, 60, ["#2a3442", "#10141a"], { angle: Math.PI / 2, len: [80, 240], width: [3, 8], jitter: 0.1, opacity: [0.2, 0.4] }));
  s += finish(W, H, { vignette: 0.85 });
  return s;
}, { opaque: true, seed: 451 });
const stain = L("stain", () => `<g filter="url(#wob)">${path(smooth([[690, 0], [910, 0], [960, 220], [920, 420], [1000, 640], [940, 700], [880, 520], [800, 300], [720, 520], [640, 700], [590, 640], [660, 420], [640, 220]], true, 0.4), `fill="#06080b" opacity="0.92"`)}</g>`, { seed: 452 });

// the vat close-up: burner states
function vatPlate(r, flame) {
  let s = stoneWall(r, W, H, "#262420");
  s += g(`filter="url(#paint)"`, rect(0, 800, W, 100, `fill="#1e1c18"`));
  s += g(`filter="url(#paint)" transform="translate(800 820) scale(1.5) translate(-800 -820)"`, vatShape(800, 820, 360, 300));
  // chain and hook
  s += g(`filter="url(#paint)"`, line(800, -10, 800, 140, `stroke="#2a2a28" stroke-width="16" stroke-dasharray="26 8"`), path(`M800,140 q0,70 -40,76 q-40,0 -34,-44`, `stroke="#6a6a66" stroke-width="16" fill="none"`));
  if (flame > 0) {
    for (let i = 0; i < 26; i++) { const x = 560 + i * 19; s += stroke([[x, 760], [x + r.range(-6, 6), 760 - r.range(40, 90) * flame]], 18, 3, r.pick(flame > 1 ? ["#e8a040", "#f0c060", "#4a8ae8"] : ["#4a8ae8", "#6aa8f0", "#8ac0ff"]), `opacity="0.92"`); }
    s += glow(800, 740, 600 * flame, 220 * flame, flame > 1 ? FIRE : "#5a9af0", 0.7) + glow(800, 600, 700, 500, FIRE, 0.25 * flame);
  }
  s += darkness(W, H, [{ x: 800, y: 560, rx: 820, ry: 560, power: 1 }], flame > 0 ? 0.6 : 0.82);
  s += finish(W, H, { vignette: 0.85, tint: flame > 0 ? "#4a1a08" : "#2a3a3a", tintOpacity: 0.12 });
  return s;
}
const vatOff = L("vat-off", (r) => vatPlate(r, 0), { opaque: true, seed: 461 });
const vatOn = L("vat-on", (r) => vatPlate(r, 1), { opaque: true, seed: 461 });
const vatHot = L("vat-hot", (r) => vatPlate(r, 1.6), { opaque: true, seed: 461 });
// Tyler's hand roped to the hook above the rim: three states
const vatHand = (pose, ang) => () => goo(handShapes(770, 190, ang, 110, { pose, sleeve: 240, sleeveW: 1.0 }) + `<rect x="700" y="210" width="140" height="40" rx="10" transform="rotate(${-90 + ang * 57} 770 230)"/>`, { fill: "#060606", rim: "#ffb070", light: [0, 1], blur: 5, rw: 5 })
  + `<g transform="rotate(${-90 + ang * 57} 770 230)">${line(700, 220, 840, 240, `stroke="#9a8a6a" stroke-width="7"`)}${line(700, 236, 840, 256, `stroke="#9a8a6a" stroke-width="7"`)}</g>`;
const vatHandFist = L("vathand-fist", vatHand("fist", -Math.PI / 2 - 0.1), { seed: 462 });
const vatHandClaw = L("vathand-claw", vatHand("claw", -Math.PI / 2 + 0.15), { seed: 463 });
const vatHandLimp = L("vathand-limp", vatHand("open", -Math.PI / 2 + 0.95), { seed: 464 });

// G approaching the lens, backlit by the lamp (POV of the boys)
const gApproach = L("g-approach", (r) => {
  let s = stoneWall(r, W, H, "#22201c") + glow(800, 120, 600, 300, "#ffffff", 0.85) + cone(800, 100, Math.PI / 2, 0.6, 800, "#e8f4f8", 0.35);
  s += figure(800, 1640, { ...who("g"), pose: { lUp: -16, lFore: -8, rUp: 20, rFore: 30 }, size: 1400, rim: "#e8f0f0", light: [0, -1], rimWidth: 8, fill: "#020202" });
  s += finish(W, H, { vignette: 0.85, tint: "#2a3a3a", tintOpacity: 0.12 });
  return s;
}, { opaque: true, seed: 471 });
const gApproachFire = L("g-approach-fire", (r) => {
  let s = stoneWall(r, W, H, "#2a1e16") + glow(1200, 600, 900, 600, FIRE, 0.7);
  s += figure(760, 1640, { ...who("g"), pose: { lUp: -16, lFore: -8, rUp: 20, rFore: 30, head: 6 }, size: 1400, rim: "#ffb070", light: [1, -0.3], rimWidth: 8, fill: "#020202" });
  s += finish(W, H, { vignette: 0.85, tint: "#4a1a08", tintOpacity: 0.12 });
  return s;
}, { opaque: true, seed: 472 });
// G shooting at the charging narrator
const gShoot = L("g-shoot", (r) => {
  let s = stoneWall(r, W, H, "#22201c") + glow(400, 120, 600, 300, "#ffffff", 0.6);
  s += figure(820, 1450, { ...who("g"), pose: { rUp: 92, rFore: 90, lUp: -16 }, size: 1300, rim: "#e8f0f0", light: [-1, -0.6], rimWidth: 7, fill: "#020202",
    extra: (fp) => rect(fp.hands.r[0], fp.hands.r[1] - 22, 110, 34, `fill="#020202"`) });
  s += finish(W, H, { vignette: 0.85 });
  return s;
}, { opaque: true, seed: 473 });

/* The iron maiden close-up: four door states */
function maidenPlate(r, state) {
  // state: 0 open, 1 half, 2 nearly, 3 closed
  let s = stoneWall(r, W, H, "#201e1a");
  s += g(`filter="url(#paint)"`, rect(0, 820, W, 80, `fill="#1a1814"`));
  const cx = 800, top = 70, hgt = 780, wdt = 380;
  const body = maidenOutline(cx, top, wdt, hgt);
  s += g(`filter="url(#paint)"`, path(body, `fill="#2a2724"`), path(maidenOutline(cx, top + 40, wdt * 0.82, hgt * 0.92), `fill="#050404"`));
  for (let i = 0; i < 9; i++) s += spikes(cx - wdt * 0.32, top + 160 + i * 66, cx + wdt * 0.32, top + 160 + i * 66, 5, 0.1, 0, "#4a4e50") + g(``, ...Array.from({ length: 5 }, (_, k) => ell(cx - wdt * 0.32 + (k + 0.5) * (wdt * 0.64 / 5), top + 160 + i * 66, 5, 5, `fill="#7a7e80"`)));
  // doors: hinge at outer edges, inner faces with spikes
  const open = [1, 0.55, 0.18, 0][state];
  for (const side of [-1, 1]) {
    const hingeX = cx + side * wdt * 0.5;
    const reach = wdt * 0.5;
    // free edge x: when open it swings toward the camera and outward; when closed it meets the centre
    const freeX = hingeX + side * reach * open * 0.95 - side * reach * (1 - open);
    const persp = 1 + open * 0.12;
    const ty = top + 30 - open * 30, by = top + hgt + open * 20;
    s += g(`filter="url(#paint)"`, poly([[hingeX, top + 40], [freeX, ty], [freeX, by], [hingeX, top + hgt - 10]], `fill="${open > 0.3 ? "#2e2a26" : "#3a3632"}" stroke="#0a0908" stroke-width="5"`));
    if (open > 0.1) {
      for (let i = 0; i < 9; i++) {
        const t = (i + 0.7) / 10;
        const y0 = top + 40 + (hgt - 50) * t, y1 = ty + (by - ty) * t;
        s += spikes(hingeX, y0, freeX, y1, 3, -side * 26 * persp * open, 1, "#8a8e90").replace(/\[/g, "[");
      }
    } else {
      // closed: riveted bands across the front, a plain iron face plate (no features)
      s += line(cx, top + 30, cx, top + hgt, `stroke="#0a0908" stroke-width="8"`);
      for (const y of [top + 260, top + 470, top + 680]) s += rect(cx - wdt * 0.48, y, wdt * 0.96, 26, `fill="#1e1c1a"`) + Array.from({ length: 8 }, (_, k) => ell(cx - wdt * 0.44 + k * wdt * 0.126, y + 13, 5, 5, `fill="#8a8a86"`)).join("");
    }
  }
  if (state === 3) s += g(`filter="url(#wob)"`, ell(cx + 10, 838, 70, 14, `fill="${CRIM}"`), stroke([[cx + 4, top + hgt - 60], [cx + 6, 830]], 6, 3, CRIM));
  s += glow(cx, 300, 560, 520, "#e8f4f8", 0.25);
  s += darkness(W, H, [{ x: cx, y: 460, rx: 700, ry: 560, power: 1 }], 0.82);
  s += finish(W, H, { vignette: 0.85, tint: "#2a3a3a", tintOpacity: 0.12 });
  return s;
}
const imOpen = L("im-open", (r) => maidenPlate(r, 0), { opaque: true, seed: 481 });
const imHalf = L("im-half", (r) => maidenPlate(r, 1), { opaque: true, seed: 481 });
const imNear = L("im-near", (r) => maidenPlate(r, 2), { opaque: true, seed: 481 });
const imClosed = L("im-closed", (r) => maidenPlate(r, 3), { opaque: true, seed: 481 });
// G's mass inside the open maiden, and the narrator heaving on the right-hand door
const imG = L("im-g", () => figure(800, 900, { ...who("g"), pose: { lUp: -60, lFore: -100, rUp: 60, rFore: 100, head: 6 }, size: 820, rim: "#a8b4b0", light: [0, -1], rimWidth: 5, fill: "#020202" }), { seed: 482 });
const imGHalf = L("im-g-half", () => `<defs><clipPath id="gap"><rect x="640" y="0" width="320" height="900"/></clipPath></defs><g clip-path="url(#gap)">${figure(800, 900, { ...who("g"), pose: { lUp: -20, lFore: -30, rUp: 20, rFore: 30, head: 14 }, size: 820, rim: "#a8b4b0", light: [0, -1], rimWidth: 5, fill: "#020202" })}</g>`, { seed: 483 });
const imPush = L("im-push", () => figure(1240, 920, { ...who("narr"), pose: { torso: -28, head: -14, lUp: -90, lFore: -80, rUp: -70, rFore: -75, lThigh: -10, rThigh: 30, rShin: 46 }, size: 700, rim: "#c8d8d4", light: [-1, -0.4], fill: "#040404" }), { seed: 484 });

/* Freezer found by the police */
const freezer = L("freezer", (r) => {
  let s = g(`filter="url(#paintV)"`, grime(r, 0, 0, W, H, "#2a3036", { stains: 12 }));
  s += g(`filter="url(#paint)"`, rect(360, 120, 880, 700, `fill="#b8c4ca"`), rect(380, 140, 840, 660, `fill="#9aa8b0"`), rect(1140, 380, 40, 160, `fill="#4a5258"`), line(800, 140, 800, 800, `stroke="#5a666e" stroke-width="6"`),
    scumble(r, 380, 140, 840, 660, 80, ["#e8f2f6", "#7a8a94"], { angle: 0.3, len: [20, 90], width: [2, 6], jitter: 1.5, opacity: [0.2, 0.5] }), rect(0, 820, W, 80, `fill="#1a1e22"`));
  s += glow(800, 460, 500, 380, "#c8e0f0", 0.3);
  // police flashlight beam and red/blue spill
  s += cone(1600, 120, Math.PI * 0.8, 0.12, 900, "#ffffff", 0.35) + glow(200, 700, 400, 300, "#c0202a", 0.25) + glow(1400, 700, 400, 300, "#2a5ac8", 0.25);
  s += darkness(W, H, [{ x: 800, y: 460, rx: 700, ry: 520, power: 1 }], 0.7);
  s += finish(W, H, { vignette: 0.85, tint: "#2a4a5a", tintOpacity: 0.14 });
  return s;
}, { opaque: true, seed: 491 });

/* ------------------------------------------------------------------ */
/* ACT IV: the institution, the corridor, the last image                 */
/* ------------------------------------------------------------------ */
const instRoom = L("inst-room", (r) => {
  const R = room(380, 160, 860, 560);
  let s = g(`filter="url(#paintV)"`, poly(R.back, `fill="#4a524e"`), poly(R.left, `fill="#3a423e"`), poly(R.right, `fill="#353c38"`), poly(R.ceil, `fill="#2a302c"`), poly(R.floor, `fill="#3a3e3a"`));
  // barred window, moonlight squares on the floor
  s += g(`filter="url(#paint)"`, rect(900, 240, 220, 200, `fill="#0c1218"`), rect(910, 250, 200, 180, `fill="#3a5a78"`), ...[0, 1, 2, 3, 4].map((i) => rect(920 + i * 44, 250, 8, 180, `fill="#141a1e"`)));
  s += `<g style="mix-blend-mode:screen" filter="url(#glow)" opacity="0.45">${poly([[910, 430], [1110, 430], [1300, 860], [880, 860]], `fill="#7aa0c8"`)}</g>`;
  // iron bed against the left wall, thin mattress
  s += g(`filter="url(#paint)"`, poly([[200, 600], [720, 560], [760, 640], [220, 720]], `fill="#c8ccc4"`), rect(200, 720, 560, 18, `fill="#2a2e2c"`), rect(210, 520, 16, 260, `fill="#2a2e2c"`), rect(740, 520, 16, 200, `fill="#2a2e2c"`));
  s += darkness(W, H, [{ x: 1000, y: 600, rx: 700, ry: 500, power: 0.9 }], 0.72);
  s += finish(W, H, { vignette: 0.85, tint: "#2a4a5a", tintOpacity: 0.18 });
  return s;
}, { opaque: true, seed: 501 });
const instNarr = L("inst-narr", () => figure(520, 830, { ...who("narr"), pose: { lThigh: -88, rThigh: -84, hipDrop: 0.25, torso: 14, head: 34, lUp: -10, lFore: 40, rUp: 10, rFore: -40 }, size: 430, rim: "#9ab8d8", light: [1, -0.4], fill: "#060708" }), { seed: 502 });
const instCorr = L("inst-corr", (r) => {
  const R = room(700, 300, 200, 220);
  let s = g(`filter="url(#paintV)"`, poly(R.back, `fill="#5a6a64"`), poly(R.left, `fill="#4a5a54"`), poly(R.right, `fill="#44524e"`), poly(R.ceil, `fill="#3a4642"`), poly(R.floor, `fill="#6a7670"`));
  for (let k = 0; k < 7; k++) { const t = Math.pow(k / 7, 1.4); const c = lerp2([800, 20], [800, 298], t); const w = 300 * (1 - t) + 40; s += rect(c[0] - w / 2, c[1], w, 12 * (1 - t) + 3, `fill="#eaf6f0"`) + glow(c[0], c[1] + 10, w, 60, "#d8f0e8", 0.35); }
  for (const side of [-1, 1]) for (let i = 0; i < 4; i++) { const t0 = 0.1 + i * 0.22, t1 = t0 + 0.08; const e0 = side < 0 ? [[0, 80], [700, 300]] : [[W, 80], [900, 300]]; const e1 = side < 0 ? [[0, 860], [700, 520]] : [[W, 860], [900, 520]]; const a0 = lerp2(e0[0], e0[1], t0), a1 = lerp2(e0[0], e0[1], t1), b0 = lerp2(e1[0], e1[1], t0), b1 = lerp2(e1[0], e1[1], t1); s += g(`filter="url(#paint)"`, poly([a0, a1, b1, b0], `fill="#2a3430"`)); }
  s += g(`filter="url(#paint)"`, scumble(r, 0, 560, W, 340, 70, ["#8a9690", "#3a4642"], { angle: 0, len: [100, 300], width: [2, 6], opacity: [0.15, 0.3] }));
  s += finish(W, H, { vignette: 0.85, tint: "#2a4a44", tintOpacity: 0.16 });
  return s;
}, { opaque: true, seed: 511 });
const instWalk = L("inst-walk", () => figure(800, 700, { ...who("narr"), pose: "walkB", size: 300, rim: "#e0f0e8", light: [0, -1], fill: "#0a0c0c" }), { seed: 512 });

// final image: the closed maiden in a shaft of light, the black comb on the floor
const finalPlate = L("final", (r) => {
  let s = rect(0, 0, W, H, `fill="#030303"`);
  s += `<g opacity="0.95">${maidenPlate(r, 3).replace(/<rect width="1600" height="900" fill="url\(#[^)]+\)"\/>\s*$/, "")}</g>`;
  s += darkness(W, H, [{ x: 800, y: 420, rx: 380, ry: 640, power: 1 }], 0.9);
  s += cone(800, -40, Math.PI / 2, 0.22, 980, "#e8f4f8", 0.25);
  // the comb
  s += `<g transform="translate(1040 842) rotate(-12)">${rect(-80, -10, 160, 18, `fill="#0c0c0c"`)}${Array.from({ length: 20 }, (_, i) => rect(-76 + i * 8, 6, 4, 18, `fill="#0c0c0c"`)).join("")}${rect(-80, -10, 160, 4, `fill="#7a7a7a"`)}</g>`;
  s += finish(W, H, { vignette: 0.9 });
  return s;
}, { opaque: true, seed: 521 });

export const ACT3 = [
  doorPlate, doorG, doorBoys, doorTyler, doorTomShoved, bloodFloor, gHand, gHandHead, tomCry, gun, exec, splatter, gLowLit, gLowFire,
  knob, knobLifted, wallOpen, wallEnter, chamberLamp, chamberFire, chamberDark, chamberReveal, castEnter, castStand, castComb, castPoint,
  castRope, castOffer, castStunned, castDrag, castCook, castNext, castRun, castTomDown, castHaul, castTackle1, castTackle2, castTackle3,
  castLeave, tools, combUp, combDown, legs, stain, vatOff, vatOn, vatHot, vatHandFist, vatHandClaw, vatHandLimp, gApproach,
  gApproachFire, gShoot, imOpen, imHalf, imNear, imClosed, imG, imGHalf, imPush, freezer, instRoom, instNarr, instCorr, instWalk, finalPlate,
];
