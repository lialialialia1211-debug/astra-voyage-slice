import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../../app/App';
import { createInitialState } from '../../game/initial-state';

it('uses the selected captain portrait and can skip an unread scene', async () => {
  const user = userEvent.setup();
  window.localStorage.setItem('astra-save-v1', JSON.stringify({
    ...createInitialState(),
    adultConfirmed: true,
    captainId: 'cap_f',
    screen: 'story',
    activeStoryId: 'story_land_01_pre',
    storyReturnScreen: 'expedition-map',
  }));

  render(<App />);

  await user.click(screen.getByRole('button', { name: '下一句' }));
  await user.click(screen.getByRole('button', { name: '下一句' }));
  expect(screen.getByRole('img', { name: '女性艦長 tense 表情' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: '略過劇情' }));
  expect(screen.getByRole('heading', { name: '地表遠征路線' })).toBeVisible();
});

it('shows a readable dialogue log', async () => {
  const user = userEvent.setup();
  window.localStorage.setItem('astra-save-v1', JSON.stringify({
    ...createInitialState(),
    adultConfirmed: true,
    captainId: 'cap_m',
    screen: 'story',
    activeStoryId: 'story_land_01_post',
    storyReturnScreen: 'expedition-map',
  }));
  render(<App />);

  await user.click(screen.getByRole('button', { name: '對話紀錄' }));
  expect(screen.getByRole('dialog', { name: '對話紀錄' })).toBeVisible();
});
