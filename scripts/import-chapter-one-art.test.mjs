import { access, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { afterEach, expect, it } from 'vitest';
import { CHAPTER_ONE_ASSETS, importChapterOneArt } from './import-chapter-one-art.mjs';

sharp.cache(false);

const temporaryDirectories = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

it('defines the complete and unique 140-asset Chapter 01 delivery', () => {
  expect(CHAPTER_ONE_ASSETS).toHaveLength(140);
  expect(new Set(CHAPTER_ONE_ASSETS.map((asset) => asset.assetId)).size).toBe(140);
  expect(new Set(CHAPTER_ONE_ASSETS.map((asset) => asset.relativePath)).size).toBe(140);

  const categoryCounts = Object.fromEntries(
    Object.entries(Object.groupBy(CHAPTER_ONE_ASSETS, (asset) => asset.category))
      .map(([category, assets]) => [category, assets.length]),
  );
  expect(categoryCounts).toEqual({
    background: 26,
    boss: 10,
    character_battle: 7,
    character_cabin: 5,
    character_card: 6,
    character_story: 44,
    enemy: 10,
    event_cg: 18,
    support: 2,
    weapon: 12,
  });

  for (const asset of CHAPTER_ONE_ASSETS) {
    expect(path.basename(asset.relativePath, '.png')).toBe(asset.assetId);
  }
});

it('publishes all Chapter 01 assets in both checked-in manifests', async () => {
  const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const publicManifest = JSON.parse(await readFile(path.join(projectRoot, 'public', 'assets', 'user', 'manifest.json'), 'utf8'));
  const runtimeManifest = JSON.parse(await readFile(path.join(projectRoot, 'src', 'generated', 'user-art-manifest.json'), 'utf8'));

  expect(runtimeManifest).toEqual(publicManifest);
  expect(Object.keys(runtimeManifest)).toHaveLength(140);
  for (const asset of CHAPTER_ONE_ASSETS) {
    const expectedUrl = `/assets/user/${asset.assetId}.webp`;
    expect(runtimeManifest[asset.assetId]).toBe(expectedUrl);
    await expect(access(path.join(projectRoot, 'public', expectedUrl.slice(1)))).resolves.toBeUndefined();
  }
});

it('converts validated art and preserves both existing manifests', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'astra-chapter-one-art-'));
  temporaryDirectories.push(root);
  const sourceRoot = path.join(root, 'chapter01');
  const outputRoot = path.join(root, 'public', 'assets', 'user');
  const runtimeManifestPath = path.join(root, 'src', 'generated', 'user-art-manifest.json');
  const publicManifestPath = path.join(outputRoot, 'manifest.json');
  const assets = [
    {
      category: 'character_story',
      assetId: 'demo_alpha',
      relativePath: 'characters/demo/story/demo_alpha.png',
      width: 2,
      height: 2,
      alpha: true,
      quality: 85,
    },
    {
      category: 'event_cg',
      assetId: 'demo_opaque',
      relativePath: 'cg/main/demo_opaque.png',
      width: 3,
      height: 2,
      alpha: false,
      quality: 90,
    },
  ];

  await mkdir(path.dirname(path.join(sourceRoot, assets[0].relativePath)), { recursive: true });
  await mkdir(path.dirname(path.join(sourceRoot, assets[1].relativePath)), { recursive: true });
  await sharp({ create: { width: 2, height: 2, channels: 4, background: { r: 10, g: 20, b: 30, alpha: 0.5 } } })
    .png()
    .toFile(path.join(sourceRoot, assets[0].relativePath));
  await sharp({ create: { width: 3, height: 2, channels: 3, background: '#123456' } })
    .png()
    .toFile(path.join(sourceRoot, assets[1].relativePath));

  await mkdir(outputRoot, { recursive: true });
  await mkdir(path.dirname(runtimeManifestPath), { recursive: true });
  await writeFile(publicManifestPath, '{"legacy_public":"/assets/user/legacy_public.webp"}\n', 'utf8');
  await writeFile(runtimeManifestPath, '{"legacy_runtime":"/assets/user/legacy_runtime.webp"}\n', 'utf8');

  const result = await importChapterOneArt({ assets, sourceRoot, outputRoot, runtimeManifestPath });

  expect(result.errors).toEqual([]);
  expect(result.importedCount).toBe(2);
  expect(result.manifest).toEqual({
    legacy_public: '/assets/user/legacy_public.webp',
    legacy_runtime: '/assets/user/legacy_runtime.webp',
    demo_alpha: '/assets/user/demo_alpha.webp',
    demo_opaque: '/assets/user/demo_opaque.webp',
  });
  expect(JSON.parse(await readFile(publicManifestPath, 'utf8'))).toEqual(result.manifest);
  expect(JSON.parse(await readFile(runtimeManifestPath, 'utf8'))).toEqual(result.manifest);
  expect((await sharp(path.join(outputRoot, 'demo_alpha.webp')).metadata()).hasAlpha).toBe(true);
  expect((await sharp(path.join(outputRoot, 'demo_opaque.webp')).metadata()).format).toBe('webp');
});

it('reports missing, unexpected, dimension, and alpha errors without changing manifests', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'astra-chapter-one-art-invalid-'));
  temporaryDirectories.push(root);
  const sourceRoot = path.join(root, 'chapter01');
  const outputRoot = path.join(root, 'public', 'assets', 'user');
  const runtimeManifestPath = path.join(root, 'src', 'generated', 'user-art-manifest.json');
  const publicManifestPath = path.join(outputRoot, 'manifest.json');
  const assets = [
    {
      category: 'enemy',
      assetId: 'bad_enemy',
      relativePath: 'enemies/bad_enemy.png',
      width: 4,
      height: 4,
      alpha: true,
      quality: 85,
    },
    {
      category: 'enemy',
      assetId: 'missing_enemy',
      relativePath: 'enemies/missing_enemy.png',
      width: 4,
      height: 4,
      alpha: true,
      quality: 85,
    },
  ];

  await mkdir(path.join(sourceRoot, 'enemies'), { recursive: true });
  await mkdir(outputRoot, { recursive: true });
  await mkdir(path.dirname(runtimeManifestPath), { recursive: true });
  await sharp({ create: { width: 2, height: 2, channels: 3, background: '#abcdef' } })
    .png()
    .toFile(path.join(sourceRoot, 'enemies', 'bad_enemy.png'));
  await sharp({ create: { width: 1, height: 1, channels: 4, background: { r: 1, g: 2, b: 3, alpha: 0.5 } } })
    .png()
    .toFile(path.join(sourceRoot, 'enemies', 'unexpected.png'));
  const originalManifest = '{"legacy":"/assets/user/legacy.webp"}\n';
  await writeFile(publicManifestPath, originalManifest, 'utf8');
  await writeFile(runtimeManifestPath, originalManifest, 'utf8');

  const result = await importChapterOneArt({ assets, sourceRoot, outputRoot, runtimeManifestPath });

  expect(result.errors).toContain('bad_enemy: expected 4x4, received 2x2');
  expect(result.errors).toContain('bad_enemy: alpha channel required');
  expect(result.errors).toContain('missing_enemy: missing enemies/missing_enemy.png');
  expect(result.errors).toContain('unexpected PNG: enemies/unexpected.png');
  expect(result.importedCount).toBe(0);
  expect(await readFile(publicManifestPath, 'utf8')).toBe(originalManifest);
  expect(await readFile(runtimeManifestPath, 'utf8')).toBe(originalManifest);
});
