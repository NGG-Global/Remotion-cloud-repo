import React from "react";
import { darken, lit, mix, type Light, NEUTRAL } from "../../gacy/engine/color";
import { hash, noise } from "../../gacy/engine/time";
import { Pool, Wash } from "../../gacy/kit/light";
import { AtticRoom, BackHall, Cellar, DiningRoom, FrontHall, GuestRoom, Kitchen, LizzieRoom, ParentsRoom, SittingRoom } from "./rooms";

/**
 * 92 Second Street.
 *
 * A narrow Greek Revival house with its gable end to the street, two and
 * a half storeys, clapboard, painted a drab green-grey. Three views share
 * one coordinate system:
 *
 * - `BordenHouse`: the street facade (the gable end), 7.5 m wide.
 * - `BordenSide`: the long side seen from the yard, 14 m, front at the left.
 * - `BordenSection`: the same long side cut open, room by room, with the
 *   cellar under it and the attic over it.
 *
 * The house floor is 0.6 m above grade (HOUSE.floor). Upstairs is one
 * room height (2.8 m) above that. World scale: 200 units per metre.
 */

export const HOUSE = {
  facadeW: 1500,
  left: -1400,
  right: 1400,
  floor: -120,
  upper: -680,
  attic: -1240,
  cellar: 380,
  eave: -1300,
  ridge: -1780,
  barnX: 2600,
  // ground floor cells, front (street) to back
  hall: [-1400, -950] as const,
  sitting: [-950, -150] as const,
  dining: [-150, 600] as const,
  kitchen: [600, 1400] as const,
  // upper floor cells
  guest: [-1400, -700] as const,
  lizzie: [-700, 100] as const,
  parents: [100, 850] as const,
  backhall: [850, 1400] as const,
  atticRoom: [-500, 500] as const,
  sideDoor: 1000,
} as const;

const SIDING = "#8a9078";
const TRIM = "#e2ddd0";
const SHUTTER = "#2e3e30";

const clapboard = (L: (c: string) => string, x: number, y: number, w: number, h: number) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={L(SIDING)} />
    {Array.from({ length: Math.floor(h / 26) }, (_, i) => (
      <rect key={i} x={x} y={y + 20 + i * 26} width={w} height={3} fill={L(darken(SIDING, 0.16))} opacity={0.6} />
    ))}
  </g>
);

const SashOut: React.FC<{ x: number; y: number; w?: number; h?: number; L: (c: string) => string; glass: string; up?: number; shutters?: boolean; person?: React.ReactNode; id: string }> = ({ x, y, w = 200, h = 300, L, glass, up = 0, shutters = true, person, id }) => (
  <g>
    <defs>
      <clipPath id={`so-${id}`}>
        <rect x={x} y={y} width={w} height={h} />
      </clipPath>
    </defs>
    {shutters ? (
      <g fill={L(SHUTTER)}>
        <rect x={x - 100} y={y - 14} width={78} height={h + 28} />
        <rect x={x + w + 22} y={y - 14} width={78} height={h + 28} />
      </g>
    ) : null}
    <rect x={x - 14} y={y - 14} width={w + 28} height={h + 28} fill={L(TRIM)} />
    <rect x={x} y={y} width={w} height={h} fill={glass} />
    <g clipPath={`url(#so-${id})`}>
      {person}
      <rect x={x} y={y} width={w} height={h * 0.32} fill={L("#d8c8a0")} opacity={0.85} />
      <path d={`M${x} ${y + h * 0.6} L${x + w * 0.4} ${y} L${x + w * 0.62} ${y} L${x + w * 0.12} ${y + h} L${x} ${y + h} Z`} fill="#fff" opacity={0.1} />
    </g>
    <path d={`M${x} ${y + h / 2 - up * 80} H${x + w}`} stroke={L(TRIM)} strokeWidth={12} />
    <path d={`M${x + w / 2} ${y} V${y + h}`} stroke={L(TRIM)} strokeWidth={7} />
    <rect x={x - 26} y={y + h + 14} width={w + 52} height={16} fill={L(darken(TRIM, 0.12))} />
  </g>
);

