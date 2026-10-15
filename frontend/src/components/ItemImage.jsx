import { useState } from "react";
import { Package } from "lucide-react";
import { itemIconUrl } from "../services/gameAssets";

function ItemImage({
  itemId,
  name,
  className = "",
}) {
  const [failedUrl, setFailedUrl] = useState(null);
  const src = itemIconUrl(itemId);

  if (failedUrl === src) {
    return (
      <div
        className={`game-image-fallback ${className}`}
        role="img"
        aria-label={`${name} icon unavailable`}
      >
        <Package size={22} aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      className={className}
      src={src}
      alt={`${name} icon`}
      loading="lazy"
      onError={() => setFailedUrl(src)}
    />
  );
}

export default ItemImage;