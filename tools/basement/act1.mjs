/**
 * ACT I: the teenagers, the town, the car and the target house.
 * Cool night palette (charcoal, desaturated blue) with muted amber practicals.
 */
import {
  doc, rng, resetIds, PAL, W, H, nightSky, house, tree, bareTree, streetlamp, car, figure, who, finish, glow, cone,
  rect, poly, ell, line, path, smooth, stroke, lin, linU, rad, radU, scumble, speckle, g, grime, planks, room, lerp2,
  darkness, goo, handShapes, text, smoke, hatch, capsulePath,
} from "./lib.mjs";

/** Layer helper: wraps a body in a document with the shared filters. */
export function L(name, body, { w = W, h = H, opaque = false, seed = 1, strength = 1 } = {}) {
  return () => {
    resetIds();
    const r = rng(seed * 7919 + name.length * 31);
    const content = typeof body === "function" ? body(r) : body;
    return { name, w, h, opaque, svg: doc(w, h, content, { seed, strength }) };
  };
}

const COLD = PAL.cold;
const AMB = PAL.amberHi;

/* ------------------------------------------------------------------ */
/* Kitchen: the father's advice                                         */
/* ------------------------------------------------------------------ */
const kitchenBg = L("kitchen-bg", (r) => {
  let s = "";
  const R = room(380, 170, 1040, 520);
  s += g(`filter="url(#paintV)"`, grime(r, 0, 0, W, H, "#2c2a26", { stains: 10 }), poly(R.back, `fill="#3a352d"`), poly(R.left, `fill="#24221e"`), poly(R.ceil, `fill="#151412"`), poly(R.floor, `fill="#1d1b18"`));
  // floor tiles
  let tiles = "";
  for (let i = 0; i <= 12; i++) { const a = lerp2([380, 690], [-400, H], 0), b = [380 + (1040 * i) / 12, 690]; const c = [-500 + (2600 * i) / 12, H]; tiles += line(b[0], b[1], c[0], c[1], `stroke="#0e0d0b" stroke-width="2" opacity="0.6"`); void a; }
  for (let k = 1; k < 5; k++) { const y = 690 + (Math.pow(k / 5, 1.7)) * 210; tiles += line(0, y, W, y, `stroke="#0e0d0b" stroke-width="2" opacity="0.5"`); }
  s += g(`filter="url(#ink)"`, tiles);
  // upper cabinets and counter on the back wall
  s += g(`filter="url(#paintV)"`,
    ...Array.from({ length: 6 }, (_, i) => rect(430 + i * 120, 190, 108, 170, `fill="#2a251e" stroke="#0d0c0a" stroke-width="4"`)),
    rect(400, 470, 760, 220, `fill="#221e18"`), rect(400, 462, 760, 16, `fill="#5e5446"`),
    ...Array.from({ length: 6 }, (_, i) => rect(410 + i * 125, 500, 112, 170, `fill="#28231c" stroke="#0d0c0a" stroke-width="4"`)),
    // fridge
    rect(1190, 220, 190, 470, `fill="#4a4a46"`), line(1190, 380, 1380, 380, `stroke="#1a1a18" stroke-width="4"`), rect(1200, 300, 10, 60, `fill="#1a1a18"`),
  );
  // window above the sink with night blue
  s += g(`filter="url(#paint)"`, rect(700, 230, 240, 180, `fill="#0b0f15" stroke="#0a0908" stroke-width="10"`), rect(712, 242, 216, 156, `fill="#22344a"`), line(820, 236, 820, 404, `stroke="#0a0908" stroke-width="7"`), line(706, 320, 934, 320, `stroke="#0a0908" stroke-width="7"`), bareTree(r, 760, 410, 220, "#0b0f15", 4));
  // table under the lamp
  s += g(`filter="url(#paint)"`, poly([[760, 640], [1300, 640], [1400, 720], [680, 720]], `fill="#3a2a1c"`), rect(680, 720, 720, 18, `fill="#1a120c"`), rect(720, 738, 22, 140, `fill="#120c08"`), rect(1340, 738, 22, 140, `fill="#120c08"`),
    // coffee mug, ashtray, newspaper
    rect(1120, 610, 36, 40, `fill="#d8d0bd" opacity="0.8"`), ell(900, 652, 50, 10, `fill="#16110c"`), poly([[960, 655], [1080, 650], [1095, 668], [972, 672]], `fill="#b9ae97" opacity="0.7"`));
  // hanging lamp
  s += line(1040, 0, 1040, 360, `stroke="#050505" stroke-width="4"`);
  s += path(`M985,400 Q1040,340 1095,400 Z`, `fill="#0c0a08"`);
  s += glow(1040, 400, 70, 30, AMB, 1);
  s += cone(1040, 400, Math.PI / 2, 0.55, 360, PAL.amber, 0.45);
  s += glow(1040, 680, 380, 120, PAL.amber, 0.5);
  s += darkness(W, H, [{ x: 1040, y: 620, rx: 560, ry: 380, power: 1 }, { x: 820, y: 320, rx: 200, ry: 160, power: 0.5 }], 0.84);
  s += finish(W, H, { vignette: 0.9, tint: "#3b2a18", tintOpacity: 0.1 });
  return s;
}, { opaque: true, seed: 31 });

// father seated at the table, turned toward the doorway (left)
const kitchenDad = L("kitchen-dad", () =>
  figure(1150, 880, { ...who("dad"), pose: { lThigh: -90, lShin: -2, rThigh: -86, rShin: 4, hipDrop: 0.25, torso: -6, head: -10, lUp: -30, lFore: -80, rUp: -10, rFore: -70 }, size: 420, rim: AMB, light: [0.2, -1], rimWidth: 4 }),
{ seed: 32 });

// the boy in the doorway, back to camera, huge and cropped
const kitchenBoy = L("kitchen-boy", () =>
  rect(0, 0, 210, H, `fill="#060504"`) + rect(205, 0, 26, H, `fill="#16120e"`) + figure(470, 1520, { ...who("narr"), pose: "standB", size: 1500, rim: AMB, light: [1, -0.3], rimWidth: 6 }),
{ seed: 33 });

/* ------------------------------------------------------------------ */
/* Town street at night                                                 */
/* ------------------------------------------------------------------ */
const TW = 2000;
const townBg = L("town-bg", (r) => {
  let s = nightSky(r, TW, H, { top: "#06090e", bottom: "#1a222c" });
  // storefront row
  const fronts = [[0, 300, "#1b1d22"], [330, 260, "#191b1f"], [600, 380, "#1d1e22"], [990, 300, "#17191d"], [1300, 340, "#1c1d21"], [1650, 350, "#18191c"]];
  let b = "";
  for (const [x, w, c] of fronts) {
    const top = r.range(150, 260);
    b += rect(x, top, w, 700 - top, `fill="${c}"`);
    b += rect(x, top, w, 14, `fill="#0b0c0e"`);
    for (let k = 0; k < Math.floor(w / 90); k++) b += rect(x + 24 + k * 90, top + 40, 50, 70, `fill="#0c1016"`) + rect(x + 24 + k * 90, top + 40, 50, 24, `fill="#2a3a4a" opacity="0.25"`);
  }
  s += g(`filter="url(#paintV)"`, b);
  // shop windows: liquor store (amber/red), laundromat (cold), dark ones
  s += g(`filter="url(#paint)"`,
    rect(640, 470, 300, 200, `fill="#3b2412"`), rect(650, 480, 280, 180, `fill="#8a5a24"`),
    ...Array.from({ length: 5 }, (_, i) => rect(665 + i * 54, 500, 40, 140, `fill="#2a1a0c" opacity="0.8"`)),
    rect(1320, 480, 260, 190, `fill="#1c2833"`), rect(1330, 490, 240, 170, `fill="#5a7488" opacity="0.7"`),
    rect(40, 480, 220, 190, `fill="#0b0e12"`), rect(1010, 480, 250, 190, `fill="#0a0d11"`),
  );
  s += glow(790, 560, 260, 160, PAL.amber, 0.55) + glow(1450, 570, 220, 140, "#7fa0b8", 0.35);
  // neon sign
  s += text(790, 448, "LIQUOR", 54, "#e86a4a", { anchor: "middle", family: "Arial Black, Arial, sans-serif", spacing: 6 });
  s += `<g filter="url(#glowS)" style="mix-blend-mode:screen" opacity="0.9">${text(790, 448, "LIQUOR", 54, "#ff6a40", { anchor: "middle", family: "Arial Black, Arial, sans-serif", spacing: 6 })}</g>`;
  s += glow(790, 430, 260, 90, "#c0402a", 0.45);
  // sidewalk + wet street
  s += g(`filter="url(#paint)"`, rect(0, 670, TW, 60, `fill="#26272a"`), rect(0, 730, TW, 170, `fill="#101215"`),
    scumble(r, 0, 735, TW, 165, 120, ["#2b3036", "#06070a", "#3a2a1a"], { angle: 0, len: [80, 300], width: [1, 4], opacity: [0.2, 0.45] }));
  // reflections on the wet asphalt
  s += `<g filter="url(#glow)" opacity="0.5" style="mix-blend-mode:screen">${rect(700, 740, 180, 150, `fill="#8a5a24"`)}${rect(1360, 740, 160, 150, `fill="#4a6478"`)}${rect(720, 750, 140, 30, `fill="#c0402a"`)}</g>`;
  s += streetlamp(1130, 700, 420, { color: "#b98d48" });
  s += g(`filter="url(#paint)"`, car(1500, 760, 380, { fill: "#0e1013", glass: "#1a232c", rim: "#6f8396" }));
  s += finish(TW, H, { vignette: 0.75, tint: "#203448", tintOpacity: 0.14 });
  return s;
}, { w: TW, opaque: true, seed: 41 });

