import { expect, it } from 'vitest'
import {
  chapterBattleApCost,
  encounterForNode,
  nodeAfterBattle,
  nodeAfterScene,
  sceneForNode,
} from './flow'

it('routes every scene through the approved battle insertion map', () => {
  expect(nodeAfterScene('ch01_scene_01_port_bell')).toBe('scene-2')
  expect(nodeAfterScene('ch01_scene_02_black_ship')).toBe('battle-1-prep')
  expect(nodeAfterBattle('ch01_b01_outer_bay_rescue')).toBe('scene-3')
  expect(nodeAfterScene('ch01_scene_29_question_for_deep_ocean')).toBe('battle-15-prep')
  expect(nodeAfterBattle('ch01_b15_question_for_deep_ocean')).toBe('scene-30')
  expect(nodeAfterScene('ch01_scene_30_first_deep_sea_license')).toBe('chapter-complete')
})

it('resolves scene and battle nodes back to their content records', () => {
  expect(sceneForNode('scene-28')?.id).toBe('ch01_scene_28_beyond_last_light')
  expect(encounterForNode('battle-11-prep')?.id).toBe('ch01_b11_ship_without_a_flag')
  expect(encounterForNode('battle-11')?.id).toBe('ch01_b11_ship_without_a_flag')
  expect(sceneForNode('chapter-complete')).toBeUndefined()
})

it('charges no AP only for the first clear of battle one', () => {
  expect(chapterBattleApCost('ch01_b01_outer_bay_rescue', [])).toBe(0)
  expect(chapterBattleApCost('ch01_b01_outer_bay_rescue', ['ch01_b01_outer_bay_rescue'])).toBe(5)
  expect(chapterBattleApCost('ch01_b02_first_answering_anchor', [])).toBe(5)
})
