# 第一大章 R18 劇情大改 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 依核准規格完成第一大章三十小幕 v0.2 小說稿，使黑船、錨點與深海航照主線改由昭黎、晏泠、賽芙拉及彌菈的慾望、傷害與重新選擇推動。

**Architecture:** 保留既有 v0.1 與世界觀聖經不覆寫，另建 v0.2 人物卡、三十幕細綱與小說目錄。全章分成六個五幕階段，每一階段完成後獨立靜態檢查、交由使用者審閱並提交；後一階段只能在前一階段明確核准後開始。

**Tech Stack:** 繁體中文 Markdown、Git、PowerShell 靜態檢查、現有世界觀聖經與下載封存包。

## Global Constraints

- 唯一設計依據為 `docs/superpowers/specs/2026-08-11-first-major-arc-r18-story-revision-design.md`；不得自行擴張未核准的感情、性愛、懷孕或世界設定。
- 所有使用者可見文字與小說正文使用臺灣繁體中文；標點遵守下載資料中的 `writing/traditional-chinese-fiction-punctuation-v0.1.md`。
- 保留 `docs/worldbuilding/world-bible-v0.1.md`、`docs/worldbuilding/first-major-arc-discussion-supplement-2026-08-05.md` 及下載資料中的 v0.1 全部原文，不覆寫、不刪除。
- 新內容一律寫入 `docs/worldbuilding/characters/first-major-arc-v0.2/`、`docs/worldbuilding/first-major-arc-thirty-scenes-outline-v0.2.md` 與 `docs/worldbuilding/first-major-arc-novel-v0.2/`。
- 全章維持單一正史、多女主共同發展，不建立晏泠、賽芙拉或彌菈的排他角色分線。
- 每一小幕只使用一名第三人稱限知視點；全章昭黎視點目標為 17/30 幕，三名女主合計 13/30 幕。
- 一般小幕正文目標 4,000–7,000 個中文字；第 15、20、25 幕目標 5,000–8,000 個中文字。低於下限時必須補足事件、情緒或事後後果，不以重複敘述灌字。
- 完整 R18 關係只出現在第 15、20、25 幕，分別採晏泠、賽芙拉、彌菈視點；其他小幕只能累積情慾與親密張力。
- 三段 R18 均須由意識清楚的成年角色自主同意；不在醫療處置、拘禁、醉酒、權力交換或意識不完整狀態下發生。
- 第一大章不具體描寫懷孕、生育、子嗣或繁衍結果，不安排多人性愛，也不讓性愛直接強化核心或解決最終戰。
- 每一階段交稿後必須等待使用者明確核准；未核准不得修改下一階段小說。
- 使用 `apply_patch` 建立及修改文件。不得建立 `validation-report.md`、QA 報告或驗收結果文件。
- 依專案規則，不執行本地建置、單元測試、整合測試、端對端測試、藝術驗證、伺服器或瀏覽器 QA；文件工作只做 `rg`、PowerShell 內容統計、`git diff --check` 與人工一致性閱讀。
- 每一任務只提交該任務核准的檔案，不夾帶既有工作樹的其他變更；未經使用者指示不推送遠端。

---

### Task 1: 建立 v0.2 敘事基準與人物卡

**Files:**
- Create: `docs/worldbuilding/first-major-arc-thirty-scenes-outline-v0.2.md`
- Create: `docs/worldbuilding/characters/first-major-arc-v0.2/README.md`
- Create: `docs/worldbuilding/characters/first-major-arc-v0.2/zhaoli.md`
- Create: `docs/worldbuilding/characters/first-major-arc-v0.2/yanling.md`
- Create: `docs/worldbuilding/characters/first-major-arc-v0.2/mila-sen.md`
- Create: `docs/worldbuilding/characters/first-major-arc-v0.2/saifula.md`
- Create: `docs/worldbuilding/characters/first-major-arc-v0.2/luoen.md`
- Create: `docs/worldbuilding/characters/first-major-arc-v0.2/yilan-tuoheng.md`
- Create: `docs/worldbuilding/characters/first-major-arc-v0.2/huicen.md`
- Create: `docs/worldbuilding/characters/first-major-arc-v0.2/relationship-map.md`
- Create: `docs/worldbuilding/first-major-arc-novel-v0.2/README.md`

**Interfaces:**
- Consumes: 核准設計規格、`docs/worldbuilding/world-bible-v0.1.md`、`docs/worldbuilding/first-major-arc-discussion-supplement-2026-08-05.md`、`C:\Users\zhishouli\Downloads\worldbuilding-20260811T063423Z-1-001.zip`。
- Produces: 後續六個小說階段共同使用的角色年齡、身分、視點、情感弧、禁寫邊界、三十幕事件索引及檔名索引。

- [ ] **Step 1: 準備唯讀參考資料**

確認下載壓縮包存在；若暫存解壓目錄不存在，只解壓到 `%TEMP%`，不把 v0.1 大量複製進版本庫。

