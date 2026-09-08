import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Stage } from "../components/Stage";
import { Callout } from "../ui/Callout";
import { Cursor } from "../ui/Cursor";
import { Highlight } from "../ui/Highlight";
import { REGIONS } from "../ui/regions";
import { UIShowcase } from "../ui/UIShowcase";
import { useFocus } from "../ui/useFocus";

/**
 * Development-only harness that exercises every screenshot overlay at once, so
 * the indicator machinery can be checked from a few stills instead of a full
 * render. Not part of the delivered video.
 */
export const UIKitDemo: React.FC = () => {
  const frame = useCurrentFrame();

  const focus = useFocus([
    { at: 0 },
    { at: 40, region: REGIONS.newChat, fill: 0.42, duration: 30 },
    { at: 110, region: REGIONS.composer, fill: 0.62, duration: 30 },
    { at: 190 },
  ]);

  const reveal = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Stage>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <UIShowcase focus={focus} width={1560} reveal={reveal}>
          {frame >= 45 && frame < 105 ? (
            <>
              <Highlight region={REGIONS.newChat} delay={45} />
              <Callout
                region={REGIONS.newChat}
                label="שיחה חדשה"
                side="right"
                delay={52}
                reach={170}
              />
            </>
          ) : null}

          {frame >= 115 ? (
            <>
              <Highlight region={REGIONS.composer} delay={115} pad={14} />
              <Callout
                region={REGIONS.modelPicker}
                label="בחירת מודל"
                side="top"
                delay={130}
                reach={110}
              />
            </>
          ) : null}

          <Cursor
            appearAt={30}
            stops={[
              { at: 30, region: REGIONS.logo },
              { at: 45, region: REGIONS.newChat, click: true },
              { at: 120, region: REGIONS.composer },
              { at: 150, region: REGIONS.modelPicker, click: true },
            ]}
          />
        </UIShowcase>
      </AbsoluteFill>
    </Stage>
  );
};
