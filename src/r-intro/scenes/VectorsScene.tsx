import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CodePanel } from "../components/CodePanel";
import { Headline } from "../components/Headline";
import { At } from "../components/layout";
import { Pop } from "../components/Pop";
import { Sticker } from "../components/Sticker";
import { sceneClock } from "../clock";
import { DISPLAY, MONO } from "../fonts";
import { R, SIZE, sec } from "../theme";

const c = sceneClock("vectors-q");

/** One cell of a vector: a rounded tile with a value. */
const Cell: React.FC<{
  readonly at: number;
  readonly value: string;
  readonly color?: string;
  readonly textColor?: string;
  readonly size?: number;
  readonly highlight?: boolean;
}> = ({
  at,
  value,
  color = R.white,
  textColor = R.ink,
  size = 150,
  highlight = false,
}) => (
  <Pop at={at} from="below" bounce={1.2}>
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        background: color,
        color: textColor,
        fontFamily: MONO,
        fontSize: size * 0.42,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: highlight
          ? `0 0 0 10px ${R.coral}, 0 14px 28px ${R.ink}2a`
          : `0 0 0 6px ${R.ink}14, 0 14px 28px ${R.ink}2a`,
        direction: "ltr",
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </div>
  </Pop>
);

const VectorRow: React.FC<{
  readonly at: number;
  readonly values: readonly string[];
  readonly color?: string;
  readonly textColor?: string;
  readonly highlightLast?: boolean;
  readonly size?: number;
}> = ({ at, values, color, textColor, highlightLast, size }) => (
  <div
    style={{
      display: "flex",
      gap: 22,
      direction: "ltr",
      justifyContent: "center",
    }}
  >
    {values.map((v, i) => (
      <Cell
        key={`${v}-${i}`}
        at={at + i * 4}
        value={v}
        color={color}
        textColor={textColor}
        size={size}
        highlight={highlightLast && i === values.length - 1}
      />
    ))}
  </div>
);

