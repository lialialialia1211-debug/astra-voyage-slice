# GitHub 遠端臨時 QA 設計規格

日期：2026-08-04  
狀態：已核准，待實作計畫  
儲存庫：`lialialialia1211-debug/astra-voyage-slice`

## 目標

專案的所有品質驗證都改由 GitHub 遠端資源執行，不再使用開發者電腦進行本機 QA。每次任何分支推送後，GitHub Actions 會完成測試、建置、部署與線上 E2E，並覆蓋同一個公開 QA 網址。

固定 QA 網址預期為：

`https://lialialialia1211-debug.github.io/astra-voyage-slice/`

此網址是可隨時覆蓋的臨時 QA 環境，不是正式產品環境。

## 專案底層規則

根目錄建立 `AGENTS.md`，對所有後續代理與開發工作套用以下強制規則：

1. 不得啟動本機 Vite、靜態伺服器或其他 localhost QA 服務。
2. 不得以 `localhost`、`127.0.0.1`、本機檔案路徑或本機瀏覽器進行人工、視覺或功能 QA。
3. 不得在本機執行單元測試、整合測試、Playwright E2E 或以正式建置作為驗收依據。
4. 本機只用於讀取、編輯、版本控制與不構成 QA 的靜態檢查；實際品質判定必須來自 GitHub Actions。
5. 修改完成後必須推送至 GitHub，等待遠端 QA 工作流完成。
6. 人工與瀏覽器驗收只能使用固定 GitHub Pages QA 網址。
7. 遠端 QA 失敗時，只能讀取 GitHub Actions 紀錄、修改後重新推送；不得改用本機 QA 規避失敗。
8. 回報完成時必須提供 QA 網址、GitHub Actions 執行網址、被驗證的提交 SHA 與遠端結果。

## GitHub Actions 架構

新增單一 QA 工作流，觸發條件如下：

- 所有分支的 `push`。
- `workflow_dispatch`，供必要時手動重新部署同一提交。
- 不使用 pull request 作為必要入口。

工作流採固定 concurrency group，並設定 `cancel-in-progress: true`。新的分支推送會取消尚未完成的舊 QA，確保同一個公開網址以最後一次推送為準。

工作流分為三個階段：

### 1. 遠端驗證與建置

GitHub runner 執行：

- 依 lockfile 安裝相依套件。
- Vitest 單元與整合測試。
- TypeScript 檢查與 Vite 正式建置。
- 使用 GitHub Pages 專案子路徑產生靜態檔案。
- 上傳 Pages artifact。

任何步驟失敗都會阻止部署。

### 2. 固定網址部署

以 GitHub 官方 `configure-pages`、`upload-pages-artifact` 與 `deploy-pages` Actions 部署 `dist/`。

部署使用 `github-pages` environment，並取得實際 `page_url` 作為下一階段輸入。儲存庫需先把 Pages source 設為 GitHub Actions。

### 3. 線上 E2E QA

部署成功後才安裝 Playwright Chromium，並把 `page_url` 傳入 Playwright 作為唯一 `baseURL`。

Playwright 設定不得自行啟動 `webServer`，也不得回退到 localhost。缺少遠端 QA 網址時應立即失敗，以避免意外使用本機資源。

三種桌面解析度維持：

- 1280×720
- 1440×810
- 1920×1080

GitHub Actions summary 需顯示 QA 網址、提交 SHA、來源分支、部署結果與 E2E 結果。

## GitHub Pages 子路徑支援

此專案是 repository Pages，不是使用者根網域，因此前端必須支援 `/astra-voyage-slice/` base path。

實作時需確認：

- Vite 建置 base 設為 `/astra-voyage-slice/`。
- JavaScript 產生的素材 URL 使用 `import.meta.env.BASE_URL`。
- CSS、manifest、背景、人物、武器、召喚與 CG 素材在 Pages 子路徑下皆可讀取。
- 頁面重新整理後仍能載入單頁應用。

## 固定網址與分支競爭規則

所有分支共用一個 QA 環境，不保留每個分支的獨立預覽。

- 最後一次開始的推送優先。
- 舊工作流由 concurrency 自動取消。
- QA 網址內容可能被其他分支隨時覆蓋。
- 驗收時必須比對 Actions summary 中的提交 SHA，不可只看網址內容就假設版本正確。

## R18 內容決策

QA 網址會包含完整 R18 素材，不建立安全版或遮蔽版部署。

使用者已明確接受 GitHub Pages 對 sexually obscene content 的政策風險，以及網站可能被限制、停用或移除的後果。此決策只代表接受風險，不改變 GitHub 的服務條款，也不保證 Pages 會持續提供服務。

## 權限與失敗處理

GitHub Pages 對私人儲存庫的可用性取決於帳號方案。實作時先嘗試在目前私人儲存庫啟用 GitHub Actions Pages。

若 GitHub 拒絕啟用：

1. 停止工作，不改變儲存庫可見性。
2. 不擅自建立額外公開儲存庫。
3. 回報 GitHub 回傳的權限或方案限制。
4. 等待使用者決定升級方案、公開目前儲存庫或另建 QA 儲存庫。

工作流需要最小權限：

- `contents: read`
- `pages: write`
- `id-token: write`

不得加入雲端帳號、資料庫、付款、正式部署或其他不屬於 QA 的服務。

## 驗收標準

規則與工作流完成後，必須由 GitHub 遠端證明：

1. 根目錄 `AGENTS.md` 明確禁止所有本機 QA。
2. 任一分支推送都觸發 QA 工作流。
3. GitHub runner 完成全部 Vitest 與正式建置。
4. Pages 固定網址可載入應用與全部素材。
5. Playwright 對 Pages 網址完成三種解析度的全部 E2E。
6. Actions summary 顯示網址、分支、提交 SHA 與結果。
7. 再推送另一分支後，同一網址被新提交覆蓋。
8. 整個驗收過程沒有啟動或使用本機 QA 服務。

## 官方參考

- [GitHub Pages 自訂工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [建立 GitHub Pages 網站](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
- [GitHub Pages 使用限制](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
