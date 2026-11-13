import React from "react";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Film } from "../doc/look/Film";
import { Clip, type ClipTone } from "./components/Clip";
import { Insert } from "./components/Insert";
import { ShotClock } from "./components/Shot";
import { Still, type Framing, type Tone } from "./components/Still";
import { Beats, DateCard, Label } from "./components/Type";
import type { ClipId } from "./data/clips";
import type { ImageId } from "./data/images";
import {
  FILM_FRAMES,
  INSERTS,
  insertStart,
  NARRATION_CHUNKS,
  toFilm,
} from "./edit";
import { BayMap } from "./graphics/BayMap";
import {
  AcluCard,
  Casualties,
  ChainedToDoor,
  Checklist,
  DarkCell,
  EndCard,
  KeyMissing,
  LostTime,
  MemorialCard,
  NightCell,
  OutcomeBoard,
  RecapLedger,
  RefusalLedger,
  SimmonsTimeline,
  SupplyLine,
  ThreeDays,
  ThreeFates,
  Waiting,
  WindowView,
} from "./graphics/Cards";
import {
  Blueprint,
  BlockPlan,
  CellPlan,
  Dungeon,
  EscapeRoute,
  IsolationZoom,
} from "./graphics/Diagrams";
import { Flashes, GhostCorridor, Highlight, SeriesTitle } from "./graphics/Extras";
import { MugRow } from "./graphics/Notebook";
import { AZ, FPS } from "./theme";

export const ALCATRAZ_DURATION = FILM_FRAMES;

/* ------------------------------------------------------------------------
 * Every archival picture and clip may appear once in the film. The helpers
 * below record each use and the module refuses to load if one repeats, so a
 * re-cut cannot quietly show the same footage twice.
 * --------------------------------------------------------------------- */
const used = new Map<string, number>();
const claim = (kind: string, id: string, at: number) => {
  const key = `${kind}:${id}`;
  if (used.has(key)) {
    throw new Error(`${key} is used twice (at ${used.get(key)} s and ${at} s)`);
  }
  used.set(key, at);
};

type Fx = "dissolve" | "cut" | "fade" | "quick";

type ShotSpec = {
  readonly at: number;
  readonly fx?: Fx;
  readonly node: React.ReactNode;
};

const shots: ShotSpec[] = [];
const shot = (at: number, node: React.ReactNode, fx: Fx = "dissolve") => {
  const ins = INSERTS.find((i) => Math.abs(i.at - at) <= 1 / FPS);
  shots.push({ at: ins ? ins.at : Math.round(at * FPS) / FPS, node, fx });
};

const still = (
  at: number,
  id: ImageId,
  opts: {
    from?: Framing;
    to?: Framing;
    tone?: Tone;
    dim?: number;
    fill?: "mount" | "cover";
    maxUpscale?: number;
    fx?: Fx;
    over?: React.ReactNode;
    inside?: React.ReactNode;
  } = {},
) => {
  claim("img", id, at);
  shot(
    at,
    <AbsoluteFill>
      <Still
        id={id}
        from={opts.from}
        to={opts.to}
        tone={opts.tone}
        dim={opts.dim}
        fill={opts.fill}
        maxUpscale={opts.maxUpscale}
      >
        {opts.inside}
      </Still>
      {opts.over}
    </AbsoluteFill>,
    opts.fx,
  );
};

const clip = (
  at: number,
  id: ClipId,
  opts: {
    tone?: ClipTone;
    push?: readonly [number, number];
    origin?: string;
    fx?: Fx;
    over?: React.ReactNode;
  } = {},
) => {
  claim("clip", id, at);
  shot(
    at,
    <AbsoluteFill>
      <Clip id={id} tone={opts.tone} push={opts.push} origin={opts.origin} />
      {opts.over}
    </AbsoluteFill>,
    opts.fx,
  );
};

const F = (x: number, y: number, zoom: number): Framing => ({ x, y, zoom });

