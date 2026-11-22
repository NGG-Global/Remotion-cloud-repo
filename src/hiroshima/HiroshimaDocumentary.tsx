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
import {
  BlackRain,
  Caption,
  ChapterTitle,
  CreditTag,
  Flash,
  KineticText,
  Subscribe,
} from "./components/Overlays";
import {
  CAPTIONS,
  CHAPTERS,
  END,
  FLASHES,
  KINETIC,
  RAIN,
  SHOTS,
  SUBSCRIBE,
  TAIL,
  type Shot,
  type Visual,
} from "./data/edit";
import { FILMS } from "./data/sources";
import { STILLS } from "./data/stills";
import "./fonts";
import {
  Book,
  Doctors,
  Hospitals,
  Invisible,
  Leukemia,
  Marrow,
  ThreeWays,
  Toll,
} from "./graphics/Data";
import { Burst, JapanMap } from "./graphics/Maps";
import {
  Clock,
  EndCard,
  NameCard,
  OneMan,
  Quote,
  Recognition,
  Sting,
  Title,
  TwoBlack,
} from "./graphics/Titles";
import { H } from "./theme";

const FPS = 30;
const f = (s: number) => Math.round(s * FPS);

export const HIROSHIMA_DURATION = f(END);

const TAIL_FRAMES = f(TAIL);
/** Default entrance: a short dissolve. Explicit "dissolve" is longer. */
const SOFT = 12;
const LONG = 18;

const Graphic: React.FC<{ v: Extract<Visual, { kind: "gfx" }> }> = ({ v }) => {
  const p = (v.props ?? {}) as Record<string, string>;
  switch (v.name) {
    case "sting":
      return <Sting />;
    case "title":
      return <Title />;
    case "map":
      return <JapanMap preset={p.preset} />;
    case "burst":
      return <Burst />;
    case "threeWays":
      return <ThreeWays />;
    case "doctors":
      return <Doctors />;
    case "hospitals":
      return <Hospitals />;
    case "marrow":
      return <Marrow />;
    case "invisible":
      return <Invisible />;
    case "book":
      return (
        <Book state={(p.state as "title" | "page" | "disputed") ?? "title"} />
      );
    case "toll":
      return <Toll />;
    case "leukemia":
      return <Leukemia />;
    case "twoBlack":
      return <TwoBlack />;
    case "nameCard":
      return (
        <NameCard variant={(p.variant as "intro" | "memorial") ?? "intro"} />
      );
    case "clock":
      return <Clock />;
    case "oneMan":
      return <OneMan />;
    case "recognition":
      return <Recognition />;
    case "quote":
      return <Quote />;
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
    <AbsoluteFill style={{ background: H.black }}>
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
 * "Behind the Nightmare: Hiroshima and Nagasaki" — a 23-minute archival
 * documentary cut to a three-part Hebrew narration.
 *
 * The picture is the record: U.S. government film of 1945 and 1946 (the
 * Strategic Bombing Survey's colour and black-and-white footage among it),
 * Universal newsreels, and photographs from Wikimedia Commons, with maps and
 * a few explanatory graphics where the narration explains rather than
 * describes. The shot list is src/hiroshima/data/edit.ts.
 */
export const HiroshimaDocumentary: React.FC = () => {
  let lastCredit: string | null = null;
  return (
    <AbsoluteFill style={{ backgroundColor: H.black }}>
      <Audio src={staticFile("hiroshima/audio/mix.wav")} />

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

      {RAIN.map(([a, b, s], i) => (
        <Sequence
          key={`r${i}`}
          from={f(a)}
          durationInFrames={f(b) - f(a)}
          name="rain"
        >
          <BlackRain strength={s} />
        </Sequence>
      ))}

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

      {KINETIC.map((k, i) => (
        <Sequence
          key={`k${i}`}
          from={f(k.at)}
          durationInFrames={f(k.until) - f(k.at)}
          name="kinetic"
        >
          <KineticText
            big={k.big}
            small={k.small}
            note={k.note}
            latin={k.latin}
            pos={k.pos}
          />
        </Sequence>
      ))}

      {CHAPTERS.map((c, i) => (
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

      {FLASHES.map((at, i) => (
        <Sequence
          key={`fl${i}`}
          from={f(at) - 4}
          durationInFrames={70}
          name="flash"
        >
          <Flash />
        </Sequence>
      ))}

      {/* A static vignette. The archive carries its own grain; an animated
          grain layer doubled the render time in this software-composited
          renderer and inflated the file, so it is left out. */}
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
