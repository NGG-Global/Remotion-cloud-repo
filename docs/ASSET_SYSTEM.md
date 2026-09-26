# Asset system

Scenes should select assets from `src/assets/registry.ts` and place them with the components in `src/library.ts`. The registry is the list of real files and real poses. If an id is not in it, it does not exist.

Import the public API from `src/library.ts`:

```tsx
import {
  Animation,
  ASSETS,
  Background,
  Camera,
  Character,
  Layer,
  Prop,
  Scene,
} from "./library";
import { movement } from "./animation/presets";
```

`ASSETS.characters.genericMan` is the metadata object. The `id` field (`"generic-male"`) is what components accept. TypeScript rejects an id that is not in the registry.

## Building a scene

```tsx
const frame = useCurrentFrame();
const walk = movement.walkAcross(frame, {
  fromX: 280,
  toX: 780,
  durationInFrames: 140,
});

<Scene>
  <Background asset="house-interior-night" scaleMode="cover" />
  <Camera preset="slowPushIn">
    <Character
      character="generic-male"
      action="walk"
      direction="right"
      x={walk.x}
      y={900}
    />
    <Prop asset="wooden-table" x={1280} y={900} />
    <Prop asset="telephone" x={1240} y={600} />
  </Camera>
  <Layer zIndex={8}>
    <Animation asset="fog" />
  </Layer>
</Scene>;
```

`x` and `y` on a character or prop are the anchor. Characters and these props use bottom-center, so `y` is the floor or the tabletop.

Motion comes from `useCurrentFrame()`, `interpolate()`, and `spring()`. Do not use CSS transitions, `requestAnimationFrame`, or `setTimeout` to move something through the timeline.

## Adding a character

Vector characters are drawn by `src/assets/characters/VectorCharacter.tsx`. The poses that rig implements are `IMPLEMENTED_VECTOR_ACTIONS` in `src/assets/actions.ts`.

To add a costume that uses the same poses, add an entry to `vectorCharacters` in `src/assets/builtin.ts` with `renderer: "vector"`, a `costume` the rig understands, and only actions the rig implements. Then teach `PALETTES` in `VectorCharacter.tsx` that costume.

Do not list an action the rig does not draw. `npm run assets:validate` fails when a character names an action outside the rig.

## Adding a background

1. Put the file in `public/assets/backgrounds/`.
2. Register it:

```bash
npm run asset:add -- \
  --id suburban-exterior \
  --type background \
  --file ./my-background.svg \
  --description "Daytime suburban house." \
  --creator "Project original" \
  --license Original \
  --tags house,day \
  --width 1920 \
  --height 1080
```

Use it with `<Background asset="suburban-exterior" scaleMode="cover" />`.

`scaleMode` is `cover` or `contain`. `pan`, `zoom`, `blur`, `brightness`, and `opacity` are optional and frame-driven.

## Adding a prop

Same command with `--type prop`. The anchor for props added by the script is bottom-center.

```tsx
<Prop asset="telephone" x={900} y={720} scale={1} />
```

## Adding a Rive character

1. Export a `.riv` from Rive and put it in `public/assets/rive/`.
2. Read the artboard name and the linear animation names from the Rive editor. Copy them exactly.
3. Register only those names:

```bash
npm run asset:add -- \
  --id guide \
  --type character \
  --file ./guide.riv \
  --description "Rigged guide." \
  --creator "Ada Lovelace" \
  --license "CC-BY-4.0" \
  --source-url "https://example.com/guide.riv" \
  --artboard "Character" \
  --animations idle,walk \
  --width 240 \
  --height 420
```

`--animations` must be names that exist on that artboard, and each one must also be a known pose name (`idle`, `walk`, `run`, `talk`, `lookLeft`, `lookRight`, `point`, `sit`, `scared`, `surprised`, `crouch`). If the file has no `scared` timeline, do not pass `scared`.

