# Astra Voyage Slice

原創成人向網頁 RPG 快速切片原型。玩法核心採用回合制隊伍、主手武器與 3×3 武器盤，但世界觀、角色、介面與素材均為原創設定。

## 專案狀態

- 第一章唯一正史 30 幕與 15 場主線戰鬥已完整介入；既有 RPG 系統與舊遠征內容保留共存。
- `master` 是整理後的主要開發分支；`codex/web-slice` 保留作為本次原型完成紀錄。
- 固定 QA 網址：<https://lialialialia1211-debug.github.io/astra-voyage-slice/>
- GitHub Actions 會在每次推送後執行單元／整合測試、production build 與 Pages 部署。

## 目前內容

- 18 歲以上確認與 v4 本機存檔；v3 切片完成檔會接續到第 3 幕
- 固定主角昭黎，不再顯示男女艦長選擇
- 唯一正史 30 幕完整 AVG，共 351 個閱讀節點；原文由 `scripts/build-chapter-one-story.mjs` 從 30 份章節小說產生，無摘要或刪文
- 15 場主線戰鬥安排在第 2、5、8、10、12、13、16、17、19、23、24、26、27、28、29 幕後
- B1～B6 依序介入普攻、屬性、技能、冷卻、奧義與防禦教學；B7～B15 使用完整 RPG 指令
- 六屬性入門主手可隨戰切換昭黎屬性；第 3 戰起可從已解鎖正式成員中編成四人隊
- B1 首通 0 AP、重播 5 AP、戰敗全額退還
- 第 15、20、25 幕為固定正史福利劇情，不設好感門檻，每幕各使用 3 張 R18 CG
- 美術與音訊缺少時使用可讀 fallback，不中斷流程
- 既有角色招募、四人編隊、武器盤與五場回合制戰鬥暫留供 RPG 系統共存
- 以人類地表文明為起點的四關遠征路線，通關後解鎖海洋航線
- 每關戰前／戰後劇情、主手武器與 3×3 武器盤、五場可重複挑戰的回合制戰鬥
- AP 30 點制（一般關 5、首領關 10）、每 5 分鐘恢復 1 點、離線恢復與補給劑
- 戰敗完整退還本次 AP；勝利提供固定掉落、首次通關獎勵與全隊關係經驗
- 角色與武器 Lv.1～10 養成，戰鬥等級與私人關係等級互相獨立
- 艙室互動、關係等級與成人收藏獎勵解鎖
- 淡出、遮罩與隱藏三種成人內容顯示模式
- 存檔 JSON 匯出／匯入
- 使用者美術檢查與 WebP 轉換流程
- 第一章 140／140 項背景、人物、CG、敵人、首領、武器與支援物件已完成匯入；舊「陸海空艦長」原型的 63 項內容美術已退役，系統 UI 美術仍保留

## 開始使用

需要 Node.js、pnpm 與 Chromium。所有版本已鎖定在 `pnpm-lock.yaml`。

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

Vite 會顯示本機網址。首次進入時需通過 18 歲以上確認。

## 驗證

專案驗收採遠端 QA：推送分支後，由 `.github/workflows/qa-pages.yml` 執行單元／整合測試、production build 與 GitHub Pages 部署。所有人工與自動化瀏覽器 QA 都使用固定 Pages 網址，不以本機伺服器作為驗收結果。

合併時需記錄成功的 GitHub Actions run、部署 commit SHA 與固定 QA 網址；人工瀏覽器 QA 僅在部署後的 Pages 網址進行。

## UI 素材

重新產生程式化 UI 控件、徽章與框體：

```powershell
pnpm build:ui-art
```

已生成素材位於 `public/assets/generated-ui/`。背景圖已納入版本控制，不需額外呼叫圖像服務。

## 人物與 CG 美術

第一章的 140 張 PNG 已驗收並轉為 `public/assets/user/` 內的 WebP。第一章素材規格位於 `outputs/chapter-01-art-production-spec-v2.md`，完整目錄、尺寸、透明通道與 WebP 品質由 `scripts/import-chapter-one-art.mjs` 鎖定。舊「陸海空艦長」原型的 63 張內容美術已從目前版本退役；`public/assets/generated-ui/` 的系統 UI 素材不在刪除範圍內。

如需重新匯入第一章素材：

```powershell
pnpm import:chapter-one-art -- C:\path\to\chapter01
```

匯入器會先完整驗證 140 張 PNG，再同步兩份 manifest；任一素材缺少、尺寸或透明通道不符、或目錄出現未登記 PNG 時都不會更新輸出。

舊原型的 `outputs/user-art-work-order.md` 與 `outputs/user-art-checklist.csv` 僅保留作歷史規格參考。若日後需要刻意復原或重製該批舊素材，才使用以下舊流程：

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
- 目前存檔結構為 v4；舊版 v1／v2 會保留成年顯示模式、AP 與安全資源，v3 已完成切片會遷移到第 3 幕。
- 進行中的舊陸地戰鬥與第一章 15 場戰鬥都會保存戰鬥快照，重新整理可從最新回合繼續。
- 設定頁可下載或匯入經結構驗證的 JSON 存檔。
- 正式建置輸出在 `dist/`，可直接放到一般靜態網站空間。
- 此切片不含帳號、雲端存檔、付款、後端服務或正式上線設定。

GitHub 儲存庫：<https://github.com/lialialialia1211-debug/astra-voyage-slice>
