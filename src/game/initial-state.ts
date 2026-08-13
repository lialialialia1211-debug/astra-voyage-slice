import type {
  CaptainId,
  CharacterId,
  EncounterId,
  EventId,
  RewardBundle,
  StageId,
  StorySceneId,
  SummonId,
  WeaponId,
} from '../domain/types';
import type { BattleState } from '../features/battle/types';
import type { ApState, Inventory } from '../features/expedition/progression';
import type {
  ChapterEncounterId,
  ChapterNodeId,
  ChapterPlayableActorId,
  ChapterSceneId,
  StarterWeaponId,
} from '../chapter-one/types';

export type ScreenId =
  | 'adult-gate'
  | 'captain-select'
  | 'prologue'
  | 'recruit'
  | 'formation'
  | 'expedition-map'
  | 'story'
  | 'chapter-prep'
  | 'chapter-milestone'
  | 'growth'
  | 'loadout'
  | 'battle'
  | 'results'
  | 'cabin'
  | 'gallery'
  | 'settings';

export type AdultDisplayMode = 'full' | 'fade' | 'hidden-thumbnails';
export type GrowthLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

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
  version: 5;
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
  ap: ApState;
  inventory: Inventory;
  characterLevels: Record<CharacterId, GrowthLevel>;
  weaponLevels: Record<WeaponId, GrowthLevel>;
  firstClears: StageId[];
  viewedStories: StorySceneId[];
  activeStoryId: StorySceneId | null;
  storyReturnScreen: ScreenId | null;
  selectedStageId: StageId;
  activeChallenge: {
    stageId: StageId;
    encounterId: EncounterId;
    apCost: number;
  } | null;
  battleSnapshot: BattleState | null;
  lastStageRewards: {
    stageId: StageId;
    clear: RewardBundle;
    firstClear: RewardBundle;
    relationXp: number;
    refundedAp: number;
    seaUnlocked: boolean;
  } | null;
  chapterOne: {
    currentNode: ChapterNodeId;
    activeSceneId: ChapterSceneId;
    activeLineIndex: number;
    completedScenes: ChapterSceneId[];
    completedBattles: ChapterEncounterId[];
    selectedPartyIds: ChapterPlayableActorId[];
    unlockedActorIds: ChapterPlayableActorId[];
    selectedStarterWeaponId: StarterWeaponId;
    activeEncounterId: ChapterEncounterId | null;
    paidAp: 0 | 5;
    tutorialStep: 'attack' | 'enemy-turn' | 'hp' | 'victory-defeat' | null;
    battleSnapshot: BattleState | null;
    lastResult: 'victory' | 'defeat' | null;
  };
  storySettings: {
    auto: boolean;
    allowUnreadFastForward: boolean;
    textSpeed: 1 | 2 | 3;
  };
  audioSettings: {
    master: number;
    bgm: number;
    ambience: number;
    sfx: number;
  };
}

const initialWeaponLevels: Record<WeaponId, GrowthLevel> = {
  wpn_01_sunblade: 1,
  wpn_02_molten_lance: 1,
  wpn_03_tidemark_axe: 1,
  wpn_04_resonance_staff: 1,
  wpn_05_fireline_dagger: 1,
  wpn_06_route_bow: 1,
  wpn_07_expedition_rifle: 1,
  wpn_08_shoreguard_shield: 1,
  wpn_09_astrolabe: 1,
  wpn_10_dawn_greatblade: 1,
  wpn_11_depth_anchor: 1,
  wpn_12_void_prism: 1,
};

export function createInitialState(now = Date.now()): GameState {
  return {
    version: 5,
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
    ap: { current: 30, lastRecoveredAt: now },
    inventory: {
      expeditionPoints: 0,
      surfaceAlloy: 0,
      ruinChip: 0,
      leylineCore: 0,
      fieldRation: 1,
    },
    characterLevels: { chr_01: 1, chr_02: 1, chr_03: 1, chr_04: 1 },
    weaponLevels: { ...initialWeaponLevels },
    firstClears: [],
    viewedStories: [],
    activeStoryId: null,
    storyReturnScreen: null,
    selectedStageId: 'land_01_port_defense',
    activeChallenge: null,
    battleSnapshot: null,
    lastStageRewards: null,
    chapterOne: {
      currentNode: 'scene-1',
      activeSceneId: 'ch01_scene_01_port_bell',
      activeLineIndex: 0,
      completedScenes: [],
      completedBattles: [],
      selectedPartyIds: ['zhaoli', 'luoen'],
      unlockedActorIds: ['zhaoli'],
      selectedStarterWeaponId: 'wpn_water_01',
      activeEncounterId: null,
      paidAp: 0,
      tutorialStep: 'attack',
      battleSnapshot: null,
      lastResult: null,
    },
    storySettings: {
      auto: false,
      allowUnreadFastForward: false,
      textSpeed: 2,
    },
    audioSettings: {
      master: 1,
      bgm: 1,
      ambience: 1,
      sfx: 1,
    },
  };
}
