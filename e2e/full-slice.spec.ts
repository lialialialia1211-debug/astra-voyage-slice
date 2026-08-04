import { expect, test } from '@playwright/test';
import { winCurrentBattle } from './helpers';

for (const captain of ['男性艦長', '女性艦長']) {
  test(`${captain} completes the full slice`, async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '我已年滿 18 歲' }).click();
    await page.getByRole('button', { name: captain }).click();
    await page.getByRole('button', { name: '開始遠征' }).click();
    await page.getByRole('button', { name: '全部揭曉' }).click();
    await page.getByRole('button', { name: '前往編隊' }).click();
    await page.getByRole('button', { name: '推薦編隊' }).click();
    await page.getByRole('button', { name: '確認編隊' }).click();
    await page.getByRole('button', { name: '推薦編成' }).click();
    await page.getByRole('button', { name: '確認艦裝' }).click();

    await winCurrentBattle(page, 4);
    await page.getByRole('button', { name: '前往潮汐戰線' }).click();
    await page.getByRole('button', { name: '進入潮汐戰線' }).click();
    await winCurrentBattle(page, 12);
    await page.getByRole('button', { name: '返回私人艙室' }).click();

    await expect(page.getByRole('heading', { name: '私人艙室' })).toBeVisible();
    await page.getByRole('button', { name: '贈送遠征紀念品 +20' }).click();
    await expect(page.getByText('下一級：100 / 220 XP')).toBeVisible();
    await page.getByRole('button', { name: '事件收藏' }).click();
    await page.getByRole('button', { name: '開啟事件' }).click();
    const eventDialog = page.getByRole('dialog', { name: '深潛後的約定' });
    await expect(eventDialog.getByRole('heading', { name: '深潛後的約定' })).toBeVisible();
    await expect(eventDialog.getByRole('img', { name: '深潛後的約定 CG' })).toBeVisible();
    await expect(eventDialog.getByText('這段私人紀錄已加入收藏，可隨時從事件收藏再次閱覽。')).toBeVisible();
  });
}
