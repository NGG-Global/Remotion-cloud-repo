import React from "react";
import { AbsoluteFill } from "remotion";
import { Plane, Stage } from "../engine/camera";
import { lit, mix, type Light } from "../engine/color";
import { Finish, Haze, HomeMovie } from "../engine/look";
import { ShotClockProvider, useShot } from "../engine/shot";
import { EASE, hash, keys, lerp, ramp } from "../engine/time";
import {
  ArchiveBox,
  ArchiveRoom,
  ArchiveShelves,
  BoxTop,
  CaseBoard,
  ClownPoster,
  Electropherogram,
  FILE_SLOTS,
  FamilyTree,
  FlatTV,
  Fluorescent,
  LabBench,
  Monitor,
  PIPETTE_TIP,
  Pipette,
  PosterFrame,
  SCREEN_VW,
  Typed,
  UnknownCard,
  VictimFile,
  WorkTable,
  blendLight,
  monitorCentre,
  slotAt,
  tubeOn,
} from "../kit/archive";
import { CloseHand } from "../kit/hands";
import { Chair, WindowInt } from "../kit/interior";
import { Glow, Pool } from "../kit/light";
import { Folder, Lines, Photo } from "../kit/paper";
import { Balloon, Clipboard, Cup, Grill, Spatula, StringLights } from "../kit/props";
import { Motes, Sky } from "../kit/sky";
import { GroundStrip, Mailbox, PicketFence } from "../kit/street";
import { lightFor, Suburb } from "../kit/suburb";
import { Car } from "../kit/vehicles";
import { type Look, Person, solve } from "../rig/Person";
import { ARCHIVIST, GACY, GACY_WORK, MOTHER, NEIGHBORS, POGO, WORKERS } from "../rig/cast";
import { ARMS_FOLDED, CARRY, SIT, STAND, blend, gesture, idle, pose, reachAngles, talk, walk, walkBetween } from "../rig/pose";
import { BackyardParty, Crew, Driveway, Morning } from "./Opening";

/**
 * 9:13–10:45. The case after the case. The file is shelved, and three
 * decades later it comes off the shelf again: not for Gacy, for names.
 * Eight blank files, a DNA lab, three names, five that stay blank. Then the
 * narration turns to how Gacy is remembered, and the film goes back to the
 * ordinary street and the ordinary man, and ends on the five files.
 *
 * No victim is given a face. The unidentified appear only as files with a
 * blank card, and a card warms only when its name is typed on it.
 */

const DARK: Light = { key: "#5a6a84", ambient: "#040608", amb: 0.62, desat: 0.45 };
const ARCHIVE: Light = { key: "#eef4f0", ambient: "#262c30", amb: 0.16, desat: 0.2 };
const TABLE: Light = { key: "#fff0dc", ambient: "#0e1012", amb: 0.12 };
const LAB: Light = { key: "#eef6ff", ambient: "#20262c", amb: 0.14, desat: 0.1 };
const OFFICE: Light = { key: "#f4efe6", ambient: "#262422", amb: 0.16 };
const EVENING: Light = { key: "#b8c4dc", ambient: "#1a1e26", amb: 0.3, desat: 0.2 };
const LOBBY: Light = { key: "#ffd8a8", ambient: "#1a0e0a", amb: 0.22 };
const POP: Light = { key: "#fff6e8", ambient: "#6a6a70", amb: 0.04 };
const DAY = lightFor("day");

const SHELF_X0 = -1600;
const GACY_SLOT = slotAt(SHELF_X0, 8, 2, 0);
// Off to the left of the eight files, so the wide framing of the files leaves both out.
const BOX_AT = { x: -920, y: -420 };
const GACY_FILE_AT = { x: -900, y: 200 };
const SLEEVE = "#4a5560";
const SKIN = "#dfb492";

const KID: Look = { build: "child", skin: "#e8bc9a", hair: "mop", hairColor: "#8a5a2a", top: "#c84a3a", pants: "#3a4a6a", age: 9 };

/** The wide framing of the eight files: all of them, centred, nothing else cut by the edge. */
const FILES_CENTRE_Y = 5;
const FILES_ZOOM = 1.45;

/** The three names, in the order the narration reads them. */
const NAMES = [
  { i: 1, name: "WILLIAM BUNDY", at: 0.25 },
  { i: 4, name: "JAMES HAAKENSON", at: 1.45 },
  { i: 6, name: "FRANCIS WAYNE ALEXANDER", at: 2.45 },
] as const;

// ------------------------------------------------------- 9:13 not over

export const NotOver: React.FC = () => {
  const { t, dur } = useShot();
  // "...still wasn't really over": a tube stutters on in the far aisle, then the near ones.
  const far = tubeOn(t, 2.5);
  const near = tubeOn(t, 3.7);
  const L = blendLight(DARK, ARCHIVE, far * 0.25 + near * 0.6);
  const back = blendLight(DARK, ARCHIVE, far * 0.6);
  const cam = {
    x: keys(t, [[0, GACY_SLOT.x], [dur, -560]], EASE.inOut),
    y: keys(t, [[0, GACY_SLOT.y - 28], [dur, -330]], EASE.inOut),
    zoom: keys(t, [[0, 3.4], [dur, 1.3]], EASE.inOut),
  };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} bg="#030405">
        <GroundStrip near={-12} far={3.4} color="#3e4244" light={L} />
        <Plane d={3.4}>
          <ArchiveRoom light={back} />
          <ArchiveShelves x0={-3200} x1={3200} light={back} seed={40} />
          {[-2000, -1000, 0, 1000, 2000].map((x) => (
            <Fluorescent key={x} x={x} y={-660} on={far} light={back} />
          ))}
        </Plane>
        <Plane d={0}>
          <ArchiveShelves x0={SHELF_X0} x1={1600} light={L} seed={3} hole={[8, 2, 0]} />
          <ArchiveBox x={GACY_SLOT.x} y={GACY_SLOT.y} light={L} tone="#c4aa7e" label="GACY" />
        </Plane>
        <Plane d={-0.9}>
          {[-1400, -600, 200, 1000].map((x) => (
            <Fluorescent key={x} x={x} y={-640} on={near} light={L} />
          ))}
        </Plane>
      </Stage>
      <Haze t={t} density={0.12} color="#3a4658" />
      <Finish temp={-0.4} vignette={0.85} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------- 9:18 2011

