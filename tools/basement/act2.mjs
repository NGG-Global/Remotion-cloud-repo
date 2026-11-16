/**
 * ACT II: inside the house, the basement door, the stairs, the steel door,
 * the coin room. Plates come in pairs: "-lit" (what a flashlight reveals)
 * and "-dark" (the room in darkness). The composition lays the dark plate
 * over the lit one and cuts moving flashlight holes through it.
 */
import { L } from "./act1.mjs";
import {
  PAL, W, H, rect, poly, line, ell, g, path, smooth, stroke, scumble, speckle, grime, planks, glow, cone, finish,
  figure, who, room, lerp2, darkness, lin, linU, radU, rad, goo, handShapes, capsulePath, text, bareTree, house,
} from "./lib.mjs";

const COLD = "#cfdbe4";

/* ------------------------------------------------------------------ */
/* Ground floor of the target house                                      */
/* ------------------------------------------------------------------ */
function groundFloor(r, lit) {
  const R = room(420, 210, 820, 460);
  let s = g(`filter="url(#paintV)"`, poly(R.back, `fill="#3a3a36"`), poly(R.left, `fill="#2e2d2a"`), poly(R.right, `fill="#28272a"`), poly(R.ceil, `fill="#1a1918"`), poly(R.floor, `fill="#2a221a"`));
  // wallpaper stripes on the back wall
  let wp = "";
  for (let x = 430; x < 1240; x += 28) wp += line(x, 215, x, 665, `stroke="#2a2a26" stroke-width="6" opacity="0.5"`);
  s += g(`filter="url(#ink)"`, wp);
  // floorboards
  let fb = "";
  for (let i = 0; i <= 20; i++) { const b = [420 + (820 * i) / 20, 670]; const c = [-900 + (3400 * i) / 20, H]; fb += line(b[0], b[1], c[0], c[1], `stroke="#140f0a" stroke-width="2" opacity="0.7"`); }
  s += g(`filter="url(#ink)"`, fb);
  // windows on the back wall with moonlight
  for (const x of [470, 1060]) {
    s += g(`filter="url(#paint)"`, rect(x, 280, 130, 230, `fill="#0c0f13"`), rect(x + 8, 288, 114, 214, `fill="#2a3a4a"`), line(x + 65, 288, x + 65, 502, `stroke="#0c0f13" stroke-width="6"`), line(x + 8, 395, x + 122, 395, `stroke="#0c0f13" stroke-width="6"`),
      path(`M${x - 20},270 q85,30 170,0 v260 q-85,-20 -170,0z`, `fill="#2a1a14" opacity="0.85"`));
    s += `<g style="mix-blend-mode:screen" opacity="0.25" filter="url(#glow)">${poly([[x + 8, 502], [x + 122, 502], [x + 260, 860], [x - 60, 860]], `fill="#8aa8c8"`)}</g>`;
  }
  // furniture: sofa, cabinet with drawers, tall speakers + hi-fi
  s += g(`filter="url(#paint)"`,
    path(smooth([[620, 670], [630, 560], [700, 540], [960, 540], [1030, 560], [1040, 670]], true, 0.3), `fill="#3a2a22"`), rect(600, 600, 460, 90, `fill="#30221c"`),
    // cabinet left foreground
    poly([[0, 420], [300, 470], [300, 860], [0, 900]], `fill="#3a2a1c"`),
    ...[0, 1, 2, 3].map((i) => poly([[20, 470 + i * 100], [280, 505 + i * 92], [280, 580 + i * 92], [20, 555 + i * 100]], `fill="#2e2016" stroke="#120c08" stroke-width="4"`) + ell(150, 515 + i * 98, 14, 8, `fill="#b08a50"`)),
    // hi-fi rack and speakers right
    rect(1290, 470, 90, 300, `fill="#141414"`), rect(1480, 440, 100, 350, `fill="#141414"`), ell(1335, 560, 30, 30, `fill="#0a0a0a" stroke="#3a3a3a" stroke-width="4"`), ell(1335, 680, 38, 38, `fill="#0a0a0a" stroke="#3a3a3a" stroke-width="4"`), ell(1530, 540, 32, 32, `fill="#0a0a0a" stroke="#3a3a3a" stroke-width="4"`), ell(1530, 680, 40, 40, `fill="#0a0a0a" stroke="#3a3a3a" stroke-width="4"`),
    rect(1390, 600, 80, 140, `fill="#1c1c1c"`), ...[0, 1, 2].map((i) => rect(1396, 610 + i * 44, 68, 34, `fill="#2a2a2a"`)),
    // picture frames on the back wall
    rect(760, 300, 140, 100, `fill="#1a1612" stroke="#6a5432" stroke-width="6"`), rect(930, 320, 80, 110, `fill="#1a1612" stroke="#6a5432" stroke-width="5"`),
    // rug
    poly([[500, 720], [1180, 720], [1350, 860], [330, 860]], `fill="#4a2a22" opacity="0.6"`),
  );
  // staircase going up at the right wall
  let st = "";
  for (let i = 0; i < 9; i++) st += poly([[1240 + i * 40, 670 - i * 52], [1300 + i * 40, 670 - i * 52], [1300 + i * 40, 690 - i * 52], [1240 + i * 40, 690 - i * 52]], `fill="#3a2a1c"`);
  s += g(`filter="url(#paint)"`, st, line(1240, 600, 1600, 130, `stroke="#1a120a" stroke-width="10"`));
  // basement door on the left wall (dark)
  s += g(`filter="url(#paintV)"`, poly([[330, 330], [400, 320], [400, 640], [330, 660]], `fill="#2a1e14"`));
  s += lit ? darkness(W, H, [{ x: 800, y: 560, rx: 900, ry: 500, power: 0.55 }], 0.55) : darkness(W, H, [{ x: 520, y: 400, rx: 200, ry: 180, power: 0.4 }, { x: 1120, y: 400, rx: 200, ry: 180, power: 0.4 }], 0.9);
  s += finish(W, H, { vignette: 0.85, tint: "#203448", tintOpacity: 0.16 });
  return s;
}
const gfLit = L("gf-lit", (r) => groundFloor(r, true), { opaque: true, seed: 201 });
const gfDark = L("gf-dark", (r) => groundFloor(r, false), { opaque: true, seed: 201 });
// Tyler barking at Chris by the speakers; narrator's hand at a drawer
const gfCast = L("gf-cast", () => {
  const m = { fill: "#050506" };
  let s = figure(1420, 830, { ...who("chris"), pose: { rUp: 60, rFore: 40, lUp: 50, lFore: 30, torso: 8 }, size: 380, rim: "#a8c0d8", light: [-1, -0.3], ...m });
  s += figure(980, 800, { ...who("tyler"), pose: { rUp: 95, rFore: 92, lUp: -10, torso: 6, head: 6 }, size: 380, rim: "#a8c0d8", light: [-1, -0.3], ...m });
  s += goo(handShapes(160, 690, -0.1, 110, { pose: "grip", sleeve: 300, sleeveW: 1 }) , { fill: "#050506", rim: "#d8e4ee", light: [1, -0.5], blur: 5, rw: 4 });
  return s;
}, { seed: 202 });
// splitting up: Chris and Tom on the stairs, Tyler and the narrator toward the basement door
const gfSplit = L("gf-split", () => {
  const m = { fill: "#050506" };
  return figure(1370, 560, { ...who("chris"), pose: "walkB", size: 300, rim: "#a8c0d8", light: [-1, -0.3], ...m })
    + figure(1470, 450, { ...who("tom"), beanie: false, pose: "walkB2", size: 310, rim: "#a8c0d8", light: [-1, -0.3], ...m })
    + figure(520, 860, { ...who("tyler"), pose: "walkB", size: 420, rim: "#a8c0d8", light: [1, -0.3], ...m, flip: true })
    + figure(700, 880, { ...who("narr"), pose: "walkB2", size: 430, rim: "#a8c0d8", light: [1, -0.3], ...m, flip: true });
}, { seed: 203 });

