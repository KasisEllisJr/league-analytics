import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";

import {
  loadChampionAssets,
  championIconUrl,
  championSplashUrl,
} from "../services/gameAssets";

function ChampionImage({
  championId,
  name,
  variant = "icon",
  className = "",
}) {
  const [asset, setAsset] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setAsset(null);
    setFailed(false);

    loadChampionAssets()
      .then((assets) => {
        if (!cancelled) {
          setAsset(assets.get(Number(championId)) ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [championId]);

  const src = asset
    ? variant === "splash"
      ? championSplashUrl(asset.assetId)
      : championIconUrl(asset.icon)
    : null;

  if (!src || failed) {
    return (
      <div
        className={`game-image-fallback ${className}`}
        role="img"
        aria-label={`${name} artwork unavailable`}
      >
        <ImageOff size={24} aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      key={src}
      className={className}
      src={src}
      alt={`${name} artwork`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export default ChampionImage;