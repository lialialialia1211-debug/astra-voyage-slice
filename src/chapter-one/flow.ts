import type { ChapterEncounterId, ChapterNodeId } from './types';

export function nextChapterNode(current: ChapterNodeId): ChapterNodeId {
  if (current === 'scene-1') return 'scene-2';
  if (current === 'scene-2') return 'battle-1-prep';
  if (current === 'battle-1-prep') return 'battle-1';
  if (current === 'battle-1') return 'milestone-complete';
  return 'milestone-complete';
}

export function chapterBattleApCost(completedBattles: readonly ChapterEncounterId[]): 0 | 5 {
  return completedBattles.includes('ch01_b01_outer_bay_rescue') ? 5 : 0;
}
