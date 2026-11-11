import type { Look } from "../../gacy/rig/Person";

/**
 * Every recurring person in the episode. The rig is the Gacy rig; the
 * 1890s come from the wardrobe: long dresses with a flared hem, chin
 * whiskers, bowlers and top hats, a helmet on the police.
 *
 * Lizzie is drawn as she was described: a stout woman of thirty-two with
 * reddish-brown hair pinned up, plainly dressed. Nothing about her is
 * drawn as sinister; the film does not know whether she did it.
 */

const DRESS = 176;

export const LIZZIE: Look = {
  fem: true,
  build: "stocky",
  skin: "#e9c3a4",
  hair: "bun",
  hairColor: "#6a3f24",
  top: "#2f3a52",
  topTrim: "#3b4762",
  shirt: "#eae2d2",
  skirt: "#2f3a52",
  pants: "#2f3a52",
  coat: DRESS,
  hem: 26,
  shoes: "#1e1712",
  age: 32,
};

/** The light print dress of the morning, the one the burning is about. */
export const LIZZIE_LIGHT: Look = {
  ...LIZZIE,
  top: "#8fa0b8",
  topTrim: "#7e8fa8",
  skirt: "#8fa0b8",
  pants: "#8fa0b8",
};

export const LIZZIE_BLACK: Look = {
  ...LIZZIE,
  top: "#1c1a1e",
  topTrim: "#26232a",
  skirt: "#1c1a1e",
  pants: "#1c1a1e",
  hat: "bonnet",
};

/** Lizzie in her sixties, Maplecroft. */
export const LIZZIE_OLD: Look = {
  ...LIZZIE,
  build: "heavy",
  hairColor: "#a8a09a",
  top: "#4a4a58",
  topTrim: "#565668",
  skirt: "#4a4a58",
  pants: "#4a4a58",
  age: 66,
};

export const LIZZIE_CHILD: Look = {
  fem: true,
  build: "child",
  skin: "#eac6a8",
  hair: "long",
  hairColor: "#7a4a2a",
  top: "#c8c0b0",
  skirt: "#c8c0b0",
  pants: "#c8c0b0",
  coat: 100,
  hem: 12,
  shoes: "#2a2018",
  age: 3,
};

export const EMMA: Look = {
  fem: true,
  build: "slim",
  skin: "#e6c0a0",
  hair: "bun",
  hairColor: "#4a3222",
  top: "#5a4a3c",
  topTrim: "#66564a",
  shirt: "#eee6d8",
  skirt: "#5a4a3c",
  pants: "#5a4a3c",
  coat: DRESS,
  hem: 22,
  shoes: "#1e1712",
  age: 41,
};

export const EMMA_OLD: Look = { ...EMMA, hairColor: "#a8a09a", top: "#3a3a40", skirt: "#3a3a40", pants: "#3a3a40", age: 76 };

export const ANDREW: Look = {
  build: "slim",
  skin: "#dcb493",
  hair: "receding",
  hairColor: "#c8c2b8",
  beard: "chin",
  top: "#1e1c1e",
  jacket: true,
  topTrim: "#161416",
  shirt: "#eee9df",
  tie: "#1a1a1a",
  pants: "#26242a",
  shoes: "#141210",
  coat: 96,
  age: 69,
};

export const ANDREW_HAT: Look = { ...ANDREW, hat: "top" };

/** In shirtsleeves at home, the coat off. */
export const ANDREW_HOME: Look = { ...ANDREW, top: "#3a3436", jacket: false, coat: 0, topTrim: undefined };

export const ABBY: Look = {
  fem: true,
  build: "heavy",
  skin: "#e6bc9c",
  hair: "bun",
  hairColor: "#8a8078",
  top: "#4a3a3e",
  topTrim: "#56464a",
  shirt: "#ece4d8",
  skirt: "#4a3a3e",
  pants: "#4a3a3e",
  coat: DRESS,
  hem: 34,
  shoes: "#1e1712",
  age: 64,
};