/** The street facade: the gable end. */
export const BordenHouse: React.FC<{
  readonly x: number;
  readonly light?: Light;
  readonly lit?: number;
  readonly t?: number;
  readonly doorOpen?: number;
  readonly sideDoorOpen?: number;
  readonly windowsUp?: number;
  readonly peel?: number;
  /** Someone at an upstairs window (drawn clipped, screen coords inside the window). */
  readonly atWindow?: React.ReactNode;
  readonly night?: boolean;
}> = ({ x, light = NEUTRAL, lit: lamps = 0, doorOpen = 0, sideDoorOpen = 0, windowsUp = 0, peel = 0, atWindow, night = light.desat !== undefined && light.amb > 0.4 }) => {
  const L = (c: string) => lit(c, light);
  const half = HOUSE.facadeW / 2;
  const { floor, eave, ridge } = HOUSE;
  const glass = (k: number) => (night ? mix("#10151d", "#f0c070", lamps * k) : L("#5e6f7c"));
  const doorX = -half + 130;
  return (
    <g transform={`translate(${x} 0)`} opacity={1 - peel}>
      {/* foundation */}
      <rect x={-half} y={floor} width={HOUSE.facadeW} height={-floor} fill={L("#7a7670")} />
      {Array.from({ length: 4 }, (_, i) => (
        <rect key={i} x={-half} y={floor + 6 + i * 30} width={HOUSE.facadeW} height={3} fill={L("#5a5650")} />
      ))}
      {/* wall */}
      {clapboard(L, -half, eave, HOUSE.facadeW, floor - eave)}
      {/* gable */}
      <path d={`M${-half} ${eave} L0 ${ridge} L${half} ${eave} Z`} fill={L(SIDING)} />
      {Array.from({ length: 18 }, (_, i) => {
        const y = eave - 20 - i * 26;
        const hw = ((eave - y) / (eave - ridge)) * half;
        return <rect key={i} x={-half + hw} y={y} width={HOUSE.facadeW - 2 * hw} height={3} fill={L(darken(SIDING, 0.16))} opacity={0.6} />;
      })}
      <path d={`M${-half - 70} ${eave + 10} L0 ${ridge - 40} L${half + 70} ${eave + 10} L${half + 70} ${eave + 40} L0 ${ridge - 10} L${-half - 70} ${eave + 40} Z`} fill={L("#3a3438")} />
      <path d={`M${-half - 60} ${eave + 40} L0 ${ridge - 10} L${half + 60} ${eave + 40} L${half + 60} ${eave + 60} L0 ${ridge + 12} L${-half - 60} ${eave + 60} Z`} fill={L(TRIM)} />
      <rect x={-half - 20} y={eave} width={HOUSE.facadeW + 40} height={26} fill={L(TRIM)} />
      {/* chimney */}
      <rect x={half - 360} y={ridge + 60} width={110} height={360} fill={L("#6a4a3a")} />
      <rect x={half - 372} y={ridge + 48} width={134} height={22} fill={L("#4a3428")} />
      {/* corner boards */}
      <rect x={-half} y={eave} width={26} height={floor - eave} fill={L(TRIM)} />
      <rect x={half - 26} y={eave} width={26} height={floor - eave} fill={L(TRIM)} />
      {/* attic window */}
      <SashOut id="fa" x={-70} y={ridge + 170} w={140} h={200} L={L} glass={glass(0.4)} shutters={false} />
      {/* upper windows */}
      <SashOut id="fu1" x={-half + 180} y={-1100} L={L} glass={glass(0.8)} up={windowsUp} person={atWindow} />
      <SashOut id="fu2" x={half - 380} y={-1100} L={L} glass={glass(0.6)} up={windowsUp} />
      {/* ground: door at the left, two windows */}
      <rect x={doorX - 30} y={-620} width={260} height={620 + floor} fill={L(TRIM)} />
      <rect x={doorX} y={-590} width={200} height={470} fill={doorOpen > 0.5 ? "#14100c" : L("#2e2a28")} />
      <g transform={`translate(${doorX} 0) scale(${Math.cos(doorOpen * 1.3)} 1) translate(${-doorX} 0)`}>
        <rect x={doorX} y={-590} width={200} height={470} fill={L("#2e2a28")} />
        <rect x={doorX + 24} y={-560} width={152} height={150} fill={L("#221e1c")} />
        <rect x={doorX + 24} y={-380} width={152} height={220} fill={L("#221e1c")} />
        <circle cx={doorX + 170} cy={-360} r={8} fill={L("#c8a860")} />
      </g>
      <rect x={doorX - 10} y={-640} width={220} height={50} fill={L("#2e3e30")} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={doorX - 60 - i * 30} y={floor + i * 40} width={320 + i * 60} height={40} fill={L(i % 2 ? "#8a8a82" : "#9a9a92")} />
      ))}
      <SashOut id="fg1" x={half - 620} y={-560} L={L} glass={glass(1)} up={windowsUp} />
      <SashOut id="fg2" x={half - 340} y={-560} L={L} glass={glass(1)} up={windowsUp} />
      {/* side entrance, visible as a small wing at the right */}
      <g>
        <rect x={half} y={-700} width={420} height={700 + floor} fill={L(darken(SIDING, 0.08))} />
        <path d={`M${half - 10} -700 L${half + 210} -860 L${half + 440} -700 Z`} fill={L("#3a3438")} />
        <rect x={half + 120} y={-560} width={170} height={440} fill={sideDoorOpen > 0.5 ? "#14100c" : L("#3a3a3a")} />
        <rect x={half + 120} y={-560} width={170 * Math.cos(sideDoorOpen * 1.3)} height={440} fill={L("#3a3a3a")} />
        <rect x={half + 100} y={floor} width={210} height={-floor} fill={L("#8a8a82")} />
      </g>
      {night && lamps > 0 ? <Pool x={half - 480} y={-200} rx={500} ry={200} color="#f2b870" opacity={0.25 * lamps} /> : null}
      {/* eave shadow */}
      <rect x={-half} y={eave + 26} width={HOUSE.facadeW} height={50} fill="#000" opacity={0.2} />
    </g>
  );
};

