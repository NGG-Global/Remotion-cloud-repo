import type { Shot } from "./engine";

/**
 * The cut. Every `at` is seconds into the narration (basement narration MP3,
 * transcribed locally); a shot runs until the next shot's `at`. Cuts sit in
 * the pauses between spoken phrases. Comments quote the beat being covered.
 *
 * Plate coordinates: 1600x900 unless noted (town 2000, field 2200, road 2600,
 * chamber 3000x1000). Cameras: [t, centreX, centreY, zoom]; `cn` uses t as a
 * fraction of the shot.
 */

export const DURATION_S = 1137.19;

// chamber panorama landmarks (see tools/basement/act3.mjs)
const C = { maiden: 330, chair: 760, rack: 1110, table: 1560, vat: 2160, tools: 2620, door: 2900 };

export const SHOTS: readonly Shot[] = [
  /* ====================== ACT I: the boys ====================== */
  // "When I was a kid, my father always told me I was a follower..."
  { at: 0, plate: "kitchen-bg", L: [{ n: "kitchen-dad", br: 0.6 }, { n: "kitchen-boy", p: 1.25 }], cn: [[0, 820, 450, 1.04], [1, 920, 480, 1.2]], tr: "fade", trd: 1.6, hand: 1.5 },
  // "And he was right, of course... in one ear and out the other"
  { at: 17.4, plate: "kitchen-bg", L: [{ n: "kitchen-dad", br: 0.6 }], cn: [[0, 1060, 560, 1.4], [1, 1090, 590, 1.55]], tr: "xfade", trd: 1, hand: 1 },
  // "In my eyes I was invincible. I knew everything."
  { at: 24.3, plate: "town-bg", L: [{ n: "town-narr" }], cn: [[0, 1180, 440, 1.35], [1, 1150, 460, 1.08]], fx: [{ t: "smoke", x: 1200, y: 400 }], hand: 1.5 },
  // "I was wrong. My friends and I messed with the wrong man."
  { at: 32.3, plate: "door-plate", L: [{ n: "door-g", op: [[1.6, 0], [3.2, 1]] }], cam: [[0, 800, 420, 1.25], [4.6, 800, 400, 1.12]], fx: [{ t: "black", op: [[0, 1], [1.5, 1], [2.4, 0.15], [4.6, 0]] }, { t: "light", x: 800, y: 0, r: 700, c: "rgba(230,240,235,0.5)", op: 1, flick: 0.6 }], hand: 1 },
  // "I spent two years in a psychiatric institution. A shadow of who I was."
  { at: 36.9, plate: "inst-room", L: [{ n: "inst-narr", br: 0.4 }], cn: [[0, 760, 520, 1.1], [1, 700, 560, 1.28]], tr: "fade", trd: 0.8, hand: 1 },
  // "In high school I fell in with the wrong crowd..."
  { at: 45.0, plate: "school-bg", L: [{ n: "school-gang", sc: [[0, 1.08], [7.6, 0.94]], ox: 840, oy: 740, dy: [[0, 10], [7.6, -16]] }], cn: [[0, 800, 470, 1.06], [1, 800, 450, 1.16]], tr: "fade", trd: 0.5 },
  // "...the grade football team... smoked weed before practice... never let us on the field"
  { at: 52.6, plate: "field-bg", L: [{ n: "field-bench", p: 1.25 }], cn: [[0, 820, 470, 1.12], [1, 1380, 470, 1.12]], hand: 2 },
  // "Nobody was surprised when we didn't make varsity..."
  { at: 68.3, plate: "roster", cn: [[0, 790, 450, 1.05], [1, 760, 520, 1.32]], fx: [{ t: "light", x: 740, y: 420, r: 700, c: "rgba(255,230,180,0.18)", op: 1, flick: 0.3 }] },
  // "...wandering around town after school, smoking, sometimes drinking"
  { at: 76.9, plate: "town-bg", L: [{ n: "town-gang", br: 0.5 }], cn: [[0, 1300, 450, 1.15], [1, 1050, 460, 1.1]], fx: [{ t: "smoke", x: 1187, y: 460 }, { t: "light", x: 790, y: 440, r: 300, c: "rgba(255,100,60,0.35)", op: 1, flick: 0.5 }] },
  // "Tyler was the undisputed leader... rich, spoiled... compensated with gifts"
  { at: 86.9, plate: "tyler-dusk", L: [{ n: "tyler-car", p: 1.1 }], cn: [[0, 800, 450, 1.04], [1, 860, 500, 1.18]] },
  // "...he grew up to be a piece of shit. And for some reason he loved to steal."
  { at: 101.7, plate: "tyler-dusk", L: [{ n: "tyler-car", p: 1.1 }], cn: [[0, 820, 560, 1.55], [1, 800, 540, 1.68]], tr: "xfade", trd: 0.6 },
  // "Not because he needed money: his father's credit card..."
  { at: 108.7, plate: "wallet", cn: [[0, 800, 450, 1.04], [1, 900, 380, 1.3]], fx: [{ t: "glint", pts: [[980, 300], [1130, 360]], every: 2.4 }] },
  // "...dragged us into petty theft. School out at two-thirty, Tyler's new car, a joint..."
  { at: 118.6, plate: "carview-dusk", L: [{ n: "car-frame", p: 1.08 }, { n: "car-chris", p: 1.12, br: 1 }, { n: "car-tyler-drive", p: 1.12, br: 1 }], cn: [[0, 800, 450, 1.06], [1, 800, 440, 1.1]], hand: 4, fx: [{ t: "smoke", x: 1150, y: 360 }] },
  // "I had a junk Honda Civic... Chris and Tom didn't even have that"
  { at: 131.4, plate: "civic", cn: [[0, 700, 520, 1.25], [1, 860, 480, 1.08]] },
  // "He'd pick a store and hand out a shopping list... Tom distracted the clerks..."
  { at: 142.6, plate: "store-bg", L: [{ n: "store-cast", dy: [[8, 0], [10, 0]] }], cam: [[0, 800, 450, 1.45], [6, 800, 460, 1.32], [9.5, 1000, 520, 1.12], [13.8, 1040, 540, 1.15]], fx: [{ t: "light", x: 800, y: 120, r: 600, c: "rgba(220,255,235,0.25)", op: 1, flick: 0.25 }] },
  // "Afterwards we sold it all online and split the money. It worked pretty well."
  { at: 156.4, plate: "laptop", cn: [[0, 800, 420, 1.05], [1, 800, 500, 1.22]], fx: [{ t: "light", x: 800, y: 360, r: 600, c: "rgba(160,200,240,0.2)", op: 1, flick: 0.2 }] },
  // "Until Tyler got bored... one weekend he invited us all over"
  { at: 162.4, plate: "tyler-night", cn: [[0, 800, 450, 1.04], [1, 720, 470, 1.22]], tr: "fade", trd: 0.5 },
  // "The moment I walked in I saw that stupid grin... He was planning something."
  { at: 172.7, plate: "living-bg", L: [{ n: "living-couch", p: 1.15 }], cn: [[0, 1300, 560, 1.5], [1, 1330, 580, 1.65]], fx: [{ t: "tv", x: 820, y: 320, w: 900, h: 600 }] },
  // "Weed, tequila shots, video games. Around midnight Tyler announced he was bored."
  { at: 181.1, plate: "living-bg", L: [{ n: "living-couch", p: 1.15 }], cn: [[0, 800, 460, 1.06], [1, 820, 450, 1.14]], fx: [{ t: "tv", x: 820, y: 320, w: 900, h: 600 }, { t: "smoke", x: 1030, y: 650 }] },
  // "...he drove the opposite way, away from town, deep into the suburbs"
  { at: 191.0, plate: "road-night", L: [{ n: "road-car", dx: [[0, -500], [8.8, 1500]] }], cn: [[0, 900, 500, 1.15], [1, 1700, 500, 1.15]], tr: "fade", trd: 0.4 },
  // "We asked him where we were going. He wouldn't answer."
  { at: 199.8, plate: "carview-night", L: [{ n: "car-frame", p: 1.08 }, { n: "car-chris", p: 1.12, br: 1 }, { n: "car-tyler-drive", p: 1.12, br: 1 }, { n: "car-tom", p: 1.2 }], cn: [[0, 800, 450, 1.08], [1, 800, 450, 1.12]], hand: 4 },
  // "...we stopped in front of a big house. Every window was dark."
  { at: 203.3, plate: "house-bg", L: [{ n: "house-car", p: 1.05 }], cn: [[0, 800, 420, 1.04], [1, 800, 400, 1.2]], fx: [{ t: "fog", op: 0.16 }] },
  // "Tyler turned to us and pointed at the house. 'This guy is loaded... half a million in rare coins'"
  { at: 207.8, plate: "carview-house", L: [{ n: "car-frame", p: 1.08 }, { n: "car-chris", p: 1.12 }, { n: "car-tyler-turn", p: 1.12 }, { n: "car-tom", p: 1.2 }], cn: [[0, 800, 450, 1.05], [1, 760, 430, 1.2]], hand: 1.5 },
  // "Chris pumped his fist... Tyler bumped it... 'What about you two?' Tom looked at the floor."
  {
    at: 225.3, plate: "carview-house",
    L: [
      { n: "car-frame", p: 1.08 },
      { n: "car-chris-fist", p: 1.12, to: 4.5, jit: 2 },
      { n: "car-chris", p: 1.12, from: 4.5 },
      { n: "car-tyler-turn", p: 1.12, to: 2.3 },
      { n: "car-tyler-bump", p: 1.12, from: 2.3, to: 5.5 },
      { n: "car-tyler-turn", p: 1.12, from: 5.5 },
      { n: "car-tom", p: 1.2, to: 9.0 },
      { n: "car-tom-down", p: 1.2, from: 9.0 },
    ],
    cn: [[0, 820, 440, 1.12], [1, 700, 460, 1.18]], hand: 2,
  },
  // Tom: "I don't know, man... breaking into someone's house is another story"
  { at: 237.6, plate: "carview-house", L: [{ n: "car-frame", p: 1.08 }, { n: "car-tyler-turn", p: 1.12 }, { n: "car-tom-down", p: 1.2, br: 0.8 }], cn: [[0, 360, 470, 1.5], [1, 330, 500, 1.6]], hand: 1.5 },
  // "I saw Tyler's face going red. He was about to explode at Tom."
  { at: 245.5, plate: "carview-house", L: [{ n: "car-frame", p: 1.08 }, { n: "car-tyler-turn", p: 1.12, jit: 1.2 }], cn: [[0, 560, 470, 1.5], [1, 560, 450, 1.75]], hand: 1, fx: [{ t: "tint", c: "#7c1119", op: [[0, 0], [3.5, 0.22]], blend: "multiply" }, { t: "heart", bpm: 96, a: 0.4 }] },
  // "And I, the coward, rushed in: 'Bro, with those coins you can buy a crazy car'"
  { at: 250.0, plate: "carview-house", L: [{ n: "car-frame", p: 1.08 }, { n: "car-chris", p: 1.12 }, { n: "car-tyler-turn", p: 1.12 }, { n: "car-tom-down", p: 1.2 }], cn: [[0, 800, 460, 1.1], [1, 800, 450, 1.05]], hand: 3 },
  // "Tyler calmed down a little. 'Where are your balls? He's in Europe. Trust me.' Tom agreed."
  { at: 261.7, plate: "carview-house", L: [{ n: "car-frame", p: 1.08 }, { n: "car-chris", p: 1.12 }, { n: "car-tyler-turn", p: 1.12 }, { n: "car-tom-down", p: 1.2, to: 10.2 }, { n: "car-tom", p: 1.2, from: 10.2 }], cn: [[0, 580, 460, 1.3], [0.75, 560, 460, 1.4], [1, 420, 470, 1.35]], hand: 2 },
  // "We passed the tequila bottle around until it was empty."
  { at: 273.8, plate: "bottle", cn: [[0, 820, 440, 1.1], [1, 760, 430, 1.25]], hand: 3 },
  // "Then Tyler pulled out a black bag: masks and gloves... 'Wow, a pro.' He pulled the mask on."
  { at: 277.6, plate: "bag", cn: [[0, 800, 420, 1.15], [1, 800, 470, 1.32]], fx: [{ t: "light", x: 800, y: 120, r: 700, c: "rgba(240,230,200,0.25)", op: 1, flick: 0.2 }] },
  // "Here's the plan: around the house, check the windows... no alarm. Nothing to worry about."
  { at: 289.8, plate: "house-bg", L: [{ n: "house-car", p: 1.05 }, { n: "house-gang", dy: [[0, 30], [14, -10]], sc: [[0, 1.12], [14, 0.95]], ox: 980, oy: 800 }], cn: [[0, 950, 560, 1.4], [1, 860, 520, 1.15]], fx: [{ t: "fog", op: 0.16 }] },
  // "We got out and crept round the back. Every window was locked."
  { at: 303.9, plate: "backyard", L: [{ n: "back-sneak", dx: [[0, -60], [6.3, 160]] }], cn: [[0, 600, 520, 1.2], [1, 760, 500, 1.2]], hand: 2 },
  // "Tyler picked up a rock and smashed a small hole in the nearest window"
  {
    at: 310.2, plate: "backyard",
    L: [{ n: "back-rock", p: 1.1, to: 1.9 }, { n: "backyard-broken", from: 1.9 }, { n: "back-rock", p: 1.1, from: 1.9, op: [[1.9, 1], [3.5, 0]], dy: [[1.9, 0], [3, 30]] }],
    cn: [[0, 900, 420, 1.25], [1, 960, 400, 1.35]], shake: [[1.9, 14]], fx: [{ t: "flash", at: 1.9, d: 0.2, peak: 0.5 }],
  },
  // "We boosted Chris in first... 'All clear!' We all jumped... 'drunk idiot'. Then we followed."
  { at: 315.2, plate: "backyard-broken", L: [{ n: "back-climb", dy: [[0, 20], [3, 0]] }], cn: [[0, 960, 420, 1.15], [1, 960, 460, 1.25]], shake: [[4.5, 10]], hand: 2 },

  /* ====================== ACT II: the house, the basement ====================== */
  // "Tyler ordered us to split up... I went through drawers... 'Leave the speakers, idiot!'"
  {
    at: 328.6, plate: "gf-lit", L: [{ n: "gf-cast" }], dark: { n: "gf-dark", holes: [[[0, 150, 640, 260], [5, 220, 620, 300], [10, 700, 600, 340], [12.5, 1300, 600, 380], [16.7, 1250, 560, 400]]] },
    cn: [[0, 500, 520, 1.25], [0.55, 760, 500, 1.15], [1, 1100, 520, 1.2]], tr: "fade", trd: 0.5, hand: 3,
  },
  // "Ten minutes later... Chris and Tom took the second floor; Tyler and I went down to the basement"
  { at: 345.3, plate: "gf-lit", L: [{ n: "gf-split" }], dark: { n: "gf-dark", holes: [[[0, 1400, 480, 380], [6, 1350, 520, 360], [12.6, 600, 600, 420]]] }, cn: [[0, 1150, 480, 1.25], [0.5, 1000, 500, 1.15], [1, 650, 560, 1.3]], hand: 3 },
  // "A heavy padlock hung on the basement door. Tyler laughed. 'What idiot...'"
  { at: 357.9, plate: "bdoor", cn: [[0, 820, 450, 1.08], [1, 960, 500, 1.3]], hand: 2.5, fx: [{ t: "light", x: 1060, y: 520, r: 500, c: "rgba(220,235,245,0.18)", op: 1, flick: 0.3 }] },
  // "He gave the door a hard kick. The wood split and the door flew open."
  {
    at: 367.2, plate: "bdoor", L: [{ n: "bdoor-kick", p: 1.1, to: 1.6, dx: [[0, -60], [1.2, 0]] }, { n: "bdoor-broken", from: 1.6 }],
    cam: [[0, 800, 460, 1.1], [1.6, 820, 460, 1.1], [5.2, 820, 480, 1.25]], shake: [[1.6, 18]], hand: 2,
  },
  // "Behind it, a dark staircase... no switch... phone flashlights, and we started down"
  {
    at: 372.4, plate: "stairs-down", L: [{ n: "stairs-cast", p: 1.15, dy: [[0, 0], [8.4, 60]], sc: [[0, 1], [8.4, 0.94]], ox: 800, oy: 900 }],
    dark: { n: "stairs-down-dark", holes: [[[0, 700, 700, 1], [5, 700, 700, 1], [5.8, 620, 600, 420], [8.4, 760, 420, 400]], [[0, 900, 700, 1], [5.4, 900, 700, 1], [6.2, 1000, 620, 360], [8.4, 860, 380, 380]]] },
    cn: [[0, 800, 450, 1.08], [1, 800, 420, 1.2]], hand: 3,
  },
  // "At the bottom a short corridor, and at its end another door. Steel."
  { at: 380.8, plate: "corridor-lit", dark: { n: "corridor-dark", holes: [[[0, 500, 700, 300], [3, 700, 520, 380], [7.7, 805, 480, 420]]] }, cn: [[0, 800, 470, 1.05], [1, 805, 460, 1.3]], hand: 3 },
  // "Tyler started kicking it. Once, twice, three times... then the shoulder... collapsed, cursing"
  {
    at: 388.5, plate: "corridor-lit",
    L: [
      { n: "corr-kick2", to: 2.7 },
      { n: "corr-kick", from: 2.7, to: 3.3 }, { n: "corr-kick2", from: 3.3, to: 3.7 },
      { n: "corr-kick", from: 3.7, to: 4.3 }, { n: "corr-kick2", from: 4.3, to: 4.6 },
      { n: "corr-kick", from: 4.6, to: 5.3 }, { n: "corr-kick2", from: 5.3, to: 7.6 },
      { n: "corr-shoulder", from: 7.6, to: 8.3, dx: [[7.6, -40], [8.1, 0]] }, { n: "corr-kick2", from: 8.3, to: 9.4 },
      { n: "corr-shoulder", from: 9.4, to: 10.2, dx: [[9.4, -40], [9.9, 0]] }, { n: "corr-kick2", from: 10.2, to: 10.9 },
      { n: "corr-shoulder", from: 10.9, to: 11.6, dx: [[10.9, -40], [11.4, 0]] },
      { n: "corr-down", from: 11.6 },
    ],
    cn: [[0, 720, 500, 1.3], [0.6, 700, 500, 1.35], [1, 760, 540, 1.15]],
    shake: [[2.75, 9], [3.75, 9], [4.65, 10], [8.05, 12], [9.85, 12], [11.35, 14], [11.8, 6]], hand: 2,
  },
  // "I was about to suggest we give up... I went to the door and tried the handle."
  { at: 402.6, plate: "corridor-lit", L: [{ n: "corr-down" }], cn: [[0, 800, 520, 1.12], [1, 805, 470, 1.45]], hand: 2 },
  { at: 408.9, plate: "handle", cam: [[0, 760, 470, 1.15], [3.9, 740, 470, 1.25], [5, 760, 480, 1.25]], shake: [[4.1, 6]] },
  // "It opened. 'What the hell? Why didn't you tell me it was unlocked?' He shoved me aside and went in."
  { at: 413.9, plate: "corridor-open", L: [{ n: "corr-down", to: 3.2 }], cn: [[0, 805, 480, 1.35], [1, 805, 470, 1.55]], shake: [[5.8, 8]], hand: 2 },
  // "A small cramped room. Glass display cases along the walls, paintings between them."
  { at: 421.1, plate: "coin-lit", dark: { n: "coin-dark", holes: [[[0, 300, 450, 320], [3.5, 260, 400, 380], [7.5, 1300, 420, 400]]] }, cn: [[0, 620, 450, 1.15], [1, 950, 450, 1.15]], hand: 3, fx: [{ t: "fog", op: 0.08, speed: 6 }] },
  // "Tyler shone his phone inside, and his eyes lit up."
  { at: 428.6, plate: "coin-lit", L: [{ n: "coin-tyler" }], dark: { n: "coin-dark", holes: [[[0, 1250, 470, 360], [5.8, 1270, 480, 420]]] }, cn: [[0, 1150, 470, 1.3], [1, 1220, 480, 1.55]], hand: 2 },
  // "The case was full of rare coins. 'Bingo!' He started shoving coins into his bag."
  { at: 434.4, plate: "coins", L: [{ n: "coins-hand", from: 4.0, dx: [[4, 200], [4.8, 0], [5.6, 60], [6.3, -20], [7, 80], [7.6, 0], [8.5, 40]], dy: [[4, 160], [4.8, 0], [5.6, 50], [6.3, -10], [7, 60], [8.5, 20]] }], cn: [[0, 820, 430, 1.08], [1, 860, 470, 1.25]], fx: [{ t: "glint", pts: [[480, 290], [820, 440], [1130, 590], [660, 740], [1290, 290]], every: 1.8 }], hand: 2 },
  // "I walked around the room, and the more I lit up the walls, the less I liked it."
  { at: 442.9, plate: "coin-lit", L: [{ n: "coin-cast" }], dark: { n: "coin-dark", holes: [[[0, 1250, 470, 260], [6.5, 1250, 470, 260]], [[0, 520, 420, 300], [3, 300, 360, 340], [6.5, 140, 420, 360]]] }, cn: [[0, 700, 450, 1.15], [1, 480, 440, 1.3]], hand: 3 },
  // "The paintings showed torture... a small boy lowered head-first into a giant vat of boiling oil"
  { at: 449.4, plate: "painting-oil", dark: { n: "photos-dark", holes: [[[0, 400, 300, 420], [6, 600, 380, 520], [12, 800, 440, 560], [17.1, 800, 460, 600]]] }, cn: [[0, 700, 400, 1.15], [1, 800, 440, 1.35]], hand: 2 },
  // "In another, a woman roasted over an open fire, skewered like a pig."
  { at: 466.5, plate: "painting-fire", dark: { n: "photos-dark", holes: [[[0, 800, 600, 380], [5.5, 820, 520, 560]]] }, cn: [[0, 800, 560, 1.25], [1, 800, 500, 1.4]], hand: 2, fx: [{ t: "light", x: 800, y: 620, r: 500, c: "rgba(230,110,40,0.22)", op: 1, flick: 0.6 }] },
  // "'Uh... Tyler?' My heart started pounding. 'Shut up and do something useful.'"
  { at: 472.0, plate: "coin-lit", L: [{ n: "coin-cast" }], dark: { n: "coin-dark", holes: [[[0, 1250, 470, 300], [7.4, 1250, 470, 300]], [[0, 160, 420, 320], [7.4, 400, 470, 320]]] }, cn: [[0, 500, 450, 1.3], [1, 900, 460, 1.2]], fx: [{ t: "heart", bpm: 110, a: 0.45 }], hand: 3 },
  // "It was full of photographs. Dozens of young men, tied up..."
  { at: 479.4, plate: "photos", dark: { n: "photos-dark", holes: [[[0, 1100, 300, 1], [2, 1100, 300, 1], [3.5, 1000, 320, 380], [8, 600, 380, 420], [13, 1100, 560, 440], [18, 500, 600, 460], [21.4, 800, 450, 520]]] }, cn: [[0, 900, 380, 1.3], [1, 760, 480, 1.15]], fx: [{ t: "tint", c: "#5a0a10", op: [[0, 0], [21, 0.25]], blend: "multiply" }], hand: 2.5 },
  // "I turned slowly toward Tyler. I opened my mouth, but nothing came out."
  { at: 500.8, plate: "coin-lit", L: [{ n: "coin-cast" }], dark: { n: "coin-dark", holes: [[[0, 1250, 470, 300], [11.8, 1250, 470, 300]]] }, cn: [[0, 700, 460, 1.15], [1, 1150, 470, 1.5]], fx: [{ t: "heart", bpm: 128, a: 0.6 }], hand: 1.5 },
  // "Then I heard footsteps on the stairs."
  { at: 512.6, plate: "stairs-up", cam: [[0, 800, 400, 1.2], [2.2, 800, 390, 1.28]], fx: [{ t: "shadow", k: [[0, 800, 150, 200], [0.6, 800, 150, 220], [2.2, 820, 360, 300]] }] },
  // "'Tyler, we have to go, now!' ... 'Tom! Chris! Finally, you clowns! We found treasure... let's light a joint and—'"
  { at: 514.8, plate: "coin-lit", L: [{ n: "coin-shout", jit: [[4, 0], [5, 1.5]] }], dark: { n: "coin-dark", holes: [[[0, 1000, 420, 380], [16.8, 900, 400, 420]]] }, cn: [[0, 700, 480, 1.2], [1, 900, 460, 1.3]], hand: 3 },
  // "The ceiling light snapped on. We were blinded... a faint sob. I opened my eyes."
  { at: 531.6, plate: "coin-ceil", L: [{ n: "coin-shout" }], cn: [[0, 800, 450, 1.08], [1, 800, 440, 1.14]], fx: [{ t: "tint", c: "#ffffff", op: [[0, 1], [0.3, 0.92], [2.6, 0.6], [7, 0.35], [9.6, 0.05], [10.6, 0]] }] },

  /* ====================== ACT III: Mr. G ====================== */
  // "Behind Tom and Chris stood a big man, very fat... on Chris's face there was blood. A lot of blood."
  { at: 542.2, plate: "door-plate", L: [{ n: "door-g", br: 1.2 }, { n: "door-boys", jit: 0.6 }], cn: [[0, 800, 470, 1.04], [1, 790, 430, 1.32]], fx: [{ t: "drip", x: 700, y0: 600, y1: 850, every: 1.7 }] },
  // "Then I saw his eyes, or rather where they should have been. Two dark, empty holes."
  { at: 552.6, plate: "blood-floor", cn: [[0, 800, 430, 1.1], [1, 800, 480, 1.3]], fx: [{ t: "drip", x: 820, y0: -20, y1: 500, every: 1.3 }, { t: "drip", x: 760, y0: -20, y1: 470, every: 1.9, phase: 0.6 }, { t: "tint", c: "#3e070c", op: [[0, 0], [10, 0.2]], blend: "multiply" }] },
  // "Tyler drew himself up. 'Who the hell are you?' ... The fat man shoved Tom at us."
  {
    at: 563.2, plate: "door-plate", L: [{ n: "door-g", br: 1 }, { n: "door-boys", to: 5.6 }, { n: "door-tom-shoved", from: 5.6, dx: [[5.6, -60], [6.3, 0]] }, { n: "door-tyler", p: 1.2, jit: 0.8 }],
    cn: [[0, 700, 470, 1.15], [1, 760, 460, 1.1]], shake: [[5.7, 10]],
  },
  // "Then he laid a hand on Chris's shoulder. 'Chris, why don't you tell your young friend...'"
  { at: 571.6, plate: "g-hand", cn: [[0, 820, 420, 1.06], [1, 900, 380, 1.28]], hand: 1 },
  // "Chris opened his mouth. A strange gurgle came out. Blood ran from his lips."
  { at: 580.6, plate: "blood-floor", cn: [[0, 800, 380, 1.3], [1, 800, 460, 1.45]], fx: [{ t: "drip", x: 800, y0: -20, y1: 500, every: 0.9 }, { t: "drip", x: 840, y0: -20, y1: 520, every: 1.4, phase: 0.5 }, { t: "tint", c: "#3e070c", op: 0.2, blend: "multiply" }] },
  // "Tom stood beside us, tears running down. 'He cut out Chris's tongue. And his eyes.'"
  { at: 588.2, plate: "tom-cry", cn: [[0, 760, 450, 1.08], [1, 700, 420, 1.24]], hand: 1, shake: [[5.2, 3], [6.4, 3]] },
  // "'Ha-ha, Tom is quite right... Chris behaves much better now.' He patted Chris's head."
  { at: 596.2, plate: "g-hand-head", cn: [[0, 800, 420, 1.08], [1, 820, 360, 1.25]], shake: [[0.2, 4], [0.8, 4], [1.4, 4], [9.4, 6], [10.2, 6], [11, 6]], hand: 1.5 },
  // "'Now, which of you can explain what nice young men are doing in my house?' Tyler raised his fists."
  { at: 608.5, plate: "door-plate", L: [{ n: "door-g", br: 1 }, { n: "door-boys" }, { n: "door-tyler", p: 1.2, dy: [[8.4, 30], [9.8, 0]] }], cn: [[0, 800, 380, 1.3], [0.6, 800, 400, 1.25], [1, 700, 470, 1.1]] },
  // "The man chuckled. His fat cheeks trembled. Then he pulled a gun."
  { at: 623.1, plate: "g-low", cam: [[0, 800, 380, 1.1], [6.3, 820, 420, 1.25]], shake: [[0.4, 4], [0.9, 4], [1.4, 4], [2, 3], [2.5, 3], [4.6, 6]], hand: 1 },
  // "Tyler froze... 'You can't touch me! My father is a powerful man!'"
  { at: 629.4, plate: "door-plate", L: [{ n: "door-g", br: 1 }, { n: "door-boys" }, { n: "door-tyler", p: 1.2, jit: [[0, 0.5], [3, 2.5]] }], cn: [[0, 520, 480, 1.35], [1, 600, 470, 1.25]] },
  // "The man laughed again, pressed the gun to the back of Chris's head, and fired."
  { at: 637.5, plate: "exec", cam: [[0, 820, 450, 1.05], [5.6, 760, 420, 1.2]], hand: 0.8, shake: [[0.3, 3], [0.8, 3]] },
  // "Blood and bone sprayed over Tyler. Chris collapsed. None of us moved."
  { at: 643.1, plate: "splatter", cn: [[0, 760, 420, 1.15], [1, 740, 500, 1.25]], shake: [[0, 22]], fx: [{ t: "flash", at: 0, d: 0.45 }, { t: "tint", c: "#7c1119", op: [[0, 0.5], [1.5, 0.12], [6.8, 0.08]], blend: "multiply" }], hand: 0.5 },
  // "You can call me Mr. G. From now on you do exactly what I say."
  { at: 649.9, plate: "g-low", cn: [[0, 820, 450, 1.05], [1, 820, 300, 1.3]], hand: 0.8 },
  // "'You. Take down the painting behind you and turn the knob.'"
  { at: 656.7, plate: "knob", cn: [[0, 800, 450, 1.08], [1, 810, 450, 1.3]], hand: 2 },
  // "I did what he said. Behind the painting was a small knob. I turned it."
  { at: 662.9, plate: "knob-lifted", cam: [[0, 820, 460, 1.2], [3.5, 805, 455, 1.7], [6, 805, 455, 1.75]], shake: [[4.6, 4]] },
  // "Part of the wall swung open... a secret room, large and round."
  { at: 668.9, plate: "wall-open", cn: [[0, 800, 450, 1.05], [1, 800, 430, 1.2]], shake: [[0, 8]], fx: [{ t: "fog", op: 0.12, speed: 5, y: 300 }] },
  // "'Go on, guys, move.' The three of us went in, the fat man right behind us."
  { at: 675.1, plate: "wall-open", L: [{ n: "wall-enter", sc: [[0, 1], [8.9, 0.9]], ox: 800, oy: 880, dy: [[0, 0], [8.9, -30]] }], cn: [[0, 800, 450, 1.1], [1, 800, 430, 1.16]] },
  // "In the middle of the room stood a stainless-steel operating table..."
  { at: 684.0, plate: "chamber-lamp", L: [{ n: "ch-enter" }], cam: [[0, C.table, 460, 1.45], [10, C.table + 200, 500, 1.0]], fx: [{ t: "fog", op: 0.1, speed: 5 }], tr: "fade", trd: 0.4 },
  // "A rack. A chair with a metal spike. An iron maiden. A huge metal vat over a gas burner."
  {
    at: 694.0, plate: "chamber-reveal", dark: { n: "chamber-dark", holes: [[[0, C.rack, 560, 380], [1.3, C.rack, 560, 380], [1.8, C.chair, 560, 360], [4.6, C.chair, 560, 380], [5.2, C.maiden, 520, 460], [9.4, C.maiden, 520, 480], [10, C.vat, 520, 460], [14, C.vat, 520, 480]]] },
    cam: [[0, C.rack, 500, 1.3], [1.3, C.rack, 500, 1.3], [1.9, C.chair, 500, 1.3], [4.6, C.chair, 500, 1.3], [5.3, C.maiden + 250, 480, 1.25], [9.4, C.maiden + 250, 480, 1.25], [10.2, C.vat, 470, 1.25], [14, C.vat, 470, 1.3]],
  },
  // "On a wooden table: knives, hammers, scalpels and saws."
  { at: 708.0, plate: "tools", cn: [[0, 500, 560, 1.3], [1, 1100, 560, 1.3]], fx: [{ t: "glint", pts: [[430, 690], [720, 700], [1150, 640], [1300, 680]], every: 1.6 }] },
  // "Mr. G took a black plastic comb from his pocket and combed back his dark, greasy hair."
  {
    at: 715.0, plate: "comb-down",
    L: [{ n: "comb-up", from: 4.6, to: 5.4 }, { n: "comb-up", from: 6.2, to: 7.0 }, { n: "comb-up", from: 7.8, to: 8.5 }],
    cn: [[0, 700, 420, 1.12], [1, 660, 380, 1.22]], hand: 1,
  },
  // "All the while the gun stayed on Tyler. 'So, how do we go on from here?'"
  { at: 723.5, plate: "chamber-lamp", L: [{ n: "ch-comb" }], cn: [[0, C.table - 150, 500, 1.35], [1, C.table - 50, 500, 1.25]] },
  // "He put the comb away. 'Tyler, only one of you leaves my house tonight. Who should it be?'"
  { at: 730.2, plate: "chamber-lamp", L: [{ n: "ch-stand", jit: [[5, 0], [9.6, 1.2]] }], cn: [[0, C.table - 100, 480, 1.2], [1, C.table - 60, 440, 1.4]] },
  // "A dark stain spread across Tyler's jeans. The smell of urine filled the room."
  { at: 739.8, plate: "legs", L: [{ n: "stain", sc: [[0, 0.05], [5.5, 1]], ox: 800, oy: 0 }], cn: [[0, 800, 380, 1.1], [1, 800, 420, 1.2]], hand: 1 },
  // "He raised a shaking hand and pointed at me and Tom. 'Them! It was all their idea!'"
  { at: 745.8, plate: "chamber-lamp", L: [{ n: "ch-point", jit: 1 }], cn: [[0, C.table + 150, 500, 1.4], [0.5, C.table + 250, 500, 1.3], [1, C.table + 400, 480, 1.5]] },
  // "Mr. G frowned... then smiled. 'I believe you, Tyler... There's rope on the wooden table.'"
  { at: 762.6, plate: "chamber-lamp", L: [{ n: "ch-stand", br: 1 }], cn: [[0, C.table - 330, 400, 1.55], [0.7, C.table - 300, 400, 1.6], [1, C.tools - 100, 520, 1.2]] },
  // "Relief spread over Tyler's face... he almost ran to the table for the rope... Mr. G winked at us."
  { at: 779.9, plate: "chamber-lamp", L: [{ n: "ch-rope", dx: [[0, -280], [5, 0]] }], cn: [[0, C.table + 200, 500, 1.15], [0.5, C.tools - 200, 500, 1.2], [1, C.table - 100, 460, 1.4]] },
  // "Tyler came back with the rope... 'Yes, yes, I'm sure you did.' Then a small stun gun."
  {
    at: 796.2, plate: "chamber-lamp", L: [{ n: "ch-offer", to: 17.7 }, { n: "ch-stunned", from: 17.7 }],
    cam: [[0, C.table - 120, 420, 1.45], [12, C.table - 100, 410, 1.55], [15.5, C.table - 90, 410, 1.6], [22.4, C.table - 60, 520, 1.35]],
    fx: [{ t: "arc", from: 15.0, to: 17.6, x: C.table - 30, y: 520 }], shake: [[15.0, 10], [17.7, 8]],
  },
  // "He bent down and tied Tyler's hands and feet."
  { at: 818.6, plate: "chamber-lamp", L: [{ n: "ch-stunned" }], cn: [[0, C.table - 120, 500, 1.4], [1, C.table - 100, 510, 1.5]] },
  // "He dragged the limp body to the big metal vat... tied Tyler's hand to the hook."
  { at: 822.8, plate: "chamber-lamp", L: [{ n: "ch-drag", dx: [[0, -100], [10, 120]] }], cn: [[0, C.vat - 520, 520, 1.25], [1, C.vat - 200, 480, 1.25]] },
  // "Then he bent down and lit the gas burner. 'Let's cook some soup.'"
  {
    at: 837.1, plate: "vat-off", L: [{ n: "vat-on", from: 1.9, op: [[1.9, 0], [2.4, 1]] }, { n: "vathand-limp" }],
    cn: [[0, 800, 560, 1.3], [1, 800, 480, 1.15]], shake: [[1.9, 6]], fx: [{ t: "flash", at: 1.9, d: 0.3, c: "#6aa8f0", peak: 0.35 }],
  },
  // "He said it almost to himself, as if he were making dinner."
  { at: 844.3, plate: "chamber-fire", L: [{ n: "ch-cook", br: 0.8 }], cn: [[0, C.vat + 40, 480, 1.4], [1, C.vat, 460, 1.5]], fx: [{ t: "steam", x: C.vat, y: 380, w: 300, op: 0.4 }] },
  // "Mr. G came back to me and Tom. He smiled. 'Well, who's next?'"
  { at: 849.6, plate: "g-approach-fire", cn: [[0, 780, 480, 1.05], [1, 760, 340, 1.4]], hand: 1 },
  // "Tom and I looked at each other. Neither of us said a word."
  { at: 856.1, plate: "chamber-fire", L: [{ n: "ch-next" }], cn: [[0, C.tools + 40, 560, 1.6], [1, C.tools + 40, 560, 1.7]], hand: 1 },
  // "Across the room Tyler began to wake... 'Please! Get me out! It's getting hot! It burns!'"
  {
    at: 861.4, plate: "vat-on", L: [{ n: "vathand-limp", to: 5.6 }, { n: "vathand-fist", from: 5.6, to: 10.6, jit: 2 }, { n: "vathand-claw", from: 10.6, jit: [[10.6, 2], [15.5, 5]] }],
    cn: [[0, 800, 420, 1.15], [1, 800, 330, 1.4]], fx: [{ t: "steam", x: 800, y: 300, w: 500, op: [[0, 0.2], [15, 0.55]] }, { t: "light", x: 800, y: 760, r: 500, c: "rgba(90,150,240,0.3)", op: 1, flick: 0.6 }],
  },
  // "Mr. G ignored him. He stood in front of us, humming... deciding which of us was next."
  { at: 876.9, plate: "chamber-fire", L: [{ n: "ch-next", br: 0.8 }], cn: [[0, C.table + 260, 400, 1.5], [0.6, C.table + 260, 400, 1.55], [1, C.table + 520, 470, 1.35]] },
  // "His begging turned to screaming... until one single scream was left... and in the end, it stopped."
  {
    at: 888.8, plate: "vat-hot", L: [{ n: "vathand-claw", to: 17.8, jit: [[0, 4], [12, 6], [17.8, 2]] }, { n: "vathand-limp", from: 17.8 }],
    cam: [[0, 800, 420, 1.15], [20.4, 800, 300, 1.55]], hand: 1,
    fx: [{ t: "steam", x: 800, y: 320, w: 600, op: [[0, 0.5], [16, 0.8]] }, { t: "light", x: 800, y: 760, r: 600, c: "rgba(230,120,40,0.3)", op: 1, flick: 0.7 }, { t: "tint", c: "#5a0a10", op: [[0, 0], [18, 0.3]], blend: "multiply" }, { t: "black", op: [[17, 0], [19.5, 0.45], [20.4, 0.45]] }],
  },
  // "The smell of cooked meat filled the room. Mr. G went to the vat and turned off the gas."
  { at: 909.2, plate: "vat-hot", L: [{ n: "vat-off", op: [[4, 0], [5.5, 1]] }, { n: "vathand-limp" }], cn: [[0, 800, 600, 1.35], [1, 800, 560, 1.3]], fx: [{ t: "steam", x: 800, y: 320, w: 600, op: [[0, 0.6], [6.6, 0.3]] }, { t: "tint", c: "#5a0a10", op: 0.25, blend: "multiply" }] },
  // "Without warning, Tom jumped up and ran for the door. Mr. G cursed, drew, aimed and fired."
  {
    at: 915.8, plate: "chamber-lamp", L: [{ n: "ch-run", to: 11.5, dx: [[0, -180], [10.1, 140]] }, { n: "ch-tomdown", from: 11.5 }],
    cam: [[0, C.tools - 200, 500, 1.25], [10, C.tools - 300, 500, 1.1], [19.5, C.tools - 260, 520, 1.25]],
    fx: [{ t: "muzzle", at: [10.2], x: C.table - 200 + 260, y: 360 }], shake: [[10.2, 20], [11.5, 8]], hand: 4,
  },
  // "Mr. G walked over, grabbed him with both hands and dragged him toward the operating table."
  { at: 935.3, plate: "chamber-lamp", L: [{ n: "ch-haul", dx: [[0, 160], [7.4, 0]] }], cn: [[0, C.table + 600, 500, 1.3], [1, C.table + 450, 500, 1.3]], hand: 3 },
  // "Then he looked at me. 'What a peeping Tom you are! I'm going to give you a show!'"
  { at: 942.7, plate: "g-approach", cn: [[0, 800, 380, 1.15], [1, 800, 320, 1.35]], hand: 1, shake: [[4.4, 4], [5, 4]] },
  // "They were about three metres from the table. That was the moment I decided to act."
  { at: 949.1, plate: "chamber-lamp", L: [{ n: "ch-haul" }], cn: [[0, C.table + 300, 480, 1.1], [1, C.table + 300, 500, 1.3]], fx: [{ t: "heart", bpm: 140, a: 0.5 }] },
  // "...and I started running, straight at the monster in the middle of the room."
  { at: 955.6, plate: "g-approach", cam: [[0, 800, 520, 1.0], [6.9, 800, 330, 1.45]], hand: 12, fx: [{ t: "heart", bpm: 160, a: 0.5 }] },
  // "Mr. G let go of Tom and drew the gun. He started shooting... I didn't hear anything."
  {
    at: 962.5, plate: "g-shoot", cn: [[0, 800, 470, 1.15], [1, 820, 430, 1.5]], hand: 6,
    fx: [{ t: "muzzle", at: [3.4, 4.1, 4.9, 6.2, 7.9, 9.6, 11.4, 13.2], x: 1430, y: 470 }, { t: "tint", c: "#101820", op: [[5, 0], [8, 0.35], [16, 0.4]], blend: "normal" }],
    shake: [[3.4, 6], [4.1, 6], [4.9, 6], [6.2, 4], [7.9, 4], [9.6, 4], [11.4, 4], [13.2, 4]],
  },
  // "My shoulder slammed into the fat man's belly... I pushed him back, step by step..."
  {
    at: 978.9, plate: "chamber-lamp",
    L: [{ n: "ch-tackle1", to: 5.5, dx: [[0, 60], [5.5, -60]] }, { n: "ch-tackle2", from: 5.5, to: 11.1, dx: [[5.5, 80], [11.1, -60]] }, { n: "ch-tackle3", from: 11.1, dx: [[11.1, 80], [19.8, -40]] }],
    cam: [[0, C.table - 220, 420, 1.12], [5.5, C.table - 320, 420, 1.12], [11.1, C.rack + 20, 420, 1.12], [19.8, C.chair + 20, 420, 1.15]],
    shake: [[0, 26], [5.5, 10], [8, 8], [11.1, 10], [14, 8], [16.8, 10]], hand: 5,
  },
  // "...until his body crashed into the iron maiden. Its doors were open. I let go of him."
  { at: 998.7, plate: "im-open", L: [{ n: "im-g", dy: [[0, -40], [0.6, 0]], jit: [[0.6, 4], [2, 0]] }, { n: "im-push", from: 4.0, dx: [[4, 120], [6.2, 0]] }], cn: [[0, 800, 460, 1.2], [1, 820, 470, 1.1]], shake: [[0.6, 26]] },
  // "I grabbed one of the doors and pushed. Heavy... I heard him gasp. The iron spikes began to go in."
  { at: 1004.9, plate: "im-half", L: [{ n: "im-g-half", jit: 1.5 }, { n: "im-push", jit: 2 }], cn: [[0, 850, 460, 1.15], [1, 820, 440, 1.3]], shake: [[3.2, 8], [6.3, 8], [9.2, 10], [11.4, 6]] },
  // "But he didn't scream. He started to laugh... louder and louder..."
  {
    at: 1017.5, plate: "im-half", L: [{ n: "im-g-half", to: 6.0, jit: [[0, 2], [6, 5]] }, { n: "im-near", from: 6.0, jit: [[6, 3], [13.2, 6]] }, { n: "im-push", p: 1.05, jit: 2 }],
    cn: [[0, 800, 440, 1.3], [1, 800, 420, 1.55]], shake: [[6.0, 12], [9, 6], [11, 6], [12.5, 6]], fx: [{ t: "tint", c: "#5a0a10", op: [[0, 0.05], [13, 0.25]], blend: "multiply" }],
  },
  // "...until I closed them completely, the spikes sank deep, and the laughter went on."
  { at: 1030.7, plate: "im-closed", L: [{ n: "im-push", jit: 1 }], cn: [[0, 800, 430, 1.45], [1, 800, 450, 1.3]], shake: [[0.3, 22], [2.4, 5], [3.4, 5], [4.4, 5], [5.4, 4], [6.4, 3]] },
  // "And then... silence."
  { at: 1038.4, plate: "im-closed", cn: [[0, 800, 470, 1.15], [1, 800, 470, 1.18]], hand: 0.3, fx: [{ t: "black", op: [[0, 0.1], [4, 0.35]] }] },
  // "I turned to Tom... put his arm over my shoulder, and we limped to the door. I didn't look back."
  { at: 1042.4, plate: "chamber-lamp", L: [{ n: "ch-leave", dx: [[0, -160], [14.5, 120]], br: 1 }], cn: [[0, C.tools, 500, 1.3], [1, C.tools + 200, 480, 1.35]], tr: "fade", trd: 0.6 },
  // "We climbed the basement stairs slowly. We got out of the house and called the police."
  { at: 1056.9, plate: "stairs-up", L: [{ n: "stairs-exit", sc: [[0, 1.1], [4.7, 0.82]], ox: 800, oy: 760, dy: [[0, 60], [4.7, -40]] }], cn: [[0, 800, 450, 1.08], [1, 800, 400, 1.15]] },
  // "When the police arrived..."
  { at: 1061.6, plate: "house-police", cn: [[0, 800, 450, 1.05], [1, 800, 430, 1.12]], fx: [{ t: "police" }, { t: "fog", op: 0.12 }] },
  // "...they found a large freezer behind the torture chamber. Inside were twelve more bodies."
  { at: 1063.0, plate: "freezer", cn: [[0, 800, 450, 1.05], [1, 800, 450, 1.25]], fx: [{ t: "police" }], out: 0.8 },

  /* ====================== ACT IV: after ====================== */
  // "For years after that night I was broken. Every sudden noise made me jump."
  { at: 1069.3, plate: "inst-room", L: [{ n: "inst-narr", br: 0.4 }], cn: [[0, 760, 500, 1.12], [1, 700, 540, 1.22]], tr: "fade", trd: 0.8, shake: [[3.8, 5]] },
  // "Every time I closed my eyes I was back in that basement."
  { at: 1075.1, plate: "chamber-reveal", dark: { n: "chamber-dark", holes: [[[0, C.maiden, 520, 420], [3, C.maiden, 520, 480]]] }, cam: [[0, C.maiden + 250, 480, 1.2], [3, C.maiden + 250, 470, 1.35]], tr: "flash" },
  // "I couldn't sleep. I couldn't function."
  { at: 1078.1, plate: "inst-room", L: [{ n: "inst-narr" }], cn: [[0, 700, 540, 1.25], [1, 680, 560, 1.32]], hand: 0.6 },
  // "Only after intensive therapy did I get back to something like a normal life. Sort of."
  { at: 1082.0, plate: "inst-corr", L: [{ n: "inst-walk", sc: [[0, 1.15], [6.8, 0.9]], ox: 800, oy: 700, dy: [[0, 40], [6.8, -10]] }], cn: [[0, 800, 450, 1.05], [1, 800, 440, 1.15]], tr: "xfade", trd: 0.8 },
  // "My friends' deaths were terrible, of course."
  { at: 1088.8, plate: "carview-house", L: [{ n: "car-frame", p: 1.08 }], cn: [[0, 800, 450, 1.05], [1, 800, 440, 1.12]], tr: "xfade", trd: 0.8, fx: [{ t: "tint", c: "#0a1018", op: 0.3 }] },
  // "Chris, Tyler..."
  { at: 1091.8, plate: "field-bg", cn: [[0, 1100, 470, 1.15], [1, 1150, 470, 1.15]], tr: "xfade", trd: 0.8, fx: [{ t: "tint", c: "#0a1018", op: 0.3 }] },
  // "everything that happened to them, everything I could have done differently."
  { at: 1094.9, plate: "coin-lit", dark: { n: "coin-dark", holes: [[[0, 1250, 470, 300], [2.1, 1150, 470, 320]]] }, cn: [[0, 1100, 470, 1.25], [1, 1050, 470, 1.3]], tr: "xfade", trd: 0.6 },
  // "I think about it to this day."
  { at: 1097.0, plate: "kitchen-bg", cn: [[0, 1040, 520, 1.3], [1, 1040, 520, 1.36]], tr: "xfade", trd: 0.6, fx: [{ t: "tint", c: "#0a1018", op: 0.25 }] },
  // "But something else won't leave me... Mr. G's laughter, in the last moments of his life."
  { at: 1099.8, plate: "chamber-reveal", dark: { n: "chamber-dark", holes: [[[0, C.maiden, 520, 300], [11.3, C.maiden, 500, 440]]] }, cam: [[0, C.maiden + 300, 500, 1.15], [11.3, C.maiden + 260, 480, 1.4]], tr: "fade", trd: 1.2, hand: 0.6 },
  // "Every night when I close my eyes, I see him... his fat cheeks shaking every time he laughs."
  { at: 1111.1, plate: "g-approach", cn: [[0, 800, 380, 1.3], [1, 800, 300, 1.55]], tr: "fade", trd: 1.0, hand: 0.6, shake: [[6.5, 3], [7.1, 3], [7.7, 3], [8.3, 3], [8.9, 3], [9.5, 3]] },
  // "I see the iron spikes closing on him, and I hear him laughing... the funniest thing he ever saw."
  { at: 1121.5, plate: "final", cn: [[0, 800, 450, 1.05], [1, 800, 470, 1.32]], tr: "fade", trd: 1.5, out: 2.2, hand: 0.4 },
];
