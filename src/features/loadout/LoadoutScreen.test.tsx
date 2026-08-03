import { render, screen } from '@testing-library/react';
import { App } from '../../app/App';
import { createInitialState } from '../../game/initial-state';

it('renders one main-hand slot and a 3 by 3 sub-weapon matrix', () => {
  const state = {
    ...createInitialState(),
    adultConfirmed: true,
    captainId: 'cap_f' as const,
    roster: ['chr_01', 'chr_02', 'chr_03', 'chr_04'] as const,
    party: ['chr_01', 'chr_02', 'chr_03', 'chr_04'] as const,
    screen: 'loadout' as const,
  };
  window.localStorage.setItem('astra-save-v1', JSON.stringify(state));

  render(<App />);

  expect(screen.getByRole('heading', { name: '艦裝武器盤' })).toBeVisible();
  expect(screen.getByRole('button', { name: /主手武器/ })).toBeVisible();
  expect(screen.getAllByRole('button', { name: /副武器/ })).toHaveLength(9);
});
