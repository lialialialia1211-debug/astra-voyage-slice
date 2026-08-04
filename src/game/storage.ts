import { z } from 'zod';
import { content } from '../content';
import {
  characterIdSchema,
  encounterIdSchema,
  eventIdSchema,
  rewardBundleSchema,
  stageIdSchema,
  storySceneIdSchema,
  summonIdSchema,
  weaponIdSchema,
} from '../domain/schemas';
import { syncAp } from '../features/expedition/progression';
import { createInitialState, type GameState, type ScreenId } from './initial-state';

const saveKey = 'astra-save-v1';
const safeQuantity = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const growthLevelSchema = z.union([
  z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5),
  z.literal(6), z.literal(7), z.literal(8), z.literal(9), z.literal(10),
]);
const nullableWeapon = weaponIdSchema.nullable();
const relationEntry = z.object({
  xp: safeQuantity,
  level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
});
const relationSchema = z.object({
  chr_01: relationEntry,
  chr_02: relationEntry,
  chr_03: relationEntry,
  chr_04: relationEntry,
});
const weaponGridSchema = z.object({
  main: nullableWeapon,
  sub: z.tuple([
    nullableWeapon, nullableWeapon, nullableWeapon, nullableWeapon, nullableWeapon,
    nullableWeapon, nullableWeapon, nullableWeapon, nullableWeapon,
  ]),
});
const screenSchema = z.enum([
  'adult-gate', 'captain-select', 'prologue', 'recruit', 'formation',
  'expedition-map', 'story', 'growth', 'loadout', 'battle', 'results',
  'cabin', 'gallery', 'settings',
]);

const battleStatusSchema = z.object({
  id: z.string().min(1),
  turns: z.number().int().nonnegative(),
  value: z.number().finite(),
});
const battleActorSchema = z.object({
  id: z.string().min(1),
  element: z.enum(['fire', 'water', 'wind', 'earth', 'light', 'dark']),
  hp: z.number().int().nonnegative(),
  maxHp: z.number().int().positive(),
  attack: z.number().int().nonnegative(),
  charge: z.number().int().min(0).max(100),
  cooldowns: z.record(z.string(), z.number().int().nonnegative()),
  statuses: z.array(battleStatusSchema),
});
const battleStateSchema = z.object({
  encounterId: encounterIdSchema,
  turn: z.number().int().positive(),
  phase: z.enum(['player-skills', 'player-attack', 'enemy', 'complete']),
  party: z.array(battleActorSchema).min(1),
  enemies: z.array(battleActorSchema).min(1),
  bossMode: z.enum(['normal', 'overdrive', 'break']),
  modeGauge: z.number().int().nonnegative(),
  summonId: summonIdSchema.nullable(),
  summonUsed: z.boolean(),
  telegraph: z.object({
    name: z.string().min(1),
    target: z.enum(['single', 'all']),
  }).nullable(),
  result: z.enum(['victory', 'defeat']).nullable(),
  flags: z.array(z.string()),
});

export const gameStateSchema = z.object({
  version: z.literal(2),
  screen: screenSchema,
  adultConfirmed: z.boolean(),
  adultMode: z.enum(['full', 'fade', 'hidden-thumbnails']),
  captainId: z.enum(['cap_m', 'cap_f']).nullable(),
  roster: z.array(characterIdSchema),
  party: z.tuple([
    characterIdSchema.nullable(), characterIdSchema.nullable(),
    characterIdSchema.nullable(), characterIdSchema.nullable(),
  ]),
  weaponGrid: weaponGridSchema,
  summonId: summonIdSchema.nullable(),
  relation: relationSchema,
  flags: z.array(z.string()),
  viewedEvents: z.array(eventIdSchema),
  currentEncounterId: encounterIdSchema.nullable(),
  lastResult: z.enum(['victory', 'defeat']).nullable(),
  lastEnemyHp: safeQuantity.nullable(),
  ap: z.object({
    current: z.number().int().min(0).max(30),
    lastRecoveredAt: safeQuantity,
  }),
  inventory: rewardBundleSchema,
  characterLevels: z.object({
    chr_01: growthLevelSchema,
    chr_02: growthLevelSchema,
    chr_03: growthLevelSchema,
    chr_04: growthLevelSchema,
  }),
  weaponLevels: z.object({
    wpn_01_sunblade: growthLevelSchema,
    wpn_02_molten_lance: growthLevelSchema,
    wpn_03_tidemark_axe: growthLevelSchema,
    wpn_04_resonance_staff: growthLevelSchema,
    wpn_05_fireline_dagger: growthLevelSchema,
    wpn_06_route_bow: growthLevelSchema,
    wpn_07_expedition_rifle: growthLevelSchema,
    wpn_08_shoreguard_shield: growthLevelSchema,
    wpn_09_astrolabe: growthLevelSchema,
    wpn_10_dawn_greatblade: growthLevelSchema,
    wpn_11_depth_anchor: growthLevelSchema,
    wpn_12_void_prism: growthLevelSchema,
  }),
  firstClears: z.array(stageIdSchema),
  viewedStories: z.array(storySceneIdSchema),
  activeStoryId: storySceneIdSchema.nullable(),
  storyReturnScreen: screenSchema.nullable(),
  selectedStageId: stageIdSchema,
  activeChallenge: z.object({
    stageId: stageIdSchema,
    encounterId: encounterIdSchema,
    apCost: z.union([z.literal(5), z.literal(10)]),
  }).nullable(),
  battleSnapshot: battleStateSchema.nullable(),
  lastStageRewards: z.object({
    stageId: stageIdSchema,
    clear: rewardBundleSchema,
    firstClear: rewardBundleSchema,
    relationXp: safeQuantity,
    refundedAp: z.number().int().min(0).max(10),
    seaUnlocked: z.boolean(),
  }).nullable(),
});

