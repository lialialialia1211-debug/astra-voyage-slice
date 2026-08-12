import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { CHAPTER_ONE_SCENE_METADATA } from './chapter-one-scene-metadata.mjs'

const TARGET_BEAT_LENGTH = 100
const MAX_BEAT_LENGTH = 120
const SPEECH_VERBS = '說|問|喊|道|回道|回答|答道|喝止|喝道|命令|提醒|警告|開口|低聲說|怒道|補充|反問|宣布|要求|叫道|吼道|罵道'

const ACTOR_SPEAKERS = [
  { id: 'zhaoli', name: '昭黎', aliases: ['昭黎'] },
  { id: 'yanling', name: '晏泠', aliases: ['晏泠'] },
  { id: 'saifula', name: '賽芙拉', aliases: ['賽芙拉'] },
  { id: 'mila', name: '彌菈', aliases: ['彌菈'] },
  { id: 'yilan', name: '伊蘭', aliases: ['伊蘭'] },
  { id: 'hanze', name: '韓則', aliases: ['韓則', '韓澤'] },
  { id: 'luoen', name: '洛恩', aliases: ['洛恩'] },
  { id: 'huicen', name: '惠岑', aliases: ['惠岑', '慧岑'] },
]

const VOICE_SPEAKERS = [
  { id: 'port-control', name: '港務台', aliases: ['港務台', '港務塔'] },
  { id: 'harbor-voice', name: '港口廣播', aliases: ['港口廣播', '共同頻道', '共同線路'] },
]

const GENERIC_SPEAKER_PATTERN = /(船首艇員|醫療艇員|救難員|艇員|女管事|押運官|老婦|觀測塔|醫療席|總監|文書|港警|守衛|領隊|傷者|女人|男人)/

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

function speakerByName(name) {
  return [...ACTOR_SPEAKERS, ...VOICE_SPEAKERS].find((speaker) => speaker.aliases.includes(name))
}

function viewpointSpeaker(metadata) {
  return speakerByName(metadata.viewpoint) ?? { id: 'narrator', name: '旁白' }
}

function firstNamedSpeaker(text) {
  let bestMatch

  for (const speaker of [...ACTOR_SPEAKERS, ...VOICE_SPEAKERS]) {
    for (const alias of speaker.aliases) {
      const index = text.indexOf(alias)
      if (index >= 0 && (!bestMatch || index < bestMatch.index)) {
        bestMatch = { ...speaker, index }
      }
    }
  }

  return bestMatch
}

function explicitSpeakerNear(text, edge) {
  const knownSpeakers = [...ACTOR_SPEAKERS, ...VOICE_SPEAKERS]
  const candidates = []

  for (const speaker of knownSpeakers) {
    for (const alias of speaker.aliases) {
      const expression = new RegExp(`${alias}[^。！？「」]{0,18}(?:${SPEECH_VERBS})`)
      const match = text.match(expression)
      if (match?.index !== undefined) candidates.push({ ...speaker, index: match.index })
    }
  }

  if (candidates.length > 0) {
    return candidates.sort((left, right) => edge === 'before'
      ? right.index - left.index
      : left.index - right.index)[0]
  }

  const genericMatch = text.match(new RegExp(`${GENERIC_SPEAKER_PATTERN.source}[^。！？「」]{0,18}(?:${SPEECH_VERBS})`))
  if (genericMatch) return { id: 'narrator', name: genericMatch[1] }
  return undefined
}

function isDialogueQuote(paragraph, match) {
  const text = match[1].trim()
  const before = paragraph.slice(0, match.index)
  const afterIndex = match.index + match[0].length
  const after = paragraph.slice(afterIndex)
  const previousCharacter = paragraph[match.index - 1] ?? ''
  const nextCharacter = paragraph[afterIndex] ?? ''

  if (!text) return false
  if (/[。！？!?…]$/.test(text)) return true
  if (!before.trim()) return true
  if (/[：，。！？!?；\s]$/.test(previousCharacter) && (!nextCharacter || /[，。！？!?；：\s]/.test(nextCharacter))) {
    return true
  }
  return Boolean(explicitSpeakerNear(before.slice(-48), 'before') || explicitSpeakerNear(after.slice(0, 48), 'after'))
}

function splitQuotedSegments(paragraph) {
  const matches = [...paragraph.matchAll(/「([^」]+)」/g)]
    .filter((match) => isDialogueQuote(paragraph, match))
  const segments = []
  let cursor = 0

  for (const match of matches) {
    const index = match.index ?? 0
    if (index > cursor) {
      segments.push({ kind: 'narration', text: paragraph.slice(cursor, index) })
    }
    const afterIndex = index + match[0].length
    segments.push({
      kind: 'dialogue',
      text: match[1].trim(),
      before: paragraph.slice(Math.max(0, index - 56), index),
      after: paragraph.slice(afterIndex, afterIndex + 56),
    })
    cursor = afterIndex
  }

  if (cursor < paragraph.length) {
    segments.push({ kind: 'narration', text: paragraph.slice(cursor) })
  }

  return segments.length > 0 ? segments : [{ kind: 'narration', text: paragraph }]
}

function hardSplit(text, maxLength = MAX_BEAT_LENGTH) {
  const parts = []
  for (let index = 0; index < text.length; index += maxLength) {
    parts.push(text.slice(index, index + maxLength))
  }
  return parts
}

