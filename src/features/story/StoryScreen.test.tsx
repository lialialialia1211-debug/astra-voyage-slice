import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../../app/App';
import { chapterOneContent } from '../../chapter-one/content';
import { createInitialState } from '../../game/initial-state';
import { createSaveRepository } from '../../game/storage';

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

it('opens scene one on character dialogue without parking Yanling on stage', () => {
  window.localStorage.setItem('astra-save-v1', JSON.stringify(chapterSceneState(0)));

  render(<App />);

  expect(screen.getAllByTestId('story-actor')).toHaveLength(2);
  expect(screen.getAllByText('昭黎')).not.toHaveLength(0);
  expect(screen.getAllByText('洛恩')).not.toHaveLength(0);
  expect(screen.getByTestId('story-actor-action')).toHaveTextContent('指腹停在磨平的繩眼。');
  expect(screen.queryByText('晏泠')).not.toBeInTheDocument();
  expect(screen.queryByText('旁白')).not.toBeInTheDocument();
});

it('keeps AVG prose and navigation in separate layout regions', () => {
  window.localStorage.setItem('astra-save-v1', JSON.stringify(chapterSceneState(0)));

  render(<App />);

  expect(screen.getByTestId('story-dialogue-text')).toBeVisible();
  expect(screen.getByTestId('story-controls')).toBeVisible();
});

it('renders any generated scene with chapter and line progress', () => {
  const initial = createInitialState(0);
  const scene = chapterOneContent.scenes[27]!;
  createSaveRepository(window.localStorage).save({
    ...initial,
    adultConfirmed: true,
    screen: 'story',
    chapterOne: {
      ...initial.chapterOne,
      currentNode: 'scene-28',
      activeSceneId: scene.id,
      activeLineIndex: 0,
    },
  });

  render(<App />);

  expect(screen.getByText('第 28 幕 / 30')).toBeVisible();
  expect(screen.getByText(`1 / ${scene.lines.length} 節`)).toBeVisible();
  expect(screen.getByRole('img', { name: '最後一盞燈之外 背景' })).toBeVisible();
  expect(screen.getByText('正史來源：完整章節小說 v0.2')).toBeVisible();
});

it('hides adult CG thumbnails without gating canonical prose', () => {
  const initial = createInitialState(0);
  const scene = chapterOneContent.scenes[19]!;
  const lineIndex = scene.lines.findIndex((line) => line.cgAssetId);
  createSaveRepository(window.localStorage).save({
    ...initial,
    adultConfirmed: true,
    adultMode: 'hidden-thumbnails',
    screen: 'story',
    chapterOne: {
      ...initial.chapterOne,
      currentNode: 'scene-20',
      activeSceneId: scene.id,
      activeLineIndex: lineIndex,
    },
  });

  render(<App />);

  expect(screen.getByRole('img', { name: '成人 CG 已依設定隱藏' })).toBeVisible();
  expect(screen.queryByRole('img', { name: '在她可以離開時 劇情 CG' })).not.toBeInTheDocument();
  expect(screen.getByText(/賽芙拉交出完整訊號的那天/)).toBeVisible();
});

it('can skip an unread legacy scene without restoring retired captain portraits', async () => {
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
  expect(screen.queryByRole('img', { name: '女性艦長 tense 表情' })).not.toBeInTheDocument();
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
