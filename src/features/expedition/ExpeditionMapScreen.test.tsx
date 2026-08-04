import { render, screen } from '@testing-library/react';
import { App } from '../../app/App';
import { createInitialState } from '../../game/initial-state';

it('shows only the first land node as initially available', () => {
  window.localStorage.setItem('astra-save-v1', JSON.stringify({
    ...createInitialState(),
    adultConfirmed: true,
    captainId: 'cap_f',
    roster: ['chr_01', 'chr_02', 'chr_03', 'chr_04'],
    party: ['chr_01', 'chr_02', 'chr_03', 'chr_04'],
    screen: 'expedition-map',
  }));

  render(<App />);

  expect(screen.getByRole('heading', { name: '地表遠征路線' })).toBeVisible();
  expect(screen.getByRole('button', { name: '港都防衛演習，可挑戰' })).toBeEnabled();
  expect(screen.getByRole('button', { name: '地表遺跡勘查，未解鎖' })).toBeDisabled();
  expect(screen.getByText('AP 30 / 30')).toBeVisible();
});

it('opens an available first stage through its unread pre-story', async () => {
  window.localStorage.setItem('astra-save-v1', JSON.stringify({
    ...createInitialState(),
    adultConfirmed: true,
    captainId: 'cap_f',
    roster: ['chr_01', 'chr_02', 'chr_03', 'chr_04'],
    party: ['chr_01', 'chr_02', 'chr_03', 'chr_04'],
    screen: 'expedition-map',
  }));
  render(<App />);

  screen.getByRole('button', { name: '挑戰港都防衛演習' }).click();

  expect(await screen.findByRole('heading', { name: '遠征前的警報' })).toBeVisible();
});
