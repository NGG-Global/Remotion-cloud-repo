import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ARCHIVE } from "../archive";
import { Archival } from "../components/Archival";
import { DNAHelix } from "../graphics/DNAHelix";
import {
  Barber,
  Butcher,
  Constable,
  Crowd,
  Doctor,
  GroundLine,
  Lantern,
  Surgeon,
  TopHatMan,
  UnknownHead,
  Walker,
  Woman,
} from "../graphics/Figures";
import { aheadOf, Street3D } from "../graphics/Street3D";
import { Fog } from "../look/Fog";
import { Particles } from "../look/Particles";
import { DOC, easeInOut, easeOut, mix, ramp, seconds } from "../theme";

/**
 * Staged scenes: the moments the record does not picture, played by
 * silhouettes and the three-dimensional street. Each is a pure function of
 * the frame within its beat.
 */

const useLocal = () => useCurrentFrame();

/** Charles Cross on his way to work: the camera follows him down Buck's Row. */
export const StreetWalk: React.FC = () => {
  const f = useLocal();
  const { durationInFrames } = useVideoConfig();
  const t = f / durationInFrames;
  const progress = mix(0.02, 0.12, t);
  return (
    <AbsoluteFill>
      <Street3D
        progress={progress}
        view="eye"
        fog={0.7}
        walker={{ progress: aheadOf(progress, 7 + t * 2), side: -1 }}
      />
      <Fog density={0.35} band="low" blend="screen" />
    </AbsoluteFill>
  );
};

/** Low by the cobbles: something lies at the foot of a gateway, and he goes to it. */
export const StreetShape: React.FC = () => {
  const f = useLocal();
  const { durationInFrames } = useVideoConfig();
  const t = f / durationInFrames;
  const camStart = 0.15;
  const progress = mix(camStart, camStart + 0.04, easeInOut(t));
  const shapeAt = aheadOf(camStart, 7.5);
  const walkerAhead = mix(2.5, 6.2, easeInOut(ramp(f, 0, seconds(9))));
  const shape = easeOut(ramp(f, seconds(1.5), seconds(4)));
  return (
    <AbsoluteFill>
      <Street3D
        progress={progress}
        view="low"
        fog={0.75}
        shape={shape}
        shapeAt={shapeAt}
        walker={{ progress: aheadOf(camStart, walkerAhead), side: -1 }}
      />
      <Fog density={0.4} band="low" blend="screen" />
    </AbsoluteFill>
  );
};

/** A second man joins him, and a constable's lantern comes down the street. */
export const StreetSecondMan: React.FC = () => {
  const f = useLocal();
  const camStart = 0.15;
  const shapeAt = aheadOf(camStart, 7.5);
  const w2 = mix(1.8, 5.6, easeInOut(ramp(f, 0, seconds(4))));
  const constableDist = mix(
    34,
    9,
    easeInOut(ramp(f, seconds(3.5), seconds(9.5))),
  );
  return (
    <AbsoluteFill>
      <Street3D
        progress={camStart}
        view="eye"
        fog={0.7}
        shape={1}
        shapeAt={shapeAt}
        walker={{ progress: aheadOf(camStart, 6.2), side: -1 }}
        walker2={{ progress: aheadOf(camStart, w2), side: 1 }}
        constable={
          f > seconds(3.5)
            ? { progress: aheadOf(camStart, constableDist) }
            : null
        }
      />
      <Fog density={0.4} band="low" blend="screen" />
    </AbsoluteFill>
  );
};