/** Side view of the aisle work table. */
const AisleTable: React.FC<{ readonly x: number; readonly light: Light }> = ({ x, light }) => (
  <g>
    <rect x={x - 280} y={-190} width={560} height={16} fill={lit("#8a9094", light)} />
    {[-260, 250].map((dx) => (
      <rect key={dx} x={x + dx} y={-174} width={10} height={174} fill={lit("#5a6064", light)} />
    ))}
  </g>
);

export const Archive2011: React.FC = () => {
  const { t, dur } = useShot();
  const L = ARCHIVE;
  const TABLE_X = -1150;
  const stopX = GACY_SLOT.x + 100;
  const inW = walkBetween(t, 0, 2.5, 1500, stopX);
  const outW = walkBetween(t, 4.6, 7.2, stopX, TABLE_X + 230);
  const reach = ramp(t, 2.6, 3.2, EASE.inOut);
  const pull = ramp(t, 3.3, 3.9, EASE.inOut);
  const lift = ramp(t, 3.9, 4.5, EASE.inOut);
  const place = ramp(t, 7.3, 8.0, EASE.inOut);
  const px = t < 4.6 ? inW.x : outW.x;

  // Arms: reach to the box on the shelf, then carry, then set it down.
  const j = solve(STAND, ARCHIVIST);
  const grab = { x: px - GACY_SLOT.x, y: GACY_SLOT.y - 30 };
  const ra = reachAngles(j.near.shoulder, grab, j.torsoAngle, j.dims.upper, j.dims.fore);
  let p = idle(pose({ neck: 6 }), t, 3, 0.6);
  p = { ...p, nearUpper: lerp(p.nearUpper, ra.upper, reach), nearFore: lerp(p.nearFore, ra.fore, reach) };
  p = blend(p, idle({ ...CARRY, neck: 4 }, t, 3, 0.4), lift);
  p = blend(p, pose({ ...CARRY, lean: 18, hipDrop: 10, nearUpper: 40, farUpper: 36, neck: 16 }), place);
  if (t < 2.6) {
    p = walk(p, inW.phase, inW.amt);
  } else if (t > 4.6) {
    p = walk(p, outW.phase, outW.amt);
  }
  const held = solve(p, ARCHIVIST);
  const hands = {
    x: px - (held.near.hand.x + held.far.hand.x) / 2,
    y: (held.near.hand.y + held.far.hand.y) / 2 + 30,
  };
  const onShelf = { x: GACY_SLOT.x, y: GACY_SLOT.y + pull * 6 };
  const onTable = { x: TABLE_X + 40, y: -190 };
  const box = place > 0 ? { x: lerp(hands.x, onTable.x, place), y: lerp(hands.y, onTable.y, place) } : lift > 0 ? { x: lerp(onShelf.x, hands.x, lift), y: lerp(onShelf.y, hands.y, lift) } : onShelf;
  const boxScale = 1 + pull * 0.06 - place * 0.06;

  const cam = {
    x: keys(t, [[0, 900], [2.5, stopX + 60], [4.6, stopX], [7.2, TABLE_X + 200], [dur, TABLE_X + 160]], EASE.inOut),
    y: -300,
    zoom: keys(t, [[0, 1.25], [dur, 1.45]], EASE.drift),
  };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} bg="#0c0e10">
        <GroundStrip near={-12} far={3.4} color="#5a5e60" light={L} />
        <Plane d={3.4}>
          <ArchiveRoom light={L} />
          <ArchiveShelves x0={-3200} x1={3200} light={{ ...L, amb: 0.3 }} seed={40} />
          {[-2000, -1000, 0, 1000, 2000].map((x) => (
            <Fluorescent key={x} x={x} y={-660} on={1} light={L} />
          ))}
        </Plane>
        <Plane d={0}>
          <ArchiveShelves x0={SHELF_X0} x1={1600} light={L} seed={3} hole={[8, 2, 0]} />
          {lift <= 0 ? <ArchiveBox x={box.x} y={box.y} light={L} tone="#c4aa7e" label="GACY" s={boxScale} /> : null}
          <AisleTable x={TABLE_X} light={L} />
          <Person x={px} look={ARCHIVIST} facing={-1} light={L} pose={p} />
          {lift > 0 ? <ArchiveBox x={box.x} y={box.y} light={L} tone="#c4aa7e" label="GACY" s={boxScale} /> : null}
        </Plane>
        <Plane d={-0.9}>
          {[-1400, -600, 200, 1000].map((x) => (
            <Fluorescent key={x} x={x} y={-640} on={1} light={L} />
          ))}
        </Plane>
      </Stage>
      <Finish temp={-0.2} vignette={0.7} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------- 9:26 eight files

/** Where a row-0 file comes from (off the bottom of the frame, in a hand). */
const dealFrom = (i: number) => ({ x: FILE_SLOTS[i].x - 220, y: 760 });