export const BRIDGET: Look = {
  fem: true,
  build: "average",
  skin: "#efcbb0",
  hair: "bun",
  hairColor: "#8a3e22",
  top: "#4a5a72",
  shirt: "#f0ece4",
  skirt: "#4a5a72",
  pants: "#4a5a72",
  apron: "#ece6da",
  coat: DRESS,
  hem: 20,
  shoes: "#2a2018",
  age: 26,
};

export const MORSE: Look = {
  build: "slim",
  skin: "#d8ac8a",
  hair: "receding",
  hairColor: "#8a847a",
  beard: "full",
  top: "#3a3630",
  jacket: true,
  topTrim: "#2e2a26",
  shirt: "#e6e0d2",
  tie: "#2a2a2a",
  pants: "#34302c",
  hat: "bowler",
  coat: 80,
  age: 59,
};

export const DR_BOWEN: Look = {
  build: "average",
  skin: "#dfb494",
  hair: "short",
  hairColor: "#6a5a4a",
  mustache: true,
  top: "#3e3a44",
  jacket: true,
  topTrim: "#34303a",
  shirt: "#ece8e0",
  tie: "#4a2a2a",
  pants: "#3a363e",
  coat: 84,
  age: 52,
};

export const ALICE: Look = {
  fem: true,
  build: "slim",
  skin: "#e8c4a6",
  hair: "bun",
  hairColor: "#5a4030",
  top: "#7a6a5a",
  topTrim: "#867666",
  shirt: "#eee8dc",
  skirt: "#7a6a5a",
  pants: "#7a6a5a",
  coat: DRESS,
  hem: 22,
  shoes: "#1e1712",
  age: 40,
};

export const NEIGHBOR_WOMAN: Look = {
  fem: true,
  build: "average",
  skin: "#e4bc9e",
  hair: "bun",
  hairColor: "#3a2a20",
  top: "#6a5a6a",
  shirt: "#eee6da",
  skirt: "#6a5a6a",
  pants: "#6a5a6a",
  coat: DRESS,
  hem: 24,
  age: 45,
};

export const OFFICER: Look = {
  build: "average",
  skin: "#dcae8c",
  hair: "short",
  hairColor: "#2a221c",
  mustache: true,
  top: "#242a3a",
  topTrim: "#1c2130",
  shirt: "#242a3a",
  pants: "#20263a",
  badge: true,
  belt: "#141414",
  shoes: "#111",
  hat: "helmet",
  coat: 90,
  age: 34,
};

export const OFFICER_2: Look = { ...OFFICER, build: "stocky", skin: "#c99a78", hairColor: "#1a1512", mustache: false };

export const MARSHAL: Look = {
  build: "stocky",
  skin: "#d8aa88",
  hair: "receding",
  hairColor: "#5a4a3a",
  mustache: true,
  top: "#2a2a30",
  jacket: true,
  topTrim: "#202026",
  shirt: "#e8e4dc",
  tie: "#2a2a2a",
  pants: "#2a2a30",
  hat: "bowler",
  coat: 84,
  age: 50,
};

export const KNOWLTON: Look = {
  build: "stocky",
  skin: "#dcb090",
  hair: "short",
  hairColor: "#4a3a2c",
  mustache: true,
  top: "#2c2a2e",
  jacket: true,
  topTrim: "#222024",
  shirt: "#f0ece4",
  tie: "#1a1a1a",
  pants: "#2c2a2e",
  coat: 90,
  age: 45,
};

export const ROBINSON: Look = {
  build: "heavy",
  skin: "#e2b898",
  hair: "receding",
  hairColor: "#9a948a",
  mustache: true,
  top: "#3a3634",
  jacket: true,
  topTrim: "#302c2a",
  shirt: "#f0ece4",
  tie: "#3a2a2a",
  pants: "#3a3634",
  coat: 92,
  age: 59,
};

export const JENNINGS: Look = {
  build: "slim",
  skin: "#dcb090",
  hair: "short",
  hairColor: "#3a2a1e",
  mustache: true,
  top: "#34363e",
  jacket: true,
  topTrim: "#2a2c34",
  shirt: "#eeeae2",
  tie: "#2a2a2a",
  pants: "#34363e",
  coat: 88,
  age: 43,
};

