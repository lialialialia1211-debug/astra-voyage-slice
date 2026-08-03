import { expect, type Page } from '@playwright/test';

export function savedState(overrides: Record<string, unknown> = {}) {
  return {
    version: 1,
    screen: 'adult-gate',
    adultConfirmed: false,
    adultMode: 'full',
    captainId: null,
    roster: ['chr_01', 'chr_02', 'chr_03'],
    party: [null, null, null, null],
    weaponGrid: { main: null, sub: [null, null, null, null, null, null, null, null, null] },
    summonId: null,
    relation: {
      chr_01: { xp: 0, level: 1 },
      chr_02: { xp: 0, level: 1 },
      chr_03: { xp: 0, level: 1 },
      chr_04: { xp: 0, level: 1 },
    },
    flags: [],
    viewedEvents: [],
    currentEncounterId: null,
    lastResult: null,
    lastEnemyHp: null,
    ...overrides,
  };
}

export async function seedSave(page: Page, state: ReturnType<typeof savedState>) {
  await page.addInitScript((save) => {
    if (window.localStorage.getItem('astra-save-v1') === null) {
      window.localStorage.setItem('astra-save-v1', JSON.stringify(save));
    }
  }, state);
}

export async function winCurrentBattle(page: Page, maximumTurns = 12) {
  for (let turn = 0; turn < maximumTurns; turn += 1) {
    if (await page.getByRole('heading', { name: '任務完成' }).isVisible().catch(() => false)) return;
    await expect(page.getByRole('button', { name: '全隊防禦' })).toBeVisible();
    await page.getByRole('button', { name: '全隊防禦' }).click();
  }
  await expect(page.getByRole('heading', { name: '任務完成' })).toBeVisible();
}
