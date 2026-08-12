import { chapterOneContent } from './content'
import type { ChapterEncounterId, ChapterNodeId, ChapterSceneId } from './types'

export function sceneForNode(node: ChapterNodeId) {
  const match = /^scene-(\d+)$/.exec(node)
  if (!match) return undefined
  return chapterOneContent.scenes.find((scene) => scene.number === Number(match[1]))
}

export function encounterForNode(node: ChapterNodeId) {
  const match = /^battle-(\d+)(?:-prep)?$/.exec(node)
  if (!match) return undefined
  return chapterOneContent.encounters.find((encounter) => encounter.number === Number(match[1]))
}

export function nodeAfterScene(sceneId: ChapterSceneId): ChapterNodeId {
  const scene = chapterOneContent.scenes.find((entry) => entry.id === sceneId)
  if (!scene) throw new Error(`Unknown chapter scene: ${sceneId}`)

  const encounter = chapterOneContent.encounters.find((entry) => entry.afterSceneNumber === scene.number)
  if (encounter) return `battle-${encounter.number}-prep`
  if (scene.number === chapterOneContent.scenes.length) return 'chapter-complete'
  return `scene-${scene.number + 1}`
}

export function nodeAfterBattle(encounterId: ChapterEncounterId): ChapterNodeId {
  const encounter = chapterOneContent.encounters.find((entry) => entry.id === encounterId)
  if (!encounter) throw new Error(`Unknown chapter encounter: ${encounterId}`)
  return `scene-${encounter.afterSceneNumber + 1}`
}

export function nextChapterNode(current: ChapterNodeId): ChapterNodeId {
  const scene = sceneForNode(current)
  if (scene) return nodeAfterScene(scene.id)

  const encounter = encounterForNode(current)
  if (encounter && current.endsWith('-prep')) return `battle-${encounter.number}`
  if (encounter) return nodeAfterBattle(encounter.id)
  if (current === 'milestone-complete') return 'scene-3'
  return 'chapter-complete'
}

export function chapterBattleApCost(completedBattles: readonly ChapterEncounterId[]): 0 | 5
export function chapterBattleApCost(
  encounterId: ChapterEncounterId,
  completedBattles: readonly ChapterEncounterId[],
): 0 | 5
export function chapterBattleApCost(
  encounterOrCompleted: ChapterEncounterId | readonly ChapterEncounterId[],
  maybeCompleted?: readonly ChapterEncounterId[],
): 0 | 5 {
  const encounterId = typeof encounterOrCompleted === 'string'
    ? encounterOrCompleted
    : 'ch01_b01_outer_bay_rescue'
  const completedBattles = typeof encounterOrCompleted === 'string'
    ? maybeCompleted ?? []
    : encounterOrCompleted

  return encounterId === 'ch01_b01_outer_bay_rescue' && !completedBattles.includes(encounterId) ? 0 : 5
}
