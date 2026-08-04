# Astra Voyage Slice

原創成人向網頁 RPG 快速切片原型。玩法核心採用回合制隊伍、主手武器與 3×3 武器盤，但世界觀、角色、介面與素材均為原創設定。

## 專案狀態

- 目前為已完成 QA、可遊玩的原型版本，後續仍會持續調整與優化。
- `master` 是整理後的主要開發分支；`codex/web-slice` 保留作為本次原型完成紀錄。
- 固定 QA 網址：<https://lialialialia1211-debug.github.io/astra-voyage-slice/>
- GitHub Actions 會在每次推送後執行單元／整合測試、production build 與 Pages 部署。

## 目前內容

- 18 歲以上確認與本機存檔
- 男女主角選擇、角色招募與四人編隊
- 以人類地表文明為起點的四關遠征路線，通關後解鎖海洋航線
- 每關戰前／戰後劇情、主手武器與 3×3 武器盤、五場可重複挑戰的回合制戰鬥
- AP 30 點制（一般關 5、首領關 10）、每 5 分鐘恢復 1 點、離線恢復與補給劑
- 戰敗完整退還本次 AP；勝利提供固定掉落、首次通關獎勵與全隊關係經驗
- 角色與武器 Lv.1～10 養成，戰鬥等級與私人關係等級互相獨立
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

專案驗收採遠端 QA：推送分支後，由 `.github/workflows/qa-pages.yml` 執行單元／整合測試、production build 與 GitHub Pages 部署。所有人工與自動化瀏覽器 QA 都使用固定 Pages 網址，不以本機伺服器作為驗收結果。

端對端測試涵蓋 1280×720、1440×810、1920×1080 三種桌面尺寸的完整遊戲流程；合併時需記錄成功的 GitHub Actions run、部署 commit SHA 與固定 QA 網址。

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
- 目前存檔結構為 v2；舊版 v1 存檔會自動遷移並保留既有主線與成人收藏進度。
- 進行中的陸地戰鬥會在每個指令後自動保存，重新整理可從最新回合繼續。
- 設定頁可下載或匯入經結構驗證的 JSON 存檔。
- 正式建置輸出在 `dist/`，可直接放到一般靜態網站空間。
- 此切片不含帳號、雲端存檔、付款、後端服務或正式上線設定。

GitHub 儲存庫：<https://github.com/lialialialia1211-debug/astra-voyage-slice>
