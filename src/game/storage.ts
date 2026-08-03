import { z } from 'zod';
import { createInitialState, type GameState } from './initial-state';

const saveKey = 'astra-save-v1';

const characterIdSchema = z.enum(['chr_01', 'chr_02', 'chr_03', 'chr_04']);
const weaponIdSchema = z.enum([
  'wpn_01_sunblade', 'wpn_02_molten_lance', 'wpn_03_tidemark_axe', 'wpn_04_resonance_staff',
  'wpn_05_fireline_dagger', 'wpn_06_route_bow', 'wpn_07_expedition_rifle', 'wpn_08_shoreguard_shield',
  'wpn_09_astrolabe', 'wpn_10_dawn_greatblade', 'wpn_11_depth_anchor', 'wpn_12_void_prism',
]);
const nullableWeapon = weaponIdSchema.nullable();
const relationEntry = z.object({
  xp: z.number().int().nonnegative(),
  level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
});

export const gameStateSchema = z.object({
  version: z.literal(1),
  screen: z.enum(['adult-gate', 'captain-select', 'prologue', 'recruit', 'formation', 'loadout', 'battle', 'results', 'cabin', 'gallery', 'settings']),
  adultConfirmed: z.boolean(),
  adultMode: z.enum(['full', 'fade', 'hidden-thumbnails']),
  captainId: z.enum(['cap_m', 'cap_f']).nullable(),
  roster: z.array(characterIdSchema),
  party: z.tuple([characterIdSchema.nullable(), characterIdSchema.nullable(), characterIdSchema.nullable(), characterIdSchema.nullable()]),
  weaponGrid: z.object({
    main: nullableWeapon,
    sub: z.tuple([
      nullableWeapon, nullableWeapon, nullableWeapon, nullableWeapon, nullableWeapon,
      nullableWeapon, nullableWeapon, nullableWeapon, nullableWeapon,
    ]),
  }),
  summonId: z.enum(['smn_01_solar_leviathan', 'smn_02_abyssal_oracle']).nullable(),
  relation: z.object({
    chr_01: relationEntry,
    chr_02: relationEntry,
    chr_03: relationEntry,
    chr_04: relationEntry,
  }),
  flags: z.array(z.string()),
  viewedEvents: z.array(z.enum(['evt_chr02_bond03', 'evt_chr02_status', 'evt_chr02_defeat'])),
  currentEncounterId: z.enum(['enc_tutorial', 'enc_tidal_boss']).nullable(),
  lastResult: z.enum(['victory', 'defeat']).nullable(),
});

export interface SaveLoadResult {
  state: GameState;
  corruptBackup: string | null;
}

export interface SaveRepository {
  load(): SaveLoadResult;
  save(state: GameState): void;
  clear(): void;
}

export function createSaveRepository(storage: Storage): SaveRepository {
  return {
    load() {
      const raw = storage.getItem(saveKey);
      if (raw === null) return { state: createInitialState(), corruptBackup: null };
      try {
        return { state: gameStateSchema.parse(JSON.parse(raw)) as GameState, corruptBackup: null };
      } catch {
        return { state: createInitialState(), corruptBackup: raw };
      }
    },
    save(state) {
      storage.setItem(saveKey, JSON.stringify(gameStateSchema.parse(state)));
    },
    clear() {
      storage.removeItem(saveKey);
    },
  };
}
