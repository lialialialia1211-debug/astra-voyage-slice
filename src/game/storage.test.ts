import { createInitialState } from './initial-state';
import { createSaveRepository } from './storage';

function versionOneState(overrides: Record<string, unknown> = {}) {
  return {
    version: 1,
    screen: 'cabin',
    adultConfirmed: true,
    adultMode: 'full',
    captainId: 'cap_f',
    roster: ['chr_01', 'chr_02', 'chr_03', 'chr_04'],
    party: ['chr_01', 'chr_02', 'chr_03', 'chr_04'],
    weaponGrid: { main: null, sub: [null, null, null, null, null, null, null, null, null] },
    summonId: null,
    relation: {
      chr_01: { xp: 40, level: 2 },
      chr_02: { xp: 100, level: 3 },
      chr_03: { xp: 40, level: 2 },
      chr_04: { xp: 40, level: 2 },
    },
    flags: [],
    viewedEvents: [],
    currentEncounterId: null,
    lastResult: null,
    lastEnemyHp: null,
    ...overrides,
  };
}

function memoryStorage(initial: Record<string, string> = {}): Storage {
  const entries = new Map(Object.entries(initial));
  return {
    get length() {
      return entries.size;
    },
    clear: () => entries.clear(),
    getItem: (key) => entries.get(key) ?? null,
    key: (index) => [...entries.keys()][index] ?? null,
    removeItem: (key) => {
      entries.delete(key);
    },
    setItem: (key, value) => {
      entries.set(key, value);
    },
  };
}

it('preserves corrupt text for export and starts a safe state', () => {
  const repository = createSaveRepository(memoryStorage({ 'astra-save-v1': '{broken' }), () => 1_000);

  expect(repository.load()).toEqual({
    state: createInitialState(1_000),
    corruptBackup: '{broken',
  });
});

it('round-trips a valid versioned save', () => {
  const storage = memoryStorage();
  const repository = createSaveRepository(storage, () => 1_000);
  const state = { ...createInitialState(1_000), adultConfirmed: true, screen: 'captain-select' as const };

  repository.save(state);

  expect(repository.load()).toEqual({ state, corruptBackup: null });
});

it('migrates a tutorial-cleared v1 save into a fresh canonical chapter', () => {
  const oldState = versionOneState({ flags: ['flag_tutorial_victory'] });
  const repository = createSaveRepository(memoryStorage({
    'astra-save-v1': JSON.stringify(oldState),
  }), () => 1_000);

  const result = repository.load();

  expect(result.corruptBackup).toBeNull();
  expect(result.state.version).toBe(5);
  expect(result.state.firstClears).toEqual([]);
  expect(result.state.screen).toBe('story');
  expect(result.state.chapterOne).toMatchObject({
    currentNode: 'scene-1',
    activeSceneId: 'ch01_scene_01_port_bell',
    completedScenes: [],
    completedBattles: [],
  });
  expect(result.state.ap).toEqual({ current: 30, lastRecoveredAt: 1_000 });
  expect(result.state.inventory.fieldRation).toBe(1);
});

it('does not map legacy collection progress into the canonical chapter', () => {
  const oldState = versionOneState({
    flags: ['flag_tutorial_victory', 'flag_tidal_boss_victory'],
    viewedEvents: ['evt_chr02_bond03'],
  });
  const repository = createSaveRepository(memoryStorage({
    'astra-save-v1': JSON.stringify(oldState),
  }), () => 1_000);

  const result = repository.load();

  expect(result.state.firstClears).toEqual([]);
  expect(result.state.viewedStories).toEqual([]);
  expect(result.state.viewedEvents).toEqual([]);
  expect(result.state.flags).toEqual([]);
  expect(result.state.screen).toBe('story');
});