/* ------------------------------------------------------------------ */
/* The basement door with the heavy padlock                              */
/* ------------------------------------------------------------------ */
function basementDoor(r, broken) {
  let s = g(`filter="url(#paintV)"`, grime(r, 0, 0, W, H, "#3a3630", { stains: 16 }));
  s += g(`filter="url(#paint)"`, rect(0, 820, W, 80, `fill="#1e1812"`));
  // door frame and cheap wooden door
  const dx = 520, dy = 40, dw = 560, dh = 800;
  s += g(`filter="url(#paintV)"`, rect(dx - 40, dy - 30, dw + 80, dh + 40, `fill="#1a140e"`));
  if (!broken) {
    s += g(`filter="url(#paintV)"`, planks(r, dx, dy, dw, dh, { base: "#5a4430", dark: "#1e140c", light: "#7a5e40", gap: 70 }), rect(dx, dy + 120, dw, 26, `fill="#3a2a1c"`), rect(dx, dy + dh - 160, dw, 26, `fill="#3a2a1c"`));
    // hasp and padlock
    s += g(`filter="url(#paint)"`,
      rect(dx + dw - 140, dy + 380, 150, 40, `fill="#2a2a2a"`), rect(dx + dw - 30, dy + 360, 60, 80, `fill="#3a3a3a"`),
      path(`M${dx + dw - 70},${dy + 420} v-60 a52,52 0 0 1 104,0 v60`, `fill="none" stroke="#9a9a96" stroke-width="18"`),
      rect(dx + dw - 100, dy + 410, 164, 150, `fill="#6a6a64" rx="16"`), rect(dx + dw - 100, dy + 410, 164, 40, `fill="#8a8a84" rx="12"`),
      ell(dx + dw - 18, dy + 500, 12, 18, `fill="#1a1a18"`), rect(dx + dw - 22, dy + 505, 8, 30, `fill="#1a1a18"`));
  } else {
    // the door kicked in: splintered edge, hanging open into black
    s += rect(dx, dy, dw, dh, `fill="#020202"`);
    s += g(`filter="url(#paintV)"`, poly([[dx, dy], [dx + 160, dy + 40], [dx + 160, dy + dh - 30], [dx, dy + dh]], `fill="#4a3826"`),
      ...Array.from({ length: 4 }, (_, i) => line(dx + 40 * i, dy + 10 * i, dx + 40 * i, dy + dh - 8 * i, `stroke="#1e140c" stroke-width="4"`)));
    let sp = "";
    for (let i = 0; i < 14; i++) { const y = dy + 300 + i * 22; sp += poly([[dx + 160, y], [dx + 160 + r.range(20, 70), y + r.range(-6, 6)], [dx + 160, y + 12]], `fill="#8a6a44"`); }
    s += `<g filter="url(#wob)">${sp}</g>`;
    s += speckle(r, dx - 100, dy + dh - 40, 700, 80, 60, "#7a5a3a", [2, 8], 0.8);
    // the padlock still hanging from the torn hasp
    s += g(`filter="url(#paint)"`, rect(dx + dw - 70, dy + 470, 100, 92, `fill="#5a5a54" rx="12"`), path(`M${dx + dw - 50},${dy + 470} v-40 a36,36 0 0 1 72,0 v40`, `fill="none" stroke="#8a8a86" stroke-width="12"`), rect(dx + dw - 120, dy + 400, 120, 30, `fill="#2a2a2a" transform="rotate(30 ${dx + dw - 60} ${dy + 415})"`));
  }
  s += glow(dx + dw - 20, dy + 480, 360, 300, COLD, 0.35);
  s += darkness(W, H, [{ x: dx + dw - 40, y: dy + 470, rx: 560, ry: 460, power: 1 }], 0.82);
  s += finish(W, H, { vignette: 0.88, tint: "#2a3440", tintOpacity: 0.14 });
  return s;
}
const bdoor = L("bdoor", (r) => basementDoor(r, false), { opaque: true, seed: 211 });
const bdoorBroken = L("bdoor-broken", (r) => basementDoor(r, true), { opaque: true, seed: 211 });
const bdoorKick = L("bdoor-kick", () => figure(330, 1000, { ...who("tyler"), pose: { torso: -10, head: -6, rThigh: 84, rShin: 92, lThigh: -4, lShin: -2, lUp: 40, lFore: 20, rUp: -30, rFore: -60 }, size: 820, rim: COLD, light: [1, -0.3], fill: "#050506" }), { seed: 212 });

