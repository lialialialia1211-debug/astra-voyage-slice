import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../../app/App';
import { createInitialState } from '../../game/initial-state';

it('disables a character upgrade and lists missing materials', () => {
  window.localStorage.setItem('astra-save-v1', JSON.stringify({
    ...createInitialState(),
    adultConfirmed: true,
    captainId: 'cap_f',
    roster: ['chr_01', 'chr_02', 'chr_03', 'chr_04'],
    screen: 'growth',
  }));
  render(<App />);

  expect(screen.getByRole('heading', { name: '遠征養成' })).toBeVisible();
  expect(screen.getByRole('button', { name: '提升焰衛至 Lv.2' })).toBeDisabled();
  expect(screen.getAllByText(/缺少：遠征點數 100/).length).toBeGreaterThan(0);
});

it('switches to weapon growth and upgrades exactly one level', async () => {
  const user = userEvent.setup();
  window.localStorage.setItem('astra-save-v1', JSON.stringify({
    ...createInitialState(),
    adultConfirmed: true,
    captainId: 'cap_f',
    roster: ['chr_01', 'chr_02', 'chr_03', 'chr_04'],
    inventory: {
      expeditionPoints: 1000,
      surfaceAlloy: 20,
      ruinChip: 10,
      leylineCore: 2,
      fieldRation: 1,
    },
    screen: 'growth',
  }));
  render(<App />);

  await user.click(screen.getByRole('tab', { name: '武器強化' }));
  await user.click(screen.getByRole('button', { name: '提升旭日裂潮劍至 Lv.2' }));

  expect(screen.getByText('Lv.2', { selector: '.growth-level' })).toBeVisible();
});
