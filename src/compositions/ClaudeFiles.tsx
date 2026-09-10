import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { CrossFade } from "../components/CrossFade";
import { HandOff } from "../graphics/HandOff";
import { LineIcon } from "../graphics/LineIcon";
import { MaterialTransform } from "../graphics/MaterialTransform";
import { ModeAnatomy } from "../graphics/ModeAnatomy";
import { ModeChoice } from "../graphics/ModeChoice";
import { PdfHunt } from "../graphics/PdfHunt";
import { PurposeSplit } from "../graphics/PurposeSplit";
import { StructuredRead } from "../graphics/StructuredRead";
import { CanvasScene } from "../scenes/CanvasScene";
import { ContrastScene } from "../scenes/ContrastScene";
import { ItemsScene } from "../scenes/ItemsScene";
import { OutroScene } from "../scenes/OutroScene";
import { ShowcaseScene } from "../scenes/ShowcaseScene";
import { StatementScene } from "../scenes/StatementScene";
import { TitleScene } from "../scenes/TitleScene";
import { EP5, type BeatIdEp5 } from "../script";
import { COLORS, seconds } from "../theme";
import { AttachedChips } from "../ui/AttachedChips";
import { SCREENS } from "../ui/screens";
import { StruckLine } from "../ui/StruckLine";
import { TypedPrompt } from "../ui/TypedPrompt";

const HOME = SCREENS.home.regions;

/** The narration, plus a beat of air at the end. */
export const CLAUDE_FILES_DURATION = seconds(EP5.totalSeconds + 1.2);

const CROSSFADE = seconds(0.34);

/** Places a scene on episode 5's narration timeline. */
const Beat: React.FC<{
  readonly id: BeatIdEp5;
  readonly extend?: number;
  readonly children: React.ReactNode;
}> = ({ id, extend = 0, children }) => (
  <Sequence
    from={seconds(EP5.at(id))}
    durationInFrames={seconds(EP5.length(id) + extend) + CROSSFADE}
    name={id}
  >
    <CrossFade frames={CROSSFADE}>{children}</CrossFade>
  </Sequence>
);

/**
 * The camera framing used by every composer beat.
 *
 * Held identical across them so consecutive showcase scenes cut without the
 * window appearing to move, which is what lets the composer read as one
 * continuous shot while the beats change around it.
 */
const COMPOSER_SHOT = {
  at: 0,
  region: HOME.composer,
  frameOn: HOME.composerBlock,
  fill: 0.62,
} as const;

/**
 * The same framing without a ring.
 *
 * `useFocus` frames on `frameOn` whether or not a `region` is given, and
 * `ShowcaseScene` only draws an indicator when there is a `region` — so
 * omitting it holds the shot and leaves the frame to the overlay. Used where
 * the overlay *is* the content: a row of files arriving, a question being
 * typed. A ring and a scrim would compete with both.
 */
const COMPOSER_FRAME = {
  at: 0,
  frameOn: HOME.composerBlock,
  fill: 0.62,
  moveDuration: 1,
} as const;

const WINDOW = 1560;

/**
 * Episode 5: files in a conversation, and where Chat stops and Cowork starts.
 *
 * The brief was to let the interface do the demonstrating, and this narration
 * cooperates: almost every claim points at something visible in the home
 * screenshot. So the composer is filmed rather than drawn — a file dragged in,
 * the formats that go with it, the descriptive preamble that is not needed,
 * the weak question and the better ones — and the Chat and Cowork pills carry
 * the turn into the second half.
 *
 * The exception is the second half's subject. Where the files sit is a fact
 * about someone's own machine, and no screenshot of the web app shows a local
 * folder, so `ModeAnatomy` draws it. Same rule as episode 3: film what the
 * interface shows, draw what it cannot.
 */