/* ------------------------------------------------------------------ */
/* The staircase                                                         */
/* ------------------------------------------------------------------ */
// looking down from the top: narrow wooden steps into black
const stairsDown = L("stairs-down", (r) => {
  let s = rect(0, 0, W, H, `fill="#050505"`);
  s += g(`filter="url(#paintV)"`, poly([[0, 0], [520, 0], [690, 900], [0, 900]], `fill="#2a2620"`), poly([[1080, 0], [W, 0], [W, 900], [910, 900]], `fill="#24211c"`));
  let steps = "";
  for (let i = 0; i < 14; i++) {
    const t = i / 14, t2 = (i + 1) / 14;
    const y0 = 900 - Math.pow(t, 0.8) * 760, y1 = 900 - Math.pow(t2, 0.8) * 760;
    const xl0 = 0 + t * 560, xr0 = W - t * 560, xl1 = t2 * 560, xr1 = W - t2 * 560;
    steps += poly([[xl0, y0], [xr0, y0], [xr1, y1 + (y0 - y1) * 0.35], [xl1, y1 + (y0 - y1) * 0.35]], `fill="${i % 2 ? "#4a3a28" : "#463626"}"`);
    steps += poly([[xl1, y1 + (y0 - y1) * 0.35], [xr1, y1 + (y0 - y1) * 0.35], [xr1, y1], [xl1, y1]], `fill="#1a140e"`);
  }
  s += g(`filter="url(#paint)"`, steps);
  s += g(`filter="url(#paint)"`, stroke([[60, 0], [560, 520], [660, 640]], 20, 8, "#141210"));
  s += finish(W, H, { vignette: 0.6 });
  return s;
}, { opaque: true, seed: 221 });
const stairsDownDark = L("stairs-down-dark", () => rect(0, 0, W, H, `fill="#030303"`) + darkness(W, H, [], 0), { opaque: true, seed: 222 });
// two silhouettes descending, phones raised (seen from behind and above)
const stairsCast = L("stairs-cast", () =>
  figure(640, 1100, { ...who("tyler"), pose: { lUp: -8, lFore: 10, rUp: 14, rFore: -20, head: 20, torso: 6 }, size: 700, rim: COLD, light: [0, 1], fill: "#050506" })
  + figure(1000, 1260, { ...who("narr"), pose: { lUp: -6, lFore: 12, rUp: 12, rFore: -24, head: 18, torso: -4 }, size: 860, rim: COLD, light: [0, 1], fill: "#050506" }),
{ seed: 223 });
// looking up from the bottom of the stairs at the doorway; shadows will cross it
const stairsUp = L("stairs-up", (r) => {
  let s = rect(0, 0, W, H, `fill="#060605"`);
  s += g(`filter="url(#paintV)"`, poly([[0, 0], [600, 160], [640, 900], [0, 900]], `fill="#2a2620"`), poly([[1000, 160], [W, 0], [W, 900], [960, 900]], `fill="#221f1a"`));
  // door at the top, light spilling down
  s += rect(660, 120, 280, 280, `fill="#b8b0a0"`) + glow(800, 260, 300, 260, "#e8dcc0", 0.6);
  let steps = "";
  for (let i = 0; i < 12; i++) { const y = 420 + i * 44 + i * i * 1.8; const xl = 640 - i * 26, xr = 960 + i * 26; steps += rect(xl, y, xr - xl, 16 + i * 2, `fill="#3a2e22"`) + rect(xl, y + 16 + i * 2, xr - xl, 26 + i * 2, `fill="#120e0a"`); }
  s += g(`filter="url(#paint)"`, steps);
  s += `<g style="mix-blend-mode:screen" filter="url(#glow)" opacity="0.4">${poly([[660, 400], [940, 400], [1150, 900], [450, 900]], `fill="#a89a80"`)}</g>`;
  s += darkness(W, H, [{ x: 800, y: 380, rx: 520, ry: 560, power: 1 }], 0.8);
  s += finish(W, H, { vignette: 0.85, tint: "#3a3020", tintOpacity: 0.1 });
  void r;
  return s;
}, { opaque: true, seed: 224 });
// two silhouettes climbing toward the light (Tom's arm over the narrator's shoulder)
const stairsExit = L("stairs-exit", () =>
  figure(760, 760, { ...who("narr"), pose: { lThigh: -30, lShin: 6, rThigh: 8, lUp: -40, lFore: -20, rUp: 10, torso: 6 }, size: 440, rim: "#e8dcc0", light: [0, -1], fill: "#050506" })
  + figure(860, 780, { ...who("tom"), beanie: false, pose: { lUp: -120, lFore: -100, rThigh: -20, rShin: 10, torso: -6, head: 10 }, size: 450, rim: "#e8dcc0", light: [0, -1], fill: "#050506" }),
{ seed: 225 });

