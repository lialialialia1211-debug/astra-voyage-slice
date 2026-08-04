import { expect, test } from '@playwright/test';
import { savedState, seedSave } from './helpers';

test('recovers from corrupt local storage', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem('astra-save-v1', '{broken'));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '成年內容確認' })).toBeVisible();
});

test('persists relation progress across reload', async ({ page }) => {
  await seedSave(page, savedState({
    screen: 'cabin',
    adultConfirmed: true,
    captainId: 'cap_f',
    roster: ['chr_01', 'chr_02', 'chr_03', 'chr_04'],
  }));
  await page.goto('/');
  await page.getByRole('button', { name: '贈送遠征紀念品 +20' }).click();
  await page.reload();
  await expect(page.getByText('下一級：20 / 40 XP')).toBeVisible();
});

test('migrates a version-one victory into the land route', async ({ page }) => {
  await seedSave(page, savedState({
    screen: 'loadout',
    adultConfirmed: true,
    captainId: 'cap_f',
    roster: ['chr_01', 'chr_02', 'chr_03', 'chr_04'],
    party: ['chr_01', 'chr_02', 'chr_03', 'chr_04'],
    flags: ['flag_tutorial_victory'],
  }));
  await page.goto('/');

  await expect(page.getByRole('heading', { name: '地表遠征路線' })).toBeVisible();
  await expect(page.getByRole('button', { name: '港都防衛演習，已首通' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '地表遺跡勘查' })).toBeVisible();
});
