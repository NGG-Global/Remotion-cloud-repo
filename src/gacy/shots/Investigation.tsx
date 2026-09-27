import React from "react";
import { AbsoluteFill } from "remotion";
import { Plane, Stage } from "../engine/camera";
import { lit, mix, type Light } from "../engine/color";
import { Finish } from "../engine/look";
import { useShot } from "../engine/shot";
import { EASE, keys, lerp, ramp } from "../engine/time";
import { Castle } from "../kit/buildings";
import { CloseHand } from "../kit/hands";
import { Pool } from "../kit/light";
import { BW, EvidenceBag, Folder, Handwrite, Lines, Notebook, Photo, Receipt, Sheet, Stamp } from "../kit/paper";
import { CarInterior, StationRoom, Theater, TheaterRows } from "../kit/police";
import { Cup, Shovel } from "../kit/props";
import { GacyLivingRoom, LIVING } from "../kit/rooms";
import { Motes, Snow } from "../kit/sky";
import { lightFor, SUBURB, Suburb } from "../kit/suburb";
import { Car } from "../kit/vehicles";
import { Person } from "../rig/Person";
import { DETECTIVE, DETECTIVE_2, FATHER, GACY, GACY_COAT, MOTHER, OFFICER, OFFICER_2, OFFICER_COAT, POGO } from "../rig/cast";
import { STAND, gesture, idle, pose, talk, walk, walkBetween } from "../rig/pose";
import { TYPE } from "../theme";

/**
 * 5:31–6:53. The investigation. Shots get shorter and busier: a report, a
 * notebook, a record, a warrant, a search, a receipt, a stakeout, an
 * invitation, and one quiet beat when a police officer smells something.
 */

const STATION: Light = { key: "#eef6f0", ambient: "#2a302e", amb: 0.14, desat: 0.1 };
const DESK: Light = { key: "#ffe6c0", ambient: "#1a140e", amb: 0.12 };
const WN = lightFor("winterNight");
const WD = lightFor("winterDay");
const ROOM_WINTER: Light = { key: "#ffe8c8", ambient: "#3a3028", amb: 0.14 };

const DeskTop: React.FC<{ light: Light }> = ({ light }) => (
  <g>
    <rect x={-3000} y={-2000} width={6000} height={4000} fill={lit("#5a4028", light)} />
    {Array.from({ length: 24 }, (_, i) => (
      <rect key={i} x={-3000} y={-2000 + i * 170} width={6000} height={3} fill={lit("#4a3220", light)} opacity={0.6} />
    ))}
    <Pool x={-200} y={-100} rx={1400} ry={1000} color="#ffd8a0" opacity={0.35} blend="soft-light" />
  </g>
);

const Mugshot: React.FC = () => (
  <g>
    <rect width={180} height={220} fill="#b8b6b0" />
    {Array.from({ length: 6 }, (_, i) => (
      <rect key={i} x={0} y={30 + i * 30} width={180} height={2} fill="#8a8882" />
    ))}
    <g transform="translate(90 330) scale(0.78)">
      <Person x={0} look={{ ...GACY, top: "#5a5a58", shirt: "#8a8a88" }} light={BW} view="front" pose={pose({ smile: 0 })} />
    </g>
  </g>
);

// --------------------------------------------------------- the report

