import userArtManifestJson from '../generated/user-art-manifest.json';
import { resolveAsset, type AssetManifest } from './assets';

export const userArtManifest: AssetManifest = userArtManifestJson;

export function userAssetUrl(assetId: string): string | null {
  return resolveAsset(assetId, userArtManifest).url;
}
