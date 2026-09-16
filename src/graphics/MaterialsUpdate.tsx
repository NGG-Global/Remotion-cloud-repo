import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";
import { LineIcon, type IconName } from "./LineIcon";

export type MaterialChip = {
  readonly label: string;
  readonly icon: IconName;
  readonly at: number;
};

type MaterialsUpdateProps = {
  readonly width: number;
  readonly height: number;
  /** What the folder holds. The one being replaced is named separately. */
  readonly chips: readonly MaterialChip[];
  readonly folderLabel: string;
  /** The stale document, and what replaces it. */
  readonly stale: { readonly from: string; readonly to: string };
  /** Frame at which the stale document is marked. */
  readonly markAt: number;
  /** Frame at which the new version takes its place. */
  readonly swapAt: number;
  /** Frame at which the change reaches the conversations. */
  readonly propagateAt: number;
  /** The conversations downstream of the folder. */
  readonly downstream: readonly string[];
};

/**
 * Replacing one document, and everything downstream following.
 *
 * The narration's claim is small and easy to miss: you do not re-brief the
 * project when something changes, you swap the file. Drawn, that claim has a
 * shape — the old version leaves the slot, the new one drops into the same
 * slot, and the conversations below re-read it without being told to. The
 * slot staying put is doing the work: the project is unchanged, only its
 * contents moved.
 */