const townGang = L("town-gang", (r) => {
  const lt = [0.6, -1];
  let s = "";
  s += figure(1060, 760, { ...who("chris"), pose: "pocket", size: 360, rim: AMB, light: lt });
  s += figure(1150, 768, { ...who("tyler"), pose: { rUp: 30, rFore: 150, lUp: -8 }, size: 380, rim: AMB, light: lt });
  s += figure(1260, 762, { ...who("tom"), pose: "hunch", size: 380, rim: AMB, light: lt });
  s += figure(1350, 770, { ...who("narr"), pose: { lUp: -10, lFore: 20, rUp: 26, rFore: 140 }, size: 370, rim: AMB, light: lt });
  s += ell(1187, 470, 4, 4, `fill="#ff7a30"`) + glow(1187, 470, 14, 14, "#ff7a30", 0.9);
  s += smoke(r, 1187, 466, 130, "#a0a8b0", 0.35) + smoke(r, 1388, 476, 110, "#a0a8b0", 0.28);
  return s;
}, { w: TW, seed: 42 });

const townNarr = L("town-narr", (r) =>
  figure(1180, 790, { ...who("narr"), hood: true, pose: "pocket", size: 470, rim: AMB, light: [-0.4, -1] }) + smoke(r, 1200, 410, 160, "#a0a8b0", 0.25),
{ w: TW, seed: 43 });

/* ------------------------------------------------------------------ */
/* School hallway                                                        */
/* ------------------------------------------------------------------ */
const schoolBg = L("school-bg", (r) => {
  const R = room(650, 260, 300, 330);
  let s = g(`filter="url(#paintV)"`, poly(R.back, `fill="#3a3f45"`), poly(R.left, `fill="#2a2d31"`), poly(R.right, `fill="#23262a"`), poly(R.ceil, `fill="#18191b"`), poly(R.floor, `fill="#3b3a36"`));
  // lockers on the right wall
  let lk = "";
  for (let i = 0; i < 18; i++) {
    const t0 = Math.pow(i / 18, 1.25), t1 = Math.pow((i + 1) / 18, 1.25);
    const a0 = lerp2([W, 60], [950, 290], t0), a1 = lerp2([W, 60], [950, 290], t1);
    const b0 = lerp2([W, 820], [950, 560], t0), b1 = lerp2([W, 820], [950, 560], t1);
    lk += poly([a0, a1, b1, b0], `fill="${i % 2 ? "#33424f" : "#2e3d4a"}" stroke="#0c1014" stroke-width="${3 - t0 * 2}"`);
    const v0 = lerp2(a0, b0, 0.12), v1 = lerp2(a1, b1, 0.12);
    lk += line(v0[0] - (v0[0] - v1[0]) * 0.2, v0[1], v1[0] + (v0[0] - v1[0]) * 0.2, v1[1], `stroke="#0c1014" stroke-width="2"`);
  }
  s += g(`filter="url(#paintV)"`, lk);
  // windows on the left wall: low sun
  let win = "";
  for (let i = 0; i < 4; i++) {
    const t0 = 0.08 + i * 0.22, t1 = t0 + 0.13;
    const a0 = lerp2([0, 120], [650, 300], t0), a1 = lerp2([0, 120], [650, 300], t1);
    const b0 = lerp2([0, 600], [650, 470], t0), b1 = lerp2([0, 600], [650, 470], t1);
    win += poly([a0, a1, b1, b0], `fill="#c99a5a"`);
    // light shafts onto the floor
    const f0 = lerp2([0, H], [650, 590], t0 + 0.15), f1 = lerp2([0, H], [650, 590], t1 + 0.2);
    s += `<g filter="url(#glow)" opacity="0.35" style="mix-blend-mode:screen">${poly([b0, b1, [f1[0] + 260, f1[1]], [f0[0] + 300, f0[1]]], `fill="#d8a460"`)}</g>`;
  }
  s += g(`filter="url(#paint)"`, win);
  // ceiling lights (off) and floor shine
  for (let k = 0; k < 5; k++) { const t = Math.pow(k / 5, 1.3); const c = lerp2([800, 20], [800, 262], t); s += rect(c[0] - 120 * (1 - t) - 20, c[1], 240 * (1 - t) + 40, 12 * (1 - t) + 3, `fill="#4a4f55"`); }
  s += g(`filter="url(#paint)"`, scumble(r, 0, 600, W, 300, 70, ["#5a554c", "#1a1916"], { angle: 0, len: [100, 300], width: [2, 6], opacity: [0.15, 0.35] }));
  s += glow(800, 420, 300, 200, "#d8a460", 0.18);
  s += darkness(W, H, [{ x: 520, y: 640, rx: 700, ry: 330, power: 0.8 }, { x: 800, y: 420, rx: 260, ry: 220, power: 0.6 }], 0.62);
  s += finish(W, H, { vignette: 0.85, tint: "#2b3542", tintOpacity: 0.12 });
  return s;
}, { opaque: true, seed: 51 });

const schoolGang = L("school-gang", () => {
  const lt = [-1, -0.2];
  return figure(690, 700, { ...who("chris"), pose: "walkB", size: 300, rim: "#e0b070", light: lt })
    + figure(790, 720, { ...who("tyler"), pose: "walkB2", size: 330, rim: "#e0b070", light: lt, flip: true })
    + figure(880, 715, { ...who("tom"), pose: "walkB", size: 330, rim: "#e0b070", light: lt })
    + figure(980, 740, { ...who("narr"), pose: "walkB2", size: 340, rim: "#e0b070", light: lt, flip: true });
}, { seed: 52 });

/* ------------------------------------------------------------------ */
/* Football field at night, the bench                                    */
/* ------------------------------------------------------------------ */
const FW = 2200;
const fieldBg = L("field-bg", (r) => {
  let s = nightSky(r, FW, H, { top: "#04060a", bottom: "#141c24" });
  // stadium light towers
  for (const x of [260, 1900]) {
    s += rect(x - 6, 80, 12, 420, `fill="#08090b"`);
    s += rect(x - 70, 60, 140, 46, `fill="#0b0c0e"`);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) s += ell(x - 52 + i * 35, 72 + j * 22, 12, 9, `fill="#f4f8fa"`);
    s += glow(x, 82, 260, 160, "#dfe8ee", 0.85) + cone(x, 100, Math.PI / 2 + (x < 1000 ? -0.35 : 0.35), 0.45, 700, "#cfdbe4", 0.18);
  }
  // far bleachers with a thin crowd of silhouettes
  s += g(`filter="url(#paint)"`, poly([[0, 420], [FW, 400], [FW, 520], [0, 540]], `fill="#121519"`),
    ...Array.from({ length: 110 }, () => ell(r.range(0, FW), r.range(430, 515), r.range(5, 8), r.range(6, 9), `fill="#07080a" opacity="0.8"`)));
  // the field
  s += g(`filter="url(#paint)"`, poly([[0, 530], [FW, 510], [FW, H], [0, H]], `fill="#26332a"`),
    scumble(r, 0, 520, FW, 380, 150, ["#3a4a3c", "#121812", "#2c3a2e"], { angle: 0, len: [100, 380], width: [2, 7], opacity: [0.15, 0.4] }));
  for (let i = 0; i < 12; i++) { const x = 100 + i * 180; s += line(x, 528, x - 260 + i * 40, H, `stroke="#c8d0c8" stroke-width="3" opacity="0.35" filter="url(#ink)"`); }
  // distant players
  for (let i = 0; i < 9; i++) s += figure(500 + i * 140 + r.range(-30, 30), 600 + r.range(-10, 10), { build: "athlete", pose: r.pick(["stand", "walk", "crouch"]), size: 95, rim: "#dfe8ee", light: [0, -1], fill: "#0d1012" });
  s += glow(1100, 560, 900, 160, "#cfdbe4", 0.15);
  s += finish(FW, H, { vignette: 0.7, tint: "#24384a", tintOpacity: 0.15 });
  return s;
}, { w: FW, opaque: true, seed: 61 });