`<Character character="guide" action="walk" />` plays that timeline. A missing name throws `AssetError` and the message lists the names that are actually in the file.

State machines are recorded with `--state-machines` and shown in the playground. This wrapper does not play them. It seeks a linear animation from the current frame.

The wasm runtime is `public/assets/rive/rive.wasm` (MIT, from `@rive-app/canvas-advanced`). Do not point `locateFile` at unpkg.

`vehicles` is a sample truck, not a person. Its license is `unknown`.

## Adding a Lottie animation

Put the JSON in `public/assets/lottie/` and register it with `--type lottie`. The script reads `w` and `h` from the file. Validation rejects JSON that has no layers or no `w`, `h`, `op`, or `fr`.

```tsx
<LottieAsset asset="dust-particles" loop />
```

Lottie files are loaded with `staticFile()` and `fetch`. Do not pass a remote URL to `<Lottie>`.

## Adding a new character action

1. Add the name to `CHARACTER_ACTIONS` and `IMPLEMENTED_VECTOR_ACTIONS` in `src/assets/actions.ts`.
2. Add a `case` in `poseAt` (`src/assets/characters/pose.ts`). The `default` branch is `never`, so TypeScript fails until the pose exists.
3. Add the name to each vector character that should offer it.

A Rive character gets the action only when that name is a timeline in its `.riv`.

## Using the camera

```tsx
<Camera preset="slowPushIn">
  {children}
</Camera>

<Camera
  from={{ x: 0, y: 0, scale: 1 }}
  to={{ x: -120, y: 30, scale: 1.12 }}
  durationInFrames={90}
>
  {children}
</Camera>
```

Presets: `static`, `slowPushIn`, `slowPullOut`, `panLeft`, `panRight`, `tiltUp`, `tiltDown`, `handheldSubtle`.

`from` / `to` replace the preset endpoints. `handheldSubtle` still adds a small sine wobble from the frame number. Positive `x` moves the world right.

## Using animation presets

```tsx
import { entrances, exits, movement } from "./animation/presets";

const style = entrances.fade(frame, { durationInFrames: 20 });
const slide = entrances.slideLeft(frame);
const gone = exits.fade(frame, { startFrame: 40 });
const across = movement.walkAcross(frame, {
  fromX: 200,
  toX: 900,
  durationInFrames: 120,
});
```

Also: `entrances.slideRight`, `entrances.scaleIn`, `movement.drift`, `movement.float`, `movement.bob`.

Apply the returned style, or pass `across.x` into `<Character x={...} />`. Do not copy the easing math into a scene.

## Validating assets

```bash
npm run assets:validate
npm run preflight
```

`assets:validate` fails when a registry entry points at a missing file, the extension is wrong, a Lottie file is malformed, an id is reused with different metadata, a character action is not implemented, a path disagrees in case, a file is zero bytes, or metadata is missing a description, tags, license, or creator.

Optional assets may be missing. Everything else must be on disk. License `unknown` is allowed and means the license was not stated. Do not replace it with a guess.

`preflight` runs the TypeScript check, asset validation, ESLint, `remotion compositions`, and stills of `AssetPlayground`, `AssetSceneDemo`, and `TitleCard`.

## Inspecting the library

Open the `AssetPlayground` composition. Pages, in order: characters, backgrounds, props, animations, Rive, presets. `src/assets/playground-frames.ts` lists the frame for each page.

## Fallbacks

A required asset that is missing throws `AssetError` with the component name and the asset id. An asset marked `optional: true` draws a red placeholder that includes that same id. Nothing renders the word `undefined` in place of a picture.

## What not to do

Do not invent filenames, Rive timeline names, or image URLs. Do not hotlink a render to a third-party host. Do not build a person out of rectangles when `generic-male` or `police-officer` fits. Do not add a second copy of fade or walk math. Existing explainer and documentary compositions stay as they are; new scenes use this library.
