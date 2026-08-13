import { z } from 'zod';
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
import { createInitialState, type GameState } from './initial-state';

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
const legacyScreenSchema = z.enum([
  'adult-gate', 'captain-select', 'prologue', 'recruit', 'formation',
  'expedition-map', 'story', 'growth', 'loadout', 'battle', 'results',
  'cabin', 'gallery', 'settings',
]);
const screenSchema = z.enum([
  'adult-gate', 'captain-select', 'prologue', 'recruit', 'formation',
  'expedition-map', 'story', 'chapter-prep', 'chapter-milestone',
  'growth', 'loadout', 'battle', 'results', 'cabin', 'gallery', 'settings',
]);
const chapterEncounterIdSchema = z.string().regex(/^ch01_b\d{2}_[a-z0-9_]+$/);
const battleEncounterIdSchema = z.union([encounterIdSchema, chapterEncounterIdSchema]);

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
  contentSet: z.enum(['legacy', 'chapter-one']).default('legacy'),
  encounterId: battleEncounterIdSchema,
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

const versionTwoStateSchema = z.object({
  version: z.literal(2),
  screen: legacyScreenSchema,
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
  storyReturnScreen: legacyScreenSchema.nullable(),
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

const versionThreeChapterSceneIdSchema = z.enum([
  'ch01_scene_01_port_bell',
  'ch01_scene_02_black_ship',
]);
const versionThreeChapterNodeIdSchema = z.enum([
  'scene-1',
  'scene-2',
  'battle-1-prep',
  'battle-1',
  'milestone-complete',
]);
const chapterSceneIdSchema = z.string().regex(/^ch01_scene_\d{2}_[a-z0-9_]+$/);
const chapterNodeIdSchema = z.string().regex(/^(?:scene-\d+|battle-\d+(?:-prep)?|chapter-complete|milestone-complete)$/);
const chapterPlayableActorIdSchema = z.enum([
  'zhaoli', 'yanling', 'saifula', 'mila', 'yilan', 'hanze', 'luoen',
]);
const starterWeaponIdSchema = z.enum([
  'wpn_fire_01',
  'wpn_water_01',
  'wpn_earth_01',
  'wpn_wind_01',
  'wpn_light_01',
  'wpn_dark_01',
]);
const volumeSchema = z.number().min(0).max(1);

const versionThreeStateSchema = versionTwoStateSchema.extend({
  version: z.literal(3),
  screen: screenSchema,
  storyReturnScreen: screenSchema.nullable(),
  chapterOne: z.object({
    currentNode: versionThreeChapterNodeIdSchema,
    activeSceneId: versionThreeChapterSceneIdSchema,
    activeLineIndex: safeQuantity,
    completedScenes: z.array(versionThreeChapterSceneIdSchema),
    completedBattles: z.array(chapterEncounterIdSchema),
    selectedStarterWeaponId: starterWeaponIdSchema,
    activeEncounterId: chapterEncounterIdSchema.nullable(),
    paidAp: z.union([z.literal(0), z.literal(5)]),
    tutorialStep: z.enum(['attack', 'enemy-turn', 'hp', 'victory-defeat']).nullable(),
    battleSnapshot: battleStateSchema.nullable(),
    lastResult: z.enum(['victory', 'defeat']).nullable(),
  }),
  storySettings: z.object({
    auto: z.boolean(),
    allowUnreadFastForward: z.boolean(),
    textSpeed: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  }),
  audioSettings: z.object({
    master: volumeSchema,
    bgm: volumeSchema,
    ambience: volumeSchema,
    sfx: volumeSchema,
  }),
});

const versionFourStateSchema = versionThreeStateSchema.extend({
  version: z.literal(4),
  chapterOne: z.object({
    currentNode: chapterNodeIdSchema,
    activeSceneId: chapterSceneIdSchema,
    activeLineIndex: safeQuantity,
    completedScenes: z.array(chapterSceneIdSchema),
    completedBattles: z.array(chapterEncounterIdSchema),
    selectedPartyIds: z.array(chapterPlayableActorIdSchema).min(1).max(4),
    unlockedActorIds: z.array(chapterPlayableActorIdSchema),
    selectedStarterWeaponId: starterWeaponIdSchema,
    activeEncounterId: chapterEncounterIdSchema.nullable(),
    paidAp: z.union([z.literal(0), z.literal(5)]),
    tutorialStep: z.enum(['attack', 'enemy-turn', 'hp', 'victory-defeat']).nullable(),
    battleSnapshot: battleStateSchema.nullable(),
    lastResult: z.enum(['victory', 'defeat']).nullable(),
  }),
});

export const gameStateSchema = versionFourStateSchema.extend({
  version: z.literal(5),
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
type VersionTwoState = z.infer<typeof versionTwoStateSchema>;
type VersionThreeState = z.infer<typeof versionThreeStateSchema>;
type VersionFourState = z.infer<typeof versionFourStateSchema>;

export function migrateV1State(input: VersionOneState, now: number): GameState {
  const base = createInitialState(now);
  return gameStateSchema.parse({
    ...base,
    adultConfirmed: input.adultConfirmed,
    adultMode: input.adultMode,
    screen: input.adultConfirmed ? 'story' : 'adult-gate',
  }) as GameState;
}

export function migrateV2State(input: VersionTwoState, now: number): GameState {
  const base = createInitialState(now);
  return gameStateSchema.parse({
    ...base,
    adultConfirmed: input.adultConfirmed,
    adultMode: input.adultMode,
    screen: input.adultConfirmed ? 'story' : 'adult-gate',
    ap: input.ap,
    inventory: input.inventory,
  }) as GameState;
}

export function migrateV3State(input: VersionThreeState, now: number): GameState {
  const completedSlice = input.chapterOne.currentNode === 'milestone-complete';
  return gameStateSchema.parse({
    ...input,
    version: 5,
    screen: completedSlice ? 'story' : input.screen,
    chapterOne: {
      ...input.chapterOne,
      currentNode: completedSlice ? 'scene-3' : input.chapterOne.currentNode,
      activeSceneId: completedSlice
        ? 'ch01_scene_03_hand_that_would_not_let_go'
        : input.chapterOne.activeSceneId,
      activeLineIndex: completedSlice ? 0 : input.chapterOne.activeLineIndex,
      selectedPartyIds: ['zhaoli', 'luoen'],
      unlockedActorIds: ['zhaoli'],
      activeEncounterId: completedSlice ? null : input.chapterOne.activeEncounterId,
      paidAp: completedSlice ? 0 : input.chapterOne.paidAp,
      battleSnapshot: null,
      lastResult: completedSlice ? null : input.chapterOne.lastResult,
    },
  }) as GameState;
}

export function migrateV4State(input: VersionFourState, now: number): GameState {
  const base = createInitialState(now);
  return gameStateSchema.parse({
    ...input,
    version: 5,
    screen: input.adultConfirmed ? 'story' : 'adult-gate',
    activeStoryId: null,
    storyReturnScreen: null,
    chapterOne: base.chapterOne,
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
          : version === 2
            ? migrateV2State(versionTwoStateSchema.parse(json), now())
            : version === 3
              ? migrateV3State(versionThreeStateSchema.parse(json), now())
              : version === 4
                ? migrateV4State(versionFourStateSchema.parse(json), now())
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
