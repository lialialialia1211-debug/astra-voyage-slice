import { content } from '../../content';
import {
  characterUpgradeCost,
  effectiveCharacter,
  effectiveWeapon,
  weaponUpgradeCost,
} from './growth';

it('applies the approved Lv.10 character and weapon multipliers', () => {
  const character = content.characters[0]!;
  const weapon = content.weapons[0]!;

  expect(effectiveCharacter(character, 10).attack).toBe(Math.round(character.attack * 1.36));
  expect(effectiveCharacter(character, 10).maxHp).toBe(Math.round(character.maxHp * 1.36));
  expect(effectiveWeapon(weapon, 10).attack).toBe(Math.round(weapon.attack * 1.45));
  expect(effectiveWeapon(weapon, 10).hp).toBe(Math.round(weapon.hp * 1.45));
});

it('keeps Lv.1 definitions unchanged', () => {
  expect(effectiveCharacter(content.characters[0]!, 1)).toEqual(content.characters[0]);
  expect(effectiveWeapon(content.weapons[0]!, 1)).toEqual(content.weapons[0]);
});

it('returns exact high-level costs and no cost beyond Lv.10', () => {
  expect(characterUpgradeCost(9)).toEqual({
    expeditionPoints: 1000,
    surfaceAlloy: 6,
    ruinChip: 5,
    leylineCore: 1,
    fieldRation: 0,
  });
  expect(weaponUpgradeCost(9)).toEqual({
    expeditionPoints: 800,
    surfaceAlloy: 5,
    ruinChip: 4,
    leylineCore: 1,
    fieldRation: 0,
  });
  expect(characterUpgradeCost(10)).toBeNull();
  expect(weaponUpgradeCost(10)).toBeNull();
});

it('rejects non-integer or out-of-range levels', () => {
  expect(() => effectiveCharacter(content.characters[0]!, 0)).toThrow('等級必須介於 1 與 10');
  expect(() => effectiveWeapon(content.weapons[0]!, 1.5)).toThrow('等級必須介於 1 與 10');
});
