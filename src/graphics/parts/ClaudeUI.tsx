import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily, uiFontFamily } from "../../fonts";

/**
 * Claude's own light interface, rebuilt rather than screenshotted.
 *
 * The captures this episode was briefed from carry a real account name, a real
 * chat list and a real organisation. Episode 3 set the precedent: where a
 * screen would leak, draw it. Everything the video teaches — the Projects
 * entry, the create dialog, the four panels of a project — is reproduced
 * faithfully; everything it does not teach is reduced to bars, the same
 * treatment `DocSheet` and `OutlookMock` use.
 */
export const APP = {
  /** Page and rail: Claude's warm off-white. */
  canvas: "#faf9f5",
  rail: "#f2f0e9",
  panel: "#ffffff",
  line: "rgba(0,0,0,0.10)",
  lineSoft: "rgba(0,0,0,0.055)",
  ink: "#1f1e1d",
  inkSoft: "rgba(0,0,0,0.62)",
  mute: "rgba(0,0,0,0.40)",
  faint: "rgba(0,0,0,0.14)",
  /**
   * The interface's own selection blue. Deliberately not the video's coral:
   * coral means "look here, we put this ring on it", and a control the product
   * itself has selected has to read differently from one we are pointing at.
   */
  select: "#2b7de9",
  /** Claude's coral, for the product's own marks inside a mockup. */
  coral: "#d97757",
} as const;

/** A run of text, abstracted to a bar. */
export const Bar: React.FC<{
  readonly w: number | string;
  readonly h: number;
  readonly tone?: string;
  readonly opacity?: number;
  readonly style?: React.CSSProperties;
}> = ({ w, h, tone = APP.faint, opacity = 1, style }) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: h / 2,
      background: tone,
      opacity,
      flexShrink: 0,
      ...style,
    }}
  />
);

/** A square glyph tile, standing in for a nav or menu icon. */
export const Tile: React.FC<{
  readonly size: number;
  readonly tone?: string;
  readonly radius?: number;
}> = ({ size, tone = APP.mute, radius }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: radius ?? size * 0.26,
      background: tone,
      opacity: 0.55,
      flexShrink: 0,
    }}
  />
);

/** A pill button. `primary` is the interface's filled black button. */
export const Button: React.FC<{
  readonly label: string;
  readonly h: number;
  readonly primary?: boolean;
  readonly disabled?: boolean;
  readonly rtl?: boolean;
}> = ({ label, h, primary, disabled, rtl }) => (
  <div
    style={{
      height: h,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: `0 ${h * 0.72}px`,
      borderRadius: h * 0.28,
      background: primary ? (disabled ? "#a8a49c" : APP.ink) : APP.panel,
      border: primary ? "none" : `1px solid ${APP.line}`,
      color: primary ? "#fff" : APP.ink,
      fontFamily: rtl ? fontFamily : uiFontFamily,
      fontSize: h * 0.4,
      fontWeight: 600,
      whiteSpace: "nowrap",
      flexShrink: 0,
    }}
  >
    {label}
  </div>
);

/**
 * The left rail, abstracted.
 *
 * Nav labels are printed because the video teaches them; the pinned item, the
 * chat list and the account row are bars, because they are someone's.
 */
export const AppRail: React.FC<{
  readonly width: number;
  readonly height: number;
  /** Nav row to show as selected, by label. */
  readonly active?: string;
  /** A project row under a "Projects" section heading. */
  readonly project?: string;
  readonly appear?: number;
}> = ({ width, height, active, project, appear = 1 }) => {
  const rowH = height * 0.038;
  const pad = width * 0.075;
  const label = width * 0.088;

  const nav = ["New", "Projects", "Artifacts", "Scheduled", "Customize"];

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width,
        height,
        background: APP.rail,
        borderRight: `1px solid ${APP.lineSoft}`,
        padding: `${height * 0.03}px ${pad}px`,
        boxSizing: "border-box",
        opacity: appear,
        overflow: "hidden",
      }}
    >
      {/* Wordmark. The product sets it in a serif; the shape is the point. */}
      <div
        style={{
          fontFamily: "Georgia, serif",
          fontSize: height * 0.042,
          color: APP.ink,
          marginBottom: height * 0.045,
          letterSpacing: "-0.01em",
        }}
      >
        Claude
      </div>

      {nav.map((item) => {
        const on = item === active;
        return (
          <div
            key={item}
            style={{
              display: "flex",
              alignItems: "center",
              gap: pad * 0.55,
              height: rowH,
              marginBottom: height * 0.014,
              padding: `0 ${pad * 0.4}px`,
              marginLeft: -pad * 0.4,
              marginRight: -pad * 0.4,
              borderRadius: rowH * 0.3,
              background: on ? "rgba(0,0,0,0.055)" : "transparent",
            }}
          >
            <Tile size={rowH * 0.62} tone={on ? APP.ink : APP.mute} />
            <div
              style={{
                fontFamily: uiFontFamily,
                fontSize: label,
                fontWeight: on ? 600 : 500,
                color: on ? APP.ink : APP.inkSoft,
              }}
            >
              {item}
            </div>
          </div>
        );
      })}

      {project ? (
        <>
          <div
            style={{
              marginTop: height * 0.035,
              marginBottom: height * 0.014,
              fontFamily: uiFontFamily,
              fontSize: label * 0.86,
              fontWeight: 500,
              color: APP.mute,
            }}
          >
            Projects
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: pad * 0.55,
              height: rowH,
              padding: `0 ${pad * 0.4}px`,
              marginLeft: -pad * 0.4,
              marginRight: -pad * 0.4,
              borderRadius: rowH * 0.3,
              background: "rgba(0,0,0,0.055)",
            }}
          >
            <Tile size={rowH * 0.62} tone={APP.ink} />
            <div
              style={{
                direction: "rtl",
                fontFamily,
                fontSize: label,
                fontWeight: 600,
                color: APP.ink,
                whiteSpace: "nowrap",
              }}
            >
              {project}
            </div>
          </div>
        </>
      ) : null}

      {/* Chat history: someone's, so bars. */}
      <div
        style={{
          marginTop: height * 0.05,
          marginBottom: height * 0.02,
        }}
      >
        <Bar w="52%" h={height * 0.012} tone={APP.mute} opacity={0.45} />
      </div>
      {Array.from({ length: 11 }, (_, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: pad * 0.5,
            height: rowH * 0.82,
          }}
        >
          <div
            style={{
              width: rowH * 0.18,
              height: rowH * 0.18,
              borderRadius: "50%",
              background: i % 4 === 1 ? APP.select : APP.faint,
              flexShrink: 0,
            }}
          />
          <Bar
            w={`${58 + ((i * 13) % 34)}%`}
            h={height * 0.013}
            tone={APP.mute}
            opacity={0.34}
          />
        </div>
      ))}

      {/* Account row. */}
      <div
        style={{
          position: "absolute",
          left: pad,
          right: pad,
          bottom: height * 0.028,
          display: "flex",
          alignItems: "center",
          gap: pad * 0.5,
        }}
      >
        <div
          style={{
            width: rowH * 0.7,
            height: rowH * 0.7,
            borderRadius: "50%",
            background: APP.coral,
            opacity: 0.8,
            flexShrink: 0,
          }}
        />
        <Bar w="42%" h={height * 0.014} tone={APP.mute} opacity={0.4} />
      </div>
    </div>
  );
};

