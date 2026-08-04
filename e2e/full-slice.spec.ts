import { expect, test } from '@playwright/test';
import { clearLandStage, completeOnboarding, winCurrentBattle } from './helpers';

const landStages = ['港都防衛演習', '地表遺跡勘查', '軌道升降機前哨', '沉睡地脈核心'];

for (const captain of ['男性艦長', '女性艦長']) {
  test(`${captain} completes the full slice`, async ({ page }, testInfo) => {
    testInfo.setTimeout(120_000);
    await completeOnboarding(page, captain);
    for (const stage of landStages) await clearLandStage(page, stage);

    await expect(page.getByRole('button', { name: '進入海洋航線' })).toBeEnabled();
    await page.getByRole('button', { name: '進入海洋航線' }).click();
    await winCurrentBattle(page, 20);
    await page.getByRole('button', { name: '返回私人艙室' }).click();

    await expect(page.getByRole('heading', { name: '私人艙室' })).toBeVisible();
    await page.getByRole('button', { name: '贈送遠征紀念品 +20' }).click();
    await expect(page.getByText('最高等級 · 220 XP')).toBeVisible();
    await page.getByRole('button', { name: '事件收藏' }).click();
    await page.getByRole('article').filter({ hasText: '深潛後的約定' }).getByRole('button', { name: '開啟事件' }).click();
    const eventDialog = page.getByRole('dialog', { name: '深潛後的約定' });
    await expect(eventDialog.getByRole('heading', { name: '深潛後的約定' })).toBeVisible();
    await expect(eventDialog.getByRole('img', { name: '深潛後的約定 CG' })).toBeVisible();
    await expect(eventDialog.getByText('這段私人紀錄已加入收藏，可隨時從事件收藏再次閱覽。')).toBeVisible();
  });
}
