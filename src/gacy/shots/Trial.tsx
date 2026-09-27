import React from "react";
import { AbsoluteFill } from "remotion";
import { Plane, Stage } from "../engine/camera";
import { lit, type Light } from "../engine/color";
import { Finish, Haze } from "../engine/look";
import { useShot } from "../engine/shot";
import { EASE, hash, keys, lerp, noise, ramp } from "../engine/time";
import { Courthouse, PrisonWall } from "../kit/buildings";
import { COURT, CounselTable, CourtRoom, GalleryBench, JuryRoom, PlanExhibit } from "../kit/court";
import { CloseHand } from "../kit/hands";
import { Glow } from "../kit/light";
import { EvidenceBag, Folder, Lines, Photo, Receipt, Sheet, Stamp } from "../kit/paper";
import { Scoreboard } from "../kit/police";
import { Crowd } from "../kit/props";
import { Sky, Snow } from "../kit/sky";
import { GroundStrip } from "../kit/street";
import { lightFor, Suburb } from "../kit/suburb";
import { Car } from "../kit/vehicles";
import { Person } from "../rig/Person";
import {
  ARTIST,
  DEFENSE,
  DEFENSE_2,
  GACY_PRISON,
  GACY_SUIT,
  JUDGE,
  JURORS,
  MOTHER,
  NEIGHBORS,
  PROSECUTOR,
} from "../rig/cast";
import { SIT, STAND, gesture, idle, pose, talk, walk, walkBetween } from "../rig/pose";

/**
 * 7:35–9:18. The scoreboard the narration refuses, the families waiting,
 * and the trial: an actual courtroom, a defence, a court sketch for the
 * "other personalities", the prosecution's exhibits, a jury room clock,
 * a verdict, appeals, and a file that someone would like to close.
 */

const COURT_L: Light = { key: "#fff0dc", ambient: "#2e241c", amb: 0.14, desat: 0.1 };
const SKETCH: Light = { key: "#ffffff", ambient: "#ffffff", amb: 0 };

const seated = (t: number, seed: number, extra: Partial<ReturnType<typeof pose>> = {}) =>
  idle(pose({ ...SIT, nearUpper: 30, nearFore: 60, farUpper: 28, farFore: 64, ...extra }), t, seed, 0.5);

// ----------------------------------------------------------- not a scoreboard

export const ScoreboardShot: React.FC = () => {
  const { t, dur } = useShot();
  const on = [ramp(t, 8.0, 8.3), ramp(t, 9.3, 9.6), ramp(t, 10.4, 10.7)];
  const power = 1 - ramp(t, 14.1, 14.25);
  const boardUp = ramp(t, 0.8, 1.6);
  const L: Light = { key: "#c8d0e0", ambient: "#05060a", amb: 0.6, desat: 0.3 };
  const cam = {
    x: keys(t, [[0, 0], [dur, 0]]),
    y: keys(t, [[0, -300], [dur, -380]], EASE.drift),
    zoom: keys(t, [[0, 0.95], [7.0, 0.72], [dur, 0.64]], EASE.drift),
  };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} bg="#020203">
        <Sky mode="night" t={t} clouds={0.4} />
        <Plane d={10}>
          <g opacity={boardUp}>
            <Scoreboard light={L} t={t} names={["BUNDY", "DAHMER", "GACY"]} lit={on} power={power} />
          </g>
          {power > 0.5
            ? [-3200, 3200].map((fx) => (
                <g key={fx}>
                  <rect x={fx - 20} y={-3000} width={40} height={3000} fill={lit("#2a2c30", L)} />
                  <rect x={fx - 240} y={-3200} width={480} height={200} fill="#f4f0e0" opacity={0.9 * boardUp} />
                  <Glow x={fx} y={-3100} r={1400} color="#f4f0e0" opacity={0.3 * boardUp} />
                </g>
              ))
            : null}
        </Plane>
        <Plane d={-1}>
          <Crowd x0={-9000} x1={9000} n={40} color="#060608" h={380} seed={5} t={t} />
        </Plane>
      </Stage>
      <Finish temp={-0.3} vignette={0.85} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------ people who waited

