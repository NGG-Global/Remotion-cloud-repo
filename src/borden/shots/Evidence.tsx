import React from "react";
import { AbsoluteFill } from "remotion";
import { lit } from "../../gacy/engine/color";
import { CloseHand } from "../../gacy/kit/hands";
import { Glow, Pool } from "../../gacy/kit/light";
import { Lines } from "../../gacy/kit/paper";
import { ANDREW_HAT, ANDREW_HOME, BRIDGET, JUDGES, JURORS, KNOWLTON, LIZZIE, OFFICER, ROBINSON, TOWNSFOLK } from "../rig/cast";
import { HOUSE } from "../kit/house";
import { COURT, Courtroom, ExhibitTable, LanternHall, SeriesSlide } from "../kit/interiors";
import { Axe, ClockFace, Hatchet, HeldDress } from "../kit/props";
import { BENT, EASE, Finish, LIGHT, LYING, Person, Plane, SectionScene, Stage, between, cam, eye, idle, lerp, pose, ramp, seated, speaking, standing, useShot, walker } from "./common";

/**
 * 10:05–11:38. The channel, and then what the prosecution did not have:
 * a witness, a confession, a bloodied dress, a weapon. The hatchet head.
 * And the theory the jury was asked to believe, walked through the house.
 */

const TABLE = { key: "#ffe9c8", ambient: "#1e150c", amb: 0.3 } as const;
const COURT_L = LIGHT.grey;

export const Lantern: React.FC = () => {
  const { t, dur } = useShot();
  const slide = ramp(t, 1.2, 2.6, EASE.out);
  const c = cam(t, [[0, 400], [dur, 0]], [[0, -520], [dur, -640]], [[0, 0.7], [dur, 0.56]]);
  const L = LIGHT.lamp;
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t} bg="#0a0806">
        <Plane d={0}>
          <LanternHall light={L} t={t} slide={<SeriesSlide k={slide} />}>
            {TOWNSFOLK.map((l, i) => (
              <Person key={i} x={-1500 + i * 500} y={0} look={l} light={L} pose={seated(t, i, { neck: -6 }, 0.3)} view="back" />
            ))}
            {TOWNSFOLK.map((l, i) => (
              <Person key={`b${i}`} x={-1250 + i * 500} y={260} look={TOWNSFOLK[(i + 3) % 6]} light={{ ...L, amb: 0.55 }} pose={seated(t, i + 10, { neck: -6 }, 0.3)} view="back" />
            ))}
          </LanternHall>
        </Plane>
      </Stage>
      <Finish temp={0.3} vignette={0.85} />
    </AbsoluteFill>
  );
};

