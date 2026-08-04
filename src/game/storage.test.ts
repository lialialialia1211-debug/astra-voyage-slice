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

it('migrates a tutorial-cleared v1 save into the land route', () => {
  const oldState = versionOneState({ flags: ['flag_tutorial_victory'] });
  const repository = createSaveRepository(memoryStorage({
    'astra-save-v1': JSON.stringify(oldState),
  }), () => 1_000);

  const result = repository.load();

  expect(result.corruptBackup).toBeNull();
  expect(result.state.version).toBe(2);
  expect(result.state.firstClears).toEqual(['land_01_port_defense']);
  expect(result.state.selectedStageId).toBe('land_02_surface_ruins');
  expect(result.state.ap).toEqual({ current: 30, lastRecoveredAt: 1_000 });
  expect(result.state.inventory.fieldRation).toBe(1);
  expect(result.state.relation.chr_02).toEqual({ xp: 100, level: 3 });
});

it('preserves a tidal-victory collection and marks all land content read', () => {
  const oldState = versionOneState({
    flags: ['flag_tutorial_victory', 'flag_tidal_boss_victory'],
    viewedEvents: ['evt_chr02_bond03'],
  });
  const repository = createSaveRepository(memoryStorage({
    'astra-save-v1': JSON.stringify(oldState),
  }), () => 1_000);

  const result = repository.load();

  expect(result.state.firstClears).toHaveLength(4);
  expect(result.state.viewedStories).toHaveLength(8);
  expect(result.state.viewedEvents).toEqual(['evt_chr02_bond03']);
  expect(result.state.flags).toContain('flag_tidal_boss_victory');
  expect(result.state.screen).toBe('cabin');
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
