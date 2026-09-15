import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { CrossFade } from "../components/CrossFade";
import { AskAcross } from "../graphics/AskAcross";
import { ChatAsk } from "../graphics/ChatAsk";
import { LineIcon } from "../graphics/LineIcon";
import { OutlookMock } from "../graphics/OutlookMock";
import { DocSheet, STRUCTURED_LINES } from "../graphics/parts/DocSheet";
import { TeamsRecordMock } from "../graphics/TeamsRecordMock";
import { CanvasScene } from "../scenes/CanvasScene";
import { ContrastScene } from "../scenes/ContrastScene";
import { ItemsScene } from "../scenes/ItemsScene";
import { OutroScene } from "../scenes/OutroScene";
import { ShowcaseScene } from "../scenes/ShowcaseScene";
import { StatementScene } from "../scenes/StatementScene";
import { TitleScene } from "../scenes/TitleScene";
import { EP6, type BeatIdEp6 } from "../script";
import { COLORS, seconds } from "../theme";
import { SCREENS } from "../ui/screens";
import { TypedPrompt } from "../ui/TypedPrompt";

const HOME = SCREENS.home.regions;
const WINDOW = 1560;

/** The narration, plus a beat of air at the end. */
export const CLAUDE_REACH_DURATION = seconds(EP6.totalSeconds + 1.2);

const CROSSFADE = seconds(0.34);

/** Places a scene on episode 6's narration timeline. */
const Beat: React.FC<{
  readonly id: BeatIdEp6;
  readonly extend?: number;
  readonly children: React.ReactNode;
}> = ({ id, extend = 0, children }) => (
  <Sequence
    from={seconds(EP6.at(id))}
    durationInFrames={seconds(EP6.length(id) + extend) + CROSSFADE}
    name={id}
  >
    <CrossFade frames={CROSSFADE}>{children}</CrossFade>
  </Sequence>
);

/** The composer framing used across every filmed request, held identical so
 *  consecutive requests read as one continuous shot of the composer. */
const COMPOSER_SHOT = {
  at: 0,
  frameOn: HOME.composerBlock,
  fill: 0.62,
  moveDuration: 1,
} as const;

/** The four sources the connector reaches, in the order the narration names
 *  them. Product names stay LTR inside the graphics. */
const SOURCES = [
  { label: "Outlook", icon: "mail" as const },
  { label: "SharePoint", icon: "files" as const },
  { label: "Teams", icon: "meeting" as const },
  { label: "Calendar", icon: "calendar" as const },
];

/**
 * Episode 6: pulling what you need out of Microsoft 365, just by asking.
 *
 * The requests are filmed in the real composer — that is the interface the
 * narration is describing, and episode 5 established the same treatment. What a
 * screenshot cannot show is drawn: the routing across systems and the assembly
 * of one answer (`AskAcross`), and the two Microsoft windows the episode leans
 * on — a busy inbox and the Teams recording menu — which are rebuilt as mockups
 * so no real mail or meeting name travels in a shared video.
 */
