import React from "react";
import { darken, lighten, lit, type Light, NEUTRAL } from "../../gacy/engine/color";
import { hash } from "../../gacy/engine/time";
import { Glow, Pool, Wash } from "../../gacy/kit/light";
import { Armchair, Bed, Curtains, DiningTable, Dresser, IroningBoard, MantelClock, OilLamp, ParlourTable, Portrait, SideChair, Sofa, Stove, Washstand } from "./props";
import { WallCalendar } from "./paper";

/**
 * The rooms of 92 Second Street, each drawn once at world scale with its
 * floor at y = 0 and its walls spanning x0..x1. The cutaway (kit/house)
 * places them in their cells; a close shot puts the camera inside one.
 *
 * Papered walls, a dado, oil lamps, blinds: nothing electric.
 */

export type RoomProps = {
  readonly light?: Light;
  readonly t?: number;
  readonly lamp?: number;
  readonly children?: React.ReactNode;
};

const H = 560;

/** A papered Victorian room: wall, dado, cornice, floorboards, a rug. */
export const VRoom: React.FC<{
  readonly x0: number;
  readonly x1: number;
  readonly paper?: string;
  readonly motif?: string;
  readonly floor?: string;
  readonly rug?: string;
  readonly light?: Light;
  readonly floorDepth?: number;
  readonly h?: number;
  readonly dado?: boolean;
  readonly children?: React.ReactNode;
}> = ({ x0, x1, paper = "#a89070", motif, floor = "#5a4028", rug, light = NEUTRAL, floorDepth = 800, h = H, dado = true, children }) => {
  const L = (c: string) => lit(c, light);
  const w = x1 - x0;
  const m = motif ?? darken(paper, 0.1);
  return (
    <g>
      <rect x={x0} y={-h - 1400} width={w} height={1400} fill={L(darken(paper, 0.55))} />
      <rect x={x0} y={-h} width={w} height={h} fill={L(paper)} />
      {/* wallpaper motif: a small diamond repeat */}
      {Array.from({ length: Math.ceil(w / 90) }, (_, i) =>
        Array.from({ length: Math.ceil((h - (dado ? 170 : 40)) / 90) }, (_, j) => (
          <path key={`${i}-${j}`} d={`M${x0 + 45 + i * 90 + (j % 2) * 45} ${-h + 40 + j * 90} l14 16 l-14 16 l-14 -16 Z`} fill={L(m)} opacity={0.55} />
        )),
      )}
      <rect x={x0} y={-h - 36} width={w} height={36} fill={L(darken(paper, 0.35))} />
      <rect x={x0} y={-h} width={w} height={14} fill={L(lighten(paper, 0.2))} />
      {dado ? (
        <g>
          <rect x={x0} y={-170} width={w} height={170} fill={L(darken(paper, 0.32))} />
          <rect x={x0} y={-176} width={w} height={10} fill={L(darken(paper, 0.5))} />
          {Array.from({ length: Math.ceil(w / 60) }, (_, i) => (
            <rect key={i} x={x0 + i * 60 + 28} y={-160} width={3} height={130} fill={L(darken(paper, 0.45))} opacity={0.5} />
          ))}
        </g>
      ) : null}
      <rect x={x0} y={-30} width={w} height={30} fill={L(darken(paper, 0.55))} />
      <rect x={x0} y={0} width={w} height={floorDepth} fill={L(floor)} />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={x0} y={16 + i * i * 9} width={w} height={2 + i * 0.4} fill={L(darken(floor, 0.22))} opacity={0.7} />
      ))}
      {rug ? (
        <g>
          <path d={`M${x0 + w * 0.2} 30 L${x1 - w * 0.2} 30 L${x1 - w * 0.12} 230 L${x0 + w * 0.12} 230 Z`} fill={L(rug)} />
          <path d={`M${x0 + w * 0.24} 50 L${x1 - w * 0.24} 50 L${x1 - w * 0.16} 210 L${x0 + w * 0.16} 210 Z`} fill="none" stroke={L(darken(rug, 0.25))} strokeWidth={6} />
        </g>
      ) : null}
      <Wash x={x0} y={-h} w={w} h={h * 0.45} from="top" color="#000" opacity={0.3} />
      <Wash x={x0} y={0} w={w} h={floorDepth} from="bottom" color="#000" opacity={0.3} />
      {children}
    </g>
  );
};