export const ClaudeFiles: React.FC = () => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile("audio/narration-ep5.mp3")} />

      <Beat id="hook">
        <CanvasScene>
          {(size) => (
            <PdfHunt
              {...size}
              pages={40}
              scrollAt={seconds(1.8)}
              foundAt={seconds(6.4)}
              copyAt={seconds(7.9)}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="ask-instead">
        <StatementScene
          statement="אפשר פשוט לשאול את המסמך"
          emphasise={["לשאול"]}
          align="center"
          panel={{ width: 300, height: 300 }}
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
                name="quote"
                size={Math.min(width, height) * 0.78}
                color={COLORS.accent}
                drawFrames={seconds(1.1)}
                idle
              />
            </div>
          )}
        />
      </Beat>

      <Beat id="title">
        <TitleScene
          kicker="מדריך קלוד · פרק חמישי"
          title="לעבוד על הקבצים עצמם"
          subtitle="ומתי הצ׳אט הוא הכלי הנכון — ומתי בכלל לא"
        />
      </Beat>

      {/* The file goes in. Filmed, because the composer is right there. */}
      <Beat id="drag-in">
        <ShowcaseScene
          screen={SCREENS.home}
          windowWidth={WINDOW}
          title="לגרור קובץ לשיחה"
          steps={[
            {
              ...COMPOSER_SHOT,
              label: "גוררים את הקובץ לתוך השיחה",
              side: "top",
              reach: 150,
              moveDuration: seconds(1.1),
            },
          ]}
          cursor={[
            { at: seconds(0.3), region: HOME.greeting, duration: seconds(0.5) },
            {
              at: seconds(1.2),
              region: HOME.composer,
              duration: seconds(0.7),
              click: true,
            },
          ]}
          extras={
            <AttachedChips
              region={HOME.promptLine}
              files={[
                { name: "סיכום פגישה.docx", kind: "docx", at: seconds(2.1) },
              ]}
            />
          }
        />
      </Beat>

      {/* Everything that goes in. The row keeps the newest arrival on screen
          and lets the earlier ones run off, so six formats fit one line. */}
      <Beat id="formats">
        <ShowcaseScene
          screen={SCREENS.home}
          windowWidth={WINDOW}
          revealFrames={0}
          title="הכול נכנס"
          steps={[COMPOSER_FRAME]}
          extras={
            <AttachedChips
              region={HOME.promptLine}
              newestFirst
              files={[
                { name: "הצעה.pdf", kind: "pdf", at: seconds(0.4) },
                { name: "סיכום.docx", kind: "docx", at: seconds(1.2) },
                { name: "מצגת.pptx", kind: "pptx", at: seconds(2.0) },
                { name: "נתונים.xlsx", kind: "xlsx", at: seconds(2.8) },
                { name: "תמונה.png", kind: "png", at: seconds(3.6) },
                { name: "סריקה.pdf", kind: "pdf", at: seconds(4.4) },
              ]}
            />
          }
        />
      </Beat>

      <Beat id="structure">
        <CanvasScene>
          {(size) => (
            <StructuredRead
              {...size}
              slides={[
                { label: "כותרת", kind: "title", at: seconds(4.6) },
                { label: "גרף", kind: "chart", at: seconds(5.5) },
                { label: "נקודות", kind: "bullets", at: seconds(6.4) },
                { label: "סיכום", kind: "summary", at: seconds(7.3) },
              ]}
              sheetAt={seconds(8.1)}
              parts={[
                { label: "עמודות", at: seconds(9.6) },
                { label: "שורות", at: seconds(10.4) },
                { label: "נוסחאות", at: seconds(11.3) },
              ]}
              heapAt={seconds(12.6)}
            />
          )}
        </CanvasScene>
      </Beat>

      {/* The preamble nobody needs, crossed out, and the file in its place. */}
      <Beat id="dont-describe">
        <ShowcaseScene
          screen={SCREENS.home}
          windowWidth={WINDOW}
          title="לא להסביר — לצרף"
          steps={[
            { ...COMPOSER_SHOT, moveDuration: seconds(0.8) },
            {
              at: seconds(6.2),
              region: HOME.composer,
              frameOn: HOME.composerBlock,
              fill: 0.62,
              label: "מצרפים, ושואלים את השאלה",
              side: "top",
              reach: 150,
            },
          ]}
          extras={
            <>
              <Sequence durationInFrames={seconds(6.1)} layout="none">
                <TypedPrompt
                  region={HOME.promptLine}
                  text="מצורף מסמך ובו סיכום פגישה עם הלקוח, ובתוכו..."
                  delay={seconds(0.7)}
                  speed={17}
                />
                <StruckLine region={HOME.promptLine} at={seconds(4.4)} />
              </Sequence>
              <Sequence from={seconds(6.1)} layout="none">
                <AttachedChips
                  region={HOME.promptLine}
                  files={[
                    {
                      name: "סיכום פגישה.docx",
                      kind: "docx",
                      at: seconds(0.2),
                    },
                  ]}
                />
              </Sequence>
            </>
          }
        />
      </Beat>

      <Beat id="say-why">
        <CanvasScene title="מה כן שווה לומר לו">
          {(size) => (
            <PurposeSplit
              {...size}
              file={{ name: "סיכום פגישה", kind: "pdf" }}
              purposes={[
                {
                  label: "אני מכין ישיבת סטטוס",
                  at: seconds(4.5),
                  output: {
                    title: "נקודות לישיבה",
                    icon: "meeting",
                    at: seconds(7.3),
                    rows: [0.9, 0.78, 0.86, 0.6],
                  },
                },
                {
                  label: "אני צריך לענות ללקוח",
                  at: seconds(8.2),
                  output: {
                    title: "טיוטת מייל",
                    icon: "mail",
                    at: seconds(10.0),
                    rows: [0.95, 0.9, 0.7],
                  },
                },
              ]}
            />
          )}
        </CanvasScene>
      </Beat>

      {/* The weakest thing you can ask a file, typed into the real composer. */}
      <Beat id="summarize-weak">
        <ShowcaseScene
          screen={SCREENS.home}
          windowWidth={WINDOW}
          steps={[
            {
              ...COMPOSER_SHOT,
              label: "השאלה הכי פחות מעניינת",
              side: "top",
              reach: 150,
              moveDuration: seconds(0.9),
            },
          ]}
          extras={
            <TypedPrompt
              region={HOME.promptLine}
              text="תסכם לי את המסמך"
              delay={seconds(1.4)}
              speed={11}
            />
          }
        />
      </Beat>

      {/* Four better questions in the same composer, one after another. */}
      <Beat id="better-questions">
        <ShowcaseScene
          screen={SCREENS.home}
          windowWidth={WINDOW}
          revealFrames={0}
          title="שאלות טובות יותר"
          steps={[COMPOSER_FRAME]}
          extras={
            <>
              {[
                {
                  from: seconds(2.6),
                  until: seconds(3.4),
                  text: "מה ההתנגדויות שעולות כאן, ואיך הן מנוסחות?",
                },
                {
                  from: seconds(6.3),
                  until: seconds(3.3),
                  text: "תוציא לי את כל התאריכים וההתחייבויות לטבלה",
                },
                {
                  from: seconds(9.8),
                  until: seconds(3.4),
                  text: "יש כאן משהו שסותר את מה שסיכמנו בפעם הקודמת?",
                },
                {
                  from: seconds(13.4),
                  until: seconds(5.0),
                  text: "מה חסר במסמך הזה?",
                },
              ].map((q, i) => (
                <Sequence
                  key={i}
                  from={q.from}
                  durationInFrames={q.until}
                  layout="none"
                >
                  <TypedPrompt
                    region={HOME.promptLine}
                    text={q.text}
                    delay={2}
                    speed={19}
                  />
                </Sequence>
              ))}
            </>
          }
        />
      </Beat>

      {/* Two files at a time. The camera holds: only the pairing changes. */}
      <Beat id="multi-file">
        <ShowcaseScene
          screen={SCREENS.home}
          windowWidth={WINDOW}
          revealFrames={0}
          title="כמה קבצים יחד"
          steps={[
            {
              ...COMPOSER_SHOT,
              at: seconds(4.3),
              label: "שתי גרסאות — מה בדיוק השתנה?",
              side: "top",
              reach: 150,
              moveDuration: 1,
            },
            {
              at: seconds(8.4),
              region: HOME.composer,
              frameOn: HOME.composerBlock,
              fill: 0.62,
              label: "שני דוחות — איפה הם לא מסתדרים?",
              side: "top",
              reach: 150,
              moveDuration: 1,
            },
            {
              at: seconds(11.2),
              region: HOME.composer,
              frameOn: HOME.composerBlock,
              fill: 0.62,
              label: "חומר ישן ובריף חדש — מה עדיין רלוונטי?",
              side: "top",
              reach: 150,
              moveDuration: 1,
            },
          ]}
          extras={
            <>
              <Sequence durationInFrames={seconds(8.3)} layout="none">
                <AttachedChips
                  region={HOME.promptLine}
                  files={[
                    { name: "הצעה v1.docx", kind: "docx", at: seconds(4.2) },
                    { name: "הצעה v2.docx", kind: "docx", at: seconds(4.9) },
                  ]}
                />
              </Sequence>
              <Sequence
                from={seconds(8.3)}
                durationInFrames={seconds(2.8)}
                layout="none"
              >
                <AttachedChips
                  region={HOME.promptLine}
                  files={[
                    { name: "דוח רבעון 1.pdf", kind: "pdf", at: 2 },
                    { name: "דוח רבעון 2.pdf", kind: "pdf", at: seconds(0.5) },
                  ]}
                />
              </Sequence>
              <Sequence from={seconds(11.1)} layout="none">
                <AttachedChips
                  region={HOME.promptLine}
                  files={[
                    { name: "חומר קיים.pptx", kind: "pptx", at: 2 },
                    { name: "בריף חדש.docx", kind: "docx", at: seconds(0.5) },
                  ]}
                />
              </Sequence>
            </>
          }
        />
      </Beat>

      <Beat id="transform">
        <CanvasScene title="לקחת מה שקיים">
          {(size) => (
            <MaterialTransform
              {...size}
              pairs={[
                {
                  at: seconds(5.9),
                  from: { label: "מסמך מתודולוגי", icon: "doc" },
                  to: { label: "שקפים", icon: "slides" },
                },
                {
                  at: seconds(9.4),
                  from: { label: "סיכום מפגש", icon: "meeting" },
                  to: { label: "מייל ללקוח", icon: "mail" },
                },
              ]}
              blankAt={seconds(13.0)}
            />
          )}
        </CanvasScene>
      </Beat>

      {/* The turn into the second half, on the toggle the narration is about. */}
      <Beat id="why-cowork">
        <ShowcaseScene
          screen={SCREENS.home}
          windowWidth={WINDOW}
          title="השאלה של השבוע הראשון"
          steps={[
            {
              at: 0,
              region: HOME.modeToggle,
              // Low enough to stay under the upscale cap, so this reads as a
              // pull-back rather than the cap deciding the shot: the toggle
              // stays legible and the rest of the composer stays in frame.
              fill: 0.12,
              dim: false,
              label: "אם קלוד עובד עם קבצים — למה בכלל Cowork?",
              side: "top",
              reach: 170,
              moveDuration: seconds(1.3),
            },
          ]}
          cursor={[
            {
              at: seconds(2.2),
              region: HOME.coworkPill,
              duration: seconds(0.9),
              click: true,
            },
          ]}
        />
      </Beat>

      <Beat id="same-claude">
        <ContrastScene
          heading="ההבדל הוא לא"
          not={{ label: "לא", lines: ["כמה הוא חכם", "זה אותו קלוד"] }}
          but={{
            label: "אלא",
            lines: ["איפה הקבצים יושבים", "ומי מנהל את התהליך"],
          }}
          butAt={seconds(4.2)}
        />
      </Beat>

      {/* Where the files sit. Drawn, because a local folder is not in any
          screenshot of the web app. */}
      <Beat id="mode-anatomy">
        <CanvasScene>
          {(size) => (
            <ModeAnatomy
              {...size}
              uploadAt={seconds(0.6)}
              loopAt={seconds(4.4)}
              downloadAt={seconds(10.6)}
              coworkAt={seconds(13.58)}
              noTransferAt={seconds(21.9)}
              writeBackAt={seconds(24.4)}
              chatSteps={[
                { at: seconds(0.6), label: "מעלים לשיחה" },
                { at: seconds(3.9), label: "קלוד קורא" },
                { at: seconds(7.4), label: "שואלים ומתקנים" },
                { at: seconds(10.6), label: "מורידים למחשב" },
              ]}
              coworkSteps={[
                { at: seconds(14.0), label: "לא מעלים כלום", deny: true },
                { at: seconds(17.0), label: "תיקייה על המחשב" },
                { at: seconds(21.9), label: "בלי הורדות", deny: true },
                { at: seconds(24.4), label: "כותב בחזרה לתיקייה" },
              ]}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="hand-over">
        <CanvasScene>
          {(size) => (
            <HandOff
              {...size}
              strikeAt={seconds(1.6)}
              handOverAt={seconds(2.9)}
              awayAt={seconds(4.8)}
              backAt={seconds(6.6)}
              assurances={[
                { label: "הכול מתועד", icon: "doc", at: seconds(7.4) },
                { label: "אפשר לעצור באמצע", icon: "clock", at: seconds(8.9) },
                { label: "מבקש אישור", icon: "shield", at: seconds(10.6) },
              ]}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="which-when">
        <CanvasScene>
          {(size) => (
            <ModeChoice
              {...size}
              question="אז מתי מה?"
              rows={[
                {
                  at: seconds(5.5),
                  verdict: "צ׳אט",
                  conditions: [
                    { label: "קובץ או שניים", at: seconds(2.0) },
                    { label: "להיות בתוך התהליך", at: seconds(3.6) },
                  ],
                },
                {
                  at: seconds(11.6),
                  verdict: "Cowork",
                  latin: true,
                  conditions: [
                    { label: "תיקייה שלמה", at: seconds(6.4) },
                    { label: "הרבה שלבים", at: seconds(7.8) },
                    { label: "למסור ולחזור לתוצאה", at: seconds(9.3) },
                  ],
                },
              ]}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="switch">
        <StatementScene
          kicker="ואם התחלתם בצ׳אט"
          statement="לגלות באמצע שהמשימה גדולה — ולעבור ל‑Cowork — זה בסדר גמור"
          emphasise={["בסדר", "גמור"]}
          align="center"
          panel={{ width: 280, height: 280 }}
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
                name="repeat"
                size={Math.min(width, height) * 0.76}
                color={COLORS.accent}
                drawFrames={seconds(1.0)}
                idle
              />
            </div>
          )}
        />
      </Beat>

      <Beat id="later">
        <StatementScene
          kicker="בהמשך"
          statement="איך Cowork עובד בפועל — מודול שלם בהמשך. בינתיים מספיק לדעת את הקו"
          emphasise={["את", "הקו"]}
          align="center"
        />
      </Beat>

      <Beat id="recap">
        <ItemsScene
          kicker="לסיכום"
          blockWidth={900}
          items={[
            { text: "תגררו את הקובץ פנימה", icon: "files", at: seconds(0.2) },
            {
              text: "תשאלו שאלה טובה יותר מ״תסכם״",
              icon: "quote",
              at: seconds(3.1),
            },
            {
              text: "תיקייה שלמה? יש לזה מקום אחר",
              icon: "flow",
              at: seconds(6.3),
            },
          ]}
        />
      </Beat>

      <Beat id="outro" extend={1.2}>
        <OutroScene
          statement="מהקובץ שגררתם — לכל מה שכבר נמצא אצלכם בעבודה"
          emphasise={["שכבר", "נמצא"]}
          nextUp="מיילים, קבצים ופגישות ב‑Microsoft 365"
          nextLabel="בפרק הבא"
        />
      </Beat>
    </AbsoluteFill>
  );
};