/** The long side of the house, from the yard. Same x as the section. */
export const BordenSide: React.FC<{
  readonly light?: Light;
  readonly lit?: number;
  readonly t?: number;
  readonly sideDoorOpen?: number;
  readonly night?: boolean;
  readonly opacity?: number;
  readonly atWindow?: React.ReactNode;
}> = ({ light = NEUTRAL, lit: lamps = 0, sideDoorOpen = 0, night = light.amb > 0.4, opacity = 1, atWindow }) => {
  const L = (c: string) => lit(c, light);
  const { left, right, floor, eave, ridge } = HOUSE;
  const w = right - left;
  const glass = (k: number) => (night ? mix("#10151d", "#f0c070", lamps * k) : L("#5e6f7c"));
  if (opacity <= 0) {
    return null;
  }
  return (
    <g opacity={opacity}>
      <rect x={left} y={floor} width={w} height={-floor} fill={L("#7a7670")} />
      {clapboard(L, left, eave, w, floor - eave)}
      {/* roof in side view: a long slope */}
      <path d={`M${left - 60} ${eave} L${left - 60} ${eave - 30} L${right + 60} ${eave - 30} L${right + 60} ${eave} Z`} fill={L(TRIM)} />
      <path d={`M${left - 80} ${eave - 30} L${left + 200} ${ridge} L${right - 200} ${ridge} L${right + 80} ${eave - 30} Z`} fill={L("#3a3438")} />
      {Array.from({ length: 20 }, (_, i) => (
        <path key={i} d={`M${left - 80} ${eave - 30 - i * 24} L${right + 80} ${eave - 30 - i * 24}`} stroke={L("#2e2a2c")} strokeWidth={2} opacity={0.3} />
      ))}
      <rect x={left + 900} y={ridge + 40} width={110} height={260} fill={L("#6a4a3a")} />
      {/* upstairs windows, one per room */}
      {[-1050, -300, 475, 1120].map((wx, i) => (
        <SashOut key={i} id={`su${i}`} x={wx - 100} y={-1100} L={L} glass={glass(0.8)} person={i === 0 ? atWindow : undefined} />
      ))}
      {/* ground windows */}
      {[-550, 225].map((wx, i) => (
        <SashOut key={i} id={`sg${i}`} x={wx - 100} y={-560} L={L} glass={glass(1)} />
      ))}
      {/* the side door, with its steps */}
      <rect x={HOUSE.sideDoor - 115} y={-600} width={230} height={600 + floor} fill={L(TRIM)} />
      <rect x={HOUSE.sideDoor - 90} y={-570} width={180} height={450} fill={sideDoorOpen > 0.5 ? "#14100c" : L("#3a3a3a")} />
      <g transform={`translate(${HOUSE.sideDoor - 90} 0) scale(${Math.cos(sideDoorOpen * 1.3)} 1) translate(${-(HOUSE.sideDoor - 90)} 0)`}>
        <rect x={HOUSE.sideDoor - 90} y={-570} width={180} height={450} fill={L("#3a3a3a")} />
        <rect x={HOUSE.sideDoor - 68} y={-540} width={136} height={150} fill={L("#2e2e2e")} />
        <rect x={HOUSE.sideDoor - 68} y={-370} width={136} height={200} fill={L("#2e2e2e")} />
        <circle cx={HOUSE.sideDoor + 60} cy={-350} r={8} fill={L("#c8a860")} />
      </g>
      {[0, 1].map((i) => (
        <rect key={i} x={HOUSE.sideDoor - 150 - i * 30} y={floor + i * 60} width={300 + i * 60} height={60} fill={L(i % 2 ? "#8a8a82" : "#9a9a92")} />
      ))}
      <rect x={left} y={eave} width={22} height={floor - eave} fill={L(TRIM)} />
      <rect x={right - 22} y={eave} width={22} height={floor - eave} fill={L(TRIM)} />
      <rect x={left} y={eave} width={w} height={44} fill="#000" opacity={0.2} />
      {night && lamps > 0 ? <Pool x={-550} y={-180} rx={600} ry={220} color="#f2b870" opacity={0.25 * lamps} /> : null}
    </g>
  );
};

