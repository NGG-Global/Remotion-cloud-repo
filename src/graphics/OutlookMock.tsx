import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { uiFontFamily } from "../fonts";

type OutlookMockProps = {
  readonly width: number;
  readonly height: number;
  readonly delay?: number;
  /** Frame at which the list starts scrolling, to stand in for hunting. */
  readonly scrollAt?: number;
  /** Unread count shown on the Inbox, to make "a full inbox" concrete. */
  readonly unread?: number;
  /** Rows in the message list. More rows read as more to dig through. */
  readonly rows?: number;
};

/** Outlook's blue, kept off the coral palette so the window reads as foreign. */
const BLUE = "#0f6cbd";
const PANEL = "#faf9f8";
const LINE = "rgba(0,0,0,0.09)";
const INK = "rgba(0,0,0,0.78)";
const MUTE = "rgba(0,0,0,0.34)";

/**
 * A rebuilt Outlook window, abstracted to bars.
 *
 * Drawn rather than screenshotted: a real inbox carries sender names and
 * subject lines that should not travel in a shared video, and a still cannot
 * show the scrolling that the narration is arguing against. Text is reduced to
 * bars — the same treatment `DocSheet` uses — so the window is recognisably
 * Outlook without a word of anyone's mail being readable. The unread count and
 * the long, scrolling list carry the point: this is the thing you would
 * otherwise open and dig through.
 */
