import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

function csvRecords(text) {
  const records = [];
  let record = [];
  let field = '';
  let quoted = false;
  const source = text.replace(/^\uFEFF/, '');

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];
    if (quoted && character === '"' && next === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      record.push(field);
      field = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && next === '\n') index += 1;
      record.push(field);
      if (record.some((value) => value.length > 0)) records.push(record);
      record = [];
      field = '';
    } else {
      field += character;
    }
  }
  if (field.length > 0 || record.length > 0) {
    record.push(field);
    records.push(record);
  }
  return records;
}

export function parseChecklist(text) {
  const [headers, ...records] = csvRecords(text);
  if (!headers) throw new Error('美術清單缺少標題列');
  const index = Object.fromEntries(headers.map((header, position) => [header, position]));
  for (const required of ['category', 'asset_id', 'expected_path', 'source_size', 'alpha', 'status']) {
    if (index[required] === undefined) throw new Error(`美術清單缺少欄位：${required}`);
  }
  return records.map((record) => ({
    category: record[index.category] ?? '',
    assetId: record[index.asset_id] ?? '',
    expectedPath: record[index.expected_path] ?? '',
    sourceSize: record[index.source_size] ?? '',
    alpha: record[index.alpha] ?? '',
    status: record[index.status] ?? '',
  }));
}

function sourcePathFor(row, dropRoot) {
  const relative = row.expectedPath.replaceAll('\\', '/').replace(/^art-drop\//, '');
  const sourcePath = path.resolve(dropRoot, relative);
  const resolvedRoot = path.resolve(dropRoot);
  if (sourcePath !== resolvedRoot && !sourcePath.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error(`${row.assetId}: expected_path 超出 art-drop 範圍`);
  }
  return sourcePath;
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function validateAndConvert(rows, dropRoot, outputRoot, runtimeManifestPath) {
  const readyRows = rows.filter((row) => row.status === 'ready');
  const errors = [];
  const valid = [];

  for (const row of readyRows) {
    let sourcePath;
    try {
      sourcePath = sourcePathFor(row, dropRoot);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
      continue;
    }
    if (!await exists(sourcePath)) {
      errors.push(`${row.assetId}: missing ${row.expectedPath}`);
      continue;
    }
    const metadata = await sharp(sourcePath).metadata();
    const received = `${metadata.width ?? 0}x${metadata.height ?? 0}`;
    if (received !== row.sourceSize) {
      errors.push(`${row.assetId}: expected ${row.sourceSize}, received ${received}`);
    }
    if (row.alpha === 'yes' && !metadata.hasAlpha) {
      errors.push(`${row.assetId}: alpha channel required`);
    }
    valid.push({ row, sourcePath });
  }

  if (errors.length > 0) return { errors, manifest: {} };

  await mkdir(outputRoot, { recursive: true });
  const manifest = {};
  for (const { row, sourcePath } of valid) {
    const outputPath = path.join(outputRoot, `${row.assetId}.webp`);
    await sharp(sourcePath)
      .webp({ quality: row.category === 'event_cg' ? 90 : 85 })
      .toFile(outputPath);
    manifest[row.assetId] = `/assets/user/${row.assetId}.webp`;
  }
  await writeFile(path.join(outputRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  if (runtimeManifestPath) {
    await mkdir(path.dirname(runtimeManifestPath), { recursive: true });
    await writeFile(runtimeManifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  }
  return { errors, manifest };
}

async function main() {
  const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const checklistPath = path.join(projectRoot, 'outputs', 'user-art-checklist.csv');
  const dropArgument = process.argv.slice(2).find((argument) => argument !== '--');
  const dropRoot = path.resolve(dropArgument ?? path.join(projectRoot, 'art-drop'));
  const outputRoot = path.join(projectRoot, 'public', 'assets', 'user');
  const runtimeManifestPath = path.join(projectRoot, 'src', 'generated', 'user-art-manifest.json');
  const rows = parseChecklist(await readFile(checklistPath, 'utf8'));
  const result = await validateAndConvert(rows, dropRoot, outputRoot, runtimeManifestPath);
  if (result.errors.length > 0) {
    for (const error of result.errors) console.error(`ERROR ${error}`);
    console.error(`驗證失敗：${result.errors.length} 個問題，未轉換任何資產。`);
    process.exitCode = 1;
    return;
  }
  const readyCount = rows.filter((row) => row.status === 'ready').length;
  console.log(`美術驗證完成：${readyCount} 個 ready 資產已寫入 manifest。`);
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';
if (invokedPath === import.meta.url) await main();
