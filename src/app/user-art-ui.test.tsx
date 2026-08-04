import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import { App } from './App';
import { content } from '../content';
import { BattleStage } from '../features/battle/BattleScreen';
import { createBattle } from '../features/battle/engine';
import { recommendLoadout } from '../features/loadout/calculate-loadout';
import { createInitialState, type GameState } from '../game/initial-state';

const fullParty = ['chr_01', 'chr_02', 'chr_03', 'chr_04'] as const;

function renderAt(overrides: Partial<GameState>) {
  const state = { ...createInitialState(), adultConfirmed: true, ...overrides } as GameState;
  window.localStorage.setItem('astra-save-v1', JSON.stringify(state));
  return render(<App />);
}

beforeEach(() => window.localStorage.clear());

it('shows both completed captain cards on captain selection', () => {
  renderAt({ screen: 'captain-select' });

  expect(screen.getByRole('img', { name: '男性艦長立繪' })).toBeVisible();
  expect(screen.getByRole('img', { name: '女性艦長立繪' })).toBeVisible();
});

it('reveals completed reward artwork in recruitment', async () => {
  const user = userEvent.setup();
  renderAt({ screen: 'recruit', captainId: 'cap_f' });
  await user.click(screen.getByRole('button', { name: '全部揭曉' }));

  expect(screen.getByRole('img', { name: '旭日裂潮劍武器圖' })).toBeVisible();
  expect(screen.getByRole('img', { name: '光醫角色卡' })).toBeVisible();
});

it('shows completed character cards in formation', () => {
  renderAt({
    screen: 'formation',
    captainId: 'cap_f',
    roster: [...fullParty],
  });

  expect(screen.getAllByRole('img', { name: /角色卡$/ })).toHaveLength(4);
});

it('shows ten weapon images and the selected summon in loadout', () => {
  renderAt({
    screen: 'loadout',
    captainId: 'cap_f',
    roster: [...fullParty],
    party: [...fullParty],
    weaponGrid: recommendLoadout('fire', content.weapons),
    summonId: 'smn_01_solar_leviathan',
  });

  expect(screen.getAllByRole('img', { name: /武器圖$/ })).toHaveLength(10);
  expect(screen.getByRole('img', { name: '旭日巨鯨召喚圖' })).toBeVisible();
});

it('shows completed party and enemy art in battle', () => {
  const battle = createBattle({
    encounterId: 'enc_tutorial',
    partyIds: fullParty,
    loadoutAttack: 8420,
    loadoutHp: 2180,
    summonId: 'smn_01_solar_leviathan',
  });

  render(<BattleStage initialBattle={battle} onComplete={vi.fn()} />);

  expect(screen.getAllByRole('img', { name: /戰鬥立繪$/ })).toHaveLength(4);
  expect(screen.getByRole('img', { name: '港區襲擊者敵人立繪' })).toBeVisible();
  expect(screen.getByRole('img', { name: '潮汐無人機敵人立繪' })).toBeVisible();
});

it('shows the selected completed cabin art', () => {
  renderAt({
    screen: 'cabin',
    captainId: 'cap_f',
    roster: [...fullParty],
    party: [...fullParty],
  });

  expect(screen.getByRole('img', { name: '潮工艙室立繪' })).toBeVisible();
});

it('shows an unlocked event thumbnail from the completed collection art', () => {
  renderAt({
    screen: 'gallery',
    captainId: 'cap_f',
    roster: [...fullParty],
    flags: ['flag_tidal_boss_victory'],
    relation: {
      chr_01: { xp: 0, level: 1 },
      chr_02: { xp: 100, level: 3 },
      chr_03: { xp: 0, level: 1 },
      chr_04: { xp: 0, level: 1 },
    },
  });

  expect(screen.getByRole('img', { name: '深潛後的約定預覽' })).toBeVisible();
});

it('unlocks all three adult CG events from the QA control', async () => {
  const user = userEvent.setup();
  renderAt({ screen: 'gallery', captainId: 'cap_f', roster: [...fullParty] });

  await user.click(screen.getByRole('button', { name: 'QA：解鎖全部 CG' }));

  expect(screen.getByRole('button', { name: 'QA：CG 已全解鎖' })).toBeDisabled();
  expect(screen.getAllByRole('button', { name: '開啟事件' })).toHaveLength(3);
  expect(screen.getAllByRole('img', { name: /預覽$/ })).toHaveLength(3);
});