export const BackToLizzie: React.FC = () => {
  const { t, dur } = useShot();
  // The courtroom: Knowlton at his table; the camera pushes to the exhibit tray.
  const c = cam(t, [[0, -300], [dur, COURT.witness - 500]], [[0, -420], [dur, -300]], [[0, 0.85], [dur, 1.6]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <Plane d={0}>
          <Courtroom light={COURT_L} t={t}>
            {JUDGES.map((j, i) => (
              <Person key={i} x={-600 + i * 600} y={COURT.benchTop - 20} look={j} light={COURT_L} pose={seated(t, i + 20, { neck: 4 }, 0.3)} facing={-1} view={i === 1 ? "front" : "3q"} grounded={false} />
            ))}
            {JURORS.slice(0, 8).map((j, i) => (
              <Person key={i} x={COURT.jury - 800 + i * 220} y={-140} look={j} light={COURT_L} pose={seated(t, i, { turn: 0.2 }, 0.4)} facing={-1} />
            ))}
            <ExhibitTable x={COURT.witness - 500} light={COURT_L}>
              <rect x={-220} y={-14} width={440} height={14} rx={4} fill={lit("#5a4a3a", COURT_L)} />
            </ExhibitTable>
            <Person x={COURT.prosecution} look={KNOWLTON} light={COURT_L} pose={seated(t, 30, { lean: 12, neck: 14, nearUpper: 40, nearFore: 80 }, 0.4)} facing={1} />
            <Person x={COURT.defense + 120} look={LIZZIE} light={COURT_L} pose={seated(t, 31, { neck: 2 }, 0.3)} facing={1} />
            <Person x={COURT.defense - 200} look={ROBINSON} light={COURT_L} pose={seated(t, 32, { neck: 6 }, 0.3)} facing={1} />
          </Courtroom>
        </Plane>
      </Stage>
      <Finish temp={-0.1} vignette={0.7} />
    </AbsoluteFill>
  );
};

const Insert: React.FC<{ t: number; children: React.ReactNode; cloth?: string; zoom?: number; hand?: React.ReactNode }> = ({ t, children, cloth = "#2a3a2c", zoom = 2.2, hand }) => (
  <AbsoluteFill>
    <Stage cam={{ x: 0, y: -60, zoom }} t={t} bg="#0c0906">
      <Plane d={0}>
        <rect x={-3000} y={-2000} width={6000} height={4000} fill={lit(cloth, TABLE)} />
        <Pool x={0} y={-300} rx={1300} ry={900} color="#ffd9a0" opacity={0.3} />
        {children}
      </Plane>
      {hand ? <Plane d={-1.4}>{hand}</Plane> : null}
    </Stage>
    <Finish temp={0.2} vignette={0.9} />
  </AbsoluteFill>
);

export const NoDirect: React.FC = () => {
  const { t } = useShot();
  // The exhibit tray, empty.
  return (
    <Insert t={t} zoom={2.4 + t * 0.1}>
      <rect x={-300} y={-40} width={600} height={30} rx={6} fill={lit("#5a4a3a", TABLE)} />
      <rect x={-280} y={-34} width={560} height={18} fill={lit("#3a2e24", TABLE)} />
    </Insert>
  );
};

export const NoWitness: React.FC = () => {
  const { t, dur } = useShot();
  // The empty witness stand.
  const c = cam(t, [[0, COURT.witness], [dur, COURT.witness + 20]], [[0, -300], [dur, -320]], [[0, 1.5], [dur, 1.7]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <Plane d={0}>
          <Courtroom light={COURT_L} t={t} />
        </Plane>
      </Stage>
      <Finish temp={-0.1} vignette={0.8} />
    </AbsoluteFill>
  );
};

export const NoConfession: React.FC = () => {
  const { t, dur } = useShot();
  // 628.9 a blank confession sheet with a pen; 629.9 a clean dress on a hanger.
  const swap = ramp(t, 1.0, 1.4, EASE.inOut);
  return (
    <AbsoluteFill>
      {swap < 1 ? (
        <AbsoluteFill style={{ opacity: 1 - swap }}>
          <Insert t={t} zoom={2.4} hand={<CloseHand x={200} y={-320} angle={-22} light={TABLE} sleeve="#2a2a2e" s={1.6} curl={0.7}><path d="M0 40 L2 120" stroke="#1a1510" strokeWidth={4} /></CloseHand>}>
            <rect x={-150} y={-200} width={300} height={400} fill={lit("#f0ead8", TABLE)} />
            <Lines x={-120} y={-160} w={240} n={2} gap={20} thick={2.5} color={lit("#8a8272", TABLE)} />
          </Insert>
        </AbsoluteFill>
      ) : null}
      {swap > 0 ? (
        <AbsoluteFill style={{ opacity: swap }}>
          <Insert t={t} zoom={1.6} cloth="#3a2a22">
            <path d="M-2 -300 Q-2 -330 20 -330" stroke={lit("#8a8a8a", TABLE)} strokeWidth={6} fill="none" />
            <path d="M-120 -260 L120 -260 L0 -300 Z" fill={lit("#8a6a4a", TABLE)} />
            <g transform="translate(0 -270) scale(2.2)">
              <HeldDress light={TABLE} color="#8fa0b8" stain={0} />
            </g>
          </Insert>
        </AbsoluteFill>
      ) : null}
      {dur < 0 ? null : null}
    </AbsoluteFill>
  );
};

export const NoPrint: React.FC = () => {
  const { t } = useShot();
  // A hatchet handle under a magnifying glass: clean wood.
  const x = lerp(-140, 120, ramp(t, 0.3, 2.4, EASE.inOut));
  return (
    <Insert t={t} zoom={2.6} hand={<CloseHand x={x + 60} y={-420} angle={-20} light={TABLE} sleeve="#2a2a2e" s={1.6} curl={0.7}><g transform="translate(-20 130)"><circle r={70} fill="none" stroke={lit("#6a5a3a", TABLE)} strokeWidth={8} /><circle r={62} fill="#fff" opacity={0.08} /><rect x={-6} y={70} width={12} height={90} fill={lit("#3a2a1e", TABLE)} /></g></CloseHand>}>
      <g transform="rotate(80)">
        <Hatchet light={TABLE} s={2.4} handle={1} />
      </g>
    </Insert>
  );
};

export const WeaponProblem: React.FC = () => {
  const { t, dur } = useShot();
  // The cellar door in the kitchen opens; the camera looks down into the dark.
  const open = ramp(t, 0.3, 1.4, EASE.inOut);
  const c = cam(t, [[0, 1200], [dur, 1250]], [[0, eye(HOUSE.floor, 200)], [dur, HOUSE.cellar - 300]], [[0, 1.5], [dur, 1.3]], EASE.inOut);
  const L = LIGHT.dim;
  return <SectionScene t={t} cam={c} light={L} lamps={{ cellar: open * 0.6 }} props={{}} finish={{ temp: 0.0, vignette: 0.9 }} />;
};

const CellarTools: React.FC<{ light: typeof LIGHT.cellar; glint?: number }> = ({ light, glint = 0 }) => (
  <g>
    <g transform="translate(40 -20) rotate(100)">
      <Axe light={light} s={0.8} />
    </g>
    <g transform="translate(220 -10) rotate(95)">
      <Hatchet light={light} s={1.4} handle={1} rust={0.5} />
    </g>
    <g transform="translate(360 -4) rotate(92)">
      <Hatchet light={light} s={1.2} handle={1} />
    </g>
    <g transform="translate(470 8) rotate(80)">
      <Hatchet light={light} s={1.3} handle={0} rust={0.3} />
    </g>
    {glint > 0 ? <Glow x={470} y={0} r={140} color="#fff0d0" opacity={0.6 * glint} /> : null}
    <rect x={-10} y={120} width={520} height={10} fill={lit("#4a3a2a", light)} />
  </g>
);

export const CellarShot: React.FC = () => {
  const { t, dur } = useShot();
  // The cellar: a lamp finds the shelf of hatchets and axes.
  const lamp = ramp(t, 0.2, 1.2);
  const c = cam(t, [[0, 400], [dur, 800]], [[0, HOUSE.cellar - 220], [dur, HOUSE.cellar - 200]], [[0, 1.0], [dur, 1.5]]);
  const L = LIGHT.cellar;
  return (
    <SectionScene
      t={t}
      cam={c}
      light={L}
      lamps={{ cellar: lamp }}
      props={{ cellarTools: <CellarTools light={L} /> }}
      people={{
        cellar: <Person x={300} look={OFFICER} light={L} pose={idle(pose({ nearUpper: 100, nearFore: 20, neck: 8, lean: 6 }), t, 1, 0.4)} facing={1} nearHold={<g transform="translate(0 20)"><rect x={-8} y={0} width={16} height={40} fill={lit("#8a7a4a", L)} /><Glow x={0} y={0} r={400} color="#ffd080" opacity={0.6 * lamp} /></g>} />,
      }}
      finish={{ temp: 0.0, vignette: 0.9 }}
    />
  );
};

export const HatchetHead: React.FC = () => {
  const { t, dur } = useShot();
  // Close on the handleless head on a cloth; a hand lifts it at 644.6.
  const lift = ramp(t, 3.4, 4.6, EASE.inOut);
  return (
    <Insert t={t} zoom={2.6 + ramp(t, 0, dur) * 0.3} cloth="#3a3a3c" hand={<CloseHand x={-120 + lift * 60} y={-460 + lift * 120} angle={-40} light={TABLE} sleeve="#242a3a" s={1.6} curl={0.7} />}>
      <g transform={`translate(0 ${-lift * 40}) rotate(${75 + lift * 10}) scale(${1 + lift * 0.1})`}>
        <Hatchet light={TABLE} s={2.6} handle={0.12} rust={0.3} />
      </g>
      <ellipse cx={10} cy={30} rx={90} ry={24} fill="#000" opacity={0.35 * (1 - lift)} />
    </Insert>
  );
};

export const NoProof: React.FC = () => {
  const { t, dur } = useShot();
  // The exhibit table in court: the head; Knowlton's hand; the magnifier finds ash, and no blood.
  const c = cam(t, [[0, COURT.witness - 800], [dur, COURT.witness - 500]], [[0, -360], [dur, -280]], [[0, 1.1], [dur, 1.9]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <Plane d={0}>
          <Courtroom light={COURT_L} t={t}>
            {JURORS.slice(0, 8).map((j, i) => (
              <Person key={i} x={COURT.jury - 800 + i * 220} y={-140} look={j} light={COURT_L} pose={seated(t, i, { turn: 0.2, neck: 6 }, 0.4)} facing={-1} />
            ))}
            <ExhibitTable x={COURT.witness - 500} light={COURT_L}>
              <g transform="translate(-40 -6) rotate(80)">
                <Hatchet light={COURT_L} s={1.6} handle={0.12} rust={0.3} />
              </g>
            </ExhibitTable>
            <Person x={COURT.witness - 800} look={KNOWLTON} light={COURT_L} pose={speaking(t, 30, { lean: 6, nearUpper: 70, nearFore: 40, turn: -0.2 }, 0.6)} facing={1} />
          </Courtroom>
        </Plane>
      </Stage>
      <Finish temp={-0.1} vignette={0.75} />
    </AbsoluteFill>
  );
};

export const Theory: React.FC = () => {
  const { t, dur } = useShot();
  // The jury box: twelve men listening.
  const c = cam(t, [[0, COURT.jury - 400], [dur, COURT.jury + 200]], [[0, -360], [dur, -360]], [[0, 1.0], [dur, 1.1]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <Plane d={0}>
          <Courtroom light={COURT_L} t={t}>
            {JURORS.map((j, i) => (
              <Person key={i} x={COURT.jury - 850 + (i % 6) * 320 + (i >= 6 ? 160 : 0)} y={i >= 6 ? -140 : -30} look={j} light={i >= 6 ? { ...COURT_L, amb: 0.3 } : COURT_L} pose={seated(t, i, { turn: 0.15, neck: 4 }, 0.4)} facing={-1} />
            ))}
          </Courtroom>
        </Plane>
      </Stage>
      <Finish temp={-0.1} vignette={0.75} />
    </AbsoluteFill>
  );
};

/** The prosecution's theory is drawn as a theory: Lizzie in blueprint blue. */
const THEORY = { key: "#a8c0e0", ambient: "#0a1020", amb: 0.55, desat: 0.4 } as const;

export const TheoryAbby: React.FC = () => {
  const { t, dur } = useShot();
  // Her figure, in blue, in the guest room doorway; Abby at the bed.
  const c = cam(t, [[0, -300], [dur, -900]], [[0, -620], [dur, eye(HOUSE.upper, 250)]], [[0, 0.55], [dur, 1.3]], EASE.inOut);
  return (
    <SectionScene
      t={t}
      cam={c}
      light={THEORY}
      lamps={{ guest: 1 }}
      props={{ guestDoorOpen: 0.8, guestMade: 0.5 }}
      people={{
        guest: (
          <g>
            <Person x={-880} look={{ ...LIZZIE, top: "#3a5a8a", skirt: "#3a5a8a", pants: "#3a5a8a" }} light={THEORY} pose={idle(BENT, t, 2, 0.4)} facing={1} opacity={0.35} />
            <Person x={-760} look={LIZZIE} light={THEORY} pose={idle(pose({ nearUpper: 120 + Math.sin(t * 2) * 8, nearFore: 20 }), t, 1, 0.4)} facing={-1} opacity={0.9} nearHold={<Hatchet light={THEORY} s={1.2} handle={1} />} />
          </g>
        ),
      }}
      finish={{ temp: -0.6, vignette: 0.85 }}
    />
  );
};

export const Cleans: React.FC = () => {
  const { t, dur } = useShot();
  // The washstand: hands in a basin; then she sits and waits.
  const sit = ramp(t, 3.3, 4.4, EASE.inOut);
  const c = cam(t, [[0, -1250], [3.3, -1250], [dur, -1000]], [[0, eye(HOUSE.upper, 220)], [dur, eye(HOUSE.upper, 250)]], [[0, 1.8], [3.3, 1.8], [dur, 1.4]], EASE.inOut);
  const wash = pose({ lean: 16, neck: 12, nearUpper: 60 + Math.sin(t * 5) * 5, nearFore: 60, farUpper: 56, farFore: 64 });
  return (
    <SectionScene
      t={t}
      cam={c}
      light={THEORY}
      lamps={{ guest: 1, lizzie: 0.8 }}
      props={{ guestDoorOpen: 0.3 }}
      people={{
        guest: sit < 1 ? <Person x={-1240} look={LIZZIE} light={THEORY} pose={idle(wash, t, 1, 0.3)} facing={-1} opacity={1 - sit} /> : null,
        lizzie: sit > 0 ? <Person x={-500} look={LIZZIE} light={THEORY} pose={seated(t, 1, { neck: 2, lids: 0.9 }, 0.3)} facing={1} opacity={sit} /> : null,
      }}
      finish={{ temp: -0.6, vignette: 0.85 }}
    />
  );
};

export const Ninety: React.FC = () => {
  const { t, dur } = useShot();
  const m = lerp(570, 660, ramp(t, 0.1, 1.6, EASE.inOut));
  return (
    <Insert t={t} zoom={2.2 + t * 0.1} cloth="#1a2a3a">
      <path d="M-140 60 L140 60 L140 -80 Q140 -200 0 -200 Q-140 -200 -140 -80 Z" fill={lit("#1a2432", THEORY)} />
      <ClockFace x={0} y={-60} r={110} minutes={m} light={THEORY} face="#d8e4f0" />
      {dur < 0 ? null : null}
    </Insert>
  );
};

export const FatherHome: React.FC = () => {
  const { t, dur } = useShot();
  // The whole house in blue: Andrew comes in below, Bridget in the attic, people on the street, Lizzie waiting upstairs.
  const w = walker(t, 0.2, 2.2, -1500, -1150, undefined, 1);
  const c = cam(t, [[0, -200], [dur, 0]], [[0, -600], [dur, -640]], [[0, 0.55], [dur, 0.5]]);
  return (
    <SectionScene
      t={t}
      cam={c}
      light={THEORY}
      lamps={{ guest: 1, lizzie: 1, hall: 1, attic: 1, sitting: 1, kitchen: 1, dining: 1, parents: 0.6, backhall: 0.6 }}
      props={{ frontDoorOpen: 0.6, guestDoorOpen: 0.3 }}
      people={{
        hall: <Person x={Math.max(w.x, -1380)} look={t > 1.4 ? ANDREW_HOME : ANDREW_HAT} light={THEORY} pose={w.pose} facing={1} />,
        lizzie: <Person x={-500} look={LIZZIE} light={THEORY} pose={seated(t, 1, { neck: 2 }, 0.3)} facing={1} />,
        attic: <Person x={-40} y={-100} look={BRIDGET} light={THEORY} pose={idle(pose({ ...LYING, lids: 0.2 }), t, 5, 0.2)} facing={1} grounded={false} />,
      }}
      yard={
        <Plane d={-6}>
          {TOWNSFOLK.slice(0, 3).map((l, i) => (
            <Person key={i} x={-3400 + i * 500} look={l} light={THEORY} pose={standing(t, i + 20)} facing={1} opacity={ramp(t, 3.8, 4.4)} />
          ))}
        </Plane>
      }
      finish={{ temp: -0.6, vignette: 0.85 }}
    />
  );
};

export const SecondMurder: React.FC = () => {
  const { t, dur } = useShot();
  // Her blue figure comes down the front stairs to the sitting-room door; the picture stops there.
  const down = ramp(t, 0.3, 3.4, EASE.inOut);
  const c = cam(t, [[0, -900], [dur, -800]], [[0, eye(HOUSE.upper, 250)], [dur, eye(HOUSE.floor, 250)]], [[0, 1.2], [dur, 1.3]], EASE.inOut);
  return (
    <SectionScene
      t={t}
      cam={c}
      light={THEORY}
      lamps={{ guest: 0.6, hall: 1, sitting: 1 }}
      props={{ guestDoorOpen: 0.3 }}
      people={{
        hall: <Person x={lerp(-1030, -1330, down)} y={lerp(HOUSE.upper - HOUSE.floor, 0, down)} look={LIZZIE} light={THEORY} pose={pose({ lean: 6, nearThigh: 30 + Math.sin(t * 6) * 20, farThigh: 30 - Math.sin(t * 6) * 20, nearKnee: 40, farKnee: 40, nearUpper: 110, nearFore: 20 })} facing={-1} grounded={false} nearHold={<Hatchet light={THEORY} s={1.2} handle={1} />} />,
        sitting: <Person x={-470} y={-60} look={ANDREW_HOME} light={THEORY} pose={idle(pose({ ...LYING, lids: 0.1 }), t, 1, 0.25)} facing={1} grounded={false} />,
      }}
      finish={{ temp: -0.6, vignette: 0.9 }}
    />
  );
};

export const NoMark: React.FC = () => {
  const { t, dur } = useShot();
  // Three quick beats: Lizzie in the hall in a clean dress; the neighbours' windows, nobody looking; an empty outline where a weapon should be.
  const b = t < 2.6 ? 0 : t < 4.6 ? 1 : 2;
  const cA = { x: -1100, y: eye(HOUSE.floor, 250), zoom: 1.5 + t * 0.03 };
  const cB = { x: -2600, y: -640, zoom: 0.7 + (t - 2.6) * 0.02 };
  return (
    <AbsoluteFill>
      {b === 0 ? (
        <SectionScene t={t} cam={cA} light={THEORY} lamps={{ hall: 1 }} props={{ frontDoorOpen: 0 }} people={{ hall: <Person x={-1100} look={LIZZIE} light={THEORY} pose={standing(t, 1, { turn: -0.6 })} facing={1} /> }} finish={{ temp: -0.6, vignette: 0.85 }} />
      ) : b === 1 ? (
        <SectionScene t={t} cam={cB} open={0} night={false} light={THEORY} finish={{ temp: -0.6, vignette: 0.85 }} yard={<Plane d={-6}>{TOWNSFOLK.slice(0, 2).map((l, i) => <Person key={i} x={-3400 + i * 500} look={l} light={THEORY} pose={standing(t, i + 20, { turn: 0.6 })} facing={1} />)}</Plane>} />
      ) : (
        <Insert t={t} zoom={2.2} cloth="#1a2a3a">
          <g transform="rotate(80)" opacity={0.5}>
            <path d="M-6 -4 L8 -4 L8 12 L-6 12 Z M8 -10 L30 -14 Q36 0 30 16 L8 14 Z M-4 0 L4 0 L5 64 L-5 64 Z" fill="none" stroke="#a8c0e0" strokeWidth={2} strokeDasharray="6 6" transform="scale(2.6)" />
          </g>
          {dur < 0 ? null : null}
        </Insert>
      )}
    </AbsoluteFill>
  );
};

export const Possible: React.FC = () => {
  const { t, dur } = useShot();
  // The jury: a juror shrugs; the bench; the gavel comes down at 696.9.
  const shrug = between(t, 0.6, 2.2, 0.4);
  const gavel = t > 5.3 ? Math.exp(-(t - 5.3) * 8) : 0;
  const c = cam(t, [[0, COURT.jury - 200], [3.0, COURT.jury - 200], [4.2, 0], [dur, 0]], [[0, -360], [3.0, -360], [4.2, -700], [dur, -700]], [[0, 1.1], [3.0, 1.1], [4.2, 0.95], [dur, 1.0]], EASE.inOut);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <Plane d={0}>
          <Courtroom light={COURT_L} t={t}>
            {JUDGES.map((j, i) => (
              <Person key={i} x={-600 + i * 600} y={COURT.benchTop - 20} look={j} light={COURT_L} pose={seated(t, i + 20, { neck: 4, nearUpper: i === 1 ? 60 - gavel * 30 : 30, nearFore: i === 1 ? 60 : 60 }, 0.3)} facing={-1} view={i === 1 ? "front" : "3q"} grounded={false} />
            ))}
            {JURORS.slice(0, 6).map((j, i) => (
              <Person key={i} x={COURT.jury - 850 + i * 320} y={-30} look={j} light={COURT_L} pose={seated(t, i, { turn: 0.15, neck: 4, nearUpper: i === 2 ? 30 + shrug * 30 : 30, nearFore: i === 2 ? 60 + shrug * 30 : 60, farUpper: i === 2 ? 28 + shrug * 30 : 28 }, 0.4)} facing={-1} />
            ))}
          </Courtroom>
        </Plane>
      </Stage>
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: gavel * 0.25 }} />
      <Finish temp={-0.1} vignette={0.75} />
    </AbsoluteFill>
  );
};

