import type { Look } from "./Person";

/**
 * Every recurring person in the film. Scenes spread these into <Person>, so
 * a wardrobe or hairline change is one edit.
 *
 * Gacy is drawn as an ordinary heavyset man in his thirties: no sinister
 * styling, no shadows under the eyes. The discomfort is supposed to come
 * from what the viewer knows, not from how he is drawn.
 */

const GACY_BASE: Look = {
  build: "stocky",
  skin: "#e3b692",
  hair: "gacy",
  hairColor: "#2b1f17",
  jowls: 1.4,
  shoes: "#2a2019",
  age: 36,
};

export const GACY: Look = {
  ...GACY_BASE,
  top: "#7a6147",
  topTrim: "#8d7456",
  shirt: "#e9dcc3",
  pants: "#4a4238",
};

export const GACY_WORK: Look = {
  ...GACY_BASE,
  top: "#58634e",
  shirt: "#d9cfb9",
  pants: "#3d4651",
  belt: "#2a2016",
};

export const GACY_SUIT: Look = {
  ...GACY_BASE,
  top: "#3b3f44",
  jacket: true,
  topTrim: "#2f3337",
  shirt: "#eae4d8",
  tie: "#5a3a34",
  pants: "#34383d",
  shoes: "#151311",
};

export const GACY_MANAGER: Look = {
  ...GACY_BASE,
  jowls: 1,
  top: "#e7e0d0",
  shirt: "#f1ece2",
  tie: "#6b2f2a",
  pants: "#3c3a36",
  sleeves: "short",
};

export const GACY_PRISON: Look = {
  ...GACY_BASE,
  top: "#6f8296",
  shirt: "#7d90a4",
  pants: "#3b4656",
};

export const GACY_COAT: Look = {
  ...GACY_BASE,
  top: "#3e3a35",
  jacket: true,
  topTrim: "#34302b",
  shirt: "#d8cdb8",
  pants: "#34383d",
  coat: 64,
};

export const POGO: Look = {
  ...GACY_BASE,
  hair: "curly",
  hairColor: "#7a2a22",
  clown: true,
  top: "#b83a32",
  shirt: "#f4efe4",
  pants: "#b83a32",
  shoes: "#1b1b1d",
};

export const ROBERT: Look = {
  build: "slim",
  skin: "#eac19e",
  hair: "mop",
  hairColor: "#6b4a2e",
  top: "#8fb2c4",
  topTrim: "#7ea3b6",
  shirt: "#efe9dd",
  pants: "#3a4658",
  shoes: "#2c2620",
  coat: 38,
  age: 15,
};

export const ROBERT_PARKA: Look = {
  ...ROBERT,
  top: "#4f6146",
  topTrim: "#465740",
  coat: 46,
};

export const MOTHER: Look = {
  fem: true,
  build: "average",
  skin: "#e6ba98",
  hair: "bob",
  hairColor: "#4a3526",
  top: "#6e4a42",
  shirt: "#e6d8c4",
  pants: "#3a3230",
  skirt: "#6e4a42",
  coat: 92,
  shoes: "#2a201c",
  age: 45,
};

export const FATHER: Look = {
  build: "average",
  skin: "#dfb08c",
  hair: "receding",
  hairColor: "#4a3a2c",
  top: "#4e4a44",
  jacket: true,
  shirt: "#dcd2c0",
  pants: "#3a3834",
  coat: 60,
  age: 50,
};

export const OWNER: Look = {
  build: "average",
  skin: "#e2b898",
  hair: "receding",
  hairColor: "#8a847a",
  glasses: true,
  top: "#f2efe8",
  shirt: "#dfe6ea",
  tie: "#44506a",
  pants: "#454a50",
  coat: 60,
  age: 60,
};

export const DETECTIVE: Look = {
  build: "average",
  skin: "#d8a888",
  hair: "short",
  hairColor: "#3a2c22",
  mustache: true,
  top: "#6a5a46",
  jacket: true,
  topTrim: "#5b4c3b",
  shirt: "#e6ddc9",
  tie: "#3e3a44",
  pants: "#433d36",
  age: 42,
};

export const DETECTIVE_2: Look = {
  build: "slim",
  skin: "#c79874",
  hair: "short",
  hairColor: "#1e1814",
  glasses: true,
  top: "#48505a",
  jacket: true,
  topTrim: "#3d444d",
  shirt: "#d9dde0",
  tie: "#6a4a3a",
  pants: "#383c42",
  age: 35,
};

export const OFFICER: Look = {
  build: "average",
  skin: "#dcae8c",
  hair: "short",
  hairColor: "#2a221c",
  top: "#2c3a52",
  shirt: "#26334a",
  pants: "#222b3a",
  badge: true,
  belt: "#141414",
  shoes: "#111",
  age: 30,
};

export const OFFICER_2: Look = {
  ...OFFICER,
  build: "stocky",
  skin: "#b8876a",
  hair: "buzz",
  hairColor: "#1a1512",
  mustache: true,
};

export const OFFICER_COAT: Look = {
  ...OFFICER,
  coat: 56,
  top: "#243044",
};

export const TECH: Look = {
  build: "average",
  skin: "#d9ab88",
  hair: "short",
  hairColor: "#3a2e24",
  top: "#2e3440",
  shirt: "#2e3440",
  pants: "#262b33",
  cap: "#232833",
  age: 34,
};

const WORKER_BASE: Look = {
  build: "slim",
  shoes: "#3b2c1e",
  pants: "#3e5470",
  age: 18,
};

