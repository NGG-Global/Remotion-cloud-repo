import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { entrances, exits, movement } from "../animation/presets";
import { ASSETS } from "../assets/registry";
import { ASSET_PLAYGROUND_DURATION } from "../assets/playground-frames";
import { Animation } from "../components/assets/Animation";
import { Background } from "../components/assets/Background";
import { Character } from "../components/assets/Character";
import { Prop } from "../components/assets/Prop";
import { RiveAsset } from "../components/assets/RiveAsset";
import { uiFontFamily } from "../fonts";

export { ASSET_PLAYGROUND_DURATION };

const PAGE = 90;

/**
 * Developer composition. Each page holds one part of the library so a still
 * at a known frame shows that part. Not a delivered video.
 */
export const AssetPlayground: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: "#14110e",
        color: "#f7f3ec",
        fontFamily: uiFontFamily,
      }}
    >
      <Sequence durationInFrames={PAGE} name="Characters">
        <CharactersPage />
      </Sequence>
      <Sequence from={PAGE} durationInFrames={PAGE} name="Backgrounds">
        <BackgroundsPage />
      </Sequence>
      <Sequence from={PAGE * 2} durationInFrames={PAGE} name="Props">
        <PropsPage />
      </Sequence>
      <Sequence from={PAGE * 3} durationInFrames={PAGE} name="Animations">
        <AnimationsPage />
      </Sequence>
      <Sequence from={PAGE * 4} durationInFrames={PAGE} name="Rive">
        <RivePage />
      </Sequence>
      <Sequence from={PAGE * 5} durationInFrames={PAGE} name="Presets">
        <PresetsPage />
      </Sequence>
    </AbsoluteFill>
  );
};

const actionAt = <T extends readonly [string, ...string[]]>(
  actions: T,
  frame: number,
): T[number] => {
  const index = Math.floor(frame / 8) % actions.length;
  const action = actions[index] ?? actions[0];
  return action;
};

const Header: React.FC<{ readonly title: string; readonly detail: string }> = ({
  title,
  detail,
}) => (
  <div style={{ position: "absolute", top: 36, left: 48, right: 48 }}>
    <div style={{ fontSize: 42, fontWeight: 700 }}>{title}</div>
    <div style={{ fontSize: 24, color: "#a79e92", marginTop: 8 }}>{detail}</div>
  </div>
);

const CharactersPage: React.FC = () => {
  const frame = useCurrentFrame();
  const generic = ASSETS.characters.genericMan;
  const officer = ASSETS.characters.policeOfficer;
  const genericAction = actionAt(generic.actions, frame);
  const officerAction = actionAt(officer.actions, frame);

  return (
    <AbsoluteFill>
      <Header
        title="Characters"
        detail={`${generic.id}: ${genericAction}    ${officer.id}: ${officerAction}`}
      />
      <Character
        character="generic-male"
        action={genericAction}
        x={560}
        y={980}
        scale={1.15}
      />
      <Character
        character="police-officer"
        action={officerAction}
        direction="left"
        x={1360}
        y={980}
        scale={1.15}
      />
      <div
        style={{
          position: "absolute",
          left: 48,
          bottom: 36,
          fontSize: 22,
          color: "#d7cfc3",
        }}
      >
        actions: {generic.actions.join(", ")}
      </div>
    </AbsoluteFill>
  );
};

const BackgroundsPage: React.FC = () => {
  const items = Object.values(ASSETS.backgrounds);
  return (
    <AbsoluteFill>
      <Header
        title="Backgrounds"
        detail="Local files. cover inside each cell."
      />
      {items.map((item, index) => {
        const column = index % 2;
        const row = Math.floor(index / 2);
        return (
          <div
            key={item.id}
            style={{
              position: "absolute",
              left: 48 + column * 940,
              top: 150 + row * 450,
              width: 900,
              height: 420,
              overflow: "hidden",
              background: "#000",
            }}
          >
            <Background asset={item.id} scaleMode="cover" />
            <div
              style={{
                position: "absolute",
                left: 16,
                bottom: 16,
                fontSize: 28,
                fontWeight: 700,
                background: "rgba(0,0,0,0.55)",
                padding: "6px 10px",
              }}
            >
              {item.id}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const PropsPage: React.FC = () => {
  return (
    <AbsoluteFill>
      <Header title="Props" detail="Anchor is the bottom center." />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 860,
          height: 4,
          background: "#3a342c",
        }}
      />
      <Prop asset="wooden-table" x={620} y={860} />
      <Prop asset="telephone" x={620} y={560} />
      <Prop asset="telephone" x={1280} y={860} scale={1.2} />
    </AbsoluteFill>
  );
};

const AnimationsPage: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#1b2420" }}>
      <Header
        title="Animations"
        detail="fog (tiles) · dust-particles (Lottie) · door-opening (shapes)"
      />
      <Animation asset="dust-particles" />
      <Animation asset="fog" opacity={0.85} />
      <Animation asset="door-opening" x={1500} y={980} />
    </AbsoluteFill>
  );
};

const RivePage: React.FC = () => {
  const vehicle = ASSETS.rive.vehicles;
  return (
    <AbsoluteFill>
      <Header
        title="Rive"
        detail={`${vehicle.id} / ${vehicle.artboard} / linear animations: ${vehicle.animations.join(", ")}`}
      />
      <RiveAsset
        asset="vehicles"
        animation="idle"
        x={700}
        y={620}
        scale={1.3}
      />
      <div
        style={{
          position: "absolute",
          right: 64,
          top: 220,
          width: 560,
          fontSize: 28,
          lineHeight: 1.4,
        }}
      >
        <div>state machines (not auto-played):</div>
        <div>{vehicle.stateMachines.join(", ")}</div>
        <div style={{ marginTop: 24, color: "#a79e92" }}>
          license: {vehicle.license.name}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const PresetsPage: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = entrances.fade(frame, { durationInFrames: 20 });
  const slide = entrances.slideLeft(frame, { delay: 8, durationInFrames: 20 });
  const scale = entrances.scaleIn(frame, { delay: 16, durationInFrames: 20 });
  const exit = exits.fade(frame, { startFrame: 50, durationInFrames: 20 });
  const bob = movement.bob(frame, { amplitude: 16, period: 20 });
  const floatY = movement.float(frame, { amplitude: 18, period: 40 });

  const card = (
    label: string,
    style: React.CSSProperties,
    top: number,
    left: number,
  ) => (
    <div
      key={label}
      style={{
        position: "absolute",
        top,
        left,
        width: 360,
        height: 140,
        background: "#2b2520",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 32,
        fontWeight: 700,
        ...style,
      }}
    >
      {label}
    </div>
  );

  return (
    <AbsoluteFill>
      <Header
        title="Animation presets"
        detail="entrances, exits, movement — frame driven"
      />
      {card("entrances.fade", fade, 180, 80)}
      {card("entrances.slideLeft", slide, 180, 520)}
      {card("entrances.scaleIn", scale, 180, 960)}
      {card("exits.fade", exit, 180, 1400)}
      {card("movement.bob", { transform: `translateY(${bob.y}px)` }, 420, 80)}
      {card(
        "movement.float",
        { transform: `translateY(${floatY.y}px)` },
        420,
        520,
      )}
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 640,
          fontSize: 28,
          color: "#d7cfc3",
        }}
      >
        camera presets: static, slowPushIn, slowPullOut, panLeft, panRight,
        tiltUp, tiltDown, handheldSubtle
      </div>
    </AbsoluteFill>
  );
};
