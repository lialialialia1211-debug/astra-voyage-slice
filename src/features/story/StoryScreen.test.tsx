import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../../app/App';
import { createInitialState } from '../../game/initial-state';

function chapterSceneState(activeLineIndex = 0) {
  const initial = createInitialState(0);
  return {
    ...initial,
    adultConfirmed: true,
    screen: 'story' as const,
    chapterOne: {
      ...initial.chapterOne,
      activeLineIndex,
    },
  };
}

it('shows the fixed protagonist in the first canonical scene', () => {
  window.localStorage.setItem('astra-save-v1', JSON.stringify(chapterSceneState()));

  render(<App />);

  expect(screen.getByRole('heading', { name: '港鐘與舊情' })).toBeVisible();
  expect(screen.getAllByText('昭黎')).not.toHaveLength(0);
  expect(screen.queryByText('選擇遠征艦長')).not.toBeInTheDocument();
});

it('renders three actor slots for the current canonical prose block', () => {
  window.localStorage.setItem('astra-save-v1', JSON.stringify(chapterSceneState(0)));

  render(<App />);

  expect(screen.getAllByTestId('story-actor')).toHaveLength(3);
  expect(screen.getByText('旁白')).toBeVisible();
});

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