export const OutlookMock: React.FC<OutlookMockProps> = ({
  width,
  height,
  delay = 0,
  scrollAt,
  unread = 24,
  rows = 9,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;

  const open = spring({ frame: local, fps, config: { damping: 200 } });

  const chromeH = height * 0.12;
  const railW = width * 0.22;
  const listW = width * 0.42;
  const bodyTop = chromeH;
  const bodyH = height - chromeH;

  const rowH = (bodyH - height * 0.06) / rows;
  const scroll = scrollAt
    ? interpolate(local - scrollAt, [0, 40], [0, rowH * 2.4], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  const folders = [true, false, false, false, false, false];

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        borderRadius: 16,
        background: PANEL,
        border: `1px solid ${LINE}`,
        overflow: "hidden",
        opacity: open,
        transform: `scale(${0.94 + open * 0.06})`,
        boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
        fontFamily: uiFontFamily,
      }}
    >
      {/* Title bar. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: chromeH,
          borderBottom: `1px solid ${LINE}`,
          display: "flex",
          alignItems: "center",
          gap: chromeH * 0.35,
          padding: `0 ${chromeH * 0.5}px`,
          boxSizing: "border-box",
          background: "#fff",
        }}
      >
        <div
          style={{
            width: chromeH * 0.42,
            height: chromeH * 0.42,
            borderRadius: 5,
            background: BLUE,
          }}
        />
        <div
          style={{
            fontSize: chromeH * 0.3,
            fontWeight: 600,
            color: INK,
            letterSpacing: "0.01em",
          }}
        >
          Outlook
        </div>
        {/* Search box. */}
        <div
          style={{
            marginLeft: chromeH * 0.4,
            flex: 1,
            maxWidth: width * 0.42,
            height: chromeH * 0.5,
            borderRadius: chromeH * 0.25,
            background: "#eeedec",
          }}
        />
        <div style={{ flex: 1 }} />
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: chromeH * 0.16,
              height: chromeH * 0.16,
              borderRadius: "50%",
              background: MUTE,
            }}
          />
        ))}
      </div>

      {/* Folder rail. */}
      <div
        style={{
          position: "absolute",
          top: bodyTop,
          right: 0,
          width: railW,
          height: bodyH,
          borderLeft: `1px solid ${LINE}`,
          padding: `${bodyH * 0.05}px ${railW * 0.08}px`,
          boxSizing: "border-box",
        }}
      >
        {folders.map((selected, i) => {
          const appear = interpolate(local - 6 - i * 3, [0, 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: railW * 0.06,
                height: bodyH * 0.082,
                marginBottom: bodyH * 0.02,
                padding: `0 ${railW * 0.06}px`,
                borderRadius: 8,
                background: selected ? "#eaf2fb" : "transparent",
                opacity: appear,
              }}
            >
              <div
                style={{
                  width: railW * 0.1,
                  height: railW * 0.1,
                  borderRadius: 4,
                  background: selected ? BLUE : MUTE,
                  opacity: selected ? 1 : 0.55,
                }}
              />
              <div
                style={{
                  height: bodyH * 0.02,
                  width: `${52 - i * 4}%`,
                  borderRadius: 3,
                  background: selected ? INK : MUTE,
                }}
              />
              {selected ? (
                <div
                  style={{
                    marginLeft: "auto",
                    minWidth: railW * 0.16,
                    height: bodyH * 0.05,
                    borderRadius: 999,
                    background: BLUE,
                    color: "#fff",
                    fontSize: bodyH * 0.032,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: `0 ${railW * 0.03}px`,
                  }}
                >
                  {unread}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Message list. */}
      <div
        style={{
          position: "absolute",
          top: bodyTop,
          right: railW,
          width: listW,
          height: bodyH,
          borderLeft: `1px solid ${LINE}`,
          overflow: "hidden",
        }}
      >
        <div style={{ transform: `translateY(${-scroll}px)` }}>
          {Array.from({ length: rows + 3 }, (_, i) => {
            const appear = interpolate(local - 8 - i * 3, [0, 10], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const unreadRow = i % 3 === 0;
            const hue = [BLUE, "#c19c00", "#8764b8", "#0a7", "#c74f82"][i % 5];
            return (
              <div
                key={i}
                style={{
                  height: rowH,
                  display: "flex",
                  alignItems: "center",
                  gap: listW * 0.03,
                  padding: `0 ${listW * 0.045}px`,
                  boxSizing: "border-box",
                  borderBottom: `1px solid ${LINE}`,
                  opacity: appear,
                }}
              >
                {/* Unread marker. */}
                <div
                  style={{
                    width: listW * 0.012,
                    height: listW * 0.012,
                    borderRadius: "50%",
                    background: unreadRow ? BLUE : "transparent",
                  }}
                />
                {/* Avatar. */}
                <div
                  style={{
                    width: rowH * 0.42,
                    height: rowH * 0.42,
                    borderRadius: "50%",
                    background: hue,
                    opacity: 0.85,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: rowH * 0.12,
                    }}
                  >
                    <div
                      style={{
                        height: rowH * 0.12,
                        width: `${34 + (i % 3) * 8}%`,
                        borderRadius: 3,
                        background: unreadRow ? INK : MUTE,
                      }}
                    />
                    <div
                      style={{
                        height: rowH * 0.1,
                        width: "12%",
                        borderRadius: 3,
                        background: MUTE,
                        opacity: 0.6,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      height: rowH * 0.1,
                      width: `${68 - (i % 4) * 9}%`,
                      borderRadius: 3,
                      background: MUTE,
                      opacity: 0.7,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Scrollbar, to make the length of the list explicit. */}
        <div
          style={{
            position: "absolute",
            top: bodyH * 0.02,
            left: 3,
            width: 4,
            height: bodyH * 0.28,
            borderRadius: 3,
            background: "rgba(0,0,0,0.2)",
            transform: `translateY(${interpolate(scroll, [0, rowH * 2.4], [0, bodyH * 0.5])}px)`,
          }}
        />
      </div>

      {/* Reading pane. */}
      <div
        style={{
          position: "absolute",
          top: bodyTop,
          left: 0,
          width: width - railW - listW,
          height: bodyH,
          padding: `${bodyH * 0.06}px ${width * 0.03}px`,
          boxSizing: "border-box",
          background: "#fff",
        }}
      >
        <div
          style={{
            height: bodyH * 0.05,
            width: "72%",
            borderRadius: 4,
            background: INK,
            opacity: interpolate(local - 16, [0, 12], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            marginBottom: bodyH * 0.05,
          }}
        />
        {[0.94, 0.88, 0.92, 0.7, 0.86, 0.6, 0.8].map((w, i) => (
          <div
            key={i}
            style={{
              height: bodyH * 0.022,
              width: `${w * 100}%`,
              borderRadius: 3,
              background: MUTE,
              opacity: interpolate(local - 20 - i * 2, [0, 10], [0, 0.7], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              marginBottom: bodyH * 0.028,
            }}
          />
        ))}
      </div>
    </div>
  );
};