const fieldBench = L("field-bench", () => {
  const lt = [0.2, -1];
  let s = g(`filter="url(#paint)"`, rect(-20, 820, FW + 40, 40, `fill="#0b0c0e"`), rect(0, 860, FW, 60, `fill="#060708"`));
  const helmet = (fp) => `<ellipse cx="${fp.head[0]}" cy="${fp.head[1] - fp.head[2] * 0.1}" rx="${fp.head[2] * 1.12}" ry="${fp.head[2] * 1.18}"/><ellipse cx="${fp.shoulders[0][0]}" cy="${fp.shoulders[0][1]}" rx="${fp.u * 0.55}" ry="${fp.u * 0.4}"/><ellipse cx="${fp.shoulders[1][0]}" cy="${fp.shoulders[1][1]}" rx="${fp.u * 0.55}" ry="${fp.u * 0.4}"/>`;
  const xs = [520, 760, 1000, 1240, 1480];
  const ks = ["tom", "chris", "narr", "tyler", "chris"];
  xs.forEach((x, i) => {
    s += figure(x, 1010, { ...who(ks[i]), hood: false, hoodie: false, beanie: false, hair: null, build: i === 1 ? "stocky" : "athlete", pose: { ...{ lThigh: -88, rThigh: -88, hipDrop: 0.25, torso: i === 2 ? 14 : 4, head: i === 2 ? 22 : 6, lUp: -8, lFore: 30, rUp: 8, rFore: -30 } }, size: 420, rim: "#dfe8ee", light: lt, add: helmet });
  });
  return s;
}, { w: FW, seed: 62 });

/* Varsity roster pinned on a corkboard */
const roster = L("roster", (r) => {
  let s = g(`filter="url(#paint)"`, rect(0, 0, W, H, `fill="#3a2a1a"`), speckle(r, 0, 0, W, H, 1400, "#1e140b", [1, 3], 0.6), speckle(r, 0, 0, W, H, 600, "#6a4a2a", [1, 2.5], 0.4));
  s += g(`filter="url(#wob)" transform="rotate(-2 800 450)"`,
    rect(470, 90, 660, 760, `fill="#c9c1ac"`),
    rect(470, 90, 660, 760, `fill="#000" opacity="0.08"`),
    text(800, 190, "VARSITY FOOTBALL", 46, "#1a1612", { anchor: "middle", spacing: 3 }),
    text(800, 240, "FINAL ROSTER", 30, "#1a1612", { anchor: "middle", weight: 400, spacing: 6 }),
    line(540, 270, 1060, 270, `stroke="#1a1612" stroke-width="3"`),
    ...["ANDERSON", "BAKER", "COLLINS", "DAVIS", "EVANS", "FOSTER", "GRANT", "HARRIS", "JENKINS", "KELLY", "MORGAN", "PARKER", "REED", "WALSH"].map((n, i) => text(560, 312 + i * 37, `${i + 1}.  ${n}`, 24, "#2a241c", { weight: 400, family: "Courier New, monospace" })),
    ell(800, 112, 14, 14, `fill="#8a1a1a"`),
  );
  s += darkness(W, H, [{ x: 720, y: 380, rx: 620, ry: 480, power: 1 }], 0.7);
  s += finish(W, H, { vignette: 0.9 });
  return s;
}, { opaque: true, seed: 71 });

/* ------------------------------------------------------------------ */
/* Tyler's house: dusk (gifts, the new car) and night (the party)       */
/* ------------------------------------------------------------------ */
function tylerHouse(r, night) {
  let s = night ? nightSky(r, W, H, { top: "#05080d", bottom: "#18212b" }) : (() => { const [d, u] = lin([[0, "#1c2430"], [0.6, "#5a4a44"], [1, "#a0704a"]]); return `<defs>${d}</defs><rect width="${W}" height="${H}" fill="${u}"/>`; })();
  s += g(`filter="url(#paint)"`, ...Array.from({ length: 16 }, (_, i) => tree(r, i * 110 + r.range(-20, 20), 520, r.range(150, 240), night ? "#0b1016" : "#1e2026", { trunk: false })));
  // modern two-storey house with big glass
  const hx = 380, hy = 640;
  const lit = night ? "#d8a256" : "#5a4636";
  s += g(`filter="url(#paintV)"`,
    rect(hx, hy - 380, 900, 380, `fill="${night ? "#191c21" : "#2b2c30"}"`),
    rect(hx - 40, hy - 400, 980, 30, `fill="#0c0d0f"`), rect(hx + 520, hy - 520, 420, 140, `fill="${night ? "#16181c" : "#27282c"}"`), rect(hx + 500, hy - 540, 460, 26, `fill="#0c0d0f"`),
    rect(hx + 60, hy - 320, 360, 140, `fill="${lit}"`), rect(hx + 60, hy - 150, 360, 150, `fill="${night ? "#c48a46" : "#3a3430"}"`),
    rect(hx + 560, hy - 500, 340, 100, `fill="${night ? "#b07a3e" : "#4a3c34"}"`),
    ...[0, 1, 2, 3].map((i) => line(hx + 60 + i * 120, hy - 320, hx + 60 + i * 120, hy, `stroke="#0c0d0f" stroke-width="6"`)),
    // garage, open, lit
    rect(hx + 620, hy - 260, 280, 260, `fill="#0e0f11"`), rect(hx + 640, hy - 230, 240, 230, `fill="${night ? "#8a6a42" : "#4a4038"}"`),
  );
  if (night) s += glow(hx + 240, hy - 160, 360, 260, PAL.amber, 0.5) + glow(hx + 760, hy - 120, 200, 160, PAL.amber, 0.4);
  else s += glow(1300, 700, 700, 260, "#d08a50", 0.25);
  // driveway + lawn
  s += g(`filter="url(#paint)"`, poly([[0, 640], [W, 640], [W, H], [0, H]], `fill="${night ? "#10151a" : "#2a2a26"}"`), poly([[hx + 600, 640], [hx + 920, 640], [1500, H], [800, H]], `fill="${night ? "#1a1c20" : "#3a3832"}"`),
    scumble(r, 0, 650, W, 250, 90, ["#3a3a34", "#0c0d0e"], { angle: 0, len: [80, 260], width: [2, 6], opacity: [0.15, 0.4] }));
  s += finish(W, H, { vignette: 0.75, tint: night ? "#203448" : "#4a3020", tintOpacity: 0.12 });
  return s;
}
const tylerDusk = L("tyler-dusk", (r) => tylerHouse(r, false), { opaque: true, seed: 81 });
const tylerNight = L("tyler-night", (r) => tylerHouse(r, true), { opaque: true, seed: 82 });
const tylerCar = L("tyler-car", () =>
  g(`filter="url(#paint)"`, car(820, 830, 560, { fill: "#1a1c22", glass: "#2a3440", rim: "#c8a070", sporty: true }))
  + glow(1100, 735, 300, 20, "#e0b080", 0.35)
  + figure(780, 850, { ...who("tyler"), pose: { lUp: -14, lFore: 30, rUp: 10, rFore: -25, torso: 6, lThigh: 8, rThigh: -4 }, size: 470, rim: "#e0a060", light: [1, -0.6] }),
{ seed: 83 });

