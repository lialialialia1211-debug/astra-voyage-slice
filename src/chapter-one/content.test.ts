import { expect, it } from 'vitest'
import { chapterOneContent } from './content'

it('contains the complete canonical first chapter', () => {
  expect(chapterOneContent.scenes).toHaveLength(30)
  expect(chapterOneContent.scenes.map((scene) => scene.number)).toEqual(
    Array.from({ length: 30 }, (_, index) => index + 1),
  )
  expect(chapterOneContent.encounters).toHaveLength(15)
  expect(chapterOneContent.actors.map((actor) => actor.id)).toEqual([
    'zhaoli',
    'yanling',
    'saifula',
    'mila',
    'yilan',
    'hanze',
    'luoen',
    'huicen',
  ])
})

it('stages scene one as a compact character-driven AVG scene', () => {
  const opening = chapterOneContent.scenes[0]!
  const narratorLines = opening.lines.filter((line) => (
    line.speakerId === 'narrator' || line.speakerId === 'narration'
  ))
  const firstYanlingLine = opening.lines.findIndex((line) => line.speakerId === 'yanling')

  expect(opening.lines.length).toBeLessThanOrEqual(70)
  expect(narratorLines.length).toBeLessThanOrEqual(2)
  expect(opening.lines[0]?.speakerId).toBe('zhaoli')
  expect(opening.lines[0]?.actors.map((actor) => actor.actorId)).toEqual(['zhaoli', 'luoen'])
  expect(firstYanlingLine).toBeGreaterThan(0)
  for (const line of opening.lines.slice(0, firstYanlingLine)) {
    expect(line.actors.some((actor) => actor.actorId === 'yanling')).toBe(false)
  }
  expect(opening.lines.at(-1)?.actors.some((actor) => actor.actorId === 'yanling')).toBe(false)

  for (const line of opening.lines) {
    if (['zhaoli', 'yanling', 'luoen'].includes(line.speakerId)) {
      expect(line.actors.some((actor) => actor.actorId === line.speakerId)).toBe(true)
    }
  }
})

it('keeps the approved scene-one event chain in character dialogue', () => {
  const opening = chapterOneContent.scenes[0]!

  expect(opening.lines.some((line) => line.speakerId === 'zhaoli' && /十五分/.test(line.text))).toBe(true)
  expect(opening.lines.some((line) => line.speakerId === 'zhaoli' && /舊圖|新圖/.test(line.text))).toBe(true)
  expect(opening.lines.some((line) => line.speakerId === 'luoen' && /自己的紀錄|不替/.test(line.text))).toBe(true)
  expect(opening.lines.some((line) => line.speakerId === 'yanling' && /退出角/.test(line.text))).toBe(true)
  expect(opening.lines.some((line) => line.speakerId === 'port-control' && /外灣|秋穗號/.test(line.text))).toBe(true)
})

it('keeps every chapter actor adult and supplies six elemental starter weapons', () => {
  expect(chapterOneContent.actors.every((actor) => actor.age >= 18)).toBe(true)
  expect(chapterOneContent.starterWeapons.map((weapon) => weapon.element)).toEqual([
    'fire',
    'water',
    'earth',
    'wind',
    'light',
    'dark',
  ])
})

it('uses the approved fixed mainline adult scenes without affinity gates', () => {
  const adultScenes = chapterOneContent.scenes.filter((scene) => scene.adult)

  expect(adultScenes.map((scene) => scene.number)).toEqual([15, 20, 25])
  for (const scene of adultScenes) {
    expect(new Set(scene.lines.map((line) => line.cgAssetId).filter(Boolean))).toHaveProperty('size', 3)
  }
})

it('defines the approved battle insertion and enemy art sequence', () => {
  expect(chapterOneContent.encounters.map((encounter) => encounter.afterSceneNumber)).toEqual([
    2, 5, 8, 10, 12, 13, 16, 17, 19, 23, 24, 26, 27, 28, 29,
  ])
  expect(chapterOneContent.encounters[0]).toMatchObject({
    id: 'ch01_b01_outer_bay_rescue',
    defaultPartyIds: ['zhaoli', 'luoen'],
    tutorialFocus: 'basic-attack',
  })
  expect(chapterOneContent.encounters[14]).toMatchObject({
    id: 'ch01_b15_question_for_deep_ocean',
    kind: 'boss',
    tutorialFocus: null,
  })
})
