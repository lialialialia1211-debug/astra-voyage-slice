# Astra Voyage 快速切片交付摘要

## 同步位置

- GitHub：<https://github.com/lialialialia1211-debug/astra-voyage-slice>
- 可執行分支：`codex/web-slice`
- 儲存庫為私人模式。

依需求只使用 GitHub 做原始碼雲端同步，未建立 PR、部署平台、後端、帳號系統或其他外部服務。

## 已完成範圍

- 成人確認、主角選擇、招募、編隊與武器盤
- 兩場完整回合制戰鬥、結果、重試與推進
- 艙室關係養成與成人收藏解鎖
- 成人內容淡出、遮罩、隱藏模式
- 本機自動存檔及 JSON 匯出／匯入
- 原創 UI 背景、框體、徽章與控制元件
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

完整驗證：

```powershell
pnpm test
pnpm exec playwright install chromium
pnpm test:e2e
pnpm build
```

人物／CG 美術交付後：

```powershell
pnpm validate:art -- C:\path\to\art-drop
```

驗證成功的素材會轉入 `public/assets/user/`，遊戲會優先使用使用者素材；尚未交付時則顯示原型替代圖。
