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
