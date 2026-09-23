import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";
import { fontFamily, uiFontFamily } from "../../fonts";
import { APP, Bar } from "./ClaudeUI";

/**
 * One entry in the skills list.
 *
 * The real panel carries a colleague's name on every shared row and an
 * organisation's whole private tooling. Name and description are passed in by
 * the composition so each scene shows only what its beat teaches, and the
 * author of a shared skill is a role rather than a person.
 */
export type SkillEntry = {
  /** The skill's own name, as the product shows it. */
  readonly name: string;
  /** Who it came from — "by you", "from Anthropic", a role, never a person. */
  readonly by: string;
  /** The description line. This is the part Claude reads to decide. */
  readonly description: string;
  /** Small tags after the name. */
  readonly badges?: readonly string[];
  readonly date?: string;
  /** Shared-but-off, the one row that carries a Turn on button. */
  readonly off?: boolean;
  /** Frame at which the row arrives. */
  readonly at: number;
};

export type SkillSection = {
  readonly title: string;
  readonly entries: readonly SkillEntry[];
};

/** The product's own tile for a skill: a sheet with a fold. */
export const SkillGlyph: React.FC<{
  readonly size: number;
  readonly tone?: string;
}> = ({ size, tone = APP.inkSoft }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
    <g
      fill="none"
      stroke={tone}
      strokeWidth={1.6}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <path d="M5 3.8h9.5L19 8.3V20.2H5z" />
      <path d="M14.5 3.8v4.5H19" />
      <path d="M8 12h8M8 15.4h8M8 18h5" />
    </g>
  </svg>
);

/** A small rounded tag, the way the panel labels New / Design / Disabled. */
export const Badge: React.FC<{
  readonly label: string;
  readonly h: number;
  readonly tone?: "info" | "plain";
}> = ({ label, h, tone = "plain" }) => (
  <div
    style={{
      height: h,
      display: "flex",
      alignItems: "center",
      padding: `0 ${h * 0.42}px`,
      borderRadius: h * 0.28,
      background: tone === "info" ? "#e6f0fb" : "rgba(0,0,0,0.045)",
      border: `1px solid ${tone === "info" ? "#bcd8f5" : APP.line}`,
      fontFamily: uiFontFamily,
      fontSize: h * 0.56,
      fontWeight: 600,
      color: tone === "info" ? "#1c5fa8" : APP.inkSoft,
      whiteSpace: "nowrap",
      flexShrink: 0,
    }}
  >
    {label}
  </div>
);

/**
 * One row of the skills list.
 *
 * `scale` is the row's height; everything inside is a fraction of it, so the
 * same row draws at establishing-shot size and at explaining size without a
 * second set of numbers.
 */