/** A sash window in a wall; `blind` 0–1 pulled down; `view` drawn outside. */
export const SashWindow: React.FC<{
  readonly x: number;
  readonly y?: number;
  readonly w?: number;
  readonly h?: number;
  readonly light?: Light;
  readonly outside?: string;
  readonly blind?: number;
  readonly curtains?: string;
  readonly view?: React.ReactNode;
  readonly glow?: number;
  readonly open?: number;
  readonly id: string;
}> = ({ x, y = -470, w = 240, h = 300, light = NEUTRAL, outside = "#c8d8dc", blind = 0, curtains, view, glow = 0.6, open = 0, id }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g>
      <defs>
        <clipPath id={`sw-${id}`}>
          <rect x={x} y={y} width={w} height={h} />
        </clipPath>
      </defs>
      <rect x={x - 22} y={y - 22} width={w + 44} height={h + 44} fill={L("#e2d8c4")} />
      <rect x={x} y={y} width={w} height={h} fill={outside} />
      <g clipPath={`url(#sw-${id})`}>
        {view}
        <rect x={x} y={y} width={w} height={h * blind} fill={L("#d8c8a0")} />
        {blind > 0 ? <rect x={x} y={y + h * blind - 10} width={w} height={10} fill={L("#8a7a5a")} /> : null}
      </g>
      <path d={`M${x} ${y + h / 2 - open * 90} H${x + w}`} stroke={L("#e2d8c4")} strokeWidth={14} />
      <path d={`M${x + w / 2} ${y} V${y + h}`} stroke={L("#e2d8c4")} strokeWidth={8} />
      <rect x={x - 34} y={y + h + 22} width={w + 68} height={18} fill={L("#d0c4ac")} />
      {curtains ? <Curtains x={x} y={y} w={w} h={h} color={curtains} light={light} /> : null}
      {glow > 0 ? <Pool x={x + w / 2} y={y + h + 200} rx={w * 1.6} ry={260} color="#fff0d0" opacity={0.25 * glow} /> : null}
    </g>
  );
};

/** A panelled door in a wall; `open` swings it; `bolt` draws a drawn bolt. */
export const PanelDoor: React.FC<{
  readonly x: number;
  readonly w?: number;
  readonly h?: number;
  readonly open?: number;
  readonly light?: Light;
  readonly beyond?: string;
  readonly color?: string;
  readonly bolt?: number;
  readonly hinge?: "left" | "right";
}> = ({ x, w = 180, h = 440, open = 0, light = NEUTRAL, beyond = "#120e0a", color = "#5a3a28", bolt = 0, hinge = "left" }) => {
  const L = (c: string) => lit(c, light);
  const leaf = w * Math.cos(open * 1.35);
  const lx = hinge === "left" ? x : x + w - leaf;
  return (
    <g>
      <rect x={x - 16} y={-h - 16} width={w + 32} height={h + 16} fill={L("#d8ccb4")} />
      <rect x={x} y={-h} width={w} height={h} fill={beyond} />
      <rect x={lx} y={-h} width={leaf} height={h} fill={L(color)} />
      <rect x={lx + leaf * 0.14} y={-h + 34} width={leaf * 0.72} height={h * 0.34} fill={L(darken(color, 0.16))} />
      <rect x={lx + leaf * 0.14} y={-h * 0.5} width={leaf * 0.72} height={h * 0.38} fill={L(darken(color, 0.16))} />
      <circle cx={hinge === "left" ? lx + leaf * 0.86 : lx + leaf * 0.14} cy={-h * 0.48} r={7} fill={L("#b89a5a")} />
      {bolt > 0 ? (
        <g opacity={bolt}>
          <rect x={hinge === "left" ? lx + leaf - 54 : lx + 6} y={-h * 0.62} width={60} height={14} rx={4} fill={L("#8a8a8a")} />
          <rect x={hinge === "left" ? lx + leaf - 30 + 30 * bolt : lx + 30 - 30 * bolt} y={-h * 0.62 - 3} width={22} height={20} rx={4} fill={L("#5a5a5a")} />
        </g>
      ) : null}
    </g>
  );
};