export const EightFiles: React.FC = () => {
  const { t, dur } = useShot();
  const L = TABLE;
  const lid = ramp(t, 0.1, 0.9, EASE.inOut);
  const gOut = ramp(t, 0.9, 1.8, EASE.inOut);
  // "...to find names": four files dealt by hand, then four more pushed in.
  const deal = (i: number) => ramp(t, 2.0 + i * 0.55, 2.4 + i * 0.55, EASE.out);
  const push = (i: number) => ramp(t, 4.0 + (i - 4) * 0.2, 4.6 + (i - 4) * 0.2, EASE.out);
  const pos = (i: number) => {
    const s = FILE_SLOTS[i];
    if (i < 4) {
      const k = deal(i);
      const f = dealFrom(i);
      return { x: lerp(f.x, s.x, k), y: lerp(f.y, s.y, k), k };
    }
    const k = push(i);
    return { x: s.x, y: lerp(s.y + 700, s.y, k), k };
  };
  // The hand that deals the first row.
  const active = [0, 1, 2, 3].find((i) => t < 2.55 + i * 0.55) ?? 3;
  const a = pos(active);
  const retract = ramp(t, 2.4 + active * 0.55, 2.55 + active * 0.55);
  const dealing = t > 2.0 && t < 4.3;
  const gFolder = { x: lerp(BOX_AT.x, GACY_FILE_AT.x, gOut), y: lerp(BOX_AT.y, GACY_FILE_AT.y, gOut) };
  const cam = {
    x: keys(t, [[0, BOX_AT.x], [1.1, BOX_AT.x], [1.9, -820], [2.5, -300], [4.0, 150], [dur, 0]], EASE.inOut),
    y: keys(t, [[0, BOX_AT.y], [1.1, BOX_AT.y], [1.9, 40], [2.5, -230], [4.0, -230], [dur, FILES_CENTRE_Y]], EASE.inOut),
    zoom: keys(t, [[0, 2.2], [1.1, 2.2], [1.9, 1.9], [4.0, 1.9], [dur, FILES_ZOOM]], EASE.inOut),
  };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} bg="#0a0b0c">
        <Plane d={0}>
          <WorkTable light={L} />
          <Pool x={0} y={0} rx={1300} ry={900} color="#fff0d8" opacity={0.16} />
          <BoxTop x={BOX_AT.x} y={BOX_AT.y} lid={lid} light={L} files={gOut > 0 ? 8 : 9} />
          {gOut > 0 ? <Folder x={gFolder.x} y={gFolder.y} rot={lerp(0, -8, gOut)} light={L} tab="GACY, J. W." /> : null}
          {FILE_SLOTS.map((s, i) => {
            const q = pos(i);
            return q.k > 0 ? <VictimFile key={i} x={q.x} y={q.y} rot={s.rot * q.k} light={L} /> : null;
          })}
        </Plane>
        <Plane d={-0.8}>
          {gOut > 0 && gOut < 1 ? <CloseHand x={gFolder.x + 60} y={gFolder.y + 150} angle={170} skin={SKIN} sleeve={SLEEVE} s={3.4} curl={0.6} light={L} /> : null}
          {dealing ? (
            <CloseHand
              x={lerp(a.x + 70, a.x + 120, retract)}
              y={lerp(a.y + 150, a.y + 900, retract)}
              angle={175}
              skin={SKIN}
              sleeve={SLEEVE}
              s={3.4}
              curl={0.55}
              light={L}
            />
          ) : null}
        </Plane>
      </Stage>
      <Finish temp={0.3} vignette={0.85} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------- 9:33 DNA

export const DnaLab: React.FC = () => {
  const { t, dur } = useShot();
  const L = LAB;
  const MON = { x: 700, y: -196 };
  const scr = monitorCentre(MON.x, MON.y);
  const vh = (SCREEN_VW * 80) / 130;
  const trace = ramp(t, 0.2, 3.4, EASE.linear);
  const toTree = ramp(t, 3.0, 3.5);
  const tree = ramp(t, 3.4, 5.4, EASE.inOut);
  const match = ramp(t, 5.8, 6.5, EASE.out);
  // The pipette dips into a tube and comes back up.
  const dip = ramp(t, 0.3, 0.7, EASE.inOut) - ramp(t, 1.0, 1.4, EASE.inOut);
  const tube = { x: -620 - 88 + 3 * 24 + 5, y: -196 - 66 };
  const cam = {
    x: keys(t, [[0, tube.x + 20], [1.4, tube.x + 30], [3.2, scr.x]], EASE.inOut),
    y: keys(t, [[0, tube.y - 30], [1.4, tube.y - 30], [3.2, scr.y]], EASE.inOut),
    zoom: keys(t, [[0, 4.4], [1.4, 4.8], [3.2, 7.6], [dur, 10.6]], EASE.inOut),
  };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} bg="#0e1216">
        <Plane d={0}>
          <LabBench light={L} t={t} />
          <Monitor x={MON.x} y={MON.y} light={L} id="dna">
            <g opacity={1 - toTree}>
              <Electropherogram w={SCREEN_VW} h={vh} progress={trace} />
            </g>
            {toTree > 0 ? (
              <g opacity={toTree}>
                <FamilyTree w={SCREEN_VW} h={vh} progress={tree} match={match} />
              </g>
            ) : null}
          </Monitor>
          <CloseHand x={tube.x} y={tube.y - PIPETTE_TIP - 14 + dip * 22} angle={0} skin="#a8c8e8" sleeve="#eef0f2" s={1} curl={0.7} light={L}>
            <Pipette light={L} />
          </CloseHand>
        </Plane>
      </Stage>
      <Finish temp={-0.3} vignette={0.7} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------- 9:40 names