```powershell
$archive = 'C:\Users\zhishouli\Downloads\worldbuilding-20260811T063423Z-1-001.zip'
$referenceRoot = Join-Path $env:TEMP 'codex-worldbuilding-20260811T063423Z-1-001'
if (-not (Test-Path -LiteralPath $archive)) { throw "找不到參考壓縮包：$archive" }
if (-not (Test-Path -LiteralPath $referenceRoot)) {
  Expand-Archive -LiteralPath $archive -DestinationPath $referenceRoot
}
```

Expected: 壓縮包維持原樣，參考資料可由 `%TEMP%\codex-worldbuilding-20260811T063423Z-1-001\worldbuilding` 讀取。

- [ ] **Step 2: 建立 v0.2 人物卡**

人物卡必須逐項寫明：成年年齡、文化背景、船上／岸上職責、公開目標、對昭黎的私人需要、核心恐懼、會傷害關係的缺點、主動情感投射、第一章錯誤選擇、章末狀態及禁止偏離。

具體要求：

- 昭黎：22 歲；公開承認三段關係，不承諾虛假的平均分配，也不得用船長權限換取親密。
- 晏泠：24 歲；潮生港航安事故審查官；與昭黎的舊情發生於兩人成年後；第 14 幕失去案件資格，第 30 幕轉入試航團航務與對外協調。
- 賽芙拉：外表 24–30 歲；第 17 幕隱瞞主船訊號，第 19 幕造成實際危機，第 20 幕在可離開時主動留下。
- 彌菈：30 歲上下；南泊裔檢疫醫官；第 22 幕轉交昭黎日常醫療，第 25 幕承認私人偏袒與關係。
- 洛恩、伊嵐·拓衡、晦岑：保留既有專業功能，不加入多女主關係，也不因新版情感主線失去對昭黎的制衡能力。

- [ ] **Step 3: 建立 v0.2 關係圖與三十幕細綱**

`relationship-map.md` 必須同時包含：昭黎與三名女主、三名女主彼此、昭黎與洛恩／伊嵐／晦岑，以及「私人關係不得覆蓋職務權限」的關係註記。

`first-major-arc-thirty-scenes-outline-v0.2.md` 必須為每幕列出五欄：幕號與標題、視點、外部事件、關係變化、幕末不可逆後果。視點固定如下：

```text
01 昭黎  02 晏泠  03 昭黎  04 彌菈  05 晏泠
06 賽芙拉  07 昭黎  08 昭黎  09 昭黎  10 昭黎
11 晏泠  12 昭黎  13 昭黎  14 晏泠  15 晏泠
16 昭黎  17 賽芙拉  18 昭黎  19 昭黎  20 賽芙拉
21 昭黎  22 彌菈  23 昭黎  24 昭黎  25 彌菈
26 晏泠  27 昭黎  28 賽芙拉  29 昭黎  30 昭黎
```

- [ ] **Step 4: 建立小說目錄 README**

README 必須列出 30 個固定檔名、六階段、視點規則、篇幅範圍、R18 固定幕號、繁體中文規則與「v0.2 不覆寫 v0.1」聲明。30 個檔名以 Tasks 2–7 所列路徑為準。

- [ ] **Step 5: 執行基準靜態檢查**

```powershell
$outline = 'docs\worldbuilding\first-major-arc-thirty-scenes-outline-v0.2.md'
$characterDir = 'docs\worldbuilding\characters\first-major-arc-v0.2'
$requiredFiles = @(
  "$characterDir\README.md", "$characterDir\zhaoli.md", "$characterDir\yanling.md",
  "$characterDir\mila-sen.md", "$characterDir\saifula.md", "$characterDir\luoen.md",
  "$characterDir\yilan-tuoheng.md", "$characterDir\huicen.md", "$characterDir\relationship-map.md",
  $outline, 'docs\worldbuilding\first-major-arc-novel-v0.2\README.md'
)
$missing = $requiredFiles | Where-Object { -not (Test-Path -LiteralPath $_) }
if ($missing) { throw "缺少檔案：$($missing -join ', ')" }
$outlineText = Get-Content -LiteralPath $outline -Raw -Encoding UTF8
foreach ($term in @('晏泠','賽芙拉','彌菈·森','30','第 15 幕','第 20 幕','第 25 幕')) {
  if ($outlineText -notmatch [regex]::Escape($term)) { throw "細綱缺少：$term" }
}
$unfinishedPattern = ('TB' + 'D|TO' + 'DO|待' + '補|暫' + '定|简体|简体中文')
rg -n $unfinishedPattern $outline $characterDir 'docs\worldbuilding\first-major-arc-novel-v0.2\README.md'
git diff --check
```

Expected: 11 個基準檔案存在；細綱包含三名女主與三個 R18 節點；無未決標記；`git diff --check` exit 0。

- [ ] **Step 6: 使用者審閱基準文件**

向使用者提供三十幕視點表、晏泠人物卡與關係圖連結，摘要列出人物卡相對 v0.1 的改動。等待明確「同意」；若要求修改，只修 Task 1 檔案並重新執行 Step 5。

- [ ] **Step 7: 提交核准基準**