/** A flight of stairs rising from (x0, 0) to (x1, -rise). */
export const Stairs: React.FC<{ readonly x0: number; readonly x1: number; readonly rise?: number; readonly light?: Light; readonly banister?: boolean }> = ({ x0, x1, rise = 560, light = NEUTRAL, banister = true }) => {
  const L = (c: string) => lit(c, light);
  const n = 12;
  const dx = (x1 - x0) / n;
  const dy = rise / n;
  const dir = Math.sign(dx);
  return (
    <g>
      <path d={`M${x0} 0 L${x1} ${-rise} L${x1} 0 Z`} fill={L("#3a2a1e")} />
      {Array.from({ length: n }, (_, i) => (
        <g key={i}>
          <rect x={Math.min(x0 + i * dx, x0 + (i + 1) * dx)} y={-(i + 1) * dy} width={Math.abs(dx)} height={dy} fill={L("#5a4030")} />
          <rect x={Math.min(x0 + i * dx, x0 + (i + 1) * dx) - (dir > 0 ? 0 : 6)} y={-(i + 1) * dy} width={Math.abs(dx) + 6} height={8} fill={L("#8a6a48")} />
        </g>
      ))}
      {banister ? (
        <g>
          <path d={`M${x0 + dx * 0.5} -160 L${x1 - dx * 0.5} ${-rise - 160}`} stroke={L("#3a2418")} strokeWidth={12} />
          {Array.from({ length: n }, (_, i) => (
            <rect key={i} x={x0 + (i + 0.5) * dx - 3} y={-(i + 1) * dy - 160} width={6} height={160} fill={L("#6a4a32")} />
          ))}
          <rect x={x0 + dx * 0.5 - 12} y={-190} width={24} height={190} fill={L("#3a2418")} />
        </g>
      ) : null}
    </g>
  );
};

// -------------------------------------------------------------------- rooms

/** Front hall: the front door in the end wall, a hat stand, the front stairs. */
export const FrontHall: React.FC<RoomProps & { readonly x0: number; readonly x1: number; readonly doorOpen?: number; readonly stairsTo?: number; readonly locks?: number }> = ({ x0, x1, light = NEUTRAL, lamp = 0, doorOpen = 0, stairsTo = -560, locks = 0, children, t = 0 }) => {
  const L = (c: string) => lit(c, light);
  const leaf = 190 * Math.sin(doorOpen * 1.4);
  return (
    <VRoom x0={x0} x1={x1} paper="#9a8a6a" floor="#4a3222" light={light}>
      {/* the front door is in the end wall; its leaf swings into the hall when open */}
      {leaf > 1 ? <rect x={x0} y={-460} width={leaf} height={460} fill={L("#2e2a28")} /> : null}
      {locks > 0
        ? [0.4, 0.52, 0.64].map((k, i) => (
            <g key={i} opacity={Math.min(1, locks - i)}>
              <rect x={x0 + 4} y={-460 * k} width={34} height={12} rx={3} fill={L("#8a8a80")} />
              <rect x={x0 + 26} y={-460 * k - 3} width={10} height={18} rx={2} fill={L("#5a5a5a")} />
            </g>
          ))
        : null}
      <Stairs x0={x0 + 70} x1={x1 - 20} rise={-stairsTo} light={light} />
      {lamp > 0 ? <OilLamp x={x0 + 60} y={-300} on={lamp} t={t} light={light} s={0.8} /> : null}
      {children}
    </VRoom>
  );
};

