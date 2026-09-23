import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { uiFontFamily } from "../fonts";
import { APP, FitBox } from "./parts/ClaudeUI";
import {
  SectionHead,
  SkillRow,
  SkillsHeader,
  type SkillSection,
} from "./parts/SkillsUI";

/** What the ring can land on. */
export type SettingsPart = "nav" | "skills-nav" | "tabs" | "add" | "list";

type SkillsSettingsProps = {
  readonly width: number;
  readonly height: number;
  readonly delay?: number;
  readonly sections: readonly SkillSection[];
  /** Total shown against the Yours tab. */
  readonly count: number;
  readonly ring?: readonly {
    readonly at: number;
    readonly part: SettingsPart;
  }[];
};

/** Composed at this size, then scaled to whatever the scene has room for. */
const DESIGN = { width: 1300, height: 790 };

const NAV_SETTINGS = [
  "General",
  "Account",
  "Privacy",
  "Usage",
  "Capabilities",
  "Memory",
  "Claude Code",
];
const NAV_CUSTOMIZE = ["Skills", "Connectors", "Plugins"];

/**
 * Settings, open on Skills.
 *
 * The establishing shot for the episode: where skills live, and that they
 * arrive from three different places. Descriptions are bars here on purpose —
 * at the width a whole settings modal has to be drawn at, a description line
 * is six pixels of grey and asking the viewer to read it only pulls them away
 * from the voice. The list that can be read gets its own, much tighter shot.
 *
 * Drawn rather than screenshotted: the real panel carries an organisation's
 * private tooling and, on every shared row, the name of the colleague who
 * shared it.
 */