```powershell
git add -- 'docs/worldbuilding/first-major-arc-thirty-scenes-outline-v0.2.md' 'docs/worldbuilding/characters/first-major-arc-v0.2' 'docs/worldbuilding/first-major-arc-novel-v0.2/README.md'
git diff --cached --check
git commit -m "docs: establish first arc R18 narrative baseline"
```

Expected: 單一提交只包含 v0.2 細綱、人物卡、關係圖與小說 README。

---

### Task 2: 撰寫第一階段「黑船帶回舊情與新人」（01–05）

**Files:**
- Create: `docs/worldbuilding/first-major-arc-novel-v0.2/scene-01-port-bell-old-flame.md`
- Create: `docs/worldbuilding/first-major-arc-novel-v0.2/scene-02-black-ship-returns.md`
- Create: `docs/worldbuilding/first-major-arc-novel-v0.2/scene-03-hand-that-would-not-let-go.md`
- Create: `docs/worldbuilding/first-major-arc-novel-v0.2/scene-04-quarantine-line.md`
- Create: `docs/worldbuilding/first-major-arc-novel-v0.2/scene-05-first-answering-anchor.md`

**Interfaces:**
- Consumes: Task 1 人物卡、三十幕細綱；v0.1 scenes 01–05 只作世界因果與場景資產參考。
- Produces: 昭黎與晏泠舊情、賽芙拉獲救及彌菈介入的情感起點；Task 3 必須承接第一次錨點回答。

- [ ] **Step 1: 撰寫 scene 01–05**

逐幕不可缺少的內容：

1. `scene-01-port-bell-old-flame.md`（昭黎）：港口救難日常、昭黎的野心、晏泠以公務身分重返他的生活；以兩人熟悉卻不能相認的身體習慣收尾。
2. `scene-02-black-ship-returns.md`（晏泠）：遠溟三號返航；晏泠選擇封港並親自切斷昭黎退路；她的內心必須先顯示害怕失去他，再顯示官員判斷。
3. `scene-03-hand-that-would-not-let-go.md`（昭黎）：兩層潮救援、賽芙拉抓住昭黎並拒絕他人碰觸；晏泠的失態由昭黎可觀察行為呈現。
4. `scene-04-quarantine-line.md`（彌菈）：彌菈阻止輪番詢問與未經同意採樣；她辨認昭黎與晏泠的舊情，也第一次注意昭黎用工作逃避情緒。
5. `scene-05-first-answering-anchor.md`（晏泠）：固定錨回應黑船；晏泠在封鎖規則內為昭黎打開一次救援窗口，並留下日後可追責的程序痕跡。

本階段不出現完整性愛、告白或賽芙拉報恩式依附。

- [ ] **Step 2: 執行第一階段靜態檢查**

```powershell
$dir = 'docs\worldbuilding\first-major-arc-novel-v0.2'
$files = Get-ChildItem -LiteralPath $dir -Filter 'scene-0[1-5]-*.md' | Sort-Object Name
if ($files.Count -ne 5) { throw "第一階段檔案數錯誤：$($files.Count)" }
foreach ($file in $files) {
  $text = Get-Content -LiteralPath $file.FullName -Raw -Encoding UTF8
  $han = [regex]::Matches($text, '[\p{IsCJKUnifiedIdeographs}]').Count
  if ($han -lt 4000 -or $han -gt 7000) { throw "$($file.Name) 中文字數 $han 不在 4000–7000" }
}
$forbiddenPattern = ('本幕目的|玩家得知|戰鬥階段|TB' + 'D|TO' + 'DO|怀孕|多人性愛')
rg -n $forbiddenPattern $files.FullName
git diff --check
```

Expected: 5 個檔案，每幕 4,000–7,000 個中文字；無企劃標記、未決標記或未核准成人內容；`git diff --check` exit 0。

- [ ] **Step 3: 使用者審閱第一階段**

提供五幕檔案連結，摘要每幕的視點、外部事件、情感推進與幕末後果。等待明確核准；只在核准後提交及進入 Task 3。

- [ ] **Step 4: 提交第一階段**

```powershell
git add -- 'docs/worldbuilding/first-major-arc-novel-v0.2/scene-01-port-bell-old-flame.md' 'docs/worldbuilding/first-major-arc-novel-v0.2/scene-02-black-ship-returns.md' 'docs/worldbuilding/first-major-arc-novel-v0.2/scene-03-hand-that-would-not-let-go.md' 'docs/worldbuilding/first-major-arc-novel-v0.2/scene-04-quarantine-line.md' 'docs/worldbuilding/first-major-arc-novel-v0.2/scene-05-first-answering-anchor.md'
git diff --cached --check
git commit -m "docs: rewrite first arc phase one"
```

---

### Task 3: 撰寫第二階段「船底的第二顆心」（06–10）

**Files:**
- Create: `docs/worldbuilding/first-major-arc-novel-v0.2/scene-06-the-right-to-stay-silent.md`
- Create: `docs/worldbuilding/first-major-arc-novel-v0.2/scene-07-second-heart.md`
- Create: `docs/worldbuilding/first-major-arc-novel-v0.2/scene-08-signal-in-the-drain.md`
- Create: `docs/worldbuilding/first-major-arc-novel-v0.2/scene-09-order-she-signed.md`
- Create: `docs/worldbuilding/first-major-arc-novel-v0.2/scene-10-forty-seven-breaths.md`

