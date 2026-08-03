import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../../app/App';

it('selects the female captain and reaches recruitment', async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole('button', { name: '我已年滿 18 歲' }));
  await user.click(screen.getByRole('button', { name: '女性艦長' }));
  await user.click(screen.getByRole('button', { name: '開始遠征' }));

  expect(screen.getByRole('heading', { name: '遠征招募' })).toBeVisible();
});
