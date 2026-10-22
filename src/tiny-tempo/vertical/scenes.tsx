import React from "react";
import { AbsoluteFill, Img, interpolate, Sequence, staticFile } from "remotion";
import { seconds } from "../../theme";
import { useClock } from "../clock";
import { BeatBeads, HangingSign, PlayBlock } from "../components/chrome";
import { PaperField } from "../components/stage";
import { BodyCopy, StampType } from "../components/type";
import { BAR, BEAT, TT } from "../theme";
import {
  AreaMarquee,
  Card,
  Footage,
  PunchIn,
  Sticker,
  Vignette,
} from "./parts";
import { AREAS, MONTAGE, SHOTS } from "./shots";

const HEADLINE_TOP = 150;

/**
 * Bars 1–3. The whole game in one level: the hammer's demonstration bar, the
 * player's bar landing three Perfects, and the flawless coda. The footage runs
 * uncut; only the words change, one a bar.
 */
export const HookScene: React.FC = () => {
  const { time } = useClock();
  const line = time < BAR ? 0 : time < BAR * 2 ? 1 : 2;
  const lineStart = line * BAR;
  const words = ["WATCH.", "TAP IT\nBACK.", "THAT'S IT."][line]!;
  const fill = [TT.cream, TT.coral, TT.cream][line]!;
  return (
    <AbsoluteFill>
      <PunchIn amount={0.08}>
        <Footage shot={SHOTS.hammer} />
      </PunchIn>
      <Vignette top={0.42} bottom={0.1} />
      <Sequence from={seconds(lineStart)} name={words} layout="none">
        <AbsoluteFill style={{ alignItems: "center", paddingTop: HEADLINE_TOP }}>
          <StampType text={words} size={line === 1 ? 168 : 190} fill={fill} />
        </AbsoluteFill>
      </Sequence>
      {line === 1 ? (
        <Sticker text="Your turn" x={820} y={1230} rotate={6} delay={seconds(BAR + 0.1)} size={48} fill={TT.coral} color={TT.cream} />
      ) : null}
    </AbsoluteFill>
  );
};

/** The montage's cut points, in seconds from its start: four one-second acts, four half-second ones, then a whole bar for the paper star. */
export const MONTAGE_CUTS = [0, 1, 2, 3, 4, 4.5, 5, 5.5, 6] as const;
export const MONTAGE_LENGTH = 8;

/**
 * Bars 4–7. One act after another, each cut landing on a judged hit, each a
 * card slapped down at the opposite tilt to the last. The headline stays; the
 * stickers do the counting.
 */
export const MontageScene: React.FC = () => {
  const { time } = useClock();
  return (
    <PaperField paper={TT.coral} sun="#f0a080" sunX={50} sunY={30}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 30%, rgba(255,244,220,0.18) 0%, rgba(255,244,220,0) 55%)",
        }}
      />
      {MONTAGE.map((shot, i) => {
        const at = MONTAGE_CUTS[i]!;
        const end = MONTAGE_CUTS[i + 1] ?? MONTAGE_LENGTH;
        const tilt = i % 2 === 0 ? -1 : 1;
        return (
          <Sequence
            key={shot.file}
            from={seconds(at)}
            durationInFrames={seconds(end - at)}
            name={shot.title}
            layout="none"
          >
            <Card tilt={tilt}>
              <Footage shot={shot} />
            </Card>
            <Sticker
              text={shot.title}
              x={tilt < 0 ? 300 : 780}
              y={1700}
              rotate={tilt < 0 ? -7 : 6}
              delay={2}
              size={50}
            />
          </Sequence>
        );
      })}
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 110 }}>
        <StampType text="36 ACTS." size={200} fill={TT.cream} />
        <div style={{ height: 14 }} />
        <StampType
          text="Everyday things, on the beat."
          size={56}
          fill={TT.cream}
          delay={seconds(0.35)}
        />
      </AbsoluteFill>
      <Sticker
        text={`${Math.min(36, 1 + Math.floor(time / BEAT) * 3)}`}
        x={960}
        y={120}
        rotate={8}
        size={64}
        fill={TT.sun}
      />
    </PaperField>
  );
};