export const Station: React.FC = () => {
  const { t, dur } = useShot();
  const det = walkBetween(t, 1.6, 3.8, 1400, 520);
  const cam = { x: keys(t, [[0, 0], [dur, -120]]), y: -400, zoom: keys(t, [[0, 1.6], [dur, 2.0]], EASE.drift) };
  return (
    <AbsoluteFill>
      <Stage cam={cam} handheld={2} t={t}>
        <Plane d={1.2}>
          <StationRoom light={STATION} t={t} minutes={t * 2} />
          <Person x={-300} y={-10} look={OFFICER} light={STATION} facing={1} pose={idle(pose({ lean: 10, nearUpper: 40, nearFore: 70, farUpper: 40, farFore: 72, neck: 10 }), t, 3)} />
          <Person x={det.x} look={DETECTIVE} facing={-1} light={STATION} pose={det.amt > 0 ? walk(STAND, det.phase, det.amt) : talk(idle(pose({ brow: -0.2 }), t, 4), t, 4, 0.5)} />
        </Plane>
        <Plane d={-0.8}>
          <Person x={-60} look={FATHER} light={STATION} facing={1} pose={talk(idle(pose({ brow: -0.5, turn: 0.2 }), t, 5), t, 5, 0.8)} />
          <Person x={-330} look={MOTHER} light={STATION} facing={1} pose={idle(pose({ brow: -0.6, farUpper: 14, farFore: 90, nearUpper: 12, nearFore: 88 }), t, 6, 0.5)} />
        </Plane>
      </Stage>
      <Finish temp={-0.3} vignette={0.7} />
    </AbsoluteFill>
  );
};

// ----------------------------------------------------- the notebook

export const NotebookShot: React.FC = () => {
  const { t, dur } = useShot();
  const l1 = ramp(t, 0.15, 1.2, EASE.linear);
  const l2 = ramp(t, 2.0, 3.5, EASE.linear);
  const l3 = ramp(t, 4.3, 4.9, EASE.linear);
  const under = ramp(t, 4.9, 5.2, EASE.out);
  const pen = t < 1.2 ? { x: -120 + l1 * 260, y: -94 } : t < 3.6 ? { x: -120 + l2 * 280, y: -46 } : { x: -110 + l3 * 150 + under * 20, y: 26 };
  const cam = { x: keys(t, [[0, -20], [dur, 30]]), y: keys(t, [[0, -60], [dur, -20]]), zoom: keys(t, [[0, 3.6], [dur, 4.4]], EASE.drift) };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} bg="#120c08">
        <Plane d={0}>
          <DeskTop light={DESK} />
          <Notebook x={0} y={0} light={DESK}>
            <Handwrite id="nb1" x={-120} y={-94} text="Robert Piest, 15" k={l1} size={30} />
            <Handwrite id="nb2" x={-120} y={-46} text="last seen: contractor" k={l2} size={28} />
            <Handwrite id="nb3" x={-110} y={26} text="GACY" k={l3} size={46} color="#6a1a18" />
            <rect x={-110} y={36} width={150 * under} height={4} fill="#6a1a18" />
          </Notebook>
        </Plane>
        <Plane d={-0.6}>
          <CloseHand x={pen.x + 30} y={pen.y - 110} angle={-150} skin="#d8a888" sleeve="#6a5a46" s={2.2} curl={0.6} light={DESK}>
            <rect x={-4} y={30} width={8} height={60} rx={3} fill="#1a1a1a" transform="rotate(-25 0 30)" />
          </CloseHand>
        </Plane>
      </Stage>
      <Finish temp={0.5} vignette={0.8} />
    </AbsoluteFill>
  );
};

// -------------------------------------------------- the old conviction

export const Cabinet: React.FC = () => {
  const { t, dur } = useShot();
  const open = ramp(t, 0.5, 1.3, EASE.out);
  const cam = { x: keys(t, [[0, 950], [dur, 1020]]), y: -380, zoom: keys(t, [[0, 2.1], [dur, 2.4]], EASE.drift) };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t}>
        <Plane d={0}>
          <StationRoom light={STATION} t={t} cabinetOpen={open} minutes={40} />
          <Person x={1150} look={DETECTIVE_2} facing={-1} light={STATION} pose={idle(pose({ lean: 12, nearUpper: lerp(10, 70, open), nearFore: lerp(10, 40, open), neck: 14 }), t, 5)} />
        </Plane>
      </Stage>
      <Finish temp={-0.3} vignette={0.7} />
    </AbsoluteFill>
  );
};

