import { expect, it } from 'vitest';
import * as contentModule from '../content';

type ChapterNodeId = 'scene-1' | 'scene-2' | 'battle-1-prep' | 'battle-1' | 'milestone-complete';

interface ChapterFlowExports {
  nextChapterNode?: (current: ChapterNodeId) => ChapterNodeId;
  chapterBattleApCost?: (completedBattles: readonly string[]) => 0 | 5;
}

function exportedFlow(): ChapterFlowExports {
  return contentModule as unknown as ChapterFlowExports;
}

it('routes the first two scenes into battle preparation', () => {
  const { nextChapterNode } = exportedFlow();

  expect(nextChapterNode?.('scene-1')).toBe('scene-2');
  expect(nextChapterNode?.('scene-2')).toBe('battle-1-prep');
});

it('charges no AP for first clear and five AP for replay', () => {
  const { chapterBattleApCost } = exportedFlow();

  expect(chapterBattleApCost?.([])).toBe(0);
  expect(chapterBattleApCost?.(['ch01_b01_outer_bay_rescue'])).toBe(5);
});