/* ------------------------------------------------------------------ */
/* Corridor and the steel door                                           */
/* ------------------------------------------------------------------ */
function corridor(r, lit, open) {
  const R = room(640, 250, 330, 430);
  let s = g(`filter="url(#paintV)"`, grime(r, 0, 0, W, H, "#2a2a28", { stains: 18, drips: 20 }));
  s += g(`filter="url(#paint)"`, poly(R.left, `fill="#33312c"`), poly(R.right, `fill="#26251f"`), poly(R.ceil, `fill="#121212"`), poly(R.floor, `fill="#1f1e1b"`));
  let lines = "";
  for (let i = 1; i < 12; i++) {
    const t = i / 12;
    const a = lerp2([0, 0], [0, H], t), b = lerp2([640, 250], [640, 680], t);
    const c = lerp2([W, 0], [W, H], t), d = lerp2([970, 250], [970, 680], t);
    lines += line(a[0], a[1], b[0], b[1], `stroke="#0b0b0a" stroke-width="${2.6 - t}" opacity="0.7"`) + line(c[0], c[1], d[0], d[1], `stroke="#0b0b0a" stroke-width="${2.6 - t}" opacity="0.7"`);
  }
  for (let k = 0; k < 7; k++) {
    const t = Math.pow(k / 7, 1.6);
    const xl = t * 640, xr = W - t * (W - 970), yt = t * 250, yb = H - t * (H - 680);
    lines += line(xl, yt, xl, yb, `stroke="#0b0b0a" stroke-width="2" opacity="0.6"`) + line(xr, yt, xr, yb, `stroke="#0b0b0a" stroke-width="2" opacity="0.6"`);
  }
  s += g(`filter="url(#ink)"`, lines);
  s += g(`filter="url(#paint)"`, stroke([[0, 70], [400, 175], [640, 240]], 26, 10, "#141414"), stroke([[0, 64], [400, 170], [640, 236]], 6, 2, "#5a5650", `opacity="0.5"`));
  const dx = 700, dy = 300, dw = 210, dh = 380;
  s += g(`filter="url(#paintV)"`, rect(dx - 14, dy - 14, dw + 28, dh + 14, `fill="#0c0c0c"`));
  if (!open) {
    s += g(`filter="url(#paintV)"`, rect(dx, dy, dw, dh, `fill="#4a5258"`),
      scumble(r, dx, dy, dw, dh, 40, ["#6b7378", "#2b3034", "#5a3a26"], { angle: Math.PI / 2, len: [40, 200], width: [2, 8], jitter: 0.05, opacity: [0.15, 0.4] }),
      rect(dx + 18, dy + 20, dw - 36, dh * 0.4, `fill="none" stroke="#2a2f33" stroke-width="5"`), rect(dx + 18, dy + dh * 0.5, dw - 36, dh * 0.44, `fill="none" stroke="#2a2f33" stroke-width="5"`),
      ...Array.from({ length: 10 }, (_, i) => ell(dx + 9, dy + 16 + i * 38, 3, 3, `fill="#202427"`) + ell(dx + dw - 9, dy + 16 + i * 38, 3, 3, `fill="#202427"`)),
      rect(dx + dw - 46, dy + dh * 0.47, 30, 10, `fill="#1a1c1e"`), ell(dx + dw - 40, dy + dh * 0.48, 9, 9, `fill="#8d969c"`));
    for (let i = 0; i < 9; i++) { const x0 = dx + r.range(10, dw - 10), y0 = dy + r.range(20, 80); s += stroke([[x0, y0], [x0 + r.range(-2, 2), y0 + r.range(60, 220)]], r.range(2, 5), 1, "#4a2a18", `opacity="0.45" filter="url(#wob)"`); }
  } else {
    // door swung inward: a black gap and the edge of the steel slab
    s += rect(dx, dy, dw, dh, `fill="#010101"`);
    s += g(`filter="url(#paintV)"`, poly([[dx + dw - 70, dy - 4], [dx + dw, dy], [dx + dw, dy + dh], [dx + dw - 70, dy + dh + 6]], `fill="#3a4044"`));
  }
  s += g(`filter="url(#paint)"`, scumble(r, 0, 690, W, 210, 90, ["#0c0c0b", "#3a3934", "#2a2925"], { angle: 0, len: [80, 300], width: [2, 6], opacity: [0.2, 0.5] }), speckle(r, 0, 690, W, 210, 300, "#000", [0.8, 3], 0.6));
  s += lit ? glow(805, 470, 320, 260, "#d6e2ea", 0.35) + darkness(W, H, [{ x: 805, y: 470, rx: 520, ry: 420, power: 1 }], 0.82) : darkness(W, H, [], 0.86);
  s += finish(W, H, { vignette: 0.85, tint: "#2c3d4f", tintOpacity: 0.18 });
  return s;
}
const corridorLit = L("corridor-lit", (r) => corridor(r, true, false), { opaque: true, seed: 21 });
const corridorDark = L("corridor-dark", (r) => corridor(r, false, false), { opaque: true, seed: 21 });
const corridorOpen = L("corridor-open", (r) => corridor(r, true, true), { opaque: true, seed: 21 });
// Tyler's attempts on the door, side-on silhouettes at the door
const tKick = L("corr-kick", () => figure(560, 760, { ...who("tyler"), pose: { torso: -12, head: -6, rThigh: 80, rShin: 88, lThigh: -4, lShin: -2, lUp: 40, lFore: 20, rUp: -30, rFore: -60 }, size: 400, rim: COLD, light: [1, -0.2], fill: "#050506" }), { seed: 231 });
const tKick2 = L("corr-kick2", () => figure(540, 760, { ...who("tyler"), pose: { torso: 4, rThigh: 20, rShin: 40, lThigh: -6, lUp: 20, lFore: 40, rUp: -20, rFore: -40 }, size: 400, rim: COLD, light: [1, -0.2], fill: "#050506" }), { seed: 232 });
const tShoulder = L("corr-shoulder", () => figure(600, 760, { ...who("tyler"), pose: { torso: 26, head: 14, rUp: 70, rFore: 40, lUp: -20, lFore: -40, rThigh: 16, rShin: 6, lThigh: -24, lShin: -6 }, size: 400, rim: COLD, light: [1, -0.2], fill: "#050506" }), { seed: 233 });
const tDown = L("corr-down", () => figure(520, 840, { ...who("tyler"), pose: { torso: 50, head: 30, lThigh: -84, lShin: -10, rThigh: -60, rShin: 10, hipDrop: 0.4, lUp: -10, lFore: 30, rUp: 60, rFore: 90 }, size: 400, rim: COLD, light: [1, -0.2], fill: "#050506" })
  + figure(1150, 920, { ...who("narr"), pose: "standB", size: 520, rim: COLD, light: [-1, -0.2], fill: "#050506" }), { seed: 234 });
