import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

function defineAsset(category, relativePath, width, height, alpha, quality = 85) {
  return Object.freeze({
    category,
    assetId: path.posix.basename(relativePath, '.png'),
    relativePath,
    width,
    height,
    alpha,
    quality,
  });
}

const backgrounds = [
  'bg_anchor_control_tower',
  'bg_anchor_control_tower_blackout',
  'bg_anchor_response_corridor',
  'bg_deep_sea_last_light',
  'bg_deep_sea_last_light_watcher',
  'bg_drainage_evidence_channel',
  'bg_harbor_panorama',
  'bg_harbor_panorama_evacuation',
  'bg_hearing_archive_hall',
  'bg_mila_rented_room',
  'bg_north_bay_shipyard',
  'bg_north_bay_shipyard_battle',
  'bg_old_port_ruins',
  'bg_old_port_ruins_ambush',
  'bg_outer_bay_quarantine',
  'bg_outer_bay_quarantine_black_fog',
  'bg_outer_bay_rescue_pier',
  'bg_quarantine_medbay',
  'bg_saifula_private_cabin',
  'bg_white_cliff_sanatorium',
  'bg_yanling_private_room',
  'bg_yuanming_bridge',
  'bg_yuanming_core',
  'bg_yuanming_core_damaged',
  'bg_yuanming_deck',
  'bg_yuanming_deck_storm',
];

const bossNames = [
  'black_tide_core',
  'first_anchor_core',
  'old_port_commander',
  'tide_watcher',
  'unflagged_ship',
];

const mainCgs = [
  'cg_main_02_black_ship_return',
  'cg_main_03_outer_bay_rescue',
  'cg_main_07_second_heart',
  'cg_main_10_forty_seven_breaths',
  'cg_main_13_old_port_ambush',
  'cg_main_19_white_cliff_disaster',
  'cg_main_24_unflagged_ship',
  'cg_main_28_tide_watcher',
  'cg_main_30_first_license_departure',
];

const r18Cgs = [
  'cg_r18_yanling_15_01',
  'cg_r18_yanling_15_02',
  'cg_r18_yanling_15_03',
  'cg_r18_saifula_20_01',
  'cg_r18_saifula_20_02',
  'cg_r18_saifula_20_03',
  'cg_r18_mila_25_01',
  'cg_r18_mila_25_02',
  'cg_r18_mila_25_03',
];

const characters = {
  zhaoli: { story: ['neutral', 'happy', 'angry', 'tense', 'hurt', 'soft'], battle: true, card: true, cabin: false },
  yanling: { story: ['neutral', 'happy', 'angry', 'tense', 'hurt', 'soft'], battle: true, card: true, cabin: true },
  saifula: { story: ['neutral', 'happy', 'angry', 'tense', 'hurt', 'soft'], battle: true, card: true, cabin: true },
  mila: { story: ['neutral', 'happy', 'angry', 'tense', 'hurt', 'soft'], battle: true, card: true, cabin: true },
  yilan: { story: ['neutral', 'happy', 'angry', 'tense', 'hurt'], battle: true, card: true, cabin: true },
  hanze: { story: ['neutral', 'happy', 'angry', 'tense', 'hurt'], battle: true, card: true, cabin: true },
  luoen: { story: ['neutral', 'happy', 'angry', 'tense', 'hurt'], battle: true, card: false, cabin: false },
  huicen: { story: ['neutral', 'happy', 'angry', 'tense', 'hurt'], battle: false, card: false, cabin: false },
};

const enemies = [
  'enemy_anchor_echo',
  'enemy_black_tide_spawn',
  'enemy_navigation_illusion',
  'enemy_north_route_predator',
  'enemy_old_port_raider',
  'enemy_rescue_wreckage',
  'enemy_shipyard_security',
  'enemy_signal_interceptor',
  'enemy_unflagged_boarder',
  'enemy_white_cliff_echo',
];

const supports = ['support_anchor_array', 'support_medical_platform'];
const elements = ['fire', 'water', 'earth', 'wind', 'light', 'dark'];

const characterAssets = Object.entries(characters).flatMap(([character, config]) => {
  const assets = config.story.map((expression) => defineAsset(
    'character_story',
    `characters/${character}/story/chr_${character}_story_${expression}.png`,
    2048,
    3072,
    true,
  ));
  if (config.battle) assets.push(defineAsset('character_battle', `characters/${character}/battle/chr_${character}_battle_idle.png`, 1600, 1600, true));
  if (config.card) assets.push(defineAsset('character_card', `characters/${character}/card/chr_${character}_card.png`, 1024, 1536, false));
  if (config.cabin) assets.push(defineAsset('character_cabin', `characters/${character}/cabin/chr_${character}_cabin_base.png`, 2048, 3072, true));
  return assets;
});

export const CHAPTER_ONE_ASSETS = Object.freeze([
  ...backgrounds.map((assetId) => defineAsset('background', `backgrounds/${assetId}.png`, 2560, 1440, false)),
  ...bossNames.flatMap((boss) => ['idle', 'break'].map((state) => defineAsset('boss', `bosses/boss_${boss}_${state}.png`, 3072, 2048, true))),
  ...mainCgs.map((assetId) => defineAsset('event_cg', `cg/main/${assetId}.png`, 2560, 1440, false, 90)),
  ...r18Cgs.map((assetId) => defineAsset('event_cg', `cg/r18/${assetId}.png`, 2560, 1440, false, 90)),
  ...characterAssets,
  ...enemies.map((assetId) => defineAsset('enemy', `enemies/${assetId}.png`, 1600, 1600, true)),
  ...supports.map((assetId) => defineAsset('support', `supports/${assetId}.png`, 1600, 1600, true)),
  ...elements.flatMap((element) => [1, 2].map((index) => {
    const assetId = `wpn_${element}_0${index}`;
    return defineAsset('weapon', `weapons/${assetId}.png`, 1024, 1024, true);
  })),
]);

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readManifest(filePath) {
  if (!await exists(filePath)) return {};
  const value = JSON.parse(await readFile(filePath, 'utf8'));
  if (!value || Array.isArray(value) || typeof value !== 'object') {
    throw new Error(`${filePath}: manifest must be a JSON object`);
  }
  return value;
}

