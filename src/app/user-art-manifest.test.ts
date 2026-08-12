import { existsSync } from 'node:fs';
import path from 'node:path';
import { expect, it } from 'vitest';
import userArtManifest from '../../public/assets/user/manifest.json';

const legacyPrototypeAssetId = /^(cap_[mf]_|chr_0[1-4]_|evt_chr02_|wpn_(0[1-9]|1[0-2])_|smn_0[12]_|enm_0[1-3]_|boss_01_)/;

it('contains only the complete Chapter 01 artwork set as committed WebP assets', () => {
  const received = Object.keys(userArtManifest).sort();

  expect(received).toHaveLength(140);
  expect(received.filter((assetId) => legacyPrototypeAssetId.test(assetId))).toEqual([]);
  for (const assetUrl of Object.values(userArtManifest)) {
    expect(existsSync(path.resolve('public', assetUrl.replace(/^\//, ''))), assetUrl).toBe(true);
  }
});
