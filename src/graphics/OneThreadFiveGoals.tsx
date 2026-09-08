import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";

export type GoalAction = {
  /** Frame at which the narration names this action. */
  readonly at: number;
  readonly text: string;
};

export type GoalKind = "edit" | "summarise" | "ideas" | "compare" | "structure";

export type ThreadGoal = {
  /** Frame at which this goal takes over the output. */
  readonly at: number;
  readonly label: string;
  readonly kind: GoalKind;
  readonly actions: readonly GoalAction[];
};

type OneThreadFiveGoalsProps = {
  readonly width: number;
  readonly height: number;
  readonly goals: readonly ThreadGoal[];
};

type ShapeProps = {
  readonly width: number;
  readonly height: number;
  /** Frames since this goal began. */
  readonly local: number;
  /** Absolute frame, for marks keyed to the narration. */
  readonly frame: number;
  readonly actions: readonly GoalAction[];
};

/** Eased 0-1 ramp from a frame, for a mark landing on a word. */
const at = (frame: number, from: number, over = 20) =>
  interpolate(frame - from, [0, over], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const BODY = [0.95, 0.87, 0.96, 0.79, 0.91, 0.84, 0.72] as const;

/** Writing and editing: marks landing on a draft, then versions of it. */
const EditShape: React.FC<ShapeProps> = ({
  width,
  height,
  local,
  frame,
  actions,
}) => {
  const PAGE = { width: width * 0.46, height: height * 0.92 };
  const pageLeft = width * 0.06;
  const gap = (PAGE.height - 60) / BODY.length;

  const draft = at(local, 0, 26);
  const sharpen = actions[1] ? at(frame, actions[1].at) : 0;
  const shorten = actions[2] ? at(frame, actions[2].at) : 0;
  const tone = actions[3] ? at(frame, actions[3].at) : 0;
  const versions = actions[4] ? at(frame, actions[4].at, 24) : 0;

  return (
    <div style={{ position: "relative", width, height }}>
      <div
        style={{
          position: "absolute",
          left: pageLeft,
          top: (height - PAGE.height) / 2,
          width: PAGE.width,
          height: PAGE.height,
          borderRadius: 14,
          background: COLORS.surface,
          border: "1px solid rgba(255,255,255,0.08)",
          overflow: "hidden",
          // A change of tone recolours the whole page rather than one line.
          boxShadow:
            tone > 0
              ? `inset 0 0 60px rgba(107,163,196,${tone * 0.16})`
              : undefined,
        }}
      >
        {BODY.map((w, i) => {
          const written = Math.max(0, Math.min(1, draft * BODY.length - i));
          if (written <= 0) {
            return null;
          }
          // The last two lines go when the piece is cut.
          // Capped short of full transparency: a strike needs something
          // left to strike through.
          const dropped = i >= BODY.length - 2 ? shorten * 0.82 : 0;
          const tightened = i === 1 ? sharpen * 0.22 : 0;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                right: 20,
                top: 24 + i * gap,
                width: (PAGE.width - 40) * w * written * (1 - tightened),
                height: 10,
                borderRadius: 5,
                background:
                  i === 1 && sharpen > 0.4 ? COLORS.accent : COLORS.text,
                opacity:
                  (i === 1 && sharpen > 0.4 ? 0.9 : 0.42) * (1 - dropped),
              }}
            />
          );
        })}
        {shorten > 0.2
          ? [BODY.length - 2, BODY.length - 1].map((i) => (
              <div
                key={`s${i}`}
                style={{
                  position: "absolute",
                  right: 20,
                  top: 24 + i * gap + 4,
                  width: (PAGE.width - 40) * BODY[i],
                  height: 3,
                  background: COLORS.warn,
                  opacity: Math.min(1, shorten * 2) * (1 - shorten * 0.6),
                }}
              />
            ))
          : null}
      </div>

      {/* Alternative versions, stacked off the page's edge. */}
      {versions > 0
        ? [0, 1, 2].map((v) => {
            const show = at(frame, (actions[4]?.at ?? 0) + v * 8, 16);
            return (
              <div
                key={v}
                style={{
                  position: "absolute",
                  left: pageLeft + PAGE.width + 40 + v * (width * 0.15),
                  top: (height - PAGE.height) / 2 + 30,
                  width: width * 0.13,
                  height: PAGE.height * 0.66,
                  borderRadius: 12,
                  background: COLORS.surfaceRaised,
                  border: `1px solid ${v === 0 ? COLORS.accent : "rgba(255,255,255,0.1)"}`,
                  opacity: show,
                  transform: `translateY(${(1 - show) * 22}px)`,
                  direction: "rtl",
                  padding: 14,
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    fontFamily,
                    fontSize: 22,
                    fontWeight: 800,
                    color: v === 0 ? COLORS.accent : COLORS.textMuted,
                    marginBottom: 10,
                  }}
                >
                  {`גרסה ${v + 1}`}
                </div>
                {[0.9, 0.7, 0.82, 0.6].map((w, l) => (
                  <div
                    key={l}
                    style={{
                      height: 6,
                      width: `${w * 100}%`,
                      marginBottom: 9,
                      borderRadius: 3,
                      background: COLORS.text,
                      opacity: 0.34,
                    }}
                  />
                ))}
              </div>
            );
          })
        : null}
    </div>
  );
};

