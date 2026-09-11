import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Scene } from "../components/Scene";
import { Rise } from "../components/Type";
import { DOC, easeInOut, easeOut, ramp, SERIF, SERIF_LATIN } from "../theme";

type StingProps = {
  /** Programme name. */
  readonly series: string;
  /** Episode name, shown smaller beneath. */
  readonly episode?: string;
  /** Longer, slower variant for the welcome after the cold open. */
  readonly grand?: boolean;
};

/**
 * The programme's mark: the name rising out of fog, a red hairline beneath it,
 * and the episode's name. The grand variant adds a slow gaslight bloom.
 */
export const Sting: React.FC<StingProps> = ({
  series,
  episode,
  grand = false,
}) => {
  const frame = useCurrentFrame();
  const bloom = grand ? easeInOut(ramp(frame, 0, 70)) : 0;
  const rule = easeOut(ramp(frame, grand ? 30 : 12, grand ? 70 : 40));
  const drift = frame * 0.06;

  return (
    <Scene
      fog={grand ? 0.7 : 0.5}
      fogBand="full"
      flicker={0.3}
      vignette={0.9}
      lamp={grand ? "50% 40%" : undefined}
      lampStrength={0.22 * bloom}
    >
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          transform: `translateY(${-drift}px)`,
        }}
      >
        <Rise
          text={series}
          delay={grand ? 14 : 4}
          duration={grand ? 40 : 22}
          fontSize={grand ? 128 : 104}
          weight={500}
          color={DOC.text}
          style={{ fontFamily: SERIF, textShadow: "0 0 40px rgba(0,0,0,0.8)" }}
        />
        <div
          style={{
            marginTop: 26,
            width: 520 * rule,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${DOC.red} 30%, ${DOC.red} 70%, transparent)`,
          }}
        />
        {episode ? (
          <Rise
            text={episode}
            delay={grand ? 52 : 26}
            duration={grand ? 34 : 22}
            fontSize={grand ? 56 : 48}
            weight={300}
            color={DOC.paperDark}
            style={{ marginTop: 26, letterSpacing: 2 }}
          />
        ) : null}
        {grand ? (
          <div
            style={{
              marginTop: 34,
              fontFamily: SERIF_LATIN,
              fontSize: 26,
              letterSpacing: 8,
              color: DOC.textMuted,
              opacity: 0.7 * easeOut(ramp(frame, 80, 110)),
            }}
          >
            WHITECHAPEL · 1888
          </div>
        ) : null}
      </AbsoluteFill>
    </Scene>
  );
};