export const JUDGES: readonly Look[] = [
  { build: "average", skin: "#dcb294", hair: "receding", hairColor: "#b8b2a8", beard: "full", top: "#16181c", shirt: "#e8e4dc", pants: "#16181c", coat: 120, age: 65 },
  { build: "stocky", skin: "#d8ae90", hair: "receding", hairColor: "#9a948a", mustache: true, top: "#16181c", shirt: "#e8e4dc", pants: "#16181c", coat: 120, age: 60 },
  { build: "slim", skin: "#e0b898", hair: "short", hairColor: "#7a7068", beard: "chin", top: "#16181c", shirt: "#e8e4dc", pants: "#16181c", coat: 120, age: 58 },
];

const JUROR_BASE: Look = { build: "average", shirt: "#e8e2d4", tie: "#2a2a2a", jacket: true, coat: 80 };

export const JURORS: readonly Look[] = [
  { ...JUROR_BASE, skin: "#e0b492", hair: "receding", hairColor: "#6a5a48", beard: "full", top: "#4a4038", pants: "#3a3430", age: 55 },
  { ...JUROR_BASE, skin: "#d8ac8a", hair: "short", hairColor: "#3a2a20", mustache: true, top: "#3a3a44", pants: "#2e2e36", age: 40 },
  { ...JUROR_BASE, build: "heavy", skin: "#dcb090", hair: "receding", hairColor: "#8a8078", beard: "chin", top: "#5a4a3a", pants: "#3a3028", age: 62 },
  { ...JUROR_BASE, skin: "#e2b898", hair: "short", hairColor: "#5a3a2a", top: "#2a2e3a", pants: "#24262e", age: 35 },
  { ...JUROR_BASE, build: "slim", skin: "#dcae8c", hair: "short", hairColor: "#4a3a2a", glasses: true, mustache: true, top: "#4a4a4a", pants: "#3a3a3a", age: 48 },
  { ...JUROR_BASE, skin: "#d8a884", hair: "receding", hairColor: "#a09890", beard: "full", top: "#3e3a34", pants: "#2e2a26", age: 66 },
  { ...JUROR_BASE, skin: "#e6bc9a", hair: "short", hairColor: "#8a6a3a", mustache: true, top: "#5a5a62", pants: "#3a3a40", age: 38 },
  { ...JUROR_BASE, build: "stocky", skin: "#dcb090", hair: "short", hairColor: "#2a2018", top: "#3a3630", pants: "#2a2622", age: 44 },
  { ...JUROR_BASE, skin: "#d8aa88", hair: "receding", hairColor: "#7a7068", mustache: true, glasses: true, top: "#2e2e34", pants: "#24242a", age: 58 },
  { ...JUROR_BASE, skin: "#e0b492", hair: "short", hairColor: "#3a2a1e", beard: "full", top: "#4a3e34", pants: "#36302a", age: 50 },
  { ...JUROR_BASE, build: "slim", skin: "#e4b896", hair: "short", hairColor: "#5a4a3a", mustache: true, top: "#3a3e4a", pants: "#2c2e36", age: 42 },
  { ...JUROR_BASE, skin: "#d6ac8c", hair: "receding", hairColor: "#9a9088", top: "#4a4640", pants: "#34302c", age: 60 },
];

export const REPORTER: Look = {
  build: "slim",
  skin: "#e0b492",
  hair: "short",
  hairColor: "#3a2a1e",
  mustache: true,
  top: "#5a5048",
  jacket: true,
  topTrim: "#4a4038",
  shirt: "#ece6d8",
  tie: "#3a3a3a",
  pants: "#4a423a",
  hat: "bowler",
  coat: 80,
  age: 30,
};

export const PHARMACIST: Look = {
  build: "slim",
  skin: "#e2b898",
  hair: "short",
  hairColor: "#4a3222",
  mustache: true,
  top: "#e8e2d4",
  topTrim: "#d8d0c0",
  shirt: "#f4f0e8",
  tie: "#3a3a3a",
  pants: "#3a3a3a",
  coat: 70,
  age: 28,
};

