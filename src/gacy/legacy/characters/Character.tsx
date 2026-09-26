import React from "react";
import { breathe } from "../motion";

export type HairStyle =
  | "gacy"
  | "short"
  | "side"
  | "teen"
  | "buzz"
  | "long"
  | "tied"
  | "gray";

export type Outfit =
  | "suit"
  | "casual70s"
  | "work"
  | "coverall"
  | "police"
  | "detective"
  | "apron"
  | "coat"
  | "robe"
  | "dress"
  | "pogo"
  | "neighbor";

export type Pose =
  | "idle"
  | "walk"
  | "sit"
  | "crouch"
  | "point"
  | "talk"
  | "gesture"
  | "carry"
  | "look";

export type Expression = "neutral" | "smile" | "serious" | "uneasy" | "speak";

export type Body = "slim" | "average" | "stocky";

type Angles = {
  hipDrop: number;
  bob: number;
  torso: number;
  head: number;
  legL: number;
  legR: number;
  kneeL: number;
  kneeR: number;
  armL: number;
  armR: number;
  elbowL: number;
  elbowR: number;
};

const anglesFor = (frame: number, pose: Pose): Angles => {
  const breath = breathe(frame, 0.075);
  const step = Math.sin(frame * 0.26);
  const talk = Math.sin(frame * 0.42);
  const base: Angles = {
    hipDrop: 0,
    bob: breath * 1.6,
    torso: breath * 0.4,
    head: Math.sin(frame * 0.045) * 2.4,
    legL: 2,
    legR: -2,
    kneeL: 2,
    kneeR: 2,
    armL: 6,
    armR: -6,
    elbowL: 4,
    elbowR: 4,
  };
  if (pose === "walk") {
    return {
      ...base,
      bob: Math.abs(step) * 2.4,
      legL: step * 22,
      legR: -step * 22,
      kneeL: Math.max(0, -step) * 18,
      kneeR: Math.max(0, step) * 18,
      armL: -step * 16,
      armR: step * 16,
      elbowL: 8,
      elbowR: 8,
      torso: step * 1.2,
    };
  }
  if (pose === "talk" || pose === "gesture") {
    return {
      ...base,
      armR: -48 + talk * 6,
      elbowR: 18,
      head: talk * 1.6,
    };
  }
  if (pose === "point") {
    return { ...base, armR: -70, elbowR: 8, head: -4 };
  }
  if (pose === "crouch") {
    return {
      ...base,
      hipDrop: 36,
      torso: 10,
      legL: -28,
      legR: -24,
      kneeL: 52,
      kneeR: 56,
      armL: 18,
      armR: -14,
      elbowL: 16,
      elbowR: 20,
      head: 6,
    };
  }
  if (pose === "sit") {
    return {
      ...base,
      hipDrop: 20,
      legL: -72,
      legR: -72,
      kneeL: 70,
      kneeR: 70,
      armL: 10,
      armR: -8,
      elbowL: 10,
      elbowR: 8,
    };
  }
  if (pose === "carry") {
    return { ...base, armL: 36, armR: -36, elbowL: 22, elbowR: 22 };
  }
  if (pose === "look") {
    return { ...base, head: 10, torso: 3 };
  }
  return base;
};

type Wardrobe = {
  jacket: string;
  shirt: string;
  pants: string;
  shoes: string;
  tie?: string;
  pogo?: boolean;
};

