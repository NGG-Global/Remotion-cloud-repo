import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily, uiFontFamily } from "../fonts";
import { APP, Button, Dialog, FitBox } from "./parts/ClaudeUI";
import { TypeOn } from "../ui/TypeOn";

type ProjectCreateProps = {
  readonly width: number;
  readonly height: number;
  readonly delay?: number;
  /** The project's name, typed into the first field. */
  readonly name: string;
  /** What the project is for, typed into the second. */
  readonly goal: string;
  readonly nameAt?: number;
  readonly goalAt?: number;
  /** Frame at which the visibility choice is made. */
  readonly pickAt?: number;
  /** Which option the choice lands on. */
  readonly pick?: "org" | "private";
  /** Frame at which Create project is pressed. Omit to leave the form open. */
  readonly submitAt?: number;
};

/** Composed at this size, then scaled to whatever the scene has room for. */
const DESIGN = { width: 1040, height: 1290 };

/** Characters per second in the two fields. */
const NAME_SPEED = 19;
const GOAL_SPEED = 23;

const OPTIONS = [
  {
    key: "org" as const,
    label: "NGG",
    note: "Everyone in your organization can view and use this project",
  },
  {
    key: "private" as const,
    label: "Private",
    note: "Only invited members can view and use this project",
  },
];

/** The mark beside each choice: an organisation, or a padlock. */
const OptionGlyph: React.FC<{ readonly kind: "org" | "private" }> = ({
  kind,
}) => (
  <svg width={30} height={30} viewBox="0 0 24 24" aria-hidden>
    {kind === "org" ? (
      <g fill="none" stroke={APP.mute} strokeWidth={1.9} strokeLinejoin="round">
        <path d="M4 20V7l6-3v16" />
        <path d="M10 20V10l7 2.5V20" />
        <path d="M3 20h18" strokeLinecap="round" />
      </g>
    ) : (
      <g fill="none" stroke={APP.mute} strokeWidth={1.9} strokeLinejoin="round">
        <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
        <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
      </g>
    )}
  </svg>
);

/** One visibility choice: a radio, its name, and who it lets in. */
const Option: React.FC<{
  readonly kind: "org" | "private";
  readonly label: string;
  readonly note: string;
  readonly on: boolean;
}> = ({ kind, label, note, on }) => (
  <div style={{ display: "flex", gap: 26, alignItems: "flex-start" }}>
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: "50%",
        border: `3px solid ${on ? APP.select : APP.faint}`,
        background: APP.panel,
        boxSizing: "border-box",
        flexShrink: 0,
        marginTop: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: APP.select,
          transform: `scale(${on ? 1 : 0})`,
        }}
      />
    </div>

    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 10,
        }}
      >
        <OptionGlyph kind={kind} />
        <div
          style={{
            fontFamily: uiFontFamily,
            fontSize: 44,
            fontWeight: 600,
            color: APP.ink,
          }}
        >
          {label}
        </div>
      </div>
      <div
        style={{
          fontFamily: uiFontFamily,
          fontSize: 34,
          color: APP.mute,
          lineHeight: 1.3,
          maxWidth: 800,
        }}
      >
        {note}
      </div>
    </div>
  </div>
);

/**
 * The Create-a-project dialog, filled in.
 *
 * What the narration is arguing here is that a project is two answers, not a
 * folder: what you are working on, and what you are trying to achieve. So the
 * two fields are typed rather than shown already filled — the viewer watches
 * the project being defined. The visibility choice is the beat's second half
 * and gets its own move, because picking the organisation rather than yourself
 * is the difference between a private shortcut and something a team shares.
 */