// close-up: the steel lever handle and a hand turning it
const handle = L("handle", (r) => {
  let s = g(`filter="url(#paintV)"`, rect(0, 0, W, H, `fill="#3e464c"`), scumble(r, 0, 0, W, H, 120, ["#5a646a", "#262c30", "#5a3a26"], { angle: Math.PI / 2, len: [100, 400], width: [4, 14], jitter: 0.05, opacity: [0.1, 0.3] }));
  for (let i = 0; i < 6; i++) { const x0 = r.range(0, W), y0 = r.range(0, 200); s += stroke([[x0, y0], [x0 + r.range(-3, 3), y0 + r.range(200, 600)]], r.range(4, 12), 2, "#4a2a18", `opacity="0.4" filter="url(#wob)"`); }
  s += g(`filter="url(#paint)"`, rect(1100, 0, 40, H, `fill="#1a1e20"`), ...Array.from({ length: 6 }, (_, i) => ell(1060, 70 + i * 150, 9, 9, `fill="#2a2e30"`)),
    rect(860, 380, 120, 160, `fill="#2a2e32" rx="10"`), ell(920, 460, 34, 34, `fill="#7a8288"`), rect(560, 440, 380, 44, `fill="#8a9298" rx="20"`), rect(560, 440, 380, 14, `fill="#c0c8cc" rx="8"`));
  s += goo(handShapes(470, 510, -0.05, 150, { pose: "grip", sleeve: 420, sleeveW: 1.0 }), { fill: "#060607", rim: COLD, light: [0.5, -1], blur: 6, rw: 5 });
  s += glow(760, 460, 420, 280, "#e8f0f4", 0.35);
  s += darkness(W, H, [{ x: 760, y: 470, rx: 700, ry: 420, power: 1 }], 0.8);
  s += finish(W, H, { vignette: 0.9 });
  return s;
}, { opaque: true, seed: 235 });