const wardrobeFor = (outfit: Outfit, color?: string): Wardrobe => {
  switch (outfit) {
    case "suit":
      return {
        jacket: color ?? "#343c3a",
        shirt: "#f0e9dc",
        pants: "#2a3034",
        shoes: "#161412",
        tie: "#6d3330",
      };
    case "casual70s":
      return {
        jacket: color ?? "#5c5348",
        shirt: "#e7d7bf",
        pants: "#3d4654",
        shoes: "#2a2118",
      };
    case "work":
      return {
        jacket: color ?? "#8d6238",
        shirt: "#ddd2c0",
        pants: "#3c4e62",
        shoes: "#2a2118",
      };
    case "coverall":
      return {
        jacket: color ?? "#4d5d4a",
        shirt: "#4d5d4a",
        pants: "#3e4c3d",
        shoes: "#241c14",
      };
    case "police":
      return {
        jacket: color ?? "#2a384c",
        shirt: "#d5dbe4",
        pants: "#1e2836",
        shoes: "#14181e",
      };
    case "detective":
      return {
        jacket: color ?? "#4a4036",
        shirt: "#e6dcc8",
        pants: "#2e3330",
        shoes: "#1a1612",
        tie: "#3e3430",
      };
    case "apron":
      return {
        jacket: "#efe8dc",
        shirt: "#3d6a78",
        pants: "#3a4250",
        shoes: "#241c16",
      };
    case "coat":
      return {
        jacket: color ?? "#5a463c",
        shirt: "#eadfce",
        pants: "#3a342e",
        shoes: "#241c16",
      };
    case "robe":
      return {
        jacket: color ?? "#1c1e24",
        shirt: "#f4efe6",
        pants: "#1c1e24",
        shoes: "#111114",
      };
    case "dress":
      return {
        jacket: color ?? "#6a4a46",
        shirt: "#6a4a46",
        pants: "#6a4a46",
        shoes: "#2a201c",
      };
    case "neighbor":
      return {
        jacket: color ?? "#6e5a48",
        shirt: "#e8dcc8",
        pants: "#3e4a44",
        shoes: "#241c16",
      };
    case "pogo":
      return {
        jacket: "#a33b3b",
        shirt: "#f6f1e6",
        pants: "#2d4c7a",
        shoes: "#1a1a1a",
        pogo: true,
      };
    default:
      return {
        jacket: "#555",
        shirt: "#eee",
        pants: "#333",
        shoes: "#111",
      };
  }
};

const Hair: React.FC<{ readonly style: HairStyle; readonly color: string }> = ({
  style,
  color,
}) => {
  if (style === "gacy" || style === "gray") {
    return (
      <path
        d="M-28 -6 C-32 -26 -8 -34 2 -28 C 16 -38 34 -26 30 -4 C 22 -16 6 -14 -8 -10 C-20 -16 -26 -6 -28 -6 Z"
        fill={color}
      />
    );
  }
  if (style === "teen" || style === "side") {
    return (
      <path
        d="M-32 2 C-34 -28 -8 -40 4 -32 C 22 -42 36 -22 32 4 C 18 -8 -6 -6 -32 2 Z"
        fill={color}
      />
    );
  }
  if (style === "buzz") {
    return <path d="M-26 0 C-24 -22 24 -24 26 0 C 10 -8 -12 -8 -26 0 Z" fill={color} />;
  }
  if (style === "long") {
    return (
      <path
        d="M-34 4 C-36 -30 0 -44 34 2 C 30 28 22 70 16 78 C 8 40 4 20 0 16 C-6 48 -16 78 -22 70 C-28 36 -32 16 -34 4 Z"
        fill={color}
      />
    );
  }
  if (style === "tied") {
    return (
      <g fill={color}>
        <path d="M-30 2 C-32 -30 0 -40 30 2 C 16 -6 -14 -6 -30 2 Z" />
        <ellipse cx={0} cy={36} rx={10} ry={16} />
      </g>
    );
  }
  return (
    <path
      d="M-30 2 C-32 -30 -4 -38 2 -30 C 20 -40 34 -20 30 4 C 14 -6 -16 -4 -30 2 Z"
      fill={color}
    />
  );
};

