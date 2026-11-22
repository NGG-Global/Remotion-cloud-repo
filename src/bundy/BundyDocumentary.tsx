import React from "react";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ClipShot, StillShot } from "./components/Media";
import { Caption, ChapterTitle, CreditTag, Subscribe } from "./components/Overlays";
import {
  CAPTIONS,
  CHAPTERS,
  END,
  SHOTS,
  SUBSCRIBE,
  TAIL,
  type Shot,
  type Visual,
} from "./data/edit";
import { FILMS } from "./data/sources";
import { STILLS, type StillId } from "./data/stills";
import "../doc/fonts";
import "../fonts";
import { Cards, Names } from "./graphics/Cards";
import { Ceiling, TV, Wanted, Window } from "./graphics/Frames";
import { CountCard, TextStack } from "./graphics/Text";
import { EndCard, Myth, Sting } from "./graphics/Titles";
import { USMap } from "./graphics/USMap";
import { B } from "./theme";

const FPS = 30;
const f = (s: number) => Math.round(s * FPS);

export const BUNDY_DURATION = f(END);

const TAIL_FRAMES = f(TAIL);
/** Default entrance: a short dissolve. Explicit "dissolve" is longer. */
const SOFT = 12;
const LONG = 18;

const Graphic: React.FC<{ v: Extract<Visual, { kind: "gfx" }> }> = ({ v }) => {
  const p = (v.props ?? {}) as Record<string, string | undefined>;
  switch (v.name) {
    case "sting":
      return <Sting grand={p.variant === "close"} />;
    case "map":
      return <USMap preset={p.preset ?? "overview"} />;
    case "cards":
      return <Cards variant={p.variant ?? ""} />;
    case "names":
      return <Names />;
    case "text":
      return <TextStack variant={p.variant ?? ""} />;
    case "count":
      return <CountCard variant={p.variant ?? ""} />;
    case "window":
      return <Window variant={p.variant} />;
    case "ceiling":
      return <Ceiling variant={p.variant} />;
    case "wanted":
      return <Wanted />;
    case "tv":
      return <TV img={(p.img ?? "court") as StillId} variant={p.variant} />;
    case "myth":
      return <Myth />;
    case "endCard":
      return <EndCard />;
    default:
      return null;
  }
};

const ShotView: React.FC<{ v: Visual; frames: number }> = ({ v, frames }) => {
  if (v.kind === "clip") return <ClipShot v={v} frames={frames} />;
  if (v.kind === "still") return <StillShot v={v} frames={frames} />;
  return (
    <AbsoluteFill style={{ background: B.black }}>
      {v.bg?.kind === "clip" ? <ClipShot v={v.bg} frames={frames} /> : null}
      {v.bg?.kind === "still" ? <StillShot v={v.bg} frames={frames} /> : null}
      <Graphic v={v} />
    </AbsoluteFill>
  );
};

const Entrance: React.FC<{
  enter: Shot["enter"];
  children: React.ReactNode;
}> = ({ enter, children }) => {
  const frame = useCurrentFrame();
  const fade =
    enter === "cut" || enter === "flash"
      ? 0
      : enter === "black"
        ? 30
        : enter === "dissolve"
          ? LONG
          : SOFT;
  const o =
    fade === 0
      ? 1
      : interpolate(frame, [0, fade], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

/** Who made the picture on screen; shown when that changes. */
const creditOf = (v: Visual): string | null => {
  const base = v.kind === "gfx" ? (v.bg ?? null) : v;
  if (!base) return null;
  if (base.kind === "clip") return FILMS[base.src].credit;
  return STILLS[base.img].credit ?? null;
};

/** The final fade to black over the last second. */
const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        background: "#000",
        opacity: interpolate(frame, [0, durationInFrames - 1], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    />
  );
};

/**
 * "Faces of Evil: Ted Bundy" — a 22-minute documentary cut to a three-part
 * Hebrew narration.
 *
 * The record on screen is photographs of Bundy from the State Archives of
 * Florida, the FBI and the Florida Department of Corrections; the places of
 * the story in the 1970s (EPA DOCUMERICA, the Library of Congress); maps;
 * and memorial cards that name the women. The moving pictures are period
 * atmosphere and carry their own credit. The shot list is
 * src/bundy/data/edit.ts.
 */
export const BundyDocumentary: React.FC = () => {
  let lastCredit: string | null = null;
  return (
    <AbsoluteFill style={{ backgroundColor: B.black }}>
      <Audio src={staticFile("bundy/audio/mix.wav")} />

      {SHOTS.map((shot, i) => {
        const from = f(shot.at);
        const next = SHOTS[i + 1] ? f(SHOTS[i + 1].at) : f(END);
        const frames = next - from + (SHOTS[i + 1] ? TAIL_FRAMES : 0);
        return (
          <Sequence
            key={`s${i}`}
            from={from}
            durationInFrames={frames}
            name={`${shot.at.toFixed(1)} ${shot.v.kind === "gfx" ? shot.v.name : shot.v.kind === "clip" ? shot.v.src : shot.v.img}`}
          >
            <Entrance enter={shot.enter}>
              <ShotView v={shot.v} frames={frames} />
            </Entrance>
          </Sequence>
        );
      })}

      {SHOTS.map((shot, i) => {
        const credit = creditOf(shot.v);
        const show = credit && credit !== lastCredit;
        lastCredit = credit ?? lastCredit;
        if (!show) return null;
        const next = SHOTS[i + 1]?.at ?? END;
        const len = Math.min(3.2, next - shot.at - 0.2);
        if (len < 1.2) return null;
        return (
          <Sequence
            key={`c${i}`}
            from={f(shot.at + 0.3)}
            durationInFrames={f(len)}
            name="credit"
          >
            <CreditTag text={credit} />
          </Sequence>
        );
      })}

      {CAPTIONS.map((c, i) => (
        <Sequence
          key={`cap${i}`}
          from={f(c.at)}
          durationInFrames={f(c.until) - f(c.at)}
          name="caption"
        >
          <Caption title={c.title} sub={c.sub} />
        </Sequence>
      ))}

      {CHAPTERS.filter((c) => !c.inline).map((c, i) => (
        <Sequence
          key={`ch${i}`}
          from={f(c.at)}
          durationInFrames={f(4.4)}
          name={`chapter ${c.n}`}
        >
          <ChapterTitle n={c.n} title={c.title} />
        </Sequence>
      ))}

      <Sequence
        from={f(SUBSCRIBE.at)}
        durationInFrames={f(SUBSCRIBE.until) - f(SUBSCRIBE.at)}
        name="subscribe"
      >
        <Subscribe />
      </Sequence>

      {/* A static vignette; see the note in the Hiroshima film on why the
          grain layer is left out. */}
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background:
            "radial-gradient(85% 75% at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)",
        }}
      />

      <Sequence from={f(END) - 30} durationInFrames={30} name="fade out">
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
