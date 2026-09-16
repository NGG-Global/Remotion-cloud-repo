import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily, uiFontFamily } from "../fonts";
import { APP, Tile } from "./parts/ClaudeUI";

export type PanelKey = "instructions" | "memory" | "context" | "scheduled";

export type ContextFile = {
  readonly label: string;
  /** Frame at which it lands in the panel. */
  readonly at: number;
  readonly kind?: "doc" | "sheet" | "deck" | "pdf" | "text";
};

type ProjectPanelsProps = {
  readonly width: number;
  readonly height: number;
  readonly delay?: number;
  /** Which panel is open, and from which frame. Panels animate between them. */
  readonly open: readonly { readonly at: number; readonly panel: PanelKey }[];
  /** Material dropped into Context. */
  readonly files?: readonly ContextFile[];
  /** Frame at which the Context "+" menu opens. */
  readonly menuAt?: number;
  /** Frame at which it closes again, making room for what it brought in. */
  readonly menuCloseAt?: number;
};

const TITLES: Record<PanelKey, { title: string; note: string }> = {
  instructions: {
    title: "Instructions",
    note: "Add instructions to tailor Claude's responses",
  },
  memory: {
    title: "Memory",
    note: "Project memory will show here after a few chats.",
  },
  context: {
    title: "Context",
    note: "Add PDFs, documents, or other text to reference in this project.",
  },
  scheduled: {
    title: "Scheduled",
    note: "Set up recurring tasks for this project.",
  },
};

const ORDER: readonly PanelKey[] = [
  "instructions",
  "memory",
  "context",
  "scheduled",
];

/** The four ways material reaches a project's Context. */
const SOURCES = ["Upload from device", "Add text content", "GitHub", "Drive"];

/** A file chip, the way the panel lists what it holds. */
const FileChip: React.FC<{
  readonly file: ContextFile;
  readonly local: number;
  readonly h: number;
}> = ({ file, local, h }) => {
  const { fps } = useVideoConfig();
  const arrive = spring({
    frame: local - file.at,
    fps,
    config: { damping: 200 },
  });
  if (arrive <= 0.001) {
    return null;
  }

  const tint = {
    doc: "#2b7de9",
    sheet: "#1e8e5a",
    deck: "#d9822b",
    pdf: "#c4314b",
    text: APP.mute,
  }[file.kind ?? "doc"];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: h * 0.34,
        height: h,
        width: "100%",
        boxSizing: "border-box",
        padding: `0 ${h * 0.38}px`,
        borderRadius: h * 0.24,
        background: "rgba(0,0,0,0.035)",
        border: `1px solid ${APP.line}`,
        opacity: arrive,
        transform: `translateY(${interpolate(arrive, [0, 1], [14, 0])}px)`,
      }}
    >
      <div
        style={{
          width: h * 0.42,
          height: h * 0.52,
          borderRadius: h * 0.08,
          background: tint,
          opacity: 0.85,
          flexShrink: 0,
        }}
      />
      <div
        style={{
          direction: "rtl",
          fontFamily,
          fontSize: h * 0.4,
          fontWeight: 500,
          color: APP.ink,
          whiteSpace: "nowrap",
        }}
      >
        {file.label}
      </div>
    </div>
  );
};

/**
 * The project's right-hand column, opened one panel at a time.
 *
 * Reproducing the column at the interface's own scale would put its headings
 * at twenty pixels on a 1080p frame, which is the size at which a viewer stops
 * reading and starts guessing. Instead the panel the narration is on expands
 * and the other three compress — the column stays recognisably itself, the
 * open panel gets the room to show what it actually holds, and the move from
 * one to the next is the animation rather than a cut.
 */
