import type { CharacterDefinition, RewardBundle, WeaponDefinition } from '../../domain/types';

function cost(
  expeditionPoints: number,
  surfaceAlloy: number,
  ruinChip = 0,
  leylineCore = 0,
): RewardBundle {
  return { expeditionPoints, surfaceAlloy, ruinChip, leylineCore, fieldRation: 0 };
}

const characterCosts = [
  cost(100, 2),
  cost(150, 3),
  cost(200, 4),
  cost(300, 5),
  cost(400, 4, 1),
  cost(500, 5, 2),
  cost(650, 6, 3),
  cost(800, 5, 4, 1),
  cost(1000, 6, 5, 1),
] as const;

const weaponCosts = [
  cost(80, 2),
  cost(120, 2),
  cost(160, 3),
  cost(240, 4),
  cost(320, 3, 1),
  cost(400, 4, 2),
  cost(520, 5, 2),
  cost(650, 4, 3, 1),
  cost(800, 5, 4, 1),
] as const;

function assertLevel(level: number): void {
  if (!Number.isInteger(level) || level < 1 || level > 10) {
    throw new Error('等級必須介於 1 與 10');
  }
}

export function characterUpgradeCost(currentLevel: number): RewardBundle | null {
  assertLevel(currentLevel);
  return currentLevel === 10 ? null : { ...characterCosts[currentLevel - 1]! };
}

export function weaponUpgradeCost(currentLevel: number): RewardBundle | null {
  assertLevel(currentLevel);
  return currentLevel === 10 ? null : { ...weaponCosts[currentLevel - 1]! };
}

export function effectiveCharacter<Id extends string>(
  definition: CharacterDefinition<Id>,
  level: number,
): CharacterDefinition<Id> {
  assertLevel(level);
  const multiplier = 1 + 0.04 * (level - 1);
  return {
    ...definition,
    attack: Math.round(definition.attack * multiplier),
    maxHp: Math.round(definition.maxHp * multiplier),
  };
}

export function effectiveWeapon(
  definition: WeaponDefinition,
  level: number,
): WeaponDefinition {
  assertLevel(level);
  const multiplier = 1 + 0.05 * (level - 1);
  return {
    ...definition,
    attack: Math.round(definition.attack * multiplier),
    hp: Math.round(definition.hp * multiplier),
  };
}