export const WaitingHome: React.FC = () => {
  const { t, dur } = useShot();
  const cam = { x: keys(t, [[0, 3300], [dur, 8200]], EASE.drift), y: -440, zoom: keys(t, [[0, 0.7], [dur, 0.78]], EASE.drift) };
  const vigil = (b: { x: number; w: number; h: number; y: number }, i: number) => (
    <g>
      {/* someone standing at the window, looking out */}
      <Person x={b.x + b.w * (0.35 + (i % 2) * 0.3)} y={b.y + b.h + 170} s={0.95} look={i % 2 ? MOTHER : NEIGHBORS[(i * 2) % 6]} mode="silhouette" silhouette="#3a2618" pose={idle(pose({ turn: -1 }), t, i + 40, 0.3)} view="front" />
    </g>
  );
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t}>
        <Suburb t={t + 300} mode="night" gacyLit={0.1} neighborsLit={0.95} porch={0} houses={3} insideOthers={(i, b) => (i > 0 ? vigil(b, i) : null)} />
      </Stage>
      <Haze t={t} density={0.2} />
      <Finish temp={-0.5} vignette={0.8} />
    </AbsoluteFill>
  );
};

export const CourtExterior: React.FC = () => {
  const { t, dur } = useShot();
  const L = lightFor("winterDay");
  const cam = { x: keys(t, [[0, -200], [dur, 100]]), y: -1100, zoom: keys(t, [[0, 0.3], [dur, 0.34]], EASE.drift) };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t}>
        <Sky mode="winterDay" t={t} clouds={0.8} />
        <GroundStrip near={-20} far={40} color="#c8d0d8" light={L} />
        <Plane d={4}>
          <Courthouse x={0} light={L} />
        </Plane>
        <Plane d={-4}>
          <Car x={-2400} kind="van" color="#e8e4d8" light={L} snow={0.5} />
          <Crowd x0={-1200} x1={1600} n={12} color={lit("#2a2a2e", L)} h={350} seed={9} t={t} />
        </Plane>
      </Stage>
      <AbsoluteFill>
        <svg width={1920} height={1080}>
          <Snow t={t} density={0.5} />
        </svg>
      </AbsoluteFill>
      <Finish temp={-0.3} vignette={0.6} />
    </AbsoluteFill>
  );
};

// -------------------------------------------------------------- the trial

const Courtroom: React.FC<{
  t: number;
  light?: Light;
  prosecutor?: React.ReactNode;
  defense?: React.ReactNode;
  gacy?: React.ReactNode;
  easel?: React.ReactNode;
  jurorsLook?: number;
  /** x of each spectator on the front bench; each shot places them clear of its frame edges. */
  gallery?: readonly number[];
}> = ({ t, light = COURT_L, prosecutor, defense, gacy, easel, jurorsLook = 0, gallery = GALLERY }) => (
  <>
    <Plane d={4}>
      <CourtRoom light={light} t={t} />
      <Person x={0} y={-400} look={JUDGE} light={light} view="front" pose={seated(t, 1)} shadow={false} />
      {JURORS.map((j, i) => {
        const row = i < 6 ? 0 : 1;
        return (
          <Person
            key={i}
            x={COURT.jury - 560 + (i % 6) * 230 + row * 40}
            y={row === 0 ? -150 : -300}
            s={0.95}
            look={j}
            facing={-1}
            light={light}
            pose={seated(t, i + 10, { turn: lerp(-0.3, 0.5, jurorsLook), neck: row ? -4 : 0 })}
            shadow={false}
          />
        );
      })}
      {easel}
    </Plane>
    <Plane d={0}>
      <CounselTable x={COURT.defense} light={light} />
      <CounselTable x={COURT.prosecution} light={light} />
      {gacy ?? <Person x={COURT.defense} y={-10} look={GACY_SUIT} light={light} pose={seated(t, 3, { turn: -0.2 })} />}
      {defense ?? (
        <>
          <Person x={COURT.defense - 280} y={-10} look={DEFENSE} light={light} pose={seated(t, 4)} />
          <Person x={COURT.defense + 280} y={-10} look={DEFENSE_2} light={light} pose={seated(t, 5)} />
        </>
      )}
      {prosecutor ?? <Person x={COURT.prosecution} y={-10} look={PROSECUTOR} facing={-1} light={light} pose={seated(t, 6)} />}
    </Plane>
    <Plane d={-3.2}>
      <GalleryBench light={{ ...light, amb: 0.4 }} />
      {gallery.map((gx, i) => (
        <Person key={i} x={gx} y={-60} look={[...NEIGHBORS, MOTHER][i % 7]} view="back" light={{ ...light, amb: 0.5 }} pose={seated(t, i + 30)} shadow={false} />
      ))}
    </Plane>
  </>
);