export const SkillRow: React.FC<{
  readonly entry: SkillEntry;
  readonly local: number;
  readonly h: number;
  /** Abstract the description to a bar, for shots too wide to read it. */
  readonly terse?: boolean;
  /** Frame at which Turn on is pressed, for the shared-but-off row. */
  readonly turnOnAt?: number;
  /**
   * Pull the row's description forward and let everything else recede, for
   * the beat about Claude choosing a skill by reading it. 0-1.
   */
  readonly readIt?: number;
}> = ({ entry, local, h, terse, turnOnAt, readIt = 0 }) => {
  const { fps } = useVideoConfig();

  const arrive = spring({
    frame: local - entry.at,
    fps,
    config: { damping: 200 },
  });
  if (arrive <= 0.001) {
    return null;
  }

  const on = turnOnAt !== undefined && local >= turnOnAt;
  const press =
    turnOnAt === undefined
      ? 0
      : interpolate(local - turnOnAt, [0, 6, 16], [0, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: h * 0.24,
        height: h,
        borderBottom: `1px solid ${APP.lineSoft}`,
        opacity: arrive,
        transform: `translateY(${interpolate(arrive, [0, 1], [12, 0])}px)`,
      }}
    >
      <div
        style={{
          width: h * 0.56,
          height: h * 0.56,
          borderRadius: h * 0.15,
          border: `1px solid ${APP.line}`,
          background: APP.canvas,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <SkillGlyph size={h * 0.34} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: h * 0.12,
            marginBottom: h * 0.08,
            opacity: 1 - readIt * 0.55,
          }}
        >
          <div
            style={{
              fontFamily: uiFontFamily,
              fontSize: h * 0.26,
              fontWeight: 600,
              color: APP.ink,
              whiteSpace: "nowrap",
            }}
          >
            {entry.name}
          </div>
          {(entry.badges ?? []).map((badge, i) => (
            <Badge
              key={badge}
              label={badge}
              h={h * 0.24}
              tone={i === 0 && badge === "New" ? "info" : "plain"}
            />
          ))}
          {entry.off && !on ? <Badge label="Disabled" h={h * 0.24} /> : null}
        </div>

        {terse ? (
          <Bar w={`${58 + entry.name.length * 0.7}%`} h={h * 0.08} />
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: h * 0.1,
              fontFamily: uiFontFamily,
              fontSize: h * 0.2,
              color: APP.mute,
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          >
            <span style={{ flexShrink: 0, opacity: 1 - readIt * 0.55 }}>
              {entry.by}
            </span>
            <span style={{ flexShrink: 0, opacity: 1 - readIt * 0.55 }}>·</span>
            {/* The description sentence. Hebrew inside it has to lay out RTL
                at its own span, or it renders reversed. */}
            <span
              style={{
                direction: /[֐-׿]/.test(entry.description) ? "rtl" : "ltr",
                fontFamily: /[֐-׿]/.test(entry.description)
                  ? fontFamily
                  : uiFontFamily,
                overflow: "hidden",
                textOverflow: "ellipsis",
                // The line Claude actually reads, lifted out of the row.
                color: readIt > 0.02 ? APP.ink : undefined,
                fontWeight: readIt > 0.02 ? 600 : undefined,
                background:
                  readIt > 0.02
                    ? `rgba(217,119,87,${0.2 * readIt})`
                    : undefined,
                border:
                  readIt > 0.02
                    ? `1.5px solid rgba(217,119,87,${0.85 * readIt})`
                    : undefined,
                borderRadius: readIt > 0.02 ? h * 0.08 : undefined,
                padding:
                  readIt > 0.02 ? `${h * 0.03}px ${h * 0.09}px` : undefined,
                margin: readIt > 0.02 ? `0 ${-h * 0.03}px` : undefined,
              }}
            >
              {entry.description}
            </span>
          </div>
        )}
      </div>

      {entry.off ? (
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div
            style={{
              height: h * 0.4,
              display: "flex",
              alignItems: "center",
              padding: `0 ${h * 0.3}px`,
              borderRadius: h * 0.12,
              background: on ? APP.ink : APP.panel,
              border: `1px solid ${on ? APP.ink : APP.line}`,
              color: on ? "#fff" : APP.ink,
              fontFamily: uiFontFamily,
              fontSize: h * 0.2,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {on ? "On" : "Turn on"}
          </div>
          {press > 0 ? (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: h * 0.7 * (0.6 + press),
                height: h * 0.7 * (0.6 + press),
                transform: "translate(-50%,-50%)",
                borderRadius: "50%",
                border: `${h * 0.04}px solid ${APP.coral}`,
                opacity: 1 - press,
              }}
            />
          ) : null}
        </div>
      ) : entry.date ? (
        <div
          style={{
            flexShrink: 0,
            fontFamily: uiFontFamily,
            fontSize: h * 0.2,
            color: APP.mute,
            whiteSpace: "nowrap",
            opacity: 1 - readIt * 0.55,
          }}
        >
          {entry.date}
        </div>
      ) : null}

      {/* The row's overflow menu. */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: h * 0.05,
          paddingLeft: h * 0.1,
          opacity: 1 - readIt * 0.55,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: h * 0.05,
              height: h * 0.05,
              borderRadius: "50%",
              background: APP.mute,
            }}
          />
        ))}
      </div>
    </div>
  );
};

