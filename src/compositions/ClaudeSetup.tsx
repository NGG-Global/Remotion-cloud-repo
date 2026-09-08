import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { CrossFade } from "../components/CrossFade";
import { ABCompare } from "../graphics/ABCompare";
import { EffortDial } from "../graphics/EffortDial";
import { ModelLadder } from "../graphics/ModelLadder";
import { Overkill } from "../graphics/Overkill";
import { PermissionGate } from "../graphics/PermissionGate";
import { PlatformGrid } from "../graphics/PlatformGrid";
import { CardsScene } from "../scenes/CardsScene";
import { ContrastScene } from "../scenes/ContrastScene";
import { ItemsScene } from "../scenes/ItemsScene";
import { OutroScene } from "../scenes/OutroScene";
import { ShowcaseScene } from "../scenes/ShowcaseScene";
import { StagedScene } from "../scenes/StagedScene";
import { StatementScene } from "../scenes/StatementScene";
import { TitleScene } from "../scenes/TitleScene";
import { EP2, type BeatIdEp2 } from "../script";
import { seconds } from "../theme";
import { SCREENS } from "../ui/screens";

const HOME = SCREENS.home.regions;
const PICKER = SCREENS.modelPicker.regions;
const ATTACH = SCREENS.attachMenu.regions;
const SETTINGS = SCREENS.settings.regions;
const DOWNLOAD = SCREENS.download.regions;
const CONNECTORS = SCREENS.connectors.regions;

/** The narration, plus a beat of air at the end. */
export const CLAUDE_SETUP_DURATION = seconds(EP2.totalSeconds + 1.2);

const CROSSFADE = seconds(0.34);

/**
 * Places a scene on episode 2's narration timeline. Positions come from
 * `src/script.ts`, so a scene cannot drift out of sync with the voice.
 */
const Beat: React.FC<{
  readonly id: BeatIdEp2;
  readonly extend?: number;
  readonly children: React.ReactNode;
}> = ({ id, extend = 0, children }) => (
  <Sequence
    from={seconds(EP2.at(id))}
    durationInFrames={seconds(EP2.length(id) + extend) + CROSSFADE}
    name={id}
  >
    <CrossFade frames={CROSSFADE}>{children}</CrossFade>
  </Sequence>
);

/**
 * Episode 2 of the Claude explainer series: getting in and getting set up.
 *
 * Five interface screenshots carry the walkthrough sections; the stretches
 * about choosing a model and about cost are abstract, so they carry drawn
 * graphics rather than screenshots.
 */
