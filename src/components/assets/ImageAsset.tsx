import React, { useEffect, useState } from "react";
import { Img, staticFile, useDelayRender } from "remotion";
import { AssetError, warnAsset } from "../../assets/errors";
import { AssetPlaceholder } from "./AssetPlaceholder";

type Phase = "loading" | "ready" | "missing";

type ImageAssetProps = {
  readonly src: string;
  readonly assetId: string;
  readonly component: string;
  readonly optional?: boolean;
  readonly style?: React.CSSProperties;
  readonly objectFit?: "cover" | "contain" | "fill";
};

/**
 * Local image through `staticFile()`. A missing required file fails the frame.
 * A missing optional file draws a labeled placeholder.
 */
export const ImageAsset: React.FC<ImageAssetProps> = ({
  src,
  assetId,
  component,
  optional = false,
  style,
  objectFit = "contain",
}) => {
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [phase, setPhase] = useState<Phase>("loading");

  useEffect(() => {
    let settled = false;
    const handle = delayRender(`Loading ${component} "${assetId}"`);
    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      continueRender(handle);
    };
    const fail = (error: Error) => {
      if (settled) {
        return;
      }
      settled = true;
      cancelRender(error);
    };

    fetch(staticFile(src))
      .then((response) => {
        if (response.ok) {
          setPhase("ready");
          finish();
          return;
        }
        const error = new AssetError(
          component,
          assetId,
          `file is missing at public/${src} (HTTP ${response.status})`,
        );
        if (optional) {
          warnAsset(error);
          setPhase("missing");
          finish();
          return;
        }
        fail(error);
      })
      .catch((error: unknown) => {
        fail(error instanceof Error ? error : new Error(String(error)));
      });

    return () => {
      finish();
    };
  }, [
    assetId,
    cancelRender,
    component,
    continueRender,
    delayRender,
    optional,
    src,
  ]);

  if (phase === "missing") {
    return <AssetPlaceholder component={component} assetId={assetId} />;
  }
  if (phase !== "ready") {
    return null;
  }

  return (
    <Img
      src={staticFile(src)}
      style={{
        width: "100%",
        height: "100%",
        objectFit,
        ...style,
      }}
    />
  );
};
