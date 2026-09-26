---
name: remotion-asset-library
description: Use this repository's typed Remotion asset library before building or editing a scene. Inspect the registry, characters, actions, backgrounds, props, Rive files, Lottie files, and animation presets, then compose those. Use when creating a Remotion scene, character, background, prop, camera move, or animation.
---

# Remotion asset library

This project renders video with Remotion. New scenes select and place registered assets. They do not invent a new illustration system for each shot.

Read `docs/ASSET_SYSTEM.md` and `src/assets/registry.ts` before writing a scene.

Remotion packages in this repo are pinned at **4.0.522**. Do not bump one `@remotion/*` package without the others.

## Before building a scene

1. Inspect the asset registry (`src/assets/registry.ts`, exported as `ASSETS` from `src/library.ts`).
2. Inspect existing characters (`ASSETS.characters`).
3. Inspect available character actions on that character (`actions`).
4. Inspect backgrounds (`ASSETS.backgrounds`).
5. Inspect reusable props (`ASSETS.props`).
6. Inspect Rive and Lottie assets (`ASSETS.rive`, `ASSETS.lottie`, `ASSETS.animations`).
7. Inspect animation presets (`src/animation/presets.ts`).
8. Reuse these whenever they fit the shot.
9. Add a new asset only when nothing registered fits. Follow `docs/ASSET_SYSTEM.md`.

## Do not

- invent asset filenames
- invent Rive animation names
- reference nonexistent images
- hotlink random web images
- build characters from arbitrary CSS rectangles if a character exists
- create 30 bespoke SVG illustrations when reusable assets exist
- use nondeterministic animation timing
- use CSS transitions as timeline animation
- use requestAnimationFrame
- use setTimeout
- recreate the same animation utility in multiple files
- hide missing assets with empty catch blocks

## Prefer

- existing registry assets
- Rive characters, when a `.riv` in the registry has the action
- Lottie animations registered under `ASSETS.lottie`
- reusable SVG components and props already in the registry
- existing Remotion animation presets (`entrances`, `exits`, `movement`, `cameraPresets`)
- deterministic frame-driven animation (`useCurrentFrame`, `interpolate`, `spring`)

## How to place them

```tsx
<Scene>
  <Background asset="house-interior-night" />
  <Camera preset="slowPushIn">
    <Character
      character="generic-male"
      action="walk"
      direction="right"
      x={300}
      y={900}
    />
    <Prop asset="wooden-table" x={1100} y={900} />
  </Camera>
</Scene>
```

`character`, `asset`, and `action` are typed. An unknown id or an action that character does not declare is a TypeScript error. If something still slips through, the component throws `AssetError` with the component name and the asset id.

`vehicles` is a sample Rive truck with license `unknown`. It is not a person. Do not use it as a character.

Leave the existing explainer and documentary compositions alone unless you were asked to change them.