export const RecordFile: React.FC = () => {
  const { t, dur } = useShot();
  const open = ramp(t, 0.3, 1.1, EASE.inOut);
  const stamp = ramp(t, 1.9, 2.1, EASE.out);
  const cam = { x: keys(t, [[0, 0], [dur, 60]]), y: keys(t, [[0, 0], [dur, -20]]), zoom: keys(t, [[0, 2.6], [dur, 3.3]], EASE.drift) };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} bg="#120c08">
        <Plane d={0}>
          <DeskTop light={DESK} />
          <Folder
            x={0}
            y={0}
            open={open}
            light={DESK}
            tab="GACY, J. W."
            inside={
              <g>
                <Sheet x={0} y={0} w={220} h={290} light={DESK} lines={0} />
                <Photo id="mug" x={-50} y={-60} w={90} h={110} border={4} light={DESK} scene={<g transform="scale(0.5)"><Mugshot /></g>} />
                <Lines x={20} y={-110} w={80} n={6} gap={16} color={lit("#8a8272", DESK)} seed={3} />
                <Lines x={-90} y={20} w={180} n={5} gap={16} color={lit("#8a8272", DESK)} seed={9} />
                <Stamp x={30} y={100} text="IOWA 1968" k={stamp} size={22} />
              </g>
            }
          />
        </Plane>
      </Stage>
      <Finish temp={0.5} vignette={0.8} />
    </AbsoluteFill>
  );
};

export const Warrant: React.FC = () => {
  const { t, dur } = useShot();
  const sign = ramp(t, 1.1, 2.3, EASE.linear);
  const seal = ramp(t, 2.6, 2.8, EASE.out);
  const cam = { x: keys(t, [[0, 0], [dur, 30]]), y: keys(t, [[0, 10], [dur, 40]]), zoom: keys(t, [[0, 2.5], [dur, 3.0]], EASE.drift) };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} bg="#120c08">
        <Plane d={0}>
          <DeskTop light={DESK} />
          <g transform="rotate(-3)">
            <Sheet x={0} y={0} w={250} h={330} light={DESK} lines={0} />
            <text x={0} y={-120} textAnchor="middle" fontFamily={TYPE.serif} fontWeight={700} fontSize={22} letterSpacing={3} fill={lit("#2a2622", DESK)}>
              SEARCH WARRANT
            </text>
            <Lines x={-100} y={-90} w={200} n={9} gap={16} color={lit("#8a8272", DESK)} seed={21} />
            <path d={`M-90 110 q 20 -20 40 0 t 40 0 t 40 -10 t 40 5`} stroke="#1a2a5a" strokeWidth={3} fill="none" strokeDasharray={`${sign * 200} 220`} />
            <rect x={-100} y={120} width={120} height={1.5} fill={lit("#6a645a", DESK)} />
            <g opacity={seal} transform={`translate(70 110) scale(${1.3 - seal * 0.3})`}>
              <circle r={30} fill="none" stroke="#9a8a5a" strokeWidth={3} />
              <circle r={22} fill="none" stroke="#9a8a5a" strokeWidth={1.5} />
            </g>
          </g>
        </Plane>
        <Plane d={-0.6}>
          <CloseHand x={-60 + sign * 160} y={-10} angle={-150} skin="#dcb294" sleeve="#16181c" s={2.0} curl={0.6} light={DESK}>
            <rect x={-4} y={30} width={8} height={60} rx={3} fill="#1a1a1a" transform="rotate(-25 0 30)" />
          </CloseHand>
        </Plane>
      </Stage>
      <Finish temp={0.5} vignette={0.8} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------ the search

