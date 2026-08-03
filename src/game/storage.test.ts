import { createInitialState } from './initial-state';
import { createSaveRepository } from './storage';

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
  const repository = createSaveRepository(memoryStorage({ 'astra-save-v1': '{broken' }));

  expect(repository.load()).toEqual({
    state: createInitialState(),
    corruptBackup: '{broken',
  });
});

it('round-trips a valid versioned save', () => {
  const storage = memoryStorage();
  const repository = createSaveRepository(storage);
  const state = { ...createInitialState(), adultConfirmed: true, screen: 'captain-select' as const };

  repository.save(state);

  expect(repository.load()).toEqual({ state, corruptBackup: null });
});