function resolveWithin(root, relativePath) {
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(resolvedRoot, ...relativePath.split('/'));
  if (!resolved.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error(`${relativePath}: source path escapes Chapter 01 root`);
  }
  return resolved;
}

async function listCorePngs(root, current = root) {
  if (!await exists(current)) return [];
  const entries = await readdir(current, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith('_')) continue;
    const fullPath = path.join(current, entry.name);
    if (entry.isDirectory()) files.push(...await listCorePngs(root, fullPath));
    else if (entry.name.toLowerCase().endsWith('.png')) files.push(path.relative(root, fullPath).replaceAll('\\', '/'));
  }
  return files;
}

export async function importChapterOneArt({
  assets = CHAPTER_ONE_ASSETS,
  sourceRoot,
  outputRoot,
  runtimeManifestPath,
}) {
  const errors = [];
  const valid = [];
  const expectedPaths = new Set(assets.map((asset) => asset.relativePath));

  const receivedPaths = await listCorePngs(sourceRoot);
  for (const relativePath of receivedPaths) {
    if (!expectedPaths.has(relativePath)) errors.push(`unexpected PNG: ${relativePath}`);
  }

  for (const asset of assets) {
    let sourcePath;
    try {
      sourcePath = resolveWithin(sourceRoot, asset.relativePath);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
      continue;
    }
    if (!await exists(sourcePath)) {
      errors.push(`${asset.assetId}: missing ${asset.relativePath}`);
      continue;
    }

    let metadata;
    try {
      metadata = await sharp(sourcePath).metadata();
    } catch (error) {
      errors.push(`${asset.assetId}: unreadable PNG (${error instanceof Error ? error.message : String(error)})`);
      continue;
    }
    if (metadata.format !== 'png') errors.push(`${asset.assetId}: expected PNG, received ${metadata.format ?? 'unknown'}`);
    if (metadata.width !== asset.width || metadata.height !== asset.height) {
      errors.push(`${asset.assetId}: expected ${asset.width}x${asset.height}, received ${metadata.width ?? 0}x${metadata.height ?? 0}`);
    }
    if (asset.alpha && !metadata.hasAlpha) errors.push(`${asset.assetId}: alpha channel required`);
    if (!asset.alpha && metadata.hasAlpha) errors.push(`${asset.assetId}: opaque image required`);
    if (metadata.depth !== 'uchar') errors.push(`${asset.assetId}: expected 8-bit channels, received ${metadata.depth ?? 'unknown'}`);
    if (metadata.space !== 'srgb') errors.push(`${asset.assetId}: expected sRGB, received ${metadata.space ?? 'unknown'}`);
    valid.push({ asset, sourcePath });
  }

  if (errors.length > 0) return { errors, importedCount: 0, manifest: {} };

  await mkdir(outputRoot, { recursive: true });
  for (const { asset, sourcePath } of valid) {
    await sharp(sourcePath)
      .webp({ quality: asset.quality, alphaQuality: 100, effort: 4 })
      .toFile(path.join(outputRoot, `${asset.assetId}.webp`));
  }

  const publicManifestPath = path.join(outputRoot, 'manifest.json');
  const publicManifest = await readManifest(publicManifestPath);
  const runtimeManifest = runtimeManifestPath ? await readManifest(runtimeManifestPath) : {};
  const chapterManifest = Object.fromEntries(assets.map((asset) => [asset.assetId, `/assets/user/${asset.assetId}.webp`]));
  const manifest = { ...publicManifest, ...runtimeManifest, ...chapterManifest };
  const serializedManifest = `${JSON.stringify(manifest, null, 2)}\n`;
  await writeFile(publicManifestPath, serializedManifest, 'utf8');
  if (runtimeManifestPath) {
    await mkdir(path.dirname(runtimeManifestPath), { recursive: true });
    await writeFile(runtimeManifestPath, serializedManifest, 'utf8');
  }

  return { errors, importedCount: valid.length, manifest };
}

async function main() {
  const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const sourceArgument = process.argv.slice(2).find((argument) => argument !== '--');
  const sourceRoot = path.resolve(sourceArgument ?? path.join(projectRoot, 'art-drop', 'chapter01'));
  const outputRoot = path.join(projectRoot, 'public', 'assets', 'user');
  const runtimeManifestPath = path.join(projectRoot, 'src', 'generated', 'user-art-manifest.json');
  const result = await importChapterOneArt({ sourceRoot, outputRoot, runtimeManifestPath });
  if (result.errors.length > 0) {
    for (const error of result.errors) console.error(`ERROR ${error}`);
    console.error(`Chapter 01 art import stopped with ${result.errors.length} error(s).`);
    process.exitCode = 1;
    return;
  }
  console.log(`Chapter 01 art import complete: ${result.importedCount} assets, ${Object.keys(result.manifest).length} total manifest entries.`);
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';
if (invokedPath === import.meta.url) await main();
