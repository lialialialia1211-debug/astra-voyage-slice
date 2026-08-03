import type {
  CaptainId,
  CharacterId,
  EncounterId,
  EventId,
  SummonId,
  WeaponId,
} from '../domain/types';

export type ScreenId =
  | 'adult-gate'
  | 'captain-select'
  | 'prologue'
  | 'recruit'
  | 'formation'
  | 'loadout'
  | 'battle'
  | 'results'
  | 'cabin'
  | 'gallery'
  | 'settings';

export type AdultDisplayMode = 'full' | 'fade' | 'hidden-thumbnails';

export interface WeaponGrid {
  main: WeaponId | null;
  sub: [
    WeaponId | null,
    WeaponId | null,
    WeaponId | null,
    WeaponId | null,
    WeaponId | null,
    WeaponId | null,
    WeaponId | null,
    WeaponId | null,
    WeaponId | null,
  ];
}

export interface GameState {
  version: 1;
  screen: ScreenId;
  adultConfirmed: boolean;
  adultMode: AdultDisplayMode;
  captainId: CaptainId | null;
  roster: CharacterId[];
  party: [CharacterId | null, CharacterId | null, CharacterId | null, CharacterId | null];
  weaponGrid: WeaponGrid;
  summonId: SummonId | null;
  relation: Record<CharacterId, { xp: number; level: 1 | 2 | 3 | 4 }>;
  flags: string[];
  viewedEvents: EventId[];
  currentEncounterId: EncounterId | null;
  lastResult: 'victory' | 'defeat' | null;
  lastEnemyHp: number | null;
}

export function createInitialState(): GameState {
  return {
    version: 1,
    screen: 'adult-gate',
    adultConfirmed: false,
    adultMode: 'full',
    captainId: null,
    roster: ['chr_01', 'chr_02', 'chr_03'],
    party: [null, null, null, null],
    weaponGrid: { main: null, sub: [null, null, null, null, null, null, null, null, null] },
    summonId: null,
    relation: {
      chr_01: { xp: 0, level: 1 },
      chr_02: { xp: 0, level: 1 },
      chr_03: { xp: 0, level: 1 },
      chr_04: { xp: 0, level: 1 },
    },
    flags: [],
    viewedEvents: [],
    currentEncounterId: null,
    lastResult: null,
    lastEnemyHp: null,
  };
}
