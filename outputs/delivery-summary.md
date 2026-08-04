# Astra Voyage 快速切片交付摘要

## 同步位置

- GitHub：<https://github.com/lialialialia1211-debug/astra-voyage-slice>
- 主要分支：`master`
- 原型完成紀錄分支：`codex/web-slice`
- 固定 QA 網址：<https://lialialialia1211-debug.github.io/astra-voyage-slice/>

目前為已完成 QA、可遊玩的原型版本。GitHub Pages 僅作為固定遠端 QA 環境；專案仍不含正式發行部署、後端、帳號、付款或雲端存檔服務。

原始實作計畫已全部落地，之後的調整與優化會依新需求另外追蹤；`outputs/web-slice-implementation-plan.md` 保留為歷史規格，不再作為未完成工作清單。

## 已完成範圍

- 成人確認、主角選擇、招募、編隊與 GBF 式主手＋3×3 武器盤
- 地表中央路線地圖、四個陸地關卡、八段戰前／戰後劇情與海洋航線解鎖
- 五場完整回合制戰鬥、每回合自動存檔、結果、重試與推進
- AP 30 點制、每 5 分鐘恢復 1 點、離線恢復、補給劑，以及戰敗完整退還 AP
- 固定關卡掉落、首次通關獎勵、遠征素材與角色／武器 Lv.1～10 養成
- 艙室關係養成與成人收藏解鎖
- 成人內容淡出、遮罩、隱藏模式
- 本機自動存檔及 JSON 匯出／匯入
- v2 存檔結構與舊版 v1 自動遷移，保留既有主線及成人收藏進度
- 原創 UI 背景、框體、徽章與控制元件
- 63／63 項使用者美術已完成驗收、WebP 轉檔並整合至所有對應畫面
- 使用者人物、立繪與 CG 美術的獨立交件規格及自動驗收轉檔流程

## 你的美術工作檔

- `user-art-work-order.md`：只包含你需要製作的人物、立繪與 CG 規格。
- `user-art-checklist.csv`：檔名、尺寸、透明度與狀態清單；完成項目改成 `ready`。
- `generated-ui-prompt-set.md`：本次 UI 背景生成提示詞紀錄。

## 本機操作

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

合併驗收不使用本機測試結果；推送分支後，由 `Remote QA - GitHub Pages` workflow 執行測試、production build 與部署，並在固定 Pages 網址進行瀏覽器 QA。

重新驗收或替換人物／CG 美術：

```powershell
pnpm validate:art -- C:\path\to\art-drop
```

本次 63 張來源 PNG 已位於 `art-drop/`。驗證成功的素材會轉入 `public/assets/user/`，並同步更新公開與執行期 manifest；遊戲目前已全面使用這批正式美術。

本階段亦已在 1280×720、1440×810、1920×1080 三種桌面解析度執行完整流程測試；另以瀏覽器人工檢查地圖、劇情、武器盤、戰鬥與養成畫面，確認無水平溢出、主要操作未被裁切，且圖片載入與瀏覽器主控台均正常。

遠端 QA 由 `.github/workflows/qa-pages.yml` 執行，正式合併以最新成功的 GitHub Actions run、部署 commit SHA 與固定 Pages 網址為準。