**Interfaces:**
- Consumes: 第一階段錨點回答、晏泠留下的程序痕跡及賽芙拉的有限信任。
- Produces: 核心與船體共生、昭黎單次操船權及四十七息越權；Task 4 必須從公開審查開始。

- [ ] **Step 1: 撰寫 scene 06–10**

1. `scene-06-the-right-to-stay-silent.md`（賽芙拉）：她清醒後逐項拒絕提問與採樣；昭黎尊重沉默，使她第一次主動補充一項未被詢問的船體資訊。
2. `scene-07-second-heart.md`（昭黎）：登上遠溟三號；以船感、壓載與他人專業發現共生核心，不寫血脈選中或命定認主。
3. `scene-08-signal-in-the-drain.md`（昭黎）：外部勢力投放船籍訊標；晏泠提供合法攔截窗口，私下關切只能由可觀察行為呈現。
4. `scene-09-order-she-signed.md`（昭黎）：五國彼此否決後授予單次操船權；晏泠簽下可能讓昭黎死在海上的命令，兩人沒有私下和解。
5. `scene-10-forty-seven-breaths.md`（昭黎）：錨點即將替回聲完成返港座標；昭黎在承國同意晚到四十七息前擅自轉舵，救港、傷船並留下可追責證據。

- [ ] **Step 2: 靜態檢查、使用者審閱與提交**

先執行完整靜態檢查：

```powershell
$dir = 'docs\worldbuilding\first-major-arc-novel-v0.2'
$files = @(
  Get-ChildItem -LiteralPath $dir -Filter 'scene-0[6-9]-*.md'
  Get-ChildItem -LiteralPath $dir -Filter 'scene-10-*.md'
) | Sort-Object Name
if ($files.Count -ne 5) { throw "第二階段檔案數錯誤：$($files.Count)" }
foreach ($file in $files) {
  $text = Get-Content -LiteralPath $file.FullName -Raw -Encoding UTF8
  $han = [regex]::Matches($text, '[\p{IsCJKUnifiedIdeographs}]').Count
  if ($han -lt 4000 -or $han -gt 7000) { throw "$($file.Name) 中文字數 $han 不在 4000–7000" }
}
$forbiddenPattern = ('本幕目的|玩家得知|戰鬥階段|TB' + 'D|TO' + 'DO|懷孕|多人性愛')
rg -n $forbiddenPattern $files.FullName
git diff --check
```

Expected: 5 個檔案，每幕 4,000–7,000 個中文字；無企劃標記、未決標記或未核准成人內容；`git diff --check` exit 0。

向使用者提供五幕連結及視點、事件、關係、後果摘要，等待明確核准。核准後提交：

```powershell
git add -- 'docs/worldbuilding/first-major-arc-novel-v0.2/scene-06-the-right-to-stay-silent.md' 'docs/worldbuilding/first-major-arc-novel-v0.2/scene-07-second-heart.md' 'docs/worldbuilding/first-major-arc-novel-v0.2/scene-08-signal-in-the-drain.md' 'docs/worldbuilding/first-major-arc-novel-v0.2/scene-09-order-she-signed.md' 'docs/worldbuilding/first-major-arc-novel-v0.2/scene-10-forty-seven-breaths.md'
git diff --cached --check
git commit -m "docs: rewrite first arc phase two"
```

---

### Task 4: 撰寫第三階段「舊愛復燃」（11–15）

**Files:**
- Create: `docs/worldbuilding/first-major-arc-novel-v0.2/scene-11-her-first-question.md`
- Create: `docs/worldbuilding/first-major-arc-novel-v0.2/scene-12-old-messages-as-evidence.md`
- Create: `docs/worldbuilding/first-major-arc-novel-v0.2/scene-13-trapped-in-old-port.md`
- Create: `docs/worldbuilding/first-major-arc-novel-v0.2/scene-14-the-seal-she-returned.md`
- Create: `docs/worldbuilding/first-major-arc-novel-v0.2/scene-15-body-remembers.md`

**Interfaces:**
- Consumes: 四十七息越權、晏泠簽署的航行令與兩人的成年舊情。
- Produces: 晏泠迴避審查、上級知情證據及第一段正史 R18；Task 5 中晏泠不能再使用政府權力直接保護昭黎。

- [ ] **Step 1: 撰寫 scene 11–15**

1. `scene-11-her-first-question.md`（晏泠）：公開審查；她的問題最苛刻，目的同時是追責與逼昭黎留下可自保紀錄。
2. `scene-12-old-messages-as-evidence.md`（昭黎）：偽造舊通訊將感情史變成證物；昭黎必須公開承認關係存在，不能靠否認保住晏泠官位。
3. `scene-13-trapped-in-old-port.md`（昭黎）：證物轉運遭襲，兩人困於舊港；揭露晏泠當年選擇官職與安全，不把分手簡化成誤會。
4. `scene-14-the-seal-she-returned.md`（晏泠）：查明上級早知秘密遠航並準備犧牲昭黎；她公開證據、交還案件印與審查資格。
5. `scene-15-body-remembers.md`（晏泠）：僅在迴避生效、兩人可自由離開且明確確認同意後發生完整關係；情緒包含憤怒、熟悉、懊悔與佔有。事後她看見另外兩名女性已進入昭黎生活，且無法再以官員身分介入下一場栽贓。