/** The figure everyone would later look for, at the far end of the street, not there yet. */
export const StreetMyth: React.FC<{ readonly fadeOutAt?: number }> = ({
  fadeOutAt,
}) => {
  const f = useLocal();
  const { durationInFrames } = useVideoConfig();
  const t = f / durationInFrames;
  const progress = mix(0.3, 0.38, t);
  const appear = easeOut(ramp(f, seconds(0.5), seconds(2.5)));
  const gone =
    fadeOutAt === undefined
      ? 0
      : easeInOut(ramp(f, fadeOutAt, fadeOutAt + seconds(2)));
  return (
    <AbsoluteFill>
      <Street3D
        progress={progress}
        view="eye"
        fog={0.75}
        topHat={appear * (1 - gone)}
      />
      <Fog density={0.45} band="low" blend="screen" />
    </AbsoluteFill>
  );
};

/** A dark shape the fog almost forms and then refuses to. */
export const ShadowNotYet: React.FC = () => {
  const f = useLocal();
  const form = easeInOut(ramp(f, seconds(2), seconds(6)));
  const erase = easeInOut(ramp(f, seconds(8), seconds(11.5)));
  const o = 0.55 * form * (1 - erase);
  return (
    <AbsoluteFill>
      <Lantern
        x={1250}
        y={520}
        radius={700}
        intensity={0.35 * (0.6 + 0.4 * form)}
        flicker={0.5}
      />
      <GroundLine y={900} opacity={0.5} />
      <div style={{ filter: `blur(${4 + erase * 20}px)` }}>
        <TopHatMan x={960} y={900} height={560} opacity={o} />
      </div>
      <Fog density={0.5 + erase * 0.4} band="low" blend="screen" />
    </AbsoluteFill>
  );
};

/** An empty pool of lamplight: nobody there, no name yet. */
export const EmptyLamp: React.FC = () => (
  <AbsoluteFill>
    <Lantern x={960} y={380} radius={760} intensity={0.45} flicker={0.6} />
    <GroundLine y={900} opacity={0.6} />
    <Particles kind="dust" count={30} opacity={0.3} />
  </AbsoluteFill>
);

/** Doctor, surgeon, butcher: the three guesses, then all three taken by the fog. */
export const AnatomyGuesses: React.FC<{
  readonly at: readonly [number, number, number];
  readonly dissolveAt: number;
}> = ({ at, dissolveAt }) => {
  const f = useLocal();
  const gone = easeInOut(ramp(f, dissolveAt, dissolveAt + seconds(3)));
  const figures = [Doctor, Surgeon, Butcher];
  const xs = [560, 960, 1360];
  return (
    <AbsoluteFill>
      <Lantern
        x={960}
        y={330}
        radius={820}
        intensity={0.4 * (1 - gone * 0.6)}
        flicker={0.4}
      />
      <GroundLine y={900} opacity={0.55} />
      <div style={{ filter: `blur(${gone * 22}px)`, opacity: 1 - gone }}>
        {figures.map((F, i) => {
          const o = easeOut(ramp(f, at[i], at[i] + 22));
          return (
            <F
              key={i}
              x={xs[i]}
              y={900 + (1 - o) * 30}
              height={520}
              opacity={o}
              facing={i === 2 ? -1 : 1}
            />
          );
        })}
      </div>
      <Fog density={0.35 + gone * 0.5} band="low" blend="screen" />
    </AbsoluteFill>
  );
};

/** A constable's lantern searching a yard wall. */
export const LanternSearch: React.FC = () => {
  const f = useLocal();
  const sweep = Math.sin(f * 0.035) * 14;
  return (
    <AbsoluteFill>
      <Archival
        image={ARCHIVE.hanbury}
        from={{ x: 0.5, y: 0.7, zoom: 1.4 }}
        to={{ x: 0.4, y: 0.6, zoom: 1.9 }}
        fill="cover"
        tone="cold"
        brightness={0.35}
      />
      <GroundLine y={1000} opacity={0.4} />
      <Constable
        x={420}
        y={1010}
        height={620}
        facing={1}
        beam={1}
        beamAngle={10 + sweep}
      />
      <Fog density={0.45} band="low" blend="screen" />
    </AbsoluteFill>
  );
};