/** The heading above a group of rows, with its count. */
export const SectionHead: React.FC<{
  readonly title: string;
  readonly count: number;
  readonly h: number;
  readonly local: number;
  readonly at: number;
}> = ({ title, count, h, local, at }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: h * 0.4,
      marginTop: h * 0.7,
      marginBottom: h * 0.34,
      opacity: interpolate(local - at, [0, 10], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    }}
  >
    <div
      style={{
        fontFamily: uiFontFamily,
        fontSize: h,
        fontWeight: 700,
        color: APP.ink,
      }}
    >
      {title}
    </div>
    <div
      style={{
        fontFamily: uiFontFamily,
        fontSize: h * 0.82,
        fontWeight: 500,
        color: APP.mute,
      }}
    >
      {count}
    </div>
  </div>
);

/** The panel's own header strip: title, the two tabs, search and Add. */
export const SkillsHeader: React.FC<{
  readonly h: number;
  readonly count: number;
  readonly local: number;
  readonly at?: number;
  /** Which tab reads as selected. */
  readonly tab?: "yours" | "discover";
  /**
   * Which control to ring, and from when. Drawn inside the control rather
   * than at a computed offset: a ring placed by arithmetic drifts the moment
   * a label's length changes.
   */
  readonly ring?: "tabs" | "add";
  readonly ringAt?: number;
}> = ({ h, count, local, at = 0, tab = "yours", ring, ringAt }) => {
  const shown = interpolate(local - at, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ringIn =
    ringAt === undefined
      ? 0
      : interpolate(local - ringAt, [0, 10], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  const Ring: React.FC<{ readonly on: boolean }> = ({ on }) =>
    on && ringIn > 0.01 ? (
      <div
        style={{
          position: "absolute",
          inset: -h * 0.16,
          borderRadius: h * 0.28,
          border: `${h * 0.075}px solid ${APP.coral}`,
          boxShadow: `0 0 ${h * 0.5}px ${APP.coral}55`,
          opacity: ringIn,
        }}
      />
    ) : null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: h * 0.3,
        opacity: shown,
      }}
    >
      <div
        style={{
          fontFamily: uiFontFamily,
          fontSize: h * 0.62,
          fontWeight: 700,
          color: APP.ink,
          letterSpacing: "-0.015em",
        }}
      >
        Skills
      </div>

      <div
        style={{
          position: "relative",
          display: "flex",
          gap: 2,
          padding: 3,
          borderRadius: h * 0.24,
          background: "rgba(0,0,0,0.045)",
        }}
      >
        <Ring on={ring === "tabs"} />
        {(
          [
            ["Yours", "yours"],
            ["Discover", "discover"],
          ] as const
        ).map(([label, key]) => (
          <div
            key={key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: h * 0.14,
              padding: `${h * 0.12}px ${h * 0.24}px`,
              borderRadius: h * 0.2,
              background: tab === key ? APP.panel : "transparent",
              fontFamily: uiFontFamily,
              fontSize: h * 0.3,
              fontWeight: tab === key ? 600 : 500,
              color: tab === key ? APP.ink : APP.mute,
            }}
          >
            {label}
            {key === "yours" ? (
              <span style={{ color: APP.mute, fontWeight: 500 }}>{count}</span>
            ) : null}
          </div>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      <div
        style={{
          width: h * 4.4,
          height: h * 0.72,
          borderRadius: h * 0.18,
          border: `1px solid ${APP.line}`,
          background: APP.panel,
          display: "flex",
          alignItems: "center",
          gap: h * 0.18,
          padding: `0 ${h * 0.24}px`,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: h * 0.26,
            height: h * 0.26,
            borderRadius: "50%",
            border: `1.5px solid ${APP.mute}`,
          }}
        />
        <div
          style={{
            fontFamily: uiFontFamily,
            fontSize: h * 0.28,
            color: APP.mute,
          }}
        >
          Search skills and plugins
        </div>
      </div>

      <div
        style={{
          position: "relative",
          height: h * 0.72,
          display: "flex",
          alignItems: "center",
          padding: `0 ${h * 0.34}px`,
          borderRadius: h * 0.18,
          background: APP.ink,
          color: "#fff",
          fontFamily: uiFontFamily,
          fontSize: h * 0.3,
          fontWeight: 600,
          gap: h * 0.14,
        }}
      >
        <Ring on={ring === "add"} />
        <span style={{ fontSize: h * 0.36, lineHeight: 1 }}>+</span> Add
      </div>
    </div>
  );
};