/* ------------------------------------------------------------------ */
/* The coin room                                                         */
/* ------------------------------------------------------------------ */
function caseShape(pts, r, glint = 0.25) {
  // glass display case on a wall plane: dark cabinet, glass front with streaks
  let s = poly(pts, `fill="#1a1612"`);
  const inner = pts.map((p, i) => [p[0] + (i === 0 || i === 3 ? 8 : -8), p[1] + (i < 2 ? 10 : -10)]);
  s += poly(inner, `fill="#2a2a2c"`);
  s += poly([inner[0], lerp2(inner[0], inner[1], 0.18), lerp2(inner[3], inner[2], 0.05), inner[3]], `fill="#d8e4ea" opacity="${glint * 0.35}"`);
  return s;
}
function paintingFrame(x, y, w, h, scene = "#3a2a1a") {
  return rect(x - 12, y - 12, w + 24, h + 24, `fill="#6a5022"`) + rect(x - 4, y - 4, w + 8, h + 8, `fill="#3a2810"`) + rect(x, y, w, h, `fill="${scene}"`);
}
function coinRoom(r, mode) {
  // mode: dark | lit (flashlight base) | ceiling (harsh overhead light on)
  const R = room(440, 180, 720, 470);
  let s = g(`filter="url(#paintV)"`, poly(R.back, `fill="#4a4238"`), poly(R.left, `fill="#3a332b"`), poly(R.right, `fill="#342e27"`), poly(R.ceil, `fill="#221e1a"`), poly(R.floor, `fill="#2e2a26"`));
  s += g(`filter="url(#paintV)"`, scumble(r, 0, 0, W, 700, 120, ["#5a5044", "#1e1a16", "#4a2a1e"], { angle: Math.PI / 2, len: [60, 260], width: [4, 14], jitter: 0.1, opacity: [0.08, 0.2] }));
  // display cases along the left and right walls (perspective)
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const t0 = 0.06 + i * 0.32, t1 = t0 + 0.2;
      const edgeTop = side < 0 ? [[0, 120], [440, 300]] : [[W, 120], [1160, 300]];
      const edgeBot = side < 0 ? [[0, 760], [440, 600]] : [[W, 760], [1160, 600]];
      const a0 = lerp2(edgeTop[0], edgeTop[1], t0), a1 = lerp2(edgeTop[0], edgeTop[1], t1);
      const b0 = lerp2(edgeBot[0], edgeBot[1], t0), b1 = lerp2(edgeBot[0], edgeBot[1], t1);
      s += g(`filter="url(#paint)"`, caseShape([a0, a1, b1, b0], r, mode === "ceiling" ? 0.6 : 0.3));
      // paintings between the cases
      const p0 = lerp2(edgeTop[0], edgeTop[1], t1 + 0.03), p1 = lerp2(edgeTop[0], edgeTop[1], t1 + 0.1);
      if (i < 2) s += g(`filter="url(#paint)"`, poly([[p0[0], p0[1] + 20], [p1[0], p1[1] + 20], [p1[0], p1[1] + 160 - i * 30], [p0[0], p0[1] + 200 - i * 30]], `fill="#6a5022"`), poly([[p0[0] + side * -8, p0[1] + 32], [p1[0] + side * 8, p1[1] + 30], [p1[0] + side * 8, p1[1] + 148 - i * 30], [p0[0] + side * -8, p0[1] + 186 - i * 30]], `fill="#3a1e12"`));
    }
  }
  // back wall: a large painting and a case under it
  s += g(`filter="url(#paint)"`, paintingFrame(620, 240, 360, 220, "#2a1a10"), rect(560, 500, 480, 150, `fill="#1a1612"`), rect(574, 510, 452, 120, `fill="#2a2a2c"`));
  // the painting on the back wall: vague figures and fire
  s += g(`filter="url(#paint)"`, glow(800, 420, 140, 60, "#c05020", 0.6), ...Array.from({ length: 6 }, (_, i) => ell(680 + i * 50, 400, 12, 40, `fill="#120a06"`)));
  // ceiling fixture
  s += rect(780, 0, 8, 120, `fill="#0a0a0a"`) + path(`M740,150 Q784,110 828,150Z`, `fill="#0f0f0f"`);
  if (mode === "ceiling") {
    s += ell(784, 152, 26, 12, `fill="#ffffff"`) + glow(784, 160, 900, 520, "#e8f4f0", 0.55) + cone(784, 150, Math.PI / 2, 0.9, 760, "#f0fff8", 0.3);
    s += rect(0, 0, W, H, `fill="#c8e8d8" opacity="0.06"`);
  }
  s += g(`filter="url(#paint)"`, scumble(r, 0, 650, W, 250, 70, ["#1a1612", "#4a443c"], { angle: 0, len: [100, 300], width: [2, 6], opacity: [0.15, 0.35] }));
  if (mode === "dark") s += darkness(W, H, [], 0.93);
  else if (mode === "lit") s += darkness(W, H, [{ x: 800, y: 450, rx: 900, ry: 600, power: 0.6 }], 0.45);
  s += finish(W, H, { vignette: mode === "ceiling" ? 0.6 : 0.85, tint: mode === "ceiling" ? "#3a5a48" : "#3a2a1a", tintOpacity: 0.12 });
  return s;
}
const coinDark = L("coin-dark", (r) => coinRoom(r, "dark"), { opaque: true, seed: 241 });
const coinLit = L("coin-lit", (r) => coinRoom(r, "lit"), { opaque: true, seed: 241 });
const coinCeil = L("coin-ceil", (r) => coinRoom(r, "ceiling"), { opaque: true, seed: 241 });
// Tyler at the right-hand case, phone light in his hand; narrator in the foreground
const coinCast = L("coin-cast", () =>
  figure(1250, 820, { ...who("tyler"), pose: { rUp: 60, rFore: 110, lUp: 40, lFore: 70, torso: 10, head: 14 }, size: 470, rim: COLD, light: [1, -0.3], fill: "#050506", extra: (fp) => ell(fp.hands.r[0], fp.hands.r[1], 10, 10, `fill="#fff"`) })
  + figure(330, 1180, { ...who("narr"), pose: { rUp: 24, rFore: 150, head: 4 }, size: 900, rim: COLD, light: [1, -0.4], fill: "#050506" }),
{ seed: 242 });
const coinTyler = L("coin-tyler", () =>
  figure(1250, 820, { ...who("tyler"), pose: { rUp: 60, rFore: 110, lUp: 40, lFore: 70, torso: 10, head: 14 }, size: 470, rim: COLD, light: [1, -0.3], fill: "#050506", extra: (fp) => ell(fp.hands.r[0], fp.hands.r[1], 10, 10, `fill="#fff"`) }),
{ seed: 243 });
// Tyler shouting at the doorway (he faces away from camera)
const coinShout = L("coin-shout", () =>
  figure(980, 850, { ...who("tyler"), pose: { rUp: 40, rFore: 150, lUp: -50, lFore: -20, torso: -6, head: -10 }, size: 520, rim: COLD, light: [-1, -0.3], fill: "#050506" })
  + figure(420, 1160, { ...who("narr"), pose: "standB", size: 880, rim: COLD, light: [1, -0.3], fill: "#050506" }),
{ seed: 244 });

