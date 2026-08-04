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
  const onSnapshot = vi.fn();
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

  render(<BattleStage initialBattle={battle} onComplete={vi.fn()} onSnapshot={onSnapshot} />);

  expect(screen.getByText('預告：全體潮汐衝擊')).toBeVisible();
  await user.click(screen.getByRole('button', { name: '全隊防禦' }));
  expect(screen.getByText('全隊進入防禦姿態')).toBeVisible();
  expect(onSnapshot).toHaveBeenCalledWith(expect.objectContaining({ turn: 2 }));
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
    selectedStageId: 'land_01_port_defense' as const,
    lastResult: 'defeat' as const,
    lastEnemyHp: 820,
    lastStageRewards: {
      stageId: 'land_01_port_defense' as const,
      clear: { expeditionPoints: 0, surfaceAlloy: 0, ruinChip: 0, leylineCore: 0, fieldRation: 0 },
      firstClear: { expeditionPoints: 0, surfaceAlloy: 0, ruinChip: 0, leylineCore: 0, fieldRation: 0 },
      relationXp: 0,
      refundedAp: 5,
      seaUnlocked: false,
    },
  } satisfies GameState;
  const repository = createSaveRepository(window.localStorage);
  repository.save(state);

  render(<App />);
  expect(screen.getByText('已退還 AP 5')).toBeVisible();
  await user.click(screen.getByRole('button', { name: '調整艦裝後重試' }));

  expect(await screen.findByRole('heading', { name: '艦裝武器盤' })).toBeVisible();
  await waitFor(() => expect(repository.load().state.weaponGrid).toEqual(weaponGrid));
});