/* Wallet with his father's credit card */
const wallet = L("wallet", (r) => {
  let s = g(`filter="url(#paint)"`, rect(0, 0, W, H, `fill="#16110d"`), scumble(r, 0, 0, W, H, 80, ["#2a1e14", "#0a0806"], { angle: 0.1, len: [200, 600], width: [10, 30], opacity: [0.15, 0.3] }));
  s += g(`filter="url(#paint)" transform="rotate(-8 800 470)"`,
    path(smooth([[380, 360], [800, 330], [1220, 360], [1240, 640], [800, 680], [360, 640]], true, 0.2), `fill="#2b1a10"`),
    line(800, 335, 800, 678, `stroke="#120a06" stroke-width="8"`),
    rect(860, 360, 340, 220, `fill="#1a0f08"`),
    ...[0, 1, 2].map((i) => rect(870, 380 + i * 60, 320, 50, `fill="#24160c" stroke="#120a06" stroke-width="3"`)),
    // the card, pulled halfway out
    `<g transform="rotate(-12 900 330)">${rect(840, 230, 360, 228, `fill="#b08a40" rx="16"`)}${rect(880, 300, 56, 42, `fill="#d8c080" rx="6"`)}${text(880, 400, "4417  ••••  ••••  2209", 26, "#5a4418", { family: "Courier New, monospace" })}${rect(840, 230, 360, 228, `fill="none" stroke="#3a2a10" stroke-width="3" rx="16"`)}</g>`,
    rect(400, 380, 380, 260, `fill="#24160c"`), rect(420, 420, 300, 10, `fill="#3a2414"`),
  );
  s += glow(1000, 330, 300, 200, AMB, 0.4);
  s += darkness(W, H, [{ x: 900, y: 400, rx: 650, ry: 380, power: 1 }], 0.75);
  s += finish(W, H, { vignette: 0.9 });
  return s;
}, { opaque: true, seed: 91 });

/* ------------------------------------------------------------------ */
/* Inside Tyler's car (the camera sits in the back seat, middle)         */
/* ------------------------------------------------------------------ */
// Windshield views
function roadView(r, mode) {
  let s;
  if (mode === "dusk") { const [d, u] = lin([[0, "#2a3442"], [0.5, "#7a5a48"], [1, "#b07a4a"]]); s = `<defs>${d}</defs><rect width="${W}" height="${H}" fill="${u}"/>`; }
  else s = nightSky(r, W, H, { top: "#03050a", bottom: "#121a24" });
  const hz = 430;
  s += g(`filter="url(#paint)"`, ...Array.from({ length: 18 }, (_, i) => tree(r, i * 95 + r.range(-20, 20), hz + 10, r.range(120, 220), mode === "dusk" ? "#231e20" : "#070a0e", { trunk: false })));
  if (mode === "dusk") s += g(`filter="url(#paint)"`, ...[[150, 140, 120], [1260, 160, 140]].map(([x, w, h]) => rect(x, hz - h, w, h, `fill="#1e1a1c"`) + rect(x + 20, hz - h + 30, 30, 26, `fill="#d09a52"`)));
  s += g(`filter="url(#paint)"`, poly([[0, hz], [W, hz], [W, H], [0, H]], `fill="${mode === "dusk" ? "#2a2522" : "#07090c"}"`), poly([[760, hz], [840, hz], [1500, H], [100, H]], `fill="${mode === "dusk" ? "#3a3430" : "#121418"}"`));
  for (let k = 0; k < 6; k++) { const t = Math.pow(k / 6, 2); const y = hz + t * (H - hz); s += poly([[798 - 2 - t * 10, y], [802 + 2 + t * 10, y], [802 + 3 + t * 16, y + 20 + t * 60], [798 - 3 - t * 16, y + 20 + t * 60]], `fill="#c8a860" opacity="0.7"`); }
  if (mode !== "dusk") {
    s += `<g style="mix-blend-mode:screen" filter="url(#glow)" opacity="0.6">${poly([[700, hz + 10], [900, hz + 10], [1400, H], [200, H]], `fill="#8a8060"`)}</g>`;
    for (const [x, y, sc] of [[300, 300, 0.6], [1180, 330, 0.45], [1500, 260, 0.8]]) s += glow(x, y, 50 * sc, 50 * sc, AMB, 0.8) + glow(x, y + 120 * sc, 120 * sc, 60 * sc, PAL.amber, 0.2);
  }
  s += finish(W, H, { vignette: 0.5 });
  return s;
}
const carViewDusk = L("carview-dusk", (r) => roadView(r, "dusk"), { opaque: true, seed: 101 });
const carViewNight = L("carview-night", (r) => roadView(r, "night"), { opaque: true, seed: 102 });

// the car interior frame, windshield transparent
const carFrame = L("car-frame", (r) => {
  let s = "";
  // body of the car around a transparent windshield (even-odd hole)
  s += path(`M0,0 H${W} V${H} H0 Z M400,170 Q800,140 1200,170 L1470,575 Q800,600 130,575 Z`, `fill="#08090b" fill-rule="evenodd"`);
  // A-pillars catch a little light
  s += path(`M400,170 L130,575`, `stroke="#1c2026" stroke-width="10" fill="none"`) + path(`M1200,170 L1470,575`, `stroke="#1c2026" stroke-width="10" fill="none"`);
  // roof liner and mirror
  s += rect(0, 0, W, 110, `fill="#0b0c0e"`);
  s += path(`M700,112 h200 a10,10 0 0 1 10,10 v40 a10,10 0 0 1 -10,10 h-200 a10,10 0 0 1 -10,-10 v-40 a10,10 0 0 1 10,-10z`, `fill="#050506"`) + rect(790, 70, 20, 44, `fill="#050506"`);
  // dashboard
  s += path(`M0,640 Q300,560 800,575 Q1300,560 ${W},640 V${H} H0Z`, `fill="#0a0b0d"`);
  s += path(`M0,640 Q300,560 800,575 Q1300,560 ${W},640`, `stroke="#2a2f36" stroke-width="3" fill="none" opacity="0.7"`);
  s += glow(420, 640, 110, 30, "#5aa0c8", 0.5) + glow(1180, 650, 80, 24, "#c87a3a", 0.4);
  // front seats: headrests and seat backs
  s += g(`filter="url(#paint)"`,
    path(smooth([[180, H], [200, 720], [260, 640], [560, 630], [620, 700], [640, H]], true, 0.4), `fill="#0d0e10"`),
    path(smooth([[960, H], [980, 700], [1040, 630], [1340, 640], [1400, 720], [1420, H]], true, 0.4), `fill="#0d0e10"`),
  );
  void r;
  return s;
}, { seed: 103 });

// passengers (camera = narrator, back seat middle; Tom to the left)
const carTylerDrive = L("car-tyler-drive", () =>
  figure(430, 1240, { ...who("tyler"), pose: { lUp: 20, lFore: 150, rUp: -20, rFore: -150 }, size: 760, rim: "#5aa0c8", light: [0.2, 1], rimWidth: 5 }), { seed: 104 });
const carChris = L("car-chris", () =>
  figure(1170, 1240, { ...who("chris"), pose: "standB", size: 740, rim: "#5aa0c8", light: [-0.2, 1], rimWidth: 5 }), { seed: 105 });
const carChrisFist = L("car-chris-fist", () =>
  figure(1170, 1240, { ...who("chris"), pose: { rUp: 150, rFore: 178, lUp: -6 }, size: 740, rim: "#8a90a0", light: [-0.4, -1], rimWidth: 5 }), { seed: 106 });
// Tyler turned round between the seats, pointing out at the house
const carTylerTurn = L("car-tyler-turn", () =>
  figure(520, 1240, { ...who("tyler"), pose: { torso: 10, head: 26, rUp: 112, rFore: 75, lUp: -20, lFore: -40 }, size: 780, rim: "#8a90a0", light: [0.6, -1], rimWidth: 5 }), { seed: 107 });
const carTylerFistBump = L("car-tyler-bump", () =>
  figure(520, 1240, { ...who("tyler"), pose: { torso: 12, head: 30, rUp: 80, rFore: 100, lUp: -20, lFore: -40 }, size: 780, rim: "#8a90a0", light: [0.6, -1], rimWidth: 5 }), { seed: 108 });
// Tom in the back seat, very close on the left; two states
const carTom = L("car-tom", () =>
  figure(-40, 1480, { ...who("tom"), pose: { head: 8 }, size: 1250, rim: "#5a6a7a", light: [1, -0.2], rimWidth: 6 }), { seed: 109 });
