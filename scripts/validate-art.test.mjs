import { mkdtemp, mkdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { afterEach, expect, it } from 'vitest';
import { validateAndConvert } from './validate-art.mjs';

sharp.cache(false);

const temporaryDirectories = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

it('validates ready PNG art and writes its WebP manifest entry', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'astra-art-'));
  temporaryDirectories.push(root);
  const dropRoot = path.join(root, 'art-drop');
  const outputRoot = path.join(root, 'public', 'assets', 'user');
  const runtimeManifestPath = path.join(root, 'src', 'generated', 'user-art-manifest.json');
  const source = path.join(dropRoot, 'characters', 'sample.png');
  await mkdir(path.dirname(source), { recursive: true });
  await sharp({ create: { width: 2, height: 2, channels: 4, background: { r: 10, g: 20, b: 30, alpha: 0.5 } } }).png().toFile(source);

  const result = await validateAndConvert([{
    category: 'character',
    assetId: 'sample_asset',
    expectedPath: 'art-drop/characters/sample.png',
    sourceSize: '2x2',
    alpha: 'yes',
    status: 'ready',
  }], dropRoot, outputRoot, runtimeManifestPath);

  expect(result.errors).toEqual([]);
  expect(result.manifest).toEqual({ sample_asset: '/assets/user/sample_asset.webp' });
  expect(JSON.parse(await readFile(path.join(outputRoot, 'manifest.json'), 'utf8'))).toEqual(result.manifest);
  expect(JSON.parse(await readFile(runtimeManifestPath, 'utf8'))).toEqual(result.manifest);
  expect((await sharp(path.join(outputRoot, 'sample_asset.webp')).metadata()).format).toBe('webp');
});

it('reports a size mismatch without writing a manifest entry', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'astra-art-'));
  temporaryDirectories.push(root);
  const dropRoot = path.join(root, 'art-drop');
  const outputRoot = path.join(root, 'public', 'assets', 'user');
  const source = path.join(dropRoot, 'sample.png');
  await mkdir(dropRoot, { recursive: true });
  await sharp({ create: { width: 2, height: 2, channels: 3, background: '#123456' } }).png().toFile(source);

  const result = await validateAndConvert([{
    category: 'event_cg',
    assetId: 'bad_asset',
    expectedPath: 'art-drop/sample.png',
    sourceSize: '4x4',
    alpha: 'yes',
    status: 'ready',
  }], dropRoot, outputRoot);

  expect(result.errors).toContain('bad_asset: expected 4x4, received 2x2');
  expect(result.errors).toContain('bad_asset: alpha channel required');
  expect(result.manifest).toEqual({});
});
