import React, { useEffect, useRef, useState } from "react";
import {
  staticFile,
  useCurrentFrame,
  useDelayRender,
  useVideoConfig,
} from "remotion";
import RiveCanvas from "@rive-app/canvas-advanced";
import type {
  Artboard,
  File,
  LinearAnimationInstance,
  RiveCanvas as RiveRuntime,
  WrappedRenderer,
} from "@rive-app/canvas-advanced";
import { AssetError } from "../../assets/errors";

const WASM_PATH = "assets/rive/rive.wasm";

type LoadedRive = {
  readonly runtime: RiveRuntime;
  readonly file: File;
  readonly artboard: Artboard;
  readonly animation: LinearAnimationInstance;
  readonly renderer: WrappedRenderer;
};

export type RivePlaybackProps = {
  readonly src: string;
  readonly artboard: string;
  readonly animation: string;
  readonly assetId: string;
  readonly width: number;
  readonly height: number;
  readonly startFrame?: number;
  readonly speed?: number;
  readonly loop?: boolean;
};

/**
 * Plays a local `.riv` on Remotion's frame clock.
 *
 * `@remotion/rive`'s `<RemotionRiveCanvas>` loads its wasm from unpkg and
 * advances by the delta from the previous frame. Both fight this project's
 * rules: renders must not depend on a third-party host, and a frame must not
 * depend on which frame ran last. This player uses the same
 * `@rive-app/canvas-advanced` runtime that `@remotion/rive` installs, loads
 * `public/assets/rive/rive.wasm` through `staticFile()`, and seeks
 * `animation.time` from `useCurrentFrame()`.
 */
export const RivePlayback: React.FC<RivePlaybackProps> = ({
  src,
  artboard,
  animation,
  assetId,
  width,
  height,
  startFrame = 0,
  speed = 1,
  loop = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState<LoadedRive | null>(null);
  const loadHandle = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    let cancelled = false;
    let current: LoadedRive | null = null;
    const handle = delayRender(`Loading Rive "${assetId}"`);
    loadHandle.current = handle;

    const fail = (error: Error) => {
      if (cancelled) {
        return;
      }
      loadHandle.current = null;
      cancelRender(error);
    };

    RiveCanvas({
      locateFile: () => staticFile(WASM_PATH),
    })
      .then(async (runtime) => {
        const response = await fetch(staticFile(src));
        if (!response.ok) {
          throw new AssetError(
            "RiveAsset",
            assetId,
            `file is missing at public/${src} (HTTP ${response.status})`,
          );
        }
        const bytes = new Uint8Array(await response.arrayBuffer());
        const file = await runtime.load(bytes, undefined, false);
        const board = resolveArtboard(runtime, file, artboard, assetId);
        const clip = resolveAnimation(board, animation, assetId);
        const instance = new runtime.LinearAnimationInstance(clip, board);
        const renderer = runtime.makeRenderer(canvas);
        if (cancelled) {
          instance.delete();
          board.delete();
          renderer.delete();
          file.unref();
          return;
        }
        current = {
          runtime,
          file,
          artboard: board,
          animation: instance,
          renderer,
        };
        setLoaded(current);
      })
      .catch((error: unknown) => {
        fail(error instanceof Error ? error : new Error(String(error)));
      });

    return () => {
      cancelled = true;
      if (loadHandle.current !== null) {
        continueRender(loadHandle.current);
        loadHandle.current = null;
      }
      current?.animation.delete();
      current?.artboard.delete();
      current?.renderer.delete();
      current?.file.unref();
    };
  }, [
    animation,
    artboard,
    assetId,
    cancelRender,
    continueRender,
    delayRender,
    src,
  ]);

  useEffect(() => {
    if (!loaded || !canvasRef.current) {
      return;
    }
    const handle = delayRender(`Drawing Rive "${assetId}" at frame ${frame}`);
    try {
      drawRive({
        loaded,
        canvas: canvasRef.current,
        width,
        height,
        frame,
        fps,
        startFrame,
        speed,
        loop,
      });
      continueRender(handle);
      if (loadHandle.current !== null) {
        continueRender(loadHandle.current);
        loadHandle.current = null;
      }
    } catch (error) {
      cancelRender(error instanceof Error ? error : new Error(String(error)));
    }
  }, [
    assetId,
    cancelRender,
    continueRender,
    delayRender,
    fps,
    frame,
    height,
    loaded,
    loop,
    speed,
    startFrame,
    width,
  ]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
};

const resolveArtboard = (
  _runtime: RiveRuntime,
  file: File,
  name: string,
  assetId: string,
): Artboard => {
  const board = name ? file.artboardByName(name) : file.defaultArtboard();
  if (!board || (name && board.name !== name)) {
    const names: string[] = [];
    for (let index = 0; index < file.artboardCount(); index++) {
      names.push(file.artboardByIndex(index).name);
    }
    throw new AssetError(
      "RiveAsset",
      assetId,
      `artboard "${name}" was not found. Artboards in the file: ${names.join(", ") || "(none)"}`,
    );
  }
  return board;
};

const resolveAnimation = (board: Artboard, name: string, assetId: string) => {
  const names: string[] = [];
  for (let index = 0; index < board.animationCount(); index++) {
    names.push(board.animationByIndex(index).name);
  }
  const machines: string[] = [];
  for (let index = 0; index < board.stateMachineCount(); index++) {
    machines.push(board.stateMachineByIndex(index).name);
  }
  const clip = board.animationByName(name);
  if (!clip || clip.name !== name) {
    const machineNote = machines.includes(name)
      ? ` "${name}" is a state machine. This wrapper plays linear animations only.`
      : "";
    throw new AssetError(
      "RiveAsset",
      assetId,
      `animation "${name}" was not found.${machineNote} Linear animations: ${names.join(", ") || "(none)"}. State machines: ${machines.join(", ") || "(none)"}`,
    );
  }
  return clip;
};

const drawRive = ({
  loaded,
  canvas,
  width,
  height,
  frame,
  fps,
  startFrame,
  speed,
  loop,
}: {
  readonly loaded: LoadedRive;
  readonly canvas: HTMLCanvasElement;
  readonly width: number;
  readonly height: number;
  readonly frame: number;
  readonly fps: number;
  readonly startFrame: number;
  readonly speed: number;
  readonly loop: boolean;
}) => {
  if (canvas.width !== width) {
    canvas.width = width;
  }
  if (canvas.height !== height) {
    canvas.height = height;
  }
  const seconds = Math.max(0, frame - startFrame) * (speed / fps);
  const duration = loaded.animation.duration;
  const time = loop && duration > 0 ? seconds % duration : seconds;
  loaded.animation.time = time;
  loaded.animation.advance(0);
  loaded.animation.apply(1);
  loaded.artboard.advance(0);
  loaded.renderer.clear();
  loaded.renderer.save();
  loaded.renderer.align(
    loaded.runtime.Fit.contain,
    loaded.runtime.Alignment.center,
    { minX: 0, minY: 0, maxX: width, maxY: height },
    loaded.artboard.bounds,
  );
  loaded.artboard.draw(loaded.renderer);
  loaded.renderer.restore();
  loaded.runtime.resolveAnimationFrame();
};