const Face: React.FC<{
  readonly expression: Expression;
  readonly frame: number;
  readonly skin: string;
  readonly pogo?: boolean;
}> = ({ expression, frame, skin, pogo }) => {
  const blink = frame % 150 > 143 ? 0.12 : 1;
  const talk =
    expression === "speak" ? 0.55 + Math.abs(Math.sin(frame * 0.55)) * 0.7 : 0;
  const smile = expression === "smile" || expression === "speak" ? 1 : 0;
  const uneasy = expression === "uneasy" ? 1 : 0;
  const serious = expression === "serious" ? 1 : 0;
  return (
    <g>
      <ellipse cx={-4} cy={6} rx={22} ry={16} fill={skin} opacity={0.18} />
      <ellipse
        cx={-12}
        cy={-2}
        rx={3.2}
        ry={3.4 * blink}
        fill="#1a140f"
      />
      <ellipse cx={10} cy={-2} rx={3.2} ry={3.4 * blink} fill="#1a140f" />
      <path
        d={`M-18 ${-10 - uneasy * 2} Q-12 ${-13 + serious * 3} -7 -10`}
        stroke="#3a2a22"
        strokeWidth={1.6}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M6 ${-10 - uneasy * 3} Q12 ${-14 + uneasy * 4} 18 -9`}
        stroke="#3a2a22"
        strokeWidth={1.6}
        fill="none"
        strokeLinecap="round"
      />
      {pogo ? (
        <g>
          <ellipse cx={0} cy={2} rx={30} ry={28} fill="#f7f3ea" />
          <ellipse cx={-12} cy={-2} rx={3.1} ry={3.2 * blink} fill="#1a140f" />
          <ellipse cx={10} cy={-2} rx={3.1} ry={3.2 * blink} fill="#1a140f" />
          <circle cx={0} cy={6} r={5.5} fill="#c43636" />
          <path
            d="M-12 14 Q0 24 12 14"
            stroke="#c43636"
            strokeWidth={2.4}
            fill="none"
            strokeLinecap="round"
          />
          <path d="M-16 -18 Q-6 -28 2 -16" stroke="#d24a3a" strokeWidth={3} fill="none" />
        </g>
      ) : (
        <path
          d={
            talk > 0
              ? `M-8 16 Q0 ${18 + talk * 8} 8 16 Q0 ${20 + talk * 6} -8 16`
              : smile
                ? "M-9 16 Q0 23 9 16"
                : uneasy
                  ? "M-8 18 Q0 15 8 18"
                  : "M-7 17 H7"
          }
          stroke="#6a4034"
          strokeWidth={1.8}
          fill={talk > 0 ? "#6a4034" : "none"}
          strokeLinecap="round"
        />
      )}
    </g>
  );
};

const Limb: React.FC<{
  readonly rot: number;
  readonly bend: number;
  readonly upper: string;
  readonly lower: string;
  readonly shoe?: string;
  readonly leg?: boolean;
}> = ({ rot, bend, upper, lower, shoe, leg }) => {
  const upperLen = leg ? 62 : 46;
  const lowerLen = leg ? 58 : 42;
  return (
    <g transform={`rotate(${rot})`}>
      <rect
        x={leg ? -10 : -7}
        y={0}
        width={leg ? 20 : 14}
        height={upperLen}
        rx={8}
        fill={upper}
      />
      <g transform={`translate(0 ${upperLen - 6}) rotate(${bend})`}>
        <rect
          x={leg ? -9 : -6}
          y={0}
          width={leg ? 18 : 12}
          height={lowerLen}
          rx={7}
          fill={lower}
        />
        {leg ? (
          <ellipse cx={6} cy={lowerLen} rx={15} ry={6} fill={shoe ?? "#1a1612"} />
        ) : (
          <circle cx={0} cy={lowerLen + 2} r={7} fill={lower} />
        )}
      </g>
    </g>
  );
};

export const Character: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly frame: number;
  readonly facing?: 1 | -1;
  readonly scale?: number;
  readonly skin?: string;
  readonly hair?: HairStyle;
  readonly hairColor?: string;
  readonly outfit?: Outfit;
  readonly outfitColor?: string;
  readonly pose?: Pose;
  readonly expression?: Expression;
  readonly body?: Body;
  readonly presentation?: "masc" | "fem";
}> = ({
  x,
  y,
  frame,
  facing = 1,
  scale = 1,
  skin = "#e2b48f",
  hair = "short",
  hairColor = "#221910",
  outfit = "casual70s",
  outfitColor,
  pose = "idle",
  expression = "neutral",
  body = "average",
  presentation = "masc",
}) => {
  const a = anglesFor(frame, pose);
  const clothes = wardrobeFor(outfit, outfitColor);
  const width = body === "stocky" ? 78 : body === "slim" ? 52 : 64;
  const shoulder = presentation === "fem" ? width * 0.86 : width;
  const hipY = -128 + a.hipDrop - a.bob;
  const skinShade = "#c4926e";
  return (
    <g transform={`translate(${x} ${y}) scale(${facing * scale} ${scale})`}>
      <ellipse cx={0} cy={6} rx={46 * scale} ry={10} fill="#000" opacity={0.22} />
      <g transform={`translate(0 ${hipY}) rotate(${a.torso})`}>
        <g transform="translate(-16 0)">
          <Limb
            rot={a.legL}
            bend={a.kneeL}
            upper={clothes.pants}
            lower={clothes.pants}
            shoe={clothes.shoes}
            leg
          />
        </g>
        <g transform="translate(16 0)">
          <Limb
            rot={a.legR}
            bend={a.kneeR}
            upper={clothes.pants}
            lower={clothes.pants}
            shoe={clothes.shoes}
            leg
          />
        </g>
        <rect
          x={-shoulder / 2}
          y={-118}
          width={shoulder}
          height={124}
          rx={shoulder > 70 ? 26 : 20}
          fill={clothes.jacket}
        />
        <path
          d={`M${-shoulder * 0.22} -128 L0 -78 L${shoulder * 0.22} -128`}
          fill={clothes.shirt}
        />
        {clothes.tie ? (
          <path d="M-4 -120 L4 -120 L2 -70 L0 -78 L-2 -70 Z" fill={clothes.tie} />
        ) : null}
        {presentation === "fem" && outfit !== "pogo" ? (
          <path
            d={`M${-shoulder / 2} -20 Q0 16 ${shoulder / 2} -20 L${shoulder / 2 + 6} 8 Q0 28 ${-shoulder / 2 - 6} 8 Z`}
            fill={clothes.jacket}
          />
        ) : null}
        <rect x={-8} y={-150} width={16} height={28} rx={6} fill={skinShade} />
        <g transform={`translate(0 -176) rotate(${a.head})`}>
          <ellipse cx={-30} cy={6} rx={7} ry={10} fill={skinShade} />
          <ellipse cx={30} cy={6} rx={7} ry={10} fill={skinShade} />
          <circle cx={0} cy={0} r={34} fill={skin} />
          <ellipse cx={16} cy={8} rx={16} ry={22} fill="#000" opacity={0.06} />
          <Hair style={hair} color={hairColor} />
          <Face
            expression={expression}
            frame={frame}
            skin={skin}
            pogo={clothes.pogo}
          />
          {clothes.pogo ? (
            <g>
              <path
                d="M-18 -30 Q-28 -48 -8 -36"
                stroke="#d4553a"
                strokeWidth={5}
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M8 -34 Q20 -50 26 -30"
                stroke="#d4553a"
                strokeWidth={5}
                fill="none"
                strokeLinecap="round"
              />
            </g>
          ) : null}
        </g>
        <g transform={`translate(${-shoulder / 2 + 2} ${-108})`}>
          <Limb rot={a.armL} bend={a.elbowL} upper={clothes.jacket} lower={skin} />
        </g>
        <g transform={`translate(${shoulder / 2 - 2} ${-108})`}>
          <Limb rot={a.armR} bend={a.elbowR} upper={clothes.jacket} lower={skin} />
        </g>
        {clothes.pogo ? (
          <g>
            <ellipse cx={0} cy={-118} rx={40} ry={12} fill="#f4efe4" />
            <ellipse cx={0} cy={-112} rx={28} ry={8} fill="#a33b3b" />
            <circle cx={0} cy={-40} r={7} fill="#e6c15a" />
            <circle cx={-18} cy={-18} r={6} fill="#2d4c7a" />
            <circle cx={18} cy={-22} r={6} fill="#e6c15a" />
          </g>
        ) : null}
      </g>
    </g>
  );
};

/** Distant person. Used for crowds and for the people behind a number. */
export const Silhouette: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly h?: number;
  readonly color?: string;
  readonly frame?: number;
  readonly phase?: number;
}> = ({ x, y, h = 220, color = "#141820", frame = 0, phase = 0 }) => {
  const sway = Math.sin(frame * 0.06 + phase) * 1.4;
  return (
    <g transform={`translate(${x} ${y}) rotate(${sway})`} opacity={0.92}>
      <ellipse cx={0} cy={6} rx={h * 0.18} ry={7} fill="#000" opacity={0.25} />
      <circle cx={0} cy={-h + h * 0.12} r={h * 0.11} fill={color} />
      <rect
        x={-h * 0.13}
        y={-h + h * 0.22}
        width={h * 0.26}
        height={h * 0.42}
        rx={h * 0.1}
        fill={color}
      />
      <rect x={-h * 0.16} y={-h * 0.38} width={h * 0.07} height={h * 0.4} rx={6} fill={color} />
      <rect x={h * 0.09} y={-h * 0.38} width={h * 0.07} height={h * 0.4} rx={6} fill={color} />
    </g>
  );
};