/** Summarising: a lot of material in, a few answers out. */
const SummariseShape: React.FC<ShapeProps> = ({
  width,
  height,
  local,
  frame,
  actions,
}) => {
  const PILE = { width: width * 0.2, height: height * 0.13 };
  const pileLeft = width * 0.72;
  const questions = actions[2] ? at(frame, actions[2].at, 22) : 0;
  const manual = actions[3] ? at(frame, actions[3].at, 20) : 0;

  const SOURCES = 6;

  return (
    <div style={{ position: "relative", width, height }}>
      {/* The material. Pages keep arriving: that is the problem being solved. */}
      {Array.from({ length: SOURCES }, (_, i) => {
        const show = at(local, 4 + i * 12, 14);
        if (show <= 0) {
          return null;
        }
        // Pages converge toward the funnel's mouth as the questions are asked.
        const pull = questions * 0.55;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: pileLeft - pull * (pileLeft - width * 0.42),
              top:
                height * 0.06 +
                i * (PILE.height * 0.92) -
                pull * (i - SOURCES / 2) * PILE.height * 0.6,
              width: PILE.width,
              height: PILE.height,
              borderRadius: 10,
              background: COLORS.surface,
              border: "1px solid rgba(255,255,255,0.09)",
              opacity: show * (1 - questions * 0.45),
              transform: `translateX(${(1 - show) * 30}px) scale(${1 - pull * 0.22})`,
              padding: "10px 12px",
              boxSizing: "border-box",
              direction: "rtl",
            }}
          >
            {[0.9, 0.72, 0.84].map((w, l) => (
              <div
                key={l}
                style={{
                  height: 5,
                  width: `${w * 100}%`,
                  marginBottom: 7,
                  borderRadius: 3,
                  background: COLORS.textMuted,
                  opacity: 0.45,
                }}
              />
            ))}
          </div>
        );
      })}

      {/* The questions, and their answers. */}
      {questions > 0
        ? ["מה הוחלט?", "מה נשאר פתוח?", "מי אחראי?"].map((q, i) => {
            const show = at(frame, (actions[2]?.at ?? 0) + i * 14, 16);
            if (show <= 0) {
              return null;
            }
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: width * 0.06,
                  top: height * 0.16 + i * (height * 0.24),
                  width: width * 0.3,
                  borderRadius: 12,
                  background: "rgba(217,119,87,0.12)",
                  border: `1px solid rgba(217,119,87,0.4)`,
                  padding: "14px 18px",
                  boxSizing: "border-box",
                  direction: "rtl",
                  opacity: show,
                  transform: `translateX(${(1 - show) * -24}px)`,
                }}
              >
                <div
                  style={{
                    fontFamily,
                    fontSize: 28,
                    fontWeight: 800,
                    color: COLORS.accent,
                    marginBottom: 10,
                  }}
                >
                  {q}
                </div>
                {[0.92, 0.7].map((w, l) => (
                  <div
                    key={l}
                    style={{
                      height: 8,
                      width: `${w * 100}%`,
                      marginBottom: 8,
                      borderRadius: 4,
                      background: COLORS.text,
                      opacity: 0.45,
                    }}
                  />
                ))}
              </div>
            );
          })
        : null}

      {/* Reading it yourself, crossed off. */}
      {manual > 0 ? (
        <div
          style={{
            position: "absolute",
            left: width * 0.4,
            top: height * 0.86,
            width: width * 0.3,
            textAlign: "center",
            direction: "rtl",
            fontFamily,
            fontSize: 30,
            fontWeight: 700,
            color: COLORS.textMuted,
            textDecoration: manual > 0.5 ? "line-through" : undefined,
            opacity: manual * 0.85,
          }}
        >
          לעבור על הכול ידנית
        </div>
      ) : null}
    </div>
  );
};

