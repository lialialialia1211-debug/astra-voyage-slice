import { render, screen } from '@testing-library/react';
import { App } from '../../app/App';
import { createInitialState } from '../../game/initial-state';
import { createSaveRepository } from '../../game/storage';

it('shows the vertical slice milestone after the first chapter battle', () => {
  const initial = createInitialState(0);
  createSaveRepository(window.localStorage).save({
    ...initial,
    adultConfirmed: true,
    screen: 'chapter-milestone',
    chapterOne: {
      ...initial.chapterOne,
      currentNode: 'milestone-complete',
      completedScenes: ['ch01_scene_01_port_bell', 'ch01_scene_02_black_ship'],
      completedBattles: ['ch01_b01_outer_bay_rescue'],
      lastResult: 'victory',
    },
  });

  render(<App />);

  expect(screen.getByRole('heading', { name: '第 3 幕尚未實裝' })).toBeVisible();
  expect(screen.getByRole('button', { name: '重播戰鬥 1' })).toBeVisible();
});