/** The sitting room: Andrew's sofa against the back wall, a window, portraits. */
export const SittingRoom: React.FC<RoomProps & { readonly x0: number; readonly x1: number; readonly blind?: number; readonly outside?: string; readonly minutes?: number; readonly view?: React.ReactNode; readonly sofaFacing?: 1 | -1 }> = ({ x0, x1, light = NEUTRAL, lamp = 0, t = 0, blind = 0.35, outside = "#c8d8dc", minutes = 630, view, sofaFacing = 1, children }) => {
  const L = (c: string) => lit(c, light);
  const cx = (x0 + x1) / 2;
  const mx = x0 + 280;
  return (
    <VRoom x0={x0} x1={x1} paper="#8a6a5a" motif="#7a5a4a" floor="#4a3222" rug="#6a3a34" light={light}>
      <SashWindow id={`sr${Math.round(x0)}`} x={x1 - 280} y={-480} w={230} h={290} light={light} outside={outside} blind={blind} curtains="#4a3a3a" view={view} />
      <Portrait id={`pa${Math.round(x0)}`} x={x0 + 200} y={-400} w={120} h={150} light={light} oval>
        <circle cx={0} cy={10} r={30} fill={L("#8a7a6a")} />
        <circle cx={0} cy={-18} r={20} fill={L("#d8b898")} />
      </Portrait>
      <Portrait id={`pb${Math.round(x0)}`} x={x0 + 360} y={-400} w={120} h={150} light={light} oval>
        <circle cx={0} cy={10} r={30} fill={L("#6a5a5a")} />
        <circle cx={0} cy={-18} r={20} fill={L("#e0c0a0")} />
      </Portrait>
      {/* fireplace and mantel shelf with the clock */}
      <rect x={mx - 170} y={-286} width={340} height={286} fill={L("#3a2a22")} />
      <rect x={mx - 120} y={-230} width={240} height={230} fill={L("#14100c")} />
      <rect x={mx - 130} y={-240} width={260} height={12} fill={L("#5a4a42")} />
      <rect x={mx - 190} y={-300} width={380} height={16} fill={L("#4a3020")} />
      <rect x={mx - 140} y={-286} width={280} height={30} fill={L("#5a4030")} />
      <MantelClock x={mx} y={-300} minutes={minutes} light={light} s={0.7} />
      <Sofa x={cx + 10} w={440} light={light} facing={sofaFacing} />
      <ParlourTable x={x1 - 110} light={light} />
      {lamp > 0 ? <OilLamp x={x1 - 110} y={-160} on={lamp} t={t} light={light} s={0.75} /> : null}
      <Armchair x={x0 + 130} light={light} facing={1} />
      {children}
    </VRoom>
  );
};

/** The dining room: table with a cloth, chairs, a sideboard. */
export const DiningRoom: React.FC<RoomProps & { readonly x0: number; readonly x1: number; readonly laid?: boolean; readonly blind?: number; readonly outside?: string; readonly calendarRing?: number }> = ({ x0, x1, light = NEUTRAL, lamp = 0, t = 0, laid = false, blind = 0.3, outside = "#c8d8dc", children }) => {
  const L = (c: string) => lit(c, light);
  const cx = (x0 + x1) / 2;
  return (
    <VRoom x0={x0} x1={x1} paper="#9a8a5a" motif="#8a7a4a" floor="#5a4028" rug="#4a4a5a" light={light}>
      <SashWindow id={`dr${Math.round(x0)}`} x={x0 + 90} y={-480} w={230} h={290} light={light} outside={outside} blind={blind} curtains="#5a4a3a" />
      {/* sideboard */}
      <rect x={x1 - 380} y={-220} width={300} height={220} fill={L("#4a3020")} />
      <rect x={x1 - 390} y={-232} width={320} height={14} fill={L("#3a2418")} />
      {[0, 1].map((i) => (
        <rect key={i} x={x1 - 360 + i * 150} y={-200} width={130} height={90} fill={L("#5a3a28")} />
      ))}
      {[0, 1, 2].map((i) => (
        <rect key={i} x={x1 - 350 + i * 90} y={-300} width={44} height={68} fill={L("#e8e4dc")} opacity={0.9} />
      ))}
      {lamp > 0 ? <OilLamp x={x1 - 230} y={-232} on={lamp} t={t} light={light} s={0.75} /> : null}
      <SideChair x={cx - 360} facing={1} light={light} />
      <SideChair x={cx + 360} facing={-1} light={light} />
      <DiningTable x={cx} w={560} light={light} laid={laid} />
      {children}
    </VRoom>
  );
};

