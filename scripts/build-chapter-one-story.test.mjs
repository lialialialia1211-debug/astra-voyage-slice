import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildChapterOneStory } from './build-chapter-one-story.mjs'

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const novelRoot = path.join(repositoryRoot, 'docs', 'worldbuilding', 'first-major-arc-novel-v0.2')

function adultCgs(scene) {
  return [...new Set(scene.lines.map((line) => line.cgAssetId).filter(Boolean))]
}

describe('Chapter 01 canonical story generator', () => {
  it('generates all 30 scenes in canonical order as readable AVG beats', async () => {
    const scenes = await buildChapterOneStory({ novelRoot })

    expect(scenes).toHaveLength(30)
    expect(scenes.map((scene) => scene.number)).toEqual(
      Array.from({ length: 30 }, (_, index) => index + 1),
    )
    expect(new Set(scenes.map((scene) => scene.sourceFile))).toHaveProperty('size', 30)

    for (const scene of scenes) {
      expect(Math.max(...scene.lines.map((line) => line.text.length))).toBeLessThanOrEqual(120)
      expect(scene.lines.some((line) => line.speakerId !== 'narrator')).toBe(true)
    }
  })

  it('labels the opening exchange with the acting characters', async () => {
    const [opening] = await buildChapterOneStory({ novelRoot })

    expect(opening.lines).toEqual(expect.arrayContaining([
      expect.objectContaining({
        speakerId: 'luoen',
        speakerName: '洛恩',
        text: '你查第二次才看見？',
      }),
      expect.objectContaining({
        speakerId: 'zhaoli',
        speakerName: '昭黎',
        text: '第一次確認它在，第二次確認它能用。',
      }),
    ]))
  })

  it('anchors a new dialogue turn to the narrated actor instead of an earlier speaker', async () => {
    const scenes = await buildChapterOneStory({ novelRoot })
    const rescueScene = scenes[2]
    const safetyOrder = rescueScene.lines.find((line) => line.text === '不准跨紅線。長鉤套艇首，我套船尾。')

    expect(safetyOrder).toMatchObject({ speakerId: 'zhaoli', speakerName: '昭黎' })
    expect(rescueScene.lines.some((line) => line.text === '艇員說。')).toBe(false)
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
