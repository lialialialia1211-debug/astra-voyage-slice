import { expect, test } from '@playwright/test';
import { savedState, seedSave } from './helpers';

function unlockedGallery(mode: 'full' | 'fade' | 'hidden-thumbnails') {
  return savedState({
    screen: 'gallery',
    adultConfirmed: true,
    adultMode: mode,
    captainId: 'cap_f',
    roster: ['chr_01', 'chr_02', 'chr_03', 'chr_04'],
    relation: {
      chr_01: { xp: 0, level: 1 },
      chr_02: { xp: 100, level: 3 },
      chr_03: { xp: 0, level: 1 },
      chr_04: { xp: 0, level: 1 },
    },
    flags: ['flag_tidal_boss_victory'],
  });
}

test('fade mode completes the event without rendering CG art', async ({ page }) => {
  await seedSave(page, unlockedGallery('fade'));
  await page.goto('/');
  await page.getByRole('button', { name: '開啟事件' }).click();
  await expect(page.getByText('畫面淡出，事件已完成。')).toBeVisible();
  await expect(page.getByRole('img')).toHaveCount(0);
});

test('hidden-thumbnail mode keeps the gallery cover neutral', async ({ page }) => {
  await seedSave(page, unlockedGallery('hidden-thumbnails'));
  await page.goto('/');
  await expect(page.locator('.event-thumbnail').filter({ hasText: 'PRIVATE' })).toHaveCount(3);
  await page.getByRole('button', { name: '開啟事件' }).click();
  await expect(page.getByRole('img', { name: '深潛後的約定 CG' })).toBeVisible();
});
