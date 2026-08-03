import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';

it('requires adult confirmation before entering the slice', async () => {
  const user = userEvent.setup();
  render(<App />);

  expect(screen.getByRole('heading', { name: '成年內容確認' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: '我已年滿 18 歲' }));

  expect(screen.getByRole('heading', { name: '選擇遠征艦長' })).toBeVisible();
});
