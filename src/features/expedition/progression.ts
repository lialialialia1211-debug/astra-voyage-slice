import type { RewardBundle, StageDefinition, StageId } from '../../domain/types';

export const AP_MAX = 30;
export const AP_RECOVERY_MS = 300_000;

export interface ApState {
  current: number;
  lastRecoveredAt: number;
}

export type Inventory = RewardBundle;

const rewardKeys = [
  'expeditionPoints',
  'surfaceAlloy',
  'ruinChip',
  'leylineCore',
  'fieldRation',
] as const satisfies readonly (keyof RewardBundle)[];

export function emptyRewards(): RewardBundle {
  return {
    expeditionPoints: 0,
    surfaceAlloy: 0,
    ruinChip: 0,
    leylineCore: 0,
    fieldRation: 0,
  };
}

export function syncAp(ap: ApState, now: number): ApState {
  if (now < ap.lastRecoveredAt) return ap;
  if (ap.current >= AP_MAX) return { current: AP_MAX, lastRecoveredAt: now };

  const restored = Math.floor((now - ap.lastRecoveredAt) / AP_RECOVERY_MS);
  if (restored < 1) return ap;

  const current = Math.min(AP_MAX, ap.current + restored);
  return {
    current,
    lastRecoveredAt: current === AP_MAX
      ? now
      : ap.lastRecoveredAt + restored * AP_RECOVERY_MS,
  };
}

export function isStageUnlocked(
  stage: StageDefinition,
  firstClears: readonly StageId[],
): boolean {
  return stage.prerequisite === null || firstClears.includes(stage.prerequisite);
}

export function addRewards(inventory: Inventory, rewards: RewardBundle): Inventory {
  const next = emptyRewards();
  for (const key of rewardKeys) {
    const value = inventory[key] + rewards[key];
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new Error('獎勵數量超出安全範圍');
    }
    next[key] = value;
  }
  return next;
}

export function canAfford(inventory: Inventory, cost: RewardBundle): boolean {
  return rewardKeys.every((key) => inventory[key] >= cost[key]);
}

export function subtractRewards(inventory: Inventory, cost: RewardBundle): Inventory {
  if (!canAfford(inventory, cost)) throw new Error('持有素材不足');
  const negativeCost = Object.fromEntries(
    rewardKeys.map((key) => [key, -cost[key]]),
  ) as unknown as RewardBundle;
  return addRewards(inventory, negativeCost);
}
