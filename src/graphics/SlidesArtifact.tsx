import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily, uiFontFamily } from "../fonts";
import { APP, Bar, FitBox, Tile } from "./parts/ClaudeUI";
import { TypeOn } from "../ui/TypeOn";

type SlidesArtifactProps = {
  readonly width: number;
  readonly height: number;
  readonly delay?: number;
  /** The deck's title, as the artifact header shows it. */
  readonly deckTitle: string;
  /** Title on the hero slide. */
  readonly slideTitle: string;
  readonly slideSubtitle?: string;
  /** Frame at which the deck lands in the panel. */
  readonly deckAt: number;
  /** How many slides in the filmstrip. */
  readonly slides?: number;
  /** Frame at which a comment is pinned to the slide's title. */
  readonly commentAt?: number;
  /** What is typed into it. */
  readonly commentText?: string;
  /** Frame at which the comment is sent to Claude. */
  readonly sendAt?: number;
  /** Frame at which the slide title visibly changes in response. */
  readonly fixAt?: number;
  /** Which slide is selected in the filmstrip. */
  readonly selected?: number;
  /** A request typed into the chat, and the frame the deck answers it. */
  readonly chatPrompt?: {
    readonly text: string;
    readonly at: number;
    readonly applyAt: number;
  };
  /** The title after a deck-wide edit has shortened it. */
  readonly titleAfter?: string;
  /** A pointer grabbing the logo tiles on the canvas and moving them. */
  readonly dragAt?: number;
  /** Reviewers' comment pins, in fractions of the slide. */
  readonly pins?: readonly {
    readonly at: number;
    readonly x: number;
    readonly y: number;
    readonly letter: string;
  }[];
  /** Frame at which the export menu opens under the download control. */
  readonly exportAt?: number;
};

/** Composed at this size, then scaled to whatever the scene has room for. */
const DESIGN = { width: 1640, height: 940 };

/**
 * A deck being built in the artifact panel, and commented on in place.
 *
 * The screenshot this was drawn from shows a real client's deck — a hero photo,
 * the client's name, the client's colours. What the episode teaches is the
 * shape of the work: Claude's explanation on one side, the artefact on the
 * other, a comment pinned to the exact element that needs changing, and the
 * change landing there. So the chat is bars, the deck is a generic template in
 * the video's own palette, and the comment is the one line of real text —
 * because the comment is the lesson.
 */