- [ ] **Step 2: 執行第三階段專用檢查**

```powershell
$dir = 'docs\worldbuilding\first-major-arc-novel-v0.2'
$files = Get-ChildItem -LiteralPath $dir -Filter 'scene-1[1-5]-*.md' | Sort-Object Name
if ($files.Count -ne 5) { throw "第三階段檔案數錯誤：$($files.Count)" }
foreach ($file in $files) {
  $text = Get-Content -LiteralPath $file.FullName -Raw -Encoding UTF8
  $han = [regex]::Matches($text, '[\p{IsCJKUnifiedIdeographs}]').Count
  $min = if ($file.Name -like 'scene-15-*') { 5000 } else { 4000 }
  $max = if ($file.Name -like 'scene-15-*') { 8000 } else { 7000 }
  if ($han -lt $min -or $han -gt $max) { throw "$($file.Name) 中文字數 $han 不在 $min–$max" }
}
$forbiddenPattern = ('醉|下藥|拘禁交換|懷孕|受孕|多人性愛|本幕目的|TB' + 'D|TO' + 'DO')
rg -n $forbiddenPattern $files.FullName
git diff --check
```

Expected: scene 15 為 5,000–8,000 個中文字，其餘為 4,000–7,000；不存在未核准狀態或企劃標記。

- [ ] **Step 3: 使用者審閱與提交**

審閱摘要必須明列晏泠何時失去審查權、如何確認同意、事後政治代價。核准後提交：

```powershell
git add -- 'docs/worldbuilding/first-major-arc-novel-v0.2/scene-11-her-first-question.md' 'docs/worldbuilding/first-major-arc-novel-v0.2/scene-12-old-messages-as-evidence.md' 'docs/worldbuilding/first-major-arc-novel-v0.2/scene-13-trapped-in-old-port.md' 'docs/worldbuilding/first-major-arc-novel-v0.2/scene-14-the-seal-she-returned.md' 'docs/worldbuilding/first-major-arc-novel-v0.2/scene-15-body-remembers.md'
git diff --cached --check
git commit -m "docs: rewrite first arc phase three"
```

---

### Task 5: 撰寫第四階段「倖存者不願再次被留下」（16–20）

**Files:**
- Create: `docs/worldbuilding/first-major-arc-novel-v0.2/scene-16-seventh-log.md`
- Create: `docs/worldbuilding/first-major-arc-novel-v0.2/scene-17-signal-she-kept.md`
- Create: `docs/worldbuilding/first-major-arc-novel-v0.2/scene-18-white-scars-north-shore.md`
- Create: `docs/worldbuilding/first-major-arc-novel-v0.2/scene-19-price-of-silence.md`
- Create: `docs/worldbuilding/first-major-arc-novel-v0.2/scene-20-when-she-could-leave.md`

**Interfaces:**
- Consumes: 晏泠與昭黎已公開但無法由官職保護的關係、第七份航誌、賽芙拉的主船目標。
- Produces: 賽芙拉的隱瞞、實際事故、修復行動及第二段正史 R18；Task 6 必須保留昭黎與賽芙拉尚未完全恢復的情報信任。

- [ ] **Step 1: 撰寫 scene 16–20**

1. `scene-16-seventh-log.md`（昭黎）：航誌指向朔庭白崖；賽芙拉堅持同行，昭黎開始察覺她對晏泠的嫉妒。
2. `scene-17-signal-she-kept.md`（賽芙拉）：北行途中收到疑似主船訊號；她選擇隱瞞一段，清楚呈現「保護任務」與「害怕失去價值」兩種動機。
3. `scene-18-white-scars-north-shore.md`（昭黎）：白崖證明白痕與重複航線相關；其他倖存者不提供方便答案，也讓賽芙拉看見自己的可能終局。
4. `scene-19-price-of-silence.md`（昭黎）：隱瞞訊號引發定位，必須造成具名船員受傷、船體損失或任務失敗；昭黎追責，不能以救命之恩免除後果。
5. `scene-20-when-she-could-leave.md`（賽芙拉）：她主動交出完整訊號並完成一項實際修復，之後準備離開。親密場景只能在她已可自由離船、空間與出口由她選擇、昭黎不索取情報時發生；事後她首次能不面向出口入睡，仍保有獨立艙室。

- [ ] **Step 2: 靜態檢查、使用者審閱與提交**

