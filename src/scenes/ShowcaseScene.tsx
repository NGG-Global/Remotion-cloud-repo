import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Stage } from "../components/Stage";
import { fontFamily } from "../fonts";
import { COLORS, FONT_SIZE, seconds } from "../theme";
import { Callout, type CalloutSide } from "../ui/Callout";
import { Cursor, type CursorStop } from "../ui/Cursor";
import { Highlight } from "../ui/Highlight";
import { REGIONS, type Region } from "../ui/regions";
import { UIShowcase } from "../ui/UIShowcase";
import { SCREENSHOT_WIDTH, useFocus, type FocusStep } from "../ui/useFocus";

export type ShowcaseStep = {
  /** Frame, relative to the scene, at which this step begins. */
  readonly at: number;
  /** Element to ring and label. Omit to pull back to the whole interface. */
  readonly region?: Region;
  /**
   * Wider region for the camera, when `region` is a small control such as a
   * toggle inside the composer. The ring still lands on `region`.
   */
  readonly frameOn?: Region;
  /** How much of the frame the element should fill once settled. */
  readonly fill?: number;
  /** Label tethered to the element. */
  readonly label?: string;
  readonly side?: CalloutSide;
  /** Connector length in window pixels. */
  readonly reach?: number;
  /** Dim the rest of the interface while this step is on screen. */
  readonly dim?: boolean;
  /** Length of the camera move, in frames. */
  readonly moveDuration?: number;
};

type ShowcaseSceneProps = {
  /** Persistent title in the corner, naming the section. */
  readonly title?: string;
  readonly steps: readonly ShowcaseStep[];
  /** Width of the interface window on the canvas. */
  readonly windowWidth?: number;
  /** Pointer path across the interface. */
  readonly cursor?: readonly CursorStop[];
  /**
   * Extra overlays drawn in screenshot coordinates, for anything the step list
   * does not express — typing into the composer, for instance.
   */
  readonly extras?: React.ReactNode;
  /** Frames the window takes to appear. Set to 0 when cutting from another
   * showcase scene, so the window does not pop between shots. */
  readonly revealFrames?: number;
  /**
   * Override which regions are blurred. Defaults to the conversation list and
   * the account row, which carry real internal titles and a user's name.
   */
  readonly redact?: readonly Region[];
};

/**
 * Blurred by default: the sidebar's conversation history and the account row.
 * Neither is being taught in this video, and both carry live internal content.
 */
const DEFAULT_REDACTIONS: readonly Region[] = [
  REGIONS.chatList,
  REGIONS.account,
];

/**
 * The interface screenshot under a moving camera, with one indicator at a time.
 *
 * Steps are declarative: each names an element, when to move to it and what to
 * call it, and the scene derives the camera path, the highlight and the label
 * from that. Keeping it to a single active indicator is deliberate — two rings
 * on screen at once leaves the viewer choosing where to look.
 */
export const ShowcaseScene: React.FC<ShowcaseSceneProps> = ({
  title,
  steps,
  windowWidth = 1500,
  cursor,
  revealFrames = seconds(0.6),
  redact = DEFAULT_REDACTIONS,
  extras,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const focusSteps: FocusStep[] = steps.map((step) => ({
    at: step.at,
    region: step.region,
    frameOn: step.frameOn,
    fill: step.fill,
    duration: step.moveDuration,
  }));

  /**
   * Ceiling on the camera's magnification: a little over 1:1 against the
   * screenshot's own pixels. Past this the image softens and the shot looks
   * like a blown-up screenshot rather than a close-up.
   */
  const MAX_UPSCALE = 1.25;
  const focus = useFocus(
    focusSteps,
    (SCREENSHOT_WIDTH * MAX_UPSCALE) / windowWidth,
  );

  const reveal =
    revealFrames === 0
      ? 1
      : interpolate(frame, [0, revealFrames], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  const exit = interpolate(
    frame,
    [durationInFrames - seconds(0.3), durationInFrames - 1],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // The step whose indicator should currently be on screen: the last one that
  // has started and that actually has something to show.
  let activeIndex = -1;
  for (let i = 0; i < steps.length; i++) {
    if (frame >= steps[i].at) {
      activeIndex = i;
    }
  }
  const active = activeIndex >= 0 ? steps[activeIndex] : undefined;

  // Indicators wait for the camera to arrive, otherwise the ring slides across
  // the frame with the image underneath it.
  const settleDelay = active?.moveDuration ?? 26;
  const indicatorDelay = (active?.at ?? 0) + Math.round(settleDelay * 0.7);
  const showIndicator = Boolean(active?.region) && frame >= indicatorDelay;

  return (
    <Stage glow={0.45}>
      <AbsoluteFill
        style={{
          opacity: exit,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <UIShowcase
          focus={focus}
          width={windowWidth}
          reveal={reveal}
          redact={redact}
        >
          {showIndicator && active?.region ? (
            <>
              <Highlight
                region={active.region}
                delay={indicatorDelay}
                dim={active.dim ?? true}
              />
              {active.label ? (
                <Callout
                  region={active.region}
                  label={active.label}
                  side={active.side ?? "right"}
                  reach={active.reach ?? 150}
                  delay={indicatorDelay + 6}
                />
              ) : null}
            </>
          ) : null}

          {extras}

          {cursor ? <Cursor stops={cursor} appearAt={revealFrames} /> : null}
        </UIShowcase>
      </AbsoluteFill>

      {title ? (
        <div
          style={{
            position: "absolute",
            top: 56,
            right: 72,
            direction: "rtl",
            fontFamily,
            fontSize: FONT_SIZE.caption,
            fontWeight: 600,
            letterSpacing: "0.08em",
            color: COLORS.textMuted,
            opacity: interpolate(frame, [seconds(0.3), seconds(0.9)], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {title}
        </div>
      ) : null}
    </Stage>
  );
};
