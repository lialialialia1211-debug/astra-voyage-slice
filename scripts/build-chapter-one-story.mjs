import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { CHAPTER_ONE_SCENE_METADATA } from './chapter-one-scene-metadata.mjs'

const MAX_LINE_LENGTH = 520

function parseNovel(source, sourceFile) {
  const normalized = source.replace(/\r\n/g, '\n').trim()
  const titleMatch = normalized.match(/^# ([^\n]+)\n+/)
  if (!titleMatch) {
    throw new Error(`${sourceFile} must begin with an H1 title`)
  }

  return {
    title: titleMatch[1].trim(),
    body: normalized.slice(titleMatch[0].length),
  }
}

function packParagraphs(body) {
  const paragraphs = body.split(/\n{2,}/)
  const lines = []

  for (const paragraph of paragraphs) {
    const current = lines.at(-1)
    const combined = current ? `${current}\n\n${paragraph}` : paragraph

    if (!current || combined.length > MAX_LINE_LENGTH) {
      lines.push(paragraph)
    } else {
      lines[lines.length - 1] = combined
    }
  }

  return lines
}

function cgForLine(metadata, lineIndex, lineCount) {
  if (metadata.adultCgAssetIds) {
    const section = Math.min(
      metadata.adultCgAssetIds.length - 1,
      Math.floor((lineIndex * metadata.adultCgAssetIds.length) / lineCount),
    )
    return metadata.adultCgAssetIds[section]
  }

  if (metadata.mainCgAssetId && lineIndex >= Math.floor(lineCount / 2) && lineIndex < Math.floor(lineCount / 2) + 2) {
    return metadata.mainCgAssetId
  }

  return undefined
}

export async function buildChapterOneStory({ novelRoot }) {
  return Promise.all(CHAPTER_ONE_SCENE_METADATA.map(async (metadata) => {
    const source = await readFile(path.join(novelRoot, metadata.sourceFile), 'utf8')
    const { title, body } = parseNovel(source, metadata.sourceFile)
    const packedLines = packParagraphs(body)

    return {
      id: metadata.id,
      number: metadata.number,
      sourceFile: metadata.sourceFile,
      title,
      viewpoint: metadata.viewpoint,
      location: metadata.location,
      backgroundAssetId: metadata.backgroundAssetId,
      actors: metadata.actors,
      tone: metadata.tone,
      adult: Boolean(metadata.adultCgAssetIds),
      lines: packedLines.map((text, lineIndex) => ({
        speakerId: 'narrator',
        speakerName: '旁白',
        text,
        actors: metadata.actors,
        backgroundAssetId: metadata.backgroundAssetId,
        ...(cgForLine(metadata, lineIndex, packedLines.length)
          ? { cgAssetId: cgForLine(metadata, lineIndex, packedLines.length) }
          : {}),
        tone: metadata.tone,
        adult: Boolean(metadata.adultCgAssetIds),
      })),
    }
  }))
}

async function writeGeneratedStory() {
  const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  const novelRoot = path.join(repositoryRoot, 'docs', 'worldbuilding', 'first-major-arc-novel-v0.2')
  const outputPath = path.join(repositoryRoot, 'src', 'generated', 'chapter-one-scenes.json')
  const story = await buildChapterOneStory({ novelRoot })

  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, `${JSON.stringify(story, null, 2)}\n`, 'utf8')
  console.log(`Generated ${story.length} Chapter 01 scenes at ${outputPath}`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await writeGeneratedStory()
}