export const Names: React.FC = () => {
  const { t, dur } = useShot();
  const L = TABLE;
  const at = (i: number) => ({ x: FILE_SLOTS[i].x, y: FILE_SLOTS[i].y + 60 });
  const [a, b, c] = NAMES.map((n) => at(n.i));
  const cam = {
    x: keys(t, [[0, a.x], [1.0, a.x], [1.45, b.x], [2.1, b.x], [2.5, c.x], [3.7, c.x], [dur, 0]], EASE.inOut),
    y: keys(t, [[0, a.y], [1.0, a.y], [1.45, b.y], [2.1, b.y], [2.5, c.y], [3.7, c.y], [dur, FILES_CENTRE_Y]], EASE.inOut),
    zoom: keys(t, [[0, 2.3], [3.7, 2.4], [dur, FILES_ZOOM]], EASE.inOut),
  };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} bg="#0a0b0c">
        <Plane d={0}>
          <WorkTable light={L} />
          <Pool x={0} y={0} rx={1300} ry={900} color="#fff0d8" opacity={0.16} />
          <BoxTop x={BOX_AT.x} y={BOX_AT.y} lid={1} light={L} files={8} />
          <Folder x={GACY_FILE_AT.x} y={GACY_FILE_AT.y} rot={-8} light={L} tab="GACY, J. W." />
          {FILE_SLOTS.map((s, i) => {
            const n = NAMES.find((q) => q.i === i);
            const typed = n ? ramp(t, n.at, n.at + 0.3 + n.name.length * 0.03, EASE.linear) : 0;
            const named = n ? ramp(t, n.at + 0.2, n.at + 1.0) : 0;
            return <VictimFile key={i} x={s.x} y={s.y} rot={s.rot} light={L} name={n?.name} typed={typed} named={named} />;
          })}
        </Plane>
      </Stage>
      <Finish temp={0.3} vignette={0.85} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------- 9:44 five remain

const CARD = (i: number) => ({ x: -150 + (i % 4) * 100, y: i < 4 ? -385 : -265 });

export const FiveRemain: React.FC = () => {
  const { t, dur } = useShot();
  // Nearly fifty years: the window light crosses the wall and the room goes to evening.
  const L = blendLight(OFFICE, EVENING, ramp(t, 5.0, 10.0));
  const sun = ramp(t, 2.5, 9.5, EASE.linear);
  // The push ends on two blank cards (2 and 3) and their number strips,
  // framed so no neighbouring card is sliced by the edge. Zoom is eased in
  // log space so the push keeps an even pace.
  const push = ramp(t, 0, dur, EASE.inOut);
  const endX = (CARD(2).x + CARD(3).x) / 2;
  const endY = CARD(2).y + 9;
  const cam = {
    x: lerp(80, endX, push),
    y: lerp(-330, endY, push),
    zoom: 1.2 * Math.pow(11.8 / 1.2, push),
  };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} bg="#141312">
        <Plane d={0.4}>
          <rect x={-3000} y={-1200} width={6000} height={1200} fill={lit("#9a968a", L)} />
          <rect x={-3000} y={0} width={6000} height={600} fill={lit("#4a4640", L)} />
          <WindowInt x={-1350} y={-760} w={420} h={480} outside={mix("#dce6ee", "#3a4a66", ramp(t, 5, 10))} light={L} blinds />
          <path
            d={`M${lerp(-1100, 700, sun)} -720 L${lerp(-700, 1100, sun)} -720 L${lerp(-500, 1300, sun)} -200 L${lerp(-900, 900, sun)} -200 Z`}
            fill="#fff0c8"
            opacity={0.16 * (1 - ramp(t, 7.5, 9.5))}
          />
          <CaseBoard x={0} y={-325} w={440} h={250} light={L}>
            {Array.from({ length: 8 }, (_, i) => {
              const c = CARD(i);
              const n = NAMES.find((q) => q.i === i);
              return (
                <g key={i}>
                  <UnknownCard x={c.x} y={c.y + 325} w={60} h={76} light={L} named={n ? 1 : 0} rot={(hash(i * 7) - 0.5) * 3} />
                  <rect x={c.x - 30} y={c.y + 325 + 44} width={60} height={11} fill={lit("#ece6d6", L)} />
                  {n ? (
                    <Typed x={c.x} y={c.y + 325 + 52} text={n.name} k={1} size={n.name.length > 18 ? 3.6 : 4.6} light={L} />
                  ) : (
                    <g>
                      <text x={c.x - 26} y={c.y + 325 + 52} fontSize={6} fontWeight={700} fill={lit("#4a4236", L)} fontFamily="serif">
                        No.
                      </text>
                      <Lines x={c.x - 12} y={c.y + 325 + 48} w={34} n={1} thick={1.6} color={lit("#8a8272", L)} seed={i} />
                    </g>
                  )}
                  <circle cx={c.x} cy={c.y + 325 - 40} r={3} fill={lit(["#c83a2a", "#3a6ac8", "#e8c23a"][i % 3], L)} />
                </g>
              );
            })}
          </CaseBoard>
        </Plane>
        <Plane d={-0.6}>
          <Person x={330} look={ARCHIVIST} facing={-1} light={L} pose={idle(pose({ ...ARMS_FOLDED, turn: lerp(0, -0.3, ramp(t, 2, 5)) }), t, 12, 0.5)} />
        </Plane>
      </Stage>
      <Finish temp={lerp(0.1, -0.3, ramp(t, 5, 10))} vignette={0.75} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------- 9:55 the clown is easy to remember