export const ProjectPanels: React.FC<ProjectPanelsProps> = ({
  width,
  height,
  delay = 0,
  open,
  files,
  menuAt,
  menuCloseAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;

  const colW = Math.min(width * 0.44, height * 0.98);

  /**
   * Each panel's share of the column, as a weight rather than a height.
   *
   * Every step raises its own panel and lowers the one before it by the same
   * amount, on the same spring — so an opening panel and a closing one are
   * always in step and the shares keep adding up, even while two transitions
   * overlap. Heights would have to be re-solved on every frame to hold that.
   */
  const BOOST = 2.2;

  const weight = (panel: PanelKey): number => {
    let w = 1;
    for (let i = 0; i < open.length; i++) {
      const t = spring({
        frame: local - open[i].at,
        fps,
        config: { damping: 30, stiffness: 120 },
      });
      if (open[i].panel === panel) {
        w += t * BOOST;
      }
      if (i > 0 && open[i - 1].panel === panel) {
        w -= t * BOOST;
      }
    }
    return Math.max(1, w);
  };

  const weights = ORDER.map(weight);
  const total = weights.reduce((a, b) => a + b, 0);

  const active = open.reduce<PanelKey | undefined>(
    (found, step) => (local >= step.at ? step.panel : found),
    undefined,
  );

  const gap = height * 0.014;
  const usable = height - gap * (ORDER.length - 1);

  let cursor = 0;

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ position: "relative", width: colW, height }}>
        {ORDER.map((key, i) => {
          const h = (weights[i] / total) * usable;
          const top = cursor;
          cursor += h + gap;

          const isOpen = active === key;
          const head = Math.min(h * 0.3, height * 0.052);
          const bodyTop = head * 1.5;
          const arrive = interpolate(local - 6 - i * 5, [0, 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={key}
              style={{
                position: "absolute",
                top,
                left: 0,
                width: colW,
                height: h,
                borderRadius: height * 0.026,
                background: APP.panel,
                border: `${isOpen ? Math.max(2.5, height * 0.004) : 1}px solid ${
                  isOpen ? APP.coral : APP.line
                }`,
                boxShadow: isOpen
                  ? `0 0 ${height * 0.05}px ${APP.coral}44`
                  : "0 2px 10px rgba(0,0,0,0.05)",
                padding: `${head * 0.5}px ${colW * 0.045}px`,
                boxSizing: "border-box",
                overflow: "hidden",
                opacity: arrive,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    fontFamily: uiFontFamily,
                    fontSize: head * 0.62,
                    fontWeight: 700,
                    color: APP.ink,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {TITLES[key].title}
                </div>

                {key === "memory" ? (
                  <div
                    style={{
                      padding: `${head * 0.1}px ${head * 0.32}px`,
                      borderRadius: 999,
                      background: "rgba(0,0,0,0.05)",
                      fontFamily: uiFontFamily,
                      fontSize: head * 0.38,
                      fontWeight: 600,
                      color: APP.mute,
                    }}
                  >
                    Only you
                  </div>
                ) : (
                  <div
                    style={{
                      position: "relative",
                      width: head * 0.46,
                      height: head * 0.46,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: 0,
                        width: "100%",
                        height: Math.max(2, head * 0.05),
                        marginTop: -Math.max(1, head * 0.025),
                        background: isOpen ? APP.coral : APP.mute,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: 0,
                        height: "100%",
                        width: Math.max(2, head * 0.05),
                        marginLeft: -Math.max(1, head * 0.025),
                        background: isOpen ? APP.coral : APP.mute,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* A closed panel keeps the interface's one-line description.
                  The open one replaces it with what it actually holds — for
                  Context, the material; for the rest, the same sentence with
                  the room to be read. */}
              {!isOpen || key !== "context" ? (
                <div
                  style={{
                    marginTop: head * 0.34,
                    fontFamily: uiFontFamily,
                    fontSize: head * (isOpen ? 0.5 : 0.42),
                    lineHeight: 1.4,
                    color: APP.mute,
                    overflow: "hidden",
                  }}
                >
                  {TITLES[key].note}
                </div>
              ) : (
                <div
                  style={{
                    position: "absolute",
                    top: bodyTop,
                    left: colW * 0.045,
                    right: colW * 0.045,
                    bottom: head * 0.5,
                  }}
                >
                  {/* The panel lists what it holds down the column, the way the
                      interface does — a row per file, rather than a wrapping
                      strip that leaves the panel half empty. */}
                  <div
                    style={{
                      direction: "rtl",
                      display: "flex",
                      flexDirection: "column",
                      gap: head * 0.24,
                    }}
                  >
                    {(files ?? []).map((file, n) => (
                      <FileChip
                        key={n}
                        file={file}
                        local={local}
                        h={head * 1.3}
                      />
                    ))}
                  </div>

                  {/* The menu behind the plus: four ways in. */}
                  {menuAt !== undefined ? (
                    <MenuCard
                      local={local}
                      at={menuAt}
                      closeAt={menuCloseAt}
                      head={head}
                      radius={height * 0.018}
                    />
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** The Context menu, hanging off the panel's plus. */
const MenuCard: React.FC<{
  readonly local: number;
  readonly at: number;
  readonly closeAt?: number;
  readonly head: number;
  readonly radius: number;
}> = ({ local, at, closeAt, head, radius }) => {
  const { fps } = useVideoConfig();
  const close =
    closeAt === undefined
      ? 1
      : interpolate(local - closeAt, [0, 8], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  const menu =
    spring({
      frame: local - at,
      fps,
      config: { damping: 30, stiffness: 140 },
    }) * close;
  if (menu <= 0.02) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        top: -head * 0.28,
        right: 0,
        width: head * 6.6,
        background: APP.panel,
        borderRadius: radius,
        border: `1px solid ${APP.line}`,
        boxShadow: "0 24px 60px rgba(0,0,0,0.28)",
        padding: head * 0.22,
        opacity: menu,
        transform: `scale(${0.92 + menu * 0.08})`,
        transformOrigin: "top right",
      }}
    >
      {SOURCES.map((source, i) => (
        <div
          key={source}
          style={{
            display: "flex",
            alignItems: "center",
            gap: head * 0.3,
            height: head * 0.86,
            padding: `0 ${head * 0.3}px`,
            borderRadius: radius * 0.8,
            borderTop: i === 2 ? `1px solid ${APP.lineSoft}` : undefined,
            marginTop: i === 2 ? head * 0.14 : 0,
            paddingTop: i === 2 ? head * 0.14 : 0,
            opacity: interpolate(local - at - 3 - i * 3, [0, 8], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <Tile size={head * 0.4} tone={i >= 2 ? APP.select : APP.mute} />
          <div
            style={{
              fontFamily: uiFontFamily,
              fontSize: head * 0.42,
              fontWeight: 500,
              color: APP.ink,
              whiteSpace: "nowrap",
            }}
          >
            {source}
          </div>
        </div>
      ))}
    </div>
  );
};
