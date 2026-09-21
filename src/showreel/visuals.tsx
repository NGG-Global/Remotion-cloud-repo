import { createTikTokStyleCaptions, type Caption } from "@remotion/captions";
import { lightLeak, starburst } from "@remotion/effects";
import { Gif } from "@remotion/gif";
import { fitText, measureText } from "@remotion/layout-utils";
import { Lottie } from "@remotion/lottie";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { Trail } from "@remotion/motion-blur";
import { noise2D, noise3D } from "@remotion/noise";
import { evolvePath, interpolatePath } from "@remotion/paths";
import { createRoundedTextBox } from "@remotion/rounded-text-box";
import {
  Circle,
  Heart,
  Polygon,
  Rect,
  Star,
  Triangle,
  makeStar,
} from "@remotion/shapes";
import { ThreeCanvas } from "@remotion/three";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { flip } from "@remotion/transitions/flip";
import { iris } from "@remotion/transitions/iris";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { uiFontFamily } from "../fonts";
import { Kicker, Stage } from "./chrome";
import { pulseLottie } from "./lottie";
import { clamp, REEL } from "./theme";

const seconds = (value: number, fps: number) => Math.round(value * fps);

export const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = ["React", "is", "the", "timeline."];
  return (
    <Stage>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          padding: "0 140px",
          fontFamily: uiFontFamily,
        }}
      >
        <Kicker>remotion · compositions · sequences</Kicker>
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: "0.22em 0.32em" }}
        >
          {words.map((word, i) => {
            const p = spring({
              frame: frame - seconds(0.25, fps) - i * 5,
              fps,
              config: { damping: 14, mass: 0.7, stiffness: 120 },
            });
            return (
              <span
                key={word}
                style={{
                  fontSize: 118,
                  fontWeight: 800,
                  letterSpacing: "-0.045em",
                  lineHeight: 1.02,
                  display: "inline-block",
                  opacity: p,
                  transform: `translateY(${interpolate(p, [0, 1], [70, 0])}px)`,
                  color: i === 0 ? REEL.blue : REEL.ink,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
        <p
          style={{
            marginTop: 36,
            fontSize: 32,
            color: REEL.muted,
            maxWidth: 1100,
            opacity: interpolate(frame, [28, 48], [0, 1], clamp),
          }}
        >
          Every frame is a component. Every timing is data. This film is a tour
          of what that model can actually draw.
        </p>
      </AbsoluteFill>
    </Stage>
  );
};

export const SpringsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const easings = [
    { name: "linear", ease: Easing.linear },
    { name: "bezier", ease: Easing.bezier(0.22, 1, 0.36, 1) },
    { name: "in-out", ease: Easing.inOut(Easing.quad) },
    { name: "spring", ease: null },
  ] as const;

  return (
    <Stage>
      <AbsoluteFill
        style={{ padding: "140px 120px", fontFamily: uiFontFamily }}
      >
        <Kicker>interpolate() · spring() · Easing</Kicker>
        <h2 style={{ fontSize: 64, fontWeight: 800, margin: "0 0 48px" }}>
          Motion is a pure function of the frame.
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {easings.map((row, i) => {
            const local = frame - i * 6;
            const x = row.ease
              ? interpolate(local, [0, 70], [0, 1], {
                  ...clamp,
                  easing: row.ease,
                })
              : spring({
                  frame: local,
                  fps,
                  config: { damping: 12, stiffness: 90 },
                });
            return (
              <div
                key={row.name}
                style={{ display: "flex", alignItems: "center", gap: 28 }}
              >
                <div
                  style={{
                    width: 140,
                    fontSize: 22,
                    color: REEL.muted,
                    fontWeight: 600,
                  }}
                >
                  {row.name}
                </div>
                <div
                  style={{
                    flex: 1,
                    height: 8,
                    background: REEL.line,
                    borderRadius: 99,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: `calc(${x * 100}% - 16px)`,
                      top: -12,
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      background: i === 3 ? REEL.orange : REEL.blue,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

const TransCard: React.FC<{
  readonly label: string;
  readonly color: string;
}> = ({ label, color }) => (
  <AbsoluteFill
    style={{
      backgroundColor: color,
      justifyContent: "center",
      alignItems: "center",
      fontFamily: uiFontFamily,
    }}
  >
    <div
      style={{
        fontSize: 22,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        marginBottom: 16,
        opacity: 0.7,
      }}
    >
      @remotion/transitions
    </div>
    <div style={{ fontSize: 84, fontWeight: 800 }}>{label}</div>
  </AbsoluteFill>
);

export const TransitionsScene: React.FC = () => {
  const { width, height, fps } = useVideoConfig();
  const beat = seconds(2.4, fps);
  const overlap = seconds(0.55, fps);
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={beat}>
        <TransCard label="Wipe" color="#0a2744" />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={wipe({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: overlap })}
      />
      <TransitionSeries.Sequence durationInFrames={beat}>
        <TransCard label="Slide" color="#1a120c" />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-left" })}
        timing={linearTiming({ durationInFrames: overlap })}
      />
      <TransitionSeries.Sequence durationInFrames={beat}>
        <TransCard label="Flip" color="#12101c" />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={flip()}
        timing={linearTiming({ durationInFrames: overlap })}
      />
      <TransitionSeries.Sequence durationInFrames={beat}>
        <TransCard label="Iris" color="#071018" />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={iris({ width, height })}
        timing={linearTiming({ durationInFrames: overlap })}
      />
      <TransitionSeries.Sequence durationInFrames={beat + overlap}>
        <TransCard label="Fade" color="#0B84F3" />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: overlap })}
      />
      <TransitionSeries.Sequence durationInFrames={beat}>
        <TransCard label="Cut" color={REEL.bg} />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};

export const ShapesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const morph = interpolate(frame, [10, 70], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const starA = makeStar({ points: 5, innerRadius: 70, outerRadius: 160 });
  const starB = makeStar({ points: 7, innerRadius: 50, outerRadius: 170 });
  const morphed = interpolatePath(morph, starA.path, starB.path);
  const draw = evolvePath(
    spring({ frame: frame - 4, fps, config: { damping: 18 } }),
    morphed,
  );
  const spin = interpolate(frame, [0, 120], [0, 50], clamp);

  return (
    <Stage>
      <AbsoluteFill
        style={{ fontFamily: uiFontFamily, padding: "120px 100px" }}
      >
        <Kicker>@remotion/shapes · @remotion/paths</Kicker>
        <h2 style={{ fontSize: 56, fontWeight: 800, margin: "0 0 28px" }}>
          SVG as a first-class actor.
        </h2>
        <div style={{ display: "flex", gap: 48, alignItems: "center" }}>
          <svg width={420} height={420} viewBox="0 0 360 360">
            <path
              d={morphed}
              transform="translate(180 180)"
              fill="none"
              stroke={REEL.blue}
              strokeWidth={6}
              strokeLinecap="round"
              strokeDasharray={draw.strokeDasharray}
              strokeDashoffset={draw.strokeDashoffset}
            />
          </svg>
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 22, width: 520 }}
          >
            <Circle radius={42} fill={REEL.blue} />
            <Rect width={84} height={84} fill={REEL.orange} />
            <Triangle length={92} direction="up" fill={REEL.blueSoft} />
            <div style={{ transform: `rotate(${spin}deg)` }}>
              <Star
                points={5}
                innerRadius={22}
                outerRadius={44}
                fill={REEL.ink}
              />
            </div>
            <Polygon points={6} radius={44} fill="#5b8def" />
            <Heart height={88} fill={REEL.orange} />
          </div>
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

export const NoiseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const cols = 22;
  const rows = 12;
  const cells = useMemo(() => {
    const list: React.ReactNode[] = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const n = noise3D("reel", x / 5, y / 5, frame / 40);
        const n2 = noise2D("reel-b", x / 3 + frame / 80, y / 3);
        const v = (n + 1) / 2;
        list.push(
          <div
            key={`${x}-${y}`}
            style={{
              width: 56,
              height: 56,
              borderRadius: 10,
              backgroundColor: `rgba(11,132,243,${0.12 + v * 0.78})`,
              transform: `scale(${0.35 + v * 0.75}) rotate(${n2 * 18}deg)`,
            }}
          />,
        );
      }
    }
    return list;
  }, [frame]);

  return (
    <Stage>
      <AbsoluteFill style={{ fontFamily: uiFontFamily }}>
        <div style={{ position: "absolute", top: 120, left: 100, zIndex: 2 }}>
          <Kicker>@remotion/noise</Kicker>
          <h2 style={{ fontSize: 56, fontWeight: 800, margin: 0 }}>
            Seeded fields. Same seed, same film.
          </h2>
        </div>
        <div
          style={{
            position: "absolute",
            inset: "240px 80px 80px",
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            alignContent: "center",
            justifyContent: "center",
          }}
        >
          {cells}
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

export const TrailsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = frame / 18;
  const x = width / 2 + Math.cos(t) * 360;
  const y = height / 2 + Math.sin(t * 1.35) * 210;

  return (
    <Stage>
      <AbsoluteFill
        style={{ fontFamily: uiFontFamily, padding: "120px 100px" }}
      >
        <Kicker>@remotion/motion-blur</Kicker>
        <h2 style={{ fontSize: 56, fontWeight: 800, margin: 0 }}>
          Trails from time, not from a filter.
        </h2>
      </AbsoluteFill>
      <Trail layers={16} lagInFrames={1.15} trailOpacity={0.42}>
        <AbsoluteFill>
          <div
            style={{
              position: "absolute",
              left: x - 42,
              top: y - 42,
              width: 84,
              height: 84,
              borderRadius: 28,
              background: REEL.blue,
              boxShadow: `0 0 40px ${REEL.blue}`,
            }}
          />
        </AbsoluteFill>
      </Trail>
    </Stage>
  );
};

const OrbitMesh: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <group rotation={[frame * 0.012, frame * 0.018, 0.2]}>
      <mesh>
        <icosahedronGeometry args={[1.7, 0]} />
        <meshStandardMaterial
          color={REEL.blue}
          metalness={0.45}
          roughness={0.28}
          wireframe={false}
        />
      </mesh>
      <mesh rotation={[0.4, frame * 0.03, 0]} position={[2.8, 0.2, 0]}>
        <torusGeometry args={[0.55, 0.18, 16, 48]} />
        <meshStandardMaterial
          color={REEL.orange}
          metalness={0.2}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[-2.4, 1.1, 0.4]}>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <meshStandardMaterial
          color={REEL.ink}
          metalness={0.1}
          roughness={0.5}
        />
      </mesh>
    </group>
  );
};

export const ThreeScene: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <Stage>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ fov: 40, position: [0, 0.35, 7.2] }}
        style={{ backgroundColor: "transparent" }}
      >
        <ambientLight intensity={0.45} />
        <directionalLight position={[4, 6, 5]} intensity={1.5} />
        <pointLight
          position={[-4, -2, 3]}
          intensity={0.6}
          color={REEL.orange}
        />
        <OrbitMesh />
      </ThreeCanvas>
      <AbsoluteFill
        style={{
          fontFamily: uiFontFamily,
          padding: "120px 100px",
          pointerEvents: "none",
        }}
      >
        <Kicker>@remotion/three · React Three Fiber</Kicker>
        <h2 style={{ fontSize: 56, fontWeight: 800, margin: 0, maxWidth: 900 }}>
          Real 3D, still frame-accurate.
        </h2>
      </AbsoluteFill>
    </Stage>
  );
};

