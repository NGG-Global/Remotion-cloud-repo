import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { uiFontFamily } from "../fonts";
import { COLORS } from "../theme";

type TeamsRecordMockProps = {
  readonly width: number;
  readonly height: number;
  readonly delay?: number;
  /** Frame the More button is ringed. */
  readonly moreAt?: number;
  /** Frame the More menu opens. */
  readonly menuAt?: number;
  /** Frame the Record-and-transcribe submenu opens. */
  readonly submenuAt?: number;
  /** Frame the pointer clicks Start recording. */
  readonly clickAt?: number;
};

const SHELL = "#1b1a1f";
const BAR = "#2b2a30";
const MENU = "#26252b";
const HAIR = "rgba(255,255,255,0.08)";
const CHIP = "rgba(255,255,255,0.14)";
const TEXT = "rgba(255,255,255,0.92)";
const MUTE = "rgba(255,255,255,0.5)";
const RED = "#c4314b";

/** One control on the meeting bar: a glyph tile and a short label under it. */
const Control: React.FC<{
  readonly label: string;
  readonly size: number;
  readonly tint?: string;
  readonly glyph?: "dots" | "circle" | "square" | "tri";
  readonly children?: React.ReactNode;
}> = ({ label, size, tint, glyph = "square", children }) => (
  <div
    style={{
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: size * 0.16,
      width: size * 1.5,
    }}
  >
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.24,
        background: tint ?? CHIP,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: size * 0.09,
      }}
    >
      {glyph === "dots" ? (
        [0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: size * 0.11,
              height: size * 0.11,
              borderRadius: "50%",
              background: TEXT,
            }}
          />
        ))
      ) : glyph === "circle" ? (
        <div
          style={{
            width: size * 0.44,
            height: size * 0.44,
            borderRadius: "50%",
            border: `${size * 0.07}px solid ${TEXT}`,
          }}
        />
      ) : glyph === "tri" ? (
        <div
          style={{
            width: 0,
            height: 0,
            borderTop: `${size * 0.2}px solid transparent`,
            borderBottom: `${size * 0.2}px solid transparent`,
            borderLeft: `${size * 0.3}px solid ${TEXT}`,
          }}
        />
      ) : (
        <div
          style={{
            width: size * 0.42,
            height: size * 0.42,
            borderRadius: size * 0.1,
            background: TEXT,
            opacity: 0.9,
          }}
        />
      )}
    </div>
    <div style={{ fontSize: size * 0.2, color: MUTE, fontFamily: uiFontFamily }}>
      {label}
    </div>
    {children}
  </div>
);