const carTomDown = L("car-tom-down", () =>
  figure(-40, 1500, { ...who("tom"), pose: { torso: 10, head: 34 }, size: 1250, rim: "#5a6a7a", light: [1, -0.2], rimWidth: 6 }), { seed: 110 });

// view through the windshield of the parked car: the dark house
const carViewHouse = L("carview-house", (r) => {
  let s = nightSky(r, W, H, { top: "#04070b", bottom: "#141d27", moon: [1250, 200, 18] });
  s += g(`filter="url(#paint)"`, ...Array.from({ length: 18 }, (_, i) => tree(r, i * 95, 470, r.range(140, 230), "#090d12", { trunk: false })));
  s += g(`filter="url(#paint)"`, house(r, 470, 560, 660, 330, { roof: 0.4, fill: "#10141a", edge: "#3a4a5a", windows: [[0.12, 0.5, 60, 70], [0.32, 0.5, 60, 70], [0.6, 0.5, 60, 70], [0.8, 0.5, 60, 70], [0.2, 0.78, 70, 60], [0.72, 0.78, 70, 60]], porch: true }));
  s += g(`filter="url(#paint)"`, rect(0, 560, W, 340, `fill="#0b0f13"`), scumble(r, 0, 565, W, 335, 60, ["#1e2a33", "#040608"], { angle: 0, len: [80, 260], width: [2, 5], opacity: [0.2, 0.4] }));
  s += streetlamp(1380, 640, 300, { color: "#b98d48" });
  s += finish(W, H, { vignette: 0.6, tint: "#203448", tintOpacity: 0.12 });
  return s;
}, { opaque: true, seed: 111 });

/* Tequila bottle passed between the seats */
const bottle = L("bottle", (r) => {
  let s = rect(0, 0, W, H, `fill="#08090b"`) + glow(900, 300, 700, 400, "#3a4a5a", 0.35);
  s += g(`filter="url(#paint)"`, path(smooth([[0, 520], [600, 470], [1100, 480], [W, 520], [W, H], [0, H]], true, 0.4), `fill="#0c0d0f"`));
  // bottle
  s += `<g transform="rotate(-24 820 420)" filter="url(#paint)">
    ${rect(780, 160, 44, 120, `fill="#3a2a12"`)}${rect(774, 140, 56, 30, `fill="#1a1208"`)}
    ${path(smooth([[760, 280], [844, 280], [900, 360], [900, 640], [700, 640], [700, 360]], true, 0.3), `fill="#7a4e18" opacity="0.92"`)}
    ${rect(700, 520, 200, 120, `fill="#b07a30" opacity="0.55"`)}
    ${rect(718, 420, 164, 90, `fill="#d8cfb8" opacity="0.8"`)}${line(730, 450, 870, 450, `stroke="#5a4418" stroke-width="5"`)}${line(740, 475, 860, 475, `stroke="#5a4418" stroke-width="3"`)}
    ${rect(712, 300, 18, 320, `fill="#f0c890" opacity="0.35"`)}
  </g>`;
  s += goo(handShapes(1080, 600, Math.PI * 1.1, 120, { pose: "grip", sleeve: 260, sleeveW: 0.95 }), { rim: "#6a7a8a", light: [0, -1], blur: 5, rw: 4 });
  s += goo(handShapes(560, 250, 0.15, 110, { pose: "grip", sleeve: 280, sleeveW: 0.95, mirror: true }), { rim: "#6a7a8a", light: [0, -1], blur: 5, rw: 4 });
  s += glow(800, 450, 200, 260, PAL.amber, 0.3);
  s += finish(W, H, { vignette: 0.9 });
  void r;
  return s;
}, { opaque: true, seed: 112 });

/* The black bag: masks and gloves under the dome light */
const bag = L("bag", (r) => {
  let s = rect(0, 0, W, H, `fill="#060708"`);
  s += glow(800, 120, 600, 420, "#d8d0b8", 0.45);
  s += g(`filter="url(#paint)"`,
    path(smooth([[260, 900], [300, 520], [520, 420], [1100, 420], [1320, 520], [1360, 900]], true, 0.4), `fill="#121316"`),
    path(smooth([[400, 470], [800, 400], [1200, 470], [1180, 560], [800, 520], [420, 560]], true, 0.4), `fill="#030304"`),
    line(330, 480, 1290, 480, `stroke="#5a5e66" stroke-width="5" stroke-dasharray="10 6" opacity="0.7"`),
    // ski masks: knitted ovals with eye holes (empty)
    `<g transform="rotate(-10 640 470)">${path(smooth([[500, 470], [560, 390], [700, 400], [780, 460], [720, 540], [560, 540]], true, 0.6), `fill="#141416"`)}${path(`M560,450 q30,-14 60,0`, `stroke="#020202" stroke-width="10" fill="none"`)}${path(`M600,500 q60,20 130,-10`, `stroke="#26262a" stroke-width="5" fill="none"`)}</g>`,
    `<g transform="rotate(14 960 500)">${path(smooth([[830, 520], [880, 420], [1040, 430], [1100, 500], [1020, 570], [880, 570]], true, 0.6), `fill="#18181b"`)}${path(`M880,500 q80,30 180,-10`, `stroke="#2a2a2e" stroke-width="5" fill="none"`)}</g>`,
    // a pair of black gloves
    ...[[420, 600, -0.4], [1180, 610, 0.5]].map(([x, y, a]) => `<g transform="rotate(${a * 57} ${x} ${y})">${handShapes(x, y, -Math.PI / 2, 90, { pose: "open" })}</g>`).map((h) => `<g fill="#111113">${h}</g>`),
    scumble(r, 480, 380, 640, 220, 60, ["#2a2a2e", "#050506"], { angle: 0.3, len: [10, 30], width: [2, 4], jitter: 1.5, opacity: [0.3, 0.6] }),
  );
  // gloved hands pulling a mask out
  s += goo(handShapes(1150, 260, 2.4, 130, { pose: "grip", sleeve: 500, sleeveW: 1.1 }), { fill: "#09090a", rim: "#c8c0a8", light: [0, -1], blur: 5, rw: 4 });
  s += finish(W, H, { vignette: 0.95 });
  return s;
}, { opaque: true, seed: 113 });

/* ------------------------------------------------------------------ */
/* The junk Civic in the school lot                                      */
/* ------------------------------------------------------------------ */
const civic = L("civic", (r) => {
  const [d, u] = lin([[0, "#2a3038"], [1, "#6a6660"]]);
  let s = `<defs>${d}</defs><rect width="${W}" height="${H}" fill="${u}"/>`;
  s += g(`filter="url(#paint)"`, ...Array.from({ length: 12 }, (_, i) => tree(r, i * 150, 470, r.range(150, 230), "#1e2226", { trunk: false })), rect(0, 460, W, 440, `fill="#3a3a38"`),
    scumble(r, 0, 470, W, 430, 120, ["#4a4a46", "#202022", "#5a5650"], { angle: 0, len: [100, 300], width: [2, 6], opacity: [0.15, 0.35] }));
  // chain-link fence
  let fence = "";
  for (let x = 0; x < W; x += 22) fence += line(x, 330, x + 30, 470, `stroke="#1a1c1e" stroke-width="1.2" opacity="0.5"`) + line(x + 30, 330, x, 470, `stroke="#1a1c1e" stroke-width="1.2" opacity="0.5"`);
  s += `<g filter="url(#ink)">${fence}${line(0, 330, W, 330, `stroke="#141618" stroke-width="5"`)}${[100, 500, 900, 1300].map((x) => rect(x, 320, 8, 150, `fill="#141618"`)).join("")}</g>`;
  // parking lines
  for (let i = 0; i < 5; i++) s += line(200 + i * 320, 560, 80 + i * 360, H, `stroke="#c8c4b0" stroke-width="5" opacity="0.4" filter="url(#ink)"`);
  // the old hatchback, rust patches
  s += g(`filter="url(#paint)"`, car(380, 760, 640, { fill: "#33373b", glass: "#1e2428", rim: "#7a7e80" }),
    ...Array.from({ length: 22 }, () => stroke([[r.range(420, 980), r.range(650, 745)], [r.range(420, 980), r.range(650, 745)]], r.range(3, 12), r.range(2, 8), "#4a2a16", `opacity="${r.range(0.25, 0.5)}"`)),
    rect(860, 690, 120, 14, `fill="#2a2a2a"`));
  s += finish(W, H, { vignette: 0.75, tint: "#2a3a48", tintOpacity: 0.18 });
  return s;
}, { opaque: true, seed: 121 });

