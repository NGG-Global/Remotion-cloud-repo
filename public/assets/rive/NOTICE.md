# Rive runtime and sample

`rive.wasm` is the Canvas2D runtime from `@rive-app/canvas-advanced@2.31.5`, copied into this folder so a render can load it with `staticFile()` instead of fetching unpkg. That package's `package.json` declares `license: MIT`. The package does not ship a separate LICENSE file. Copyright is held by the Rive contributors named in that package.

`vehicles.riv` was downloaded from https://cdn.rive.app/animations/vehicles.riv because Remotion's Rive docs use that URL as a sample. No license was published with the file. The registry marks it `unknown`. Replace it before you ship a video that shows it.
