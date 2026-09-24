import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { uiFontFamily } from "../fonts";
import { COLORS } from "../theme";
import { APP, Bar, FitBox, Tile } from "./parts/ClaudeUI";

/** A row of the composer's plus menu. */
export type MenuItem = {
  readonly label: string;
  /** Opens a submenu. */
  readonly more?: boolean;
  /** A toggle that is on. */
  readonly checked?: boolean;
  /** Start a new group above this row. */
  readonly group?: boolean;
};

/** One entry in a submenu. `terse` rows are bars: they are someone's. */
export type SubItem = {
  readonly label?: string;
  readonly checked?: boolean;
  readonly badge?: string;
};

type ComposerMenuProps = {
  readonly width: number;
  readonly height: number;
  readonly delay?: number;
  readonly items: readonly MenuItem[];
  /** Frame at which the plus is pressed and the menu opens. */
  readonly openAt: number;
  /** Ring one row, by label, from a frame. */
  readonly ring?: readonly { readonly at: number; readonly label: string }[];
  /** A submenu, hanging off the row named, from a frame. */
  readonly submenu?: {
    readonly at: number;
    readonly from: string;
    readonly title: string;
    readonly rows: readonly SubItem[];
  };
  /** Text in the composer, if any. */
  readonly prompt?: string;
};

/** Composed at this size, then scaled to whatever the scene has room for. */
const DESIGN = { width: 1240, height: 980 };

/** The plus menu's own glyphs, reduced to a shape each. */
const Glyph: React.FC<{ readonly kind: string; readonly size: number }> = ({
  kind,
  size,
}) => {
  const s = {
    fill: "none",
    stroke: APP.inkSoft,
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      {kind.startsWith("Add files") ? (
        <path
          d="M14 4l-8.5 8.5a4 4 0 0 0 5.7 5.7L19 10.4a2.5 2.5 0 0 0-3.5-3.5L8 14.4"
          {...s}
        />
      ) : kind.startsWith("Take") ? (
        <>
          <rect x="3" y="7" width="18" height="13" rx="2" {...s} />
          <circle cx="12" cy="13.5" r="3.5" {...s} />
        </>
      ) : kind.startsWith("Add to project") ? (
        <>
          <path d="M4 8h16v11H4z" {...s} />
          <path d="M4 8V5h16v3" {...s} />
        </>
      ) : kind.startsWith("Add from") ? (
        <circle cx="12" cy="12" r="8" {...s} />
      ) : kind === "Skills" ? (
        <>
          <path d="M6 4h8l4 4v12H6z" {...s} />
          <path d="M9 12h6M9 15.5h6" {...s} />
        </>
      ) : kind === "Connectors" ? (
        <>
          <rect x="4" y="4" width="7" height="7" rx="1.5" {...s} />
          <rect x="13" y="13" width="7" height="7" rx="1.5" {...s} />
          <path d="M11 7.5h3.5v5.5" {...s} />
        </>
      ) : kind.startsWith("Design") ? (
        <>
          <circle cx="12" cy="12" r="8" {...s} />
          <circle cx="9" cy="10" r="1" fill={APP.inkSoft} />
          <circle cx="14" cy="9" r="1" fill={APP.inkSoft} />
          <circle cx="15" cy="13" r="1" fill={APP.inkSoft} />
        </>
      ) : kind.startsWith("Add plugins") ? (
        <path d="M8 4v4H5v4h3a4 4 0 0 0 8 0h3V8h-3V4" {...s} />
      ) : kind === "Research" ? (
        <>
          <circle cx="11" cy="11" r="6" {...s} />
          <path d="M15.5 15.5L20 20" {...s} />
        </>
      ) : kind === "Web search" ? (
        <>
          <circle cx="12" cy="12" r="8" {...s} />
          <path d="M4 12h16M12 4c3 3 3 13 0 16M12 4c-3 3-3 13 0 16" {...s} />
        </>
      ) : (
        <path d="M5 8h14a3 3 0 0 1 0 6H5a3 3 0 0 1 0-6zM5 14v3h14v-3" {...s} />
      )}
    </svg>
  );
};

/**
 * The composer, with its plus menu open.
 *
 * Everything the narration sends the viewer to reach for lives behind one
 * button on the home screen, and the screenshot of that menu is the one this
 * episode was briefed from. It is drawn at composer scale rather than as a
 * whole window, because the menu's labels are the content and at window scale
 * they are twelve pixels tall. The greeting carries no name and the design
 * system submenu lists one legible entry: the rest of that list is a client
 * roster.
 */
