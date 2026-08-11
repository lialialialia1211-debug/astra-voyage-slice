import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { createInitialState } from '../game/initial-state';
import { App } from './App';

it('enters the canonical story after adult confirmation', async () => {
  const user = userEvent.setup();
  render(<App />);

  expect(screen.getByRole('heading', { name: '成年內容確認' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: '我已年滿 18 歲' }));

  expect(screen.getByTestId('app-shell')).toHaveClass('app-shell--story');
  expect(screen.queryByRole('heading', { name: '選擇遠征艦長' })).not.toBeInTheDocument();
});

it('synchronizes offline AP when the page regains focus', async () => {
  const clock = vi.spyOn(Date, 'now').mockReturnValue(0);
  window.localStorage.setItem('astra-save-v1', JSON.stringify({
    ...createInitialState(0),
    ap: { current: 20, lastRecoveredAt: 0 },
  }));
  render(<App />);

  clock.mockReturnValue(300_000);
  fireEvent.focus(window);

  await waitFor(() => {
    const saved = JSON.parse(window.localStorage.getItem('astra-save-v1') ?? '{}') as { ap?: { current?: number } };
    expect(saved.ap?.current).toBe(21);
  });
  clock.mockRestore();
});
