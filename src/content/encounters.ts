import type { EncounterDefinition } from '../domain/types';

export const encounters = [
  {
    id: 'enc_tutorial',
    name: '港都防衛演習',
    kind: 'tutorial',
    victoryFlag: 'flag_tutorial_victory',
    enemies: [
      {
        id: 'enm_01_port_raider',
        name: '港區襲擊者',
        element: 'wind',
        maxHp: 1800,
        attack: 180,
        modeGauge: 0,
        actions: [{ id: 'raider-strike', name: '突擊', power: 100, target: 'single', telegraphed: false }],
      },
      {
        id: 'enm_02_tide_drone',
        name: '潮汐無人機',
        element: 'earth',
        maxHp: 2200,
        attack: 160,
        modeGauge: 0,
        actions: [{ id: 'drone-burst', name: '散射', power: 85, target: 'all', telegraphed: false }],
      },
    ],
  },
  {
    id: 'enc_tidal_boss',
    name: '潮汐守望者',
    kind: 'boss',
    victoryFlag: 'flag_tidal_boss_victory',
    enemies: [
      {
        id: 'boss_01_tidal_watchkeeper',
        name: '潮汐守望者',
        element: 'dark',
        maxHp: 18000,
        attack: 360,
        modeGauge: 100,
        actions: [
          { id: 'pressure-claw', name: '壓力鉗擊', power: 120, target: 'single', telegraphed: false },
          { id: 'tidal-impact', name: '全體潮汐衝擊', power: 150, target: 'all', telegraphed: true },
          { id: 'depth-corrosion', name: '深潮侵蝕', power: 90, target: 'all', telegraphed: true, statusId: 'depth-corrosion' },
        ],
      },
    ],
  },
] as const satisfies readonly EncounterDefinition[];