export const SearchHouse: React.FC = () => {
  const { t, dur } = useShot();
  const drawers = ramp(t, 0.2, 1.8, EASE.inOut);
  const shrug = ramp(t, 0.4, 0.8) * (1 - ramp(t, 1.4, 1.8));
  const crouch = ramp(t, 2.3, 3.0);
  const cam = { x: keys(t, [[0, 300], [dur, 560]]), y: -320, zoom: keys(t, [[0, 1.45], [dur, 1.65]], EASE.drift) };
  return (
    <AbsoluteFill>
      <Stage cam={cam} handheld={3} t={t}>
        <Plane d={0}>
          <GacyLivingRoom light={ROOM_WINTER} lamp={0.7} night={false} snow t={t} drawers={drawers} />
          <Person x={460} look={OFFICER} facing={1} light={ROOM_WINTER} pose={idle(pose({ lean: 16, nearUpper: 70, nearFore: 40, neck: 14 }), t, 3)} />
          <Person x={-160} look={DETECTIVE} facing={1} light={ROOM_WINTER} pose={idle(pose({ nearUpper: lerp(4, 50, shrug), nearFore: lerp(8, 110, shrug), farUpper: lerp(-3, 50, shrug), farFore: lerp(10, 110, shrug), brow: -0.3 }), t, 4)} />
          <Person x={1000} look={OFFICER_2} facing={-1} light={ROOM_WINTER} pose={idle(pose({ lean: lerp(0, 40, crouch), hipDrop: lerp(0, 70, crouch), nearThigh: lerp(1, 60, crouch), nearKnee: lerp(2, 100, crouch), farThigh: lerp(-2, 50, crouch), farKnee: lerp(2, 90, crouch), nearUpper: lerp(4, 70, crouch), nearFore: 20, neck: 20 * crouch }), t, 5)} />
          <path d="M1180 0 L1170 -110 L1270 -110 L1260 0 Z" fill={lit("#6a6a60", ROOM_WINTER)} />
        </Plane>
      </Stage>
      <Finish temp={0.1} vignette={0.65} />
    </AbsoluteFill>
  );
};

export const ReceiptShot: React.FC = () => {
  const { t, dur } = useShot();
  const lift = ramp(t, 0.2, 1.4, EASE.inOut);
  const bag = ramp(t, 1.5, 2.4, EASE.inOut);
  const memory = ramp(t, 3.4, 3.8) * (1 - ramp(t, 5.2, 5.6));
  const cam = { x: keys(t, [[0, 0], [dur, 20]]), y: keys(t, [[0, 30], [dur, 0]]), zoom: keys(t, [[0, 3.2], [dur, 3.8]], EASE.drift) };
  const parka: Light = { key: "#e8ecf0", ambient: "#3a4040", amb: 0.2, desat: 0.55 };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} bg="#0e0b08">
        <Plane d={0}>
          <DeskTop light={DESK} />
          {bag < 1 ? (
            <g>
              {/* wastebasket clutter */}
              {Array.from({ length: 8 }, (_, i) => (
                <rect key={i} x={-220 + (i % 4) * 120} y={-120 + Math.floor(i / 4) * 160} width={110} height={70} fill={lit(["#d8d0bc", "#c8c0a8", "#e0dccc"][i % 3], DESK)} transform={`rotate(${(i * 37) % 40 - 20})`} />
              ))}
            </g>
          ) : null}
          <EvidenceBag x={0} y={0} rot={-4} light={DESK}>
            {bag > 0.6 ? <Receipt x={0} y={10} rot={3} light={DESK} s={1} /> : null}
          </EvidenceBag>
          {bag < 0.6 ? <Receipt x={lerp(60, 0, bag)} y={lerp(40, -60, lift) + bag * 70} rot={lerp(20, 3, lift)} light={DESK} s={1} /> : null}
        </Plane>
        <Plane d={-0.6}>
          <CloseHand x={lerp(260, 40, lift) - bag * 30} y={lerp(-300, -170, lift) - bag * 40} angle={-160} skin="#e8e8e0" sleeve="#26334a" s={2.1} curl={0.6} light={DESK} />
        </Plane>
      </Stage>
      {memory > 0 ? (
        <AbsoluteFill style={{ opacity: memory }}>
          {/* the same slip, days earlier, going into a parka pocket */}
          <Stage cam={{ x: 0, y: -40, zoom: 3.2 }} t={t} bg="#1a1e1c">
            <Plane d={0}>
              <rect x={-2000} y={-2000} width={4000} height={4000} fill={lit("#4f6146", parka)} />
              {Array.from({ length: 16 }, (_, i) => (
                <rect key={i} x={-2000} y={-400 + i * 60} width={4000} height={4} fill={lit("#465740", parka)} />
              ))}
              <path d="M-220 -40 L220 -40 L230 220 L-230 220 Z" fill={lit("#465740", parka)} />
              <rect x={-230} y={-50} width={460} height={20} fill={lit("#3e4e38", parka)} />
              <Receipt x={-20} y={lerp(-240, -30, ramp(t, 3.6, 4.8))} rot={4} light={parka} s={0.9} />
            </Plane>
          </Stage>
          <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.8) 100%)" }} />
        </AbsoluteFill>
      ) : null}
      <Finish temp={0.4} vignette={0.8} />
    </AbsoluteFill>
  );
};

