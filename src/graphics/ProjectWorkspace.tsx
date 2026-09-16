import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily, uiFontFamily } from "../fonts";
import { APP, AppWindow, Tile } from "./parts/ClaudeUI";

/** What the ring can land on: the whole column, or one panel in it. */
export type WorkspacePart =
  | "panels"
  | "instructions"
  | "memory"
  | "context"
  | "scheduled";

type ProjectWorkspaceProps = {
  readonly width: number;
  readonly height: number;
  readonly delay?: number;
  /** The project's name, in the breadcrumb and the heading. */
  readonly name: string;
  /** Ring moves to whichever part was last named. */
  readonly ring?: readonly {
    readonly at: number;
    readonly part: WorkspacePart;
  }[];
};

/** The four things a project holds, in the order the panel lists them. */
const PANELS = [
  {
    key: "instructions",
    title: "Instructions",
    note: "Add instructions to tailor Claude's responses",
  },
  {
    key: "memory",
    title: "Memory",
    note: "Project memory will show here after a few chats.",
    badge: "Only you",
  },
  {
    key: "context",
    title: "Context",
    note: "Add PDFs, documents, or other text to reference in this project.",
    drop: true,
  },
  {
    key: "scheduled",
    title: "Scheduled",
    note: "Set up recurring tasks for this project.",
  },
] as const;

/**
 * A project, open.
 *
 * The establishing shot for the whole episode: a conversation surface in the
 * middle, and a column on the right holding what makes it a project rather
 * than a chat. Drawn rather than screenshotted — the capture this was built
 * from carries an account name and a real chat list, and neither belongs in a
 * shared file. The ring travels to whichever part the narration is on, so one
 * graphic can hold a run of beats without cutting away from the page.
 */