/* =========================================================== COLD OPEN */
shot(0.0, <DarkCell />, "fade");
still(3.9, "habs-cells-c", { from: F(0.5, 0.5, 1.25), to: F(0.45, 0.5, 1.4), dim: 0.35, fx: "cut" });
shot(6.3, <LostTime />);
still(10.1, "habs-d-openers", { from: F(0.5, 0.35, 1.0), to: F(0.5, 0.55, 1.2), dim: 0.2 });
shot(15.7, <ChainedToDoor />);
clip(24.85, "p38-island-near", {
  over: <Label title="אלקטרז" sub="מפרץ סן פרנסיסקו" at={3.9} />,
});
clip(30.0, "p38-mugshots");
still(34.9, "milprison-1920-a", { tone: "sepia", from: F(0.5, 0.5, 1), to: F(0.55, 0.5, 1.1) });
shot(38.7, <BayMap variant="distance" />);
clip(44.85, "heli-alcatraz", { tone: "color" });
clip(49.45, "heli-skyline", { tone: "color" });
clip(52.3, "heli-gg", { tone: "color" });
clip(55.35, "p38-island-far", { push: [1.0, 1.1] });
still(61.15, "island-govprison-1934", {
  from: F(0.5, 0.42, 1.0),
  to: F(0.5, 0.4, 1.15),
  dim: 0.25,
  over: (
    <Beats
      size={120}
      items={[
        { at: 0.25, text: "אלקטרז" },
        { at: 4.3, text: "״הסלע״" },
      ]}
    />
  ),
});
still(66.4, "nara-dining-1934", { from: F(0.5, 0.55, 1.0), to: F(0.45, 0.55, 1.2) });
still(71.35, "capone-stege-1930", {
  from: F(0.35, 0.3, 1.1),
  to: F(0.35, 0.28, 1.3),
  over: <Label title="אל קפונה" sub="שיקגו, 1930" at={0.5} />,
});
still(75.0, "habs-cellblock-a", { from: F(0.5, 0.5, 1.0), to: F(0.6, 0.5, 1.25), dim: 0.15 });
still(82.7, "habs-door-levers", { from: F(0.5, 0.45, 1.1), to: F(0.5, 0.5, 1.3), fx: "cut" });
clip(84.7, "att-smoke-c", { tone: "dim", fx: "cut" });
still(87.25, "esc-mugshots-1962", {
  from: F(0.5, 0.62, 1.15),
  to: F(0.5, 0.62, 1.35),
  dim: 0.3,
  fx: "cut",
  over: <Label title="1962" sub="שלושה אסירים · מעולם לא נמצאו" at={3.2} />,
});

/* =============================================================== TITLE */
shot(93.8, <SeriesTitle episode="אלקטרז" line="SAN FRANCISCO BAY · 1859–1963" grand />, "quick");
still(100.0, "hs-aerial-a", { tone: "color", from: F(0.5, 0.55, 1.0), to: F(0.52, 0.55, 1.2) });
still(103.55, "habs-guard-station", { from: F(0.5, 0.5, 1.0), to: F(0.5, 0.5, 1.2), dim: 0.1 });

/* ====================================================== MILITARY FORTRESS */
still(106.65, "nara-sketch-sw", {
  tone: "sketch",
  from: F(0.3, 0.5, 1.0),
  to: F(0.6, 0.5, 1.15),
  over: <Label title="המאה ה-19" sub="שרטוט של האי מן הארכיון" at={0.8} />,
});
still(114.4, "nps-citadel", {
  tone: "sepia",
  from: F(0.5, 0.5, 1.0),
  to: F(0.5, 0.45, 1.1),
  over: <Label title="בסיס צבאי מבוצר" sub="המצודה על האי" at={0.4} />,
});
shot(118.65, <BayMap variant="strategic" />);
still(127.4, "nps-military-aerial", {
  tone: "sepia",
  from: F(0.5, 0.5, 1.0),
  to: F(0.5, 0.5, 1.12),
  over: <DateCard date="כלא" at={4.98} size={150} />,
});
clip(132.9, "p38-water", { push: [1.0, 1.08] });
clip(137.3, "u62-rocks");
still(142.75, "nara-lightstation-se", {
  tone: "sepia",
  from: F(0.5, 0.45, 1.0),
  to: F(0.5, 0.45, 1.15),
  dim: 0.2,
  over: <DateCard date="1861" sub="כלא צבאי רשמי" at={0.3} />,
});
still(147.6, "nara-island-far", {
  tone: "sepia",
  from: F(0.5, 0.5, 1.0),
  to: F(0.5, 0.5, 1.12),
  dim: 0.35,
  over: (
    <Beats
      align="right"
      items={[
        { at: 1.85, text: "עריקים" },
        { at: 2.6, text: "חיילים שהפרו פקודות" },
        { at: 4.6, text: "אזרחים שנחשדו בבגידה" },
      ]}
    />
  ),
});