export const WORKERS: readonly Look[] = [
  { ...WORKER_BASE, skin: "#e6bd98", hair: "mop", hairColor: "#5a3e26", top: "#9a7a52", sleeves: "short" },
  { ...WORKER_BASE, skin: "#caa07c", hair: "short", hairColor: "#1c1612", top: "#6d7b5c" },
  { ...WORKER_BASE, skin: "#8d6248", hair: "afro", hairColor: "#17120e", top: "#b3a58a", sleeves: "short" },
  { ...WORKER_BASE, skin: "#e9c2a2", hair: "mop", hairColor: "#b58a52", top: "#7a4a3a" },
];

export const NEIGHBORS: readonly Look[] = [
  { build: "average", skin: "#e2b590", hair: "short", hairColor: "#4a3626", top: "#7c8a6a", shirt: "#e6dcc8", pants: "#5a5040", age: 45 },
  { fem: true, build: "average", skin: "#e8c0a0", hair: "bob", hairColor: "#9a6a3a", top: "#b08a5a", skirt: "#6a5a48", pants: "#6a5a48", age: 40 },
  { build: "heavy", skin: "#d0a07e", hair: "receding", hairColor: "#6a5a4a", top: "#c8b890", shirt: "#e8e0d0", pants: "#4a4a44", age: 55 },
  { fem: true, build: "slim", skin: "#9a6c50", hair: "afro", hairColor: "#1a1410", top: "#8a4a3a", skirt: "#3a3a4a", pants: "#3a3a4a", age: 32 },
  { build: "slim", skin: "#e4ba96", hair: "curly", hairColor: "#3a2a1e", top: "#5a6a8a", pants: "#3a3a3a", age: 28 },
  { fem: true, build: "average", skin: "#e6bea0", hair: "long", hairColor: "#c89a5a", top: "#d8c8a8", skirt: "#8a6a5a", pants: "#8a6a5a", age: 35 },
];

export const JUDGE: Look = {
  build: "average",
  skin: "#dcb294",
  hair: "receding",
  hairColor: "#9a948a",
  glasses: true,
  top: "#16181c",
  shirt: "#e8e4dc",
  pants: "#16181c",
  coat: 120,
  age: 60,
};

export const DEFENSE: Look = {
  build: "average",
  skin: "#dcae8e",
  hair: "short",
  hairColor: "#2e241c",
  top: "#4a4e56",
  jacket: true,
  shirt: "#e6e2da",
  tie: "#6a3a3a",
  pants: "#3a3e46",
  age: 45,
};

export const DEFENSE_2: Look = {
  ...DEFENSE,
  build: "stocky",
  hair: "receding",
  hairColor: "#5a4a3a",
  glasses: true,
  top: "#5a4a3c",
  tie: "#2c3a4a",
  age: 55,
};

export const PROSECUTOR: Look = {
  build: "slim",
  skin: "#e0b492",
  hair: "short",
  hairColor: "#3a2a1e",
  top: "#2e3440",
  jacket: true,
  shirt: "#eceae4",
  tie: "#7a2c2a",
  pants: "#2a2f38",
  age: 38,
};

export const JURORS: readonly Look[] = [
  { build: "average", skin: "#e0b492", hair: "receding", hairColor: "#6a5a48", top: "#6a5a48", age: 55 },
  { fem: true, skin: "#e8c2a2", hair: "bob", hairColor: "#3a2a20", top: "#8a5a4a", age: 40 },
  { build: "heavy", skin: "#9a6a4e", hair: "short", hairColor: "#1a1410", top: "#4a5a6a", age: 50 },
  { fem: true, skin: "#e2b898", hair: "long", hairColor: "#b08a5a", top: "#6a7a5a", age: 30 },
  { build: "slim", skin: "#dcae8c", hair: "short", hairColor: "#4a3a2a", top: "#8a7a5a", glasses: true, age: 35 },
  { fem: true, skin: "#c8966e", hair: "curly", hairColor: "#2a1e16", top: "#5a4a6a", age: 45 },
  { build: "average", skin: "#e6bc9a", hair: "mop", hairColor: "#8a6a3a", top: "#7a6a4a", age: 28 },
  { fem: true, skin: "#ecc6a8", hair: "ponytail", hairColor: "#6a4a2a", top: "#9a8a6a", age: 26 },
  { build: "stocky", skin: "#d8aa88", hair: "receding", hairColor: "#aaa49a", top: "#5a5a5a", glasses: true, age: 62 },
  { fem: true, skin: "#8a5c42", hair: "afro", hairColor: "#141010", top: "#aa6a4a", age: 38 },
  { build: "average", skin: "#e0b08c", hair: "curly", hairColor: "#2a2018", top: "#3a4a5a", age: 42 },
  { fem: true, skin: "#e4ba9a", hair: "bob", hairColor: "#aa9a8a", top: "#7a5a5a", glasses: true, age: 58 },
];

export const ARCHIVIST: Look = {
  fem: true,
  build: "average",
  skin: "#dfb492",
  hair: "ponytail",
  hairColor: "#3e2c20",
  top: "#4a5560",
  shirt: "#e8e6e0",
  pants: "#2e3238",
  age: 40,
};

export const ARTIST: Look = {
  fem: true,
  build: "slim",
  skin: "#e6bea0",
  hair: "long",
  hairColor: "#5a3a26",
  top: "#6a5a4a",
  skirt: "#4a3a30",
  pants: "#4a3a30",
  age: 34,
};