const versionOneScreenSchema = z.enum([
  'adult-gate', 'captain-select', 'prologue', 'recruit', 'formation',
  'loadout', 'battle', 'results', 'cabin', 'gallery', 'settings',
]);
const versionOneStateSchema = z.object({
  version: z.literal(1),
  screen: versionOneScreenSchema,
  adultConfirmed: z.boolean(),
  adultMode: z.enum(['full', 'fade', 'hidden-thumbnails']),
  captainId: z.enum(['cap_m', 'cap_f']).nullable(),
  roster: z.array(characterIdSchema),
  party: z.tuple([
    characterIdSchema.nullable(), characterIdSchema.nullable(),
    characterIdSchema.nullable(), characterIdSchema.nullable(),
  ]),
  weaponGrid: weaponGridSchema,
  summonId: summonIdSchema.nullable(),
  relation: relationSchema,
  flags: z.array(z.string()),
  viewedEvents: z.array(eventIdSchema),
  currentEncounterId: z.enum(['enc_tutorial', 'enc_tidal_boss']).nullable(),
  lastResult: z.enum(['victory', 'defeat']).nullable(),
  lastEnemyHp: safeQuantity.nullable().default(null),
});

type VersionOneState = z.infer<typeof versionOneStateSchema>;

function migratedScreen(screen: VersionOneState['screen']): ScreenId {
  if (['adult-gate', 'captain-select', 'prologue', 'recruit'].includes(screen)) return screen as ScreenId;
  if (['cabin', 'gallery', 'settings'].includes(screen)) return screen as ScreenId;
  return 'expedition-map';
}

export function migrateV1State(input: VersionOneState, now: number): GameState {
  const base = createInitialState(now);
  const completedTidalBoss = input.flags.includes('flag_tidal_boss_victory');
  const completedTutorial = completedTidalBoss || input.flags.includes('flag_tutorial_victory');
  const firstClears = completedTidalBoss
    ? content.stages.map((stage) => stage.id)
    : completedTutorial
      ? ['land_01_port_defense' as const]
      : [];
  const viewedStories = completedTidalBoss
    ? content.stories.map((story) => story.id)
    : [];

  return gameStateSchema.parse({
    ...base,
    adultConfirmed: input.adultConfirmed,
    adultMode: input.adultMode,
    captainId: input.captainId,
    roster: input.roster,
    party: input.party,
    weaponGrid: input.weaponGrid,
    summonId: input.summonId,
    relation: input.relation,
    flags: input.flags,
    viewedEvents: input.viewedEvents,
    currentEncounterId: input.currentEncounterId,
    lastResult: input.lastResult,
    lastEnemyHp: input.lastEnemyHp,
    screen: migratedScreen(input.screen),
    firstClears,
    viewedStories,
    selectedStageId: completedTidalBoss
      ? 'land_04_leyline_core'
      : completedTutorial
        ? 'land_02_surface_ruins'
        : 'land_01_port_defense',
  }) as GameState;
}

export interface SaveLoadResult {
  state: GameState;
  corruptBackup: string | null;
}

export interface SaveRepository {
  load(): SaveLoadResult;
  save(state: GameState): void;
  clear(): void;
}

export function createSaveRepository(
  storage: Storage,
  now: () => number = Date.now,
): SaveRepository {
  return {
    load() {
      const raw = storage.getItem(saveKey);
      if (raw === null) return { state: createInitialState(now()), corruptBackup: null };
      try {
        const json: unknown = JSON.parse(raw);
        const version = typeof json === 'object' && json !== null && 'version' in json
          ? (json as { version?: unknown }).version
          : null;
        const loaded = version === 1
          ? migrateV1State(versionOneStateSchema.parse(json), now())
          : gameStateSchema.parse(json) as GameState;
        return {
          state: { ...loaded, ap: syncAp(loaded.ap, now()) },
          corruptBackup: null,
        };
      } catch {
        return { state: createInitialState(now()), corruptBackup: raw };
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