/** Vectors: a run of values, one type, one operation on all of them. */
export const VectorsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const phase =
    frame >= c.t("c-function")
      ? "code"
      : frame >= c.t("matrices")
        ? "matrix"
        : frame >= c.t("vectorised")
          ? "math"
          : frame >= c.t("coercion")
            ? "coerce"
            : frame >= c.t("vector-examples")
              ? "examples"
              : "intro";

  const times = spring({
    frame: frame - c.after("multiply-all", 0.4),
    fps,
    config: { damping: 12, stiffness: 120 },
  });
  const swapped = frame >= c.after("multiply-all", 1.4);
  const grid = interpolate(
    frame,
    [c.t("matrices"), c.t("matrices") + 24],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill>
      {phase === "intro" ? (
        <>
          <At y={240}>
            <Headline
              text="ואם רוצים לשמור כמה ערכים יחד?"
              at={c.t("vectors-q")}
              size={SIZE.heading}
              mark={["יחד?"]}
              maxWidth={900}
            />
          </At>
          <At y={560}>
            <Sticker
              text="וקטורים"
              at={c.t("vectors")}
              color={R.blue}
              textColor={R.white}
              size={90}
              tilt={-2}
            />
          </At>
          <At y={820}>
            <VectorRow
              at={c.after("vectors", 0.8)}
              values={["", "", "", ""]}
              color={R.sky}
            />
          </At>
          <At y={1060}>
            <Headline
              text="רצף של ערכים"
              at={c.after("vectors", 1.6)}
              size={SIZE.heading}
              mark={["רצף"]}
            />
          </At>
        </>
      ) : null}

      {phase === "examples" ? (
        <>
          <At y={220}>
            <Headline
              text="וקטור יכול להכיל"
              at={c.t("vector-examples")}
              size={SIZE.subheading}
              weight={600}
              color={R.inkSoft}
            />
          </At>
          <At y={380}>
            <Sticker
              text="מספרים"
              at={c.after("vector-examples", 0.4)}
              color={R.blue}
              textColor={R.white}
              size={40}
              tilt={-2}
            />
          </At>
          <At y={500}>
            <VectorRow
              at={c.after("vector-examples", 0.8)}
              values={
                frame >= c.t("repeat") ? ["7", "2", "3", "7"] : ["7", "2", "3"]
              }
              color={R.white}
              highlightLast={frame >= c.t("repeat")}
            />
          </At>
          <At y={720}>
            <Sticker
              text="או טקסט"
              at={c.after("vector-examples", 2.6)}
              color={R.coral}
              textColor={R.white}
              size={40}
              tilt={2}
            />
          </At>
          <At y={840}>
            <VectorRow
              at={c.after("vector-examples", 3.0)}
              values={['"A"', '"B"', '"C"']}
              color={R.white}
            />
          </At>
          {frame >= c.t("repeat") ? (
            <At y={1080}>
              <Headline
                text="ערך יכול להופיע יותר מפעם אחת"
                at={c.t("repeat")}
                size={48}
                mark={["יותר"]}
              />
            </At>
          ) : null}
          {frame >= c.t("same-type") ? (
            <At y={1260}>
              <Sticker
                text="בווקטור בסיסי: כל הערכים מאותו סוג"
                at={c.t("same-type")}
                color={R.yellow}
                size={40}
                tilt={-2}
              />
            </At>
          ) : null}
        </>
      ) : null}

      {phase === "coerce" ? (
        <>
          <At y={240}>
            <Headline
              text="ואם מערבבים סוגים?"
              at={c.t("coercion")}
              size={SIZE.heading}
            />
          </At>
          <At y={460}>
            <VectorRow
              at={c.after("coercion", 0.3)}
              values={["1", '"a"', "TRUE"]}
              color={R.white}
            />
          </At>
          <At y={660}>
            <Pop at={c.after("coercion", 1.4)} from="scale">
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 120,
                  color: R.coral,
                  lineHeight: 1,
                }}
              >
                ↓
              </div>
            </Pop>
          </At>
          <At y={820}>
            <VectorRow
              at={c.after("coercion", 1.8)}
              values={['"1"', '"a"', '"TRUE"']}
              color={R.coral}
              textColor={R.white}
            />
          </At>
          <At y={1040}>
            <Headline
              text="R ממירה את כולם לסוג משותף"
              at={c.after("coercion", 2.2)}
              size={50}
              mark={["משותף"]}
            />
          </At>
        </>
      ) : null}

      {phase === "math" ? (
        <>
          <At y={220}>
            <Headline
              text="היתרון: פעולה אחת על כל הערכים"
              at={c.t("vectorised")}
              size={56}
              mark={["אחת"]}
              maxWidth={900}
            />
          </At>
          <At y={520}>
            <VectorRow
              at={c.after("vectorised", 0.5)}
              values={swapped ? ["14", "4", "6"] : ["7", "2", "3"]}
              color={swapped ? R.green : R.white}
              textColor={swapped ? R.white : R.ink}
            />
          </At>
          <Pop
            at={c.after("multiply-all", 0.4)}
            from="scale"
            style={{ position: "absolute", left: 420, top: 740 }}
          >
            <div
              style={{
                width: 240,
                height: 140,
                borderRadius: 40,
                background: R.yellow,
                fontFamily: MONO,
                fontSize: 80,
                fontWeight: 700,
                color: R.ink,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 0 8px ${R.white}`,
                transform: `rotate(${(1 - times) * -30}deg)`,
              }}
            >
              × 2
            </div>
          </Pop>
          <At y={1000}>
            <Headline
              text="בלי לכתוב את אותה פעולה שוב ושוב"
              at={c.after("multiply-all", 1.8)}
              size={48}
              weight={600}
              color={R.inkSoft}
              maxWidth={900}
            />
          </At>
        </>
      ) : null}

      {phase === "matrix" ? (
        <>
          <At y={240}>
            <Headline
              text="וקטורים הם הבסיס למבנים מורכבים יותר"
              at={c.t("matrices")}
              size={54}
              maxWidth={900}
            />
          </At>
          <div
            style={{
              position: "absolute",
              left: 72,
              top: 560,
              width: 936,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 22,
            }}
          >
            {[
              ["7", "2", "3"],
              ["4", "8", "1"],
              ["5", "9", "6"],
            ].map((row, r) => (
              <div
                key={r}
                style={{
                  display: "flex",
                  gap: 22,
                  direction: "ltr",
                  transform: `translateY(${(1 - grid) * r * -60}px)`,
                  opacity: r === 0 ? 1 : grid,
                }}
              >
                {row.map((v, i) => (
                  <Cell
                    key={i}
                    at={c.t("matrices") + i * 2}
                    value={v}
                    color={[R.sky, R.yellowLit, R.white][r]}
                    size={140}
                  />
                ))}
              </div>
            ))}
          </div>
          <At y={1180}>
            <Sticker
              text="כמו מטריצות"
              at={c.after("matrices", 1.6)}
              color={R.purple}
              textColor={R.white}
              size={54}
              tilt={-2}
            />
          </At>
        </>
      ) : null}

      {phase === "code" ? (
        <>
          <At y={240}>
            <Headline
              text="איך יוצרים וקטור?"
              at={c.t("c-function")}
              size={SIZE.heading}
            />
          </At>
          <At y={440}>
            <Sticker
              text="הפונקציה c()"
              at={c.after("c-function", 0.6)}
              color={R.blue}
              textColor={R.white}
              size={56}
              tilt={-2}
            />
          </At>
          <At y={640}>
            <CodePanel
              at={c.after("c-function", 1.2)}
              width={936}
              fontSize={50}
              lines={[
                { at: 4, text: "scores <- c(7, 2, 3)" },
                { at: sec(1.8), text: "scores" },
                { at: sec(2.5), kind: "output", text: "[1] 7 2 3" },
              ]}
            />
          </At>
          <At y={1120}>
            <Headline
              text="הערכים ברצף, מופרדים בפסיקים"
              at={c.after("c-function", 3.2)}
              size={48}
              mark={["בפסיקים"]}
            />
          </At>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