/* ------------------------------------------------------------------ */
/* Convenience store                                                     */
/* ------------------------------------------------------------------ */
const storeBg = L("store-bg", (r) => {
  const R = room(560, 230, 480, 360);
  let s = g(`filter="url(#paint)"`, poly(R.back, `fill="#5a6058"`), poly(R.left, `fill="#3a403a"`), poly(R.right, `fill="#353b36"`), poly(R.ceil, `fill="#2a2e2a"`), poly(R.floor, `fill="#6a6a60"`));
  // fluorescent tubes
  for (let k = 0; k < 4; k++) { const t = Math.pow(k / 4, 1.2); const c = lerp2([800, 40], [800, 228], t); const w = 520 * (1 - t) + 140; s += rect(c[0] - w / 2, c[1], w, 14 * (1 - t) + 4, `fill="#eef6f0"`) + glow(c[0], c[1], w * 0.8, 60, "#d8f0e0", 0.5); }
  // shelves both sides with product blocks
  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const t0 = 0.05 + i * 0.22, t1 = t0 + 0.18;
      const xa0 = side < 0 ? lerp2([0, 0], [560, 0], t0)[0] : lerp2([W, 0], [1040, 0], t0)[0];
      const xa1 = side < 0 ? lerp2([0, 0], [560, 0], t1)[0] : lerp2([W, 0], [1040, 0], t1)[0];
      for (let row = 0; row < 5; row++) {
        const ya0 = lerp2([0, 200 + row * 110], [0, 300 + row * 55], t0)[1];
        const ya1 = lerp2([0, 200 + row * 110], [0, 300 + row * 55], t1)[1];
        let pr = "";
        const n = 7;
        for (let k = 0; k < n; k++) {
          const tt = k / n, tt2 = (k + 0.8) / n;
          const x0 = xa0 + (xa1 - xa0) * tt, x1 = xa0 + (xa1 - xa0) * tt2;
          const y0 = ya0 + (ya1 - ya0) * tt, y1 = ya0 + (ya1 - ya0) * tt2;
          const hgt = (90 - row * 6) * (1 - t0 * 0.9);
          pr += poly([[x0, y0], [x1, y1], [x1, y1 - hgt * 0.8], [x0, y0 - hgt * 0.8]], `fill="${r.pick(["#8a3a2a", "#3a5a6a", "#b08a3a", "#4a6a3a", "#6a4a6a", "#c8c0a0"])}" opacity="0.75"`);
        }
        s += g(`filter="url(#paint)"`, pr, line(xa0, ya0 + 4, xa1, ya1 + 4, `stroke="#1a1c1a" stroke-width="${6 * (1 - t0)}"`));
      }
    }
  }
  // counter at the back
  s += g(`filter="url(#paint)"`, rect(640, 470, 320, 120, `fill="#2a2c2a"`), rect(630, 462, 340, 12, `fill="#8a8a80"`), rect(700, 380, 200, 80, `fill="#3a3e3a"`));
  s += g(`filter="url(#paint)"`, scumble(r, 0, 600, W, 300, 70, ["#8a8a80", "#3a3a34"], { angle: 0, len: [100, 300], width: [2, 6], opacity: [0.15, 0.3] }));
  s += finish(W, H, { vignette: 0.7, tint: "#3a5a48", tintOpacity: 0.16 });
  return s;
}, { opaque: true, seed: 131 });

const storeCast = L("store-cast", (r) => {
  let s = figure(730, 600, { build: "adult", pose: { torso: 2 }, size: 230, rim: "#e0f0e8", light: [0, -1], fill: "#101210" }); // clerk behind the counter
  s += figure(880, 640, { ...who("tom"), pose: { torso: -14, head: -10, rUp: -60, rFore: -100, lUp: -20, lFore: 20 }, size: 260, rim: "#e0f0e8", light: [0, -1] });
  // foreground: the narrator's hoodie at the right edge, a hand slipping a candy bar into the pocket
  s += g(`filter="url(#paint)"`, path(smooth([[1180, H + 40], [1200, 600], [1330, 420], [1500, 380], [1640, 420], [1640, H + 40]], true, 0.4), `fill="#0b0c0d"`),
    path(`M1250,760 Q1380,700 1560,730`, `stroke="#2a2c2e" stroke-width="7" fill="none"`), path(`M1250,760 Q1240,820 1260,880`, `stroke="#1a1c1e" stroke-width="6" fill="none"`));
  s += `<g transform="rotate(70 1255 700)">${rect(1190, 670, 140, 56, `fill="#a03020"`)}${text(1260, 707, "CHOCO", 24, "#e8d0a0", { anchor: "middle", family: "Arial Black, Arial, sans-serif" })}</g>`;
  s += goo(handShapes(1270, 600, Math.PI / 2 + 0.25, 105, { pose: "grip", sleeve: 260, sleeveW: 1.05 }), { rim: "#c8e0d0", light: [-1, -0.3], blur: 5, rw: 4 });
  void r;
  return s;
}, { seed: 132 });

/* Laptop: the auction listings and the split cash */
const laptop = L("laptop", (r) => {
  let s = rect(0, 0, W, H, `fill="#050608"`);
  // screen
  s += g(`filter="url(#wob)"`,
    poly([[420, 120], [1180, 120], [1200, 600], [400, 600]], `fill="#0e1014"`),
    poly([[450, 145], [1150, 145], [1166, 575], [434, 575]], `fill="#d6dde2"`),
    rect(450, 145, 700, 40, `fill="#3a5a8a"`), text(470, 175, "AUCTIONS  ·  MY LISTINGS", 22, "#e8eef4", { family: "Arial, sans-serif" }),
    ...Array.from({ length: 6 }, (_, i) => { const x = 470 + (i % 3) * 228, y = 205 + Math.floor(i / 3) * 180; return rect(x, y, 200, 110, `fill="${r.pick(["#5a6a7a", "#8a7a6a", "#4a4a5a", "#7a5a4a"])}"`) + rect(x, y + 118, 120, 12, `fill="#6a7480"`) + rect(x + 130, y + 114, 70, 22, `fill="#2a8a4a"`) + text(x + 165, y + 131, "SOLD", 15, "#fff", { anchor: "middle", family: "Arial, sans-serif" }); }),
    poly([[380, 600], [1220, 600], [1330, 700], [270, 700]], `fill="#1a1c20"`),
  );
  s += glow(800, 360, 700, 400, "#a8c8e8", 0.45);
  // cash fanned on the desk
  s += g(`filter="url(#paint)"`, ...Array.from({ length: 9 }, (_, i) => `<g transform="rotate(${-30 + i * 8} ${400 + i * 70} 820)">${rect(330 + i * 70, 760, 240, 104, `fill="#6a7a5a"`)}${rect(340 + i * 70, 770, 220, 84, `fill="none" stroke="#3a4a32" stroke-width="3"`)}${ell(450 + i * 70, 812, 26, 30, `fill="#4a5a3a"`)}</g>`));
  s += darkness(W, H, [{ x: 800, y: 500, rx: 760, ry: 500, power: 1 }], 0.8);
  s += finish(W, H, { vignette: 0.9, tint: "#203448", tintOpacity: 0.12 });
  return s;
}, { opaque: true, seed: 141 });