/** Front-bench spectators, seen from behind. */
const GALLERY = Array.from({ length: 9 }, (_, i) => -3400 + i * 800 + hash(i) * 200);

export const CourtWide: React.FC = () => {
  const { t, dur } = useShot();
  const cam = { x: keys(t, [[0, -900], [dur, 60]], EASE.drift), y: keys(t, [[0, -370], [dur, -330]]), zoom: keys(t, [[0, 0.86], [dur, 0.98]], EASE.drift) };
  const sketchK = ramp(t, 0, dur, EASE.linear);
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t}>
        <Courtroom t={t} gallery={[-2300, -1300, -400, 350, 1300]} />
        <Plane d={-5.5}>
          {/* the court artist, pad on her knee */}
          <Person x={-2800} y={0} s={1} look={ARTIST} light={{ ...COURT_L, amb: 0.55 }} pose={seated(t, 60, { nearUpper: 50, nearFore: 80, farUpper: 40, farFore: 90, neck: 18, lean: 12 })} />
          <g transform="translate(-2620 -250) rotate(-20)">
            <rect x={-80} y={-60} width={160} height={120} fill={lit("#efe8d8", COURT_L)} />
            <path d={`M-60 40 Q-20 ${-20 - sketchK * 20} 20 10 T 60 -30`} stroke="#3a332c" strokeWidth={3} fill="none" strokeDasharray={`${sketchK * 200} 220`} />
          </g>
        </Plane>
      </Stage>
      <Finish temp={0.2} vignette={0.65} />
    </AbsoluteFill>
  );
};

export const DefenseArgues: React.FC = () => {
  const { t, dur } = useShot();
  const temple = ramp(t, 1.4, 1.9) * (1 - ramp(t, 3.0, 3.4));
  // the jury fills the right of the frame; the judge and the end juror stay clear of the edges
  const cam = { x: keys(t, [[0, 1320], [dur, 1385]], EASE.drift), y: -250, zoom: keys(t, [[0, 1.45], [dur, 1.6]], EASE.drift) };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t}>
        <Courtroom
          t={t}
          jurorsLook={0.6}
          gallery={[]}
          // his seat is at the frame edge in this framing, so it is left empty
          prosecutor={<g />}
          defense={
            <>
              <Person x={1150} y={0} look={DEFENSE} facing={1} light={COURT_L} pose={gesture(talk(idle(pose({ smile: 0, brow: 0.3, nearUpper: lerp(4, 150, temple), nearFore: lerp(8, 130, temple) }), t, 4), t, 4), t, 4, 0.8)} />
              <Person x={COURT.defense + 280} y={-10} look={DEFENSE_2} light={COURT_L} pose={seated(t, 5)} />
            </>
          }
        />
      </Stage>
      <Finish temp={0.2} vignette={0.7} />
    </AbsoluteFill>
  );
};