/**
 * The application window: rail on the left, everything else handed to the
 * caller. Sized by the caller so a dialog over it can be drawn at whatever
 * scale reads on a 1080p frame, rather than at the interface's own scale.
 */
export const AppWindow: React.FC<{
  readonly width: number;
  readonly height: number;
  readonly delay?: number;
  /** Dim and soften the window, for when a dialog sits over it. */
  readonly behind?: number;
  readonly active?: string;
  readonly project?: string;
  readonly children?: React.ReactNode;
}> = ({ width, height, delay = 0, behind = 0, active, project, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const open = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
  });

  const railW = width * 0.168;

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        borderRadius: Math.min(20, height * 0.03),
        background: APP.canvas,
        border: `1px solid ${APP.line}`,
        overflow: "hidden",
        opacity: open,
        transform: `scale(${0.96 + open * 0.04})`,
        boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
      }}
    >
      <AppRail
        width={railW}
        height={height}
        active={active}
        project={project}
      />

      <div
        style={{
          position: "absolute",
          top: 0,
          left: railW,
          width: width - railW,
          height,
        }}
      >
        {children}
      </div>

      {behind > 0 ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(20,17,14,0.42)",
            opacity: behind,
          }}
        />
      ) : null}
    </div>
  );
};

/**
 * Draws a fixed-size design at whatever size the scene has room for.
 *
 * Laying a dialog out against the pixels it happens to be given means its
 * contents either overflow the box or shrink past reading size, depending on
 * the scene. Composing at one design size and scaling the whole thing keeps
 * every proportion — and every type size relative to the dialog — identical
 * wherever it is used.
 */
export const FitBox: React.FC<{
  /** Space available. */
  readonly width: number;
  readonly height: number;
  /** Size the children are composed at. */
  readonly design: { readonly width: number; readonly height: number };
  readonly children?: React.ReactNode;
}> = ({ width, height, design, children }) => {
  const scale = Math.min(width / design.width, height / design.height);

  return (
    <div style={{ position: "relative", width, height }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: design.width,
          height: design.height,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * A modal dialog.
 *
 * Drawn at its own scale rather than at the window's, because a dialog
 * reproduced 1:1 inside a window that fits a 1080p frame puts its labels at
 * eight pixels. The structure and the wording are the interface's; the size is
 * the video's.
 */
export const Dialog: React.FC<{
  readonly width: number;
  readonly height: number;
  readonly title: string;
  readonly delay?: number;
  readonly children?: React.ReactNode;
}> = ({ width, height, title, delay = 0, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const open = spring({
    frame: frame - delay,
    fps,
    config: { damping: 26, stiffness: 150 },
  });

  const pad = width * 0.062;
  const titleSize = Math.min(height * 0.056, width * 0.05);

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        borderRadius: width * 0.026,
        background: APP.panel,
        boxShadow: "0 40px 110px rgba(0,0,0,0.55)",
        padding: pad,
        boxSizing: "border-box",
        opacity: open,
        transform: `scale(${0.93 + open * 0.07}) translateY(${interpolate(
          open,
          [0, 1],
          [22, 0],
        )}px)`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: pad * 0.75,
        }}
      >
        <div
          style={{
            fontFamily: uiFontFamily,
            fontSize: titleSize,
            fontWeight: 700,
            color: APP.ink,
            letterSpacing: "-0.015em",
          }}
        >
          {title}
        </div>
        {/* Close cross. */}
        <div
          style={{
            position: "relative",
            width: titleSize * 0.62,
            height: titleSize * 0.62,
          }}
        >
          {[45, -45].map((deg) => (
            <div
              key={deg}
              style={{
                position: "absolute",
                top: "50%",
                left: 0,
                width: "100%",
                height: 2,
                background: APP.mute,
                transform: `rotate(${deg}deg)`,
              }}
            />
          ))}
        </div>
      </div>

      {children}
    </div>
  );
};
