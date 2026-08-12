import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../../app/App';

it('skips the legacy captain choice for the fixed protagonist', async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole('button', { name: '我已年滿 18 歲' }));

  expect(screen.getByTestId('app-shell')).toHaveClass('app-shell--story');
  expect(screen.queryByRole('button', { name: '女性艦長' })).not.toBeInTheDocument();
});