/* ------------------------------------------------------------------ */
/* Tyler's living room: weed, tequila, video games                       */
/* ------------------------------------------------------------------ */
const living = L("living-bg", (r) => {
  let s = rect(0, 0, W, H, `fill="#0a0c10"`);
  s += g(`filter="url(#paintV)"`, rect(0, 0, W, 640, `fill="#14181e"`), rect(0, 640, W, 260, `fill="#0c0e11"`));
  // big TV on the far wall
  s += rect(560, 170, 520, 300, `fill="#050607"`);
  const [d, u] = lin([[0, "#3a6aa0"], [0.5, "#5a9ac8"], [1, "#2a3a6a"]]);
  s += `<defs>${d}</defs>` + rect(574, 184, 492, 272, `fill="${u}"`);
  // an abstract shooter game on screen
  s += g(`filter="url(#wob)"`, poly([[574, 456], [700, 340], [820, 380], [940, 320], [1066, 400], [1066, 456]], `fill="#1a2a3a"`), rect(800, 300, 30, 30, `fill="#e05030"`), ell(820, 320, 50, 50, `fill="none" stroke="#e8f0f8" stroke-width="3"`));
  s += glow(820, 320, 720, 420, "#6aa8e0", 0.45);
  s += cone(820, 330, Math.PI / 2, 0.9, 700, "#5a90c8", 0.25);
  // shelves and a lamp off in the dark
  s += g(`filter="url(#paint)"`, rect(160, 200, 280, 380, `fill="#0f1216"`), ...[0, 1, 2].map((i) => rect(170, 290 + i * 100, 260, 8, `fill="#1e242c"`)), rect(1200, 220, 260, 360, `fill="#0f1216"`));
  // coffee table with the bottle and shot glasses
  s += g(`filter="url(#paint)"`, poly([[540, 700], [1100, 700], [1180, 780], [460, 780]], `fill="#1e1a16"`),
    rect(760, 590, 40, 110, `fill="#8a5a1e" opacity="0.9"`), rect(770, 560, 20, 34, `fill="#2a1a08"`),
    ...[640, 860, 940].map((x) => rect(x, 670, 26, 32, `fill="#c89a50" opacity="0.6"`)),
    ell(1020, 690, 30, 8, `fill="#2a2420"`));
  s += glow(780, 650, 120, 80, PAL.amber, 0.3);
  s += smoke(r, 1030, 682, 220, "#8aa0b8", 0.3) + smoke(r, 1020, 650, 300, "#8aa0b8", 0.18);
  s += darkness(W, H, [{ x: 820, y: 420, rx: 760, ry: 520, power: 0.9 }], 0.6);
  s += finish(W, H, { vignette: 0.85, tint: "#1a2a44", tintOpacity: 0.14 });
  return s;
}, { opaque: true, seed: 151 });

const livingCouch = L("living-couch", () => {
  const lt = [0, -1];
  let s = "";
  const heads = [[380, "chris"], [620, "tom"], [1000, "narr"]];
  for (const [x, k] of heads) s += figure(x, 1220, { ...who(k), pose: { lUp: -20, lFore: 60, rUp: 20, rFore: -60 }, size: 760, rim: "#7ab0e0", light: lt, rimWidth: 4 });
  s += g(`filter="url(#paint)"`, path(smooth([[-40, H + 20], [-20, 780], [200, 740], [1400, 740], [1640, 780], [1640, H + 20]], true, 0.3), `fill="#0b0c0f"`), path(`M-20,780 Q800,700 1640,780`, `stroke="#2a3a50" stroke-width="5" fill="none" opacity="0.8"`));
  // Tyler in the armchair at the right, turned toward the camera: pure backlit silhouette
  s += figure(1340, 1010, { ...who("tyler"), pose: { lThigh: -80, rThigh: -70, hipDrop: 0.25, torso: -10, head: -16, lUp: 20, lFore: 90, rUp: 30, rFore: 10 }, size: 560, rim: "#7ab0e0", light: [-1, -0.5], rimWidth: 4 });
  return s;
}, { seed: 152 });

/* ------------------------------------------------------------------ */
/* Suburban road at night: the car leaves town                           */
/* ------------------------------------------------------------------ */
const RW = 2600;
const roadNight = L("road-night", (r) => {
  let s = nightSky(r, RW, H, { top: "#03060a", bottom: "#151d27" });
  s += g(`filter="url(#paint)"`, ...Array.from({ length: 30 }, (_, i) => tree(r, i * 90, 520, r.range(160, 260), "#080b10", { trunk: false })));
  for (let i = 0; i < 6; i++) s += g(`filter="url(#paint)"`, house(r, 80 + i * 430, 600, r.range(240, 320), r.range(170, 220), { fill: "#0c1015", edge: "#2a3644", windows: [[0.2, 0.55, 40, 40], [0.65, 0.55, 40, 40]], chimney: r() > 0.5 }));
  s += g(`filter="url(#paint)"`, rect(0, 600, RW, 300, `fill="#0b0e12"`), rect(0, 690, RW, 120, `fill="#07090c"`), ...Array.from({ length: 26 }, (_, i) => rect(i * 110, 748, 56, 6, `fill="#8a7a50" opacity="0.5"`)));
  for (const x of [300, 1100, 1900]) s += streetlamp(x, 690, 330, { color: "#a8844a" });
  s += finish(RW, H, { vignette: 0.7, tint: "#203448", tintOpacity: 0.15 });
  return s;
}, { w: RW, opaque: true, seed: 161 });
const roadCar = L("road-car", () =>
  g(`filter="url(#paint)"`, car(560, 800, 460, { fill: "#101216", glass: "#1a2430", rim: "#8aa0b8", sporty: true, lights: true, tail: true })),
{ seed: 162 });

/* ------------------------------------------------------------------ */
/* The target house: wide night plate and police-light variant           */
/* ------------------------------------------------------------------ */
function targetHouse(r, police) {
  let s = nightSky(r, W, H, { top: "#04070b", bottom: "#17202a", moon: police ? null : [1270, 140, 24] });
  s += g(`filter="url(#paint)"`, ...Array.from({ length: 22 }, (_, i) => tree(r, i * 80 + r.range(-20, 20), 540, r.range(160, 260), "#0a0f14", { trunk: false })));
  // a big colonial: two storeys, porch columns, dormers; every window dark
  s += g(`filter="url(#paintV)"`,
    poly([[420, 300], [800, 170], [1180, 300]], `fill="#12161c"`),
    rect(440, 300, 720, 340, `fill="#151a20"`),
    ...[560, 800, 1040].map((x) => poly([[x - 50, 290], [x, 230], [x + 50, 290], [x + 50, 320], [x - 50, 320]], `fill="#12161c"`) + rect(x - 24, 262, 48, 44, `fill="#06080b"`)),
    rect(1060, 200, 46, 110, `fill="#12161c"`),
    rect(560, 520, 480, 18, `fill="#0b0d10"`), ...[580, 700, 900, 1020].map((x) => rect(x, 538, 16, 102, `fill="#232a32"`)),
    rect(770, 545, 60, 95, `fill="#050608"`),
  );
  let siding = "";
  for (let y = 310; y < 630; y += 12) siding += line(442, y, 1158, y, `stroke="#33414f" stroke-width="1" opacity="${r.range(0.15, 0.35)}"`);
  s += g(`filter="url(#ink)"`, siding);
  for (const [x, y] of [[490, 350], [610, 350], [930, 350], [1050, 350], [490, 450], [610, 450], [930, 450], [1050, 450]]) {
    s += rect(x - 4, y - 4, 64, 84, `fill="#06080b"`) + rect(x, y, 56, 76, `fill="#0b1016"`) + rect(x, y, 56, 26, `fill="#3a4a5c" opacity="${police ? 0.1 : 0.22}"`) + line(x + 28, y, x + 28, y + 76, `stroke="#06080b" stroke-width="3"`) + line(x, y + 38, x + 56, y + 38, `stroke="#06080b" stroke-width="3"`);
  }
  s += g(`filter="url(#paint)"`, poly([[0, 640], [W, 630], [W, H], [0, H]], `fill="#0f151b"`), poly([[760, 640], [840, 640], [980, H], [620, H]], `fill="#181d22"`),
    scumble(r, 0, 640, W, 260, 110, ["#22303a", "#05080b"], { angle: 0, len: [60, 220], width: [2, 6], opacity: [0.2, 0.45] }),
    // hedges
    ...Array.from({ length: 12 }, (_, i) => ell(450 + i * 60, 645, 50, 34, `fill="#070a0d"`)));
  s += g(`filter="url(#paint)"`, bareTree(r, 1400, 780, 640, "#05070a", 6), bareTree(r, 120, 820, 560, "#05070a", 5));
  if (police) {
    s += glow(300, 760, 700, 320, "#c0202a", 0.35) + glow(1300, 760, 700, 320, "#2a5ac8", 0.35);
    s += rect(0, 0, W, H, `fill="#0a1a3a" opacity="0.12"`);
  } else s += streetlamp(150, 760, 330, { color: "#a8844a" });
  s += finish(W, H, { vignette: 0.82, tint: "#203448", tintOpacity: 0.14 });
  return s;
}
const houseBg = L("house-bg", (r) => targetHouse(r, false), { opaque: true, seed: 171 });
const housePolice = L("house-police", (r) => targetHouse(r, true), { opaque: true, seed: 171 });
const houseCar = L("house-car", () => g(`filter="url(#paint)"`, car(1180, 800, 360, { fill: "#0d1014", glass: "#1b2733", rim: "#6f8396", sporty: true, flip: true })), { seed: 172 });
// the four, masked, slipping out of the car toward the house
const houseGang = L("house-gang", () => {
  const lt = [0.6, -1];
  const mask = { fill: "#050506" };
  return figure(860, 780, { ...who("tyler"), pose: "walkB", size: 210, rim: "#8aa0b8", light: lt, ...mask })
    + figure(930, 790, { ...who("chris"), pose: "walkB2", size: 200, rim: "#8aa0b8", light: lt, flip: true, ...mask })
    + figure(1010, 800, { ...who("tom"), beanie: false, pose: "hunch", size: 215, rim: "#8aa0b8", light: lt, ...mask })
    + figure(1090, 812, { ...who("narr"), hood: true, pose: "walkB", size: 220, rim: "#8aa0b8", light: lt, ...mask });
}, { seed: 173 });

