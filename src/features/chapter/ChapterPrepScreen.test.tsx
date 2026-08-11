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
  await user.click(screen.getByRole('button', { name: '選擇逆焰舵刃' }));
  await user.click(screen.getByRole('button', { name: '開始救援' }));
  expect(screen.getByRole('heading', { name: '外灣救難線' })).toBeVisible();
  expect(screen.getByText('昭黎')).toBeVisible();
});