export const SlidesArtifact: React.FC<SlidesArtifactProps> = ({
  width,
  height,
  delay = 0,
  deckTitle,
  slideTitle,
  slideSubtitle,
  deckAt,
  slides = 5,
  commentAt,
  commentText,
  sendAt,
  fixAt,
  selected = 0,
  chatPrompt,
  titleAfter,
  dragAt,
  pins = [],
  exportAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;

  const open = spring({ frame: local, fps, config: { damping: 200 } });
  const deck = spring({ frame: local - deckAt, fps, config: { damping: 200 } });
  const comment =
    commentAt === undefined
      ? 0
      : spring({
          frame: local - commentAt,
          fps,
          config: { damping: 30, stiffness: 160 },
        });
  const sent =
    sendAt === undefined
      ? 0
      : interpolate(local - sendAt, [0, 10], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  const fixed =
    fixAt === undefined
      ? 0
      : spring({ frame: local - fixAt, fps, config: { damping: 200 } });

  const applied =
    chatPrompt === undefined
      ? 0
      : spring({
          frame: local - chatPrompt.applyAt,
          fps,
          config: { damping: 200 },
        });
  const drag =
    dragAt === undefined
      ? 0
      : interpolate(local - dragAt, [0, 14, 20, 44], [0, 0, 0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  const pointer =
    dragAt === undefined
      ? 0
      : interpolate(local - dragAt, [-10, 0], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  const exportOpen =
    exportAt === undefined
      ? 0
      : spring({
          frame: local - exportAt,
          fps,
          config: { damping: 30, stiffness: 150 },
        });

  const chatW = DESIGN.width * 0.33;
  const panelLeft = chatW + 16;
  const panelW = DESIGN.width - panelLeft;
  const headH = 64;
  const stripH = 120;
  const stageTop = headH + 20;
  const stageH = DESIGN.height - stageTop - stripH - 20;
  const slideW = panelW * 0.86;
  const slideH = slideW * 0.5625;
  // Panel-relative: the slide and the comment live inside the panel div.
  const slideLeft = (panelW - slideW) / 2;
  const slideTop = stageTop + (stageH - slideH) / 2;
  const photoW = slideW * 0.5;

  /** Bars standing in for the explanation Claude writes alongside the deck. */
  const chatLines = [
    0.9, 0.7, 0.86, 0.5, 0, 0.8, 0.88, 0.66, 0.74, 0, 0.6, 0.82,
  ];

  return (
    <FitBox width={width} height={height} design={DESIGN}>
      <div
        style={{
          position: "relative",
          width: DESIGN.width,
          height: DESIGN.height,
          borderRadius: 22,
          background: APP.canvas,
          border: `1px solid ${APP.line}`,
          overflow: "hidden",
          opacity: open,
          boxShadow: "0 40px 110px rgba(0,0,0,0.5)",
        }}
      >
        {/* The conversation. */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: chatW,
            height: DESIGN.height,
            padding: "28px 34px",
            boxSizing: "border-box",
            direction: "rtl",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 24,
              direction: "ltr",
            }}
          >
            <Bar w="52%" h={12} tone={APP.inkSoft} opacity={0.7} />
          </div>
          {chatLines.map((w, i) =>
            w === 0 ? (
              <div key={i} style={{ height: 22 }} />
            ) : (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  marginBottom: 14,
                }}
              >
                <Bar
                  w={`${w * 100}%`}
                  h={11}
                  tone={APP.mute}
                  opacity={interpolate(local - 6 - i * 2, [0, 10], [0, 0.45], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  })}
                />
              </div>
            ),
          )}

          {/* The reply landing after the comment is sent. */}
          {sent > 0 ? (
            <div
              style={{
                marginTop: 18,
                padding: "14px 16px",
                borderRadius: 14,
                background: APP.panel,
                border: `1px solid ${APP.line}`,
                opacity: sent,
                fontFamily,
                fontSize: 19,
                color: APP.ink,
                lineHeight: 1.4,
              }}
            >
              מחליף את הפונט של הכותרת בשקף 1…
            </div>
          ) : null}

          <div
            style={{
              position: "absolute",
              left: 24,
              right: 24,
              bottom: 24,
              height: 80,
              borderRadius: 18,
              background: APP.panel,
              border: `1px solid ${APP.line}`,
              padding: "14px 18px",
              boxSizing: "border-box",
              direction: "ltr",
            }}
          >
            {chatPrompt && local >= chatPrompt.at ? (
              <div
                style={{
                  direction: "rtl",
                  fontFamily,
                  fontSize: 19,
                  color: APP.ink,
                }}
              >
                <TypeOn
                  text={chatPrompt.text}
                  delay={delay + chatPrompt.at}
                  speed={22}
                  caret={applied < 0.5}
                />
              </div>
            ) : (
              <div
                style={{
                  fontFamily: uiFontFamily,
                  fontSize: 19,
                  color: APP.mute,
                }}
              >
                Write a message…
              </div>
            )}
          </div>
        </div>

        {/* The artifact panel. */}
        <div
          style={{
            position: "absolute",
            left: panelLeft,
            top: 0,
            width: panelW,
            height: DESIGN.height,
            background: APP.panel,
            borderLeft: `1px solid ${APP.lineSoft}`,
          }}
        >
          <div
            style={{
              height: headH,
              display: "flex",
              alignItems: "center",
              padding: "0 22px",
              gap: 14,
              borderBottom: `1px solid ${APP.lineSoft}`,
            }}
          >
            <div
              style={{
                fontFamily,
                direction: "rtl",
                fontSize: 20,
                fontWeight: 600,
                color: APP.ink,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "50%",
              }}
            >
              {deckTitle}
            </div>
            <div style={{ flex: 1 }} />
            <div
              style={{
                height: 38,
                padding: "0 16px",
                borderRadius: 10,
                background: APP.ink,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                fontFamily: uiFontFamily,
                fontSize: 17,
                fontWeight: 600,
              }}
            >
              Share
            </div>
            <Tile size={20} />
          </div>

          {/* Toolbar, top left of the stage. */}
          <div
            style={{
              position: "absolute",
              top: headH + 14,
              left: 18,
              display: "flex",
              gap: 8,
              padding: 6,
              borderRadius: 12,
              background: APP.canvas,
              border: `1px solid ${APP.line}`,
            }}
          >
            {["T", "▣", "▤", "◇"].map((g) => (
              <div
                key={g}
                style={{
                  width: 34,
                  height: 34,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: uiFontFamily,
                  fontSize: 17,
                  color: APP.inkSoft,
                }}
              >
                {g}
              </div>
            ))}
          </div>
          <div
            style={{
              position: "absolute",
              top: headH + 14,
              right: 18,
              height: 46,
              padding: "0 14px",
              display: "flex",
              alignItems: "center",
              gap: 16,
              borderRadius: 12,
              background: APP.canvas,
              border: `1px solid ${APP.line}`,
              fontFamily: uiFontFamily,
              fontSize: 16,
              color: APP.inkSoft,
            }}
          >
            <Tile size={16} />
            <Tile size={16} />
            <Tile size={16} /> 49%
          </div>

          {/* The slide. A generic template in the video's own palette. */}
          {deck > 0.02 ? (
            <div
              style={{
                position: "absolute",
                left: slideLeft,
                top: slideTop,
                width: slideW,
                height: slideH,
                overflow: "hidden",
                borderRadius: 4,
                boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
                opacity: deck,
                transform: `scale(${0.96 + deck * 0.04})`,
                direction: "rtl",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  width: slideW - photoW,
                  height: slideH,
                  background: "#1f2a44",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: photoW,
                  height: slideH,
                  background:
                    "linear-gradient(135deg, #4a5f8a 0%, #8ea3cf 55%, #d7c5e6 100%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: slideH * 0.018,
                  background:
                    "linear-gradient(90deg, #e8a188, #6ba3c4, #8fd0a8, #f2d27c)",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  right: slideW * 0.05,
                  top: slideH * 0.24,
                  width: slideW * 0.42,
                }}
              >
                <div
                  style={{
                    fontFamily: fixed > 0.5 ? fontFamily : "Georgia, serif",
                    fontSize: slideH * 0.115,
                    fontWeight: 800,
                    lineHeight: 1.05,
                    color: "#fff",
                    letterSpacing: fixed > 0.5 ? 0 : "-0.02em",
                    transform: `translateY(${interpolate(fixed, [0, 0.5, 1], [0, -6, 0])}px)`,
                    opacity: interpolate(fixed, [0, 0.5, 1], [1, 0.2, 1]),
                  }}
                >
                  {titleAfter && applied > 0.5 ? titleAfter : slideTitle}
                </div>
                {slideSubtitle ? (
                  <div
                    style={{
                      marginTop: slideH * 0.05,
                      fontFamily,
                      fontSize: slideH * 0.058,
                      fontWeight: 500,
                      color: "rgba(255,255,255,0.85)",
                    }}
                  >
                    {slideSubtitle}
                  </div>
                ) : null}
                <div
                  style={{
                    marginTop: slideH * 0.06,
                    width: slideW * 0.2,
                    height: 3,
                    background: "#7cc4e8",
                  }}
                />
                <div
                  style={{
                    marginTop: slideH * 0.06,
                    display: "flex",
                    flexDirection: "column",
                    gap: slideH * 0.03,
                  }}
                >
                  <Bar
                    w="86%"
                    h={slideH * 0.025}
                    tone="rgba(255,255,255,0.7)"
                  />
                  <Bar
                    w="52%"
                    h={slideH * 0.022}
                    tone="rgba(255,255,255,0.45)"
                  />
                </div>
              </div>
              <div
                style={{
                  position: "absolute",
                  left: slideW * 0.03 + drag * slideW * 0.3,
                  bottom: slideH * 0.08,
                  display: "flex",
                  gap: 10,
                  direction: "ltr",
                  outline:
                    pointer > 0 && drag < 1
                      ? `2px solid ${APP.select}`
                      : undefined,
                  outlineOffset: 4,
                }}
              >
                <Tile size={slideH * 0.09} tone="rgba(255,255,255,0.9)" />
                <Tile size={slideH * 0.09} tone="rgba(255,255,255,0.6)" />
              </div>

              {/* Reviewers' pins, each on the thing it is about. */}
              {pins.map((pin) => {
                const on = spring({
                  frame: local - pin.at,
                  fps,
                  config: { damping: 200 },
                });
                if (on <= 0.001) return null;
                return (
                  <div
                    key={pin.letter + pin.at}
                    style={{
                      position: "absolute",
                      left: slideW * pin.x,
                      top: slideH * pin.y,
                      width: slideH * 0.11,
                      height: slideH * 0.11,
                      borderRadius: "50% 50% 50% 0",
                      background: APP.select,
                      border: "2px solid #fff",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: uiFontFamily,
                      fontSize: slideH * 0.05,
                      fontWeight: 700,
                      opacity: on,
                      transform: `translate(-50%, -100%) scale(${0.6 + on * 0.4})`,
                      boxShadow: "0 6px 18px rgba(0,0,0,0.3)",
                    }}
                  >
                    {pin.letter}
                  </div>
                );
              })}

              {/* The commented element, outlined while the comment is open. */}
              {comment > 0.02 ? (
                <div
                  style={{
                    position: "absolute",
                    right: slideW * 0.04,
                    top: slideH * 0.23,
                    width: slideW * 0.42,
                    height: slideH * 0.2,
                    border: `2px solid ${APP.coral}`,
                    borderRadius: 4,
                    opacity: comment * (1 - sent * 0.6),
                  }}
                />
              ) : null}
            </div>
          ) : null}

          {/* The pointer doing the drag. */}
          {pointer > 0 ? (
            <svg
              style={{
                position: "absolute",
                left: slideLeft + slideW * 0.06 + drag * slideW * 0.3,
                top: slideTop + slideH * 0.84,
                opacity: pointer,
              }}
              width={28}
              height={32}
              viewBox="0 0 28 32"
              aria-hidden
            >
              <path
                d="M4 2 L4 24 L10 18 L15 29 L19 27 L14 17 L22 17 Z"
                fill="#111"
                stroke="#fff"
                strokeWidth={2}
                strokeLinejoin="round"
              />
            </svg>
          ) : null}

          {/* The export menu, under the download control. */}
          {exportOpen > 0.02 ? (
            <div
              style={{
                position: "absolute",
                right: 22,
                top: headH + 66,
                width: 280,
                borderRadius: 14,
                background: APP.panel,
                border: `1px solid ${APP.line}`,
                boxShadow: "0 18px 50px rgba(0,0,0,0.22)",
                padding: 8,
                opacity: exportOpen,
                transform: `scale(${0.94 + exportOpen * 0.06})`,
                transformOrigin: "top right",
              }}
            >
              {["Export as PowerPoint", "Export as PDF", "Copy link"].map(
                (row, i) => (
                  <div
                    key={row}
                    style={{
                      height: 44,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "0 12px",
                      borderRadius: 10,
                      fontFamily: uiFontFamily,
                      fontSize: 18,
                      fontWeight: 500,
                      color: APP.ink,
                      opacity: interpolate(
                        local - (exportAt ?? 0) - 3 - i * 3,
                        [0, 8],
                        [0, 1],
                        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                      ),
                    }}
                  >
                    <Tile size={18} tone={i === 2 ? APP.select : APP.mute} />
                    {row}
                  </div>
                ),
              )}
            </div>
          ) : null}

          {/* The comment, pinned to the element. */}
          {comment > 0.02 && commentText ? (
            <div
              style={{
                position: "absolute",
                left: slideLeft + slideW * 0.22,
                top: slideTop + slideH * 0.44,
                width: 380,
                borderRadius: 14,
                background: APP.panel,
                border: `1px solid ${APP.line}`,
                boxShadow: "0 18px 50px rgba(0,0,0,0.25)",
                padding: "14px 16px",
                boxSizing: "border-box",
                opacity: comment * (1 - sent * 0.85),
                transform: `scale(${0.94 + comment * 0.06})`,
                transformOrigin: "top right",
              }}
            >
              <div
                style={{
                  fontFamily: uiFontFamily,
                  fontSize: 14,
                  color: APP.mute,
                  marginBottom: 8,
                }}
              >
                Slide 1 › Title
              </div>
              <div
                style={{
                  direction: "rtl",
                  fontFamily,
                  fontSize: 19,
                  color: APP.ink,
                  lineHeight: 1.4,
                  minHeight: 54,
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    direction: "ltr",
                    padding: "1px 7px",
                    borderRadius: 6,
                    background: "#e6f0fb",
                    color: "#1c5fa8",
                    fontFamily: uiFontFamily,
                    fontSize: 16,
                    fontWeight: 600,
                    marginLeft: 6,
                  }}
                >
                  @Claude
                </span>
                <TypeOn
                  text={commentText}
                  delay={delay + (commentAt ?? 0) + 10}
                  speed={22}
                  caret={sent < 0.5}
                />
              </div>
              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: uiFontFamily,
                  fontSize: 15,
                  color: APP.inkSoft,
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    background: APP.select,
                  }}
                />
                Send to Claude
                <div style={{ flex: 1 }} />
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background:
                      sendAt !== undefined && local >= sendAt - 8
                        ? APP.ink
                        : "rgba(0,0,0,0.08)",
                  }}
                />
              </div>
              <div
                style={{
                  position: "absolute",
                  top: -14,
                  right: -14,
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: APP.select,
                  border: "2px solid #fff",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: uiFontFamily,
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                D
              </div>
            </div>
          ) : null}

          {/* Filmstrip. */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: stripH,
              borderTop: `1px solid ${APP.lineSoft}`,
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "0 22px",
            }}
          >
            <div
              style={{
                fontFamily: uiFontFamily,
                fontSize: 24,
                color: APP.mute,
                marginRight: 6,
              }}
            >
              +
            </div>
            {Array.from({ length: slides }, (_, i) => {
              const on = interpolate(
                local - deckAt - 6 - i * 3,
                [0, 8],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              );
              const isSel = i === selected;
              const pulse =
                chatPrompt === undefined
                  ? 0
                  : interpolate(
                      local - chatPrompt.applyAt - i * 4,
                      [0, 8, 26],
                      [0, 1, 0],
                      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                    );
              return (
                <div
                  key={i}
                  style={{
                    width: 150,
                    height: 84,
                    borderRadius: 8,
                    overflow: "hidden",
                    border: `${isSel || pulse > 0.1 ? 2.5 : 1}px solid ${pulse > 0.1 ? APP.coral : isSel ? APP.select : APP.line}`,
                    boxShadow:
                      pulse > 0.1
                        ? `0 0 ${18 * pulse}px ${APP.coral}88`
                        : undefined,
                    background: i % 2 === 0 ? "#1f2a44" : APP.canvas,
                    opacity: on,
                    position: "relative",
                  }}
                >
                  {i === 0 ? (
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        width: "50%",
                        height: "100%",
                        background: "linear-gradient(135deg, #4a5f8a, #d7c5e6)",
                      }}
                    />
                  ) : null}
                  <div
                    style={{
                      position: "absolute",
                      right: 10,
                      top: 14,
                      width: "40%",
                    }}
                  >
                    <Bar
                      w="100%"
                      h={6}
                      tone={i % 2 === 0 ? "rgba(255,255,255,0.8)" : APP.inkSoft}
                    />
                    <Bar
                      w="70%"
                      h={4}
                      tone={i % 2 === 0 ? "rgba(255,255,255,0.4)" : APP.faint}
                      style={{ marginTop: 6 }}
                    />
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      left: 6,
                      bottom: 5,
                      fontFamily: uiFontFamily,
                      fontSize: 11,
                      color: i % 2 === 0 ? "#fff" : APP.mute,
                    }}
                  >
                    {i + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </FitBox>
  );
};
