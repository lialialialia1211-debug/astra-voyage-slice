import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../../app/App';
import { content } from '../../content';
import { createInitialState } from '../../game/initial-state';
import { recommendLoadout } from './calculate-loadout';

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

it('starts the currently selected expedition stage with the saved growth levels', async () => {
  const user = userEvent.setup();
  const state = {
    ...createInitialState(),
    adultConfirmed: true,
    captainId: 'cap_f' as const,
    roster: ['chr_01', 'chr_02', 'chr_03', 'chr_04'] as const,
    party: ['chr_01', 'chr_02', 'chr_03', 'chr_04'] as const,
    weaponGrid: recommendLoadout('fire', content.weapons),
    summonId: 'smn_01_solar_leviathan' as const,
    firstClears: ['land_01_port_defense', 'land_02_surface_ruins'] as const,
    selectedStageId: 'land_03_orbital_outpost' as const,
    screen: 'loadout' as const,
  };
  window.localStorage.setItem('astra-save-v1', JSON.stringify(state));

  render(<App />);
  await user.click(screen.getByRole('button', { name: '進入軌道升降機前哨' }));

  expect(await screen.findByRole('heading', { name: '軌道升降機前哨' })).toBeVisible();
});