/** The yard at Berner Street: a cart's lamp arrives, a figure slips away into the dark. */
export const Interrupted: React.FC = () => {
  const f = useLocal();
  const cartT = easeInOut(ramp(f, seconds(1), seconds(6)));
  const flee = easeInOut(ramp(f, seconds(2.5), seconds(8)));
  const fleeX = mix(980, 1780, flee);
  return (
    <AbsoluteFill>
      <Archival
        image={ARCHIVE.bernerStreet}
        from={{ x: 0.6, y: 0.6, zoom: 1.5 }}
        to={{ x: 0.3, y: 0.55, zoom: 1.7 }}
        fill="cover"
        tone="cold"
        brightness={0.22}
      />
      <Lantern
        x={mix(-300, 380, cartT)}
        y={620}
        radius={mix(300, 900, cartT)}
        intensity={0.55 * cartT}
        flicker={0.6}
      />
      <GroundLine y={960} opacity={0.5} />
      <Walker
        x={mix(-200, 300, cartT)}
        y={970}
        height={500}
        phase={(f * 0.02) % 1}
        carry="lantern"
        hat="cap"
        opacity={cartT}
      />
      <div style={{ filter: `blur(${2 + flee * 6}px)` }}>
        <TopHatMan
          x={fleeX}
          y={960}
          height={540}
          facing={-1}
          step={0.5 + 0.5 * Math.sin(f * 0.3)}
          opacity={1 - flee * 0.9}
        />
      </div>
      <Fog density={0.55} band="low" blend="screen" />
    </AbsoluteFill>
  );
};

/** House to house: a constable walks the row of doors, and his lamp dims at the end. */
export const DoorToDoor: React.FC<{ readonly dimAt: number }> = ({ dimAt }) => {
  const f = useLocal();
  const dim = easeInOut(ramp(f, dimAt, dimAt + seconds(3)));
  const x = mix(300, 1500, easeInOut(ramp(f, 0, seconds(9))));
  return (
    <AbsoluteFill>
      <Archival
        image={ARCHIVE.dorsetStreet}
        from={{ x: 0.6, y: 0.5, zoom: 1.2 }}
        to={{ x: 0.5, y: 0.55, zoom: 1.6 }}
        fill="cover"
        tone="cold"
        brightness={0.35 * (1 - dim * 0.8)}
      />
      <GroundLine y={1000} opacity={0.4} />
      <div style={{ opacity: 1 - dim }}>
        <Constable
          x={x}
          y={1010}
          height={600}
          phase={(f * 0.018) % 1}
          beam={0.9}
          beamAngle={16}
        />
      </div>
      <Fog density={0.5 + dim * 0.3} band="low" blend="screen" />
    </AbsoluteFill>
  );
};

/** A crowd arriving out of the fog, slowly crossing the frame. */
export const CrowdScene: React.FC<{
  readonly pan?: number;
  readonly count?: number;
  readonly highlight?: boolean;
}> = ({ pan = 160, count = 26, highlight = false }) => {
  const f = useLocal();
  const { durationInFrames } = useVideoConfig();
  const t = f / durationInFrames;
  const spot = highlight ? easeInOut(ramp(f, seconds(3), seconds(6))) : 0;
  return (
    <AbsoluteFill>
      <Lantern x={960} y={300} radius={900} intensity={0.35} flicker={0.4} />
      <GroundLine y={940} opacity={0.55} />
      <div style={{ transform: `translateX(${mix(-pan, pan, t)}px)` }}>
        <Crowd
          x={960}
          y={940}
          width={2100}
          height={300}
          count={count}
          seed={4}
          sway={1}
        />
      </div>
      {highlight ? (
        <>
          <Lantern
            x={1180}
            y={640}
            radius={260}
            intensity={0.55 * spot}
            color={DOC.gasHot}
            flicker={0.3}
          />
          <Walker
            x={1180 + mix(-pan, pan, t)}
            y={945}
            height={310}
            phase={0}
            hat="cap"
            opacity={1}
          />
        </>
      ) : null}
      <Fog density={0.55} band="low" blend="screen" />
    </AbsoluteFill>
  );
};

