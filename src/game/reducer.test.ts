import { createInitialState } from './initial-state';
import { gameReducer } from './reducer';

it('moves confirmed adults to captain selection', () => {
  const state = gameReducer(createInitialState(), { type: 'CONFIRM_ADULT' });

  expect(state.adultConfirmed).toBe(true);
  expect(state.screen).toBe('captain-select');
});

it('selects a captain and opens the prologue', () => {
  const confirmed = gameReducer(createInitialState(), { type: 'CONFIRM_ADULT' });
  const state = gameReducer(confirmed, { type: 'SELECT_CAPTAIN', captainId: 'cap_f' });

  expect(state.captainId).toBe('cap_f');
  expect(state.screen).toBe('prologue');
});

it('rejects duplicate party members', () => {
  expect(() =>
    gameReducer(createInitialState(), {
      type: 'SET_PARTY',
      party: ['chr_01', 'chr_01', 'chr_02', 'chr_03'],
    }),
  ).toThrow('隊伍角色不可重複');
});

it('grants relation experience only after victory', () => {
  const initial = createInitialState();
  const victory = gameReducer(initial, { type: 'FINISH_ENCOUNTER', result: 'victory', flags: [] });
  const defeat = gameReducer(initial, { type: 'FINISH_ENCOUNTER', result: 'defeat', flags: [] });

  expect(victory.relation.chr_02).toEqual({ xp: 40, level: 2 });
  expect(defeat.relation.chr_02).toEqual({ xp: 0, level: 1 });
});

it('keeps party and loadout unchanged when adult collection state changes', () => {
  const initial = createInitialState();
  const relation = gameReducer(initial, { type: 'ADD_RELATION_XP', characterId: 'chr_02', xp: 100 });
  const viewed = gameReducer(relation, { type: 'MARK_EVENT_VIEWED', eventId: 'evt_chr02_bond03' });
  const hidden = gameReducer(viewed, { type: 'SET_ADULT_MODE', mode: 'hidden-thumbnails' });

  expect(hidden.party).toEqual(initial.party);
  expect(hidden.weaponGrid).toEqual(initial.weaponGrid);
  expect(hidden.relation.chr_02).toEqual({ xp: 100, level: 3 });
});