/** Court-sketch style: the rig drawn in pencil on paper, with "Jack" beside him. */
export const JackSketch: React.FC = () => {
  const { t, dur } = useShot();
  const ghost = ramp(t, 2.6, 4.0, EASE.inOut);
  const cam = { x: keys(t, [[0, -30], [dur, 50]]), y: keys(t, [[0, -190], [dur, -205]]), zoom: keys(t, [[0, 2.35], [dur, 2.6]], EASE.drift) };
  const paper = "#efe6d2";
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} bg={paper}>
        <Plane d={0}>
          <rect x={-3000} y={-2000} width={6000} height={4000} fill={paper} />
          {Array.from({ length: 60 }, (_, i) => (
            <path key={i} d={`M${-600 + hash(i) * 1200} ${-700 + hash(i + 1) * 900} l${30 + hash(i + 2) * 40} ${-10 - hash(i + 3) * 20}`} stroke="#8a7e6a" strokeWidth={1.2} opacity={0.35} />
          ))}
          <g opacity={0.9}>
            <Person x={-120} y={0} look={GACY_SUIT} mode="sketch" light={SKETCH} pose={seated(t, 3, { turn: -0.2, brow: -0.1 })} />
          </g>
          <g opacity={0.45 * ghost}>
            <Person x={170} y={0} look={{ ...GACY_SUIT, hair: "short", jowls: 0.8 }} mode="sketch" light={SKETCH} pose={seated(t, 9, { turn: -0.8, brow: -0.8 })} />
          </g>
          <rect x={-620} y={-10} width={1000} height={6} fill="#3a332c" opacity={0.5} />
          {/* the defence table, sketched in front of him */}
          <rect x={-470} y={-150} width={900} height={150} fill={paper} opacity={0.55} />
          <path d="M-480 -150 L440 -150 M-460 -150 L-460 -4 M420 -150 L420 -4 M-330 -162 L-190 -160" stroke="#3a332c" strokeWidth={3} opacity={0.55} fill="none" />
          {ghost > 0.4 ? (
            <text x={250} y={-330} fontFamily="Frank Ruhl Libre, serif" fontStyle="italic" fontSize={46} fill="#3a332c" opacity={(ghost - 0.4) * 1.4}>
              “Jack”
            </text>
          ) : null}
        </Plane>
      </Stage>
      <Finish grain={0.5} vignette={0.5} temp={0.3} />
    </AbsoluteFill>
  );
};

export const ProsecutionRises: React.FC = () => {
  const { t, dur } = useShot();
  const stand = ramp(t, 0.3, 1.1);
  const w = walkBetween(t, 1.4, 4.6, COURT.prosecution, 1500);
  const cam = { x: keys(t, [[0, 1010], [dur, 1530]], EASE.inOut), y: -330, zoom: keys(t, [[0, 1.25], [dur, 1.35]], EASE.drift) };
  const pp = t < 1.3 ? pose({ ...SIT, hipDrop: lerp(84, 0, stand), nearThigh: lerp(86, 1, stand), nearKnee: lerp(88, 2, stand), farThigh: lerp(82, -2, stand), farKnee: lerp(84, 2, stand) }) : walk(STAND, w.phase, w.amt);
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t}>
        <Courtroom
          t={t}
          jurorsLook={0.4}
          gallery={[-200, 650, 1700, 2300]}
          easel={<PlanExhibit x={COURT.easel + 500} y={-560} light={COURT_L} s={1.2} />}
          prosecutor={<Person x={t < 1.3 ? COURT.prosecution : w.x} y={-10} look={PROSECUTOR} facing={1} light={COURT_L} pose={idle(pp, t, 6)} />}
        />
      </Stage>
      <Finish temp={0.2} vignette={0.65} />
    </AbsoluteFill>
  );
};