export const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({
  width,
  height,
  delay = 0,
  name,
  ring = [],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;

  // The window keeps the interface's own proportions and takes whichever
  // dimension runs out first.
  const winW = Math.min(width, height * 1.674);
  const winH = winW / 1.674;

  const railW = winW * 0.168;
  const bodyW = winW - railW;
  const panelW = bodyW * 0.276;
  const mainW = bodyW - panelW;

  const active = ring.reduce<WorkspacePart | undefined>(
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

  /** Where the ring sits, in window coordinates. */
  const ringBox = (): {
    left: number;
    top: number;
    w: number;
    h: number;
  } | null => {
    const panelTop = winH * 0.16;
    const panelH = winH * 0.19;
    const index = PANELS.findIndex((p) => p.key === active);

    if (index >= 0) {
      return {
        left: railW + mainW + panelW * 0.03,
        top: panelTop + index * panelH * 1.02,
        w: panelW * 0.94,
        h: panelH * 0.93,
      };
    }
    if (active === "panels") {
      return {
        left: railW + mainW + panelW * 0.02,
        top: winH * 0.145,
        w: panelW * 0.96,
        h: winH * 0.79,
      };
    }
    return null;
  };

  const box = ringBox();

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
      <div style={{ position: "relative", width: winW, height: winH }}>
        <AppWindow
          width={winW}
          height={winH}
          delay={delay}
          active="Projects"
          project={name}
        >
          {/* Breadcrumb. */}
          <div
            style={{
              position: "absolute",
              top: winH * 0.022,
              left: bodyW * 0.055,
              display: "flex",
              alignItems: "center",
              gap: winW * 0.008,
              fontFamily: uiFontFamily,
              fontSize: winH * 0.023,
              color: APP.mute,
            }}
          >
            <span>Projects</span>
            <span>/</span>
            <span style={{ fontFamily, direction: "rtl" }}>{name}</span>
          </div>

          {/* Heading, and what it is. */}
          <div
            style={{
              position: "absolute",
              top: winH * 0.068,
              left: bodyW * 0.055,
              right: bodyW * 0.055,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  direction: "rtl",
                  fontFamily,
                  fontSize: winH * 0.045,
                  fontWeight: 700,
                  color: APP.ink,
                }}
              >
                {name}
              </div>
              <div
                style={{
                  marginTop: winH * 0.012,
                  fontFamily: uiFontFamily,
                  fontSize: winH * 0.021,
                  color: APP.mute,
                }}
              >
                Created by you · Private
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: winW * 0.008,
              }}
            >
              <Tile size={winH * 0.028} />
              <div
                style={{
                  height: winH * 0.042,
                  padding: `0 ${winW * 0.012}px`,
                  borderRadius: winH * 0.012,
                  border: `1px solid ${APP.line}`,
                  background: APP.panel,
                  display: "flex",
                  alignItems: "center",
                  fontFamily: uiFontFamily,
                  fontSize: winH * 0.022,
                  fontWeight: 600,
                  color: APP.ink,
                }}
              >
                Share
              </div>
              <Tile size={winH * 0.024} />
            </div>
          </div>

          {/* Composer. Same furniture as the home screen, inside the project. */}
          <div
            style={{
              position: "absolute",
              top: winH * 0.205,
              left: mainW * 0.07,
              width: mainW * 0.86,
              height: winH * 0.13,
              borderRadius: winH * 0.026,
              background: APP.panel,
              border: `1px solid ${APP.line}`,
              boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
              padding: `${winH * 0.024}px ${mainW * 0.03}px`,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                fontFamily: uiFontFamily,
                fontSize: winH * 0.026,
                color: APP.mute,
              }}
            >
              How can I help you today?
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: winW * 0.01,
              }}
            >
              <Tile size={winH * 0.026} />
              <div
                style={{
                  display: "flex",
                  gap: 2,
                  padding: 3,
                  borderRadius: winH * 0.016,
                  background: "rgba(0,0,0,0.045)",
                }}
              >
                {["Chat", "Cowork"].map((mode, i) => (
                  <div
                    key={mode}
                    style={{
                      padding: `${winH * 0.005}px ${winW * 0.009}px`,
                      borderRadius: winH * 0.013,
                      background: i === 0 ? APP.panel : "transparent",
                      fontFamily: uiFontFamily,
                      fontSize: winH * 0.021,
                      fontWeight: i === 0 ? 600 : 500,
                      color: i === 0 ? APP.ink : APP.mute,
                    }}
                  >
                    {mode}
                  </div>
                ))}
              </div>
              <div style={{ flex: 1 }} />
              <div
                style={{
                  fontFamily: uiFontFamily,
                  fontSize: winH * 0.021,
                  fontWeight: 600,
                  color: APP.inkSoft,
                }}
              >
                Opus 5
              </div>
              <Tile size={winH * 0.024} />
            </div>
          </div>

          {/* Tab strip. */}
          <div
            style={{
              position: "absolute",
              top: winH * 0.365,
              left: mainW * 0.07,
              width: mainW * 0.86,
              display: "flex",
              alignItems: "center",
              gap: winW * 0.014,
            }}
          >
            {["Chats and tasks", "Activity"].map((tab, i) => (
              <div
                key={tab}
                style={{
                  padding: `${winH * 0.008}px ${winW * 0.011}px`,
                  borderRadius: winH * 0.016,
                  background: i === 0 ? "rgba(0,0,0,0.055)" : "transparent",
                  fontFamily: uiFontFamily,
                  fontSize: winH * 0.022,
                  fontWeight: i === 0 ? 600 : 500,
                  color: i === 0 ? APP.ink : APP.mute,
                }}
              >
                {tab}
              </div>
            ))}
          </div>

          {/* What a project promises, printed by the interface itself. */}
          <div
            style={{
              position: "absolute",
              top: winH * 0.5,
              left: mainW * 0.09,
              width: mainW * 0.82,
              textAlign: "center",
              fontFamily: uiFontFamily,
              fontSize: winH * 0.024,
              lineHeight: 1.5,
              color: APP.mute,
              opacity: interpolate(local, [12, 26], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            Claude references the same knowledge every time you talk to it in
            this project.
          </div>

          {/* The right-hand column: what makes it a project. */}
          <div
            style={{
              position: "absolute",
              top: winH * 0.155,
              left: mainW,
              width: panelW,
              height: winH * 0.78,
              paddingRight: panelW * 0.05,
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: winH * 0.022,
                border: `1px solid ${APP.line}`,
                background: APP.panel,
                overflow: "hidden",
              }}
            >
              {PANELS.map((panel, i) => (
                <div
                  key={panel.key}
                  style={{
                    height: "25%",
                    borderBottom:
                      i < PANELS.length - 1
                        ? `1px solid ${APP.lineSoft}`
                        : "none",
                    padding: `${winH * 0.018}px ${panelW * 0.07}px`,
                    boxSizing: "border-box",
                    opacity: interpolate(local - 10 - i * 4, [0, 12], [0, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    }),
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: winH * 0.01,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: uiFontFamily,
                        fontSize: winH * 0.026,
                        fontWeight: 700,
                        color: APP.ink,
                      }}
                    >
                      {panel.title}
                    </div>
                    {"badge" in panel && panel.badge ? (
                      <div
                        style={{
                          padding: `${winH * 0.004}px ${panelW * 0.045}px`,
                          borderRadius: 999,
                          background: "rgba(0,0,0,0.05)",
                          fontFamily: uiFontFamily,
                          fontSize: winH * 0.017,
                          fontWeight: 600,
                          color: APP.mute,
                        }}
                      >
                        {panel.badge}
                      </div>
                    ) : (
                      <div
                        style={{
                          position: "relative",
                          width: winH * 0.022,
                          height: winH * 0.022,
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: 0,
                            width: "100%",
                            height: 2,
                            background: APP.mute,
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            left: "50%",
                            top: 0,
                            height: "100%",
                            width: 2,
                            background: APP.mute,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {"drop" in panel && panel.drop ? (
                    <div
                      style={{
                        height: "62%",
                        borderRadius: winH * 0.016,
                        border: `1.5px dashed ${APP.faint}`,
                        background: "rgba(0,0,0,0.018)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: `0 ${panelW * 0.08}px`,
                        boxSizing: "border-box",
                        textAlign: "center",
                        fontFamily: uiFontFamily,
                        fontSize: winH * 0.018,
                        lineHeight: 1.4,
                        color: APP.mute,
                      }}
                    >
                      {panel.note}
                    </div>
                  ) : (
                    <div
                      style={{
                        fontFamily: uiFontFamily,
                        fontSize: winH * 0.019,
                        lineHeight: 1.45,
                        color: APP.mute,
                      }}
                    >
                      {panel.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </AppWindow>

        {/* The ring, in window coordinates, over the whole thing. */}
        {box ? (
          <div
            style={{
              position: "absolute",
              left: box.left,
              top: box.top,
              width: box.w,
              height: box.h,
              borderRadius: winH * 0.022,
              border: `${Math.max(3, winH * 0.005)}px solid ${APP.coral}`,
              boxShadow: `0 0 ${winH * 0.04}px ${APP.coral}66`,
              opacity: ringIn,
              transform: `scale(${interpolate(ringIn, [0, 1], [1.04, 1])})`,
            }}
          />
        ) : null}
      </div>
    </div>
  );
};
