import type { CharacterId, WeaponId } from '../../domain/types';

type Rarity = 'r' | 'sr' | 'ssr';
type GiftId = 'gift_navigation_chart' | 'gift_engineering_tea' | 'gift_star_fragment';

export type RecruitResult =
  | { kind: 'weapon'; id: WeaponId; rarity: Rarity }
  | { kind: 'gift'; id: GiftId; rarity: Rarity }
  | { kind: 'character'; id: CharacterId; rarity: Rarity };

const results: readonly RecruitResult[] = [
  { kind: 'weapon', id: 'wpn_01_sunblade', rarity: 'ssr' },
  { kind: 'weapon', id: 'wpn_02_molten_lance', rarity: 'sr' },
  { kind: 'gift', id: 'gift_navigation_chart', rarity: 'r' },
  { kind: 'weapon', id: 'wpn_03_tidemark_axe', rarity: 'sr' },
  { kind: 'gift', id: 'gift_engineering_tea', rarity: 'r' },
  { kind: 'weapon', id: 'wpn_04_resonance_staff', rarity: 'sr' },
  { kind: 'weapon', id: 'wpn_05_fireline_dagger', rarity: 'r' },
  { kind: 'gift', id: 'gift_star_fragment', rarity: 'sr' },
  { kind: 'weapon', id: 'wpn_06_route_bow', rarity: 'sr' },
  { kind: 'character', id: 'chr_04', rarity: 'ssr' },
];

export function fixedTenDraw(): RecruitResult[] {
  return results.map((result) => ({ ...result }));
}