/** The kitchen: the range, a table, the back door, the back stairs, a calendar. */
export const Kitchen: React.FC<RoomProps & { readonly x0: number; readonly x1: number; readonly fire?: number; readonly backDoorOpen?: number; readonly ironing?: boolean; readonly calendarRing?: number; readonly stairsTo?: number }> = ({ x0, x1, light = NEUTRAL, lamp = 0, t = 0, fire = 0, backDoorOpen = 0, ironing = false, calendarRing = 0, stairsTo = -560, children }) => {
  const L = (c: string) => lit(c, light);
  return (
    <VRoom x0={x0} x1={x1} paper="#b8b090" motif="#a8a080" floor="#6a5a48" light={light} dado={false}>
      {/* shelves and crockery */}
      <rect x={x0 + 40} y={-470} width={280} height={12} fill={L("#5a4a3a")} />
      <rect x={x0 + 40} y={-390} width={280} height={12} fill={L("#5a4a3a")} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={x0 + 60 + i * 66} y={-520} width={40} height={50} rx={6} fill={L(i % 2 ? "#d8e0e8" : "#e8e0d0")} />
          <rect x={x0 + 60 + i * 66} y={-436} width={44} height={46} rx={4} fill={L(i % 2 ? "#8a9aa8" : "#c8b890")} />
        </g>
      ))}
      <Stove x={x0 + 180} light={light} fire={fire} t={t} pipeX={-120} />
      <WallCalendar x={x0 + 330} y={-400} light={light} ring={calendarRing} s={0.9} />
      {/* the side door is in the end wall; its leaf swings into the kitchen when open */}
      {backDoorOpen > 0.02 ? <rect x={x1 - 180 * Math.sin(backDoorOpen * 1.4)} y={-450} width={180 * Math.sin(backDoorOpen * 1.4)} height={450} fill={L("#4a4a48")} /> : null}
      <Stairs x0={x1 - 200} x1={x1 - 20} rise={-stairsTo} light={light} banister={false} />
      {ironing ? <IroningBoard x={x0 + 470} light={light} /> : <DiningTable x={x0 + 470} w={320} light={light} cloth="#d8d0c0" />}
      {lamp > 0 ? <OilLamp x={x0 + 600} y={-160} on={lamp} t={t} light={light} s={0.7} /> : null}
      {children}
    </VRoom>
  );
};

/** The guest room upstairs: bed against the back wall, a dresser, a washstand, a window. */
export const GuestRoom: React.FC<RoomProps & { readonly x0: number; readonly x1: number; readonly made?: number; readonly blind?: number; readonly outside?: string; readonly doorOpen?: number; readonly hem?: number }> = ({ x0, x1, light = NEUTRAL, lamp = 0, t = 0, made = 1, blind = 0.4, outside = "#c8d8dc", doorOpen = 0.6, hem = 0, children }) => {
  const L = (c: string) => lit(c, light);
  return (
    <VRoom x0={x0} x1={x1} paper="#8a9a8a" motif="#7a8a7a" floor="#5a4a38" rug="#5a5a6a" light={light}>
      <SashWindow id={`gr${Math.round(x0)}`} x={x0 + 90} y={-480} w={230} h={290} light={light} outside={outside} blind={blind} curtains="#6a6a5a" />
      <PanelDoor x={x1 - 190} w={170} h={440} open={doorOpen} light={light} beyond="#1a1410" color="#5a4a3a" hinge="right" />
      <Bed x={x0 + 140} w={380} light={light} made={made} quilt="#7a6a58" />
      <Dresser x={x1 - 260} light={light} w={160} />
      {hem > 0 ? (
        <g opacity={hem}>
          {/* only the hem of a dress and a shoe, between the bed and the bureau */}
          <path d={`M${x0 + 430} -16 Q${x0 + 480} -60 ${x0 + 560} -14 Z`} fill={L("#4a3a3e")} />
          <path d={`M${x0 + 556} -10 l36 -6 l6 12 l-38 6 Z`} fill={L("#1e1712")} />
        </g>
      ) : null}
      <Washstand x={x0 + 70} light={light} />
      {lamp > 0 ? <OilLamp x={x1 - 260} y={-210} on={lamp} t={t} light={light} s={0.7} /> : null}
      {children}
    </VRoom>
  );
};