/** Close on the easel: four boards, each on its phrase. */
export const Exhibits: React.FC = () => {
  const { t, dur } = useShot();
  // business (+0.3), evidence (+1.6), lies (+2.5), the areas under the house (+3.3 → end)
  const board = t < 1.4 ? 0 : t < 2.3 ? 1 : t < 3.2 ? 2 : 3;
  const mark = ramp(t, 3.9, 5.6);
  const cam = { x: keys(t, [[0, 0], [dur, 20]]), y: keys(t, [[0, 0], [dur, -10]]), zoom: keys(t, [[0, 2.5], [3.2, 2.6], [dur, 3.1]], EASE.drift) };
  const flip = (a: number) => {
    const d = t - a;
    return d < 0 || d > 0.25 ? 1 : Math.abs(Math.cos((d / 0.25) * Math.PI));
  };
  const scale = board === 1 ? flip(1.4) : board === 2 ? flip(2.3) : board === 3 ? flip(3.2) : 1;
  const content =
    board === 0 ? (
      <g>
        <rect x={-280} y={-200} width={560} height={400} fill={lit("#efe9dc", COURT_L)} />
        <Photo id="ex-van" x={0} y={-10} w={420} h={260} light={COURT_L} scene={<g><rect width={420} height={260} fill="#b8c4cc" /><rect y={190} width={420} height={70} fill="#8a8a82" /><g transform="translate(210 250) scale(0.34)"><Car x={0} kind="van" color="#e8e2d0" light={COURT_L} lettering /></g></g>} />
      </g>
    ) : board === 1 ? (
      <g>
        <rect x={-280} y={-200} width={560} height={400} fill={lit("#efe9dc", COURT_L)} />
        <g transform="scale(0.9)">
          <EvidenceBag x={0} y={0} light={COURT_L}>
            <Receipt x={0} y={10} rot={3} light={COURT_L} />
          </EvidenceBag>
        </g>
      </g>
    ) : board === 2 ? (
      <g>
        <rect x={-280} y={-200} width={560} height={400} fill={lit("#efe9dc", COURT_L)} />
        <Lines x={-220} y={-150} w={440} n={12} gap={24} color={lit("#8a8272", COURT_L)} seed={31} />
        <rect x={-224} y={-2} width={380} height={20} fill="#e8c23a" opacity={0.55} />
      </g>
    ) : null;
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t}>
        <Plane d={1.5}>
          <CourtRoom light={COURT_L} t={t} />
        </Plane>
        <Plane d={0}>
          <g transform={`scale(${scale} 1)`}>
            <PlanExhibit x={0} y={0} light={COURT_L} s={0.95} mark={mark} board={content ?? undefined} />
          </g>
        </Plane>
        <Plane d={-1.4}>
          {board === 3 ? <CloseHand x={lerp(700, 190, ramp(t, 3.3, 4.0))} y={lerp(300, 60, ramp(t, 3.3, 4.0))} angle={-120} skin="#e0b492" sleeve="#2e3440" s={1.6} curl={0.1} light={COURT_L} /> : null}
        </Plane>
      </Stage>
      <Finish temp={0.2} vignette={0.7} />
    </AbsoluteFill>
  );
};

export const KnewExactly: React.FC = () => {
  const { t, dur } = useShot();
  const point = ramp(t, 0.6, 1.2);
  const cam = { x: keys(t, [[0, -620], [dur, -760]], EASE.drift), y: -300, zoom: keys(t, [[0, 1.3], [dur, 1.45]], EASE.drift) };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t}>
        <Courtroom
          t={t}
          jurorsLook={1}
          prosecutor={<Person x={-220} y={0} look={PROSECUTOR} facing={-1} light={COURT_L} pose={talk(idle(pose({ farUpper: lerp(10, 86, point), farFore: lerp(20, 4, point), brow: -0.4 }), t, 6), t, 6)} />}
        />
      </Stage>
      <Finish temp={0.2} vignette={0.7} />
    </AbsoluteFill>
  );
};