/* ======================================================= WORLD WAR I */
still(154.35, "nara-garrison", {
  from: F(0.5, 0.5, 1.0),
  to: F(0.5, 0.45, 1.15),
  over: <Label title="מלחמת העולם הראשונה" sub="אלקטרז, כלא צבאי" at={2.6} />,
});
still(158.65, "milprison-1920-b", { tone: "sepia", from: F(0.5, 0.5, 1.0), to: F(0.45, 0.5, 1.1) });
still(163.1, "habs-guard-house", { from: F(0.5, 0.5, 1.0), to: F(0.55, 0.45, 1.2), dim: 0.25 });
shot(
  169.75,
  <Blueprint tint="#1a1916">
    <DateCard date="רוברט סימונס" sub="סרבן מצפון · מלחמת העולם הראשונה" at={1.3} size={104} />
  </Blueprint>,
);
shot(178.35, <RefusalLedger />);
shot(189.9, <Dungeon />);
still(202.65, "habs-broadway", {
  from: F(0.5, 0.5, 1.0),
  to: F(0.5, 0.5, 1.25),
  dim: 0.2,
  over: <Label title="כלובי הברזל" sub="שיטת ענישה בכלא הצבאי" at={2.9} />,
});
shot(213.95, <Waiting />);
clip(228.5, "p38-cameramen");
shot(234.4, <AcluCard />);
shot(245.2, <SimmonsTimeline />);
still(252.8, "nara-culinary", { from: F(0.5, 0.55, 1.0), to: F(0.55, 0.55, 1.25) });
still(261.75, "habs-general", { from: F(0.5, 0.5, 1.0), to: F(0.5, 0.5, 1.15) });
still(265.1, "nps-hopi-a", {
  tone: "sepia",
  over: <Label title="אסירים בני שבט ההופי" sub="אלקטרז, 1895" at={0.6} />,
});
still(271.4, "nps-hopi-b", { tone: "sepia" });

/* ==================================================== FEDERAL PRISON */
still(275.25, "nara-aerial-1934", {
  from: F(0.5, 0.45, 1.0),
  to: F(0.5, 0.45, 1.2),
  over: <DateCard date="1934" at={0.2} size={140} />,
});
clip(279.45, "p38-island-smoke", {
  over: <Label title="בית הסוהר הפדרלי" sub="U.S. PENITENTIARY · ALCATRAZ" at={0.5} />,
});
still(282.45, "johnston-1935", {
  from: F(0.5, 0.35, 1.0),
  to: F(0.5, 0.33, 1.1),
  over: <Label title="ג'יימס ג'ונסטון" sub="הסוהר הראשי הראשון, 1934–1948" at={0.6} side="left" />,
});
still(288.65, "aerial-spence-1938", {
  from: F(0.5, 0.5, 1.0),
  to: F(0.5, 0.5, 1.2),
  dim: 0.4,
  over: (
    <Beats
      align="right"
      size={58}
      items={[
        { at: 0.0, text: "אסירים שניסו לברוח מבתי כלא אחרים" },
        { at: 3.05, text: "אסירים שהפרו משמעת שוב ושוב" },
        { at: 5.95, text: "פושעים בעלי קשרים והשפעה" },
      ]}
    />
  ),
});
clip(299.25, "p38-coxe");
claim("img", "habs-typical-cell", 305.6);
shot(305.6, <CellPlan />);
clip(315.25, "u63-corridor");
shot(319.5, <BlockPlan />);
still(326.1, "nara-dblock-plan", {
  tone: "sepia",
  from: F(0.3, 0.5, 1.0),
  to: F(0.25, 0.5, 1.4),
  maxUpscale: 2.2,
  over: <Label title="תוכנית לחידוש אגף D" sub="הארכיון הלאומי של ארה״ב" at={0.6} />,
});
still(332.4, "habs-d-block", {
  from: F(0.5, 0.5, 1.0),
  to: F(0.62, 0.5, 1.3),
  dim: 0.2,
  over: <Label title="״החור״" sub="תאי הבידוד בקצה אגף D" at={3.9} />,
});
clip(337.7, "rev-aerial", { tone: "washed" });
shot(344.2, <IsolationZoom />);