```powershell
$dir = 'docs\worldbuilding\first-major-arc-novel-v0.2'
$files = @(
  Get-ChildItem -LiteralPath $dir -Filter 'scene-1[6-9]-*.md'
  Get-ChildItem -LiteralPath $dir -Filter 'scene-20-*.md'
) | Sort-Object Name
if ($files.Count -ne 5) { throw "第四階段檔案數錯誤：$($files.Count)" }
foreach ($file in $files) {
  $text = Get-Content -LiteralPath $file.FullName -Raw -Encoding UTF8
  $han = [regex]::Matches($text, '[\p{IsCJKUnifiedIdeographs}]').Count
  $min = if ($file.Name -like 'scene-20-*') { 5000 } else { 4000 }
  $max = if ($file.Name -like 'scene-20-*') { 8000 } else { 7000 }
  if ($han -lt $min -or $han -gt $max) { throw "$($file.Name) 中文字數 $han 不在 $min–$max" }
}
$forbiddenPattern = ('醉|下藥|拘禁交換|懷孕|受孕|多人性愛|本幕目的|TB' + 'D|TO' + 'DO')
rg -n $forbiddenPattern $files.FullName
git diff --check
```

Expected: scene 20 為 5,000–8,000 個中文字，其餘為 4,000–7,000；不存在未核准狀態或企劃標記。

向使用者提供五幕連結，審閱摘要明列隱瞞造成的具體損失、賽芙拉如何修復及為何不是報恩。等待明確核准後提交：

```powershell
git add -- 'docs/worldbuilding/first-major-arc-novel-v0.2/scene-16-seventh-log.md' 'docs/worldbuilding/first-major-arc-novel-v0.2/scene-17-signal-she-kept.md' 'docs/worldbuilding/first-major-arc-novel-v0.2/scene-18-white-scars-north-shore.md' 'docs/worldbuilding/first-major-arc-novel-v0.2/scene-19-price-of-silence.md' 'docs/worldbuilding/first-major-arc-novel-v0.2/scene-20-when-she-could-leave.md'
git diff --cached --check
git commit -m "docs: rewrite first arc phase four"
```

---

### Task 6: 撰寫第五階段「醫官也會失去界線」（21–25）

**Files:**
- Create: `docs/worldbuilding/first-major-arc-novel-v0.2/scene-21-false-chosen-one.md`
- Create: `docs/worldbuilding/first-major-arc-novel-v0.2/scene-22-doctor-who-was-not-neutral.md`
- Create: `docs/worldbuilding/first-major-arc-novel-v0.2/scene-23-three-ways-to-save-him.md`
- Create: `docs/worldbuilding/first-major-arc-novel-v0.2/scene-24-ship-without-a-flag.md`
- Create: `docs/worldbuilding/first-major-arc-novel-v0.2/scene-25-reason-not-to-stop.md`

**Interfaces:**
- Consumes: 昭黎的越權紀錄、晏泠失去審查權、賽芙拉尚在修復的信任、彌菈已察覺的嫉妒。
- Produces: 偽造天命證據被拆穿、遠溟三號依法奪回、彌菈承認偏袒及第三段正史 R18；Task 7 必須讓三段關係全部公開存在。

- [ ] **Step 1: 撰寫 scene 21–25**

1. `scene-21-false-chosen-one.md`（昭黎）：偽造文件將普通人才評估拼成命定操作者證據；昭黎停職，不以天命合理化取得黑船。
2. `scene-22-doctor-who-was-not-neutral.md`（彌菈）：她保護昭黎申辯權，也承認判斷已帶私人傾向；正式轉交日常醫療，保留緊急中止職責。
3. `scene-23-three-ways-to-save-him.md`（昭黎）：晏泠主張合法攔船、賽芙拉主張直接奪船、彌菈拒絕以昭黎生命證明感情；衝突必須改變奪船方案。
4. `scene-24-ship-without-a-flag.md`（昭黎）：依法奪回遠溟三號並迎戰獵艦；彌菈要求保留敵方傷員救援窗口，昭黎接受可能放走主使的代價。
5. `scene-25-reason-not-to-stop.md`（彌菈）：她承認曾因害怕失去昭黎而偏袒其生存。完整關係不在醫療空間或處置途中發生；她清楚說出界線，也允許自己失序。事後由她主動告知晏泠與賽芙拉，不稱為一次例外。

- [ ] **Step 2: 靜態檢查、使用者審閱與提交**

```powershell
$dir = 'docs\worldbuilding\first-major-arc-novel-v0.2'
$files = Get-ChildItem -LiteralPath $dir -Filter 'scene-2[1-5]-*.md' | Sort-Object Name
if ($files.Count -ne 5) { throw "第五階段檔案數錯誤：$($files.Count)" }
foreach ($file in $files) {
  $text = Get-Content -LiteralPath $file.FullName -Raw -Encoding UTF8
  $han = [regex]::Matches($text, '[\p{IsCJKUnifiedIdeographs}]').Count
  $min = if ($file.Name -like 'scene-25-*') { 5000 } else { 4000 }
  $max = if ($file.Name -like 'scene-25-*') { 8000 } else { 7000 }
  if ($han -lt $min -or $han -gt $max) { throw "$($file.Name) 中文字數 $han 不在 $min–$max" }
}
$forbiddenPattern = ('醉|下藥|拘禁交換|懷孕|受孕|多人性愛|本幕目的|TB' + 'D|TO' + 'DO')
rg -n $forbiddenPattern $files.FullName
git diff --check
```