export const ProjectCreate: React.FC<ProjectCreateProps> = ({
  width,
  height,
  delay = 0,
  name,
  goal,
  nameAt = 18,
  goalAt = 70,
  pickAt,
  pick = "private",
  submitAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;

  const picked = pickAt !== undefined && local >= pickAt ? pick : "private";

  const press = submitAt
    ? interpolate(local - submitAt, [0, 6, 16], [0, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  const nameEnd = nameAt + (name.length / NAME_SPEED) * fps;
  const goalEnd = goalAt + (goal.length / GOAL_SPEED) * fps;

  /** The field being typed into carries the interface's focus ring. */
  const focus = (from: number, to: number) =>
    interpolate(local, [from - 4, from, to, to + 10], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const Field: React.FC<{
    readonly label: string;
    readonly h: number;
    readonly ring: number;
    readonly children?: React.ReactNode;
  }> = ({ label, h, ring, children }) => (
    <div style={{ marginBottom: 42 }}>
      <div
        style={{
          fontFamily: uiFontFamily,
          fontSize: 40,
          fontWeight: 600,
          color: APP.ink,
          marginBottom: 16,
        }}
      >
        {label}
      </div>
      <div
        style={{
          height: h,
          borderRadius: 14,
          background: APP.panel,
          border: `2.5px solid ${ring > 0.02 ? APP.select : APP.line}`,
          boxShadow:
            ring > 0.02 ? `0 0 0 ${7 * ring}px ${APP.select}2e` : undefined,
          padding: "0 24px",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "flex-start",
          paddingTop: 20,
          direction: "rtl",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );

  return (
    <FitBox width={width} height={height} design={DESIGN}>
      <Dialog
        width={DESIGN.width}
        height={DESIGN.height}
        title="Create a project"
        delay={delay}
      >
        <Field
          label="What are you working on?"
          h={86}
          ring={focus(nameAt, nameEnd)}
        >
          <TypeOn
            text={name}
            delay={delay + nameAt}
            speed={NAME_SPEED}
            caret={local < nameEnd + 8}
            style={{
              fontFamily,
              fontSize: 42,
              fontWeight: 500,
              color: APP.ink,
              whiteSpace: "nowrap",
            }}
          />
        </Field>

        <Field
          label="What are you trying to achieve?"
          h={168}
          ring={focus(goalAt, goalEnd)}
        >
          <TypeOn
            text={goal}
            delay={delay + goalAt}
            speed={GOAL_SPEED}
            caret={local < goalEnd + 8}
            style={{
              fontFamily,
              fontSize: 38,
              fontWeight: 400,
              color: APP.ink,
              lineHeight: 1.45,
            }}
          />
        </Field>

        <div
          style={{
            fontFamily: uiFontFamily,
            fontSize: 40,
            fontWeight: 600,
            color: APP.ink,
            marginBottom: 28,
          }}
        >
          Visibility
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 34,
            position: "relative",
          }}
        >
          {OPTIONS.map((option) => (
            <div key={option.key} style={{ position: "relative" }}>
              <Option
                kind={option.key}
                label={option.label}
                note={option.note}
                on={picked === option.key}
              />

              {/* Our own ring, once the choice has been made. Coral, so it
                  reads as the video pointing rather than as the interface
                  selecting. Drawn inside the row it belongs to, so it cannot
                  drift when the wording changes the row's height. */}
              {pickAt !== undefined && option.key === pick ? (
                <div
                  style={{
                    position: "absolute",
                    left: -22,
                    right: -22,
                    top: -16,
                    bottom: -16,
                    borderRadius: 18,
                    border: `5px solid ${APP.coral}`,
                    boxShadow: `0 0 34px ${APP.coral}55`,
                    opacity: spring({
                      frame: local - pickAt,
                      fps,
                      config: { damping: 200 },
                    }),
                  }}
                />
              ) : null}
            </div>
          ))}
        </div>

        <div style={{ flex: 1, minHeight: 34 }} />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 22,
          }}
        >
          <Button label="Cancel" h={84} />
          <div style={{ position: "relative" }}>
            <Button label="Create project" h={84} primary />
            {press > 0 ? (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: 110 * (0.5 + press),
                  height: 110 * (0.5 + press),
                  transform: "translate(-50%,-50%)",
                  borderRadius: "50%",
                  border: `5px solid ${APP.coral}`,
                  opacity: 1 - press,
                }}
              />
            ) : null}
          </div>
        </div>
      </Dialog>
    </FitBox>
  );
};
