import type { Element, WeaponDefinition, WeaponId } from '../../domain/types';
import type { WeaponGrid } from '../../game/initial-state';

export interface LoadoutTotals {
  weaponCount: number;
  attack: number;
  hp: number;
  predictedDamage: number;
  skills: { might: number; vitality: number; ougiCap: number };
}

function missingWeapon(id: WeaponId): never {
  throw new Error(`找不到武器：${id}`);
}

export function calculateLoadout(
  grid: WeaponGrid,
  weapons: readonly WeaponDefinition[],
): LoadoutTotals {
  const ids = [grid.main, ...grid.sub].filter((id): id is WeaponId => id !== null);
  if (new Set(ids).size !== ids.length) throw new Error('武器不可重複裝備');

  const selected = ids.map(
    (id) => weapons.find((weapon) => weapon.id === id) ?? missingWeapon(id),
  );
  const skills = { might: 0, vitality: 0, ougiCap: 0 };

  for (const weapon of selected) {
    if (weapon.skill.kind === 'might') skills.might += weapon.skill.value;
    if (weapon.skill.kind === 'vitality') skills.vitality += weapon.skill.value;
    if (weapon.skill.kind === 'ougi-cap') skills.ougiCap += weapon.skill.value;
  }

  const attack = selected.reduce((sum, weapon) => sum + weapon.attack, 0);
  const hp = selected.reduce((sum, weapon) => sum + weapon.hp, 0);

  return {
    weaponCount: ids.length,
    attack,
    hp,
    skills,
    predictedDamage: Math.round(attack * (1 + skills.might / 100)),
  };
}

export function recommendLoadout(
  element: Element,
  weapons: readonly WeaponDefinition[],
): WeaponGrid {
  const ranked = [...weapons].sort((left, right) => {
    const elementDifference = Number(right.element === element) - Number(left.element === element);
    return elementDifference || right.attack - left.attack;
  });
  const selected = ranked.slice(0, 10);
  if (selected.length !== 10) throw new Error('推薦編成至少需要十把武器');

  return {
    main: selected[0]!.id,
    sub: selected.slice(1).map((weapon) => weapon.id) as WeaponGrid['sub'],
  };
}