/* ================================================================ CAPONE */
still(355.45, "habs-dining", { from: F(0.5, 0.5, 1.0), to: F(0.5, 0.5, 1.2), dim: 0.15 });
still(362.15, "capone-mugshots-1931", {
  from: F(0.5, 0.45, 1.0),
  to: F(0.68, 0.45, 1.3),
  over: <Label title="אל קפונה" sub="1899–1947" at={0.6} side="left" />,
});
still(367.2, "capone-standing-1928", {
  from: F(0.5, 0.25, 1.0),
  to: F(0.5, 0.25, 1.2),
  over: <Label title="שיקגו, שנות ה-20" at={0.6} />,
});
clip(372.55, "gang-liquor", {
  tone: "dark",
  over: (
    <Beats
      align="right"
      size={66}
      items={[
        { at: 0.05, text: "הברחות אלכוהול" },
        { at: 3.17, text: "הימורים" },
        { at: 4.0, text: "סחיטה" },
        { at: 4.8, text: "ואלימות" },
      ]}
    />
  ),
});
still(378.25, "capone-jury-1931", {
  from: F(0.5, 0.5, 1.0),
  to: F(0.5, 0.45, 1.2),
  over: <Label title="1931" sub="חבר המושבעים במשפט העלמת המס" at={5.0} />,
});
still(386.0, "wn-capone", {
  from: F(0.5, 0.35, 1.0),
  to: F(0.8, 0.2, 2.2),
  maxUpscale: 1.6,
  fx: "quick",
  over: <Label title="אסיר מס׳ 85" sub="אלקטרז, אוגוסט 1934" at={1.0} side="left" />,
});
clip(390.0, "u63-sink");
still(395.2, "capone-indicted-1931", { from: F(0.5, 0.4, 1.0), to: F(0.5, 0.35, 1.2), dim: 0.1 });
shot(
  398.9,
  <Blueprint tint="#1b1314">
    <DateCard date="1936" sub="ג'יימס לוקאס תוקף את קפונה במספריים" at={0.3} size={130} />
  </Blueprint>,
);
still(404.0, "habs-yard-stairs", { from: F(0.5, 0.5, 1.0), to: F(0.5, 0.55, 1.2), dim: 0.15 });
clip(407.7, "p38-island-close", { push: [1.0, 1.12] });

/* ================================================================= 1938 */
shot(
  416.8,
  <MugRow
    title="23 במאי 1938"
    titleAt={416.9}
    people={[
      { id: "wn-lucas", name: "ג'יימס לוקאס", number: "AZ-224", at: 421.64 },
      { id: "wn-limerick", name: "תומאס לימריק", number: "AZ-263", at: 422.42 },
      { id: "wn-franklin", name: "רופוס פרנקלין", number: "AZ-335", at: 423.26 },
    ]}
  />,
);
claim("img", "wn-lucas", 416.8);
claim("img", "wn-limerick", 416.8);
claim("img", "wn-franklin", 416.8);
still(426.2, "island-diagram-1956", {
  from: F(0.45, 0.5, 1.0),
  to: F(0.3, 0.52, 1.5),
  inside: <Highlight box={[0.135, 0.49, 0.225, 0.545]} at={426.5} label="בניין התעשייה" />,
});
still(428.3, "habs-industries", { from: F(0.5, 0.5, 1.0), to: F(0.45, 0.5, 1.15) });
shot(432.1, <MemorialCard />, "cut");
still(436.3, "nps-guard-tower", { tone: "color", from: F(0.5, 0.45, 1.0), to: F(0.45, 0.4, 1.2) });
clip(440.65, "u63-tower", { push: [1.0, 1.15], origin: "50% 30%", over: <Flashes at={[443.1, 443.45]} /> });
shot(444.3, <OutcomeBoard />);
still(455.25, "habs-roof", { from: F(0.5, 0.5, 1.0), to: F(0.5, 0.5, 1.18), dim: 0.25 });