/** Lizzie's room: a bed, a small desk, and the door to the parents' room with a bureau pushed against it. */
export const LizzieRoom: React.FC<RoomProps & { readonly x0: number; readonly x1: number; readonly blind?: number; readonly outside?: string; readonly bolt?: number }> = ({ x0, x1, light = NEUTRAL, lamp = 0, t = 0, blind = 0.3, outside = "#c8d8dc", bolt = 1, children }) => {
  const L = (c: string) => lit(c, light);
  return (
    <VRoom x0={x0} x1={x1} paper="#9a8aa0" motif="#8a7a90" floor="#5a4a38" rug="#6a4a5a" light={light}>
      <SashWindow id={`lr${Math.round(x0)}`} x={x0 + 100} y={-480} w={230} h={290} light={light} outside={outside} blind={blind} curtains="#5a4a5a" />
      {/* the door to the parents' room, bolted, with the bureau in front of it */}
      <PanelDoor x={x1 - 230} w={170} h={440} open={0} light={light} color="#5a4a3a" bolt={bolt} hinge="right" />
      <Dresser x={x1 - 150} light={light} w={200} mirror={false} />
      <Bed x={x0 + 220} w={340} light={light} made={1} quilt="#6a5a6a" facing={1} />
      {/* small writing desk */}
      <rect x={x0 + 30} y={-150} width={160} height={12} fill={L("#4a3020")} />
      <rect x={x0 + 40} y={-138} width={12} height={138} fill={L("#3a2418")} />
      <rect x={x0 + 168} y={-138} width={12} height={138} fill={L("#3a2418")} />
      <rect x={x0 + 70} y={-158} width={80} height={6} fill={L("#e8e0d0")} />
      {lamp > 0 ? <OilLamp x={x0 + 150} y={-150} on={lamp} t={t} light={light} s={0.7} /> : null}
      {children}
    </VRoom>
  );
};

/** The parents' room at the back, reached only by the back stairs. */
export const ParentsRoom: React.FC<RoomProps & { readonly x0: number; readonly x1: number; readonly blind?: number; readonly outside?: string; readonly bolt?: number }> = ({ x0, x1, light = NEUTRAL, lamp = 0, t = 0, blind = 0.4, outside = "#c8d8dc", bolt = 1, children }) => {
  const L = (c: string) => lit(c, light);
  return (
    <VRoom x0={x0} x1={x1} paper="#8a7a6a" motif="#7a6a5a" floor="#5a4a38" rug="#4a4a4a" light={light}>
      <PanelDoor x={x0 + 40} w={170} h={440} open={0} light={light} color="#5a4a3a" bolt={bolt} hinge="left" />
      <SashWindow id={`pr${Math.round(x0)}`} x={x1 - 330} y={-480} w={230} h={290} light={light} outside={outside} blind={blind} curtains="#5a4a3a" />
      <Bed x={x0 + 240} w={400} light={light} made={1} quilt="#5a5a6a" />
      {/* a small iron safe: Andrew's */}
      <rect x={x1 - 135} y={-160} width={120} height={160} fill={L("#2a2a2e")} />
      <circle cx={x1 - 75} cy={-80} r={14} fill={L("#8a8a80")} />
      {lamp > 0 ? <OilLamp x={x1 - 75} y={-160} on={lamp} t={t} light={light} s={0.7} /> : null}
      {children}
    </VRoom>
  );
};

/** Upstairs back hall, with the top of the back stairs and the attic stairs. */
export const BackHall: React.FC<RoomProps & { readonly x0: number; readonly x1: number; readonly stairsTo?: number }> = ({ x0, x1, light = NEUTRAL, lamp = 0, t = 0, stairsTo = -560, children }) => {
  return (
    <VRoom x0={x0} x1={x1} paper="#a89a80" floor="#5a4a38" light={light}>
      <Stairs x0={x1 - 260} x1={x1 - 20} rise={-stairsTo} light={light} banister={false} />
      {lamp > 0 ? <OilLamp x={x0 + 120} y={-300} on={lamp} t={t} light={light} s={0.6} /> : null}
      {children}
    </VRoom>
  );
};