/** Women at work and on their way: the lives the label erased. */
export const WomenScene: React.FC = () => {
  const f = useLocal();
  return (
    <AbsoluteFill>
      <Lantern x={700} y={360} radius={800} intensity={0.4} flicker={0.4} />
      <GroundLine y={920} opacity={0.55} />
      <Woman
        x={520}
        y={920}
        height={520}
        phase={(f * 0.012) % 1}
        shawl
        bonnet
        opacity={easeOut(ramp(f, 0, 30))}
      />
      <Woman
        x={960}
        y={920}
        height={540}
        shawl
        facing={-1}
        opacity={easeOut(ramp(f, 20, 50))}
      />
      <Woman
        x={1400}
        y={920}
        height={500}
        phase={(f * 0.015) % 1}
        bonnet
        facing={-1}
        opacity={easeOut(ramp(f, 40, 70))}
      />
      <Crowd
        x={1450}
        y={935}
        width={500}
        height={200}
        count={4}
        seed={9}
        sway={0.5}
        opacity={0.6 * easeOut(ramp(f, 60, 90))}
      />
      <Fog density={0.45} band="low" blend="screen" />
    </AbsoluteFill>
  );
};

/** The shadow growing over the five faces. Children are the portraits. */
export const ShadowOver: React.FC<{ readonly children: React.ReactNode }> = ({
  children,
}) => {
  const f = useLocal();
  const grow = easeInOut(ramp(f, seconds(1), seconds(5)));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: 1 - grow * 0.75 }}>
        {children}
      </AbsoluteFill>
      <div style={{ filter: "blur(6px)" }}>
        <TopHatMan
          x={960}
          y={1080 + 200 * (1 - grow)}
          height={mix(500, 1250, grow)}
          opacity={0.92 * grow}
        />
      </div>
      <Fog density={0.4 + grow * 0.3} band="low" blend="screen" />
    </AbsoluteFill>
  );
};

/** The figure dispersing: he was there, and then the fog is all there is. */
export const Vanish: React.FC = () => {
  const f = useLocal();
  const gone = easeInOut(ramp(f, seconds(2.5), seconds(7)));
  return (
    <AbsoluteFill>
      <Lantern
        x={960}
        y={420}
        radius={800}
        intensity={0.4 * (1 - gone * 0.7)}
        flicker={0.6}
      />
      <GroundLine y={920} opacity={0.5 * (1 - gone)} />
      <div
        style={{
          filter: `blur(${gone * 26}px)`,
          transform: `scale(${1 + gone * 0.2})`,
          transformOrigin: "50% 100%",
        }}
      >
        <TopHatMan x={960} y={920} height={640} opacity={1 - gone} />
      </div>
      <Particles kind="dust" count={50} opacity={0.35} />
      <Fog density={0.5 + gone * 0.45} band="full" blend="screen" />
    </AbsoluteFill>
  );
};

/** What you see when you imagine him: a face with nothing in it. */
export const ImagineHead: React.FC = () => {
  const f = useLocal();
  const o = easeOut(ramp(f, seconds(0.6), seconds(2)));
  const q = easeInOut(ramp(f, seconds(2.4), seconds(4.4)));
  return (
    <AbsoluteFill>
      <Lantern x={960} y={520} radius={700} intensity={0.3} flicker={0.4} />
      <UnknownHead x={960} y={800} size={620} opacity={o} question={q} />
      <Fog density={0.55} band="low" blend="screen" />
    </AbsoluteFill>
  );
};

