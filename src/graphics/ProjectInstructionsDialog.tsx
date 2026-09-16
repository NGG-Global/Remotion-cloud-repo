import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily, uiFontFamily } from "../fonts";
import { APP, Button, Dialog, FitBox } from "./parts/ClaudeUI";
import { TypeOn } from "../ui/TypeOn";

type ProjectInstructionsDialogProps = {
  readonly width: number;
  readonly height: number;
  readonly delay?: number;
  /** Project the instructions belong to, named in the dialog's own sentence. */
  readonly project: string;
  /** The instruction lines, typed one after another. */
  readonly lines: readonly { readonly text: string; readonly at: number }[];
  /** Frame at which Save instructions is pressed. */
  readonly saveAt?: number;
};

/** Composed at this size, then scaled to whatever the scene has room for. */
const DESIGN = { width: 1215, height: 810 };

/** Characters per second, matched to the pace of the other typed surfaces. */
const SPEED = 26;

/**
 * The instructions dialog, written into.
 *
 * This is the surface the episode's central claim lives on: everything you
 * would otherwise repeat at the top of every chat, written once. So the lines
 * are typed rather than pre-filled — the viewer sees the repetition being
 * spent once — and the Save button only comes alive when there is something to
 * save, which is what the interface actually does.
 */
export const ProjectInstructionsDialog: React.FC<
  ProjectInstructionsDialogProps
> = ({ width, height, delay = 0, project, lines, saveAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;

  const s = DESIGN.width;

  const started = lines.length > 0 && local >= lines[0].at;

  const press = saveAt
    ? interpolate(local - saveAt, [0, 6, 16], [0, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  const last = lines[lines.length - 1];
  const lastEnd = last ? last.at + (last.text.length / SPEED) * fps : 0;

  return (
    <FitBox width={width} height={height} design={DESIGN}>
      <Dialog
        width={DESIGN.width}
        height={DESIGN.height}
        title="Set project instructions"
        delay={delay}
      >
        <div
          style={{
            fontFamily: uiFontFamily,
            fontSize: s * 0.026,
            lineHeight: 1.5,
            color: APP.mute,
            marginBottom: s * 0.03,
            maxWidth: "94%",
          }}
        >
          Provide Claude with relevant instructions and information for chats
          within{" "}
          <span style={{ fontFamily, direction: "rtl", color: APP.ink }}>
            {project}
          </span>
          . This will work alongside your{" "}
          <span style={{ color: APP.select, textDecoration: "underline" }}>
            profile instructions
          </span>{" "}
          and the selected style in a chat.
        </div>

        <div
          style={{
            flex: 1,
            borderRadius: s * 0.012,
            border: `1.5px solid ${started ? APP.select : APP.line}`,
            boxShadow: started
              ? `0 0 0 ${s * 0.004}px ${APP.select}33`
              : undefined,
            background: APP.panel,
            padding: `${s * 0.024}px ${s * 0.024}px`,
            boxSizing: "border-box",
            direction: "rtl",
            overflow: "hidden",
          }}
        >
          {lines.map((line, i) => (
            <div
              key={i}
              style={{
                fontFamily,
                fontSize: s * 0.03,
                fontWeight: 400,
                lineHeight: 1.6,
                color: APP.ink,
                whiteSpace: "nowrap",
              }}
            >
              <TypeOn
                text={line.text}
                delay={delay + line.at}
                speed={SPEED}
                caret={
                  local >= line.at &&
                  (i === lines.length - 1 || local < lines[i + 1].at)
                }
              />
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: s * 0.028,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: s * 0.016,
          }}
        >
          <Button label="Cancel" h={s * 0.056} />
          <div style={{ position: "relative" }}>
            {/* Disabled until there is something to save — the interface's own
                behaviour, and a clean way to show the work landing. */}
            <Button
              label="Save instructions"
              h={s * 0.056}
              primary
              disabled={local < lastEnd}
            />
            {press > 0 ? (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: s * 0.07 * (0.5 + press),
                  height: s * 0.07 * (0.5 + press),
                  transform: "translate(-50%,-50%)",
                  borderRadius: "50%",
                  border: `${s * 0.0035}px solid ${APP.coral}`,
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
