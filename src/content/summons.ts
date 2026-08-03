import type { SummonDefinition } from '../domain/types';

export const summons = [
  { id: 'smn_01_solar_leviathan', name: '旭日巨鯨', element: 'fire', effect: 'damage', power: 420 },
  { id: 'smn_02_abyssal_oracle', name: '深淵神諭', element: 'water', effect: 'heal-and-shield', power: 360 },
] as const satisfies readonly SummonDefinition[];
