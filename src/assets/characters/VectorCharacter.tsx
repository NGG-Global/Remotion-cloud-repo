import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { CharacterAction } from "../actions";
import { poseAt } from "./pose";

export type CostumeId = "civilian" | "police";

type Palette = {
  readonly skin: string;
  readonly hair: string;
  readonly shirt: string;
  readonly pants: string;
  readonly shoes: string;
  readonly hat: string | null;
  readonly badge: boolean;
};

const PALETTES: Record<CostumeId, Palette> = {
  civilian: {
    skin: "#e6b897",
    hair: "#3a2a22",
    shirt: "#3d6ea8",
    pants: "#2c3340",
    shoes: "#1b1b1b",
    hat: null,
    badge: false,
  },
  police: {
    skin: "#e0b08f",
    hair: "#2a211c",
    shirt: "#1e3a5f",
    pants: "#243044",
    shoes: "#111111",
    hat: "#1a2744",
    badge: true,
  },
};

type VectorCharacterProps = {
  readonly action: CharacterAction;
  readonly costume: CostumeId;
  readonly startFrame?: number;
  readonly speed?: number;
};

/**
 * Original vector person. The viewBox is 240 by 420 and the feet sit on the
 * bottom edge, which is the character anchor.
 */
export const VectorCharacter: React.FC<VectorCharacterProps> = ({
  action,
  costume,
  startFrame = 0,
  speed = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pose = poseAt(action, frame - startFrame, fps, speed);
  const palette = PALETTES[costume];

  return (
    <svg viewBox="0 0 240 420" width="100%" height="100%">
      <ellipse cx="120" cy="404" rx="46" ry="8" fill="rgba(0,0,0,0.28)" />
      <g
        transform={`translate(120 ${248 + pose.hipDrop + pose.bob}) rotate(${pose.lean})`}
      >
        <Limb
          rotation={pose.legL}
          x={-18}
          color={palette.pants}
          knee={pose.kneeL}
          shoe={palette.shoes}
        />
        <Limb
          rotation={pose.legR}
          x={8}
          color={palette.pants}
          knee={pose.kneeR}
          shoe={palette.shoes}
        />
        <rect
          x={-34}
          y={-118}
          width={68}
          height={124}
          rx={18}
          fill={palette.shirt}
        />
        {palette.badge ? (
          <circle cx={16} cy={-70} r={7} fill="#e2c14a" />
        ) : null}
        <Arm
          rotation={pose.armL}
          elbow={pose.elbowL}
          x={-40}
          color={palette.shirt}
          skin={palette.skin}
        />
        <Arm
          rotation={pose.armR}
          elbow={pose.elbowR}
          x={28}
          color={palette.shirt}
          skin={palette.skin}
        />
        <g
          transform={`translate(${pose.headTurn * 0.6} ${-150}) rotate(${pose.headTilt + pose.headTurn * 0.4})`}
        >
          <circle cx={0} cy={0} r={32} fill={palette.skin} />
          {palette.hat ? (
            <g>
              <rect
                x={-34}
                y={-8}
                width={68}
                height={8}
                rx={2}
                fill={palette.hat}
              />
              <rect
                x={-22}
                y={-28}
                width={44}
                height={22}
                rx={4}
                fill={palette.hat}
              />
            </g>
          ) : (
            <path
              d="M-28 -6 C-24 -34 24 -34 28 -6 C16 -18 -16 -18 -28 -6 Z"
              fill={palette.hair}
            />
          )}
          <g transform={`translate(${pose.headTurn * 0.35} 2)`}>
            <ellipse
              cx={-12}
              cy={0}
              rx={4}
              ry={4 * pose.eyeScaleY}
              fill="#1c1c1c"
            />
            <ellipse
              cx={12}
              cy={0}
              rx={4}
              ry={4 * pose.eyeScaleY}
              fill="#1c1c1c"
            />
          </g>
          <rect
            x={-14}
            y={-16 - pose.brow}
            width={10}
            height={3}
            rx={1}
            fill="#4a342c"
            transform={`rotate(${-8 - pose.brow} -9 -14)`}
          />
          <rect
            x={4}
            y={-16 - pose.brow}
            width={10}
            height={3}
            rx={1}
            fill="#4a342c"
            transform={`rotate(${8 + pose.brow} 9 -14)`}
          />
          <ellipse
            cx={0}
            cy={16}
            rx={7}
            ry={2 + pose.mouth * 8}
            fill="#6e3b3b"
          />
        </g>
      </g>
    </svg>
  );
};

const Limb: React.FC<{
  readonly rotation: number;
  readonly x: number;
  readonly color: string;
  readonly knee: number;
  readonly shoe: string;
}> = ({ rotation, x, color, knee, shoe }) => (
  <g transform={`translate(${x} 0) rotate(${rotation})`}>
    <rect x={-9} y={0} width={18} height={78} rx={8} fill={color} />
    <g transform={`translate(0 70) rotate(${knee})`}>
      <rect x={-9} y={0} width={18} height={70} rx={8} fill={color} />
      <ellipse cx={2} cy={74} rx={16} ry={7} fill={shoe} />
    </g>
  </g>
);

const Arm: React.FC<{
  readonly rotation: number;
  readonly elbow: number;
  readonly x: number;
  readonly color: string;
  readonly skin: string;
}> = ({ rotation, elbow, x, color, skin }) => (
  <g transform={`translate(${x} -96) rotate(${rotation})`}>
    <rect x={-7} y={0} width={14} height={58} rx={7} fill={color} />
    <g transform={`translate(0 52) rotate(${elbow})`}>
      <rect x={-6} y={0} width={12} height={46} rx={6} fill={skin} />
      <circle cx={0} cy={50} r={7} fill={skin} />
    </g>
  </g>
);
