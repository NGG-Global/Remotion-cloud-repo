import React from "react";
import { HEBREW } from "../fonts";
import { R } from "../theme";
import { Pop } from "../components/Pop";

type FolderProps = {
  readonly at: number;
  readonly label: string;
  readonly color?: string;
  readonly width?: number;
  readonly tilt?: number;
  readonly children?: React.ReactNode;
};

/** A folder with a tab, the project metaphor. Children sit inside it. */
export const Folder: React.FC<FolderProps> = ({
  at,
  label,
  color = R.yellow,
  width = 420,
  tilt = 0,
  children,
}) => {
  const height = width * 0.78;
  return (
    <Pop at={at} from="below" tilt={tilt} bounce={1.1}>
      <div style={{ position: "relative", width, height }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: width * 0.42,
            height: height * 0.18,
            background: color,
            filter: "brightness(0.9)",
            borderRadius: `${width * 0.06}px ${width * 0.06}px 0 0`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: height * 0.12,
            bottom: 0,
            background: color,
            borderRadius: width * 0.06,
            boxShadow: `0 0 0 6px ${R.white}, 0 18px 36px ${R.ink}2e`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            padding: width * 0.06,
          }}
        >
          {children}
          <div
            style={{
              fontFamily: HEBREW,
              fontSize: width * 0.1,
              fontWeight: 800,
              color: R.ink,
              direction: "rtl",
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            {label}
          </div>
        </div>
      </div>
    </Pop>
  );
};

/** A small file card to put inside a folder. */
export const FileCard: React.FC<{
  readonly at: number;
  readonly name: string;
  readonly color?: string;
}> = ({ at, name, color = R.white }) => (
  <Pop at={at} from="scale">
    <div
      style={{
        background: color,
        borderRadius: 12,
        padding: "8px 16px",
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 26,
        fontWeight: 700,
        color: R.ink,
        boxShadow: `0 6px 14px ${R.ink}22`,
        direction: "ltr",
      }}
    >
      {name}
    </div>
  </Pop>
);