export const ComposerMenu: React.FC<ComposerMenuProps> = ({
  width,
  height,
  delay = 0,
  items,
  openAt,
  ring = [],
  submenu,
  prompt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;

  const open = spring({
    frame: local - openAt,
    fps,
    config: { damping: 30, stiffness: 150 },
  });
  const press = interpolate(local - openAt, [-4, 4, 14], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const activeRing = ring.reduce<{ at: number; label: string } | undefined>(
    (found, step) => (local >= step.at ? step : found),
    undefined,
  );
  const ringIn = activeRing
    ? spring({ frame: local - activeRing.at, fps, config: { damping: 200 } })
    : 0;

  const sub = submenu
    ? spring({
        frame: local - submenu.at,
        fps,
        config: { damping: 30, stiffness: 150 },
      })
    : 0;

  const composerW = DESIGN.width * 0.78;
  const composerH = 176;
  const composerLeft = (DESIGN.width - composerW) / 2;
  const composerTop = 120;
  const rowH = 52;
  const menuW = 300;
  const menuLeft = composerLeft + 18;
  const menuTop = composerTop + composerH + 12;

  const groups = items.filter((i) => i.group).length;
  const menuH = items.length * rowH + groups * 14 + 16;

  const rowTop = (index: number) => {
    let y = 8;
    for (let i = 0; i < index; i++) {
      if (items[i + 1]?.group) y += 14;
      y += rowH;
    }
    return y;
  };

  const subFromIndex = submenu
    ? items.findIndex((i) => i.label === submenu.from)
    : -1;
  const subRowH = 46;

  return (
    <FitBox width={width} height={height} design={DESIGN}>
      <div
        style={{
          position: "relative",
          width: DESIGN.width,
          height: DESIGN.height,
        }}
      >
        {/* Greeting, nameless. */}
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: "Georgia, serif",
            fontSize: 56,
            // On the stage, not on a canvas: light text.
            color: COLORS.text,
            letterSpacing: "-0.01em",
            opacity: interpolate(local, [0, 12], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <span style={{ color: APP.coral, marginRight: 14 }}>✳</span>Afternoon
        </div>

        {/* Composer. */}
        <div
          style={{
            position: "absolute",
            left: composerLeft,
            top: composerTop,
            width: composerW,
            height: composerH,
            borderRadius: 28,
            background: APP.panel,
            border: `1px solid ${APP.line}`,
            boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
            padding: "26px 30px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontFamily: uiFontFamily,
              fontSize: 26,
              color: prompt ? APP.ink : APP.mute,
              direction: prompt ? "rtl" : "ltr",
            }}
          >
            {prompt ?? "How can I help you today?"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                position: "relative",
                width: 40,
                height: 40,
                borderRadius: 10,
                background: open > 0.1 ? "rgba(0,0,0,0.07)" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: uiFontFamily,
                fontSize: 30,
                color: APP.inkSoft,
              }}
            >
              +
              {press > 0 ? (
                <div
                  style={{
                    position: "absolute",
                    inset: -12 * press,
                    borderRadius: "50%",
                    border: `3px solid ${APP.coral}`,
                    opacity: 1 - press,
                  }}
                />
              ) : null}
            </div>
            <div
              style={{
                display: "flex",
                gap: 2,
                padding: 3,
                borderRadius: 12,
                background: "rgba(0,0,0,0.045)",
              }}
            >
              {["Chat", "Cowork"].map((m, i) => (
                <div
                  key={m}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 10,
                    background: i === 0 ? APP.panel : "transparent",
                    fontFamily: uiFontFamily,
                    fontSize: 20,
                    fontWeight: i === 0 ? 600 : 500,
                    color: i === 0 ? APP.ink : APP.mute,
                  }}
                >
                  {m}
                </div>
              ))}
            </div>
            <div style={{ flex: 1 }} />
            <div
              style={{
                fontFamily: uiFontFamily,
                fontSize: 20,
                fontWeight: 600,
                color: APP.inkSoft,
              }}
            >
              Opus 5.5{" "}
              <span style={{ color: APP.mute, fontWeight: 500 }}>High</span>
            </div>
            <Tile size={22} />
            <Tile size={22} />
          </div>
        </div>

        {/* The menu, dropping from the plus. */}
        {open > 0.02 ? (
          <div
            style={{
              position: "absolute",
              left: menuLeft,
              top: menuTop,
              width: menuW,
              height: menuH,
              borderRadius: 16,
              background: APP.panel,
              border: `1px solid ${APP.line}`,
              boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
              opacity: open,
              transform: `scale(${0.94 + open * 0.06})`,
              transformOrigin: "top left",
            }}
          >
            {items.map((item, i) => {
              const y = rowTop(i);
              const ringed = activeRing?.label === item.label;
              const isSubFrom = submenu && sub > 0.05 && i === subFromIndex;
              return (
                <React.Fragment key={item.label}>
                  {item.group ? (
                    <div
                      style={{
                        position: "absolute",
                        top: y - 7,
                        left: 12,
                        right: 12,
                        height: 1,
                        background: APP.lineSoft,
                      }}
                    />
                  ) : null}
                  <div
                    style={{
                      position: "absolute",
                      top: y,
                      left: 6,
                      right: 6,
                      height: rowH,
                      borderRadius: 10,
                      background: isSubFrom
                        ? "rgba(0,0,0,0.055)"
                        : "transparent",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "0 12px",
                      boxSizing: "border-box",
                      opacity: interpolate(
                        local - openAt - 2 - i * 1.5,
                        [0, 8],
                        [0, 1],
                        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                      ),
                    }}
                  >
                    <Glyph kind={item.label} size={24} />
                    <div
                      style={{
                        flex: 1,
                        fontFamily: uiFontFamily,
                        fontSize: 21,
                        fontWeight: 500,
                        color: APP.ink,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.label}
                    </div>
                    {item.more ? (
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderTop: `2px solid ${APP.mute}`,
                          borderRight: `2px solid ${APP.mute}`,
                          transform: "rotate(45deg)",
                        }}
                      />
                    ) : null}
                    {item.checked ? (
                      <svg
                        width={22}
                        height={22}
                        viewBox="0 0 24 24"
                        aria-hidden
                      >
                        <path
                          d="M5 12.5l4.5 4.5L19 7.5"
                          fill="none"
                          stroke={APP.select}
                          strokeWidth={2.4}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : null}
                    {ringed ? (
                      <div
                        style={{
                          position: "absolute",
                          inset: -5,
                          borderRadius: 13,
                          border: `4px solid ${APP.coral}`,
                          boxShadow: `0 0 26px ${APP.coral}55`,
                          opacity: ringIn,
                        }}
                      />
                    ) : null}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        ) : null}

        {/* The submenu, beside the row it belongs to. */}
        {submenu && sub > 0.02 && subFromIndex >= 0 ? (
          <div
            style={{
              position: "absolute",
              left: menuLeft + menuW + 8,
              top: menuTop + rowTop(subFromIndex) - 8 - subRowH * 1.2,
              width: 420,
              borderRadius: 16,
              background: APP.panel,
              border: `1px solid ${APP.line}`,
              boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
              padding: "10px 8px",
              opacity: sub,
              transform: `scale(${0.94 + sub * 0.06})`,
              transformOrigin: "left center",
            }}
          >
            <div
              style={{
                fontFamily: uiFontFamily,
                fontSize: 18,
                fontWeight: 600,
                color: APP.mute,
                padding: "4px 12px 8px",
              }}
            >
              {submenu.title}
            </div>
            {submenu.rows.map((row, i) => (
              <div
                key={i}
                style={{
                  height: subRowH,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "0 12px",
                  opacity: interpolate(
                    local - submenu.at - 3 - i * 2,
                    [0, 8],
                    [0, 1],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                  ),
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 5,
                    border: `1.8px solid ${row.checked ? APP.select : APP.faint}`,
                    background: row.checked ? APP.select : APP.panel,
                    flexShrink: 0,
                  }}
                />
                {row.label ? (
                  <div
                    style={{
                      flex: 1,
                      fontFamily: uiFontFamily,
                      fontSize: 20,
                      fontWeight: 500,
                      color: APP.ink,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.label}
                  </div>
                ) : (
                  <Bar w={`${46 + ((i * 17) % 30)}%`} h={9} />
                )}
                {row.badge ? (
                  <div
                    style={{
                      padding: "3px 10px",
                      borderRadius: 7,
                      background: "rgba(0,0,0,0.06)",
                      fontFamily: uiFontFamily,
                      fontSize: 15,
                      fontWeight: 600,
                      color: APP.inkSoft,
                    }}
                  >
                    {row.badge}
                  </div>
                ) : null}
                <Tile size={16} tone={APP.faint} />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </FitBox>
  );
};
