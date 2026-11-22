import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Sting as SeriesSting } from "../../doc/scenes/Sting";
import { still, stillVariant } from "../data/edit";
import type { StillId } from "../data/stills";
import { B, easeIn, easeInOut, easeOut, ramp, SANS, SERIF, SERIF_LATIN } from "../theme";

/** The programme's mark, as the narrator names it: "פני הרוע". */
export const Sting: React.FC<{ grand?: boolean }> = ({ grand }) => (
  <SeriesSting series="פני הרוע" episode="טד בנדי" grand={grand} tagline={null} />
);

const graded = (img: StillId) => staticFile(`bundy/graded/${stillVariant(still(img, { grade: "bw" }))}.jpg`);

/**
 * The myth, then its correction: six photographs of Bundy and the words the
 * story usually leans on, then the "genius" struck through.
 */
export const Myth: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const env = Math.min(easeOut(ramp(frame, 0, 14)), 1 - easeIn(ramp(frame, durationInFrames - 14, durationInFrames)));
  const photos: StillId[] = ["prison1978", "headshot", "fbi", "court", "mug1980", "mug1988"];
  const words = [
    { t: 3.9, w: "המראה" },
    { t: 5.5, w: "הקסם האישי" },
    { t: 6.8, w: "האינטליגנציה" },
    { t: 7.9, w: "פסיכולוגיה · משפטים" },
  ];
  const fadeWall = 1 - 0.6 * easeInOut(ramp(t, 14.1, 16));
  const genius = easeOut(ramp(t, 17.8, 18.5));
  const strike = easeInOut(ramp(t, 25.5, 26.4));
  const verdict = easeOut(ramp(t, 26.2, 27.0));
  return (
    <AbsoluteFill style={{ background: B.black, opacity: env }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 10,
          padding: 10,
          opacity: fadeWall,
        }}
      >
        {photos.map((p, i) => {
          const o = easeOut(ramp(t, 0.2 + i * 0.35, 0.9 + i * 0.35));
          return (
            <div key={p} style={{ overflow: "hidden", opacity: o * 0.85 }}>
              <Img src={graded(p)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.05 + 0.04 * Math.sin(t * 0.2 + i)})` }} />
            </div>
          );
        })}
      </div>
      <AbsoluteFill style={{ background: "linear-gradient(to top, rgba(7,8,10,0.92) 0%, rgba(7,8,10,0.5) 45%, rgba(7,8,10,0.25) 100%)" }} />
      <div style={{ position: "absolute", bottom: 150, width: "100%", display: "flex", justifyContent: "center", gap: 46, direction: "rtl" }}>
        {words.map((x) => (
          <div key={x.w} style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 58, color: B.paper, opacity: easeOut(ramp(t, x.t, x.t + 0.5)) * (1 - 0.7 * easeInOut(ramp(t, 14.1, 15.5))), textShadow: "0 4px 24px rgba(0,0,0,0.95)" }}>
            {x.w}
          </div>
        ))}
      </div>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative", fontFamily: SERIF, fontWeight: 600, fontSize: 150, color: B.paper, opacity: genius, direction: "rtl", textShadow: "0 6px 40px rgba(0,0,0,0.95)" }}>
          ״גאון״
          <span style={{ position: "absolute", right: -10, top: "55%", height: 10, width: `${strike * 105}%`, background: B.ember }} />
        </div>
        <div style={{ marginTop: 34, fontFamily: SANS, fontSize: 46, color: B.paper, opacity: verdict, direction: "rtl" }}>
          זה לא מה שהראיות מלמדות
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Closing card: the series, then the sources. */
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const env = Math.min(easeOut(ramp(frame, 0, 20)), 1 - easeIn(ramp(frame, durationInFrames - 40, durationInFrames)));
  const first = 1 - easeIn(ramp(t, 10.6, 11.3));
  const credits = easeOut(ramp(t, 11.3, 12.2));
  return (
    <AbsoluteFill style={{ opacity: env, alignItems: "center", justifyContent: "center" }}>
      <AbsoluteFill style={{ background: "rgba(0,0,0,0.35)" }} />
      <div style={{ position: "absolute", top: 330, display: "flex", flexDirection: "column", alignItems: "center", opacity: first }}>
        <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 120, color: B.paper, direction: "rtl", textShadow: "0 6px 40px rgba(0,0,0,0.9)", opacity: easeOut(ramp(t, 0.2, 1.0)) }}>
          פני הרוע
        </div>
        <div style={{ marginTop: 34, fontFamily: SANS, fontSize: 46, color: B.paperDim, direction: "rtl", opacity: easeOut(ramp(t, 1.4, 2.0)) }}>
          תודה שצפיתם · נתראה בפרק הבא
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, opacity: credits, direction: "rtl" }}>
        <div style={{ fontFamily: SERIF, fontSize: 58, color: B.paper, marginBottom: 14 }}>חומרי הארכיון</div>
        {[
          "Florida Department of Corrections · FBI · State Archives of Florida",
          "U.S. National Archives (EPA DOCUMERICA, FBI training film, 1974)",
          "Library of Congress (Carol M. Highsmith, John Margolies)",
          "Prelinger Archives · Wikimedia Commons · Natural Earth (maps)",
        ].map((l) => (
          <div key={l} style={{ fontFamily: SERIF_LATIN, fontSize: 30, color: B.paperDim, direction: "ltr" }}>
            {l}
          </div>
        ))}
        <div style={{ marginTop: 22, fontFamily: SANS, fontSize: 30, color: B.muted }}>רשימת המקורות המלאה, כולל רישיונות, בתיאור הסרטון</div>
      </div>
    </AbsoluteFill>
  );
};