/** A row in the More menu: leading dot, label, optional chevron. */
const MenuRow: React.FC<{
  readonly label: string;
  readonly h: number;
  readonly active?: boolean;
  readonly chevron?: boolean;
  readonly lead?: "rec" | "text" | "none";
  readonly children?: React.ReactNode;
}> = ({ label, h, active, chevron, lead = "none", children }) => (
  <div
    style={{
      position: "relative",
      height: h,
      display: "flex",
      alignItems: "center",
      gap: h * 0.28,
      padding: `0 ${h * 0.34}px`,
      borderRadius: h * 0.18,
      background: active ? "rgba(217,119,87,0.16)" : "transparent",
      boxShadow: active ? `inset 3px 0 0 ${COLORS.accent}` : undefined,
    }}
  >
    {lead === "rec" ? (
      <div
        style={{
          width: h * 0.34,
          height: h * 0.34,
          borderRadius: "50%",
          border: `${h * 0.06}px solid ${active ? COLORS.accent : MUTE}`,
        }}
      />
    ) : lead === "text" ? (
      <div
        style={{
          width: h * 0.36,
          height: h * 0.3,
          borderRadius: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: h * 0.05,
          padding: h * 0.05,
          boxSizing: "border-box",
          border: `1.5px solid ${active ? COLORS.accent : MUTE}`,
        }}
      >
        <div style={{ height: 1.5, background: active ? COLORS.accent : MUTE }} />
        <div style={{ height: 1.5, background: active ? COLORS.accent : MUTE }} />
      </div>
    ) : (
      <div
        style={{
          width: h * 0.34,
          height: h * 0.34,
          borderRadius: h * 0.1,
          background: CHIP,
        }}
      />
    )}
    <div
      style={{
        flex: 1,
        fontSize: h * 0.32,
        color: active ? TEXT : "rgba(255,255,255,0.78)",
        fontFamily: uiFontFamily,
        fontWeight: active ? 600 : 400,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </div>
    {chevron ? (
      <div
        style={{
          width: 0,
          height: 0,
          borderTop: `${h * 0.13}px solid transparent`,
          borderBottom: `${h * 0.13}px solid transparent`,
          borderLeft: `${h * 0.14}px solid ${active ? COLORS.accent : MUTE}`,
        }}
      />
    ) : null}
    {children}
  </div>
);

/**
 * A rebuilt Teams meeting bar, opening the Record-and-transcribe menu.
 *
 * The narration's one caveat is that a meeting transcript only exists if
 * someone turned recording on — and this is the menu where they do it. It is
 * drawn rather than screenshotted because the real meeting window carries a
 * meeting title and participant names, and because the point is the sequence:
 * More, then Record and transcribe, then Start recording. A still cannot walk
 * that path; the menu opening step by step can.
 */
export const TeamsRecordMock: React.FC<TeamsRecordMockProps> = ({
  width,
  height,
  delay = 0,
  moreAt = 10,
  menuAt = 22,
  submenuAt = 44,
  clickAt = 64,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;

  const open = spring({ frame: local, fps, config: { damping: 200 } });
  const s = height * 0.09; // control glyph size
  const titleH = height * 0.09;

  const ring = interpolate(local - moreAt, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const menu = spring({ frame: local - menuAt, fps, config: { damping: 40, stiffness: 140 } });
  const sub = spring({ frame: local - submenuAt, fps, config: { damping: 40, stiffness: 140 } });
  const click = interpolate(local - clickAt, [0, 10, 22], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const menuRowH = height * 0.082;
  const menuW = width * 0.3;

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        borderRadius: 16,
        background: SHELL,
        border: `1px solid ${HAIR}`,
        overflow: "hidden",
        opacity: open,
        transform: `scale(${0.94 + open * 0.06})`,
        boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
      }}
    >
      {/* Title bar with window controls. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: titleH,
          background: "#151419",
          borderBottom: `1px solid ${HAIR}`,
          display: "flex",
          alignItems: "center",
          padding: `0 ${titleH * 0.5}px`,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            height: titleH * 0.24,
            width: width * 0.24,
            borderRadius: 3,
            background: CHIP,
          }}
        />
        <div style={{ flex: 1 }} />
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: titleH * 0.2,
              height: titleH * 0.2,
              marginLeft: titleH * 0.35,
              borderRadius: 2,
              background: i === 2 ? RED : MUTE,
              opacity: 0.7,
            }}
          />
        ))}
      </div>

      {/* Meeting stage: a couple of dim participant tiles. */}
      <div
        style={{
          position: "absolute",
          top: titleH + height * 0.05,
          left: width * 0.06,
          right: width * 0.06,
          bottom: height * 0.28,
          display: "flex",
          gap: width * 0.03,
        }}
      >
        {[0, 1].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              borderRadius: 14,
              background: "#232228",
              border: `1px solid ${HAIR}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: interpolate(local - 4 - i * 4, [0, 12], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <div
              style={{
                width: height * 0.16,
                height: height * 0.16,
                borderRadius: "50%",
                background: i === 0 ? "#5b5fc7" : "#8764b8",
                opacity: 0.8,
              }}
            />
          </div>
        ))}
      </div>

      {/* Control bar. */}
      <div
        style={{
          position: "absolute",
          bottom: height * 0.05,
          left: "50%",
          transform: "translateX(-50%)",
          height: height * 0.19,
          display: "flex",
          alignItems: "center",
          gap: s * 0.55,
          padding: `0 ${s * 0.6}px`,
          borderRadius: s * 0.5,
          background: BAR,
          border: `1px solid ${HAIR}`,
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        }}
      >
        <Control label="Chat" size={s} />
        <Control label="People" size={s} />
        <Control label="React" size={s} />
        <Control label="View" size={s} />

        {/* More, with the menu hanging off it. */}
        <Control label="More" size={s} glyph="dots">
          {/* Instructional ring. */}
          <div
            style={{
              position: "absolute",
              top: -s * 0.12,
              left: `calc(50% - ${s * 0.62}px)`,
              width: s * 1.24,
              height: s * 1.24,
              borderRadius: s * 0.3,
              border: `${s * 0.06}px solid ${COLORS.accent}`,
              opacity: ring,
              boxShadow: `0 0 18px ${COLORS.accent}55`,
            }}
          />

          {/* The More menu, opening upward from the bar. */}
          {menu > 0.02 ? (
            <div
              style={{
                position: "absolute",
                bottom: s * 1.7,
                left: "50%",
                transform: `translateX(-50%) scale(${0.9 + menu * 0.1})`,
                transformOrigin: "bottom center",
                width: menuW,
                background: MENU,
                borderRadius: 12,
                border: `1px solid ${HAIR}`,
                boxShadow: "0 20px 50px rgba(0,0,0,0.55)",
                padding: menuRowH * 0.2,
                opacity: menu,
              }}
            >
              <MenuRow
                label="Record and transcribe"
                h={menuRowH}
                active={sub > 0.05}
                chevron
                lead="rec"
              >
                {/* Submenu opens to the left of the row. */}
                {sub > 0.02 ? (
                  <div
                    style={{
                      position: "absolute",
                      right: `calc(100% + ${menuRowH * 0.2}px)`,
                      top: -menuRowH * 0.2,
                      width: menuW * 0.92,
                      background: MENU,
                      borderRadius: 12,
                      border: `1px solid ${HAIR}`,
                      boxShadow: "0 20px 50px rgba(0,0,0,0.55)",
                      padding: menuRowH * 0.2,
                      transform: `scale(${0.9 + sub * 0.1})`,
                      transformOrigin: "top right",
                      opacity: sub,
                    }}
                  >
                    <MenuRow label="Start recording" h={menuRowH} lead="rec" active>
                      {click > 0 ? (
                        <div
                          style={{
                            position: "absolute",
                            left: menuRowH * 0.5,
                            top: "50%",
                            width: menuRowH * (0.4 + click),
                            height: menuRowH * (0.4 + click),
                            marginTop: -(menuRowH * (0.4 + click)) / 2,
                            borderRadius: "50%",
                            border: `2px solid ${COLORS.accent}`,
                            opacity: 1 - click,
                          }}
                        />
                      ) : null}
                    </MenuRow>
                    <MenuRow label="Start transcription" h={menuRowH} lead="text" />
                  </div>
                ) : null}
              </MenuRow>
              <MenuRow label="Meeting info" h={menuRowH} />
              <MenuRow label="Meeting notes" h={menuRowH} />
              <MenuRow label="Settings" h={menuRowH} />
            </div>
          ) : null}
        </Control>

        {/* A gap, then the call controls. */}
        <div style={{ width: s * 0.4 }} />
        <Control label="Camera" size={s} />
        <Control label="Mic" size={s} />
        <Control label="Share" size={s} glyph="tri" />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: s * 0.16,
          }}
        >
          <div
            style={{
              height: s,
              minWidth: s * 1.7,
              borderRadius: s * 0.24,
              background: RED,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: `0 ${s * 0.3}px`,
              color: "#fff",
              fontFamily: uiFontFamily,
              fontSize: s * 0.28,
              fontWeight: 600,
            }}
          >
            Leave
          </div>
          <div style={{ fontSize: s * 0.2, color: "transparent" }}>.</div>
        </div>
      </div>
    </div>
  );
};
