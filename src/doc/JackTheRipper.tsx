import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { ARCHIVE } from "./archive";
import { Archival } from "./components/Archival";
import { Beat, beatSeconds } from "./components/Beat";
import { Scene } from "./components/Scene";
import { Series } from "./components/Series";
import "./fonts";
import { Doors } from "./graphics/Doors";
import { Bust, EvidenceBoard, SuspectCard } from "./graphics/Evidence";
import {
  DearBossLetter,
  FromHellLetter,
  LettersPile,
  Parcel,
  SIGNATURE,
} from "./graphics/Letters";
import {
  BigMark,
  Headlines,
  InkDrop,
  JournalNotice,
  Strike,
} from "./graphics/Marks";
import { MillersCourt } from "./graphics/MillersCourt";
import { CircledDetail, HeadlineSlam, PressFlood } from "./graphics/Newspapers";
import { NoTools } from "./graphics/NoTools";
import { PocketWatch } from "./graphics/PocketWatch";
import { FiveWomen, Portrait, type Woman } from "./graphics/Portraits";
import { Shawl } from "./graphics/Shawl";
import { Unknowns } from "./graphics/Unknowns";
import { Film } from "./look/Film";
import { Particles } from "./look/Particles";
import {
  WhitechapelMap,
  siteFraming,
  sitesFraming,
} from "./graphics/WhitechapelMap";
import { ChapterMark } from "./scenes/ChapterMark";
import {
  AnatomyGuesses,
  BarberBeside,
  CrowdScene,
  DoorToDoor,
  EmptyLamp,
  HelixScene,
  ImagineHead,
  Interrupted,
  LanternSearch,
  ManErased,
  MythAssembly,
  Recognisable,
  ShadowNotYet,
  ShadowOver,
  StreetMyth,
  StreetSecondMan,
  StreetShape,
  StreetWalk,
  Vanish,
  WomenScene,
} from "./scenes/Staged";
import { Outro } from "./scenes/Outro";
import { Sting } from "./scenes/Sting";
import { NARRATION_SECONDS, TL } from "./beats";
import { DOC, seconds } from "./theme";

/** The voice track, plus a breath of black at the end. */
export const JACK_THE_RIPPER_DURATION = seconds(NARRATION_SECONDS + 2);

const SERIES = "מאחורי הסיוט";

/** The canonical five, in order. */
const FIVE = ["nichols", "chapman", "stride", "eddowes", "kelly"] as const;

/** The five women, in the order the narration names them. */
const WOMEN: readonly Woman[] = [
  { name: "מרי אן ניקולס", image: ARCHIVE.nichols, focus: { x: 0.5, y: 0.5 } },
  { name: "אנני צ'פמן", image: ARCHIVE.chapman, focus: { x: 0.5, y: 0.42 } },
  { name: "אליזבת סטרייד", image: ARCHIVE.stride, focus: { x: 0.5, y: 0.3 } },
  { name: "קתרין אדווס", bust: "long" },
  { name: "מרי ג'יין קלי", bust: "long" },
];

/** Black, held. Used as a hard cut for the beats that need the floor to drop. */
const Black: React.FC<{ readonly fog?: number }> = ({ fog = 0 }) => (
  <Scene fog={fog} fogBand="low" flicker={0} grain={0.06} vignette={0.9} />
);

/** An archival still that drains of colour and focus as the narration undercuts it. */
const Drain: React.FC<{
  readonly children: (t: number) => React.ReactNode;
  readonly from: number;
  readonly to: number;
}> = ({ children, from, to }) => {
  const frame = useCurrentFrame();
  const t = Math.min(1, Math.max(0, (frame - from) / Math.max(1, to - from)));
  return <>{children(t)}</>;
};

/**
 * "Behind the Nightmare: Jack the Ripper" — a fourteen-minute documentary
 * episode cut to a Hebrew narration.
 *
 * The picture is archival where the record exists (Commons, 1888-1902),
 * staged where it does not (silhouettes, a three-dimensional street, the
 * map), and never explicit: no wound, no body, no crime-scene photograph.
 * Type is kept to chapter marks, years, and the five women's names.
 */
