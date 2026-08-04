import { content } from '../../content';
import {
  addRewards,
  emptyRewards,
  isStageUnlocked,
  syncAp,
} from './progression';

it('restores one AP per five minutes while preserving partial elapsed time', () => {
  expect(syncAp({ current: 20, lastRecoveredAt: 1_000 }, 601_000)).toEqual({
    current: 22,
    lastRecoveredAt: 601_000,
  });
  expect(syncAp({ current: 20, lastRecoveredAt: 1_000 }, 151_000)).toEqual({
    current: 20,
    lastRecoveredAt: 1_000,
  });
});

it('caps AP at 30 and rejects clock rollback', () => {
  expect(syncAp({ current: 29, lastRecoveredAt: 1_000 }, 901_000)).toEqual({
    current: 30,
    lastRecoveredAt: 901_000,
  });
  expect(syncAp({ current: 12, lastRecoveredAt: 1_000 }, 500)).toEqual({
    current: 12,
    lastRecoveredAt: 1_000,
  });
});

it('unlocks only the first stage or a stage whose prerequisite is cleared', () => {
  expect(isStageUnlocked(content.stages[0]!, [])).toBe(true);
  expect(isStageUnlocked(content.stages[1]!, [])).toBe(false);
  expect(isStageUnlocked(content.stages[1]!, ['land_01_port_defense'])).toBe(true);
});

it('adds deterministic rewards without mutating either input', () => {
  const inventory = { ...emptyRewards(), expeditionPoints: 10, surfaceAlloy: 2 };
  const rewards = { ...emptyRewards(), expeditionPoints: 80, surfaceAlloy: 3, fieldRation: 1 };

  expect(addRewards(inventory, rewards)).toEqual({
    expeditionPoints: 90,
    surfaceAlloy: 5,
    ruinChip: 0,
    leylineCore: 0,
    fieldRation: 1,
  });
  expect(inventory).toEqual({ ...emptyRewards(), expeditionPoints: 10, surfaceAlloy: 2 });
});

it('rejects reward totals outside safe nonnegative integers', () => {
  expect(() => addRewards({ ...emptyRewards(), expeditionPoints: Number.MAX_SAFE_INTEGER }, {
    ...emptyRewards(),
    expeditionPoints: 1,
  })).toThrow('獎勵數量超出安全範圍');
});