/* ------------------------------------------------------------------ */
/* Behind the house: the window                                          */
/* ------------------------------------------------------------------ */
function backWall(r, broken) {
  let s = rect(0, 0, W, H, `fill="#0b0f14"`);
  // siding wall seen at an angle, a window centre-right
  s += g(`filter="url(#paintV)"`, poly([[0, 0], [W, 0], [W, 760], [0, 820]], `fill="#1c232b"`));
  let sid = "";
  for (let y = 10; y < 800; y += 22) sid += line(0, y + (y / 800) * 60, W, y, `stroke="#0a0d11" stroke-width="3" opacity="0.8"`) + line(0, y + 3 + (y / 800) * 60, W, y + 3, `stroke="#3a4a5a" stroke-width="1" opacity="0.4"`);
  s += g(`filter="url(#ink)"`, sid);
  const wx = 760, wy = 180, ww = 420, wh = 360;
  s += g(`filter="url(#paint)"`, rect(wx - 30, wy - 30, ww + 60, wh + 70, `fill="#2a323a"`), rect(wx, wy, ww, wh, `fill="#06080b"`),
    rect(wx, wy, ww, wh * 0.35, `fill="#4a5a6a" opacity="0.18"`),
    poly([[wx + 40, wy], [wx + 160, wy], [wx + 30, wy + wh], [wx, wy + wh]], `fill="#8aa0b8" opacity="0.08"`),
    line(wx + ww / 2, wy, wx + ww / 2, wy + wh, `stroke="#2a323a" stroke-width="12"`), line(wx, wy + wh / 2, wx + ww, wy + wh / 2, `stroke="#2a323a" stroke-width="12"`),
    rect(wx - 40, wy + wh + 30, ww + 80, 22, `fill="#323a42"`));
  if (broken) {
    const cx = wx + ww * 0.28, cy = wy + wh * 0.3;
    s += path(smooth([[cx - 40, cy - 30], [cx + 10, cy - 50], [cx + 50, cy - 10], [cx + 30, cy + 40], [cx - 30, cy + 45], [cx - 55, cy + 5]], true, 0.2), `fill="#000"`);
    let cr = "";
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2 + r.range(-0.2, 0.2); const L1 = r.range(60, 150); cr += path(`M${cx + Math.cos(a) * 40},${cy + Math.sin(a) * 38} l${Math.cos(a) * L1 * 0.5 + r.range(-8, 8)},${Math.sin(a) * L1 * 0.5 + r.range(-8, 8)} l${Math.cos(a) * L1 * 0.5},${Math.sin(a) * L1 * 0.5}`, `stroke="#c8d8e8" stroke-width="1.6" fill="none" opacity="0.7"`); }
    s += `<g filter="url(#ink)">${cr}</g>`;
    s += speckle(r, cx - 140, wy + wh + 10, 300, 60, 40, "#a8c0d0", [1, 4], 0.7);
  }
  // overgrown yard in front
  s += g(`filter="url(#paint)"`, poly([[0, 820], [W, 760], [W, H], [0, H]], `fill="#0a0e10"`), scumble(r, 0, 740, W, 160, 160, ["#1a2620", "#040605", "#2a3830"], { angle: -1.4, len: [30, 90], width: [2, 5], jitter: 0.5, opacity: [0.4, 0.8] }));
  s += glow(1200, 120, 700, 300, "#7a90a8", 0.15);
  s += darkness(W, H, [{ x: 980, y: 400, rx: 700, ry: 460, power: 0.7 }], 0.55);
  s += finish(W, H, { vignette: 0.88, tint: "#203448", tintOpacity: 0.15 });
  return s;
}
const backyard = L("backyard", (r) => backWall(r, false), { opaque: true, seed: 181 });
const backyardBroken = L("backyard-broken", (r) => backWall(r, true), { opaque: true, seed: 181 });
// Tyler raising the rock at the window
const backRock = L("back-rock", () =>
  figure(560, 1000, { ...who("tyler"), pose: { torso: 6, rUp: 150, rFore: 120, lUp: -20, lFore: -10 }, size: 760, rim: "#7a90a8", light: [0.5, -1], fill: "#050506", extra: (fp) => ell(fp.hands.r[0], fp.hands.r[1] - 10, 30, 24, `fill="#1a1e22"`) }),
{ seed: 182 });
// sneaking along the wall
const backSneak = L("back-sneak", () => {
  const lt = [0.4, -1];
  const m = { fill: "#050506" };
  return figure(220, 850, { ...who("tyler"), pose: { torso: -18, head: -10, lThigh: -16, lShin: 4, rThigh: 14, rShin: 20, lUp: -20, lFore: -30, rUp: 10, rFore: 20 }, size: 360, rim: "#7a90a8", light: lt, ...m })
    + figure(380, 850, { ...who("chris"), pose: "hunch", size: 360, rim: "#7a90a8", light: lt, ...m })
    + figure(520, 856, { ...who("tom"), beanie: false, pose: "hunch", size: 380, rim: "#7a90a8", light: lt, ...m })
    + figure(660, 862, { ...who("narr"), hood: true, pose: "hunch", size: 380, rim: "#7a90a8", light: lt, ...m });
}, { seed: 183 });
// Chris disappearing through the window, the others boosting him
const backClimb = L("back-climb", () => {
  const lt = [0.4, -1];
  const m = { fill: "#050506" };
  let s = goo(
    `<path d="${capsulePath(930, 330, 34, 850, 470, 26)}"/><path d="${capsulePath(990, 330, 34, 1060, 450, 26)}"/>` +
      `<path d="${capsulePath(850, 470, 26, 820, 560, 22)}"/><path d="${capsulePath(1060, 450, 26, 1110, 540, 22)}"/>` +
      `<ellipse cx="810" cy="580" rx="40" ry="20"/><ellipse cx="1125" cy="560" rx="40" ry="20"/>` +
      `<rect x="890" y="260" width="140" height="90" rx="30"/>`,
    { fill: "#050506", rim: "#7a90a8", light: [0.4, -1], blur: 6, rw: 4 },
  );
  s += figure(820, 960, { ...who("tyler"), pose: "raise", size: 470, rim: "#7a90a8", light: lt, ...m });
  s += figure(1100, 970, { ...who("tom"), beanie: false, pose: "raise", size: 480, rim: "#7a90a8", light: lt, ...m });
  // the window frame drawn over the legs going in
  s += rect(740, 140, 480, 46, `fill="#2a323a" filter="url(#paint)"`);
  return s;
}, { seed: 184 });

export const ACT1 = [
  kitchenBg, kitchenDad, kitchenBoy, townBg, townGang, townNarr, schoolBg, schoolGang, fieldBg, fieldBench, roster,
  tylerDusk, tylerNight, tylerCar, wallet, carViewDusk, carViewNight, carViewHouse, carFrame, carTylerDrive, carChris,
  carChrisFist, carTylerTurn, carTylerFistBump, carTom, carTomDown, bottle, bag, civic, storeBg, storeCast, laptop,
  living, livingCouch, roadNight, roadCar, houseBg, housePolice, houseCar, houseGang, backyard, backyardBroken,
  backRock, backSneak, backClimb,
];