export const SkillsSettings: React.FC<SkillsSettingsProps> = ({
  width,
  height,
  delay = 0,
  sections,
  count,
  ring = [],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;

  const open = spring({ frame: local, fps, config: { damping: 200 } });

  const navW = DESIGN.width * 0.245;
  const pad = DESIGN.height * 0.036;
  const navRow = DESIGN.height * 0.048;
  const rowH = DESIGN.height * 0.1;
  const headH = DESIGN.height * 0.052;

  const active = ring.reduce<SettingsPart | undefined>(
    (found, step) => (local >= step.at ? step.part : found),
    undefined,
  );
  const activeAt = ring.reduce<number>(
    (found, step) => (local >= step.at ? step.at : found),
    0,
  );
  const ringIn = spring({
    frame: local - activeAt,
    fps,
    config: { damping: 200 },
  });

  /**
   * Where the ring sits, for the two targets that are absolutely positioned
   * anyway. The nav row and the header controls draw their own, from inside
   * the element — a ring placed by adding up paddings drifts as soon as one
   * of them changes.
   */
  const ringBox = () => {
    switch (active) {
      case "nav":
        return {
          left: pad * 0.4,
          top: pad * 0.5,
          w: navW - pad * 0.8,
          h: DESIGN.height - pad,
        };
      case "list":
        return {
          left: navW + pad * 0.5,
          top: pad * 2.5,
          w: DESIGN.width - navW - pad * 1.5,
          h: DESIGN.height - pad * 3.4,
        };
      default:
        return null;
    }
  };

  const box = ringBox();

  /** Rows are laid out in order across the sections, so one counter drives
   *  both the arrival delays and the vertical position. */
  let cursor = 0;

  return (
    <FitBox width={width} height={height} design={DESIGN}>
      <div
        style={{
          position: "relative",
          width: DESIGN.width,
          height: DESIGN.height,
          borderRadius: 22,
          background: APP.panel,
          boxShadow: "0 40px 110px rgba(0,0,0,0.5)",
          overflow: "hidden",
          opacity: open,
          transform: `scale(${0.96 + open * 0.04})`,
        }}
      >
        {/* Left nav. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: navW,
            height: DESIGN.height,
            background: APP.canvas,
            borderRight: `1px solid ${APP.lineSoft}`,
            padding: `${pad}px ${pad * 0.6}px`,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              height: navRow * 0.86,
              borderRadius: navRow * 0.26,
              border: `1px solid ${APP.line}`,
              background: APP.panel,
              display: "flex",
              alignItems: "center",
              gap: pad * 0.4,
              padding: `0 ${pad * 0.4}px`,
              marginBottom: pad * 0.9,
            }}
          >
            <div
              style={{
                width: navRow * 0.3,
                height: navRow * 0.3,
                borderRadius: "50%",
                border: `1.5px solid ${APP.mute}`,
              }}
            />
            <div
              style={{
                fontFamily: uiFontFamily,
                fontSize: navRow * 0.36,
                color: APP.mute,
              }}
            >
              Search
            </div>
          </div>

          {(
            [
              ["Settings", NAV_SETTINGS],
              ["Customize", NAV_CUSTOMIZE],
            ] as const
          ).map(([group, items]) => (
            <div key={group}>
              <div
                style={{
                  fontFamily: uiFontFamily,
                  fontSize: navRow * 0.32,
                  fontWeight: 600,
                  color: APP.mute,
                  margin: `${pad * 0.5}px 0 ${pad * 0.35}px ${pad * 0.3}px`,
                }}
              >
                {group}
              </div>
              {items.map((item) => {
                const selected = item === "Skills";
                return (
                  <div
                    key={item}
                    style={{
                      position: "relative",
                      height: navRow,
                      display: "flex",
                      alignItems: "center",
                      gap: pad * 0.42,
                      padding: `0 ${pad * 0.42}px`,
                      borderRadius: navRow * 0.26,
                      background: selected
                        ? "rgba(0,0,0,0.055)"
                        : "transparent",
                    }}
                  >
                    {selected && active === "skills-nav" ? (
                      <div
                        style={{
                          position: "absolute",
                          inset: -navRow * 0.14,
                          borderRadius: navRow * 0.34,
                          border: `${navRow * 0.1}px solid ${APP.coral}`,
                          boxShadow: `0 0 ${navRow * 0.7}px ${APP.coral}55`,
                          opacity: ringIn,
                        }}
                      />
                    ) : null}
                    <div
                      style={{
                        width: navRow * 0.34,
                        height: navRow * 0.34,
                        borderRadius: navRow * 0.1,
                        background: selected ? APP.ink : APP.mute,
                        opacity: selected ? 0.85 : 0.5,
                      }}
                    />
                    <div
                      style={{
                        fontFamily: uiFontFamily,
                        fontSize: navRow * 0.37,
                        fontWeight: selected ? 600 : 500,
                        color: selected ? APP.ink : APP.inkSoft,
                      }}
                    >
                      {item}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Right panel. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: navW,
            width: DESIGN.width - navW,
            height: DESIGN.height,
            padding: `${pad}px ${pad}px`,
            boxSizing: "border-box",
          }}
        >
          <SkillsHeader
            h={headH}
            count={count}
            local={local}
            at={4}
            ring={active === "tabs" || active === "add" ? active : undefined}
            ringAt={activeAt}
          />

          <div style={{ marginTop: pad * 0.5 }}>
            {sections.map((section) => {
              const headAt = cursor === 0 ? 10 : section.entries[0].at - 6;
              cursor += 1;
              return (
                <div key={section.title}>
                  <SectionHead
                    title={section.title}
                    count={section.entries.length}
                    h={headH * 0.46}
                    local={local}
                    at={headAt}
                  />
                  {section.entries.map((entry) => (
                    <SkillRow
                      key={entry.name}
                      entry={entry}
                      local={local}
                      h={rowH}
                      terse
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom fade, so a list that runs past the modal reads as scrollable
            rather than as a row cut in half. */}
        <div
          style={{
            position: "absolute",
            left: navW,
            right: 0,
            bottom: 0,
            height: DESIGN.height * 0.1,
            background: `linear-gradient(to top, ${APP.panel}, rgba(255,255,255,0))`,
          }}
        />

        {box ? (
          <div
            style={{
              position: "absolute",
              left: box.left,
              top: box.top,
              width: box.w,
              height: box.h,
              borderRadius: 14,
              border: `4px solid ${APP.coral}`,
              boxShadow: `0 0 34px ${APP.coral}55`,
              opacity: ringIn,
              transform: `scale(${interpolate(ringIn, [0, 1], [1.05, 1])})`,
            }}
          />
        ) : null}
      </div>
    </FitBox>
  );
};