export const MaterialsUpdate: React.FC<MaterialsUpdateProps> = ({
  width,
  height,
  chips,
  folderLabel,
  stale,
  markAt,
  swapAt,
  propagateAt,
  downstream,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const folderW = Math.min(width * 0.62, 1100);
  const folderH = height * 0.42;
  const folderLeft = (width - folderW) / 2;
  const folderTop = height * 0.03;

  const cardW = Math.min((width * 0.62) / downstream.length - 24, 330);
  const cardH = height * 0.24;
  const cardTop = height * 0.66;
  const span = cardW * downstream.length + 30 * (downstream.length - 1);
  const cardsLeft = (width - span) / 2;
  // Right to left: the first conversation named sits rightmost.
  const cardLeft = (i: number) => cardsLeft + span - (i + 1) * cardW - i * 30;

  const mark = interpolate(frame - markAt, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const swap = spring({
    frame: frame - swapAt,
    fps,
    config: { damping: 26, stiffness: 120 },
  });

  // The slot sits left of the chips rather than centred: an RTL reader takes
  // the untouched material on the right first, then the one being replaced.
  const slotW = folderW * 0.36;
  const slotH = folderH * 0.44;
  const slotLeft = folderLeft + folderW * 0.1;
  const slotTop = folderTop + folderH * 0.42;

  /** The version sitting in the slot, drawn twice as it changes over. */
  const Version: React.FC<{
    readonly label: string;
    readonly tag: string;
    readonly offset: number;
    readonly opacity: number;
    readonly struck: number;
    readonly live: boolean;
  }> = ({ label, tag, offset, opacity, struck, live }) => (
    <div
      style={{
        position: "absolute",
        left: slotLeft,
        top: slotTop + offset,
        width: slotW,
        height: slotH,
        borderRadius: 16,
        background: live ? `${COLORS.accent}1f` : COLORS.surface,
        border: `2px solid ${live ? COLORS.accent : "rgba(255,255,255,0.14)"}`,
        opacity,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: slotW * 0.05,
        direction: "rtl",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          fontFamily,
          fontSize: slotH * 0.28,
          fontWeight: 700,
          color: live ? COLORS.text : COLORS.textMuted,
        }}
      >
        {label}
        <div
          style={{
            position: "absolute",
            top: "52%",
            right: 0,
            left: 0,
            height: 3,
            borderRadius: 2,
            background: COLORS.warn,
            transform: `scaleX(${struck})`,
            transformOrigin: "right center",
          }}
        />
      </div>
      <div
        style={{
          padding: `${slotH * 0.06}px ${slotW * 0.05}px`,
          borderRadius: 999,
          background: live ? COLORS.accent : "rgba(255,255,255,0.12)",
          fontFamily,
          fontSize: slotH * 0.22,
          fontWeight: 800,
          color: live ? COLORS.ink : COLORS.textMuted,
        }}
      >
        {tag}
      </div>
    </div>
  );

  return (
    <div style={{ position: "relative", width, height }}>
      {/* Lines down to the conversations, and the pulse that travels them. */}
      <svg
        style={{ position: "absolute", inset: 0 }}
        width={width}
        height={height}
        aria-hidden
      >
        {downstream.map((_, i) => {
          const x = cardLeft(i) + cardW / 2;
          const y1 = folderTop + folderH;
          const y2 = cardTop;
          const pulse = interpolate(
            frame - propagateAt - i * 4,
            [0, 20],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          return (
            <g key={i}>
              <path
                d={`M ${x} ${y1} L ${x} ${y2}`}
                stroke={COLORS.textMuted}
                strokeWidth={2}
                strokeOpacity={0.25}
                strokeDasharray="6 8"
              />
              {pulse > 0 && pulse < 1 ? (
                <circle
                  cx={x}
                  cy={interpolate(pulse, [0, 1], [y1, y2])}
                  r={8}
                  fill={COLORS.accent}
                />
              ) : null}
            </g>
          );
        })}
      </svg>

      {/* The folder. */}
      <div
        style={{
          position: "absolute",
          left: folderLeft,
          top: folderTop,
          width: folderW,
          height: folderH,
          borderRadius: 26,
          background: COLORS.surface,
          border: `2px solid ${COLORS.accent}`,
          boxShadow: `0 0 60px ${COLORS.accent}22`,
          direction: "rtl",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: folderH * 0.1,
            right: folderW * 0.05,
            display: "flex",
            alignItems: "center",
            gap: folderW * 0.02,
          }}
        >
          <LineIcon name="files" size={folderH * 0.2} color={COLORS.accent} />
          <div
            style={{
              fontFamily,
              fontSize: folderH * 0.15,
              fontWeight: 800,
              color: COLORS.text,
            }}
          >
            {folderLabel}
          </div>
        </div>

        {/* The other material, untouched by any of this. */}
        <div
          style={{
            position: "absolute",
            top: folderTop + folderH * 0.42 - folderTop,
            right: folderW * 0.05,
            display: "flex",
            flexDirection: "column",
            gap: folderH * 0.07,
          }}
        >
          {chips.map((chip, i) => {
            const on = spring({
              frame: frame - chip.at,
              fps,
              config: { damping: 200 },
            });
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: folderW * 0.014,
                  padding: `${folderH * 0.035}px ${folderW * 0.022}px`,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.05)",
                  opacity: on * 0.85,
                  transform: `translateX(${interpolate(on, [0, 1], [18, 0])}px)`,
                }}
              >
                <LineIcon
                  name={chip.icon}
                  size={folderH * 0.11}
                  color={COLORS.textMuted}
                  delay={chip.at + 3}
                />
                <div
                  style={{
                    fontFamily,
                    fontSize: folderH * 0.1,
                    fontWeight: 500,
                    color: COLORS.textMuted,
                    whiteSpace: "nowrap",
                  }}
                >
                  {chip.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* The slot the version sits in. It does not move; its contents do. */}
      <div
        style={{
          position: "absolute",
          left: slotLeft - 10,
          top: slotTop - 10,
          width: slotW + 20,
          height: slotH + 20,
          borderRadius: 20,
          border: `2px dashed rgba(255,255,255,0.18)`,
        }}
      />

      <Version
        label={stale.from}
        tag="v1"
        offset={interpolate(swap, [0, 1], [0, -slotH * 1.5])}
        opacity={1 - swap}
        struck={mark}
        live={swap < 0.5}
      />
      {swap > 0.02 ? (
        <Version
          label={stale.to}
          tag="v2"
          offset={interpolate(swap, [0, 1], [slotH * 1.5, 0])}
          opacity={swap}
          struck={0}
          live
        />
      ) : null}

      {/* The conversations, which were never told anything. */}
      {downstream.map((label, i) => {
        const arrived = interpolate(
          frame - propagateAt - i * 4 - 20,
          [0, 12],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cardLeft(i),
              top: cardTop,
              width: cardW,
              height: cardH,
              borderRadius: 18,
              background: COLORS.surface,
              border: `1px solid rgba(255,255,255,${0.08 + arrived * 0.14})`,
              boxShadow:
                arrived > 0.8 ? `0 0 28px ${COLORS.accent}22` : undefined,
              direction: "rtl",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: cardH * 0.1,
            }}
          >
            <div
              style={{
                fontFamily,
                fontSize: cardH * 0.2,
                fontWeight: 600,
                color: COLORS.text,
              }}
            >
              {label}
            </div>
            <div
              style={{
                padding: `${cardH * 0.04}px ${cardW * 0.06}px`,
                borderRadius: 999,
                background: `${COLORS.accent}26`,
                border: `1px solid ${COLORS.accent}66`,
                fontFamily,
                fontSize: cardH * 0.15,
                fontWeight: 800,
                color: COLORS.accentSoft,
                opacity: arrived,
              }}
            >
              v2
            </div>
          </div>
        );
      })}
    </div>
  );
};
