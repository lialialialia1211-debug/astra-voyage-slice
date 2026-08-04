import userArtManifestJson from '../generated/user-art-manifest.json';
import { resolveAsset, type AssetManifest } from './assets';

export const userArtManifest: AssetManifest = userArtManifestJson;

export function userAssetUrl(assetId: string): string | null {
  const resolvedUrl = resolveAsset(assetId, userArtManifest).url;
  if (!resolvedUrl) return null;

  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${basePath}${resolvedUrl.startsWith('/') ? resolvedUrl : `/${resolvedUrl}`}`;
}