export const EffectsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = interpolate(frame, [0, durationInFrames - 1], [0, 1], clamp);
  return (
    <Stage>
      <Gif
        src={staticFile("img/showreel-white.gif")}
        width={1920}
        height={1080}
        fit="fill"
        style={{ width: 1920, height: 1080 }}
        effects={[
          starburst({
            rays: 22,
            colors: [REEL.blue, REEL.bg],
            rotation: frame * 0.7,
            smoothness: 0.18,
          }),
          lightLeak({
            seed: 4,
            hueShift: 210,
            progress,
          }),
        ]}
      />
      <AbsoluteFill
        style={{
          fontFamily: uiFontFamily,
          padding: "120px 100px",
          background:
            "linear-gradient(90deg, rgba(7,8,13,0.72) 0%, transparent 70%)",
        }}
      >
        <Kicker>@remotion/effects</Kicker>
        <h2 style={{ fontSize: 64, fontWeight: 800, margin: 0, maxWidth: 820 }}>
          Starburst and light leaks as WebGL plates.
        </h2>
      </AbsoluteFill>
    </Stage>
  );
};

export const DataScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const series = [42, 68, 55, 91, 77, 120, 98, 140];
  const max = Math.max(...series);
  return (
    <Stage>
      <AbsoluteFill
        style={{ padding: "120px 100px", fontFamily: uiFontFamily }}
      >
        <Kicker>programmatic data · springs</Kicker>
        <h2 style={{ fontSize: 56, fontWeight: 800, margin: "0 0 40px" }}>
          A chart is just an array with timing.
        </h2>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 28,
            height: 520,
          }}
        >
          {series.map((value, i) => {
            const p = spring({
              frame: frame - 8 - i * 6,
              fps,
              config: { damping: 14, stiffness: 80 },
            });
            const h = (value / max) * 480 * p;
            return (
              <div
                key={value}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div style={{ fontSize: 22, color: REEL.muted }}>
                  {Math.round(value * p)}
                </div>
                <div
                  style={{
                    width: 72,
                    height: h,
                    borderRadius: "16px 16px 6px 6px",
                    background: i === 5 ? REEL.orange : REEL.blue,
                  }}
                />
                <div style={{ fontSize: 18, color: REEL.muted }}>Q{i + 1}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

export const TypeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const phrase = "FIT TEXT TO THE BOX";
  const fitted = fitText({
    text: phrase,
    withinWidth: 1600,
    fontFamily: uiFontFamily,
    fontWeight: 800,
  });
  const measurements = phrase.split(" ").map((word) =>
    measureText({
      fontFamily: uiFontFamily,
      fontSize: 64,
      fontWeight: "800",
      text: `${word} `,
    }),
  );
  const box = createRoundedTextBox({
    textMeasurements: measurements,
    textAlign: "left",
    horizontalPadding: 36,
    borderRadius: 28,
  });
  const reveal = interpolate(frame, [6, 28], [0, 1], clamp);

  return (
    <Stage>
      <AbsoluteFill
        style={{
          padding: "140px 110px",
          fontFamily: uiFontFamily,
          justifyContent: "center",
        }}
      >
        <Kicker>@remotion/layout-utils · @remotion/rounded-text-box</Kicker>
        <div
          style={{
            fontSize: fitted.fontSize,
            fontWeight: 800,
            letterSpacing: "-0.05em",
            lineHeight: 0.92,
            color: REEL.ink,
            marginBottom: 64,
          }}
        >
          {phrase}
        </div>
        <svg
          width={box.boundingBox.width}
          height={box.boundingBox.height}
          style={{ overflow: "visible", opacity: reveal }}
        >
          <path d={box.d} fill={REEL.blue} />
          {phrase.split(" ").map((word, i) => {
            const x =
              36 +
              measurements.slice(0, i).reduce((sum, m) => sum + m.width, 0);
            return (
              <text
                key={word}
                x={x}
                y={box.boundingBox.height / 2 + 18}
                fill={REEL.ink}
                fontFamily={uiFontFamily}
                fontSize={64}
                fontWeight={800}
              >
                {word}
              </text>
            );
          })}
        </svg>
      </AbsoluteFill>
    </Stage>
  );
};

const CAPTION_WORDS: Caption[] = [
  { text: "Captions", startMs: 0, endMs: 420, timestampMs: 200, confidence: 1 },
  { text: " are", startMs: 420, endMs: 700, timestampMs: 500, confidence: 1 },
  {
    text: " data.",
    startMs: 700,
    endMs: 1200,
    timestampMs: 900,
    confidence: 1,
  },
  {
    text: " Pages",
    startMs: 1400,
    endMs: 1800,
    timestampMs: 1600,
    confidence: 1,
  },
  {
    text: " switch",
    startMs: 1800,
    endMs: 2300,
    timestampMs: 2000,
    confidence: 1,
  },
  { text: " on", startMs: 2300, endMs: 2500, timestampMs: 2400, confidence: 1 },
  {
    text: " time.",
    startMs: 2500,
    endMs: 3100,
    timestampMs: 2800,
    confidence: 1,
  },
  {
    text: " Highlight",
    startMs: 3400,
    endMs: 4000,
    timestampMs: 3600,
    confidence: 1,
  },
  {
    text: " the",
    startMs: 4000,
    endMs: 4300,
    timestampMs: 4150,
    confidence: 1,
  },
  {
    text: " word",
    startMs: 4300,
    endMs: 4700,
    timestampMs: 4500,
    confidence: 1,
  },
  {
    text: " that",
    startMs: 4700,
    endMs: 5000,
    timestampMs: 4850,
    confidence: 1,
  },
  { text: " is", startMs: 5000, endMs: 5200, timestampMs: 5100, confidence: 1 },
  {
    text: " spoken.",
    startMs: 5200,
    endMs: 5900,
    timestampMs: 5500,
    confidence: 1,
  },
  {
    text: " TikTok",
    startMs: 6400,
    endMs: 7000,
    timestampMs: 6700,
    confidence: 1,
  },
  {
    text: " paging",
    startMs: 7000,
    endMs: 7600,
    timestampMs: 7300,
    confidence: 1,
  },
  { text: " is", startMs: 7600, endMs: 7900, timestampMs: 7750, confidence: 1 },
  {
    text: " built",
    startMs: 7900,
    endMs: 8300,
    timestampMs: 8100,
    confidence: 1,
  },
  {
    text: " in.",
    startMs: 8300,
    endMs: 8800,
    timestampMs: 8500,
    confidence: 1,
  },
];

export const CaptionsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const now = (frame / fps) * 1000;
  const { pages } = createTikTokStyleCaptions({
    captions: CAPTION_WORDS,
    combineTokensWithinMilliseconds: 1800,
  });
  const page = [...pages].reverse().find((p) => now >= p.startMs) ?? pages[0];

  return (
    <Stage>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          fontFamily: uiFontFamily,
        }}
      >
        <Kicker>@remotion/captions</Kicker>
        <div
          style={{
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
            justifyContent: "center",
            maxWidth: 1400,
            whiteSpace: "pre",
          }}
        >
          {page.tokens.map((token) => {
            const on = now >= token.fromMs && now < token.toMs;
            return (
              <span
                key={`${token.fromMs}-${token.text}`}
                style={{
                  fontSize: 72,
                  fontWeight: 800,
                  padding: "8px 14px",
                  borderRadius: 14,
                  background: on ? REEL.blue : "transparent",
                  color: on ? REEL.ink : REEL.muted,
                }}
              >
                {token.text.trim()}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

export const AudioScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const audioData = useAudioData(staticFile("audio/showreel-bed.mp3"));
  const bars = audioData
    ? visualizeAudio({
        audioData,
        fps,
        frame,
        numberOfSamples: 32,
      })
    : new Array(32).fill(0.08);

  return (
    <Stage>
      <AbsoluteFill
        style={{ padding: "120px 100px", fontFamily: uiFontFamily }}
      >
        <Kicker>@remotion/media-utils</Kicker>
        <h2 style={{ fontSize: 56, fontWeight: 800, margin: "0 0 36px" }}>
          The mix is a waveform you can draw.
        </h2>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            height: 520,
          }}
        >
          {bars.map((v, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: Math.max(12, v * 480),
                borderRadius: 8,
                background: i % 8 === 0 ? REEL.orange : REEL.blue,
                opacity: 0.55 + v * 0.45,
              }}
            />
          ))}
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

export const MediaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const ken = interpolate(frame, [0, 90], [1.08, 1.18], clamp);
  const pan = interpolate(frame, [0, 90], [0, -30], clamp);

  return (
    <Stage>
      <AbsoluteFill style={{ fontFamily: uiFontFamily, padding: "110px 80px" }}>
        <Kicker>@remotion/lottie · @remotion/gif · Img</Kicker>
        <h2 style={{ fontSize: 48, fontWeight: 800, margin: "0 0 32px" }}>
          Lottie, GIF, and stills on the same stage.
        </h2>
        <div style={{ display: "flex", gap: 36 }}>
          <div
            style={{
              width: 420,
              height: 420,
              background: REEL.bgRaised,
              borderRadius: 28,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Lottie
              animationData={pulseLottie}
              loop
              style={{ width: 320, height: 320 }}
            />
          </div>
          <div
            style={{
              width: 420,
              height: 420,
              borderRadius: 28,
              overflow: "hidden",
            }}
          >
            <Gif
              src={staticFile("img/showreel-gradient.gif")}
              width={420}
              height={420}
              fit="cover"
            />
          </div>
          <div
            style={{
              width: 560,
              height: 420,
              borderRadius: 28,
              overflow: "hidden",
            }}
          >
            <Img
              src={staticFile("img/claude-home.jpg")}
              style={{
                width: 560,
                height: 420,
                objectFit: "cover",
                transform: `scale(${ken}) translateX(${pan}px)`,
              }}
            />
          </div>
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - 4, fps, config: { damping: 16 } });
  return (
    <Stage>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          padding: "0 140px",
          fontFamily: uiFontFamily,
        }}
      >
        <Kicker>start here</Kicker>
        <h2
          style={{
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: "-0.045em",
            margin: 0,
            transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px)`,
            opacity: p,
          }}
        >
          npm run dev
        </h2>
        <p
          style={{
            marginTop: 28,
            fontSize: 32,
            color: REEL.muted,
            maxWidth: 1100,
            opacity: interpolate(frame, [18, 36], [0, 1], clamp),
          }}
        >
          Open Remotion Studio. Duplicate a scene. Drive it from the frame
          number. That is the whole trick.
        </p>
      </AbsoluteFill>
    </Stage>
  );
};
