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

it('preserves generated character speakers in the playable AVG scene', () => {
  const opening = chapterOneContent.scenes[0]!
  const luoenLine = opening.lines.find((line) => line.text === '你查第二次才看見？')

  expect(luoenLine).toMatchObject({ speakerId: 'luoen', speakerName: '洛恩' })
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