export const NotLetGo: React.FC = () => {
  const { t, dur } = useShot();
  const drop = ramp(t, 0.1, 0.5, EASE.in);
  const cam = { x: keys(t, [[0, 60], [dur, 40]]), y: keys(t, [[0, 0], [dur, 0]]), zoom: keys(t, [[0, 1.9], [dur, 2.4]], EASE.drift) };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} bg="#0e0b08">
        <Plane d={0}>
          <DeskTop light={DESK} />
          <Folder x={-150} y={0} open={1} light={DESK} tab="GACY, J. W." inside={<g><Sheet x={0} y={0} light={DESK} lines={0} /><Photo id="mug2" x={-50} y={-60} w={90} h={110} border={4} light={DESK} scene={<g transform="scale(0.5)"><Mugshot /></g>} /></g>} />
          <g transform={`translate(${lerp(420, 260, drop)} ${lerp(-500, 0, drop)}) rotate(${lerp(-20, 8, drop)}) scale(${lerp(1.3, 1, drop)})`}>
            <EvidenceBag x={0} y={0} light={DESK}>
              <Receipt x={0} y={10} rot={3} light={DESK} s={1} />
            </EvidenceBag>
          </g>
        </Plane>
        <Plane d={-0.8}>
          <CloseHand x={-420} y={-40} angle={-110} skin="#d8a888" sleeve="#6a5a46" s={1.9} curl={0.2} light={DESK} />
          <CloseHand x={520} y={60} angle={-230} skin="#d8a888" sleeve="#6a5a46" s={1.9} curl={0.2} light={DESK} flip />
        </Plane>
      </Stage>
      <Finish temp={0.4} vignette={0.85} />
    </AbsoluteFill>
  );
};

// --------------------------------------------------------- surveillance

export const Stakeout: React.FC = () => {
  const { t } = useShot();
  const out = walkBetween(t, 3.0, 4.6, -300, -600);
  const drive = t < 5.2 ? 0 : ramp(t, 5.2, 8.1, EASE.in);
  const follow = ramp(t, 6.4, 8.1, EASE.in);
  const cam = {
    x: keys(t, [[0, -200], [5.0, -300], [8.1, -1900]], EASE.inOut),
    y: -300,
    zoom: 0.5,
  };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} handheld={follow > 0 ? 6 : 1.5}>
        <Suburb
          t={t}
          mode="winterNight"
          snow={1}
          gacyLit={0.9}
          neighborsLit={0.4}
          porch={t > 2.8 ? 1 : 0.3}
          doorOpen={ramp(t, 2.8, 3.1) * (1 - ramp(t, 3.6, 4.0))}
          onLawn={
            <Plane d={-2}>
              {t > 2.9 && t < 5.0 ? <Person x={out.x} look={GACY_COAT} facing={-1} light={WN} pose={walk(STAND, out.phase, out.amt)} /> : null}
            </Plane>
          }
          onRoad={
            <Plane d={SUBURB.roadFar - 0.8}>
              <Car x={lerp(-900, -9000, drive)} color="#1e1e22" facing={-1} light={WN} headlights={t > 4.8 ? 1 : 0} snow={0.6} />
            </Plane>
          }
        />
      </Stage>
      <AbsoluteFill>
        <svg width={1920} height={1080}>
          <Snow t={t} density={0.5} />
        </svg>
      </AbsoluteFill>
      <CarInterior light={WN} t={t} steam={1 - follow} />
      <Finish temp={-0.6} vignette={0.75} />
    </AbsoluteFill>
  );
};