export const ClaudeReach: React.FC = () => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile("audio/narration-ep6.mp3")} />

      <Beat id="recap">
        <StatementScene
          kicker="בפרקים הקודמים"
          statement="חיברנו את קלוד ל‑Microsoft 365 — והבנו את כללי המשחק"
          align="center"
        />
      </Beat>

      <Beat id="title">
        <TitleScene
          kicker="מדריך קלוד · פרק שישי"
          title="פשוט לשאול"
          subtitle="המידע כבר נמצא במערכות שלכם — עכשיו רק שולפים אותו"
        />
      </Beat>

      {/* The window you would otherwise open and scroll through. Drawn, so it
          can show the hunting the narration is arguing against. */}
      <Beat id="just-ask">
        <CanvasScene
          captions={[
            {
              at: seconds(2.7),
              text: "בלי לפתוח, בלי לחפש — פשוט שואלים",
              emphasise: ["פשוט", "שואלים"],
            },
          ]}
        >
          {(size) => (
            <OutlookMock {...size} scrollAt={seconds(1.5)} unread={24} />
          )}
        </CanvasScene>
      </Beat>

      {/* The request, typed into the real composer. */}
      <Beat id="email-ask">
        <ShowcaseScene
          screen={SCREENS.home}
          windowWidth={WINDOW}
          title="במקום לפתוח את Outlook"
          steps={[
            {
              ...COMPOSER_SHOT,
              label: "שואלים — וקלוד מביא",
              side: "top",
              reach: 150,
              moveDuration: seconds(1.0),
            },
          ]}
          extras={
            <TypedPrompt
              region={HOME.promptLine}
              text="תמצא מיילים מהחודש מהלקוח X — מה מחכה לתשובה שלי?"
              delay={seconds(1.4)}
              speed={20}
            />
          }
        />
      </Beat>

      {/* Same move, for a document. */}
      <Beat id="docs-ask">
        <ShowcaseScene
          screen={SCREENS.home}
          windowWidth={WINDOW}
          title="ואותו דבר עם מסמכים"
          steps={[{ ...COMPOSER_SHOT, moveDuration: seconds(0.8) }]}
          extras={
            <TypedPrompt
              region={HOME.promptLine}
              text="מצא ותסכם את הגרסה העדכנית של מסמך התוכנית"
              delay={seconds(1.2)}
              speed={19}
            />
          }
        />
      </Beat>

      <Beat id="phrasing">
        <StatementScene
          kicker="שימו לב לניסוח"
          statement="אתם לא אומרים לו איפה לחפש"
          emphasise={["לא"]}
          footnote="לא ׳בתיקיית הפרויקטים׳, לא ׳בתיבת הדואר הנכנס׳"
          align="center"
        />
      </Beat>

      {/* The routing a screenshot cannot show: one request reaching across the
          systems, and Claude choosing where to go. */}
      <Beat id="decides">
        <CanvasScene
          captions={[
            {
              at: seconds(2.4),
              text: "קלוד מחליט לבד לאן ללכת — ומביא את הרלוונטי",
              emphasise: ["מחליט"],
            },
          ]}
        >
          {(size) => (
            <AskAcross
              {...size}
              question="מצא ותסכם את הגרסה העדכנית"
              sources={SOURCES}
              fanAt={seconds(0.9)}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="permissions">
        <StatementScene
          statement="וכן — כפוף בדיוק להרשאות שכבר יש לכם"
          emphasise={["להרשאות"]}
          align="start"
          graphic={({ width, height }) => (
            <div
              style={{
                width,
                height,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LineIcon
                name="shield"
                size={Math.min(width, height) * 0.72}
                color={COLORS.accent}
                drawFrames={seconds(1.0)}
                idle
              />
            </div>
          )}
          panel={{ width: 320, height: 320 }}
        />
      </Beat>

      <Beat id="daily">
        <StatementScene
          kicker="עוד דוגמה, כמעט כל יום"
          statement="יש לי פגישה עם הלקוח מחר ב‑10:00"
          align="center"
        />
      </Beat>

      <Beat id="prep-ask">
        <ShowcaseScene
          screen={SCREENS.home}
          windowWidth={WINDOW}
          title="להתכונן לפגישה"
          steps={[
            {
              ...COMPOSER_SHOT,
              label: "איפה עצרנו — ומי אמור להיות שם",
              side: "top",
              reach: 150,
              moveDuration: seconds(0.9),
            },
          ]}
          extras={
            <TypedPrompt
              region={HOME.promptLine}
              text="עבור על ההתכתבות עם הלקוח — איפה עצרנו, ומי בפגישה?"
              delay={seconds(1.3)}
              speed={20}
            />
          }
        />
      </Beat>

      {/* Within seconds, only the relevant pieces gathered into one picture. */}
      <Beat id="picture">
        <CanvasScene
          captions={[
            {
              at: seconds(2.9),
              text: "בתוך שניות — לא כל המייל, רק מה שרלוונטי",
              emphasise: ["רק"],
            },
          ]}
        >
          {(size) => (
            <AskAcross
              {...size}
              question="לקראת הפגישה מחר עם הלקוח"
              sources={[SOURCES[0], SOURCES[3], SOURCES[2]]}
              fanAt={seconds(0.7)}
              gatherAt={seconds(2.6)}
              answer={{ title: "תמונה לפגישה", icon: "meeting" }}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="useful-when">
        <ItemsScene
          kicker="שימושי במיוחד"
          blockWidth={1040}
          items={[
            {
              text: "כשהפגישה קופצת עליכם פתאום",
              icon: "clock",
              at: seconds(0.4),
            },
            {
              text: "כשמישהו אחר בצוות התחיל מול הלקוח",
              icon: "person",
              at: seconds(3.6),
            },
          ]}
        />
      </Beat>

      {/* The 60-mail thread you do not have to dig through. */}
      <Beat id="no-dig">
        <CanvasScene
          captions={[
            {
              at: seconds(2.6),
              text: "לא לחפור בין 60 מיילים — לשאול מה חשוב מתוכם",
              emphasise: ["לשאול"],
            },
          ]}
        >
          {(size) => (
            <OutlookMock {...size} scrollAt={seconds(1.0)} unread={60} rows={11} />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="bigger">
        <StatementScene
          statement="וזה מתרחב גם לתמונה גדולה יותר"
          emphasise={["תמונה", "גדולה"]}
          align="center"
        />
      </Beat>

      <Beat id="bigpic-ask">
        <StatementScene
          statement="למשל"
          graphic={({ width, height }) => (
            <ChatAsk
              width={width}
              height={height}
              delay={seconds(0.3)}
              turns={[
                {
                  from: "you",
                  text: "מה כל הפרויקטים הפתוחים מול הלקוח כרגע?",
                  at: seconds(0.5),
                },
                {
                  from: "you",
                  text: "מתי עבדנו איתם לאחרונה — ומי היה מעורב?",
                  at: seconds(3.6),
                },
              ]}
            />
          )}
          panel={{ width: 840, height: 360 }}
        />
      </Beat>

      {/* The information is already there, scattered — Claude only collects it. */}
      <Beat id="assemble">
        <CanvasScene
          title="מרכיב ממה שכבר קיים"
          captions={[
            {
              at: seconds(0.4),
              text: "מהמיילים, המסמכים והפגישות שכבר קיימים",
              emphasise: ["שכבר", "קיימים"],
            },
            {
              at: seconds(7.6),
              text: "המידע כבר שם, פזור — הוא רק אוסף אותו",
              emphasise: ["אוסף"],
            },
          ]}
        >
          {(size) => (
            <AskAcross
              {...size}
              question="מה קורה עם הלקוח הזה?"
              sources={SOURCES}
              fanAt={seconds(0.8)}
              gatherAt={seconds(4.0)}
              answer={{ title: "תמונה אחת", icon: "person" }}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="useful-before">
        <ItemsScene
          kicker="מתי זה שווה זהב"
          blockWidth={1120}
          items={[
            {
              text: "לפני שיחת מכירה חדשה",
              icon: "megaphone",
              at: seconds(0.4),
            },
            {
              text: "לפני שמישהו מצטרף לפרויקט באמצע",
              icon: "person",
              at: seconds(3.4),
            },
            {
              text: "כשלא זוכרים בעל־פה מה קרה שם",
              icon: "bulb",
              at: seconds(6.6),
            },
          ]}
        />
      </Beat>

      {/* --- Teams transcripts: the one feature that behaves differently ---- */}

      <Beat id="pivot">
        <StatementScene
          kicker="ועכשיו"
          statement="פיצ׳ר קצת שונה מכל מה שראינו — ולכן מקבל התייחסות נפרדת"
          emphasise={["נפרדת"]}
          align="center"
        />
      </Beat>

      <Beat id="transcripts">
        <StatementScene
          kicker="קלוד קורא גם"
          statement="תמלולים של פגישות Teams שהוקלטו"
          emphasise={["תמלולים"]}
          graphic={({ width, height }) => (
            <div
              style={{
                width,
                height,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DocSheet
                width={width * 0.82}
                height={height * 0.9}
                lines={STRUCTURED_LINES}
                progress={1}
                tag="● REC"
                tagColor={COLORS.accent}
              />
            </div>
          )}
          panel={{ width: 620, height: 460 }}
        />
      </Beat>

      <Beat id="not-invite">
        <ContrastScene
          not={{ label: "לא רק", lines: ["ההזמנה שביומן"] }}
          but={{ label: "אלא", lines: ["מה שבאמת נאמר בפגישה"] }}
          butAt={seconds(2.0)}
        />
      </Beat>

      <Beat id="transcript-ask">
        <ShowcaseScene
          screen={SCREENS.home}
          windowWidth={WINDOW}
          title="עובד כמו כל שאלה אחרת"
          steps={[
            {
              ...COMPOSER_SHOT,
              label: "מה נאמר על התקציב?",
              side: "top",
              reach: 150,
              moveDuration: seconds(0.9),
            },
          ]}
          extras={
            <TypedPrompt
              region={HOME.promptLine}
              text="בתמלול הפגישה מהשבוע שעבר — מה נאמר על התקציב?"
              delay={seconds(1.2)}
              speed={20}
            />
          }
        />
      </Beat>

      <Beat id="but-separate">
        <StatementScene
          kicker="אבל — ורק כאן יש ׳אבל׳"
          statement="הגישה לתמלולים היא הרשאה נפרדת"
          emphasise={["נפרדת"]}
          footnote="מהחיבור הכללי שעשינו ל‑Microsoft"
          align="center"
        />
      </Beat>

      <Beat id="needs-approval">
        <StatementScene
          statement="לא נפתחת אוטומטית — ודורשת אישור נוסף ברמת הארגון"
          emphasise={["אישור", "נוסף"]}
          align="start"
          graphic={({ width, height }) => (
            <div
              style={{
                width,
                height,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LineIcon
                name="lock"
                size={Math.min(width, height) * 0.68}
                color={COLORS.warn}
                drawFrames={seconds(1.0)}
                idle
              />
            </div>
          )}
          panel={{ width: 320, height: 320 }}
        />
      </Beat>

      <Beat id="not-a-bug">
        <ContrastScene
          heading="אם קיבלתם ׳לא נגיש׳"
          not={{ label: "זו לא", lines: ["תקלה"] }}
          but={{ label: "פשוט", lines: ["התמלול עוד לא שותף אליכם"] }}
          butAt={seconds(2.4)}
        />
      </Beat>

      {/* Where recording is turned on — the menu the caveat is really about. */}
      <Beat id="who-records">
        <CanvasScene
          captions={[
            {
              at: seconds(3.6),
              text: "מי שמקליט — משתף. הקלטתם? אין בעיה",
              emphasise: ["משתף"],
            },
          ]}
        >
          {(size) => (
            <TeamsRecordMock
              {...size}
              moreAt={seconds(0.6)}
              menuAt={seconds(1.2)}
              submenuAt={seconds(2.3)}
              clickAt={seconds(3.3)}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="recap-module">
        <ItemsScene
          kicker="בזה סיימנו את מודול העבודה האפקטיבית"
          blockWidth={1000}
          items={[
            { text: "לנסח בקשה טובה", icon: "quote", at: seconds(0.4) },
            { text: "לעבוד עם הקבצים עצמם", icon: "files", at: seconds(3.4) },
            {
              text: "ולשלוף מידע ישירות מהמערכות שלכם",
              icon: "flow",
              at: seconds(6.4),
            },
          ]}
        />
      </Beat>

      <Beat id="outro" extend={1.2}>
        <OutroScene
          statement="מכאן — עוברים ליכולות המתקדמות"
          emphasise={["המתקדמות"]}
          nextUp="חיפוש באינטרנט, Projects ו‑Skills"
          nextLabel="במודול הבא"
        />
      </Beat>
    </AbsoluteFill>
  );
};