// close-up: the coin case under a phone light
const coins = L("coins", (r) => {
  let s = rect(0, 0, W, H, `fill="#1a0e0c"`);
  s += g(`filter="url(#paint)"`, rect(0, 0, W, H, `fill="#3a1414"`), scumble(r, 0, 0, W, H, 80, ["#4a1a1a", "#1a0808"], { angle: 0.2, len: [100, 400], width: [10, 30], opacity: [0.2, 0.4] }));
  let cs = "";
  for (let row = 0; row < 5; row++) for (let col = 0; col < 9; col++) {
    const x = 170 + col * 160 + (row % 2) * 30, y = 140 + row * 150;
    const rr = r.range(42, 56);
    const gold = r() > 0.35;
    cs += ell(x + 4, y + 6, rr, rr, `fill="#0a0404" opacity="0.6"`);
    cs += ell(x, y, rr, rr, `fill="${gold ? "#a8802e" : "#8a8e90"}"`) + ell(x, y, rr * 0.82, rr * 0.82, `fill="none" stroke="${gold ? "#6a4a14" : "#4a4e50"}" stroke-width="3"`);
    cs += ell(x - rr * 0.1, y, rr * 0.35, rr * 0.45, `fill="${gold ? "#7a5a1e" : "#5a5e60"}" opacity="0.7"`);
    cs += path(`M${x - rr * 0.7},${y - rr * 0.3} A${rr * 0.8},${rr * 0.8} 0 0 1 ${x + rr * 0.3},${y - rr * 0.75}`, `stroke="#fff6d8" stroke-width="4" fill="none" opacity="0.65"`);
  }
  s += g(`filter="url(#wob)"`, cs);
  // glass reflection streaks
  s += poly([[200, 0], [420, 0], [120, H], [-100, H]], `fill="#ffffff" opacity="0.06"`) + poly([[900, 0], [960, 0], [660, H], [600, H]], `fill="#ffffff" opacity="0.05"`);
  s += glow(820, 420, 520, 360, "#fff4dc", 0.35);
  s += darkness(W, H, [{ x: 820, y: 430, rx: 640, ry: 440, power: 1 }], 0.85);
  s += finish(W, H, { vignette: 0.9 });
  return s;
}, { opaque: true, seed: 251 });
const coinsHand = L("coins-hand", () => goo(handShapes(1250, 880, -2.3, 170, { pose: "claw", sleeve: 500, sleeveW: 1.0 }), { fill: "#060607", rim: "#e8dcc0", light: [-0.4, -1], blur: 6, rw: 5 }), { seed: 252 });