/* ================================================================= 1946 */
clip(460.6, "att-island", { tone: "dim" });
clip(465.35, "att-smoke-a", {
  tone: "washed",
  over: <DateCard date="הקרב על אלקטרז" at={0.15} size={110} />,
});
shot(
  469.0,
  <MugRow
    title="2 במאי 1946"
    titleAt={469.1}
    people={[
      { id: "wn-coy", name: "ברנרד קוי", number: "AZ-415", at: 470.4 },
      { id: "wn-cretzer", name: "ג'וזף קרצר", number: "AZ-548", at: 471.0 },
    ]}
    caption="מובילי ניסיון הבריחה"
    captionAt={472.0}
  />,
);
claim("img", "wn-coy", 469.0);
claim("img", "wn-cretzer", 469.0);
still(474.8, "habs-spiral-stair", { from: F(0.5, 0.6, 1.0), to: F(0.5, 0.4, 1.2), dim: 0.15 });
shot(480.6, <KeyMissing />);
still(487.8, "habs-visitor", { from: F(0.5, 0.5, 1.0), to: F(0.4, 0.5, 1.25), dim: 0.2 });
clip(497.05, "rev-marines", { tone: "washed" });
clip(505.85, "att-smoke-b", { tone: "dim", over: <ThreeDays /> });
clip(509.8, "rev-cellhouse", { tone: "washed", over: <Flashes at={[510.38, 510.98, 511.6]} /> });
still(513.85, "nps-broadway", { from: F(0.5, 0.5, 1.0), to: F(0.5, 0.5, 1.1), dim: 0.1 });
shot(520.55, <Casualties />);
shot(
  526.4,
  <MugRow
    people={[
      { id: "wn-shockley", name: "סמואל שוקלי", number: "AZ-462", at: 526.6 },
      { id: "wn-thompson", name: "מירן תומפסון", number: "AZ-729", at: 527.0 },
    ]}
    caption="הורשעו ונידונו למוות"
    captionAt={529.6}
  />,
);
claim("img", "wn-shockley", 526.4);
claim("img", "wn-thompson", 526.4);
shot(
  531.6,
  <Blueprint tint="#160d0e">
    <DateCard date="סן קוונטין" sub="תא הגזים · דצמבר 1948" at={0.4} size={120} />
  </Blueprint>,
);
clip(535.05, "att-onlookers", { tone: "dim" });
still(540.7, "battle-ships-1946", { from: F(0.5, 0.5, 1.0), to: F(0.5, 0.48, 1.25) });
clip(548.95, "rev-island-boats", { tone: "washed" });
still(555.35, "habs-rec-yard", { from: F(0.5, 0.5, 1.0), to: F(0.5, 0.5, 1.15), dim: 0.3 });

/* ================================================================= 1962 */
still(559.55, "hs-aerial-b", { tone: "cold", from: F(0.5, 0.5, 1.0), to: F(0.5, 0.5, 1.2), dim: 0.25 });
shot(567.4, <NightCell />);
still(575.15, "esc-cell-views-1962", {
  from: F(0.5, 0.55, 1.0),
  to: F(0.3, 0.6, 1.8),
  over: <DateCard date="12 ביוני 1962" sub="ספירת הבוקר" at={0.3} until={5.5} size={96} />,
});
still(589.6, "nps-dummy-head", {
  tone: "color",
  over: <Label title="ראש מזויף מבריחת 1962" sub="אוסף הפארק הלאומי, אלקטרז" at={1.0} />,
});
clip(594.8, "fbi-masks", {
  tone: "color",
  over: <Label title="הראשים המקוריים" sub="שימור במעבדת ה-FBI" at={0.8} side="left" />,
});
clip(601.85, "u62-hands-mugs", { fx: "quick" });
shot(
  605.35,
  <MugRow
    dimAt={609.4}
    caption="נעלמו"
    captionAt={609.6}
    people={[
      { id: "wn-morris", name: "פרנק מוריס", number: "AZ-1441", at: 605.4 },
      { id: "wn-john-anglin", name: "ג'ון אנגלין", number: "AZ-1476", at: 606.6 },
      { id: "wn-clarence-anglin", name: "קלרנס אנגלין", number: "AZ-1485", at: 607.6 },
    ]}
  />,
);
claim("img", "wn-morris", 605.35);
claim("img", "wn-john-anglin", 605.35);
claim("img", "wn-clarence-anglin", 605.35);
clip(610.55, "u62-officials");
clip(615.3, "u62-hole");
shot(619.65, <EscapeRoute />);
clip(639.7, "u62-roofvent", { fx: "cut" });
clip(642.85, "u62-island", { tone: "night" });
shot(646.2, <BayMap variant="currents" />);
clip(667.1, "u62-shore", { fx: "quick" });
clip(670.7, "p38-water-far", {
  over: (
    <Beats
      align="right"
      size={56}
      items={[
        { at: 0.5, text: "משוט" },
        { at: 1.0, text: "שרידי אפוד הצלה" },
        { at: 1.5, text: "שקית עם מסמכים אישיים" },
      ]}
      until={2.6}
    />
  ),
});
still(676.75, "hs-hilltop", { tone: "color", from: F(0.5, 0.5, 1.0), to: F(0.5, 0.45, 1.15) });
still(683.25, "hs-island-ferry", { tone: "color", from: F(0.5, 0.5, 1.0), to: F(0.45, 0.5, 1.2) });
still(687.6, "nara-aerial-color", { tone: "color", from: F(0.5, 0.5, 1.0), to: F(0.5, 0.5, 1.25), dim: 0.1 });
shot(696.45, <ThreeFates />);
still(708.9, "aerial-city-1938", { from: F(0.5, 0.5, 1.0), to: F(0.5, 0.55, 1.15) });
still(714.5, "habs-east-side", {
  from: F(0.5, 0.5, 1.0),
  to: F(0.5, 0.5, 1.15),
  dim: 0.25,
  over: <DateCard date="דצמבר 1962" at={0.2} size={110} />,
});
shot(
  718.8,
  <MugRow
    people={[
      { id: "wn-parker", name: "דארל פרקר", number: "AZ-1413", at: 719.9 },
      { id: "wn-scott", name: "ג'ון פול סקוט", number: "AZ-1403", at: 723.42 },
    ]}
  />,
);
claim("img", "wn-parker", 718.8);
claim("img", "wn-scott", 718.8);
clip(725.9, "heli-gg-marin", { tone: "color", over: <Label title="שער הזהב" sub="פורט פוינט" at={1.4} /> });
shot(733.3, <Checklist />);
clip(746.45, "b24-aerial", { tone: "color" });