/** The myth assembled: body, then hat, then cloak, then the bag, then the fog around him. */
export const MythAssembly: React.FC<{
  readonly hatAt: number;
  readonly cloakAt: number;
  readonly bagAt: number;
  readonly fogAt: number;
}> = ({ hatAt, cloakAt, bagAt, fogAt }) => {
  const f = useLocal();
  const body = easeOut(ramp(f, seconds(0.4), seconds(1.6)));
  const hat = easeOut(ramp(f, hatAt, hatAt + 24));
  const cloak = easeOut(ramp(f, cloakAt, cloakAt + 24));
  const bag = easeOut(ramp(f, bagAt, bagAt + 24));
  const fog = easeInOut(ramp(f, fogAt, fogAt + seconds(3)));
  return (
    <AbsoluteFill>
      <Lantern x={960} y={380} radius={820} intensity={0.45} flicker={0.5} />
      <GroundLine y={920} opacity={0.55} />
      <TopHatMan
        x={960}
        y={920}
        height={700}
        parts={{ body, hat, cloak, bag }}
      />
      <Fog density={0.3 + fog * 0.6} band="low" blend="screen" />
    </AbsoluteFill>
  );
};

/** The silhouette everyone recognises, filling the frame. */
export const Recognisable: React.FC = () => {
  const f = useLocal();
  const push = 1 + f * 0.0008;
  return (
    <AbsoluteFill>
      <Lantern x={960} y={300} radius={900} intensity={0.5} flicker={0.5} />
      <GroundLine y={1040} opacity={0.5} />
      <div style={{ transform: `scale(${push})`, transformOrigin: "50% 100%" }}>
        <TopHatMan x={960} y={1060} height={1040} step={0.3} />
      </div>
      <Fog density={0.5} band="low" blend="screen" />
    </AbsoluteFill>
  );
};

/** The real man erased while the character stays. */
export const ManErased: React.FC<{ readonly eraseAt: number }> = ({
  eraseAt,
}) => {
  const f = useLocal();
  const erase = easeInOut(ramp(f, eraseAt, eraseAt + seconds(3)));
  const enter = easeOut(ramp(f, 0, 30));
  return (
    <AbsoluteFill>
      <Lantern x={1280} y={420} radius={760} intensity={0.4} flicker={0.4} />
      <GroundLine y={920} opacity={0.5} />
      <div
        style={{
          filter: `blur(${erase * 24}px)`,
          opacity: enter * (1 - erase),
        }}
      >
        <UnknownHead x={620} y={860} size={520} />
      </div>
      <TopHatMan x={1280} y={920} height={640} opacity={enter} />
      <Fog density={0.45 + erase * 0.2} band="low" blend="screen" />
    </AbsoluteFill>
  );
};

/** The helix, assembling, then doubted. */
export const HelixScene: React.FC<{
  readonly build?: { from: number; to: number };
  readonly doubt?: { from: number; to: number; max: number };
}> = ({ build, doubt }) => {
  const f = useLocal();
  const b = build ? easeInOut(ramp(f, build.from, build.to)) : 1;
  const d = doubt ? doubt.max * easeInOut(ramp(f, doubt.from, doubt.to)) : 0;
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(50% 60% at 50% 45%, rgba(150,190,230,0.10) 0%, transparent 65%)",
        }}
      />
      <DNAHelix turn={f / 170} build={b} doubt={d} />
    </AbsoluteFill>
  );
};

/** The Kosminski card beside a barber at work. */
export const BarberBeside: React.FC<{ readonly children: React.ReactNode }> = ({
  children,
}) => {
  const f = useLocal();
  const o = easeOut(ramp(f, seconds(1.5), seconds(2.5)));
  return (
    <AbsoluteFill>
      <Lantern x={560} y={420} radius={620} intensity={0.35} flicker={0.4} />
      <GroundLine y={940} opacity={0.5} />
      <Barber x={560} y={940} height={560} opacity={o} />
      {children}
      <Fog density={0.35} band="low" blend="screen" />
    </AbsoluteFill>
  );
};