export const JuryRoomShot: React.FC = () => {
  const { t, dur } = useShot();
  const minutes = lerp(10, 115, ramp(t, 0.8, 8.4, EASE.inOut));
  const hands = ramp(t, 8.6, 9.3, EASE.out);
  const L: Light = { key: "#fff4e4", ambient: "#3a342c", amb: 0.12 };
  const cam = { x: keys(t, [[0, -60], [dur, 40]], EASE.drift), y: -190, zoom: keys(t, [[0, 1.32], [dur, 1.45]], EASE.drift) };
  // Across the table and nearest the lens, placed so that nobody is cut by
  // the frame edge at either end of the drift; the rest sit outside the frame.
  const far = [-1400, -494, 55, 596, 1300, 1700];
  const near = [-1300, -800, -150, 250, 900, 1400];
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t}>
        <Plane d={2}>
          <JuryRoom light={L} minutes={minutes} />
        </Plane>
        <Plane d={0.6}>
          {JURORS.slice(0, 6).map((j, i) => (
            <Person key={i} x={far[i]} y={-10} s={0.95} look={j} facing={i % 2 ? -1 : 1} light={L} pose={seated(t, i + 50, { nearUpper: lerp(30, 160, hands * (i % 3 === 1 ? 0.9 : 1)), nearFore: lerp(60, 20, hands) })} />
          ))}
        </Plane>
        <Plane d={0}>
          <rect x={-1900} y={-150} width={3800} height={24} fill={lit("#6a4a30", L)} />
          <rect x={-1880} y={-126} width={3760} height={126} fill={lit("#4e3622", L)} />
          {Array.from({ length: 10 }, (_, i) => (
            <rect key={i} x={-1700 + i * 360} y={-166} width={90} height={14} fill={lit("#e8e2d4", L)} />
          ))}
        </Plane>
        <Plane d={-1.6}>
          {JURORS.slice(6).map((j, i) => (
            <Person key={i} x={near[i]} y={60} s={1} look={j} view="back" light={{ ...L, amb: 0.35 }} pose={seated(t, i + 70, { nearUpper: lerp(30, 160, hands), nearFore: lerp(60, 20, hands) })} shadow={false} />
          ))}
        </Plane>
      </Stage>
      <Finish temp={0.2} vignette={0.7} />
    </AbsoluteFill>
  );
};

export const Verdict: React.FC = () => {
  const { t, dur } = useShot();
  const pass = ramp(t, 0.2, 1.3, EASE.inOut);
  const rise = ramp(t, 1.6, 2.4, EASE.inOut);
  const sketch = ramp(t, 5.6, 6.6);
  const cam = {
    x: keys(t, [[0, 300], [1.4, 150], [2.4, COURT.defense + 100], [dur, COURT.defense + 60]], EASE.inOut),
    y: keys(t, [[0, -620], [1.4, -560], [2.4, -260], [dur, -270]], EASE.inOut),
    zoom: keys(t, [[0, 2.2], [1.4, 1.6], [2.4, 1.4], [dur, 1.7]], EASE.inOut),
  };
  const L: Light = { ...COURT_L, desat: sketch * 0.9, amb: lerp(0.14, 0.05, sketch) };
  const gp = pose({ ...SIT, hipDrop: lerp(84, 0, rise), nearThigh: lerp(86, 1, rise), nearKnee: lerp(88, 2, rise), farThigh: lerp(82, -2, rise), farKnee: lerp(84, 2, rise), brow: 0, smile: 0 });
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t}>
        <Courtroom
          t={t}
          light={L}
          gallery={[-3000, -2200, -600, 300, 1100, 1900]}
          gacy={<Person x={COURT.defense} y={-10} look={GACY_SUIT} light={L} pose={idle(gp, t, 3, 0.3)} mode={sketch > 0.5 ? "sketch" : "color"} />}
        />
        <Plane d={3.6}>
          {/* the verdict slip travelling to the bench */}
          <g transform={`translate(${lerp(1100, 200, pass)} ${lerp(-300, -600, pass)}) rotate(${lerp(-8, 4, pass)})`} opacity={1 - ramp(t, 1.5, 1.8)}>
            <rect x={-40} y={-30} width={80} height={60} fill={lit("#f4f0e6", L)} />
            <Lines x={-30} y={-18} w={60} n={3} gap={12} color={lit("#8a8272", L)} seed={2} />
          </g>
        </Plane>
      </Stage>
      {sketch > 0 ? <AbsoluteFill style={{ backgroundColor: "#efe6d2", opacity: sketch * 0.35, mixBlendMode: "multiply" }} /> : null}
      <Finish temp={0.2} vignette={0.7} />
    </AbsoluteFill>
  );
};

