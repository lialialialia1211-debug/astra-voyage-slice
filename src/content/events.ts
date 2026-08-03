import type { EventDefinition } from '../domain/types';

export const events = [
  {
    id: 'evt_chr02_bond03',
    characterId: 'chr_02',
    title: '深潛後的約定',
    requiredRelationLevel: 3,
    requiredFlags: ['flag_tidal_boss_victory'],
    assetId: 'evt_chr02_bond03_cg01',
    adult: true,
  },
  {
    id: 'evt_chr02_status',
    characterId: 'chr_02',
    title: '深潮記錄',
    requiredRelationLevel: 2,
    requiredFlags: ['flag_status_depth_corrosion'],
    assetId: 'evt_chr02_status_cg01',
    adult: true,
  },
  {
    id: 'evt_chr02_defeat',
    characterId: 'chr_02',
    title: '敗北航誌',
    requiredRelationLevel: 2,
    requiredFlags: ['flag_first_defeat'],
    assetId: 'evt_chr02_defeat_cg01',
    adult: true,
  },
] as const satisfies readonly EventDefinition[];
