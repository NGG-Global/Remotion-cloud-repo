import React from "react";
import { AbsoluteFill } from "remotion";
import { Film } from "../look/Film";
import { Fog } from "../look/Fog";
import { DOC } from "../theme";

type SceneProps = {
  readonly children?: React.ReactNode;
  /** Background; defaults to the film's near-black. */
  readonly background?: string;
  /** Fog density, 0 for none. */
  readonly fog?: number;
  readonly fogBand?: "low" | "full" | "high";
  readonly fogTint?: string;
  readonly fogSpeed?: number;
  /** Gaslight flicker amplitude. */
  readonly flicker?: number;
  readonly grain?: number;
  readonly vignette?: number;
  readonly scratches?: boolean;
  /** A warm pool of light, given as a CSS position, e.g. "70% 30%". */
  readonly lamp?: string;
  readonly lampStrength?: number;
};

/**
 * The stage every documentary scene sits on: dark ground, optional fog and
 * lamplight beneath the content, and the photographic finish on top.
 */
export const Scene: React.FC<SceneProps> = ({
  children,
  background = DOC.black,
  fog = 0,
  fogBand = "full",
  fogTint,
  fogSpeed,
  flicker = 0.25,
  grain = 0.09,
  vignette = 0.75,
  scratches = false,
  lamp,
  lampStrength = 0.35,
}) => (
  <AbsoluteFill style={{ background }}>
    {lamp ? (
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 55% at ${lamp}, rgba(230,165,74,${lampStrength}) 0%, rgba(230,165,74,${lampStrength * 0.35}) 30%, transparent 70%)`,
        }}
      />
    ) : null}
    {fog > 0 ? (
      <Fog density={fog} band={fogBand} tint={fogTint} speed={fogSpeed} />
    ) : null}
    {children}
    <Film
      grain={grain}
      vignette={vignette}
      flicker={flicker}
      scratches={scratches}
    />
  </AbsoluteFill>
);