Expected: scene 25 為 5,000–8,000 個中文字，其餘為 4,000–7,000；不存在未核准狀態或企劃標記。

向使用者提供五幕連結，審閱摘要明列日常醫療轉交生效時間、彌菈偏袒的具體行動與公開關係的後果。等待明確核准後提交：

```powershell
git add -- 'docs/worldbuilding/first-major-arc-novel-v0.2/scene-21-false-chosen-one.md' 'docs/worldbuilding/first-major-arc-novel-v0.2/scene-22-doctor-who-was-not-neutral.md' 'docs/worldbuilding/first-major-arc-novel-v0.2/scene-23-three-ways-to-save-him.md' 'docs/worldbuilding/first-major-arc-novel-v0.2/scene-24-ship-without-a-flag.md' 'docs/worldbuilding/first-major-arc-novel-v0.2/scene-25-reason-not-to-stop.md'
git diff --cached --check
git commit -m "docs: rewrite first arc phase five"
```

---

### Task 7: 撰寫第六階段「共同走向最後一盞燈外」（26–30）

**Files:**
- Create: `docs/worldbuilding/first-major-arc-novel-v0.2/scene-26-three-dark-anchors.md`
- Create: `docs/worldbuilding/first-major-arc-novel-v0.2/scene-27-route-everyone-can-stop.md`
- Create: `docs/worldbuilding/first-major-arc-novel-v0.2/scene-28-beyond-last-light.md`
- Create: `docs/worldbuilding/first-major-arc-novel-v0.2/scene-29-question-for-deep-ocean.md`
- Create: `docs/worldbuilding/first-major-arc-novel-v0.2/scene-30-first-deep-sea-license.md`

**Interfaces:**
- Consumes: 三段已公開親密關係、五國各自資源、錨點被反向利用及遠溟三號民用主體。
- Produces: 三十幕完整終局、限制深海航照、三名女主加入試航團及主船／觀潮巨影後續鉤子。

- [ ] **Step 1: 撰寫 scene 26–30**

1. `scene-26-three-dark-anchors.md`（晏泠）：錨點熄滅與潮生疏散；她因公開關係不能單獨處理昭黎航照，仍以港務專業保護城市而非只保護情人。
2. `scene-27-route-everyone-can-stop.md`（昭黎）：主船訊號、醫療中止與港口命令衝突；三名女性提出不同方向，最後共同設計每一專業席都能中止的航線。
3. `scene-28-beyond-last-light.md`（賽芙拉）：越過最後護航燈；觀潮巨影以「獨占昭黎」和主船生還製造最可信幻象，賽芙拉拒絕把全船任務換成私人答案。
4. `scene-29-question-for-deep-ocean.md`（昭黎）：最終戰以移動舟域、分段航線、專業判斷及互相揭穿謊言完成；性愛與愛情不得直接增幅核心，觀潮巨影本質仍未知。
5. `scene-30-first-deep-sea-license.md`（昭黎）：公開審查保留功績與過失；取得遠溟三號、船長資格及限制航照。晏泠、賽芙拉、彌菈提出各自不能再被否認的要求，昭黎承認三段關係與無法保證無人受傷；三人以不同職責加入試航團。

- [ ] **Step 2: 靜態檢查、使用者審閱與提交**

先檢查檔案數與一般幕篇幅，再確認結尾成果：

```powershell
$dir = 'docs\worldbuilding\first-major-arc-novel-v0.2'
$files = @(
  Get-ChildItem -LiteralPath $dir -Filter 'scene-2[6-9]-*.md'
  Get-ChildItem -LiteralPath $dir -Filter 'scene-30-*.md'
) | Sort-Object Name
if ($files.Count -ne 5) { throw "第六階段檔案數錯誤：$($files.Count)" }
foreach ($file in $files) {
  $text = Get-Content -LiteralPath $file.FullName -Raw -Encoding UTF8
  $han = [regex]::Matches($text, '[\p{IsCJKUnifiedIdeographs}]').Count
  if ($han -lt 4000 -or $han -gt 7000) { throw "$($file.Name) 中文字數 $han 不在 4000–7000" }
}
$forbiddenPattern = ('本幕目的|玩家得知|戰鬥階段|TB' + 'D|TO' + 'DO|懷孕|多人性愛')
rg -n $forbiddenPattern $files.FullName
$ending = Get-Content -LiteralPath 'docs\worldbuilding\first-major-arc-novel-v0.2\scene-30-first-deep-sea-license.md' -Raw -Encoding UTF8
foreach ($term in @('遠溟三號','船長','晏泠','賽芙拉','彌菈','深海航照')) {
  if ($ending -notmatch [regex]::Escape($term)) { throw "章末缺少：$term" }
}
git diff --check
```

審閱摘要必須分開列出最終戰的物理解法、三名女主的私人選擇、章末權利與仍未知項目。核准後提交：