/** Thinking partner: one problem, several ways in. */
const IdeasShape: React.FC<ShapeProps> = ({
  width,
  height,
  local,
  frame,
  actions,
}) => {
  const originX = width * 0.76;
  const originY = height * 0.5;
  const branchesAt = actions[1]?.at ?? 0;
  const LABELS = [
    "לפתוח בשאלה",
    "מקרה מהשטח",
    "סימולציה בזוגות",
    "נתון מפתיע",
    "מה לא עובד היום",
  ] as const;

  const stuck = at(local, 2, 18);
  const endX = width * 0.3;

  return (
    <div style={{ position: "relative", width, height }}>
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        {LABELS.map((_, i) => {
          const y = height * 0.12 + i * (height * 0.19);
          const draw = at(frame, branchesAt + i * 11, 22);
          if (draw <= 0) {
            return null;
          }
          return (
            <path
              key={i}
              d={`M ${originX} ${originY} C ${originX - 140} ${originY}, ${endX + 140} ${y}, ${endX + 10} ${y}`}
              fill="none"
              stroke={COLORS.accent}
              strokeWidth={3}
              pathLength="1"
              strokeDasharray={1}
              strokeDashoffset={1 - draw}
              opacity={0.7}
            />
          );
        })}
        <circle
          cx={originX}
          cy={originY}
          r={14}
          fill={COLORS.warn}
          opacity={stuck}
        />
      </svg>

      <div
        style={{
          position: "absolute",
          left: originX - 130,
          top: originY + 32,
          width: 260,
          textAlign: "center",
          direction: "rtl",
          fontFamily,
          fontSize: 30,
          fontWeight: 700,
          color: COLORS.warn,
          opacity: stuck,
        }}
      >
        נתקעתם
      </div>

      {LABELS.map((label, i) => {
        const y = height * 0.12 + i * (height * 0.19);
        const show = at(frame, branchesAt + 12 + i * 11, 16);
        if (show <= 0) {
          return null;
        }
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: endX - width * 0.24,
              top: y - 26,
              width: width * 0.24,
              height: 52,
              borderRadius: 12,
              background: COLORS.surfaceRaised,
              border: "1px solid rgba(217,119,87,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              direction: "rtl",
              fontFamily,
              fontSize: 26,
              fontWeight: 700,
              color: COLORS.text,
              opacity: show,
              transform: `translateX(${(1 - show) * -18}px)`,
            }}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
};

/** Analysis: two versions, and what sits between them. */
const CompareShape: React.FC<ShapeProps> = ({
  width,
  height,
  local,
  frame,
  actions,
}) => {
  const COLW = width * 0.26;
  const rightLeft = width * 0.66;
  const leftLeft = width * 0.3;
  const rows = 6;
  const gap = (height * 0.78) / rows;
  const top = height * 0.1;

  const appear = at(local, 2, 22);
  const changed = actions[1] ? at(frame, actions[1].at, 20) : 0;
  const missing = actions[2] ? at(frame, actions[2].at, 18) : 0;
  const conflict = actions[3] ? at(frame, actions[3].at, 20) : 0;

  const CHANGED_ROWS = [1, 4];
  const MISSING_ROW = 3;
  const CONFLICT_ROW = 2;

  return (
    <div style={{ position: "relative", width, height }}>
      {[
        { left: rightLeft, label: "גרסה א", side: "a" as const },
        { left: leftLeft, label: "גרסה ב", side: "b" as const },
      ].map((col) => (
        <React.Fragment key={col.side}>
          <div
            style={{
              position: "absolute",
              left: col.left,
              top: top - 46,
              width: COLW,
              textAlign: "center",
              direction: "rtl",
              fontFamily,
              fontSize: 30,
              fontWeight: 800,
              color: COLORS.textMuted,
              opacity: appear,
            }}
          >
            {col.label}
          </div>
          <div
            style={{
              position: "absolute",
              left: col.left,
              top,
              width: COLW,
              height: height * 0.8,
              borderRadius: 14,
              background: COLORS.surface,
              border: "1px solid rgba(255,255,255,0.08)",
              opacity: appear,
            }}
          />
          {Array.from({ length: rows }, (_, i) => {
            const isChanged = CHANGED_ROWS.includes(i) && changed > 0.3;
            const isMissing =
              col.side === "b" && i === MISSING_ROW && missing > 0.3;
            const isConflict = i === CONFLICT_ROW && conflict > 0.3;
            const w = [0.9, 0.74, 0.86, 0.8, 0.68, 0.92][i];
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  // Anchored to the column's right inner edge, so a row grows
                  // leftwards the way a line of Hebrew does.
                  left: col.left + COLW - 16 - (COLW - 32) * w,
                  top: top + 20 + i * gap,
                  width: (COLW - 32) * w,
                  height: 12,
                  borderRadius: 6,
                  background: isMissing
                    ? "transparent"
                    : isConflict
                      ? COLORS.warn
                      : isChanged
                        ? COLORS.accent
                        : COLORS.text,
                  border: isMissing ? `2px dashed ${COLORS.warn}` : undefined,
                  opacity:
                    appear *
                    (isMissing || isConflict || isChanged ? 0.95 : 0.36),
                }}
              />
            );
          })}
        </React.Fragment>
      ))}

      {/* The rows that disagree, joined so the disagreement is the picture. */}
      {conflict > 0.3 ? (
        <svg
          width={width}
          height={height}
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
        >
          <line
            x1={rightLeft + 16}
            y1={top + 26 + CONFLICT_ROW * gap}
            x2={leftLeft + COLW - 16}
            y2={top + 26 + CONFLICT_ROW * gap}
            stroke={COLORS.warn}
            strokeWidth={3}
            strokeDasharray="8 8"
            opacity={conflict * 0.8}
          />
        </svg>
      ) : null}

      {/* Each note is set level with the row it is about. */}
      {[
        {
          show: changed,
          text: "מה השתנה",
          color: COLORS.accent,
          row: CHANGED_ROWS[0],
        },
        { show: missing, text: "מה חסר", color: COLORS.warn, row: MISSING_ROW },
        {
          show: conflict,
          text: "איפה סותרות",
          color: COLORS.warn,
          row: CONFLICT_ROW,
        },
      ].map((note, i) =>
        note.show > 0 ? (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              top: top + 12 + note.row * gap,
              width: width * 0.25,
              direction: "rtl",
              textAlign: "left",
              fontFamily,
              fontSize: 30,
              fontWeight: 800,
              color: note.color,
              opacity: note.show,
              transform: `translateX(${(1 - note.show) * 20}px)`,
            }}
          >
            {note.text}
          </div>
        ) : null,
      )}
    </div>
  );
};