/** Bridget's attic room under the roof slope. */
export const AtticRoom: React.FC<RoomProps & { readonly x0: number; readonly x1: number; readonly outside?: string }> = ({ x0, x1, light = NEUTRAL, lamp = 0, t = 0, outside = "#c8d8dc", children }) => {
  const L = (c: string) => lit(c, light);
  const w = x1 - x0;
  return (
    <g>
      <path d={`M${x0} 0 L${x0} -260 L${x0 + w * 0.5} -620 L${x1} -260 L${x1} 0 Z`} fill={L("#b8a888")} />
      {Array.from({ length: Math.ceil(w / 80) }, (_, i) => (
        <rect key={i} x={x0 + i * 80} y={-620} width={4} height={620} fill={L("#a09070")} opacity={0.4} />
      ))}
      <rect x={x0} y={0} width={w} height={500} fill={L("#6a5a48")} />
      <SashWindow id={`at${Math.round(x0)}`} x={x0 + w / 2 - 80} y={-440} w={160} h={200} light={light} outside={outside} blind={0.2} />
      <Bed x={x0 + 120} w={420} light={light} made={0.8} quilt="#7a7a6a" />
      <SideChair x={x1 - 160} facing={-1} light={light} />
      {lamp > 0 ? <OilLamp x={x1 - 160} y={-100} on={lamp} t={t} light={light} s={0.6} /> : null}
      <Wash x={x0} y={-620} w={w} h={400} from="top" color="#000" opacity={0.4} />
      {children}
    </g>
  );
};

/** The cellar: stone walls, the coal bin, a shelf with hatchets and axes. */
export const Cellar: React.FC<RoomProps & { readonly x0: number; readonly x1: number; readonly tools?: React.ReactNode }> = ({ x0, x1, light = NEUTRAL, lamp = 0, t = 0, tools, children }) => {
  const L = (c: string) => lit(c, light);
  const w = x1 - x0;
  return (
    <g>
      <rect x={x0} y={-420} width={w} height={420} fill={L("#5a5650")} />
      {Array.from({ length: 6 }, (_, r) =>
        Array.from({ length: Math.ceil(w / 150) }, (_, c) => (
          <rect key={`${r}-${c}`} x={x0 + c * 150 + (r % 2) * 75} y={-420 + r * 70} width={140} height={62} fill={L(hash(r * 31 + c) > 0.5 ? "#6a665e" : "#5e5a52")} />
        )),
      )}
      <rect x={x0} y={0} width={w} height={500} fill={L("#3a3228")} />
      {/* coal */}
      <path d={`M${x0 + 60} 0 Q${x0 + 260} -180 ${x0 + 520} 0 Z`} fill={L("#141210")} />
      {Array.from({ length: 14 }, (_, i) => (
        <circle key={i} cx={x0 + 120 + hash(i) * 340} cy={-hash(i + 3) * 120} r={10 + hash(i + 7) * 12} fill={L("#221e1c")} />
      ))}
      {/* shelf and hooks */}
      <rect x={x1 - 900} y={-300} width={560} height={14} fill={L("#4a3a2a")} />
      <rect x={x1 - 900} y={-180} width={560} height={14} fill={L("#4a3a2a")} />
      <g transform={`translate(${x1 - 880} -300)`}>{tools}</g>
      {/* stairs up */}
      <Stairs x0={x0 + w - 60} x1={x0 + w - 420} rise={420} light={light} banister={false} />
      {lamp > 0 ? (
        <g>
          <Glow x={x0 + w * 0.55} y={-260} r={700} color="#ffd9a0" opacity={0.5 * lamp} />
          <OilLamp x={x0 + w * 0.55} y={-180} on={lamp} t={t} light={light} s={0.7} />
        </g>
      ) : null}
      <Wash x={x0} y={-420} w={w} h={300} from="top" color="#000" opacity={0.5} />
      {children}
    </g>
  );
};
