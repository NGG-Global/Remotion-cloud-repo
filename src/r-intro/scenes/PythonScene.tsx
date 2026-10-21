import React from "react";
import { AbsoluteFill } from "remotion";
import { Headline } from "../components/Headline";
import { At } from "../components/layout";
import { Sticker } from "../components/Sticker";
import { PythonLogo } from "../graphics/PythonLogo";
import { RLogo } from "../graphics/RLogo";
import { sceneClock } from "../clock";
import { R, SIZE } from "../theme";

const c = sceneClock("python-q");

/** Python is general-purpose, R is built around statistics; both fit. */
export const PythonScene: React.FC = () => (
  <AbsoluteFill>
    <At y={200}>
      <Headline
        text="ומה עם Python?"
        at={c.t("python-q")}
        size={SIZE.heading}
        mark={["Python?"]}
      />
    </At>

    {/* Python column (left), R column (right) */}
    <At x={72} y={420} w={440}>
      <PythonLogo size={300} at={c.after("python-q", 0.5)} />
    </At>
    <At x={568} y={420} w={440}>
      <RLogo size={300} at={c.after("python-q", 0.8)} />
    </At>

    <At x={72} y={780} w={440} style={{ gap: 30 }}>
      <Sticker
        text="שפה כללית"
        at={c.t("python-general")}
        color={R.ink}
        textColor={R.white}
        size={42}
        tilt={-3}
      />
      <Sticker
        text="אתרים"
        at={c.after("python-general", 1.0)}
        color={R.sky}
        size={42}
        tilt={2}
      />
      <Sticker
        text="אפליקציות"
        at={c.after("python-general", 1.7)}
        color={R.sky}
        size={42}
        tilt={-2}
      />
      <Sticker
        text="בינה מלאכותית"
        at={c.after("python-general", 2.6)}
        color={R.sky}
        size={42}
        tilt={3}
      />
    </At>

    <At x={568} y={780} w={440} style={{ gap: 30 }}>
      <Sticker
        text="סביב סטטיסטיקה"
        at={c.t("r-stats")}
        color={R.blue}
        textColor={R.white}
        size={40}
        tilt={3}
      />
      <Sticker
        text="ניתוח ניסויים"
        at={c.after("r-stats", 1.6)}
        color={R.yellowLit}
        size={42}
        tilt={-2}
      />
      <Sticker
        text="השוואת קבוצות"
        at={c.after("r-stats", 3.0)}
        color={R.yellowLit}
        size={42}
        tilt={2}
      />
      <Sticker
        text="הפקת גרפים"
        at={c.after("r-stats", 4.4)}
        color={R.yellowLit}
        size={42}
        tilt={-3}
      />
    </At>

    <At y={1330}>
      <Headline
        text="שתיהן מתאימות למחקר פסיכולוגי"
        at={c.t("both")}
        size={SIZE.subheading}
        mark={["שתיהן"]}
      />
    </At>
    <At y={1540}>
      <Sticker
        text="הבחירה תלויה במשימה"
        at={c.after("both", 2.4)}
        color={R.coral}
        textColor={R.white}
        size={50}
        tilt={-2}
      />
    </At>
  </AbsoluteFill>
);