export type Occupants = {
  readonly hall?: React.ReactNode;
  readonly sitting?: React.ReactNode;
  readonly dining?: React.ReactNode;
  readonly kitchen?: React.ReactNode;
  readonly guest?: React.ReactNode;
  readonly lizzie?: React.ReactNode;
  readonly parents?: React.ReactNode;
  readonly backhall?: React.ReactNode;
  readonly attic?: React.ReactNode;
  readonly cellar?: React.ReactNode;
};

/** Per-room light multipliers: 1 = the room's own lamp lit, 0 = dark. */
export type RoomLamps = Partial<Record<keyof Occupants, number>>;

/** The dollhouse: every room in section, the cellar below, the attic above. */
export const BordenSection: React.FC<{
  readonly t: number;
  readonly light?: Light;
  /** Light for rooms that are "dimmed" (lamps off). */
  readonly dark?: Light;
  readonly lamps?: RoomLamps;
  readonly people?: Occupants;
  readonly props?: {
    readonly frontDoorOpen?: number;
    readonly frontLocks?: number;
    readonly backDoorOpen?: number;
    readonly guestDoorOpen?: number;
    readonly guestHem?: number;
    readonly guestMade?: number;
    readonly bolts?: number;
    readonly fire?: number;
    readonly ironing?: boolean;
    readonly calendarRing?: number;
    readonly minutes?: number;
    readonly laid?: boolean;
    readonly cellarTools?: React.ReactNode;
    readonly outside?: string;
  };
  readonly opacity?: number;
  /** Fades the cut walls, roof and cellar for a "rooms only" look. */
  readonly shell?: number;
}> = ({ t, light = NEUTRAL, dark, lamps = {}, people = {}, props = {}, opacity = 1, shell = 1 }) => {
  if (opacity <= 0) {
    return null;
  }
  const { left, right, floor, upper, attic, cellar, ridge } = HOUSE;
  const dk: Light = dark ?? { key: mix(light.key, "#000000", 0.55), ambient: light.ambient, amb: Math.min(0.85, light.amb + 0.35), desat: 0.3 };
  const lightFor = (k: keyof Occupants): Light => {
    const v = lamps[k];
    if (v === undefined || v >= 1) {
      return light;
    }
    return { key: mix(dk.key, light.key, v), ambient: light.ambient, amb: dk.amb + (light.amb - dk.amb) * v, desat: (dk.desat ?? 0) * (1 - v) };
  };
  const cut = "#161210";
  const wall = 40;
  const outside = props.outside ?? "#c8d8dc";
  const cell = (name: keyof Occupants, range: readonly [number, number], y: number, node: React.ReactNode) => (
    <g key={name} transform={`translate(0 ${y})`}>
      <defs>
        <clipPath id={`cell-${name}`}>
          <rect x={range[0]} y={-560 - 40} width={range[1] - range[0]} height={560 + 40 + 40} />
        </clipPath>
      </defs>
      <g clipPath={`url(#cell-${name})`}>{node}</g>
    </g>
  );
  const l = lightFor;
  return (
    <g opacity={opacity}>
      {/* ground outside and the soil below */}
      <rect x={-30000} y={0} width={60000} height={3000} fill={lit("#3a2e22", light)} />
      {/* cellar */}
      <g transform={`translate(0 ${cellar})`}>
        <defs>
          <clipPath id="cell-cellar">
            <rect x={left} y={-420} width={right - left} height={420} />
          </clipPath>
        </defs>
        <g clipPath="url(#cell-cellar)">
          <Cellar x0={left} x1={right} light={l("cellar")} lamp={lamps.cellar ?? 0} t={t} tools={props.cellarTools}>
            {people.cellar}
          </Cellar>
        </g>
      </g>
      {/* ground floor */}
      {cell("hall", HOUSE.hall, floor, (
        <FrontHall x0={HOUSE.hall[0]} x1={HOUSE.hall[1]} light={l("hall")} lamp={lamps.hall ?? 0} t={t} doorOpen={props.frontDoorOpen ?? 0} locks={props.frontLocks ?? 0} stairsTo={upper - floor}>
          {people.hall}
        </FrontHall>
      ))}
      {cell("sitting", HOUSE.sitting, floor, (
        <SittingRoom x0={HOUSE.sitting[0]} x1={HOUSE.sitting[1]} light={l("sitting")} lamp={lamps.sitting ?? 0} t={t} minutes={props.minutes ?? 630} outside={outside}>
          {people.sitting}
        </SittingRoom>
      ))}
      {cell("dining", HOUSE.dining, floor, (
        <DiningRoom x0={HOUSE.dining[0]} x1={HOUSE.dining[1]} light={l("dining")} lamp={lamps.dining ?? 0} t={t} laid={props.laid} outside={outside}>
          {people.dining}
        </DiningRoom>
      ))}
      {cell("kitchen", HOUSE.kitchen, floor, (
        <Kitchen x0={HOUSE.kitchen[0]} x1={HOUSE.kitchen[1]} light={l("kitchen")} lamp={lamps.kitchen ?? 0} t={t} fire={props.fire ?? 0} backDoorOpen={props.backDoorOpen ?? 0} ironing={props.ironing} calendarRing={props.calendarRing ?? 0} stairsTo={upper - floor}>
          {people.kitchen}
        </Kitchen>
      ))}
      {/* upper floor */}
      {cell("guest", HOUSE.guest, upper, (
        <GuestRoom x0={HOUSE.guest[0]} x1={HOUSE.guest[1]} light={l("guest")} lamp={lamps.guest ?? 0} t={t} doorOpen={props.guestDoorOpen ?? 0.6} hem={props.guestHem ?? 0} made={props.guestMade ?? 1} outside={outside}>
          {people.guest}
        </GuestRoom>
      ))}
      {cell("lizzie", HOUSE.lizzie, upper, (
        <LizzieRoom x0={HOUSE.lizzie[0]} x1={HOUSE.lizzie[1]} light={l("lizzie")} lamp={lamps.lizzie ?? 0} t={t} bolt={props.bolts ?? 1} outside={outside}>
          {people.lizzie}
        </LizzieRoom>
      ))}
      {cell("parents", HOUSE.parents, upper, (
        <ParentsRoom x0={HOUSE.parents[0]} x1={HOUSE.parents[1]} light={l("parents")} lamp={lamps.parents ?? 0} t={t} bolt={props.bolts ?? 1} outside={outside}>
          {people.parents}
        </ParentsRoom>
      ))}
      {cell("backhall", HOUSE.backhall, upper, (
        <BackHall x0={HOUSE.backhall[0]} x1={HOUSE.backhall[1]} light={l("backhall")} lamp={lamps.backhall ?? 0} t={t} stairsTo={attic - upper}>
          {people.backhall}
        </BackHall>
      ))}
      {/* attic */}
      <g transform={`translate(0 ${attic})`}>
        <path d={`M${left - 20} 0 L${left - 20} -60 L0 ${ridge - attic} L${right + 20} -60 L${right + 20} 0 Z`} fill={lit("#2a2220", light)} />
        <defs>
          <clipPath id="cell-attic">
            <path d={`M${left} 0 L${left} -60 L0 ${ridge - attic + 20} L${right} -60 L${right} 0 Z`} />
          </clipPath>
        </defs>
        <g clipPath="url(#cell-attic)">
          <rect x={left} y={-600} width={right - left} height={600} fill={lit("#4a3e34", l("attic"))} />
          <AtticRoom x0={HOUSE.atticRoom[0]} x1={HOUSE.atticRoom[1]} light={l("attic")} lamp={lamps.attic ?? 0} t={t} outside={outside}>
            {people.attic}
          </AtticRoom>
          {[-1100, 900].map((rx) => (
            <rect key={rx} x={rx - 60} y={-300} width={120} height={300} fill={lit("#3a3028", l("attic"))} opacity={0.6} />
          ))}
        </g>
      </g>
      {/* structure: floors, cut walls, roof, foundation, all in the cut colour */}
      <g opacity={shell}>
        {[floor, upper, attic].map((y) => (
          <rect key={y} x={left - 30} y={y - 40} width={right - left + 60} height={40} fill={cut} />
        ))}
        {[floor, upper, attic].map((y) => (
          <g key={`j${y}`}>
            <rect x={left - 30} y={y - 40} width={right - left + 60} height={6} fill={lit("#5a4630", light)} opacity={0.6} />
            {Array.from({ length: 34 }, (_, i) => (
              <rect key={i} x={left + 12 + i * 82} y={y - 32} width={16} height={22} fill={lit("#3a2c20", light)} opacity={0.5} />
            ))}
          </g>
        ))}
        {/* partition walls */}
        {[HOUSE.hall[1], HOUSE.sitting[1], HOUSE.dining[1]].map((wx) => (
          <rect key={wx} x={wx - wall / 2} y={upper} width={wall} height={floor - upper - 40} fill={cut} />
        ))}
        {[HOUSE.guest[1], HOUSE.lizzie[1], HOUSE.parents[1]].map((wx) => (
          <rect key={wx} x={wx - wall / 2} y={attic} width={wall} height={upper - attic - 40} fill={cut} />
        ))}
        {/* doorways in the partitions */}
        {[HOUSE.hall[1], HOUSE.sitting[1], HOUSE.dining[1]].map((wx) => (
          <rect key={`d${wx}`} x={wx - wall / 2} y={floor - 440} width={wall} height={400} fill={lit("#2a2018", light)} />
        ))}
        {[HOUSE.guest[1]].map((wx) => (
          <rect key={`u${wx}`} x={wx - wall / 2} y={upper - 440} width={wall} height={400} fill={lit("#2a2018", light)} />
        ))}
        {/* end walls */}
        <rect x={left - 30} y={attic} width={30} height={cellar + 420 - attic} fill={cut} />
        <rect x={right} y={attic} width={30} height={cellar + 420 - attic} fill={cut} />
        {/* front door opening in the left end wall, side door in the kitchen wall */}
        <rect x={left - 30} y={floor - 460} width={30} height={460} fill={props.frontDoorOpen && props.frontDoorOpen > 0.5 ? lit("#d8d0b8", light) : lit("#2e2a28", light)} />
        {/* roof */}
        <path d={`M${left - 110} ${attic - 30} L0 ${ridge - 20} L${right + 110} ${attic - 30} L${right + 110} ${attic + 6} L0 ${ridge + 20} L${left - 110} ${attic + 6} Z`} fill={lit("#2a2628", light)} />
        {/* foundation walls */}
        {[left - 90, right].map((fx) => (
          <rect key={fx} x={fx} y={floor} width={90} height={cellar + 420 - floor} fill={lit("#6a665e", light)} />
        ))}
        <rect x={left - 90} y={cellar} width={right - left + 180} height={60} fill={lit("#4a4640", light)} />
      </g>
    </g>
  );
};

/** The house's side lit from within at night: windows glow, one per lit room. */
export const windowGlow = (lamps: RoomLamps): number => {
  const v = Object.values(lamps);
  return v.length ? Math.max(...v.map((x) => x ?? 0)) : 0;
};

/** Heat shimmer over the yard at noon. */
export const HeatShimmer: React.FC<{ readonly t: number; readonly y?: number; readonly amount?: number }> = ({ t, y = -40, amount = 1 }) => (
  <g>
    {Array.from({ length: 6 }, (_, i) => (
      <ellipse key={i} cx={-3000 + i * 1200 + noise(t * 0.6 + i, i) * 200} cy={y + hash(i) * 30} rx={800} ry={12 + noise(t * 2.2 + i, i + 5) * 6} fill="#fff" opacity={0.05 * amount} />
    ))}
  </g>
);

/** A soft interior glow spilling from a window onto the yard at night. */
export const WindowSpill: React.FC<{ readonly x: number; readonly y: number; readonly amount: number }> = ({ x, y, amount }) => (amount > 0 ? <Wash x={x - 300} y={y} w={600} h={400} from="top" color="#f2b870" opacity={0.25 * amount} /> : null);
