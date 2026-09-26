import React, { useEffect, useState } from "react";
import { Lottie, type LottieAnimationData } from "@remotion/lottie";
import { staticFile, useDelayRender } from "remotion";
import { AssetError, warnAsset } from "../../assets/errors";
import { inspectLottie } from "../../assets/lottie-json";
import { getLottie } from "../../assets/lookup";
import type { LottieId } from "../../assets/registry";
import { AssetPlaceholder } from "./AssetPlaceholder";

type LottieAssetProps = {
  readonly asset: LottieId;
  readonly loop?: boolean;
  readonly speed?: number;
  readonly opacity?: number;
  readonly className?: string;
};

/**
 * Plays a Lottie JSON file that lives in the repository.
 * The JSON is checked before `<Lottie>` mounts.
 */
export const LottieAsset: React.FC<LottieAssetProps> = ({
  asset,
  loop,
  speed = 1,
  opacity = 1,
  className,
}) => {
  const definition = getLottie(asset);
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [data, setData] = useState<LottieAnimationData | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let settled = false;
    const handle = delayRender(`Loading Lottie "${definition.id}"`);
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

    fetch(staticFile(definition.src))
      .then(async (response) => {
        if (!response.ok) {
          const error = new AssetError(
            "LottieAsset",
            definition.id,
            `file is missing at public/${definition.src} (HTTP ${response.status})`,
          );
          if (definition.optional) {
            warnAsset(error);
            setMissing(true);
            finish();
            return;
          }
          fail(error);
          return;
        }
        const json: unknown = await response.json();
        const inspection = inspectLottie(json);
        if (!inspection.ok) {
          fail(
            new AssetError(
              "LottieAsset",
              definition.id,
              `invalid Lottie JSON: ${inspection.reason}`,
            ),
          );
          return;
        }
        setData(json as LottieAnimationData);
        finish();
      })
      .catch((error: unknown) => {
        fail(error instanceof Error ? error : new Error(String(error)));
      });

    return () => {
      finish();
    };
  }, [
    cancelRender,
    continueRender,
    definition.id,
    definition.optional,
    definition.src,
    delayRender,
  ]);

  if (missing) {
    return <AssetPlaceholder component="LottieAsset" assetId={definition.id} />;
  }
  if (!data) {
    return null;
  }

  return (
    <Lottie
      animationData={data}
      loop={loop ?? definition.defaultLoop}
      playbackRate={speed}
      className={className}
      style={{ width: "100%", height: "100%", opacity }}
    />
  );
};