export const CHEMIST: Look = {
  build: "average",
  skin: "#dcb090",
  hair: "receding",
  hairColor: "#8a8078",
  beard: "full",
  glasses: true,
  top: "#e6e2d8",
  shirt: "#f0ece4",
  tie: "#2a2a2a",
  pants: "#3a3a3a",
  coat: 90,
  age: 52,
};

export const STENOGRAPHER: Look = {
  build: "slim",
  skin: "#e4ba9a",
  hair: "short",
  hairColor: "#3a2a20",
  top: "#4a4a52",
  jacket: true,
  shirt: "#ece8e0",
  tie: "#2a2a2a",
  pants: "#3a3a42",
  glasses: true,
  age: 32,
};

export const PALE_MAN: Look = {
  build: "slim",
  skin: "#f0e0d0",
  hair: "short",
  hairColor: "#2a2420",
  top: "#3a3a3a",
  jacket: true,
  shirt: "#e8e8e8",
  pants: "#34343a",
  hat: "bowler",
  coat: 70,
  age: 24,
};

const WORKER_BASE: Look = { build: "average", shoes: "#2a2018", pants: "#4a4238", age: 30 };

export const MILL_WORKERS: readonly Look[] = [
  { ...WORKER_BASE, skin: "#e6bd98", hair: "short", hairColor: "#5a3e26", top: "#7a6a52", mustache: true, hat: "bowler" },
  { ...WORKER_BASE, fem: true, skin: "#e8c4a6", hair: "bun", hairColor: "#3a2a20", top: "#6a6a5a", skirt: "#6a6a5a", pants: "#6a6a5a", coat: DRESS, hem: 18, apron: "#d8d0c0" },
  { ...WORKER_BASE, skin: "#caa07c", hair: "short", hairColor: "#1c1612", top: "#5a5a4a", sleeves: "short" },
  { ...WORKER_BASE, build: "child", skin: "#e9c2a2", hair: "mop", hairColor: "#8a6a3a", top: "#8a7a5a", pants: "#3a3a3a", age: 11 },
  { ...WORKER_BASE, fem: true, skin: "#e2b898", hair: "bun", hairColor: "#5a3a26", top: "#5a4a5a", skirt: "#5a4a5a", pants: "#5a4a5a", coat: DRESS, hem: 18 },
  { ...WORKER_BASE, skin: "#d8b090", hair: "short", hairColor: "#3a2a1e", top: "#4a5a6a", hat: "straw" },
];

export const IMMIGRANT: Look = {
  build: "slim",
  skin: "#c8946e",
  hair: "short",
  hairColor: "#1c1612",
  mustache: true,
  top: "#6a5a48",
  shirt: "#d8d0c0",
  pants: "#3a3a34",
  hat: "straw",
  age: 35,
};

export const GENTRY: readonly Look[] = [
  { build: "stocky", skin: "#e2b898", hair: "receding", hairColor: "#8a847a", beard: "full", top: "#1e1c1e", jacket: true, topTrim: "#161416", shirt: "#f0ece4", tie: "#1a1a1a", pants: "#26242a", hat: "top", coat: 96, age: 60 },
  { fem: true, build: "slim", skin: "#eac6a8", hair: "bun", hairColor: "#5a3a26", top: "#8a6a7a", topTrim: "#9a7a8a", shirt: "#f0e8e0", skirt: "#8a6a7a", pants: "#8a6a7a", coat: DRESS, hem: 34, hat: "bonnet", age: 40 },
  { build: "slim", skin: "#dcb090", hair: "short", hairColor: "#3a2a1e", mustache: true, top: "#3a3a44", jacket: true, topTrim: "#30303a", shirt: "#eeeae2", tie: "#5a2a2a", pants: "#3a3a44", hat: "bowler", coat: 90, age: 38 },
  { fem: true, build: "average", skin: "#e6c0a0", hair: "bun", hairColor: "#8a6a3a", top: "#c8b8a0", topTrim: "#d4c4ac", shirt: "#f4f0e8", skirt: "#c8b8a0", pants: "#c8b8a0", coat: DRESS, hem: 34, hat: "bonnet", age: 30 },
];