/** The one photograph everybody knows, as a news graphic. Generic layout. */
const NewsPogo: React.FC<{ readonly t: number }> = ({ t }) => (
  <g>
    <rect width={SCREEN_VW} height={360} fill="#14223a" />
    <rect x={0} y={292} width={SCREEN_VW} height={34} fill="#a8141a" />
    <rect x={20} y={303} width={220} height={12} fill="#f0e8e0" opacity={0.9} />
    <rect x={0} y={326} width={SCREEN_VW} height={34} fill="#0a1220" />
    {Array.from({ length: 8 }, (_, i) => (
      <rect key={i} x={((((i * 160 - t * 70) % 1280) + 1280) % 1280) - 200} y={338} width={110} height={10} fill="#8aa0c0" />
    ))}
    <rect x={340} y={70} width={260} height={18} fill="#e8e0d8" />
    <rect x={340} y={102} width={200} height={10} fill="#8aa0c0" />
    <rect x={340} y={122} width={230} height={10} fill="#8aa0c0" />
    <rect x={340} y={142} width={160} height={10} fill="#8aa0c0" />
    <g transform="translate(50 36)">
      <rect width={260} height={240} fill="#f2eee4" />
      <rect x={10} y={10} width={240} height={220} fill="#6aa8e0" />
      <Balloon x={60} y={70} color="#e84a3a" t={t} light={POP} />
      <Balloon x={200} y={56} color="#f0c83a" t={t + 1} light={POP} />
      <defs>
        <clipPath id="news-pogo">
          <rect x={10} y={10} width={240} height={220} />
        </clipPath>
      </defs>
      <g clipPath="url(#news-pogo)">
        <g transform="translate(130 400) scale(0.9)">
          <Person x={0} look={POGO} view="front" light={POP} pose={idle(pose({ smile: 1, farUpper: 150, farFore: 40 + Math.sin(t * 4) * 10 }), t, 8, 0.5)} />
        </g>
      </g>
    </g>
  </g>
);

export const NotPogo: React.FC = () => {
  const { t, dur } = useShot();
  const L = blendLight(EVENING, OFFICE, 0.3);
  const cam = {
    x: keys(t, [[0, -220], [dur, -52]], EASE.inOut),
    y: keys(t, [[0, -330], [dur, -380]], EASE.inOut),
    zoom: keys(t, [[0, 1.25], [4.6, 3.0], [dur, 7.6]], EASE.inOut),
  };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} bg="#101012">
        <Plane d={0.5}>
          <rect x={-3000} y={-1200} width={6000} height={1200} fill={lit("#8a8a82", L)} />
          <rect x={-3000} y={0} width={6000} height={600} fill={lit("#3e3a36", L)} />
          <rect x={-900} y={-640} width={260} height={640} fill={lit("#b8bcc0", L)} />
          <rect x={-880} y={-600} width={220} height={320} fill={lit("#2a3a4a", L)} />
        </Plane>
        <Plane d={0}>
          <rect x={-170} y={-300} width={340} height={300} fill={lit("#5a4a3a", L)} />
          <rect x={-170} y={-310} width={340} height={14} fill={lit("#6a5a48", L)} />
          <FlatTV x={0} y={-320} light={L} id="news">
            <NewsPogo t={t} />
          </FlatTV>
          <Glow x={0} y={-380} r={500} color="#ffd8b0" opacity={0.14} />
        </Plane>
        <Plane d={-0.8}>
          <rect x={-760} y={-190} width={520} height={20} fill={lit("#6a6660", L)} />
          <rect x={-740} y={-170} width={16} height={170} fill={lit("#4a4640", L)} />
          <Chair x={-560} facing={1} light={L} folding />
          <Person x={-520} look={ARCHIVIST} facing={1} light={{ ...L, amb: 0.4 }} pose={idle(pose({ ...SIT, farUpper: 30, farFore: 80, turn: 0.2 }), t, 21, 0.4)} farHold={<Cup light={L} />} />
        </Plane>
      </Stage>
      <Finish temp={0} vignette={0.8} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------- 10:03 horror posters