/* ============================================================== CLOSURE */
clip(754.3, "u63-island", { over: <DateCard date="21 במרץ 1963" at={0.3} size={110} /> });
shot(761.85, <SupplyLine />, "quick");
still(776.5, "hs-derelict", { tone: "color", from: F(0.5, 0.45, 1.0), to: F(0.5, 0.4, 1.2) });
still(781.95, "habs-sally-port", { tone: "color", from: F(0.5, 0.5, 1.0), to: F(0.5, 0.5, 1.15) });
clip(786.05, "u63-boat", {
  fx: "quick",
  over: <Label title="1934–1963" sub="29 שנים כבית סוהר פדרלי" at={0.5} />,
});
still(791.4, "nara-lighthouse", { tone: "sepia", from: F(0.5, 0.4, 1.0), to: F(0.5, 0.35, 1.12) });
still(794.05, "hs-aerial-sf", {
  tone: "color",
  dim: 0.3,
  from: F(0.5, 0.55, 1.0),
  to: F(0.5, 0.55, 1.15),
  over: <DateCard date="1973" sub="האי נפתח למבקרים" at={0.2} size={130} />,
});
still(797.1, "hs-island-13781", { tone: "color", from: F(0.5, 0.5, 1.0), to: F(0.55, 0.5, 1.2) });

/* ================================================================ TODAY */
still(804.0, "hs-cellhouse", { tone: "color", from: F(0.5, 0.6, 1.0), to: F(0.5, 0.5, 1.15) });
still(807.45, "habs-guard-tower", { tone: "color", from: F(0.5, 0.6, 1.0), to: F(0.5, 0.4, 1.15) });
shot(814.45, <GhostCorridor />);
clip(828.2, "u63-guard");
still(832.4, "wn-carnes", {
  from: F(0.5, 0.4, 1.0),
  to: F(0.5, 0.3, 1.15),
  over: <Label title="ההיסטוריה המתועדת" sub="פנקס הסוהר, אלקטרז" at={0.6} />,
});
shot(838.25, <RecapLedger />);
clip(866.9, "p38-island-mid", { push: [1.0, 1.1] });
clip(874.2, "rev-buildings", { tone: "washed" });
clip(881.6, "heli-waterfront", { tone: "color" });
clip(893.3, "att-island-close", { tone: "dim" });
claim("img", "ferry-2020", 900.55);
shot(900.55, <WindowView />);
clip(931.9, "p38-ferry", { push: [1.0, 1.08] });
shot(
  937.25,
  <Blueprint tint="#101215">
    <DateCard date="אלקטרז" sub="1934–1963" at={0.6} size={150} />
  </Blueprint>,
);
shot(944.25, <EndCard />);
shot(962.8, <SeriesTitle episode="נתראה בסיוט הבא" />);