export const Invite: React.FC = () => {
  const { t, dur } = useShot();
  const cross = walkBetween(t, 0.2, 2.4, -700, 520);
  const knock = t > 2.5 && t < 3.0 ? Math.abs(Math.sin(t * 22)) : 0;
  const beckon = ramp(t, 3.0, 3.4) * (1 - ramp(t, 4.9, 5.3));
  const cam = { x: keys(t, [[0, 100], [dur, 560]]), y: -360, zoom: keys(t, [[0, 0.5], [dur, 0.58]], EASE.drift) };
  const gp =
    t < 2.4
      ? walk(idle(pose({ smile: 1 }), t, 2), cross.phase, cross.amt)
      : talk(idle(pose({ smile: 1, lean: 22, neck: 8, turn: -0.2, nearUpper: lerp(60 + knock * 10, 120 + Math.sin(t * 7) * 20, beckon), nearFore: lerp(80, 40, beckon) }), t, 2), t, 2, beckon);
  return (
    <AbsoluteFill>
      <Stage cam={cam} handheld={3} t={t}>
        <Suburb
          t={t}
          mode="winterDay"
          snow={1}
          gacyLit={0.3}
          neighborsLit={0}
          onRoad={
            <>
              <Plane d={SUBURB.roadFar - 0.7}>
                <Car
                  x={900}
                  kind="unmarked"
                  color="#3a3e44"
                  facing={1}
                  light={WD}
                  snow={0.5}
                  occupants={
                    <g fill="#20242a" opacity={0.85}>
                      <ellipse cx={-110} cy={-222} rx={24} ry={28} />
                      <ellipse cx={130} cy={-222} rx={24} ry={28} />
                    </g>
                  }
                />
              </Plane>
              <Plane d={SUBURB.roadFar - 2}>
                <Person x={cross.x} look={GACY_COAT} facing={1} light={WD} pose={gp} />
              </Plane>
            </>
          }
        />
      </Stage>
      <Finish temp={-0.2} vignette={0.6} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------ one of them smells it

export const SmellMoment: React.FC = () => {
  const { t, dur } = useShot();
  const pause = ramp(t, 1.6, 2.3, EASE.inOut);
  const drop = ramp(t, 3.4, 5.6, EASE.inOut);
  const quiet = ramp(t, 1.8, 3.2, EASE.inOut);
  const room: Light = { key: mix("#ffe8c8", "#b8c0c8", quiet * 0.6), ambient: "#1a1612", amb: lerp(0.14, 0.42, quiet), desat: quiet * 0.55 };
  const focus: Light = { key: "#ffe8c8", ambient: "#2a2018", amb: 0.14, desat: 0 };
  const cam = {
    x: keys(t, [[0, 60], [1.6, 160], [3.4, 230], [5.6, LIVING.register.x - 30], [dur, LIVING.register.x]], EASE.inOut),
    y: keys(t, [[0, -330], [1.6, -330], [3.4, -330], [5.6, -40], [dur, -10]], EASE.inOut),
    zoom: keys(t, [[0, 1.45], [1.6, 1.6], [3.4, 2.1], [5.6, 3.4], [dur, 3.9]], EASE.inOut),
  };
  const officerPose = idle(
    pose({
      farUpper: 30,
      farFore: lerp(78, 60, pause),
      turn: lerp(0, 0.35, pause),
      neck: lerp(0, 10, pause),
      brow: lerp(0, -0.8, pause),
      mouth: 0,
      smile: lerp(0.3, -0.2, pause),
      gaze: lerp(0, 0.8, pause),
    }),
    t,
    7,
    lerp(1, 0.2, pause),
  );
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t}>
        <Plane d={0}>
          <GacyLivingRoom light={room} lamp={lerp(1, 0.4, quiet)} night={false} snow t={t} registerHaze={drop} />
          <Person x={-260} look={GACY} facing={1} light={room} pose={gesture(talk(idle(pose({ smile: 1 }), t, 3), t, 3, lerp(1, 0.4, quiet)), t, 3, 1)} farHold={<Cup light={room} />} />
          <Person x={40} look={OFFICER} facing={-1} light={room} pose={talk(idle(pose({ farUpper: 30, farFore: 78, smile: 0.4 }), t, 5), t, 5, lerp(0.2, 0, quiet))} farHold={<Cup light={room} />} />
          <Person x={250} look={OFFICER_2} facing={-1} light={focus} pose={officerPose} farHold={<Cup light={focus} />} />
        </Plane>
        <Plane d={-1}>
          <Pool x={250} y={-260} rx={420} ry={500} color="#ffe8c8" opacity={0.18 * quiet} />
        </Plane>
      </Stage>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 55% 45%, rgba(0,0,0,0) ${lerp(60, 26, quiet)}%, rgba(0,0,0,${0.75 * quiet}) 100%)` }} />
      <Finish temp={0.1} vignette={0.7} />
    </AbsoluteFill>
  );
};

export const NeedToReturn: React.FC = () => {
  const { t, dur } = useShot();
  const walkOut = walkBetween(t, 0.2, 2.6, -400, 600);
  const look = ramp(t, 2.8, 3.6);
  const cam = { x: keys(t, [[0, 400], [dur, 250]]), y: -420, zoom: keys(t, [[0, 0.46], [dur, 0.42]], EASE.drift) };
  const dusk: Light = { key: "#b8c0d8", ambient: "#141a26", amb: 0.36, desat: 0.3 };
  return (
    <AbsoluteFill>
      <Stage cam={cam} handheld={2} t={t}>
        <Suburb t={t} mode="winterNight" snow={1} gacyLit={0.9} neighborsLit={0.4} porch={1} moon={{ x: 1400, y: 180 }}
          onLawn={
            <Plane d={-4}>
              <Person x={walkOut.x - 260} look={OFFICER_COAT} facing={1} light={dusk} pose={walk(STAND, walkOut.phase, walkOut.amt)} />
            </Plane>
          }
          onNearWalk={
            <Plane d={-18.6}>
              <Person x={walkOut.x * 0.1 + 520} look={{ ...OFFICER_COAT, ...{ mustache: true, build: "stocky" } }} facing={-1} light={{ ...dusk, amb: 0.55 }} pose={idle(pose({ turn: lerp(0.9, -0.3, look), neck: -4 }), t, 8, 0.4)} />
            </Plane>
          }
        />
      </Stage>
      <Finish temp={-0.6} vignette={0.8} />
    </AbsoluteFill>
  );
};

// ------------------------------------------- the Hollywood version, meanwhile

export const TheaterShot: React.FC = () => {
  const { t, dur } = useShot();
  const bolt = Math.exp(-Math.max(0, ((t % 4.2) - 1.1)) * 8) * ((t % 4.2) > 1.1 ? 1 : 0);
  const L: Light = { key: "#b8c4dc", ambient: "#060408", amb: 0.55, desat: 0.3 };
  const cam = {
    x: keys(t, [[0, 0], [dur, 0]]),
    y: keys(t, [[0, -1200], [dur, -900]], EASE.drift),
    zoom: keys(t, [[0, 0.5], [dur, 0.24]], EASE.drift),
  };
  const clownIn = ramp(t, 6.5, 7.5);
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} bg="#030203">
        <Plane d={8}>
          <Theater
            light={L}
            t={t}
            screen={
              <g>
                <rect x={-2000} y={-2120} width={4000} height={1740} fill="#0a0c14" />
                <g transform="translate(0 -420) scale(0.55)" opacity={1 - clownIn}>
                  <Castle x={0} flash={bolt} light={{ key: mix("#6a7a9a", "#e8eeff", bolt), ambient: "#06060c", amb: 0.4, desat: 0.3 }} />
                </g>
                <g opacity={clownIn} transform="translate(0 -420) scale(4.2)">
                  <Person x={0} look={POGO} light={{ key: "#ff9a8a", ambient: "#100406", amb: 0.5 }} view="front" pose={pose({ smile: 1, brow: -1 })} />
                </g>
              </g>
            }
          />
        </Plane>
        <Plane d={1.5}>
          <TheaterRows light={L} t={t} seed={3} />
        </Plane>
        <Plane d={-2}>
          <TheaterRows light={{ ...L, amb: 0.7 }} t={t} seed={7} n={10} />
        </Plane>
      </Stage>
      <AbsoluteFill>
        {/* the projector's beam over the audience, with dust in it */}
        <svg width={1920} height={1080}>
          <defs>
            <linearGradient id="proj-beam" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e8eeff" stopOpacity={0.32} />
              <stop offset="1" stopColor="#e8eeff" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <path d="M930 -20 L990 -20 L1500 620 L420 620 Z" fill="url(#proj-beam)" style={{ mixBlendMode: "screen" }} />
          <Motes t={t} x={520} y={40} w={880} h={560} n={40} color="#e8eeff" opacity={0.5} />
        </svg>
      </AbsoluteFill>
      <Finish temp={-0.4} vignette={0.85} />
    </AbsoluteFill>
  );
};

// ----------------------------------------------------- they come back

export const PoliceReturn: React.FC = () => {
  const { t, dur } = useShot();
  const arrive = (x0: number, t0: number) => lerp(x0 - 6000, x0, ramp(t, t0, t0 + 1.8, EASE.out));
  const walkers = [0, 1, 2].map((i) => walkBetween(t, 2.6 + i * 0.3, dur, -1400 + i * 300, -500 + i * 250));
  const cam = {
    x: keys(t, [[0, -300], [4.2, -300], [dur, -150]], EASE.inOut),
    y: keys(t, [[0, -520], [4.2, -520], [dur, -120]], EASE.inOut),
    zoom: keys(t, [[0, 0.42], [4.2, 0.47], [dur, 1.0]], EASE.inOut),
  };
  return (
    <AbsoluteFill>
      <Stage cam={cam} handheld={3} t={t}>
        <Suburb
          t={t}
          mode="winterDay"
          snow={1}
          gacyLit={0.2}
          neighborsLit={0}
          onLawn={
            <Plane d={-5}>
              {walkers.map((w, i) => (
                <Person key={i} x={w.x} look={i === 1 ? DETECTIVE : OFFICER_COAT} facing={1} light={WD} pose={walk(pose({ farUpper: 20, farFore: 70 }), w.phase, w.amt)} farHold={i !== 1 ? <Shovel light={WD} len={220} /> : undefined} />
              ))}
            </Plane>
          }
          onRoad={
            <Plane d={SUBURB.roadFar - 0.7}>
              <Car x={arrive(-2200, 0)} kind="police" facing={1} light={WD} lightbar={1} t={t} snow={0.3} />
              <Car x={arrive(-900, 0.5)} kind="police" facing={1} light={WD} lightbar={1} t={t + 0.3} snow={0.3} />
              <Car x={arrive(700, 1.0)} kind="unmarked" color="#3a3e44" facing={1} light={WD} snow={0.3} />
            </Plane>
          }
        />
      </Stage>
      <Finish temp={-0.3} vignette={0.6} />
    </AbsoluteFill>
  );
};