export const Posters: React.FC = () => {
  const { t, dur } = useShot();
  const L = LOBBY;
  const POSTER_X = [-1100, -550, 0, 550, 1100];
  const DOOR_X = 1950;
  // One passer-by stops at the third poster ("...horror posters"), then moves on.
  const inW = walkBetween(t, 0.4, 1.9, 1300, 150);
  const outW = walkBetween(t, 4.0, 5.8, 150, -1500);
  const teen1 = t < 4.0 ? inW : outW;
  const looking = t >= 1.9 && t < 4.0;
  const teen2x = lerp(1500, -1000, ramp(t, 0.6, 5.6, EASE.linear));
  const cam = {
    x: keys(t, [[0, -1150], [4.3, 650], [5.4, DOOR_X - 150], [dur, DOOR_X - 60]], EASE.inOut),
    y: -380,
    zoom: keys(t, [[0, 1.4], [dur, 1.55]], EASE.drift),
  };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} bg="#0e0806">
        <GroundStrip near={-12} far={0.5} color="#4a1e1e" farColor="#3a1616" light={L} />
        <Plane d={0.5}>
          <rect x={-3000} y={-1400} width={6000} height={1400} fill={lit("#4a1a1c", L)} />
          {Array.from({ length: 40 }, (_, i) => (
            <rect key={i} x={-3000 + i * 150} y={-1400} width={3} height={1400} fill={lit("#3a1214", L)} />
          ))}
          <rect x={-3000} y={-160} width={6000} height={160} fill={lit("#2a0e0e", L)} />
          {POSTER_X.map((x, i) => (
            <PosterFrame key={x} x={x} y={-200} light={L} id={`pst${i}`} t={t}>
              <ClownPoster v={i} w={200} h={300} t={t} />
            </PosterFrame>
          ))}
          {/* the glass doors, and an ordinary afternoon outside */}
          <g>
            <rect x={DOOR_X - 360} y={-640} width={720} height={640} fill={lit("#2a2220", L)} />
            <rect x={DOOR_X - 340} y={-620} width={330} height={620} fill="#cfe0ea" />
            <rect x={DOOR_X + 10} y={-620} width={330} height={620} fill="#cfe0ea" />
            <rect x={DOOR_X - 340} y={-300} width={680} height={120} fill="#b8c2b0" />
            <rect x={DOOR_X - 340} y={-180} width={680} height={180} fill="#8a9a78" />
            <rect x={DOOR_X - 340} y={-196} width={680} height={16} fill="#d8d8d0" />
            {[-230, 60, 250].map((dx, i) => (
              <g key={dx}>
                <rect x={DOOR_X + dx - 8} y={-420} width={16} height={130} fill="#5a4a3a" />
                <circle cx={DOOR_X + dx} cy={-450 - i * 10} r={80 + i * 16} fill={["#6a8a5a", "#5a7a4e", "#728e60"][i]} />
              </g>
            ))}
            <path d={`M${DOOR_X - 300} -300 L${DOOR_X - 300} -380 L${DOOR_X - 200} -420 L${DOOR_X - 100} -380 L${DOOR_X - 100} -300 Z`} fill="#c8b8a0" />
            <g transform={`translate(${DOOR_X + 120} -214) scale(0.32)`}>
              <Car x={0} kind="sedan" color="#8a3a2a" light={DAY} />
            </g>
            <rect x={DOOR_X - 20} y={-640} width={40} height={640} fill={lit("#2a2220", L)} />
            <Glow x={DOOR_X} y={-320} r={700} color="#f4f8ff" opacity={0.25} />
          </g>
        </Plane>
        <Plane d={-0.8}>
          <Person x={teen1.x} look={NEIGHBORS[3]} facing={-1} light={L} pose={looking ? idle(pose({ turn: 0.7, neck: -6 }), t, 41) : walk(idle(STAND, t, 41), teen1.phase, teen1.amt)} />
          <Person x={teen2x} look={NEIGHBORS[5]} facing={-1} light={L} pose={walk(idle(STAND, t, 42), Math.abs(teen2x - 1500) / 300, 1)} />
        </Plane>
        <Plane d={-2.4}>
          {[-900, 300, 1500].map((x) => (
            <g key={x}>
              <rect x={x - 8} y={-200} width={16} height={200} fill={lit("#b89a4a", L)} />
              <circle cx={x} cy={-206} r={16} fill={lit("#c8aa5a", L)} />
            </g>
          ))}
          <path d="M-900 -170 Q-300 -90 300 -170 Q900 -90 1500 -170" stroke={lit("#6a0e14", L)} strokeWidth={22} fill="none" />
        </Plane>
      </Stage>
      <Finish temp={0.5} vignette={0.75} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------- 10:09 the ordinary street