/* ------------------------------------------------------------------------
 * Assembly. Each shot runs until the next one starts, plus the next shot's
 * fade-in, so a dissolve has the outgoing picture underneath it.
 * --------------------------------------------------------------------- */
const FX_FRAMES: Record<Fx, number> = {
  dissolve: 18,
  quick: 8,
  cut: 0,
  fade: 14,
};

type Entry = {
  readonly start: number;
  readonly at: number;
  readonly fx: Fx;
  readonly node: React.ReactNode;
  readonly name: string;
};

const entries: Entry[] = [
  ...shots.map((s) => ({
    start: Math.round(toFilm(s.at) * FPS),
    at: s.at,
    fx: s.fx ?? "dissolve",
    node: s.node,
    name: `${s.at.toFixed(2)}`,
  })),
  ...INSERTS.map((ins) => {
    claim("clip", ins.clip, ins.at);
    return {
      start: Math.round(insertStart(ins) * FPS),
      at: ins.at,
      fx: "quick" as Fx,
      node: <Insert spec={ins} />,
      name: `insert ${ins.clip}`,
    };
  }),
].sort((a, b) => a.start - b.start);

const Fade: React.FC<{
  readonly fadeIn: number;
  readonly fadeOut: number;
  readonly children: React.ReactNode;
}> = ({ fadeIn, fadeOut, children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const a = fadeIn > 0 ? interpolate(frame, [0, fadeIn], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  const b =
    fadeOut > 0
      ? interpolate(frame, [durationInFrames - fadeOut, durationInFrames], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;
  return <AbsoluteFill style={{ opacity: a * b }}>{children}</AbsoluteFill>;
};

const NarrationTrack: React.FC = () => (
  <>
    {NARRATION_CHUNKS.map((c, i) => {
      const from = Math.round(c.from * FPS);
      const to = Math.round(c.to * FPS);
      return (
        <Sequence
          key={i}
          from={Math.round(toFilm(c.from) * FPS)}
          durationInFrames={to - from}
          name={`narration ${c.from.toFixed(1)}–${c.to.toFixed(1)}`}
          layout="none"
        >
          <Audio
            src={staticFile("alcatraz/audio/narration.mp3")}
            trimBefore={from}
            trimAfter={to}
            volume={(f) =>
              interpolate(f, [0, 2, to - from - 3, to - from - 1], [0, 1, 1, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            }
          />
        </Sequence>
      );
    })}
  </>
);

/**
 * "Behind the Nightmare: Alcatraz" — a sixteen-minute Hebrew-narrated
 * documentary cut to the supplied voice track, with six archival newsreel
 * inserts that play with their own sound.
 *
 * Picture is archival wherever the record exists (U.S. National Archives,
 * Library of Congress, National Park Service, Prelinger and other public
 * archives; see public/alcatraz/SOURCES.md) and drawn where it does not:
 * maps, plans, timelines. No body or wound is shown.
 */
export const AlcatrazDocumentary: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: AZ.black }}>
      {entries.map((e, i) => {
        const next = entries[i + 1];
        const end = next ? next.start : FILM_FRAMES;
        const nextFx = next?.fx;
        const overlap = nextFx === "dissolve" || nextFx === "quick" ? FX_FRAMES[nextFx] : 0;
        const fadeOut = nextFx === "fade" ? FX_FRAMES.fade : !next ? 30 : 0;
        return (
          <Sequence
            key={i}
            from={e.start}
            durationInFrames={Math.max(1, end - e.start + overlap)}
            name={e.name}
            premountFor={45}
          >
            <ShotClock.Provider value={e.at}>
              <Fade fadeIn={FX_FRAMES[e.fx]} fadeOut={fadeOut}>
                {e.node}
              </Fade>
            </ShotClock.Provider>
          </Sequence>
        );
      })}
      <NarrationTrack />
      <Film grain={0.06} vignette={0.55} flicker={0.1} />
    </AbsoluteFill>
  );
};
