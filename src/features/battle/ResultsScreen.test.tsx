import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it } from 'vitest';
import { App } from '../../app/App';
import { createInitialState, type GameState } from '../../game/initial-state';
import { createSaveRepository } from '../../game/storage';

beforeEach(() => window.localStorage.clear());

it('shows fixed and first-clear rewards then continues to the post-stage story', async () => {
  const user = userEvent.setup();
  const state = {
    ...createInitialState(),
    adultConfirmed: true,
    captainId: 'cap_f',
    screen: 'results',
    currentEncounterId: 'enc_leyline_core',
    selectedStageId: 'land_04_leyline_core',
    lastResult: 'victory',
    firstClears: ['land_01_port_defense', 'land_02_surface_ruins', 'land_03_orbital_outpost', 'land_04_leyline_core'],
    lastStageRewards: {
      stageId: 'land_04_leyline_core',
      clear: { expeditionPoints: 350, surfaceAlloy: 4, ruinChip: 3, leylineCore: 1, fieldRation: 0 },
      firstClear: { expeditionPoints: 700, surfaceAlloy: 0, ruinChip: 0, leylineCore: 2, fieldRation: 2 },
      relationXp: 40,
      refundedAp: 0,
      seaUnlocked: true,
    },
  } satisfies GameState;
  createSaveRepository(window.localStorage).save(state);

  render(<App />);

  expect(screen.getByText('遠征點數 +1050')).toBeVisible();
  expect(screen.getByText('地脈核心 +3')).toBeVisible();
  expect(screen.getByText('新航路開放：潮汐戰線')).toBeVisible();
  await user.click(screen.getByRole('button', { name: '繼續戰後劇情' }));
  expect(await screen.findByRole('heading', { name: '海洋航線' })).toBeVisible();
});

it('continues a victorious chapter battle to the next canonical scene', async () => {
  const user = userEvent.setup();
  const initial = createInitialState();
  createSaveRepository(window.localStorage).save({
    ...initial,
    adultConfirmed: true,
    screen: 'results',
    chapterOne: {
      ...initial.chapterOne,
      currentNode: 'battle-6',
      activeSceneId: 'ch01_scene_13_trapped_in_old_port',
      completedBattles: [
        'ch01_b01_outer_bay_rescue',
        'ch01_b02_first_answering_anchor',
        'ch01_b03_signal_in_the_drain',
        'ch01_b04_forty_seven_breaths',
        'ch01_b05_old_messages_as_evidence',
        'ch01_b06_old_port_ambush',
      ],
      activeEncounterId: 'ch01_b06_old_port_ambush',
      lastResult: 'victory',
    },
  });

  render(<App />);

  expect(screen.getByText('舊港伏擊')).toBeVisible();
  await user.click(screen.getByRole('button', { name: '前往第 14 幕' }));
  expect(await screen.findByRole('heading', { name: '她交還的印' })).toBeVisible();
});
