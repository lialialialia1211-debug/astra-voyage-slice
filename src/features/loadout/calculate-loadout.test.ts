import { content } from '../../content';
import type { WeaponGrid } from '../../game/initial-state';
import { calculateLoadout } from './calculate-loadout';

const fullGrid: WeaponGrid = {
  main: 'wpn_01_sunblade',
  sub: [
    'wpn_02_molten_lance',
    'wpn_03_tidemark_axe',
    'wpn_04_resonance_staff',
    'wpn_05_fireline_dagger',
    'wpn_06_route_bow',
    'wpn_07_expedition_rifle',
    'wpn_08_shoreguard_shield',
    'wpn_09_astrolabe',
    'wpn_10_dawn_greatblade',
  ],
};

it('adds the main hand and nine unique sub-weapons', () => {
  const totals = calculateLoadout(fullGrid, content.weapons);

  expect(totals.weaponCount).toBe(10);
  expect(totals.attack).toBe(8420);
  expect(totals.hp).toBe(2180);
  expect(totals.skills.might).toBe(38);
});

it('rejects duplicate equipment IDs', () => {
  const duplicateGrid: WeaponGrid = {
    ...fullGrid,
    sub: ['wpn_01_sunblade', ...fullGrid.sub.slice(1)] as WeaponGrid['sub'],
  };

  expect(() => calculateLoadout(duplicateGrid, content.weapons)).toThrow('武器不可重複裝備');
});

it('uses saved weapon levels in loadout totals', () => {
  const totals = calculateLoadout(fullGrid, content.weapons, { wpn_01_sunblade: 10 });

  expect(totals.attack).toBe(9073);
  expect(totals.hp).toBe(2288);
  expect(totals.skills.might).toBe(38);
});
