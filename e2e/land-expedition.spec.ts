import { expect, test, type Page } from '@playwright/test';
import { seedSave, versionTwoState, winCurrentBattle } from './helpers';

const zeroCooldowns = {};

function actor(id: string, element: 'fire' | 'water' | 'wind' | 'earth', hp: number, attack = 1) {
  return { id, element, hp, maxHp: 1000, attack, charge: 0, cooldowns: zeroCooldowns, statuses: [] };
}

function activePortBattle(partyHp: number, turn = 1) {
  return versionTwoState({
    screen: 'battle',
    currentEncounterId: 'enc_tutorial',
    selectedStageId: 'land_01_port_defense',
    activeChallenge: { stageId: 'land_01_port_defense', encounterId: 'enc_tutorial', apCost: 5 },
    ap: { current: 25, lastRecoveredAt: Date.now() },
    battleSnapshot: {
      encounterId: 'enc_tutorial',
      turn,
      phase: 'player-skills',
      party: [
        actor('chr_01', 'fire', partyHp), actor('chr_02', 'water', partyHp),
        actor('chr_03', 'wind', partyHp), actor('chr_04', 'earth', partyHp),
      ],
      enemies: [
        actor('enm_01_port_raider', 'wind', 1800, 180),
        actor('enm_02_tide_drone', 'earth', 2200, 160),
      ],
      bossMode: 'normal',
      modeGauge: 0,
      summonId: 'smn_01_solar_leviathan',
      summonUsed: false,
      telegraph: null,
      result: null,
      flags: [],
    },
  });
}

async function readAp(page: Page) {
  return page.evaluate(() => JSON.parse(window.localStorage.getItem('astra-save-v1') ?? '{}').ap.current as number);
}

test('farms a cleared stage and spends its materials on character growth', async ({ page }) => {
  await seedSave(page, versionTwoState({
    firstClears: ['land_01_port_defense'],
    viewedStories: ['story_land_01_pre', 'story_land_01_post'],
    inventory: { expeditionPoints: 100, surfaceAlloy: 2, ruinChip: 0, leylineCore: 0, fieldRation: 1 },
  }));
  await page.goto('/');
  await page.getByRole('button', { name: '挑戰港都防衛演習' }).click();
  await page.getByRole('button', { name: '進入港都防衛演習' }).click();
  await winCurrentBattle(page);
  await expect(page.getByText('遠征點數 +80')).toBeVisible();
  await page.getByRole('button', { name: '返回地表地圖' }).click();
  await page.getByRole('button', { name: '角色／武器強化' }).click();
  await page.getByRole('button', { name: '提升焰衛至 Lv.2' }).click();
  await expect(page.getByRole('article').filter({ hasText: '焰衛' }).getByText('Lv.2')).toBeVisible();
});

test('refunds AP after defeat and charges it again when retrying', async ({ page }) => {
  await seedSave(page, activePortBattle(1));
  await page.goto('/');
  await page.getByRole('button', { name: '全隊防禦' }).click();

  await expect(page.getByText('已退還 AP 5')).toBeVisible();
  await expect.poll(() => readAp(page)).toBe(30);
  await page.getByRole('button', { name: '調整艦裝後重試' }).click();
  await page.getByRole('button', { name: '進入港都防衛演習' }).click();
  await expect.poll(() => readAp(page)).toBe(25);
});

test('restores an active challenge from its latest turn snapshot', async ({ page }) => {
  await seedSave(page, activePortBattle(1000, 3));
  await page.goto('/');
  await expect(page.getByText('TURN 3 · NORMAL')).toBeVisible();
  await page.getByRole('button', { name: '全隊防禦' }).click();
  await page.reload();
  await expect(page.getByText('TURN 4 · NORMAL')).toBeVisible();
});