/** Structured output: the shape you asked for, built. */
const StructureShape: React.FC<ShapeProps> = ({
  width,
  height,
  frame,
  actions,
}) => {
  const COLS = 4;
  const ROWS = 5;
  const TABLE = { width: width * 0.44, height: height * 0.8 };
  const tableLeft = width * 0.5;
  const tableTop = height * 0.1;
  const cw = TABLE.width / COLS;
  const ch = TABLE.height / ROWS;

  const planAt = actions[0]?.at ?? 0;
  const tableAt = actions[1]?.at ?? planAt + 40;
  const sayAt = actions[2]?.at ?? tableAt + 60;

  const plan = at(frame, planAt, 22);
  const say = at(frame, sayAt, 20);

  return (
    <div style={{ position: "relative", width, height }}>
      {/* A session plan: ordered rows with times. */}
      <div
        style={{
          position: "absolute",
          left: width * 0.04,
          top: tableTop,
          width: width * 0.4,
          height: TABLE.height * 0.66,
          borderRadius: 14,
          background: COLORS.surface,
          border: "1px solid rgba(255,255,255,0.08)",
          direction: "rtl",
          padding: "18px 22px",
          boxSizing: "border-box",
          opacity: plan,
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize: 26,
            fontWeight: 800,
            color: COLORS.accent,
            marginBottom: 16,
          }}
        >
          תוכנית מפגש
        </div>
        {["10 דק'", "25 דק'", "30 דק'", "15 דק'", "10 דק'"].map((slot, i) => {
          const show = at(frame, planAt + 8 + i * 9, 14);
          if (show <= 0) {
            return null;
          }
          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                marginBottom: 14,
                opacity: show,
                transform: `translateX(${(1 - show) * -14}px)`,
              }}
            >
              <span
                style={{
                  fontFamily,
                  fontSize: 22,
                  fontWeight: 700,
                  color: COLORS.accentSoft,
                  width: 76,
                  flexShrink: 0,
                }}
              >
                {slot}
              </span>
              <span
                style={{
                  height: 10,
                  flex: 1,
                  borderRadius: 5,
                  background: COLORS.text,
                  opacity: 0.38,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* A table, filling cell by cell. */}
      <div
        style={{
          position: "absolute",
          left: tableLeft,
          top: tableTop,
          width: TABLE.width,
          height: TABLE.height,
        }}
      >
        {Array.from({ length: ROWS * COLS }, (_, i) => {
          const r = Math.floor(i / COLS);
          const c = i % COLS;
          // Cells fill along the rows, right to left within each row.
          const order = r * COLS + (COLS - 1 - c);
          const show = at(frame, tableAt + order * 4, 12);
          if (show <= 0) {
            return null;
          }
          const head = r === 0;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: c * cw,
                top: r * ch,
                width: cw - 4,
                height: ch - 4,
                borderRadius: 6,
                background: head ? COLORS.accent : COLORS.surface,
                border: `1px solid ${head ? COLORS.accent : "rgba(255,255,255,0.09)"}`,
                opacity: show * (head ? 0.9 : 1),
                transform: `scale(${0.86 + show * 0.14})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {head ? null : (
                <span
                  style={{
                    width: `${[54, 68, 46, 60][c]}%`,
                    height: 8,
                    borderRadius: 4,
                    background: COLORS.text,
                    opacity: 0.34,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* The shape came from the ask, so the ask is what is marked here. The
          wording itself is already on the chip below the panel. */}
      {say > 0 ? (
        <div
          style={{
            position: "absolute",
            left: tableLeft,
            top: tableTop + TABLE.height + 16,
            width: TABLE.width,
            textAlign: "center",
            direction: "rtl",
            fontFamily,
            fontSize: 30,
            fontWeight: 700,
            color: COLORS.accent,
            opacity: say,
          }}
        >
          בצורה שביקשתם
        </div>
      ) : null}
    </div>
  );
};

const SHAPES: Record<GoalKind, React.FC<ShapeProps>> = {
  edit: EditShape,
  summarise: SummariseShape,
  ideas: IdeasShape,
  compare: CompareShape,
  structure: StructureShape,
};

/**
 * One conversation, five different things asked of it.
 *
 * The stretch this covers is a list of use cases, and a list is exactly what
 * it must not look like — the punchline is that these are not five features.
 * So the thread on the right never changes for the whole run, while the output
 * on the left is rebuilt from scratch for each goal. What stays still is the
 * argument.
 */
export const OneThreadFiveGoals: React.FC<OneThreadFiveGoalsProps> = ({
  width,
  height,
  goals,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const THREAD = { width: width * 0.235, height };
  const threadLeft = width - THREAD.width;
  const outputWidth = width * 0.71;

  let index = -1;
  for (let i = 0; i < goals.length; i++) {
    if (frame >= goals[i].at) {
      index = i;
    }
  }
  const goal = index >= 0 ? goals[index] : undefined;
  const next = index >= 0 ? goals[index + 1] : goals[0];

  const SWAP = 16;
  const inT = goal ? at(frame, goal.at, SWAP) : 0;
  const outT = next
    ? 1 -
      interpolate(frame - (next.at - SWAP), [0, SWAP], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;
  const shapeOpacity = inT * outT;

  const Shape = goal ? SHAPES[goal.kind] : undefined;
  const chipTop = height - 76;
  const shapeHeight = height - 88 - 76;

  return (
    <div style={{ position: "relative", width, height }}>
      {/* The thread. Identical from the first goal to the last. */}
      <div
        style={{
          position: "absolute",
          left: threadLeft,
          top: 0,
          width: THREAD.width,
          height: THREAD.height,
          borderRadius: 20,
          background: COLORS.backgroundDeep,
          border: `1px solid rgba(217,119,87,0.3)`,
          direction: "rtl",
          padding: "20px 20px",
          boxSizing: "border-box",
          opacity: interpolate(frame, [0, 18], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize: 28,
            fontWeight: 800,
            color: COLORS.accent,
            marginBottom: 18,
          }}
        >
          אותה שיחה
        </div>
        {/* One turn per goal, so the thread visibly grows without ever being
            replaced. */}
        {goals.map((g, i) => {
          const pop = spring({
            frame: frame - g.at,
            fps,
            config: { damping: 80 },
          });
          if (frame < g.at - 2) {
            return null;
          }
          const mine = i % 2 === 0;
          return (
            <div
              key={i}
              style={{
                marginBottom: 12,
                marginRight: mine ? 0 : 30,
                marginLeft: mine ? 30 : 0,
                padding: "10px 14px",
                borderRadius: mine
                  ? "14px 14px 4px 14px"
                  : "14px 14px 14px 4px",
                background: mine ? COLORS.surfaceRaised : COLORS.surface,
                opacity: pop * (i === index ? 1 : 0.5),
                transform: `translateY(${(1 - pop) * 10}px)`,
              }}
            >
              <div
                style={{
                  fontFamily,
                  fontSize: 21,
                  fontWeight: 700,
                  color: i === index ? COLORS.text : COLORS.textMuted,
                  lineHeight: 1.25,
                }}
              >
                {g.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* The goal on the table. */}
      {goal ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: outputWidth,
            direction: "rtl",
            opacity: shapeOpacity,
          }}
        >
          <span
            style={{
              fontFamily,
              fontSize: 40,
              fontWeight: 800,
              color: COLORS.background,
              background: COLORS.accent,
              padding: "8px 24px",
              borderRadius: 999,
            }}
          >
            {goal.label}
          </span>
        </div>
      ) : null}

      {/* The output, rebuilt per goal. */}
      {goal && Shape ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 88,
            width: outputWidth,
            height: shapeHeight,
            opacity: shapeOpacity,
            transform: `scale(${0.98 + shapeOpacity * 0.02})`,
          }}
        >
          <Shape
            width={outputWidth}
            height={shapeHeight}
            local={frame - goal.at}
            frame={frame}
            actions={goal.actions}
          />
        </div>
      ) : null}

      {/* What was actually asked, in the narrator's words. */}
      {goal ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: chipTop,
            width: outputWidth,
            direction: "rtl",
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
            opacity: shapeOpacity,
          }}
        >
          {goal.actions.map((action, i) => {
            const show = at(frame, action.at, 14);
            if (show <= 0) {
              return null;
            }
            return (
              <span
                key={i}
                style={{
                  fontFamily,
                  fontSize: 28,
                  fontWeight: 700,
                  color: COLORS.text,
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  padding: "7px 18px",
                  borderRadius: 999,
                  opacity: show,
                  transform: `translateY(${(1 - show) * 10}px)`,
                  whiteSpace: "nowrap",
                }}
              >
                {action.text}
              </span>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};