export const JackTheRipper: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: DOC.black }}>
      <Audio src={staticFile("audio/jack-narration.mp3")} />

      {/* ------------------------------------------------------------ cold open */}
      <Beat id="sting" fadeIn={0}>
        <Sting series={SERIES} episode="ג'ק המרטש" />
      </Beat>

      <Beat id="clock">
        <Scene fog={0.55} fogBand="low" flicker={0.3}>
          <PocketWatch
            hour={3}
            minute={40}
            caption="31 · VIII · 1888"
            captionAt={50}
          />
        </Scene>
      </Beat>

      <Beat id="cross-walks">
        <Scene fog={0} flicker={0.4} vignette={0.9}>
          <StreetWalk />
        </Scene>
      </Beat>

      <Beat id="shape-on-ground" through="not-a-tarp">
        <Scene fog={0} flicker={0.4} vignette={0.9}>
          <StreetShape />
        </Scene>
      </Beat>

      <Beat id="second-man">
        <Scene fog={0} flicker={0.4} vignette={0.9}>
          <StreetSecondMan />
        </Scene>
      </Beat>

      <Beat id="polly">
        <Scene fog={0.35} fogBand="low" flicker={0.2}>
          <Series
            total={beatSeconds("polly")}
            shots={[
              {
                at: 0,
                node: (
                  <Portrait
                    image={ARCHIVE.nichols}
                    focus={{ x: 0.5, y: 0.5 }}
                    width={520}
                    height={640}
                  />
                ),
              },
              {
                at: 4.6,
                node: (
                  <Archival
                    image={ARCHIVE.famousCrimes}
                    from={{ x: 0.5, y: 0.55, zoom: 1.4 }}
                    to={{ x: 0.5, y: 0.7, zoom: 1.7 }}
                    tone="print"
                  />
                ),
              },
            ]}
          />
        </Scene>
      </Beat>

      <Beat id="no-one-yet">
        <Scene fog={0.3} flicker={0.3}>
          <ShadowNotYet />
        </Scene>
      </Beat>

      <Beat id="not-exist-yet">
        <Scene fog={0.4} fogBand="low" flicker={0.5}>
          <EmptyLamp />
        </Scene>
      </Beat>

      <Beat id="unknowns">
        <Scene fog={0.45} flicker={0.25}>
          <Unknowns
            at={[0, seconds(9.4), seconds(12.0), seconds(15.8)]}
            hold={seconds(2.6)}
          />
        </Scene>
      </Beat>

      <Beat id="all-we-know">
        <Scene fog={0.25} fogBand="high" flicker={0.25}>
          <WhitechapelMap
            from={sitesFraming(FIVE, 1.0)}
            to={sitesFraming(FIVE, 1.08)}
            pins={FIVE.map((site, i) => ({
              site,
              at: seconds(5.2 + i * 0.75),
            }))}
          />
        </Scene>
      </Beat>

      <Beat id="it-stopped" fadeIn={0}>
        <Black />
      </Beat>

      <Beat id="title" fadeIn={seconds(1)}>
        <Sting series={SERIES} episode="ג'ק המרטש" grand />
      </Beat>

      {/* ------------------------------------------------------------ part one */}
      <Beat id="ch1">
        <ChapterMark index={1} title="וייטצ'אפל" />
      </Beat>

      <Beat id="where">
        <Scene fog={0.25} fogBand="high" flicker={0.15}>
          <Archival
            image={ARCHIVE.boothLondon}
            from={{ x: 0.42, y: 0.5, zoom: 1.0 }}
            to={{ x: 0.62, y: 0.52, zoom: 2.2 }}
            tone="sepia"
            brightness={0.65}
          />
        </Scene>
      </Beat>

      <Beat id="empire">
        <Scene fog={0.3} fogBand="low" flicker={0.2}>
          <Series
            total={beatSeconds("empire")}
            shots={[
              {
                at: 0,
                node: (
                  <Archival
                    image={ARCHIVE.parliament}
                    from={{ x: 0.5, y: 0.45, zoom: 1.05 }}
                    to={{ x: 0.55, y: 0.4, zoom: 1.3 }}
                    tone="sepia"
                    desaturate={0.7}
                    brightness={0.75}
                  />
                ),
              },
              {
                at: 6,
                node: (
                  <Archival
                    image={ARCHIVE.doreLudgate}
                    from={{ x: 0.5, y: 0.7, zoom: 1.1 }}
                    to={{ x: 0.5, y: 0.3, zoom: 1.5 }}
                    tone="print"
                  />
                ),
              },
            ]}
          />
        </Scene>
      </Beat>

      <Beat id="other-reality">
        <Scene fog={0.5} fogBand="low" flicker={0.3}>
          <Archival
            image={ARCHIVE.doreWentworth}
            from={{ x: 0.5, y: 0.6, zoom: 1.05 }}
            to={{ x: 0.45, y: 0.5, zoom: 1.5 }}
            tone="print"
            brightness={0.7}
          />
        </Scene>
      </Beat>

      <Beat id="crowded">
        <Scene fog={0.4} fogBand="low" flicker={0.3}>
          <Archival
            image={ARCHIVE.dorsetStreet}
            from={{ x: 0.45, y: 0.6, zoom: 1.1 }}
            to={{ x: 0.35, y: 0.62, zoom: 1.5 }}
            tone="sepia"
            brightness={0.7}
          />
        </Scene>
      </Beat>

      <Beat id="lodging">
        <Scene fog={0.4} fogBand="low" flicker={0.3}>
          <Series
            total={beatSeconds("lodging")}
            shots={[
              {
                at: 0,
                node: (
                  <Archival
                    image={ARCHIVE.ilnOutcasts}
                    from={{ x: 0.5, y: 0.6, zoom: 1.05 }}
                    to={{ x: 0.3, y: 0.6, zoom: 1.5 }}
                    tone="print"
                    brightness={0.7}
                  />
                ),
              },
              {
                at: 6,
                node: (
                  <Archival
                    image={ARCHIVE.whitechapel1890}
                    from={{ x: 0.5, y: 0.55, zoom: 1.0 }}
                    to={{ x: 0.5, y: 0.7, zoom: 1.25 }}
                    tone="sepia"
                    brightness={0.7}
                  />
                ),
              },
            ]}
          />
        </Scene>
      </Beat>

      <Beat id="immigration">
        <Scene fog={0.3} fogBand="low" flicker={0.35}>
          <CrowdScene pan={220} count={30} />
        </Scene>
      </Beat>

      <Beat id="detail">
        <Scene fog={0.45} fogBand="low" flicker={0.25}>
          <FiveWomen women={WOMEN} at={[0, 8, 16, 24, 32]} captions={false} />
        </Scene>
      </Beat>

      <Beat id="labelled">
        <Scene fog={0.3} fogBand="low" flicker={0.25}>
          <Drain from={seconds(0.6)} to={seconds(2.6)}>
            {(t) => (
              <>
                <AbsoluteFill style={{ opacity: 0.55 * t }}>
                  <PressFlood speed={1.6} dim={0.85} />
                </AbsoluteFill>
                <AbsoluteFill
                  style={{
                    opacity: 1 - 0.65 * t,
                    filter: `grayscale(1) blur(${t * 3}px)`,
                  }}
                >
                  <FiveWomen
                    women={WOMEN}
                    at={[0, 0, 0, 0, 0]}
                    captions={false}
                  />
                </AbsoluteFill>
              </>
            )}
          </Drain>
        </Scene>
      </Beat>

      <Beat id="complex">
        <Scene fog={0.3} fogBand="low" flicker={0.25}>
          <Drain from={seconds(0.3)} to={seconds(3)}>
            {(t) => (
              <>
                <AbsoluteFill style={{ opacity: 0.55 * (1 - t) }}>
                  <PressFlood speed={0.5} dim={0.85} />
                </AbsoluteFill>
                <AbsoluteFill
                  style={{
                    opacity: 0.35 + 0.65 * t,
                    filter: `blur(${(1 - t) * 3}px)`,
                  }}
                >
                  <FiveWomen
                    women={WOMEN}
                    at={[0, 0, 0, 0, 0]}
                    captions={false}
                  />
                </AbsoluteFill>
              </>
            )}
          </Drain>
        </Scene>
      </Beat>

      <Beat id="who-they-were">
        <Scene fog={0.25} fogBand="low" flicker={0.35}>
          <WomenScene />
        </Scene>
      </Beat>

      <Beat id="his-story-not-theirs">
        <Scene fog={0.3} flicker={0.3}>
          <ShadowOver>
            <FiveWomen women={WOMEN} at={[0, 0, 0, 0, 0]} captions={false} />
          </ShadowOver>
        </Scene>
      </Beat>

      {/* ------------------------------------------------------------ part two */}
      <Beat id="ch2">
        <ChapterMark index={2} title="לפני שהיה ג'ק" />
      </Beat>

      <Beat id="not-first">
        <Scene fog={0.25} fogBand="high" flicker={0.25}>
          <WhitechapelMap
            from={siteFraming("nichols", 3.0)}
            to={sitesFraming(FIVE, 1.0)}
            pins={[{ site: "nichols", at: 0 }]}
          />
        </Scene>
      </Beat>

      <Beat id="eleven" through="canonical-five">
        <Scene fog={0.25} fogBand="high" flicker={0.25}>
          <WhitechapelMap
            from={sitesFraming(FIVE, 1.0)}
            to={sitesFraming(FIVE, 1.06)}
            eleven={{
              start: seconds(5.4),
              highlightAt: seconds(
                TL.at("canonical-five") - TL.at("eleven") + 0.4,
              ),
            }}
          />
        </Scene>
      </Beat>

      <Beat id="eight-days">
        <Scene fog={0.4} fogBand="low" flicker={0.25}>
          <Portrait
            image={ARCHIVE.nichols}
            focus={{ x: 0.5, y: 0.5 }}
            x={1180}
            y={540}
            width={400}
            height={520}
          />
          <Portrait
            image={ARCHIVE.chapman}
            focus={{ x: 0.5, y: 0.42 }}
            x={740}
            y={540}
            width={400}
            height={520}
            delay={seconds(3.6)}
          />
        </Scene>
      </Beat>

      <Beat id="hanbury">
        <Scene fog={0.45} fogBand="low" flicker={0.3}>
          <Series
            total={beatSeconds("hanbury")}
            shots={[
              {
                at: 0,
                node: (
                  <Archival
                    image={ARCHIVE.hanbury29}
                    from={{ x: 0.5, y: 0.45, zoom: 1.05 }}
                    to={{ x: 0.45, y: 0.6, zoom: 1.35 }}
                    tone="cold"
                    brightness={0.6}
                  />
                ),
              },
              {
                at: 6.2,
                node: (
                  <Archival
                    image={ARCHIVE.ipnChapman}
                    from={{ x: 0.5, y: 0.35, zoom: 1.6 }}
                    to={{ x: 0.55, y: 0.45, zoom: 2.0 }}
                    tone="print"
                    brightness={0.7}
                  />
                ),
              },
            ]}
          />
        </Scene>
      </Beat>

      <Beat id="worse">
        <Scene fog={0.5} flicker={0.35}>
          <Archival
            image={ARCHIVE.pennySep8}
            from={{ x: 0.5, y: 0.62, zoom: 1.3 }}
            to={{ x: 0.5, y: 0.68, zoom: 1.6 }}
            tone="cold"
            brightness={0.55}
          />
          <InkDrop at={seconds(2.5)} x={1100} y={640} size={170} />
        </Scene>
      </Beat>

      <Beat id="stayed">
        <Scene fog={0.2} fogBand="low" flicker={0.45}>
          <LanternSearch />
        </Scene>
      </Beat>

      <Beat id="anatomy" through="no-logic">
        <Scene fog={0.25} flicker={0.35}>
          <AnatomyGuesses
            at={[seconds(1.6), seconds(2.9), seconds(4.1)]}
            dissolveAt={seconds(TL.at("no-logic") - TL.at("anatomy") + 1.5)}
          />
        </Scene>
      </Beat>

      <Beat id="press-smells-story" fadeIn={0}>
        <Scene fog={0} flicker={0.2} scratches>
          <HeadlineSlam
            pages={[ARCHIVE.ipnSep15, ARCHIVE.ipnSep22, ARCHIVE.pennySep8]}
            interval={seconds(1.7)}
            focus={{ x: 0.5, y: 0.12 }}
            zoom={1.05}
          />
        </Scene>
      </Beat>

      {/* ---------------------------------------------------------- part three */}
      <Beat id="ch3">
        <ChapterMark index={3} title="מישהו נותן למפלצת שם" />
      </Beat>

      <Beat id="dear-boss" through="signature">
        <Scene fog={0.25} fogBand="low" flicker={0.45} scratches>
          <DearBossLetter
            signatureAt={seconds(12.9)}
            underlineAt={seconds(15.5)}
          />
        </Scene>
      </Beat>

      <Beat id="born-in-a-letter">
        <Scene fog={0.35} fogBand="low" flicker={0.3}>
          <Series
            total={beatSeconds("born-in-a-letter")}
            dissolve={6}
            shots={[
              {
                at: 0,
                node: (
                  <Archival
                    image={ARCHIVE.bucksRow}
                    from={{ x: 0.5, y: 0.5, zoom: 1.3 }}
                    to={{ x: 0.5, y: 0.45, zoom: 1.4 }}
                    tone="cold"
                    brightness={0.45}
                  />
                ),
              },
              {
                at: 2.1,
                node: (
                  <Archival
                    image={ARCHIVE.policeNotice}
                    from={{ x: 0.5, y: 0.3, zoom: 1.2 }}
                    to={{ x: 0.5, y: 0.35, zoom: 1.35 }}
                    tone="print"
                    brightness={0.6}
                  />
                ),
              },
              {
                at: 4.2,
                node: (
                  <Archival
                    image={ARCHIVE.dearBoss}
                    from={{ x: SIGNATURE.x, y: SIGNATURE.y, zoom: 2.0 }}
                    to={{ x: SIGNATURE.x, y: SIGNATURE.y, zoom: 2.2 }}
                    tone="none"
                    desaturate={0.1}
                    brightness={0.7}
                  />
                ),
              },
            ]}
          />
        </Scene>
      </Beat>

      <Beat id="cannot-prove">
        <Scene fog={0.4} flicker={0.3}>
          <Drain from={seconds(0.5)} to={seconds(5)}>
            {(t) => (
              <Archival
                image={ARCHIVE.dearBoss}
                from={{ x: 0.5, y: 0.4, zoom: 1.5 }}
                to={{ x: 0.5, y: 0.45, zoom: 1.6 }}
                tone="none"
                desaturate={0.1 + 0.85 * t}
                brightness={0.7 - 0.35 * t}
                blur={t * 6}
              />
            )}
          </Drain>
        </Scene>
      </Beat>

      <Beat id="hundreds-of-letters" fadeIn={8}>
        <Scene fog={0.2} fogBand="low" flicker={0.3}>
          <LettersPile span={seconds(11)} count={80} />
        </Scene>
      </Beat>

      <Beat id="journalist">
        <Scene fog={0.35} fogBand="low" flicker={0.3}>
          <Archival
            image={ARCHIVE.ripperPuck}
            from={{ x: 0.5, y: 0.6, zoom: 1.2 }}
            to={{ x: 0.5, y: 0.35, zoom: 1.6 }}
            tone="print"
            brightness={0.7}
          />
        </Scene>
      </Beat>

      <Beat id="made-by-media">
        <Scene fog={0.2} flicker={0.25} scratches>
          <PressFlood speed={1} dim={0.45} />
        </Scene>
      </Beat>

      <Beat id="too-good" fadeIn={0}>
        <Scene fog={0} flicker={0.2} scratches>
          <HeadlineSlam
            pages={[ARCHIVE.ipnOct13, ARCHIVE.ipnNov3, ARCHIVE.ipnNov24]}
            interval={seconds(1.8)}
            focus={{ x: 0.5, y: 0.1 }}
            zoom={1.1}
          />
        </Scene>
      </Beat>

      {/* ----------------------------------------------------------- part four */}
      <Beat id="ch4">
        <ChapterMark index={4} title="ליל הרציחות הכפול" />
      </Beat>

      <Beat id="three-days-later">
        <Scene fog={0.35} fogBand="high" flicker={0.4}>
          <WhitechapelMap
            from={sitesFraming(FIVE, 1.0)}
            to={siteFraming("stride", 2.4)}
            night={0.6}
          />
          <Particles kind="rain" count={120} opacity={0.3} color="#b9c4d2" />
        </Scene>
      </Beat>

      <Beat id="stride">
        <Scene fog={0.5} flicker={0.4}>
          <Series
            total={beatSeconds("stride")}
            shots={[
              {
                at: 0,
                node: (
                  <Archival
                    image={ARCHIVE.dutfieldsYard}
                    from={{ x: 0.5, y: 0.5, zoom: 1.05 }}
                    to={{ x: 0.35, y: 0.6, zoom: 1.45 }}
                    tone="cold"
                    brightness={0.5}
                  />
                ),
              },
              {
                at: 3.6,
                node: (
                  <Archival
                    image={ARCHIVE.pennyBernerStreet}
                    from={{ x: 0.5, y: 0.5, zoom: 1.1 }}
                    to={{ x: 0.6, y: 0.6, zoom: 1.4 }}
                    tone="cold"
                    brightness={0.55}
                  />
                ),
              },
            ]}
          />
        </Scene>
      </Beat>

      <Beat id="interrupted">
        <Scene fog={0.25} flicker={0.45}>
          <Interrupted />
        </Scene>
      </Beat>

      <Beat id="eddowes">
        <Scene fog={0.3} fogBand="high" flicker={0.35}>
          <WhitechapelMap
            from={sitesFraming(["stride", "eddowes"], 1.25)}
            to={sitesFraming(["stride", "eddowes"], 1.4)}
            night={0.5}
            pins={[
              { site: "stride", at: 0 },
              { site: "eddowes", at: seconds(7.4) },
            ]}
            route={{
              from: "stride",
              to: "eddowes",
              start: seconds(1.8),
              end: seconds(7.2),
            }}
          />
        </Scene>
      </Beat>

      <Beat id="organ">
        <Scene fog={0.5} flicker={0.35}>
          <InkDrop at={seconds(0.8)} size={260} />
        </Scene>
      </Beat>

      <Beat id="double-event">
        <Scene fog={0.3} fogBand="high" flicker={0.35}>
          <WhitechapelMap
            from={sitesFraming(["stride", "eddowes"], 1.4)}
            to={sitesFraming(["stride", "eddowes"], 1.3)}
            night={0.5}
            pins={[
              { site: "stride", at: -60 },
              { site: "eddowes", at: -60 },
            ]}
            route={{ from: "stride", to: "eddowes", start: -100, end: -50 }}
          />
        </Scene>
      </Beat>

      <Beat id="vigilance">
        <Scene fog={0.35} fogBand="low" flicker={0.3}>
          <Series
            total={beatSeconds("vigilance")}
            shots={[
              {
                at: 0,
                node: (
                  <Archival
                    image={ARCHIVE.vigilanceCommittee}
                    from={{ x: 0.4, y: 0.4, zoom: 1.2 }}
                    to={{ x: 0.35, y: 0.35, zoom: 1.5 }}
                    tone="print"
                    brightness={0.7}
                  />
                ),
              },
              {
                at: 4.4,
                node: (
                  <Archival
                    image={ARCHIVE.suspiciousCharacter}
                    from={{ x: 0.5, y: 0.5, zoom: 1.05 }}
                    to={{ x: 0.35, y: 0.45, zoom: 1.4 }}
                    tone="print"
                    brightness={0.7}
                  />
                ),
              },
              {
                at: 8.6,
                node: (
                  <Archival
                    image={ARCHIVE.horribleLondon}
                    from={{ x: 0.5, y: 0.3, zoom: 1.2 }}
                    to={{ x: 0.5, y: 0.45, zoom: 1.5 }}
                    tone="print"
                    brightness={0.7}
                  />
                ),
              },
            ]}
          />
        </Scene>
      </Beat>

      <Beat id="punch" through="blind-game">
        <Scene fog={0.25} fogBand="low" flicker={0.3} scratches>
          <CircledDetail
            image={ARCHIVE.blindMansBuff}
            focus={{ x: 0.5, y: 0.23 }}
            zoom={1.45}
            circleAt={seconds(4.2)}
            radius={150}
          />
        </Scene>
      </Beat>

      <Beat id="year-1888">
        <Scene fog={0.5} flicker={0.35}>
          <BigMark text="1888" size={340} delay={10} />
        </Scene>
      </Beat>

      <Beat id="no-tools">
        <Scene fog={0.4} fogBand="low" flicker={0.3}>
          <Series
            total={beatSeconds("no-tools")}
            shots={[
              {
                at: 0,
                node: (
                  <Archival
                    image={ARCHIVE.pcSmith}
                    from={{ x: 0.5, y: 0.4, zoom: 1.0 }}
                    to={{ x: 0.5, y: 0.35, zoom: 1.2 }}
                    tone="sepia"
                    brightness={0.6}
                  />
                ),
              },
              {
                at: 6.4,
                node: <NoTools at={[0, seconds(3.9), seconds(5.9)]} />,
              },
            ]}
          />
        </Scene>
      </Beat>

      <Beat id="door-to-door" through="limited">
        <Scene fog={0.2} fogBand="low" flicker={0.45}>
          <DoorToDoor
            dimAt={seconds(TL.at("limited") - TL.at("door-to-door") + 0.5)}
          />
        </Scene>
      </Beat>

      {/* ----------------------------------------------------------- part five */}
      <Beat id="ch5">
        <ChapterMark index={5} title="מהגיהינום" />
      </Beat>

      <Beat id="parcel">
        <Scene fog={0.3} fogBand="low" flicker={0.4}>
          <Series
            total={beatSeconds("parcel")}
            shots={[
              {
                at: 0,
                node: (
                  <Portrait
                    image={ARCHIVE.lusk}
                    focus={{ x: 0.5, y: 0.3 }}
                    width={460}
                    height={600}
                    shape="arch"
                  />
                ),
              },
              {
                at: 5.2,
                node: <Parcel openAt={seconds(3.0)} letterAt={seconds(6.5)} />,
              },
            ]}
          />
        </Scene>
      </Beat>

      <Beat id="from-hell">
        <Scene fog={0.25} flicker={0.45} scratches>
          <FromHellLetter wordsAt={seconds(0.8)} />
        </Scene>
      </Beat>

      <Beat id="spare-you">
        <Scene fog={0.45} flicker={0.4}>
          <Drain from={seconds(1)} to={seconds(6)}>
            {(t) => (
              <Archival
                image={ARCHIVE.fromHell}
                from={{ x: 0.5, y: 0.5, zoom: 1.6 }}
                to={{ x: 0.5, y: 0.65, zoom: 1.8 }}
                tone="none"
                desaturate={0.2 + 0.6 * t}
                brightness={0.6 - 0.3 * t}
                blur={t * 12}
              />
            )}
          </Drain>
        </Scene>
      </Beat>

      <Beat id="kidney-missing">
        <Scene fog={0.3} fogBand="high" flicker={0.35}>
          <WhitechapelMap
            from={siteFraming("eddowes", 2.4)}
            to={siteFraming("eddowes", 3.0)}
            night={0.4}
            pins={[{ site: "eddowes", at: seconds(1.6) }]}
          />
        </Scene>
      </Beat>

      <Beat id="macabre-hoax" fadeIn={8}>
        <Scene fog={0.25} fogBand="low" flicker={0.3}>
          <LettersPile span={seconds(6)} count={50} />
        </Scene>
      </Beat>

      <Beat id="most-disturbing">
        <Scene fog={0.35} flicker={0.5} scratches>
          <Archival
            image={ARCHIVE.fromHell}
            from={{ x: 0.5, y: 0.12, zoom: 2.4 }}
            to={{ x: 0.5, y: 0.12, zoom: 2.9 }}
            tone="none"
            desaturate={0.1}
            brightness={0.65}
            contrast={1.25}
          />
        </Scene>
      </Beat>

      {/* ------------------------------------------------------------ part six */}
      <Beat id="ch6">
        <ChapterMark index={6} title="מרי ג'יין קלי" />
      </Beat>

      <Beat id="outdoors-until-now">
        <Scene fog={0.55} fogBand="low" flicker={0.4}>
          <Series
            total={beatSeconds("outdoors-until-now")}
            dissolve={8}
            shots={[
              {
                at: 0,
                node: (
                  <Archival
                    image={ARCHIVE.bucksRow}
                    from={{ x: 0.5, y: 0.5, zoom: 1.2 }}
                    to={{ x: 0.5, y: 0.5, zoom: 1.35 }}
                    tone="cold"
                    brightness={0.45}
                  />
                ),
              },
              {
                at: 5.4,
                node: (
                  <Archival
                    image={ARCHIVE.hanbury}
                    from={{ x: 0.5, y: 0.5, zoom: 1.2 }}
                    to={{ x: 0.5, y: 0.5, zoom: 1.35 }}
                    tone="cold"
                    brightness={0.45}
                  />
                ),
              },
              {
                at: 8.0,
                node: (
                  <Archival
                    image={ARCHIVE.dutfieldsYard}
                    from={{ x: 0.5, y: 0.5, zoom: 1.2 }}
                    to={{ x: 0.5, y: 0.5, zoom: 1.35 }}
                    tone="cold"
                    brightness={0.45}
                  />
                ),
              },
              {
                at: 10.6,
                node: (
                  <Archival
                    image={ARCHIVE.bernerStreet}
                    from={{ x: 0.5, y: 0.5, zoom: 1.2 }}
                    to={{ x: 0.5, y: 0.5, zoom: 1.35 }}
                    tone="cold"
                    brightness={0.45}
                  />
                ),
              },
            ]}
          />
        </Scene>
      </Beat>

      <Beat id="millers-court">
        <Scene fog={0.5} fogBand="low" flicker={0.4}>
          <Archival
            image={ARCHIVE.millersCourt}
            from={{ x: 0.5, y: 0.4, zoom: 1.05 }}
            to={{ x: 0.5, y: 0.55, zoom: 1.4 }}
            tone="cold"
            brightness={0.5}
          />
        </Scene>
      </Beat>

      <Beat id="privacy-time" through="hardest-scene">
        <Scene fog={0.55} fogBand="low" flicker={0.4}>
          <MillersCourt closeAt={seconds(3.4)} candleOutAt={seconds(10.6)} />
        </Scene>
      </Beat>

      <Beat id="nothing" fadeIn={0}>
        <Black fog={0.2} />
      </Beat>

      <Beat id="vanished" through="if-last">
        <Scene fog={0.3} flicker={0.4}>
          <Vanish />
        </Scene>
      </Beat>

      <Beat id="why-stop" through="someone-else">
        <Scene fog={0.45} fogBand="low" flicker={0.35}>
          <Doors
            at={[seconds(1.9), seconds(3.3), seconds(4.9), seconds(6.1)]}
            allDarkAt={seconds(8.2)}
          />
        </Scene>
      </Beat>

      <Beat id="everyone-detective">
        <Scene fog={0.25} fogBand="high" flicker={0.35}>
          <WhitechapelMap
            from={siteFraming("kelly", 2.0)}
            to={siteFraming("kelly", 2.3)}
            lens={1}
            night={0.35}
            pins={[{ site: "kelly", at: -60 }]}
          />
        </Scene>
      </Beat>

      {/* ---------------------------------------------------------- part seven */}
      <Beat id="ch7">
        <ChapterMark index={7} title="אז מי היה ג'ק המרטש?" />
      </Beat>

      <Beat id="macnaghten">
        <Scene fog={0.35} fogBand="low" flicker={0.35}>
          <Series
            total={beatSeconds("macnaghten")}
            shots={[
              {
                at: 0,
                node: (
                  <SuspectCard
                    name="M. L. MACNAGHTEN"
                    image={ARCHIVE.macnaghten}
                    focus={{ x: 0.5, y: 0.25 }}
                  />
                ),
              },
              {
                at: 6.4,
                node: (
                  <Archival
                    image={ARCHIVE.macnaghtenMemo}
                    from={{ x: 0.5, y: 0.15, zoom: 1.6 }}
                    to={{ x: 0.5, y: 0.55, zoom: 1.7 }}
                    tone="print"
                    desaturate={0.5}
                    brightness={0.75}
                  />
                ),
              },
            ]}
          />
        </Scene>
      </Beat>

      <Beat id="druitt">
        <Scene fog={0.4} fogBand="low" flicker={0.35}>
          <Series
            total={beatSeconds("druitt")}
            shots={[
              {
                at: 0,
                node: (
                  <SuspectCard
                    name="M. J. DRUITT"
                    image={ARCHIVE.druitt}
                    focus={{ x: 0.5, y: 0.2 }}
                    tilt={2}
                  />
                ),
              },
              {
                at: 6.6,
                node: (
                  <Archival
                    image={ARCHIVE.parliamentSepia}
                    from={{ x: 0.5, y: 0.55, zoom: 1.2 }}
                    to={{ x: 0.45, y: 0.65, zoom: 1.5 }}
                    tone="cold"
                    brightness={0.4}
                  />
                ),
              },
            ]}
          />
        </Scene>
      </Beat>

      <Beat id="suspicious-timing">
        <Scene fog={0.35} fogBand="low" flicker={0.35}>
          <CircledDetail
            image={ARCHIVE.macnaghtenMemo}
            focus={{ x: 0.5, y: 0.3 }}
            zoom={1.9}
            circleAt={seconds(1.2)}
            radius={230}
            tone="photo"
          />
        </Scene>
      </Beat>

      <Beat id="macnaghten-wrong">
        <Scene fog={0.4} fogBand="low" flicker={0.35}>
          <SuspectCard
            name="M. J. DRUITT"
            image={ARCHIVE.druitt}
            focus={{ x: 0.5, y: 0.2 }}
            tilt={-3}
            strikeAt={seconds(11.2)}
          />
        </Scene>
      </Beat>

      <Beat id="ostrog">
        <Scene fog={0.4} fogBand="low" flicker={0.35}>
          <Series
            total={beatSeconds("ostrog")}
            shots={[
              {
                at: 0,
                node: (
                  <SuspectCard
                    name="M. OSTROG"
                    silhouette={<Bust seed={7} hair="cap" />}
                    tilt={3}
                  />
                ),
              },
              {
                at: 7.5,
                node: (
                  <Archival
                    image={ARCHIVE.macnaghtenMemo}
                    from={{ x: 0.5, y: 0.75, zoom: 1.7 }}
                    to={{ x: 0.5, y: 0.85, zoom: 1.8 }}
                    tone="print"
                    desaturate={0.5}
                    brightness={0.75}
                  />
                ),
              },
            ]}
          />
        </Scene>
      </Beat>

      <Beat id="in-france">
        <Scene fog={0.4} fogBand="low" flicker={0.35}>
          <SuspectCard
            name="M. OSTROG"
            silhouette={<Bust seed={7} hair="cap" />}
            tilt={3}
            strikeAt={seconds(3.6)}
            exitAt={seconds(5.4)}
          />
        </Scene>
      </Beat>

      <Beat id="kosminski">
        <Scene fog={0.25} fogBand="low" flicker={0.35}>
          <BarberBeside>
            <SuspectCard
              name="A. KOSMINSKI"
              silhouette={<Bust seed={11} hair="short" />}
              tilt={-2}
              x={1240}
            />
          </BarberBeside>
        </Scene>
      </Beat>

      <Beat id="asylum">
        <Scene fog={0.5} fogBand="low" flicker={0.35}>
          <Archival
            image={ARCHIVE.colneyHatch}
            from={{ x: 0.5, y: 0.5, zoom: 1.1 }}
            to={{ x: 0.5, y: 0.45, zoom: 1.4 }}
            tone="cold"
            brightness={0.5}
          />
        </Scene>
      </Beat>

      <Beat id="police-memoirs">
        <Scene fog={0.35} fogBand="low" flicker={0.35}>
          <CircledDetail
            image={ARCHIVE.macnaghtenMemo}
            focus={{ x: 0.5, y: 0.6 }}
            zoom={1.9}
            circleAt={seconds(1.5)}
            radius={230}
            tone="photo"
          />
        </Scene>
      </Beat>

      <Beat id="no-evidence" through="back-to-headlines">
        <Scene fog={0.4} flicker={0.3}>
          <EvidenceBoard
            at={[seconds(0.6), seconds(2.3), seconds(3.6), seconds(5.6)]}
          />
        </Scene>
      </Beat>

      {/* ---------------------------------------------------------- part eight */}
      <Beat id="ch8">
        <ChapterMark index={8} title="האם ה-DNA פתר את התעלומה?" />
      </Beat>

      <Beat id="shawl">
        <Scene fog={0.2} flicker={0.1} grain={0.07}>
          <Shawl handsAt={99999} scanAt={seconds(5)} />
        </Scene>
      </Beat>

      <Beat id="mtdna">
        <Scene fog={0.2} flicker={0.1} grain={0.07}>
          <HelixScene build={{ from: seconds(0.3), to: seconds(4) }} />
        </Scene>
      </Beat>

      <Beat id="solved-headlines" fadeIn={0}>
        <Scene fog={0.15} flicker={0.1} grain={0.07}>
          <Headlines
            interval={seconds(1.6)}
            words={[
              "JACK THE RIPPER IDENTIFIED",
              "CASE CLOSED AFTER 130 YEARS",
              "DNA NAMES THE RIPPER",
              "MYSTERY SOLVED",
              "KOSMINSKI WAS JACK",
            ]}
          />
        </Scene>
      </Beat>

      <Beat id="not-simple">
        <Scene fog={0.25} flicker={0.15} grain={0.07}>
          <HelixScene doubt={{ from: seconds(1), to: seconds(10), max: 0.7 }} />
        </Scene>
      </Beat>

      <Beat id="contamination">
        <Scene fog={0.3} flicker={0.15} grain={0.07}>
          <Shawl handsAt={0} interval={24} handCount={8} />
        </Scene>
      </Beat>

      <Beat id="criticism">
        <Scene fog={0.25} fogBand="low" flicker={0.2} grain={0.07}>
          <JournalNotice
            concernAt={seconds(13.5)}
            correctionAt={seconds(17.2)}
          />
        </Scene>
      </Beat>

      <Beat id="dna-no">
        <Scene fog={0.3} flicker={0.15} grain={0.07}>
          <HelixScene doubt={{ from: 0, to: seconds(3), max: 1 }} />
          <Strike at={seconds(1.6)} />
        </Scene>
      </Beat>

      {/* ----------------------------------------------------------- part nine */}
      <Beat id="ch9">
        <ChapterMark index={9} title="המפלצת שהמצאנו" />
      </Beat>

      <Beat id="imagine">
        <Scene fog={0.3} flicker={0.35}>
          <ImagineHead />
        </Scene>
      </Beat>

      <Beat id="top-hat">
        <Scene fog={0.25} flicker={0.4}>
          <MythAssembly
            hatAt={seconds(2.6)}
            cloakAt={seconds(4.2)}
            bagAt={seconds(6.6)}
            fogAt={seconds(9.2)}
          />
        </Scene>
      </Beat>

      <Beat id="built-by-media" fadeIn={0}>
        <Scene fog={0} flicker={0.2} scratches>
          <HeadlineSlam
            pages={[
              ARCHIVE.ipnOct20,
              ARCHIVE.famousCrimes,
              ARCHIVE.ripperPuck,
              ARCHIVE.whitechapelMurdersFr,
              ARCHIVE.nemesisOfNeglect,
              ARCHIVE.rueWhitechapelFr,
              ARCHIVE.ipnRipper,
            ]}
            interval={seconds(1.55)}
            focus={{ x: 0.5, y: 0.3 }}
            zoom={1.05}
          />
        </Scene>
      </Beat>

      <Beat id="recognisable">
        <Scene fog={0.3} flicker={0.4}>
          <Recognisable />
        </Scene>
      </Beat>

      <Beat id="man-erased">
        <Scene fog={0.3} flicker={0.35}>
          <ManErased eraseAt={seconds(1.2)} />
        </Scene>
      </Beat>

      <Beat id="less-romantic">
        <Scene fog={0} flicker={0.4} vignette={0.9}>
          <StreetMyth fadeOutAt={seconds(3.6)} />
        </Scene>
      </Beat>

      <Beat id="local-man">
        <Scene fog={0.3} fogBand="low" flicker={0.35}>
          <CrowdScene pan={120} count={28} highlight />
        </Scene>
      </Beat>

      <Beat id="exploited">
        <Scene fog={0.6} fogBand="low" flicker={0.4}>
          <Series
            total={beatSeconds("exploited")}
            shots={[
              {
                at: 0,
                node: (
                  <Archival
                    image={ARCHIVE.dorsetStreet}
                    from={{ x: 0.5, y: 0.6, zoom: 1.2 }}
                    to={{ x: 0.4, y: 0.6, zoom: 1.4 }}
                    tone="cold"
                    brightness={0.4}
                  />
                ),
              },
              {
                at: 3.2,
                node: (
                  <Archival
                    image={ARCHIVE.nicholsPlace}
                    from={{ x: 0.5, y: 0.5, zoom: 1.2 }}
                    to={{ x: 0.5, y: 0.6, zoom: 1.45 }}
                    tone="cold"
                    brightness={0.4}
                  />
                ),
              },
              {
                at: 6.2,
                node: (
                  <Archival
                    image={ARCHIVE.policeNotice}
                    from={{ x: 0.5, y: 0.5, zoom: 1.2 }}
                    to={{ x: 0.5, y: 0.55, zoom: 1.4 }}
                    tone="cold"
                    brightness={0.45}
                  />
                ),
              },
            ]}
          />
        </Scene>
      </Beat>

      {/* --------------------------------------------------------------- ending */}
      <Beat id="end-mark" fadeIn={seconds(1)}>
        <Black fog={0.4} />
      </Beat>

      <Beat id="never-know">
        <Scene fog={0.4} fogBand="low" flicker={0.35}>
          <Series
            total={beatSeconds("never-know")}
            shots={[
              {
                at: 0,
                node: (
                  <Archival
                    image={ARCHIVE.macnaghtenMemo}
                    from={{ x: 0.5, y: 0.2, zoom: 1.5 }}
                    to={{ x: 0.5, y: 0.8, zoom: 1.5 }}
                    tone="print"
                    desaturate={0.6}
                    brightness={0.55}
                  />
                ),
              },
              {
                at: 5.4,
                node: (
                  <AbsoluteFill>
                    <SuspectCard
                      name="A. KOSMINSKI"
                      silhouette={<Bust seed={11} hair="short" />}
                      x={1400}
                      y={560}
                      scale={0.72}
                      tilt={-4}
                    />
                    <SuspectCard
                      name="M. J. DRUITT"
                      image={ARCHIVE.druitt}
                      focus={{ x: 0.5, y: 0.2 }}
                      x={960}
                      y={560}
                      scale={0.72}
                      tilt={2}
                      delay={8}
                    />
                    <SuspectCard
                      name="M. OSTROG"
                      silhouette={<Bust seed={7} hair="cap" />}
                      x={520}
                      y={560}
                      scale={0.72}
                      tilt={-1}
                      delay={16}
                    />
                  </AbsoluteFill>
                ),
              },
              { at: 9.6, node: <CrowdScene pan={80} count={30} /> },
            ]}
          />
        </Scene>
      </Beat>

      <Beat id="five-names">
        <Scene fog={0.35} fogBand="low" flicker={0.2}>
          <FiveWomen
            women={WOMEN}
            at={[
              seconds(2.7),
              seconds(4.7),
              seconds(6.2),
              seconds(8.2),
              seconds(10.7),
            ]}
          />
        </Scene>
      </Beat>

      <Beat id="only-a-name">
        <Scene fog={0.3} flicker={0.4} scratches>
          <Archival
            image={ARCHIVE.dearBoss}
            from={{ x: SIGNATURE.x, y: SIGNATURE.y, zoom: 1.9 }}
            to={{ x: SIGNATURE.x, y: SIGNATURE.y, zoom: 2.3 }}
            tone="none"
            desaturate={0.1}
            brightness={0.7}
            contrast={1.2}
          />
        </Scene>
      </Beat>

      <Beat id="your-pick">
        <Scene fog={0.4} fogBand="low" flicker={0.3}>
          <SuspectCard
            name="A. KOSMINSKI"
            silhouette={<Bust seed={11} hair="short" />}
            x={1400}
            y={560}
            scale={0.8}
            tilt={-3}
            delay={seconds(7.9)}
          />
          <SuspectCard
            name="M. J. DRUITT"
            image={ARCHIVE.druitt}
            focus={{ x: 0.5, y: 0.2 }}
            x={960}
            y={560}
            scale={0.8}
            tilt={2}
            delay={seconds(9.4)}
          />
          <SuspectCard
            name="?"
            silhouette={<Bust seed={3} hair="short" />}
            x={520}
            y={560}
            scale={0.8}
            tilt={-1}
            delay={seconds(10.9)}
          />
        </Scene>
      </Beat>

      <Beat id="outro" through="tail">
        <Outro series={SERIES} next="בפרק הבא — תיק נוסף" />
      </Beat>

      <Film grain={0.04} vignette={0.2} />
    </AbsoluteFill>
  );
};
