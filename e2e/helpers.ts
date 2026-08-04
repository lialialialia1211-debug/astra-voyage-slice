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

export function versionTwoState(overrides: Record<string, unknown> = {}) {
  return {
    version: 2,
    screen: 'expedition-map',
    adultConfirmed: true,
    adultMode: 'full',
    captainId: 'cap_f',
    roster: ['chr_01', 'chr_02', 'chr_03', 'chr_04'],
    party: ['chr_01', 'chr_02', 'chr_03', 'chr_04'],
    weaponGrid: {
      main: 'wpn_01_sunblade',
      sub: [
        'wpn_07_expedition_rifle', 'wpn_05_fireline_dagger', 'wpn_02_molten_lance',
        'wpn_10_dawn_greatblade', 'wpn_12_void_prism', 'wpn_06_route_bow',
        'wpn_03_tidemark_axe', 'wpn_11_depth_anchor', 'wpn_04_resonance_staff',
      ],
    },
    summonId: 'smn_01_solar_leviathan',
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
    ap: { current: 30, lastRecoveredAt: Date.now() },
    inventory: { expeditionPoints: 0, surfaceAlloy: 0, ruinChip: 0, leylineCore: 0, fieldRation: 1 },
    characterLevels: { chr_01: 1, chr_02: 1, chr_03: 1, chr_04: 1 },
    weaponLevels: {
      wpn_01_sunblade: 1,
      wpn_02_molten_lance: 1,
      wpn_03_tidemark_axe: 1,
      wpn_04_resonance_staff: 1,
      wpn_05_fireline_dagger: 1,
      wpn_06_route_bow: 1,
      wpn_07_expedition_rifle: 1,
      wpn_08_shoreguard_shield: 1,
      wpn_09_astrolabe: 1,
      wpn_10_dawn_greatblade: 1,
      wpn_11_depth_anchor: 1,
      wpn_12_void_prism: 1,
    },
    firstClears: [],
    viewedStories: [],
    activeStoryId: null,
    storyReturnScreen: null,
    selectedStageId: 'land_01_port_defense',
    activeChallenge: null,
    battleSnapshot: null,
    lastStageRewards: null,
    ...overrides,
  };
}

export async function completeOnboarding(page: Page, captain = '女性艦長') {
  await page.goto('/');
  await page.getByRole('button', { name: '我已年滿 18 歲' }).click();
  await page.getByRole('button', { name: captain }).click();
  await page.getByRole('button', { name: '開始遠征' }).click();
  await page.getByRole('button', { name: '全部揭曉' }).click();
  await page.getByRole('button', { name: '前往編隊' }).click();
  await page.getByRole('button', { name: '推薦編隊' }).click();
  await page.getByRole('button', { name: '確認編隊' }).click();
  await expect(page.getByRole('heading', { name: '地表遠征路線' })).toBeVisible();
}

export async function clearLandStage(page: Page, stageName: string, maximumTurns = 20) {
  await page.getByRole('button', { name: new RegExp(`^${stageName}，`) }).click();
  await page.getByRole('button', { name: `挑戰${stageName}` }).click();
  if (await page.getByRole('button', { name: '略過劇情' }).isVisible().catch(() => false)) {
    await page.getByRole('button', { name: '略過劇情' }).click();
  }
  await expect(page.getByRole('heading', { name: '艦裝武器盤' })).toBeVisible();
  await page.getByRole('button', { name: '推薦編成' }).click();
  await page.getByRole('button', { name: `進入${stageName}` }).click();
  await winCurrentBattle(page, maximumTurns);
  const storyButton = page.getByRole('button', { name: '繼續戰後劇情' });
  if (await storyButton.isVisible().catch(() => false)) {
    await storyButton.click();
    await page.getByRole('button', { name: '略過劇情' }).click();
  } else {
    await page.getByRole('button', { name: '返回地表地圖' }).click();
  }
  await expect(page.getByRole('heading', { name: '地表遠征路線' })).toBeVisible();
}

export async function winCurrentBattle(page: Page, maximumTurns = 12) {
  for (let turn = 0; turn < maximumTurns; turn += 1) {
    if (await page.getByRole('heading', { name: '任務完成' }).isVisible().catch(() => false)) return;
    await expect(page.getByRole('button', { name: '全隊防禦' })).toBeVisible();
    await page.getByRole('button', { name: '全隊防禦' }).click();
  }
  await expect(page.getByRole('heading', { name: '任務完成' })).toBeVisible();
}
