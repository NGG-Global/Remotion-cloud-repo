import React from "react";
import { AbsoluteFill } from "remotion";
import { Headline } from "../components/Headline";
import { At } from "../components/layout";
import { Sticker } from "../components/Sticker";
import { Screenshot } from "../graphics/Screenshot";
import { sceneClock } from "../clock";
import { R, SIZE } from "../theme";

const c = sceneClock("rstudio");

/** R is the language, RStudio is where it is written and run. */
export const RStudioScene: React.FC = () => (
  <AbsoluteFill>
    <At y={210}>
      <Headline
        text="R היא השפה"
        at={c.t("rstudio")}
        size={SIZE.heading}
        mark={["R"]}
      />
    </At>
    <At y={340}>
      <Headline
        text="RStudio היא סביבת העבודה"
        at={c.after("rstudio", 1.6)}
        size={SIZE.heading}
        mark={["RStudio"]}
        markColor={R.sky}
      />
    </At>
    <At y={560} x={60} w={960}>
      <Screenshot width={960} at={c.after("rstudio", 2.4)} />
    </At>
    <At y={1180}>
      <Headline
        text="כאן כותבים ומריצים"
        at={c.after("rstudio", 3.6)}
        size={SIZE.subheading}
        weight={600}
        color={R.inkSoft}
      />
    </At>

    <At y={1330}>
      <Sticker
        text="הושקה ב-2011"
        at={c.t("rstudio-2011")}
        color={R.yellow}
        size={48}
        tilt={-3}
      />
    </At>
    <At y={1480}>
      <Sticker
        text="החברה שינתה את שמה ל-Posit"
        at={c.t("posit")}
        color={R.ink}
        textColor={R.white}
        size={42}
        tilt={2}
      />
    </At>
    <At y={1610}>
      <Sticker
        text="התוכנה? עדיין RStudio"
        at={c.after("posit", 2.2)}
        color={R.blue}
        textColor={R.white}
        size={46}
        tilt={-2}
      />
    </At>
  </AbsoluteFill>
);
