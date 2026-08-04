# Astra Voyage Slice

原創成人向網頁 RPG 快速切片原型。玩法核心採用回合制隊伍、主手武器與 3×3 武器盤，但世界觀、角色、介面與素材均為原創設定。

## 目前內容

- 18 歲以上確認與本機存檔
- 男女主角選擇、角色招募與四人編隊
- 主手武器與 3×3 武器盤
- 兩場可重複挑戰的回合制戰鬥
- 艙室互動、關係等級與成人收藏獎勵解鎖
- 淡出、遮罩與隱藏三種成人內容顯示模式
- 存檔 JSON 匯出／匯入
- 使用者美術檢查與 WebP 轉換流程
- 63／63 項人物、武器、召喚、敵人、首領與事件 CG 美術已整合

## 開始使用

需要 Node.js、pnpm 與 Chromium。所有版本已鎖定在 `pnpm-lock.yaml`。

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

Vite 會顯示本機網址。首次進入時需通過 18 歲以上確認。

## 驗證

```powershell
pnpm test
pnpm exec playwright install chromium
pnpm test:e2e
pnpm build
```

端對端測試會以 1280×720、1440×810、1920×1080 三種桌面尺寸驗證完整遊戲流程。

## UI 素材

重新產生程式化 UI 控件、徽章與框體：

```powershell
pnpm build:ui-art
```

已生成素材位於 `public/assets/generated-ui/`。背景圖已納入版本控制，不需額外呼叫圖像服務。

## 人物與 CG 美術

本次交付的 63 張 PNG 位於 `art-drop/`，已全部驗收並轉為 `public/assets/user/` 內的 WebP。遊戲畫面透過產生後的 manifest 取用素材。

如需重新驗收或替換美術：

1. 依 `outputs/user-art-work-order.md` 與 `outputs/user-art-checklist.csv` 製作 PNG。
2. 將完成檔放在任意獨立資料夾。
3. 把 CSV 對應列的 `status` 從 `needed` 改為 `ready`。
4. 執行：

```powershell
pnpm validate:art -- C:\path\to\art-drop
```

驗證器會檢查檔名、尺寸與透明度，全部通過後才一次轉成 WebP，並同步寫入 `public/assets/user/manifest.json` 與 `src/generated/user-art-manifest.json`；任一素材錯誤時不會留下半套輸出。

## 存檔與發佈

- 瀏覽器存檔鍵：`astra-save-v1`
- 設定頁可下載或匯入經結構驗證的 JSON 存檔。
- 正式建置輸出在 `dist/`，可直接放到一般靜態網站空間。
- 此切片不含帳號、雲端存檔、付款、後端服務或正式上線設定。

私人同步儲存庫：<https://github.com/lialialialia1211-debug/astra-voyage-slice>
