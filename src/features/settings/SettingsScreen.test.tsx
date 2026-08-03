import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it } from 'vitest';
import { App } from '../../app/App';
import { createInitialState, type GameState } from '../../game/initial-state';

beforeEach(() => window.localStorage.clear());

it('imports a validated JSON save and opens its saved screen', async () => {
  const user = userEvent.setup();
  const settingsState = {
    ...createInitialState(),
    screen: 'settings' as const,
    adultConfirmed: true,
  };
  window.localStorage.setItem('astra-save-v1', JSON.stringify(settingsState));
  render(<App />);

  const imported = { ...settingsState, screen: 'cabin' as const } satisfies GameState;
  const file = new File([JSON.stringify(imported)], 'astra-save.json', { type: 'application/json' });
  await user.upload(screen.getByLabelText('匯入存檔'), file);

  expect(await screen.findByRole('heading', { name: '私人艙室' })).toBeVisible();
});