it('migrates a v2 save while preserving safe display and AP settings', () => {
  const legacy = {
    ...createInitialState(1_000),
    version: 2,
    adultConfirmed: true,
    adultMode: 'fade',
    screen: 'cabin',
    firstClears: ['land_01_port_defense'],
    ap: { current: 20, lastRecoveredAt: 1_000 },
  };
  const repository = createSaveRepository(memoryStorage({
    'astra-save-v1': JSON.stringify(legacy),
  }), () => 1_000);

  const result = repository.load();

  expect(result.state.version).toBe(5);
  expect(result.state.adultMode).toBe('fade');
  expect(result.state.ap).toEqual({ current: 20, lastRecoveredAt: 1_000 });
  expect(result.state.firstClears).toEqual([]);
  expect(result.state.chapterOne.currentNode).toBe('scene-1');
});

it('migrates the completed v3 vertical slice to scene three', () => {
  const initial = createInitialState(1_000);
  const versionThree = {
    ...initial,
    version: 3,
    adultConfirmed: true,
    screen: 'chapter-milestone',
    chapterOne: {
      currentNode: 'milestone-complete',
      activeSceneId: 'ch01_scene_02_black_ship',
      activeLineIndex: 0,
      completedScenes: ['ch01_scene_01_port_bell', 'ch01_scene_02_black_ship'],
      completedBattles: ['ch01_b01_outer_bay_rescue'],
      selectedStarterWeaponId: 'wpn_water_01',
      activeEncounterId: 'ch01_b01_outer_bay_rescue',
      paidAp: 0,
      tutorialStep: 'victory-defeat',
      battleSnapshot: null,
      lastResult: 'victory',
    },
  };
  const repository = createSaveRepository(memoryStorage({
    'astra-save-v1': JSON.stringify(versionThree),
  }), () => 1_000);

  const result = repository.load();

  expect(result.corruptBackup).toBeNull();
  expect(result.state.version).toBe(5);
  expect(result.state.screen).toBe('story');
  expect(result.state.chapterOne.currentNode).toBe('scene-3');
  expect(result.state.chapterOne.activeSceneId).toBe('ch01_scene_03_hand_that_would_not_let_go');
});

it('restarts chapter one when loading the pre-rewrite v4 dialogue save', () => {
  const initial = createInitialState(1_000);
  const versionFour = {
    ...initial,
    version: 4,
    adultConfirmed: true,
    adultMode: 'fade' as const,
    screen: 'story' as const,
    storySettings: {
      auto: true,
      allowUnreadFastForward: true,
      textSpeed: 3 as const,
    },
    audioSettings: {
      master: 0.8,
      bgm: 0.7,
      ambience: 0.6,
      sfx: 0.5,
    },
    chapterOne: {
      ...initial.chapterOne,
      currentNode: 'scene-2' as const,
      activeSceneId: 'ch01_scene_02_black_ship' as const,
      activeLineIndex: 32,
      completedScenes: ['ch01_scene_01_port_bell' as const],
    },
  };
  const repository = createSaveRepository(memoryStorage({
    'astra-save-v1': JSON.stringify(versionFour),
  }), () => 2_000);

  const result = repository.load();

  expect(result.corruptBackup).toBeNull();
  expect(result.state.version).toBe(5);
  expect(result.state.screen).toBe('story');
  expect(result.state.adultMode).toBe('fade');
  expect(result.state.storySettings).toEqual(versionFour.storySettings);
  expect(result.state.audioSettings).toEqual(versionFour.audioSettings);
  expect(result.state.chapterOne).toMatchObject({
    currentNode: 'scene-1',
    activeSceneId: 'ch01_scene_01_port_bell',
    activeLineIndex: 0,
    completedScenes: [],
    completedBattles: [],
  });
});

it('synchronizes offline AP when loading a v2 save', () => {
  const state = {
    ...createInitialState(1_000),
    ap: { current: 20, lastRecoveredAt: 1_000 },
  };
  const repository = createSaveRepository(memoryStorage({
    'astra-save-v1': JSON.stringify(state),
  }), () => 601_000);

  expect(repository.load().state.ap).toEqual({ current: 22, lastRecoveredAt: 601_000 });
});
