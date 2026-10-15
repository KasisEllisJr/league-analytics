// Keep images synchronized with the imported dataset.
export const DDRAGON_VERSION = "16.20.1";

const CDN = "https://ddragon.leagueoflegends.com/cdn";

let championMetadataPromise = null;

// Resolve numeric champion IDs to Data Dragon asset names.
export function loadChampionAssets() {
  if (!championMetadataPromise) {
    championMetadataPromise = fetch(
      `${CDN}/${DDRAGON_VERSION}/data/en_US/champion.json`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load champion assets.");
        }

        return response.json();
      })
      .then((json) => {
        const assets = new Map();

        for (const champion of Object.values(json.data)) {
          assets.set(Number(champion.key), {
            assetId: champion.id,
            icon: champion.image.full,
          });
        }

        return assets;
      })
      .catch((error) => {
        // Allow another attempt if the request fails.
        championMetadataPromise = null;
        throw error;
      });
  }

  return championMetadataPromise;
}

export function championIconUrl(iconFilename) {
  return `${CDN}/${DDRAGON_VERSION}/img/champion/${iconFilename}`;
}

export function championSplashUrl(assetId) {
  return `${CDN}/img/champion/splash/${assetId}_0.jpg`;
}

export function itemIconUrl(itemId) {
  return `${CDN}/${DDRAGON_VERSION}/img/item/${itemId}.png`;
}