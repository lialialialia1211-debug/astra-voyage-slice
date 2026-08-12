import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../../app/App';
import { createInitialState } from '../../game/initial-state';
import { createSaveRepository } from '../../game/storage';

it('offers six starter weapons and enters the first chapter battle', async () => {
  const user = userEvent.setup();
  const initial = createInitialState(0);
  createSaveRepository(window.localStorage).save({
    ...initial,
    adultConfirmed: true,
    screen: 'chapter-prep',
    chapterOne: {
      ...initial.chapterOne,
      currentNode: 'battle-1-prep',
      completedScenes: ['ch01_scene_01_port_bell', 'ch01_scene_02_black_ship'],
    },
  });

  render(<App />);

  expect(screen.getByRole('heading', { name: '外灣救難線' })).toBeVisible();
  expect(screen.getAllByRole('button', { name: /^選擇/ })).toHaveLength(6);
  expect(screen.getByText('首通 0 AP')).toBeVisible();
  await user.click(screen.getByRole('button', { name: '選擇赤燼長刃' }));
  await user.click(screen.getByRole('button', { name: '開始救援' }));
  expect(screen.getByRole('heading', { name: '外灣救援' })).toBeVisible();
  expect(screen.getByText('昭黎')).toBeVisible();
});

it('offers the unlocked four-person roster from battle three onward', () => {
  const initial = createInitialState(0);
  createSaveRepository(window.localStorage).save({
    ...initial,
    adultConfirmed: true,
    screen: 'chapter-prep',
    chapterOne: {
      ...initial.chapterOne,
      currentNode: 'battle-3-prep',
      activeSceneId: 'ch01_scene_08_signal_in_the_drain',
      completedScenes: [
        'ch01_scene_01_port_bell',
        'ch01_scene_02_black_ship',
        'ch01_scene_03_hand_that_would_not_let_go',
        'ch01_scene_04_quarantine_line',
        'ch01_scene_05_first_answering_anchor',
        'ch01_scene_06_right_to_stay_silent',
        'ch01_scene_07_second_heart',
        'ch01_scene_08_signal_in_the_drain',
      ],
      completedBattles: ['ch01_b01_outer_bay_rescue', 'ch01_b02_first_answering_anchor'],
      selectedPartyIds: ['zhaoli', 'yanling', 'mila', 'yilan'],
      unlockedActorIds: ['zhaoli', 'mila', 'yanling', 'yilan'],
    },
  });

  render(<App />);

  expect(screen.getByRole('heading', { name: '排水渠訊號攔截' })).toBeVisible();
  expect(screen.getByRole('button', { name: '選擇昭黎' })).toBeDisabled();
  expect(screen.getByRole('button', { name: '選擇晏泠' })).toBeEnabled();
  expect(screen.getByRole('button', { name: '選擇彌菈' })).toBeEnabled();
  expect(screen.getByRole('button', { name: '選擇伊蘭' })).toBeEnabled();
});
