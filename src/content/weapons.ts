import type { WeaponDefinition } from '../domain/types';

export const weapons = [
  { id: 'wpn_01_sunblade', name: '旭日裂潮劍', element: 'fire', hp: 240, attack: 1450, skill: { kind: 'might', value: 8 }, mainHandPower: 185 },
  { id: 'wpn_02_molten_lance', name: '熔核長槍', element: 'fire', hp: 180, attack: 880, skill: { kind: 'might', value: 7 }, mainHandPower: 145 },
  { id: 'wpn_03_tidemark_axe', name: '潮痕戰斧', element: 'water', hp: 215, attack: 760, skill: { kind: 'might', value: 6 }, mainHandPower: 150 },
  { id: 'wpn_04_resonance_staff', name: '共鳴權杖', element: 'light', hp: 260, attack: 720, skill: { kind: 'vitality', value: 6 }, mainHandPower: 140 },
  { id: 'wpn_05_fireline_dagger', name: '火線短劍', element: 'fire', hp: 145, attack: 900, skill: { kind: 'might', value: 5 }, mainHandPower: 155 },
  { id: 'wpn_06_route_bow', name: '航路弓', element: 'wind', hp: 175, attack: 780, skill: { kind: 'ougi-cap', value: 4 }, mainHandPower: 148 },
  { id: 'wpn_07_expedition_rifle', name: '遠征銃', element: 'fire', hp: 150, attack: 950, skill: { kind: 'might', value: 6 }, mainHandPower: 160 },
  { id: 'wpn_08_shoreguard_shield', name: '守岸盾', element: 'earth', hp: 310, attack: 520, skill: { kind: 'vitality', value: 10 }, mainHandPower: 120 },
  { id: 'wpn_09_astrolabe', name: '星盤儀', element: 'light', hp: 240, attack: 660, skill: { kind: 'ougi-cap', value: 4 }, mainHandPower: 135 },
  { id: 'wpn_10_dawn_greatblade', name: '曙光巨刃', element: 'fire', hp: 265, attack: 800, skill: { kind: 'might', value: 6 }, mainHandPower: 170 },
  { id: 'wpn_11_depth_anchor', name: '深域錨槍', element: 'water', hp: 275, attack: 740, skill: { kind: 'vitality', value: 8 }, mainHandPower: 158 },
  { id: 'wpn_12_void_prism', name: '虛空稜鏡', element: 'dark', hp: 205, attack: 830, skill: { kind: 'ougi-cap', value: 6 }, mainHandPower: 162 },
] as const satisfies readonly WeaponDefinition[];
