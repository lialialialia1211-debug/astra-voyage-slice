import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, it } from 'vitest';
import userArtManifest from '../../public/assets/user/manifest.json';

function expectedReadyAssetIds() {
  return readFileSync(path.resolve('outputs/user-art-checklist.csv'), 'utf8')
    .replace(/^\uFEFF/, '')
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .filter((line) => line.split(',')[6]?.replaceAll('"', '') === 'ready')
    .map((line) => line.split(',')[1]?.replaceAll('"', ''))
    .filter((id): id is string => Boolean(id));
}

it('contains every ready user artwork as a committed WebP asset', () => {
  const expected = expectedReadyAssetIds().sort();
  const received = Object.keys(userArtManifest).sort();

  expect(expected).toHaveLength(63);
  expect(received).toHaveLength(203);
  expect(received).toEqual(expect.arrayContaining(expected));
  for (const assetUrl of Object.values(userArtManifest)) {
    expect(existsSync(path.resolve('public', assetUrl.replace(/^\//, ''))), assetUrl).toBe(true);
  }
});