export const OrdinaryStreet: React.FC = () => {
  const { t, dur } = useShot();
  const L = DAY;
  // They walk right to left, past the house and out of frame before the camera closes in on him.
  const mom = walkBetween(t, 0, 8.8, 2600, -1300);
  const kidX = mom.x - 150;
  const waveK = ramp(t, 3.6, 4.0) - ramp(t, 5.4, 5.8);
  const momWave = ramp(t, 4.2, 4.5) - ramp(t, 5.2, 5.5);
  const gp = idle(
    pose({
      smile: 1,
      turn: lerp(0, -0.6, ramp(t, 3.0, 3.6)),
      nearUpper: lerp(10, 160, waveK),
      nearFore: lerp(20, 30 + Math.sin(t * 9) * 16 * waveK, waveK),
    }),
    t,
    6,
  );
  const cam = {
    x: keys(t, [[0, 300], [5.0, 1150], [dur, 1480]], EASE.inOut),
    y: keys(t, [[0, -430], [5.0, -420], [dur, -300]], EASE.inOut),
    zoom: keys(t, [[0, 0.46], [5.0, 0.56], [dur, 1.05]], EASE.inOut),
  };
  return (
    <AbsoluteFill>
      <Stage cam={cam} handheld={3} t={t}>
        <Suburb
          t={t}
          mode="day"
          gacyLit={0}
          neighborsLit={0}
          onLawn={
            <>
              <Plane d={-2.6}>
                <Car x={1950} kind="van" color="#e8e2d0" facing={-1} light={L} lettering />
              </Plane>
              <Plane d={-3.4}>
                <Person x={1500} look={GACY_WORK} facing={-1} light={L} pose={gp} farHold={<Clipboard light={L} />} />
              </Plane>
              <Plane d={-8.6}>
                <Person x={mom.x} facing={mom.facing} look={MOTHER} light={L} pose={walk(idle(pose({ smile: 0.6, farUpper: lerp(10, 150, momWave), turn: lerp(0, 0.5, momWave) }), t, 13), mom.phase, mom.amt)} />
                <Person x={kidX} facing={mom.facing} look={KID} light={L} pose={walk(idle(pose({ smile: 1 }), t, 14), mom.phase * 1.35, mom.amt)} />
              </Plane>
            </>
          }
        />
      </Stage>
      <Finish temp={0.3} vignette={0.5} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------- 10:18 how they saw him

/** An earlier shot replayed as home-movie footage, from `offset` seconds in. */
const homeClip = (C: React.FC, offset: number): React.FC => {
  const Clip: React.FC = () => {
    const { dur } = useShot();
    return (
      <HomeMovie>
        <ShotClockProvider lead={-offset} len={dur + offset}>
          <C />
        </ShotClockProvider>
      </HomeMovie>
    );
  };
  return Clip;
};

export const SawOrdinary = homeClip(Morning, 5.6);
export const SawContractor = homeClip(Driveway, 0.9);
export const SawEmployer = homeClip(Crew, 0.2);
/** Over the back fence with the neighbour: the one new clip in the home-movie run. */
const FenceChat: React.FC = () => {
  const { t } = useShot();
  const L = DAY;
  const laugh = Math.max(0, Math.sin(t * 6)) * 0.6;
  const cam = { x: keys(t, [[0, 20], [1.2, -40]]), y: -340, zoom: 1.5 };
  return (
    <AbsoluteFill>
      <Stage cam={cam} handheld={4} t={t}>
        <Sky mode="day" t={t} clouds={0.5} />
        <Plane d={8}>
          <rect x={-3000} y={-900} width={6000} height={900} fill={lit("#c8bca8", L)} />
          {Array.from({ length: 30 }, (_, i) => (
            <rect key={i} x={-3000} y={-900 + i * 30} width={6000} height={3} fill={lit("#b0a490", L)} />
          ))}
          <rect x={-1400} y={-700} width={500} height={330} fill={lit("#5e6f7c", L)} />
        </Plane>
        <GroundStrip near={-9} far={8} color="#6a8052" light={L} />
        <Plane d={0.2}>
          <Person x={-150} look={GACY} light={L} pose={talk(idle(pose({ smile: 1, lean: 6, nearUpper: 40, nearFore: 80, mouth: laugh }), t, 3), t, 3, 0.7)} />
          <Person x={170} look={NEIGHBORS[0]} facing={-1} light={L} pose={idle(pose({ smile: 1, farUpper: 30, farFore: 70, mouth: laugh * 0.7 }), t, 12)} farHold={<Cup light={L} />} />
        </Plane>
        <Plane d={0}>
          <PicketFence x0={-2000} x1={2000} h={210} light={L} />
        </Plane>
      </Stage>
    </AbsoluteFill>
  );
};
export const SawNeighbor = homeClip(FenceChat, 0);
export const SawHost = homeClip(BackyardParty, 0);

// ------------------------------------------------------- 10:24 shake your hand

export const Handshake: React.FC = () => {
  const { t, dur } = useShot();
  const L = DAY;
  const GX = 1560;
  const YX = GX - 236;
  const step = walkBetween(t, -0.4, 0.5, 1720, GX);
  const reach = ramp(t, 1.5, 1.95, EASE.inOut) - ramp(t, 2.9, 3.3, EASE.inOut);
  const pump = Math.sin(t * 11) * 3 * (ramp(t, 1.95, 2.1) - ramp(t, 2.7, 2.9));
  const talkK = ramp(t, 3.0, 3.4);
  const g = solve(STAND, GACY_WORK);
  const ga = reachAngles(g.near.shoulder, { x: 118, y: -205 }, g.torsoAngle, g.dims.upper, g.dims.fore);
  const y = solve(STAND, WORKERS[3]);
  const ya = reachAngles(y.near.shoulder, { x: 118, y: -205 }, y.torsoAngle, y.dims.upper, y.dims.fore);
  let gp = talk(idle(pose({ smile: ramp(t, 0.3, 0.8), nearUpper: lerp(4, ga.upper, reach), nearFore: lerp(8, ga.fore + pump, reach) }), t, 4), t, 4, 0.4 + talkK * 0.5);
  gp = talkK > 0 ? gesture(gp, t, 4, talkK, "far") : gp;
  if (t < 0.5) {
    gp = walk(gp, step.phase, step.amt);
  }
  const yp = idle(pose({ smile: 0.5, nearUpper: lerp(4, ya.upper, reach), nearFore: lerp(8, ya.fore - pump, reach), neck: -4 }), t, 5);
  const cam = {
    x: keys(t, [[0, 1400], [dur, 1470]], EASE.drift),
    y: keys(t, [[0, -290], [dur, -300]], EASE.drift),
    zoom: keys(t, [[0, 1.3], [dur, 1.6]], EASE.drift),
  };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t}>
        <Suburb
          t={t}
          mode="day"
          gacyLit={0}
          neighborsLit={0}
          onLawn={
            <>
              <Plane d={-0.6}>
                <Car x={2150} kind="van" color="#e8e2d0" facing={-1} light={L} lettering />
              </Plane>
              <Plane d={-1.2}>
                <Person x={step.x} look={GACY_WORK} facing={-1} light={L} pose={gp} />
                <Person x={YX} look={WORKERS[3]} facing={1} light={{ ...L, amb: 0.2 }} pose={yp} />
              </Plane>
              <Plane d={-3.2}>
                <Mailbox x={900} light={{ ...L, amb: 0.35 }} />
              </Plane>
            </>
          }
        />
      </Stage>
      <Finish temp={0.3} vignette={0.55} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------- 10:29 less cinematic

export const LessCinematic: React.FC = () => {
  const { t, dur } = useShot();
  const VENT = { x: 100, y: -80 };
  const cam = {
    x: keys(t, [[0, -200], [2.0, -120], [dur, VENT.x]], EASE.inOut),
    y: keys(t, [[0, -520], [2.0, -480], [dur, VENT.y]], EASE.inOut),
    zoom: keys(t, [[0, 0.5], [2.0, 0.56], [dur, 4.4]], EASE.inOut),
  };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t}>
        <Suburb t={t} mode="dusk" gacyLit={ramp(t, 0.6, 1.4)} neighborsLit={0.7} porch={ramp(t, 1.0, 1.6) * 0.8} tv={t > 3.2} />
      </Stage>
      <Haze t={t} density={0.15} color="#5a4a5a" />
      <Finish temp={0.2} vignette={lerp(0.6, 0.95, ramp(t, 3, dur))} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------- 10:35 the five files

/** The Pogo photograph: the easy thing to remember. */
const PogoPrint: React.FC<{ readonly t: number }> = ({ t }) => (
  <g>
    <rect width={200} height={150} fill="#6aa8e0" />
    <Balloon x={40} y={40} color="#e84a3a" t={t} light={POP} />
    <Balloon x={165} y={34} color="#f0c83a" t={t + 1} light={POP} />
    <g transform="translate(100 250) scale(0.6)">
      <Person x={0} look={POGO} view="front" light={POP} pose={pose({ smile: 1, farUpper: 150, farFore: 40 })} />
    </g>
  </g>
);

/** A backyard snapshot: the everyday face. */
const HostPrint: React.FC = () => {
  const warm: Light = { key: "#ffc890", ambient: "#2a1e22", amb: 0.2, desat: 0.25 };
  return (
    <g>
      <rect width={180} height={136} fill="#c89060" />
      <rect y={90} width={180} height={46} fill="#5a6a3a" />
      <g transform="translate(0 20)">
        <StringLights x0={-10} x1={190} y={0} sag={10} />
      </g>
      <g transform="translate(96 214) scale(0.52)">
        <Grill x={120} t={0} light={warm} />
        <Person x={-30} look={GACY} light={warm} pose={pose({ smile: 1, nearUpper: 44, nearFore: 50, farUpper: 30, farFore: 60 })} nearHold={<Spatula light={warm} />} />
      </g>
    </g>
  );
};

export const FinalArchive: React.FC = () => {
  const { t, dur } = useShot();
  const L = TABLE;
  const FIVE = [-560, -280, 0, 280, 560].map((x, i) => ({ x, y: -70 + (hash(i + 70) - 0.5) * 40, rot: (hash(i * 5 + 1) - 0.5) * 5 }));
  const POGO_AT = { x: 170, y: 250 };
  const SNAP_AT = { x: -330, y: 285 };
  // "Pogo was only a costume": the photo is turned over, then slid away.
  const flip = ramp(t, 2.5, 3.1, EASE.inOut);
  const slide = ramp(t, 4.2, 5.2, EASE.inOut);
  const handIn = ramp(t, 1.9, 2.5, EASE.out);
  const handOut = ramp(t, 5.2, 5.8, EASE.in);
  const face = Math.cos(flip * Math.PI);
  const px = POGO_AT.x + slide * 1800;
  const lift = Math.sin(flip * Math.PI) * 0.06;
  const grip = { x: px + 100 * face + 20, y: POGO_AT.y + 40 };
  const hand = {
    x: lerp(POGO_AT.x + 500, grip.x, handIn) + handOut * 500,
    y: lerp(POGO_AT.y + 700, grip.y, handIn) + handOut * 500,
  };
  const cam = {
    // Opens on the whole table, then frames each photograph on its own, low
    // enough that the folders above stay out of frame instead of being sliced.
    x: keys(t, [[0, 0], [2.2, POGO_AT.x], [4.4, POGO_AT.x + 60], [5.6, SNAP_AT.x], [6.6, SNAP_AT.x], [dur, 0]], EASE.inOut),
    y: keys(t, [[0, -60], [2.2, POGO_AT.y + 60], [5.6, SNAP_AT.y + 45], [6.6, SNAP_AT.y + 45], [dur, 70]], EASE.inOut),
    zoom: keys(t, [[0, 1.25], [2.2, 2.4], [5.6, 2.5], [6.6, 2.6], [dur, 0.8]], EASE.inOut),
  };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} bg="#050404">
        <Plane d={0}>
          <WorkTable light={L} />
          <Pool x={0} y={60} rx={1100} ry={820} color="#ffe8c8" opacity={0.2} />
          {FIVE.map((f, i) => (
            <VictimFile key={i} x={f.x} y={f.y} rot={f.rot} light={L} />
          ))}
          <Photo id="snap-host" x={SNAP_AT.x} y={SNAP_AT.y} w={180} h={136} rot={5} light={L} scene={<HostPrint />} />
          <g transform={`translate(${px} ${POGO_AT.y}) scale(${Math.abs(face) * (1 + lift)} ${1 + lift}) translate(${-px} ${-POGO_AT.y})`}>
            <Photo id="snap-pogo" x={px} y={POGO_AT.y} w={200} h={150} rot={-6} light={flip < 0.5 ? POP : L} faceDown={flip >= 0.5} scene={<PogoPrint t={t} />} />
          </g>
          <defs>
            <radialGradient id="fa-dark" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0.3" stopColor="#000" stopOpacity={0} />
              <stop offset="1" stopColor="#000" stopOpacity={0.9} />
            </radialGradient>
          </defs>
          <rect x={-2600} y={-1840} width={5200} height={3800} fill="url(#fa-dark)" />
        </Plane>
        <Plane d={-0.8}>
          <Motes t={t} x={-700} y={-500} w={1400} h={1000} n={24} color="#ffe8c8" opacity={0.25} />
          {handIn > 0 && handOut < 1 ? <CloseHand x={hand.x} y={hand.y} angle={160} skin={SKIN} sleeve={SLEEVE} s={3.4} curl={0.4} light={L} /> : null}
        </Plane>
      </Stage>
      <Finish temp={0.4} vignette={0.9} />
    </AbsoluteFill>
  );
};
