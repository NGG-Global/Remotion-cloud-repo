import React from "react";
import { Composition } from "remotion";
import "./index.css";
import { ClaudeIntro, CLAUDE_INTRO_DURATION } from "./compositions/ClaudeIntro";
import { Explainer, EXPLAINER_DURATION } from "./compositions/Explainer";
import {
  TitleCard,
  titleCardDefaultProps,
  titleCardSchema,
} from "./compositions/TitleCard";
import { Calibration } from "./dev/Calibration";
import { UIKitDemo } from "./dev/UIKitDemo";
import { FORMAT, seconds } from "./theme";

/**
 * The list of renderable videos in this project.
 *
 * Anything registered here shows up in the Studio sidebar and can be rendered
 * by id: `npx remotion render TitleCard out/title-card.mp4`.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ClaudeIntro"
        component={ClaudeIntro}
        durationInFrames={CLAUDE_INTRO_DURATION}
        {...FORMAT}
      />

      <Composition
        id="TitleCard"
        component={TitleCard}
        durationInFrames={seconds(5)}
        schema={titleCardSchema}
        defaultProps={titleCardDefaultProps}
        {...FORMAT}
      />

      <Composition
        id="Calibration"
        component={Calibration}
        durationInFrames={1}
        width={2958}
        height={1766}
        fps={30}
      />

      <Composition
        id="UIKitDemo"
        component={UIKitDemo}
        durationInFrames={240}
        {...FORMAT}
      />

      <Composition
        id="Explainer"
        component={Explainer}
        durationInFrames={EXPLAINER_DURATION}
        {...FORMAT}
      />
    </>
  );
};