export const ClaudeSetup: React.FC = () => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile("audio/narration-ep2.mp3")} />

      <Beat id="title">
        <TitleScene
          kicker="מדריך קלוד · פרק שני"
          title="מתחברים ומתחילים"
          subtitle="התקנה, חשבון, והמסך שממנו הכל מתחיל"
        />
      </Beat>

      <Beat id="roadmap">
        <ItemsScene
          heading="בסרטון הזה"
          blockWidth={760}
          items={[
            { text: "נתקין", marker: "1", icon: "files", at: seconds(0.2) },
            { text: "נתחבר", marker: "2", icon: "lock", at: seconds(1.1) },
            {
              text: "ונעבור על המסך",
              marker: "3",
              icon: "slides",
              at: seconds(2.0),
            },
          ]}
        />
      </Beat>

      <Beat id="hook-setting">
        <StatementScene
          kicker="ובדרך נעצור על הגדרה אחת"
          statement="שרוב המשתמשים מדלגים עליה — והיא זו שמשפיעה יותר מכל על איכות התוצאה"
          emphasise={["יותר", "מכל"]}
          align="center"
        />
      </Beat>

      {/* --- The account -------------------------------------------------- */}

      <Beat id="chapter-account">
        <ContrastScene
          heading="נתחיל מהחשבון"
          not={{ label: "לא", lines: ["חשבון פרטי", "מייל אישי"] }}
          but={{ label: "כן", lines: ["החשבון הארגוני"] }}
          butAt={seconds(3.4)}
        />
      </Beat>

      <Beat id="account-decides">
        <ItemsScene
          kicker="החשבון הארגוני הוא מה שקובע"
          blockWidth={1080}
          items={[
            { text: "לאילו נתונים יש גישה", icon: "files", at: seconds(1.4) },
            {
              text: "אילו כלים פתוחים בפניכם",
              icon: "framework",
              at: seconds(3.4),
            },
            {
              text: "ובאילו תנאים המידע שלכם מטופל",
              icon: "shield",
              at: seconds(5.6),
            },
          ]}
        />
      </Beat>

      <Beat id="account-outside">
        <StatementScene
          statement="עבודה מחשבון פרטי מוציאה אתכם מהמסגרת הזאת"
          emphasise={["מוציאה"]}
          align="center"
        />
      </Beat>

      <Beat id="platforms">
        <StatementScene
          kicker="אותו חשבון עובד בכל מקום"
          statement="והשיחות עוברות איתכם בין המכשירים"
          graphic={({ width, height }) => (
            <PlatformGrid width={width} height={height} delay={seconds(0.6)} />
          )}
          panel={{ width: 780, height: 460 }}
        />
      </Beat>

      {/* --- Why the desktop app ------------------------------------------ */}

      <Beat id="why-install">
        <StatementScene
          kicker="בדפדפן זה עובד מצוין"
          statement="אז למה בכלל להתקין?"
          align="center"
        />
      </Beat>

      <Beat id="desktop-unlocks">
        <CardsScene
          heading="אפליקציית המחשב פותחת מה שהדפדפן לא יכול"
          cards={[
            {
              title: "קבצים ואפליקציות",
              note: "עבודה מול מה שנמצא אצלכם על המחשב",
              glyph: "folder",
            },
            {
              title: "יכולות מתקדמות",
              note: "אותן נכיר בהמשך הסדרה",
              glyph: "wand",
            },
          ]}
          startAt={seconds(1.2)}
          stagger={seconds(3.4)}
        />
      </Beat>

      <Beat id="install-steps">
        <ShowcaseScene
          screen={SCREENS.download}
          title="עמוד ההורדות"
          windowWidth={1560}
          steps={[
            {
              at: 0,
              region: DOWNLOAD.desktopCard,
              fill: 0.62,
              label: "בוחרים את מערכת ההפעלה",
              side: "right",
              reach: 130,
              moveDuration: seconds(1.2),
            },
            {
              at: seconds(4.4),
              region: DOWNLOAD.macos,
              frameOn: DOWNLOAD.desktopCard,
              fill: 0.72,
              label: "מריצים את הקובץ",
              side: "right",
              reach: 130,
              moveDuration: seconds(1.0),
            },
            {
              at: seconds(7.6),
              region: DOWNLOAD.mobileCard,
              fill: 0.62,
              label: "ובנייד — אותו חשבון",
              side: "left",
              reach: 130,
              moveDuration: seconds(1.1),
            },
          ]}
          cursor={[
            { at: seconds(0.8), region: DOWNLOAD.heading },
            {
              at: seconds(1.8),
              region: DOWNLOAD.macos,
              click: true,
              duration: seconds(0.9),
            },
            {
              at: seconds(7.8),
              region: DOWNLOAD.ios,
              click: true,
              duration: seconds(1.0),
            },
          ]}
        />
      </Beat>

      {/* --- The screen --------------------------------------------------- */}

      <Beat id="first-open">
        <ShowcaseScene
          screen={SCREENS.home}
          title="המסך הראשי"
          windowWidth={1620}
          steps={[
            {
              at: 0,
              region: HOME.composer,
              frameOn: HOME.composerBlock,
              fill: 0.8,
              label: "שדה טקסט אחד",
              side: "top",
              reach: 105,
              moveDuration: seconds(1.4),
            },
          ]}
        />
      </Beat>

      <Beat id="entry-point">
        <StatementScene
          statement="זו נקודת הכניסה לכל דבר"
          emphasise={["לכל", "דבר"]}
          align="center"
        />
      </Beat>

      <Beat id="chat-history">
        <ShowcaseScene
          screen={SCREENS.home}
          title="המסך הראשי"
          windowWidth={1620}
          revealFrames={seconds(0.3)}
          steps={[
            {
              at: 0,
              region: HOME.chatList,
              fill: 0.8,
              label: "השיחות נשמרות, לפי זמן",
              side: "right",
              reach: 150,
              moveDuration: seconds(1.3),
            },
          ]}
        />
      </Beat>

      <Beat id="attach">
        <ShowcaseScene
          screen={SCREENS.attachMenu}
          title="צירוף קבצים"
          windowWidth={1620}
          steps={[
            {
              at: 0,
              region: ATTACH.plusButton,
              frameOn: ATTACH.composer,
              fill: 0.72,
              label: "כאן מצרפים",
              side: "top",
              reach: 110,
              moveDuration: seconds(1.2),
            },
            {
              at: seconds(4.2),
              region: ATTACH.inputGroup,
              fill: 0.66,
              label: "מסמכים, טבלאות, מצגות ותמונות",
              side: "right",
              reach: 140,
              moveDuration: seconds(1.1),
            },
          ]}
          cursor={[
            { at: seconds(0.6), region: ATTACH.composer },
            {
              at: seconds(1.4),
              region: ATTACH.plusButton,
              click: true,
              duration: seconds(0.7),
            },
          ]}
        />
      </Beat>

      <Beat id="model-chip">
        <ShowcaseScene
          screen={SCREENS.home}
          title="בורר המודל"
          windowWidth={1620}
          steps={[
            {
              at: 0,
              region: HOME.modelPicker,
              frameOn: HOME.composerBlock,
              fill: 0.78,
              label: "ההגדרה מהפתיחה — בורר המודל",
              side: "top",
              reach: 115,
              moveDuration: seconds(1.3),
            },
          ]}
        />
      </Beat>

      <Beat id="settings-corner">
        <ShowcaseScene
          screen={SCREENS.home}
          title="ארבעה דברים"
          windowWidth={1620}
          revealFrames={seconds(0.3)}
          steps={[
            {
              at: 0,
              region: HOME.account,
              frameOn: HOME.sidebar,
              fill: 0.86,
              label: "ובפינה — ההגדרות",
              side: "right",
              reach: 150,
              moveDuration: seconds(1.2),
            },
            { at: seconds(3.6), fill: 0.95, moveDuration: seconds(1.2) },
          ]}
        />
      </Beat>

      {/* --- Choosing a model --------------------------------------------- */}

      <Beat id="chapter-models">
        <ShowcaseScene
          screen={SCREENS.modelPicker}
          title="בחירת מודל"
          windowWidth={1620}
          steps={[
            {
              at: 0,
              region: PICKER.panel,
              fill: 0.7,
              label: "אז מה בוחרים?",
              side: "left",
              reach: 130,
              moveDuration: seconds(1.4),
            },
          ]}
          cursor={[
            { at: seconds(0.5), region: PICKER.composer },
            {
              at: seconds(1.2),
              region: PICKER.modelChip,
              click: true,
              duration: seconds(0.8),
            },
          ]}
        />
      </Beat>

      <Beat id="model-family">
        <StatementScene
          statement="קלוד הוא לא מודל אחד, אלא משפחה של מודלים"
          emphasise={["משפחה"]}
          align="center"
        />
      </Beat>

      <Beat id="model-axes">
        <StatementScene
          kicker="כולם עושים פחות או יותר אותם דברים"
          statement="הם נבדלים במהירות, בעומק החשיבה ובמשאבים"
          emphasise={["במהירות,", "בעומק", "ובמשאבים"]}
          graphic={({ width, height }) => (
            <ModelLadder width={width} height={height} delay={seconds(0.5)} />
          )}
          panel={{ width: 800, height: 470 }}
        />
      </Beat>

      <Beat id="haiku">
        <ItemsScene
          kicker="Haiku"
          heading="הקל והמהיר"
          blockWidth={880}
          items={[
            { text: "לסכם טקסט קצר", icon: "text", at: seconds(3.0) },
            { text: "לחלץ מידע", icon: "table", at: seconds(4.6) },
            { text: "לנסח משהו פשוט", icon: "pen", at: seconds(6.2) },
            { text: "תשובה מהירה", icon: "clock", at: seconds(7.8) },
          ]}
        />
      </Beat>

      <Beat id="sonnet">
        <ItemsScene
          kicker="Sonnet"
          heading="מכאן הייתי מתחיל ברוב המשימות"
          blockWidth={900}
          items={[
            { text: "כתיבה", icon: "pen", at: seconds(4.0) },
            { text: "ניתוח", icon: "report", at: seconds(5.4) },
            { text: "עבודה בכמה שלבים", icon: "flow", at: seconds(6.8) },
          ]}
        />
      </Beat>

      <Beat id="sonnet-default">
        <StatementScene
          kicker="פתחתם את הבורר ואין לכם מושג?"
          statement="Sonnet הוא בדרך כלל הימור מצוין"
          emphasise={["הימור", "מצוין"]}
          align="center"
        />
      </Beat>

      <Beat id="opus">
        <ItemsScene
          kicker="Opus"
          heading="כאן נכנסת חשיבה לעומק"
          blockWidth={940}
          items={[
            { text: "מחקר", icon: "globe", at: seconds(2.6) },
            { text: "ניתוח מורכב", icon: "report", at: seconds(4.0) },
            { text: "פתרון בעיות", icon: "bulb", at: seconds(5.4) },
            {
              text: "משימה שסונט לא הצליח בה",
              icon: "scale",
              at: seconds(7.0),
            },
          ]}
        />
      </Beat>

      <Beat id="fable">
        <StatementScene
          kicker="Fable"
          statement="למשימות הכבדות והארוכות באמת"
          emphasise={["הכבדות", "והארוכות"]}
          align="center"
        />
      </Beat>

      <Beat id="fable-plans">
        <ItemsScene
          kicker="במקום לעבוד שלב שלב"
          heading="מתארים את התוצאה — והוא מתכנן את הדרך"
          blockWidth={1000}
          items={[
            { text: "מתכנן את הדרך", icon: "framework", at: seconds(2.2) },
            { text: "מתקדם בין השלבים", icon: "flow", at: seconds(3.6) },
            { text: "ובודק את עצמו תוך כדי", icon: "check", at: seconds(5.0) },
          ]}
        />
      </Beat>

      <Beat id="cost">
        <StatementScene
          statement="איטי ויקר יותר מבחינת המכסה"
          align="center"
        />
      </Beat>

      <Beat id="strongest-not-right">
        <StatementScene
          kicker="נקודה חשובה"
          statement="לא תמיד המודל הכי חזק הוא המודל הכי נכון"
          emphasise={["נכון"]}
          graphic={({ width, height }) => (
            <Overkill width={width} height={height} delay={seconds(1.6)} />
          )}
          panel={{ width: 780, height: 500 }}
        />
      </Beat>

      <Beat id="consultant">
        <StatementScene
          statement="זה כמו להזמין יועץ בכיר כדי להקליד פרוטוקול פגישה"
          emphasise={["יועץ", "בכיר"]}
          footnote="הוא בהחלט מסוגל — פשוט לא בטוח שזו הדרך הכי חכמה"
          align="center"
        />
      </Beat>

      {/* --- Effort -------------------------------------------------------- */}

      <Beat id="effort-intro">
        <ShowcaseScene
          screen={SCREENS.modelPicker}
          title="Effort"
          windowWidth={1620}
          steps={[
            {
              at: 0,
              region: PICKER.effort,
              frameOn: PICKER.panel,
              fill: 0.78,
              label: "כמה מאמץ להשקיע בחשיבה",
              side: "left",
              reach: 130,
              moveDuration: seconds(1.3),
            },
          ]}
          cursor={[
            { at: seconds(0.6), region: PICKER.sonnet },
            {
              at: seconds(1.6),
              region: PICKER.effort,
              click: true,
              duration: seconds(0.8),
            },
          ]}
        />
      </Beat>

      <Beat id="effort-levels">
        <StatementScene
          kicker="שלוש רמות"
          statement="ברירת המחדל מתאימה לרוב"
          graphic={({ width, height }) => (
            <EffortDial
              width={width}
              height={height}
              delay={seconds(0.5)}
              hold={seconds(3.4)}
            />
          )}
          panel={{ width: 760, height: 450 }}
        />
      </Beat>

      {/* --- The experiment ------------------------------------------------ */}

      <Beat id="experiment-intro">
        <StatementScene
          kicker="עדיין לא יודעים איזה מודל מתאים?"
          statement="קחו משימה שאתם מכירים היטב — דוח שכבר קראתם"
          emphasise={["מכירים", "היטב"]}
          align="center"
        />
      </Beat>

      <Beat id="experiment-run" extend={17.5}>
        <StagedScene
          heading="הריצו אותה פעמיים"
          panel={{ width: 780, height: 470 }}
          steps={[
            {
              at: seconds(0.3),
              graphic: ({ width, height }) => (
                <ABCompare
                  width={width}
                  height={height}
                  delay={seconds(0.3)}
                  lengthAt={seconds(4.6)}
                  diffAt={seconds(9.4)}
                />
              ),
              caption: "פעם אחת על Haiku, פעם אחת על Sonnet",
            },
            {
              at: seconds(7.7),
              graphic: ({ width, height }) => (
                <ABCompare
                  width={width}
                  height={height}
                  delay={seconds(-7.4)}
                  lengthAt={seconds(-2.8)}
                  diffAt={seconds(2.0)}
                />
              ),
              caption: "אל תבדקו מי ארוך יותר — תחפשו את ההבדלים",
              emphasise: ["ההבדלים"],
            },
          ]}
        />
      </Beat>

      <Beat id="experiment-learn">
        <ItemsScene
          kicker="אחרי כמה ניסויים כאלה"
          blockWidth={1100}
          items={[
            {
              text: "האם Haiku פספס משהו חשוב?",
              icon: "warning",
              at: seconds(0.6),
            },
            { text: "האם Sonnet הבין ניואנס?", icon: "bulb", at: seconds(2.4) },
            {
              text: "האם בכלל יש הבדל משמעותי?",
              icon: "scale",
              at: seconds(4.2),
            },
            {
              text: "ומתי אין שום סיבה להפעיל את התותחים הכבדים",
              icon: "check",
              at: seconds(7.0),
            },
          ]}
        />
      </Beat>

      {/* --- Settings ------------------------------------------------------ */}

      <Beat id="chapter-settings">
        <ShowcaseScene
          screen={SCREENS.settings}
          title="הגדרות"
          windowWidth={1600}
          steps={[
            {
              at: 0,
              region: SETTINGS.nav,
              fill: 0.66,
              label: "כמה דברים ששווה לסדר פעם אחת",
              side: "right",
              reach: 140,
              moveDuration: seconds(1.4),
            },
          ]}
        />
      </Beat>

      <Beat id="prefs-context">
        <ShowcaseScene
          screen={SCREENS.settings}
          title="העדפות אישיות"
          windowWidth={1600}
          revealFrames={seconds(0.3)}
          steps={[
            {
              at: 0,
              region: SETTINGS.instructionsBlock,
              fill: 0.82,
              label: "קצת קונטקסט עליי",
              side: "top",
              reach: 110,
              moveDuration: seconds(1.3),
            },
          ]}
        />
      </Beat>

      <Beat id="prefs-example">
        <ItemsScene
          kicker="לדוגמה"
          blockWidth={1080}
          items={[
            { text: "אני עובד בשיווק", icon: "megaphone", at: seconds(0.8) },
            {
              text: "רוצה תשובות קצרות וישירות",
              icon: "text",
              at: seconds(3.0),
            },
            {
              text: "ומעדיף דוגמאות מעולם התוכן שלי",
              icon: "doc",
              at: seconds(5.0),
            },
            {
              text: "מגדירים פעם אחת — במקום להסביר בכל צ'אט",
              icon: "check",
              at: seconds(7.8),
            },
          ]}
        />
      </Beat>

      <Beat id="prefs-style">
        <ShowcaseScene
          screen={SCREENS.settings}
          title="סגנון הכתיבה"
          windowWidth={1600}
          revealFrames={seconds(0.3)}
          steps={[
            {
              at: 0,
              region: SETTINGS.preferencesBlock,
              fill: 0.82,
              label: "מגדירים את הכיוון מראש",
              side: "top",
              reach: 110,
              moveDuration: seconds(1.3),
            },
          ]}
        />
      </Beat>

      <Beat id="prefs-style-saves">
        <StatementScene
          statement="זה חוסך את ה״תכתוב לי את זה קצת יותר קצר״ בכל פעם מחדש"
          align="center"
        />
      </Beat>

      <Beat id="capabilities">
        <ShowcaseScene
          screen={SCREENS.attachMenu}
          title="יכולות"
          windowWidth={1620}
          steps={[
            {
              at: 0,
              region: ATTACH.contextGroup,
              fill: 0.62,
              label: "מה זמין ופעיל אצלכם",
              side: "right",
              reach: 140,
              moveDuration: seconds(1.4),
            },
            {
              at: seconds(5.6),
              region: ATTACH.webSearch,
              frameOn: ATTACH.contextGroup,
              fill: 0.72,
              label: "חיפוש ברשת, יצירת קבצים, הקשר משיחות",
              side: "right",
              reach: 140,
              moveDuration: seconds(1.1),
            },
          ]}
        />
      </Beat>

      <Beat id="capabilities-know">
        <StatementScene
          kicker="לא חייבים לשנות כאן כלום"
          statement="פשוט חשוב לדעת מה קלוד יכול לעשות בחשבון שלכם"
          emphasise={["לדעת"]}
          align="center"
        />
      </Beat>

      <Beat id="connections-teaser">
        <ShowcaseScene
          screen={SCREENS.connectors}
          title="חיבורים למערכות הארגוניות"
          windowWidth={1600}
          steps={[
            {
              at: 0,
              region: CONNECTORS.connectedPair,
              // Framed loose enough to leave the label somewhere to sit.
              fill: 0.56,
              label: "נושא לסרטון שלם",
              side: "left",
              reach: 140,
              moveDuration: seconds(1.4),
            },
          ]}
        />
      </Beat>

      <Beat id="org-locked">
        <StatementScene
          kicker="הערה למי שעובד בחשבון ארגוני"
          statement="חלק מהאפשרויות יהיו נעולות, או שונות ממה שאתם רואים אצלי — וזה בסדר"
          emphasise={["נעולות,"]}
          graphic={({ width, height }) => (
            <PermissionGate
              width={width}
              height={height}
              delay={seconds(1.0)}
            />
          )}
          panel={{ width: 760, height: 470 }}
        />
      </Beat>

      <Beat id="org-level">
        <StatementScene
          statement="בחשבונות ארגוניים חלק מההחלטות מוגדרות ברמת הארגון"
          emphasise={["ברמת", "הארגון"]}
          footnote="ולא על ידי כל משתמש בנפרד"
          align="center"
        />
      </Beat>

      {/* --- Close --------------------------------------------------------- */}

      <Beat id="summary">
        <ItemsScene
          kicker="בשלב הזה קלוד כבר מוגדר"
          blockWidth={1060}
          items={[
            {
              text: "אתם יודעים מה הוא יודע לעשות",
              icon: "check",
              at: seconds(1.6),
            },
            {
              text: "ואתם יודעים לבחור מודל לפי המשימה",
              icon: "scale",
              at: seconds(4.0),
            },
            {
              text: "במקום לבחור את זה שנראה הכי חזק",
              icon: "warning",
              at: seconds(7.2),
            },
          ]}
        />
      </Beat>

      <Beat id="outro" extend={1.2}>
        <OutroScene
          statement="מכלי שעונים לו בצ'אט — לכלי שמשתלב ביום העבודה"
          emphasise={["שמשתלב"]}
          nextUp="נחבר את קלוד למיקרוסופט 365 — מיילים, קבצים ופגישות"
        />
      </Beat>
    </AbsoluteFill>
  );
};
