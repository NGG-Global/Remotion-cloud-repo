import React from "react";
import { AbsoluteFill, Img } from "remotion";
import { useNarr } from "../components/Shot";
import { imageSrc } from "../components/Still";
import { IMAGE_SIZES, type ImageId } from "../data/images";
import { AZ, easeOut, ramp, SANS, SERIF, SERIF_LATIN } from "../theme";
import { Blueprint } from "./Diagrams";

/**
 * Where the mug shot sits on a page of the Alcatraz warden's notebook
 * (RG 129, National Archives): pasted in the top right corner, number below.
 */
const PHOTO = { x0: 0.65, x1: 0.99, y0: 0.03, y1: 0.36 };

const MugCard: React.FC<{
  readonly id: ImageId;
  readonly name: string;
  readonly number: string;
  readonly at: number;
  readonly dimAt?: number;
  readonly width: number;
}> = ({ id, name, number, at, dimAt, width }) => {
  const n = useNarr();
  const o = easeOut(ramp(n, at, at + 0.5));
  const frameIn = easeOut(ramp(n, at - 2.2, at - 1.4));
  const dim = dimAt === undefined ? 0 : ramp(n, dimAt, dimAt + 0.8);
  const size = IMAGE_SIZES[id];
  const regionW = (PHOTO.x1 - PHOTO.x0) * size.w;
  const regionH = (PHOTO.y1 - PHOTO.y0) * size.h;
  const height = (width * regionH) / regionW;
  const s = width / regionW;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 22,
        opacity: Math.max(o, 0.6 * frameIn) * (1 - 0.55 * dim),
      }}
    >
      <div
        style={{
          width,
          height,
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 18px 50px rgba(0,0,0,0.75)",
          outline: `1px solid rgba(231,223,204,${0.25 + 0.3 * (1 - o)})`,
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <Img
          src={imageSrc(id)}
          style={{
            position: "absolute",
            width: size.w * s,
            height: size.h * s,
            maxWidth: "none",
            left: -PHOTO.x0 * size.w * s,
            top: -PHOTO.y0 * size.h * s,
            filter: `grayscale(${0.6 + 0.4 * dim}) sepia(0.25) contrast(1.05) brightness(0.92)`,
            opacity: o,
          }}
        />
      </div>
      <div style={{ fontFamily: SERIF, fontSize: 48, color: AZ.text, direction: "rtl", whiteSpace: "nowrap", opacity: o }}>{name}</div>
      <div style={{ fontFamily: SERIF_LATIN, fontSize: 26, letterSpacing: 4, color: AZ.textMuted, opacity: o }}>{number}</div>
    </div>
  );
};

/**
 * Two or three prisoners from the warden's notebook, side by side, each
 * arriving on the word that names him.
 */
export const MugRow: React.FC<{
  readonly people: readonly {
    readonly id: ImageId;
    readonly name: string;
    readonly number: string;
    readonly at: number;
  }[];
  readonly title?: string;
  readonly titleAt?: number;
  readonly dimAt?: number;
  readonly caption?: string;
  readonly captionAt?: number;
}> = ({ people, title, titleAt = 0, dimAt, caption, captionAt = 0 }) => {
  const n = useNarr();
  const width = people.length === 3 ? 400 : 440;
  return (
    <Blueprint tint="#181714">
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 40 }}>
        {title ? (
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 58,
              color: AZ.paper,
              direction: "rtl",
              opacity: easeOut(ramp(n, titleAt, titleAt + 0.6)),
            }}
          >
            {title}
          </div>
        ) : null}
        <div style={{ display: "flex", direction: "rtl", gap: 70 }}>
          {people.map((p) => (
            <MugCard key={p.id} {...p} width={width} dimAt={dimAt} />
          ))}
        </div>
        {caption ? (
          <div
            style={{
              fontFamily: SANS,
              fontSize: 40,
              color: AZ.red,
              direction: "rtl",
              opacity: easeOut(ramp(n, captionAt, captionAt + 0.5)),
            }}
          >
            {caption}
          </div>
        ) : null}
      </AbsoluteFill>
    </Blueprint>
  );
};
