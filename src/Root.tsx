import React from "react";
import { Composition } from "remotion";
import "./index.css";
import {
  ClaudeConnect,
  CLAUDE_CONNECT_DURATION,
} from "./compositions/ClaudeConnect";
import {
  ClaudeContext,
  CLAUDE_CONTEXT_DURATION,
} from "./compositions/ClaudeContext";
import { ClaudeFiles, CLAUDE_FILES_DURATION } from "./compositions/ClaudeFiles";
import { ClaudeIntro, CLAUDE_INTRO_DURATION } from "./compositions/ClaudeIntro";
import { ClaudeReach, CLAUDE_REACH_DURATION } from "./compositions/ClaudeReach";
import { ClaudeSetup, CLAUDE_SETUP_DURATION } from "./compositions/ClaudeSetup";
import { Explainer, EXPLAINER_DURATION } from "./compositions/Explainer";
import {
  TitleCard,
  titleCardDefaultProps,
  titleCardSchema,
} from "./compositions/TitleCard";
import {
  Calibration,
  calculateCalibrationMetadata,
  calibrationSchema,
} from "./dev/Calibration";
import {
  calculateRegionCheckMetadata,
  RegionCheck,
  regionCheckSchema,
} from "./dev/RegionCheck";
import { UIKitDemo } from "./dev/UIKitDemo";
import {
  StarReveal,
  StarRevealGallery,
  STAR_REVEAL_DURATION,
  STAR_REVEAL_FPS,
  STAR_REVEAL_GALLERY_DURATION,
  starRevealDefaultProps,
  starRevealSchema,
} from "./compositions/StarReveal";
import { JACK_THE_RIPPER_DURATION, JackTheRipper } from "./doc/JackTheRipper";
import { GACY_DURATION, GacyDocumentary } from "./gacy/GacyDocumentary";
import { RigSheet } from "./gacy/dev/RigSheet";
import { BORDEN_DURATION, BordenDocumentary } from "./borden/BordenDocumentary";
import { BordenRigSheet } from "./borden/dev/RigSheet";
import { BordenSetTest } from "./borden/dev/SetTest";
import { SetTest } from "./gacy/dev/SetTest";
import { TinyTempoAd, TINY_TEMPO_AD_DURATION } from "./tiny-tempo/TinyTempoAd";
import {
  Trailer,
  TRAILER_DURATION,
  TRAILER_FPS,
  TRAILER_HEIGHT,
  TRAILER_WIDTH,
} from "./tiny-tempo-trailer/Trailer";
import {
  TrailerVertical,
  VERTICAL_DURATION,
  VERTICAL_HEIGHT,
  VERTICAL_WIDTH,
} from "./tiny-tempo-trailer/TrailerVertical";
import {
  Teaser,
  TEASER_DURATION,
  TEASER_HEIGHT,
  TEASER_WIDTH,
} from "./tiny-tempo-trailer/Teaser";
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
        id="ClaudeSetup"
        component={ClaudeSetup}
        durationInFrames={CLAUDE_SETUP_DURATION}
        {...FORMAT}
      />

      <Composition
        id="ClaudeConnect"
        component={ClaudeConnect}
        durationInFrames={CLAUDE_CONNECT_DURATION}
        {...FORMAT}
      />

      <Composition
        id="ClaudeContext"
        component={ClaudeContext}
        durationInFrames={CLAUDE_CONTEXT_DURATION}
        {...FORMAT}
      />

      <Composition
        id="ClaudeFiles"
        component={ClaudeFiles}
        durationInFrames={CLAUDE_FILES_DURATION}
        {...FORMAT}
      />

      <Composition
        id="ClaudeReach"
        component={ClaudeReach}
        durationInFrames={CLAUDE_REACH_DURATION}
        {...FORMAT}
      />

      <Composition
        id="JackTheRipper"
        component={JackTheRipper}
        durationInFrames={JACK_THE_RIPPER_DURATION}
        {...FORMAT}
      />

      <Composition
        id="GacyDocumentary"
        component={GacyDocumentary}
        durationInFrames={GACY_DURATION}
        {...FORMAT}
      />

      <Composition
        id="GacySetTest"
        component={SetTest}
        durationInFrames={40}
        {...FORMAT}
      />

      <Composition
        id="LizzieBorden"
        component={BordenDocumentary}
        durationInFrames={BORDEN_DURATION}
        {...FORMAT}
      />

      <Composition
        id="BordenSetTest"
        component={BordenSetTest}
        durationInFrames={19}
        {...FORMAT}
      />

      <Composition
        id="BordenRigSheet"
        component={BordenRigSheet}
        durationInFrames={90}
        {...FORMAT}
      />

      <Composition
        id="GacyRigSheet"
        component={RigSheet}
        durationInFrames={90}
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
        fps={30}
        width={2958}
        height={1766}
        schema={calibrationSchema}
        defaultProps={{ screen: "home" as const, gridColor: "#ff0050" }}
        calculateMetadata={calculateCalibrationMetadata}
      />

      <Composition
        id="RegionCheck"
        component={RegionCheck}
        durationInFrames={1}
        fps={30}
        width={2958}
        height={1766}
        schema={regionCheckSchema}
        defaultProps={{ screen: "home" as const, boxColor: "#ff0050" }}
        calculateMetadata={calculateRegionCheckMetadata}
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

      <Composition
        id="TinyTempoAd"
        component={TinyTempoAd}
        durationInFrames={TINY_TEMPO_AD_DURATION}
        {...FORMAT}
      />

      <Composition
        id="TinyTempoTrailer"
        component={Trailer}
        durationInFrames={TRAILER_DURATION}
        fps={TRAILER_FPS}
        width={TRAILER_WIDTH}
        height={TRAILER_HEIGHT}
      />

      <Composition
        id="TinyTempoTrailerVertical"
        component={TrailerVertical}
        durationInFrames={VERTICAL_DURATION}
        fps={TRAILER_FPS}
        width={VERTICAL_WIDTH}
        height={VERTICAL_HEIGHT}
      />

      <Composition
        id="TinyTempoTeaser"
        component={Teaser}
        durationInFrames={TEASER_DURATION}
        fps={TRAILER_FPS}
        width={TEASER_WIDTH}
        height={TEASER_HEIGHT}
      />

      <Composition
        id="StarReveal"
        component={StarReveal}
        durationInFrames={STAR_REVEAL_DURATION}
        fps={STAR_REVEAL_FPS}
        width={1920}
        height={1080}
        schema={starRevealSchema}
        defaultProps={starRevealDefaultProps}
      />

      <Composition
        id="StarRevealPortrait"
        component={StarReveal}
        durationInFrames={STAR_REVEAL_DURATION}
        fps={STAR_REVEAL_FPS}
        width={720}
        height={1280}
        schema={starRevealSchema}
        defaultProps={starRevealDefaultProps}
      />

      <Composition
        id="StarRevealGallery"
        component={StarRevealGallery}
        durationInFrames={STAR_REVEAL_GALLERY_DURATION}
        fps={STAR_REVEAL_FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
