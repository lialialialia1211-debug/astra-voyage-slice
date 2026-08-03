import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import { App } from '../../app/App';
import { content } from '../../content';
import { createInitialState, type GameState } from '../../game/initial-state';
import { createSaveRepository } from '../../game/storage';
import { recommendLoadout } from '../loadout/calculate-loadout';
import { createBattle } from './engine';
import { BattleStage } from './BattleScreen';

const fullParty = ['chr_01', 'chr_02', 'chr_03', 'chr_04'] as const;

beforeEach(() => {
  window.localStorage.clear();
});

it('telegraphs the tidal strike and allows all-party guard', async () => {
  const user = userEvent.setup();
  const base = createBattle({
    encounterId: 'enc_tidal_boss',
    partyIds: fullParty,
    loadoutAttack: 8420,
    loadoutHp: 2180,
    summonId: 'smn_01_solar_leviathan',
  });
  const battle = {
    ...base,
    telegraph: { name: '全體潮汐衝擊', target: 'all' as const },
  };

  render(<BattleStage initialBattle={battle} onComplete={vi.fn()} />);

  expect(screen.getByText('預告：全體潮汐衝擊')).toBeVisible();
  await user.click(screen.getByRole('button', { name: '全隊防禦' }));
  expect(screen.getByText('全隊進入防禦姿態')).toBeVisible();
});

it('keeps the selected loadout when retrying a defeat', async () => {
  const user = userEvent.setup();
  const weaponGrid = recommendLoadout('fire', content.weapons);
  const state = {
    ...createInitialState(),
    adultConfirmed: true,
    captainId: 'cap_f' as const,
    roster: [...fullParty],
    party: ['chr_01', 'chr_02', 'chr_03', 'chr_04'],
    weaponGrid,
    summonId: 'smn_01_solar_leviathan' as const,
    screen: 'results' as const,
    currentEncounterId: 'enc_tutorial' as const,
    lastResult: 'defeat' as const,
    lastEnemyHp: 820,
  } satisfies GameState;
  const repository = createSaveRepository(window.localStorage);
  repository.save(state);

  render(<App />);
  await user.click(screen.getByRole('button', { name: '以原編成重試' }));

  expect(await screen.findByRole('heading', { name: '港都防衛演習' })).toBeVisible();
  await waitFor(() => expect(repository.load().state.weaponGrid).toEqual(weaponGrid));
});