/** Bars 8–9. The plaque drops, three stars seat, IN THE POCKET. */
export const ResultScene: React.FC = () => (
  <AbsoluteFill>
    <PunchIn>
      <Footage shot={SHOTS.result} />
    </PunchIn>
    <Vignette top={0.3} bottom={0.3} />
    <AbsoluteFill style={{ alignItems: "center", paddingTop: HEADLINE_TOP - 20 }}>
      <StampType text="NAIL IT." size={200} fill={TT.brassLit} />
    </AbsoluteFill>
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 150 }}>
      <Sticker text="Perfect is ±55 ms." x={540} y={0} rotate={-3} delay={seconds(BAR)} size={50} fill={TT.cream} />
    </AbsoluteFill>
  </AbsoluteFill>
);

/**
 * Bars 10–11. The road, flicked back through two areas, then a star gate
 * tapped open: the lock pops, the bar swings off, the banner stamps.
 */
export const RoadScene: React.FC = () => {
  const { time } = useClock();
  const gate = time >= BAR;
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={seconds(BAR)} name="Road" layout="none">
        <PunchIn>
          <Footage shot={SHOTS.road} />
        </PunchIn>
      </Sequence>
      <Sequence from={seconds(BAR)} name="Gate" layout="none">
        <PunchIn amount={0.1}>
          <Footage shot={SHOTS.gate} />
        </PunchIn>
      </Sequence>
      <Vignette top={0.42} bottom={0.3} />
      {gate ? (
        <Sequence from={seconds(BAR)} layout="none">
          <AbsoluteFill style={{ alignItems: "center", paddingTop: HEADLINE_TOP - 30 }}>
            <StampType text="EARN STARS." size={136} fill={TT.brassLit} />
            <div style={{ height: 10 }} />
            <StampType text="OPEN THE ROAD." size={136} fill={TT.cream} delay={seconds(0.3)} />
          </AbsoluteFill>
        </Sequence>
      ) : (
        <AbsoluteFill style={{ alignItems: "center", paddingTop: HEADLINE_TOP - 30 }}>
          <StampType text={"AN ENDLESS\nROAD."} size={170} fill={TT.cream} />
        </AbsoluteFill>
      )}
      <AreaMarquee names={AREAS} y={1680} speed={680} />
    </AbsoluteFill>
  );
};

/** Bars 12–13. The sign, the tagline, the Play block, and the beat still going. */
export const OutroScene: React.FC = () => {
  const { time, durationInFrames, fps } = useClock();
  const fade = interpolate(time, [durationInFrames / fps - 0.6, durationInFrames / fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <PaperField sunX={50} sunY={24}>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
        <HangingSign width={720} delay={seconds(0.05)} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: 300, gap: 34 }}>
        <StampType text={"The rhythm of\neveryday life."} size={92} fill={TT.ink} stroke={TT.cream} shadow={false} delay={seconds(0.5)} />
        <div style={{ height: 6 }} />
        <PlayBlock delay={seconds(0.9)} width={520} />
        <BodyCopy text="Watch it. Tap it back." size={44} color={TT.muted} delay={seconds(1.25)} weight={800} />
        <div style={{ marginTop: 18 }}>
          <BeatBeads pattern={[true, true, true, true]} time={time % (BEAT * 4)} size={44} />
        </div>
      </AbsoluteFill>
      <Img
        src={staticFile("img/tiny-tempo-icon.jpg")}
        alt="Tiny Tempo"
        style={{
          position: "absolute",
          left: 540 - 90,
          bottom: 110,
          width: 180,
          height: 180,
          borderRadius: 40,
          border: `8px solid ${TT.inkDeep}`,
          boxShadow: `0 12px 0 ${TT.inkDeep}33`,
          objectFit: "cover",
          opacity: interpolate(time, [1.5, 1.9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(time, [1.5, 1.9], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
        }}
      />
      <AbsoluteFill style={{ backgroundColor: TT.paper, opacity: fade, pointerEvents: "none" }} />
    </PaperField>
  );
};
