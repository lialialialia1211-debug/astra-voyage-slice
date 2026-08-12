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

it('keeps captain selection usable without the retired captain artwork', () => {
  renderAt({ screen: 'captain-select' });

  expect(screen.getByRole('button', { name: '男性艦長' })).toBeVisible();
  expect(screen.getByRole('button', { name: '女性艦長' })).toBeVisible();
  expect(screen.queryByRole('img', { name: /艦長立繪$/ })).not.toBeInTheDocument();
});

it('reveals legacy recruitment rewards without loading retired artwork', async () => {
  const user = userEvent.setup();
  renderAt({ screen: 'recruit', captainId: 'cap_f' });
  await user.click(screen.getByRole('button', { name: '全部揭曉' }));

  expect(screen.getByText('旭日裂潮劍')).toBeVisible();
  expect(screen.getByText('光醫・外星生物研究醫師')).toBeVisible();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
});

it('keeps the legacy formation roster usable without retired character cards', () => {
  renderAt({
    screen: 'formation',
    captainId: 'cap_f',
    roster: [...fullParty],
  });

  expect(screen.getByRole('heading', { name: '四人遠征編隊' })).toBeVisible();
  expect(screen.getByRole('button', { name: /潮工/ })).toBeVisible();
  expect(screen.queryByRole('img', { name: /角色卡$/ })).not.toBeInTheDocument();
});

it('keeps the legacy loadout usable without retired weapon and summon artwork', () => {
  renderAt({
    screen: 'loadout',
    captainId: 'cap_f',
    roster: [...fullParty],
    party: [...fullParty],
    weaponGrid: recommendLoadout('fire', content.weapons),
    summonId: 'smn_01_solar_leviathan',
  });

  expect(screen.getByRole('heading', { name: '艦裝武器盤' })).toBeVisible();
  expect(screen.getByRole('combobox', { name: '召喚核心' })).toHaveValue('smn_01_solar_leviathan');
  expect(screen.queryByRole('img', { name: /武器圖$|召喚圖$/ })).not.toBeInTheDocument();
});

it('uses named fallbacks for legacy battle actors after their artwork retires', () => {
  const battle = createBattle({
    encounterId: 'enc_tutorial',
    partyIds: fullParty,
    loadoutAttack: 8420,
    loadoutHp: 2180,
    summonId: 'smn_01_solar_leviathan',
  });

  render(<BattleStage initialBattle={battle} onComplete={vi.fn()} />);

  const partyArtwork = screen.getAllByRole('img', { name: /戰鬥立繪$/ });
  expect(partyArtwork).toHaveLength(4);
  expect(partyArtwork.every((entry) => entry.classList.contains('asset-fallback'))).toBe(true);
  expect(screen.getByRole('img', { name: '港區襲擊者敵人立繪' })).toHaveClass('asset-fallback');
  expect(screen.getByRole('img', { name: '潮汐無人機敵人立繪' })).toHaveClass('asset-fallback');
});

it('shows a named cabin placeholder after legacy cabin artwork retires', () => {
  renderAt({
    screen: 'cabin',
    captainId: 'cap_f',
    roster: [...fullParty],
    party: [...fullParty],
  });

  expect(screen.getByRole('img', { name: '潮工艙室立繪待匯入' })).toBeVisible();
  expect(screen.queryByRole('img', { name: '潮工艙室立繪' })).not.toBeInTheDocument();
});

it('keeps an unlocked legacy event usable without its retired thumbnail', () => {
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

  expect(screen.getByRole('heading', { name: '深潛後的約定' })).toBeVisible();
  expect(screen.getAllByRole('button', { name: '開啟事件' })).toHaveLength(1);
  expect(screen.queryByRole('img', { name: '深潛後的約定預覽' })).not.toBeInTheDocument();
});

it('unlocks all three legacy events without restoring retired CG previews', async () => {
  const user = userEvent.setup();
  renderAt({ screen: 'gallery', captainId: 'cap_f', roster: [...fullParty] });

  await user.click(screen.getByRole('button', { name: 'QA：解鎖全部 CG' }));

  expect(screen.getByRole('button', { name: 'QA：CG 已全解鎖' })).toBeDisabled();
  expect(screen.getAllByRole('button', { name: '開啟事件' })).toHaveLength(3);
  expect(screen.queryByRole('img', { name: /預覽$/ })).not.toBeInTheDocument();
});