```powershell
git add -- 'docs/worldbuilding/first-major-arc-novel-v0.2/scene-26-three-dark-anchors.md' 'docs/worldbuilding/first-major-arc-novel-v0.2/scene-27-route-everyone-can-stop.md' 'docs/worldbuilding/first-major-arc-novel-v0.2/scene-28-beyond-last-light.md' 'docs/worldbuilding/first-major-arc-novel-v0.2/scene-29-question-for-deep-ocean.md' 'docs/worldbuilding/first-major-arc-novel-v0.2/scene-30-first-deep-sea-license.md'
git diff --cached --check
git commit -m "docs: rewrite first arc phase six"
```

---

### Task 8: 全章連續性精修與正式索引

**Files:**
- Modify: `docs/worldbuilding/first-major-arc-novel-v0.2/README.md`
- Modify: `docs/worldbuilding/first-major-arc-thirty-scenes-outline-v0.2.md`
- Modify only when required by an approved continuity correction: `docs/worldbuilding/characters/first-major-arc-v0.2/*.md`
- Modify only for copyediting and approved continuity corrections: `docs/worldbuilding/first-major-arc-novel-v0.2/scene-*.md`

**Interfaces:**
- Consumes: 六個已分批核准並提交的小說階段。
- Produces: 可作為 AVG 拆分、分鏡與視覺設計共同母稿的 v0.2 正式索引；不建立 QA 或驗收報告。

- [ ] **Step 1: 逐項校對全章連續性**

依下列固定清單閱讀 30 幕；只直接修正文句、稱謂、時間與已核准設定的一致性。任何會改變事件因果、親密順序、角色去留或最終航照條件的變更，先列出提案並等待使用者同意。

```text
時間：黑船返航、四十七息事件、白崖往返、停職、錨點崩潰與終局航次的先後可追蹤。
地理：潮生港、歸潮灣、守白塢、止潮關、白崖與深潮線距離符合地圖設定。
權限：晏泠第 14 幕後不再審查昭黎；彌菈第 22 幕後不再負責日常醫療；昭黎取得正式船長與航照以前只持臨時權限。
關係：完整 R18 僅在 15、20、25；後續場景保留前一段關係造成的嫉妒與公開後果。
情報：賽芙拉的主船訊號隱瞞、公開與封存順序一致；她不是全知導航器。
世界：潮生港仍屬瀾國；五國沒有永久配額代表登船；核心仍受共同監管；觀潮巨影不被定義為確定生命。
配角：洛恩留岸制衡，伊嵐提供模型但不全知，晦岑提供歷史與有限力量而非免費解法。
```

- [ ] **Step 2: 執行全章靜態檢查**

```powershell
$dir = 'docs\worldbuilding\first-major-arc-novel-v0.2'
$files = Get-ChildItem -LiteralPath $dir -Filter 'scene-*.md' | Sort-Object Name
if ($files.Count -ne 30) { throw "小說幕數錯誤：$($files.Count)" }
$numbers = @($files | ForEach-Object { [int]([regex]::Match($_.Name, '^scene-([0-9]{2})-').Groups[1].Value) })
if (Compare-Object $numbers @(1..30)) { throw "小說檔名編號不連續：$($numbers -join ',')" }
foreach ($file in $files) {
  $text = Get-Content -LiteralPath $file.FullName -Raw -Encoding UTF8
  $han = [regex]::Matches($text, '[\p{IsCJKUnifiedIdeographs}]').Count
  $number = [int]([regex]::Match($file.Name, '^scene-([0-9]{2})-').Groups[1].Value)
  $min = if ($number -in @(15,20,25)) { 5000 } else { 4000 }
  $max = if ($number -in @(15,20,25)) { 8000 } else { 7000 }
  if ($han -lt $min -or $han -gt $max) { throw "$($file.Name) 中文字數 $han 不在 $min–$max" }
}
$forbiddenPattern = ('岑苒|祈槎|岳見衡|裴硯|晏停川|本幕目的|玩家得知|戰鬥階段|TB' + 'D|TO' + 'DO|待' + '補|簡體中文')
rg -n $forbiddenPattern $files.FullName
git diff --check
```

Expected: 30/30 檔案、編號 01–30 連續、篇幅符合規則、無 v0.1 淘汰姓名與企劃標記、`git diff --check` exit 0。

- [ ] **Step 3: 更新正式索引**

README 列出每幕標題、視點、階段及檔案連結，另附三段 R18 的成年與同意聲明、v0.2 與 v0.1 關係，以及後續 AVG 拆分只能以 v0.2 為母稿的說明。細綱只同步核准後的標題或連續性修正，不新增驗收欄位。

- [ ] **Step 4: 使用者進行全章最終審閱**

提供 README、三十幕細綱、三段 R18 所在幕與章末幕的連結；另外列出本輪純文字校正與任何經核准的連續性修正。等待明確核准。

- [ ] **Step 5: 提交全章精修**

```powershell
git add -- 'docs/worldbuilding/first-major-arc-novel-v0.2' 'docs/worldbuilding/first-major-arc-thirty-scenes-outline-v0.2.md' 'docs/worldbuilding/characters/first-major-arc-v0.2'
git diff --cached --check
git commit -m "docs: finalize first arc R18 novel v0.2"
```

Expected: 提交只包含使用者核准的 v0.2 索引、人物與小說精修；不包含 QA 報告、測試輸出或遠端推送。
