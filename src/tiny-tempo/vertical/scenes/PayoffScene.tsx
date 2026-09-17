import React from "react";
import { AbsoluteFill } from "remotion";
import { StarMedal } from "../../components/feedback";
import { BodyCopy } from "../../components/type";
import { DISPLAY, TT } from "../../theme";
import { PaperTall } from "../acts/PaperTall";
import { beats } from "../frame";
import { BeatTrack, type Mark } from "../hud/GameHud";
import { useClock } from "../../clock";

const SNIPS = [beats(0), beats(1), beats(2), beats(3)];
/** The reveal runs on the downbeat after the last snip, the way the act's coda does. */
const FINISH = beats(4);

/**
 * The act that ends with something made.
 *
 * Scissors & paper grades its ending on the round's own accuracy rather than on a
 * pass mark, so the ad shows the top of that scale: the cut closes, the star comes
 * away from the sheet, and the result stars land on the beats after it.
 */
export const PayoffScene: React.FC = () => {
  const { time } = useClock();
  const marks: Mark[] = SNIPS.map((hit) =>
    time < hit ? "pending" : "perfect",
  );

  return (
    <AbsoluteFill>
      <PaperTall hits={SNIPS} finish={FINISH} />

      {time < FINISH ? (
        <BeatTrack hits={SNIPS} marks={marks} y={1660} />
      ) : (
        <>
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 1080 1920"
            style={{ position: "absolute", inset: 0 }}
            aria-hidden
          >
            <StarMedal x={306} y={1452} radius={104} delay={62} />
            <StarMedal x={540} y={1398} radius={128} delay={68} />
            <StarMedal x={774} y={1452} radius={104} delay={74} />
          </svg>
          <AbsoluteFill
            style={{
              justifyContent: "flex-end",
              alignItems: "center",
              paddingBottom: 132,
            }}
          >
            <BodyCopy
              text="Three stars. Cut clean."
              size={46}
              weight={800}
              color={TT.ink}
              delay={78}
            />
          </AbsoluteFill>
        </>
      )}

      <AbsoluteFill
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          paddingTop: 128,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            padding: "16px 48px",
            borderRadius: 30,
            background: TT.inkDeep,
            fontFamily: DISPLAY,
            fontWeight: 700,
            fontSize: 62,
            letterSpacing: "-0.02em",
            color: TT.cream,
            transform: "rotate(-1.2deg)",
          }}
        >
          A little paper magic.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