// --------------------------------------------------------------- years

export const Appeals: React.FC = () => {
  const { t, dur } = useShot();
  const L: Light = { key: "#d8dce2", ambient: "#1a1c22", amb: 0.3, desat: 0.3 };
  const pages = Math.floor(ramp(t, 0.2, dur - 0.3, EASE.inOut) * 14);
  const cam = { x: keys(t, [[0, -120], [dur, 0]]), y: -250, zoom: keys(t, [[0, 1.5], [dur, 1.65]], EASE.drift) };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} bg="#0c0d10">
        <Plane d={1.4}>
          <rect x={-2000} y={-1400} width={4000} height={1400} fill={lit("#8a8a84", L)} />
          <rect x={-2000} y={0} width={4000} height={600} fill={lit("#5a5a56", L)} />
          <g transform="translate(420 -470)">
            <rect x={-100} y={-120} width={200} height={240} fill={lit("#f0ece0", L)} />
            <rect x={-100} y={-120} width={200} height={56} fill={lit("#8a2a24", L)} />
            <text x={0} y={-80} textAnchor="middle" fontFamily="Frank Ruhl Libre, serif" fontSize={34} fill={lit("#f0ece0", L)}>
              {1980 + pages}
            </text>
          </g>
        </Plane>
        <Plane d={0.3}>
          <rect x={-520} y={-200} width={700} height={24} fill={lit("#4a4e52", L)} />
          <rect x={-500} y={-176} width={16} height={176} fill={lit("#3a3e42", L)} />
          <rect x={140} y={-176} width={16} height={176} fill={lit("#3a3e42", L)} />
          {Array.from({ length: pages }, (_, i) => (
            <rect key={i} x={-460 + (i % 2) * 6} y={-214 - i * 9} width={180} height={8} fill={lit(i % 3 ? "#e8e2d4" : "#d8d0bc", L)} />
          ))}
          <Person x={-80} y={0} look={GACY_PRISON} light={L} pose={idle(pose({ ...SIT, lean: 16, neck: 20, nearUpper: 50, nearFore: 70, farUpper: 46, farFore: 74 }), t, 5, 0.4)} />
        </Plane>
        <Plane d={-1.8}>
          {Array.from({ length: 16 }, (_, i) => (
            <rect key={i} x={-2400 + i * 300} y={-2400} width={34} height={3200} fill={lit("#2a2c30", L)} />
          ))}
        </Plane>
      </Stage>
      <Finish temp={-0.4} vignette={0.75} />
    </AbsoluteFill>
  );
};