// the two paintings, as dark old-master canvases (suggestive, never explicit)
const paintingOil = L("painting-oil", (r) => {
  let s = rect(0, 0, W, H, `fill="#0a0806"`);
  s += g(`filter="url(#paint)"`, paintingFrame(180, 70, 1240, 760, "#24180e"));
  // background architecture and smoke
  s += g(`filter="url(#paint)"`, rect(180, 70, 1240, 760, `fill="#2a1c10"`), glow(800, 300, 600, 300, "#6a4a2a", 0.5),
    rect(260, 120, 160, 520, `fill="#1a1008"`), rect(1180, 140, 180, 500, `fill="#1a1008"`),
    // scaffold beam and a rope lowering into the steam
    rect(420, 160, 760, 26, `fill="#120a06"`), rect(780, 160, 20, 140, `fill="#120a06"`), line(790, 300, 790, 470, `stroke="#c8a870" stroke-width="5"`),
    // the great cauldron over fire
    path(smooth([[540, 520], [1060, 520], [1020, 720], [800, 760], [580, 720]], true, 0.4), `fill="#0e0a08"`), rect(520, 500, 560, 34, `fill="#2a2420"`),
    ...Array.from({ length: 18 }, () => stroke([[r.range(560, 1040), 790], [r.range(560, 1040), r.range(700, 740)]], r.range(12, 30), 2, r.pick(["#c05018", "#e08a28", "#8a2a10"]), `opacity="0.85"`)),
    // executioners and onlookers as dark shapes
    ...[330, 430, 1120, 1230].map((x, i) => `<g opacity="0.95">${ell(x, 470 + i * 6, 26, 30, `fill="#0c0806"`)}${path(smooth([[x - 60, 820], [x - 50, 520 + i * 6], [x + 50, 520 + i * 6], [x + 60, 820]], true, 0.3), `fill="#0c0806"`)}</g>`),
  );
  // billowing steam swallows the subject
  s += `<g filter="url(#haze)" opacity="0.75">${ell(800, 440, 260, 120, `fill="#a89a88"`)}${ell(720, 380, 160, 90, `fill="#8a7e70"`)}${ell(900, 360, 180, 80, `fill="#9a8e7e"`)}</g>`;
  s += glow(800, 720, 400, 160, "#e07a20", 0.5);
  // craquelure and varnish
  let cr = "";
  for (let i = 0; i < 160; i++) { const x = r.range(180, 1420), y = r.range(70, 830); cr += line(x, y, x + r.range(-30, 30), y + r.range(-30, 30), `stroke="#000" stroke-width="0.8" opacity="0.35"`); }
  s += cr + rect(180, 70, 1240, 760, `fill="#5a3a10" opacity="0.18"`);
  s += darkness(W, H, [{ x: 800, y: 440, rx: 640, ry: 460, power: 1 }], 0.7);
  s += finish(W, H, { vignette: 0.85 });
  return s;
}, { opaque: true, seed: 261 });
const paintingFire = L("painting-fire", (r) => {
  let s = rect(0, 0, W, H, `fill="#0a0806"`);
  s += g(`filter="url(#paint)"`, paintingFrame(220, 90, 1160, 720, "#1e140c"));
  s += g(`filter="url(#paint)"`, rect(220, 90, 1160, 720, `fill="#22160c"`), glow(800, 600, 520, 300, "#c05018", 0.6),
    // two forked posts and a long spit across the fire
    stroke([[440, 780], [450, 470]], 26, 20, "#0c0806"), stroke([[1160, 780], [1150, 470]], 26, 20, "#0c0806"), rect(380, 470, 840, 18, `fill="#0c0806"`),
    // a long dark wrapped shape on the spit, mostly hidden by smoke
    path(smooth([[560, 480], [700, 448], [980, 452], [1060, 486], [960, 512], [640, 508]], true, 0.4), `fill="#120806"`),
    ...Array.from({ length: 30 }, () => stroke([[r.range(500, 1100), 790], [r.range(520, 1080), r.range(560, 680)]], r.range(12, 34), 2, r.pick(["#c05018", "#e8a030", "#8a2a10", "#f0c060"]), `opacity="0.9"`)),
    ...[300, 1290].map((x) => ell(x, 520, 24, 30, `fill="#0c0806"`) + path(smooth([[x - 55, 810], [x - 45, 560], [x + 45, 560], [x + 55, 810]], true, 0.3), `fill="#0c0806"`)));
  s += `<g filter="url(#haze)" opacity="0.7">${ell(820, 420, 300, 110, `fill="#5a4a3e"`)}${ell(700, 340, 200, 90, `fill="#4a3c32"`)}</g>`;
  let cr = "";
  for (let i = 0; i < 160; i++) { const x = r.range(220, 1380), y = r.range(90, 810); cr += line(x, y, x + r.range(-30, 30), y + r.range(-30, 30), `stroke="#000" stroke-width="0.8" opacity="0.35"`); }
  s += cr + rect(220, 90, 1160, 720, `fill="#5a3a10" opacity="0.18"`);
  s += darkness(W, H, [{ x: 800, y: 500, rx: 640, ry: 440, power: 1 }], 0.72);
  s += finish(W, H, { vignette: 0.85 });
  return s;
}, { opaque: true, seed: 262 });

// the case of photographs: pale rectangles, ropes, red; nothing legible
const photos = L("photos", (r) => {
  let s = g(`filter="url(#paint)"`, rect(0, 0, W, H, `fill="#1e1a18"`), scumble(r, 0, 0, W, H, 60, ["#2a2420", "#0e0c0a"], { angle: 0.1, len: [200, 500], width: [10, 30], opacity: [0.2, 0.4] }));
  let ph = "";
  for (let i = 0; i < 46; i++) {
    const x = r.range(40, W - 240), y = r.range(30, H - 260), a = r.range(-14, 14);
    const tone = r.pick(["#9a948a", "#8a8478", "#a8a294", "#7a7468"]);
    ph += `<g transform="rotate(${a.toFixed(1)} ${x + 100} ${y + 120})">${rect(x + 6, y + 8, 200, 240, `fill="#000" opacity="0.5"`)}${rect(x, y, 200, 240, `fill="#d8d2c4"`)}${rect(x + 12, y + 12, 176, 176, `fill="${tone}"`)}`;
    // an indistinct pale shape and dark bands (ropes, a table edge)
    ph += `${ell(x + 100 + r.range(-30, 30), y + 100 + r.range(-20, 20), r.range(20, 50), r.range(40, 70), `fill="#3a3430" opacity="0.7"`)}${line(x + 12, y + r.range(60, 160), x + 188, y + r.range(60, 160), `stroke="#1a1612" stroke-width="${r.range(3, 7).toFixed(1)}" opacity="0.8"`)}`;
    if (r() > 0.55) ph += `${ell(x + r.range(40, 160), y + r.range(50, 160), r.range(14, 40), r.range(10, 30), `fill="#6a0e12" opacity="0.75"`)}`;
    ph += `${rect(x + 12, y + 12, 176, 176, `fill="#3a2a1a" opacity="0.25"`)}</g>`;
  }
  s += g(`filter="url(#wob)"`, ph);
  s += poly([[300, 0], [480, 0], [180, H], [0, H]], `fill="#ffffff" opacity="0.05"`);
  s += finish(W, H, { vignette: 0.75, tint: "#4a2a1a", tintOpacity: 0.1 });
  return s;
}, { opaque: true, seed: 271 });
const photosDark = L("photos-dark", () => rect(0, 0, W, H, `fill="#040303"`), { opaque: true, seed: 272 });

export const ACT2 = [
  gfLit, gfDark, gfCast, gfSplit, bdoor, bdoorBroken, bdoorKick, stairsDown, stairsDownDark, stairsCast, stairsUp, stairsExit,
  corridorLit, corridorDark, corridorOpen, tKick, tKick2, tShoulder, tDown, handle, coinDark, coinLit, coinCeil, coinCast,
  coinTyler, coinShout, coins, coinsHand, paintingOil, paintingFire, photos, photosDark,
];
