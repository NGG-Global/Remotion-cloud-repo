import React from "react";
import { AbsoluteFill } from "remotion";
import { GEO } from "../data/geo";
import { useShot } from "../engine/shot";
import { EASE, clamp, dirOf, lerp, ramp } from "../engine/time";
import { INK, TYPE } from "../theme";
import { Backdrop } from "./kit";

type View = { readonly lon: number; readonly lat: number; readonly span: number };
type LonLat = readonly [number, number];

export type MapProps = {
  /** Camera: centre and horizontal span in degrees, eased between n-times. */
  readonly from: View;
  readonly to?: View;
  readonly move?: readonly [number, number];
  /** Regions lit in amber from a narration time. */
  readonly lit?: readonly { readonly id: string; readonly at: number }[];
  readonly marks?: readonly {
    readonly at: LonLat;
    readonly label: string;
    readonly sub?: string;
    readonly t: number;
    readonly side?: "left" | "right";
  }[];
  readonly routes?: readonly { readonly a: LonLat; readonly b: LonLat; readonly t0: number; readonly t1: number }[];
};

const W = 1920;
const H = 1080;

const project = (v: View) => {
  const k = Math.cos((v.lat * Math.PI) / 180);
  const s = W / v.span;
  return ([lon, lat]: LonLat): [number, number] => [
    W / 2 + (lon - v.lon) * s * k,
    H / 2 - (lat - v.lat) * s,
  ];
};

const ringPath = (ring: number[][], p: (ll: LonLat) => [number, number]): string =>
  ring
    .map(([lon, lat], i) => {
      const [x, y] = p([lon, lat]);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join("") + "Z";

/** Great-circle-ish arc drawn as a raised quadratic curve. */
const arc = (a: [number, number], b: [number, number]): string => {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2 - Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.22;
  return `M ${a[0]} ${a[1]} Q ${mx} ${my} ${b[0]} ${b[1]}`;
};

/**
 * A plain archival map: land in dark grey, the places the story touches in
 * amber, a route drawn in as the narration travels it.
 */
export const MapScene: React.FC<MapProps> = ({ from, to, move, lit = [], marks = [], routes = [] }) => {
  const { n } = useShot();
  const k = to && move ? ramp(n, move[0], move[1], EASE.inOut) : 0;
  const v: View = to
    ? { lon: lerp(from.lon, to.lon, k), lat: lerp(from.lat, to.lat, k), span: from.span * Math.pow(to.span / from.span, k) }
    : from;
  const p = project(v);
  const litK = (id: string) => {
    const l = lit.find((x) => x.id === id);
    return l ? ramp(n, l.at, l.at + 0.8, EASE.out) : 0;
  };
  return (
    <Backdrop tone="black" grid={false}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <rect width={W} height={H} fill="#0a0e11" />
        {Object.entries(GEO).map(([id, rings]) => {
          const lk = litK(id);
          const isState = id.startsWith("US-");
          return (
            <g key={id}>
              {rings.map((r, i) => (
                <path
                  key={i}
                  d={ringPath(r, p)}
                  fill={
                    lk > 0
                      ? `rgba(217,164,90,${0.12 + 0.5 * lk})`
                      : isState
                        ? "none"
                        : "#262f35"
                  }
                  stroke={lk > 0 ? INK.amber : isState ? "rgba(0,0,0,0)" : "#45525a"}
                  strokeWidth={lk > 0 ? 2 : 1.2}
                />
              ))}
            </g>
          );
        })}
        {routes.map((r, i) => {
          const rk = ramp(n, r.t0, r.t1, EASE.inOut);
          if (rk <= 0) {
            return null;
          }
          return (
            <path
              key={i}
              d={arc(p(r.a), p(r.b))}
              fill="none"
              stroke={INK.amber}
              strokeWidth={3}
              strokeDasharray="1 1"
              pathLength={1}
              strokeDashoffset={1 - rk}
              style={{ filter: `drop-shadow(0 0 6px ${INK.amber})` }}
            />
          );
        })}
      </svg>
      {marks.map((m, i) => {
        const mk = ramp(n, m.t, m.t + 0.6, EASE.out);
        if (mk <= 0) {
          return null;
        }
        const [x, y] = p(m.at);
        const left = m.side === "left";
        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: "absolute",
                left: x - 9,
                top: y - 9,
                width: 18,
                height: 18,
                borderRadius: 9,
                background: INK.amber,
                boxShadow: `0 0 ${18 * mk}px ${INK.amber}`,
                transform: `scale(${clamp(mk)})`,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: y - 34,
                ...(left ? { right: W - x + 26 } : { left: x + 26 }),
                opacity: mk,
                display: "flex",
                flexDirection: "column",
                alignItems: left ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  fontFamily: TYPE.serif,
                  fontSize: 46,
                  fontWeight: 500,
                  color: INK.text,
                  direction: dirOf(m.label),
                  whiteSpace: "nowrap",
                  textShadow: "0 2px 14px rgba(0,0,0,0.9)",
                }}
              >
                {m.label}
              </div>
              {m.sub ? (
                <div
                  style={{
                    fontFamily: TYPE.serif,
                    fontSize: 30,
                    color: INK.textDim,
                    direction: dirOf(m.sub),
                    whiteSpace: "nowrap",
                    textShadow: "0 2px 14px rgba(0,0,0,0.9)",
                  }}
                >
                  {m.sub}
                </div>
              ) : null}
            </div>
          </React.Fragment>
        );
      })}
      <AbsoluteFill
        style={{ background: "radial-gradient(80% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.7) 100%)" }}
      />
    </Backdrop>
  );
};