export const PrisonNight: React.FC = () => {
  const { t, dur } = useShot();
  const L = lightFor("night");
  const cam = { x: keys(t, [[0, -900], [dur, -300]], EASE.drift), y: -900, zoom: keys(t, [[0, 0.46], [dur, 0.54]], EASE.drift) };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t}>
        <Sky mode="night" t={t} clouds={0.6} />
        <GroundStrip near={-20} far={40} color="#1e2a22" light={L} />
        <Plane d={6}>
          <PrisonWall x0={-9000} x1={9000} light={L} night t={t} gateX={-2000} />
        </Plane>
        <Plane d={-3}>
          {Array.from({ length: 14 }, (_, i) => {
            const x = -3600 + i * 520 + hash(i) * 160;
            const cy = -230 + noise(t * 3 + i, i) * 2;
            return (
              <g key={i}>
                <Person x={x} look={[...NEIGHBORS, MOTHER][i % 7]} mode="silhouette" silhouette="#07080a" facing={1} view="back" pose={idle(STAND, t, i + 20, 0.4)} />
                {i % 3 === 0 ? (
                  <g>
                    <rect x={x + 24} y={cy} width={12} height={40} fill="#d8ccb0" />
                    <circle cx={x + 30} cy={cy - 8} r={7} fill="#ffe0a0" />
                    <Glow x={x + 30} y={cy - 8} r={140} color="#ffc870" opacity={0.55} />
                  </g>
                ) : null}
              </g>
            );
          })}
        </Plane>
        <Plane d={-6.5}>
          {Array.from({ length: 5 }, (_, i) => {
            const x = -2600 + i * 1150 + hash(i + 9) * 300;
            return <Person key={i} x={x} look={[...NEIGHBORS, MOTHER][(i + 3) % 7]} mode="silhouette" silhouette="#040506" facing={1} view="back" pose={idle(STAND, t, i + 60, 0.4)} shadow={false} />;
          })}
        </Plane>
      </Stage>
      <Haze t={t} density={0.3} />
      <Finish temp={-0.6} vignette={0.8} />
    </AbsoluteFill>
  );
};

/** "Caught, tried, executed, the end": the file closes, goes in a box, onto a shelf. */
export const CaseClosed: React.FC = () => {
  const { t, dur } = useShot();
  // Beats (local): caught +3.6, tried +5.1, executed +5.7, "the end" +6.7.
  const shut = ramp(t, 1.0, 2.0, EASE.inOut);
  const stamp = ramp(t, 5.8, 6.0, EASE.out);
  const lid = ramp(t, 6.5, 7.2, EASE.inOut);
  const cam = { x: keys(t, [[0, 0], [dur, 0]]), y: keys(t, [[0, 0], [dur, 40]]), zoom: keys(t, [[0, 2.3], [5.6, 2.1], [dur, 1.2]], EASE.inOut) };
  const L: Light = { key: "#ffe6c0", ambient: "#120e0a", amb: lerp(0.14, 0.5, ramp(t, 6.8, 7.6)) };
  const pages = [3.6, 5.1, 5.7].map((a) => ramp(t, a, a + 0.3, EASE.out));
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} bg="#0a0806">
        <Plane d={0}>
          <rect x={-3000} y={-2000} width={6000} height={4000} fill={lit("#5a4028", L)} />
          {/* the archive box the file goes into */}
          <rect x={-420} y={-260} width={840} height={520} fill={lit("#b8a07a", L)} opacity={ramp(t, 5.9, 6.4)} />
          <g opacity={1 - lid}>
            <Folder
              x={0}
              y={0}
              open={1 - shut}
              light={L}
              tab="GACY, J. W."
              inside={
                <g>
                  <Sheet x={0} y={0} light={L} lines={12} seed={4} />
                  {pages.map((k, i) => (
                    <g key={i} opacity={k}>
                      <Sheet x={(i - 1) * 20} y={-i * 10} rot={(i - 1) * 4} light={L} lines={10} seed={10 + i} />
                    </g>
                  ))}
                </g>
              }
            />
            <Stamp x={0} y={40} text="CLOSED" k={stamp} size={40} />
          </g>
          <rect x={-440} y={-280} width={880} height={560} fill={lit("#a8905e", L)} opacity={lid} />
          <g opacity={lid}>
            <rect x={-440} y={-280} width={880} height={40} fill={lit("#98804e", L)} />
            <rect x={-80} y={-200} width={160} height={36} rx={18} fill={lit("#3a2a18", L)} />
            <rect x={-150} y={20} width={300} height={130} fill={lit("#ece4d2", L)} />
            <Lines x={-120} y={50} w={240} n={3} gap={30} thick={6} color={lit("#5a5040", L)} />
          </g>
        </Plane>
      </Stage>
      <Finish temp={0.4} vignette={0.85} />
    </AbsoluteFill>
  );
};