export const CHILDREN: readonly Look[] = [
  { build: "child", fem: true, skin: "#eac6a8", hair: "long", hairColor: "#7a4a2a", top: "#c8a8a0", skirt: "#c8a8a0", pants: "#c8a8a0", coat: 96, hem: 12, age: 8 },
  { build: "child", skin: "#e6bc9a", hair: "mop", hairColor: "#5a3a26", top: "#8a8a7a", pants: "#4a4a44", shoes: "#2a2018", age: 9 },
  { build: "child", fem: true, skin: "#d8b090", hair: "bob", hairColor: "#2a1e16", top: "#a8b8c8", skirt: "#a8b8c8", pants: "#a8b8c8", coat: 96, hem: 12, age: 7 },
  { build: "child", skin: "#efcbb0", hair: "short", hairColor: "#b58a52", top: "#7a6a5a", pants: "#3a3a3a", shoes: "#2a2018", age: 10 },
];

export const CHILDREN_1920S: readonly Look[] = [
  { build: "child", skin: "#e6bc9a", hair: "short", hairColor: "#3a2a1e", top: "#6a7a8a", pants: "#4a4a44", cap: "#5a5a5a", age: 10 },
  { build: "child", fem: true, skin: "#eac6a8", hair: "bob", hairColor: "#7a4a2a", top: "#c8b8a8", skirt: "#c8b8a8", pants: "#c8b8a8", coat: 80, age: 8 },
  { build: "child", skin: "#d8b090", hair: "mop", hairColor: "#5a3a26", top: "#8a8a7a", pants: "#3a3a3a", age: 11 },
];

export const SUNDAY_CHILDREN: readonly Look[] = [
  { build: "child", fem: true, skin: "#eac6a8", hair: "long", hairColor: "#7a4a2a", top: "#eee8e0", skirt: "#eee8e0", pants: "#eee8e0", coat: 96, hem: 12, age: 8 },
  { build: "child", skin: "#e6bc9a", hair: "short", hairColor: "#5a3a26", top: "#3a3a44", jacket: true, shirt: "#f0ece4", pants: "#3a3a44", age: 9 },
  { build: "child", fem: true, skin: "#d8b090", hair: "bob", hairColor: "#2a1e16", top: "#e8e0d8", skirt: "#e8e0d8", pants: "#e8e0d8", coat: 96, hem: 12, age: 7 },
];

export const CONGREGATION: readonly Look[] = [...GENTRY, NEIGHBOR_WOMAN, DR_BOWEN];

export const TOWNSFOLK: readonly Look[] = [
  { build: "average", skin: "#e2b590", hair: "short", hairColor: "#4a3626", mustache: true, top: "#6a5a4a", jacket: true, shirt: "#e6dcc8", pants: "#4a4038", hat: "bowler", coat: 80, age: 45 },
  { fem: true, build: "average", skin: "#e8c0a0", hair: "bun", hairColor: "#9a6a3a", top: "#7a5a4a", skirt: "#7a5a4a", pants: "#7a5a4a", coat: DRESS, hem: 24, hat: "bonnet", age: 40 },
  { build: "heavy", skin: "#d0a07e", hair: "receding", hairColor: "#6a5a4a", beard: "full", top: "#4a4a44", jacket: true, shirt: "#e8e0d0", pants: "#3a3a34", hat: "top", coat: 90, age: 55 },
  { fem: true, build: "slim", skin: "#e4ba96", hair: "bun", hairColor: "#3a2a1e", top: "#5a6a7a", skirt: "#5a6a7a", pants: "#5a6a7a", coat: DRESS, hem: 22, age: 32 },
  { build: "slim", skin: "#e4ba96", hair: "short", hairColor: "#3a2a1e", top: "#8a7a5a", shirt: "#e0d8c8", pants: "#3a3a3a", hat: "straw", age: 28 },
  { fem: true, build: "average", skin: "#e6bea0", hair: "bun", hairColor: "#c89a5a", top: "#8a7a6a", skirt: "#8a7a6a", pants: "#8a7a6a", coat: DRESS, hem: 24, age: 35 },
];

/** The killer, whoever it was: only ever a silhouette. */
export const SHADOW: Look = { build: "average", top: "#000", pants: "#000", coat: 80 };