function splitOversizedSentence(sentence) {
  const clauses = sentence.match(/[^，；：、]+[，；：、]?/g) ?? [sentence]
  const parts = []
  let current = ''

  for (const clause of clauses) {
    if (clause.length > MAX_BEAT_LENGTH) {
      if (current) parts.push(current)
      parts.push(...hardSplit(clause))
      current = ''
      continue
    }

    if (current && current.length + clause.length > TARGET_BEAT_LENGTH) {
      parts.push(current)
      current = clause
    } else {
      current += clause
    }
  }

  if (current) parts.push(current)
  return parts
}

function sentenceUnits(text) {
  return text.match(/[^。！？!?…]+(?:[。！？!?]+|…{2,}|$)/g) ?? []
}

function splitNarration(text) {
  const normalized = text.replace(/^\s+|\s+$/g, '')
  if (!normalized) return []

  const sentences = sentenceUnits(normalized).flatMap((sentence) => sentence.length > MAX_BEAT_LENGTH
    ? splitOversizedSentence(sentence)
    : [sentence])
  const beats = []
  let current = ''

  for (const sentence of sentences) {
    if (current && current.length + sentence.length > TARGET_BEAT_LENGTH) {
      beats.push(current)
      current = sentence
    } else {
      current += sentence
    }
  }

  if (current) beats.push(current)
  return beats.flatMap((beat) => beat.length > MAX_BEAT_LENGTH ? hardSplit(beat) : [beat])
}

function pureAttribution(text) {
  const trimmed = text.trim()
  if (!trimmed) return true
  const knownAliases = [...ACTOR_SPEAKERS, ...VOICE_SPEAKERS].flatMap((speaker) => speaker.aliases).join('|')
  return new RegExp(`^(?:${knownAliases}|${GENERIC_SPEAKER_PATTERN.source}|他|她|對方|那人)(?:[^。！？]{0,10})?(?:${SPEECH_VERBS})[。：，]?$`).test(trimmed)
}

function inferredAlternatingSpeaker(recentSpeakers) {
  const last = recentSpeakers.at(-1)
  const previous = [...recentSpeakers].reverse().find((speaker) => speaker.id !== last?.id)
  return last && previous ? previous : undefined
}

function inferDialogueSpeaker({ before, after, paragraphSubject, currentSubject, recentSpeakers, allowAlternation }) {
  const explicitAfter = explicitSpeakerNear(after.slice(0, 48), 'after')
  if (explicitAfter) return explicitAfter

  const explicitBefore = explicitSpeakerNear(before.slice(-48), 'before')
  if (explicitBefore) return explicitBefore

  if (paragraphSubject) return paragraphSubject

  if (/^\s*(?:他|她|對方|那人)(?:[^。！？]{0,10})?(?:說|問|喊|道|回道|回答|答道)/.test(after)) {
    return currentSubject
  }

  if (allowAlternation) {
    const alternating = inferredAlternatingSpeaker(recentSpeakers)
    if (alternating) return alternating
  }

  return currentSubject ?? { id: 'narrator', name: '不明聲音' }
}

function rememberSpeaker(recentSpeakers, speaker) {
  if (speaker.id === 'narrator' && speaker.name === '不明聲音') return
  recentSpeakers.push(speaker)
  if (recentSpeakers.length > 4) recentSpeakers.shift()
}

function buildAvgBeats(body, metadata) {
  const beats = []
  const recentSpeakers = []
  let currentSubject = viewpointSpeaker(metadata)
  let previousParagraphWasStandaloneDialogue = false

  for (const paragraph of body.split(/\n{2,}/)) {
    const segments = splitQuotedSegments(paragraph)
    const narrationOnly = segments.filter((segment) => segment.kind === 'narration').map((segment) => segment.text).join(' ')
    const paragraphSubject = firstNamedSpeaker(narrationOnly)
    if (paragraphSubject) currentSubject = paragraphSubject
    const standalone = segments.length === 1 && segments[0].kind === 'dialogue'
    const allowAlternation = standalone && previousParagraphWasStandaloneDialogue

    for (const segment of segments) {
      if (segment.kind === 'narration') {
        if (pureAttribution(segment.text)) continue
        for (const text of splitNarration(segment.text)) {
          beats.push({ speakerId: 'narrator', speakerName: '旁白', text })
        }
        const namedSubject = firstNamedSpeaker(segment.text)
        if (namedSubject) currentSubject = namedSubject
        continue
      }

      const speaker = inferDialogueSpeaker({
        before: segment.before,
        after: segment.after,
        paragraphSubject,
        currentSubject,
        recentSpeakers,
        allowAlternation,
      })
      for (const text of splitNarration(segment.text)) {
        beats.push({ speakerId: speaker.id, speakerName: speaker.name, text })
      }
      rememberSpeaker(recentSpeakers, speaker)
      currentSubject = speaker
    }

    previousParagraphWasStandaloneDialogue = standalone
  }

  return beats
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
    const avgBeats = buildAvgBeats(body, metadata)

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
      lines: avgBeats.map((beat, lineIndex) => ({
        ...beat,
        actors: metadata.actors,
        backgroundAssetId: metadata.backgroundAssetId,
        ...(cgForLine(metadata, lineIndex, avgBeats.length)
          ? { cgAssetId: cgForLine(metadata, lineIndex, avgBeats.length) }
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
