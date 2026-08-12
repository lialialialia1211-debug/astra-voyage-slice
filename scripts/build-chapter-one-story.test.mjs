import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildChapterOneStory } from './build-chapter-one-story.mjs'

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const novelRoot = path.join(repositoryRoot, 'docs', 'worldbuilding', 'first-major-arc-novel-v0.2')

const normalize = (value) => value.replace(/\r\n/g, '\n').trim()

async function canonicalBody(sourceFile) {
  const source = normalize(await readFile(path.join(novelRoot, sourceFile), 'utf8'))
  return source.replace(/^# .+\n+/, '')
}

function adultCgs(scene) {
  return [...new Set(scene.lines.map((line) => line.cgAssetId).filter(Boolean))]
}

describe('Chapter 01 canonical story generator', () => {
  it('generates all 30 scenes in canonical order without losing prose', async () => {
    const scenes = await buildChapterOneStory({ novelRoot })

    expect(scenes).toHaveLength(30)
    expect(scenes.map((scene) => scene.number)).toEqual(
      Array.from({ length: 30 }, (_, index) => index + 1),
    )
    expect(new Set(scenes.map((scene) => scene.sourceFile))).toHaveProperty('size', 30)

    for (const scene of scenes) {
      expect(normalize(scene.lines.map((line) => line.text).join('\n\n'))).toBe(
        normalize(await canonicalBody(scene.sourceFile)),
      )
      expect(scene.lines.length).toBeGreaterThanOrEqual(10)
      expect(scene.lines.length).toBeLessThanOrEqual(24)
    }
  })

  it('maps the three adult scenes to three ordered CGs each', async () => {
    const scenes = await buildChapterOneStory({ novelRoot })

    expect(adultCgs(scenes[14])).toEqual([
      'cg_r18_yanling_15_01',
      'cg_r18_yanling_15_02',
      'cg_r18_yanling_15_03',
    ])
    expect(adultCgs(scenes[19])).toEqual([
      'cg_r18_saifula_20_01',
      'cg_r18_saifula_20_02',
      'cg_r18_saifula_20_03',
    ])
    expect(adultCgs(scenes[24])).toEqual([
      'cg_r18_mila_25_01',
      'cg_r18_mila_25_02',
      'cg_r18_mila_25_03',
    ])
  })
})
