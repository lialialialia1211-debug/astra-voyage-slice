# 第一大章人物關係與逐幕狀態 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 以八張 v0.3 人物演出卡及小說 v0.2 為正準，完成 28 組雙向人物關係與六份涵蓋 30 幕的編劇狀態表，讓後續 AVG 台詞、站位、進退場與戰鬥銜接可逐幕校驗。

**Architecture:** `relationship-matrix.md` 保存跨幕不變的雙向關係規則及每次共同登場的變化索引；`scene-states/` 六份文件各承擔連續五幕的當下狀態。關係矩陣回答「兩人一貫如何互動」，逐幕表回答「此刻各自知道什麼、要什麼、能做什麼」，兩者以幕號互相連結，不重寫小說正文。

**Tech Stack:** UTF-8 Markdown、PowerShell 非驗收靜態檢查、Git、GitHub Actions `Remote QA - GitHub Pages`。

## Global Constraints

- 回覆及文件使用繁體中文；姓名固定為昭黎、晏泠、賽芙拉、彌菈·森、伊嵐·拓衡、韓澤、洛恩、晦岑。
- 來源優先序固定為：核准設計規格 → 三十幕細綱固定結果 → 小說 v0.2 正文 → v0.3 人物卡 → v0.2 人物卡與關係圖。
- 小說已固定的事件、視點、關係轉折、R18 幕次與不可逆結果不得更改；台詞只記意圖與潛台詞，不預寫成念稿式正文。
- 第一章感情結果是唯一正史，不以好感度分支；第 15、20、25 幕為三段正史成人福利劇情，後續新增角色才使用解鎖條件。
- 親密不增加戰鬥能力，也不消除嫉妒、傷害、戒心、職務衝突、退出權或追責。
- 主角元素屬性可更換；人物性格、服裝與台詞不得綁定單一元素。
- 每兩幕劇情安排一幕戰鬥／系統教學的既定 2:1 節奏，狀態表只記戰鬥敘事功能、參戰者、教學點與代價，不改戰鬥數值。
- 本階段不改程式、三十幕正文、v0.2 文件、第一章 140 項新美術或 `art-drop/chapter01/`。
- 不建立 worktree；在目前分支以小提交執行，保留使用者既有的 `.superpowers/.../task-4-report.md` 修改與未追蹤 `art-drop/chapter01/`。
- 不啟動本機伺服器，不執行本機測試、建置、E2E 或美術驗證作為驗收。
- 完成後推送目前分支並使用 `Remote QA - GitHub Pages`；固定網址為 https://lialialialia1211-debug.github.io/astra-voyage-slice/ 。

---

## 文件結構

```text
docs/worldbuilding/characters/first-major-arc-v0.3/
├─ README.md
├─ relationship-matrix.md
└─ scene-states/
   ├─ phase-01-scenes-01-05.md
   ├─ phase-02-scenes-06-10.md
   ├─ phase-03-scenes-11-15.md
   ├─ phase-04-scenes-16-20.md
   ├─ phase-05-scenes-21-25.md
   └─ phase-06-scenes-26-30.md
```

每組關係使用相同八欄：表面／真實關係、權力依賴與制衡、雙方需要與恐懼、誤解／信任／衝突／底線、語言演出、身體演出、破裂與修復流程、共同登場變化。每幕使用相同九欄：正史錨點、分段與進退場、資訊狀態、情緒餘波、目標與禁行、對話意圖與潛台詞、舞台演出、戰鬥銜接、幕末更新。

---

### Task 1: 建立 28 組人物關係矩陣

**Files:**
- Create: `docs/worldbuilding/characters/first-major-arc-v0.3/relationship-matrix.md`
- Read: `docs/worldbuilding/characters/first-major-arc-v0.3/*.md`
- Read: `docs/worldbuilding/characters/first-major-arc-v0.2/relationship-map.md`
- Read: `docs/worldbuilding/first-major-arc-thirty-scenes-outline-v0.2.md`

**Interfaces:**
- Consumes: 八張人物卡的 H7 權限、H8 七人關係、H9 六階段與 H13 情境演出。
- Produces: 後續六份逐幕表引用的關係 ID `R01`–`R28` 及雙向演出規則。

- [ ] **Step 1: 建立完整配對索引**

依角色順序昭黎、晏泠、賽芙拉、彌菈、伊嵐、韓澤、洛恩、晦岑列出組合，不重複方向，精確得到 28 組：昭黎的七組、晏泠餘下六組、賽芙拉餘下五組、彌菈餘下四組、伊嵐餘下三組、韓澤餘下兩組、洛恩與晦岑一組。

- [ ] **Step 2: 完成九組主線核心關係**

先寫昭黎↔晏泠、昭黎↔賽芙拉、昭黎↔彌菈、晏泠↔賽芙拉、晏泠↔彌菈、賽芙拉↔彌菈、昭黎↔洛恩、昭黎↔伊嵐、昭黎↔晦岑。每組八欄齊全，並明列共同登場幕號及幕前→幕後變化。

- [ ] **Step 3: 完成其餘十九組工作關係**

每組必須有角色專屬的稱呼、句長、證據、距離、衝突與恢復合作條件；沒有感情線的配對不得硬補親密、曖昧或私下熟識。韓澤的第二操作者、洛恩的岸本校驗、伊嵐的模型降速、彌菈的醫療中止、晏泠的迴避及晦岑的歷史異議均保持獨立。

- [ ] **Step 4: 執行靜態完整性檢查**

```powershell
$file = 'docs/worldbuilding/characters/first-major-arc-v0.3/relationship-matrix.md'
$text = Get-Content -Raw -Encoding UTF8 $file
if ([regex]::Matches($text, '(?m)^### R\d{2}｜').Count -ne 28) { throw '關係組數不是 28' }
rg -n '伊蘭|韓則|惠岑|T[B]D|T[O]DO|待[補]' $file
git diff --check -- $file
```

預期：關係組數為 28；錯名與佔位搜尋無結果；格式檢查無輸出。

- [ ] **Step 5: 提交關係矩陣**

```powershell
git add -- 'docs/worldbuilding/characters/first-major-arc-v0.3/relationship-matrix.md'
git commit -m 'docs: define first arc relationship matrix'
```

---

### Task 2: 完成第一階段第 01–05 幕狀態表

**Files:**
- Create: `docs/worldbuilding/characters/first-major-arc-v0.3/scene-states/phase-01-scenes-01-05.md`
- Read: `docs/worldbuilding/first-major-arc-novel-v0.2/scene-01-port-bell-old-flame.md` through `scene-05-first-answering-anchor.md`

**Interfaces:**
- Consumes: `relationship-matrix.md`、第 01–05 幕小說與五名直接登場者的角色卡。
- Produces: 港務重逢、封港、救援、檢疫與第一次錨點危機的逐幕可演出狀態。

- [ ] **Step 1: 逐幕抽取正史錨點與唯一視點**
- [ ] **Step 2: 逐幕寫入九欄狀態，明確限制晏泠在第 01 幕非全程站場**
- [ ] **Step 3: 在第 03–05 幕分開救援依附、檢疫同意與程序窗口，禁止把它們寫成一次感情升溫**
- [ ] **Step 4: 檢查五個幕號、五個視點、五個不可逆結果與所有人物進退場理由**
- [ ] **Step 5: 提交 `docs: map character states for scenes 01 to 05`**

---

### Task 3: 完成第二階段第 06–10 幕狀態表

**Files:**
- Create: `docs/worldbuilding/characters/first-major-arc-v0.3/scene-states/phase-02-scenes-06-10.md`
- Read: `docs/worldbuilding/first-major-arc-novel-v0.2/scene-06-the-right-to-stay-silent.md` through `scene-10-forty-seven-breaths.md`

**Interfaces:**
- Consumes: 拒答權、核心共生、訊標追查、受控操船與四十七息越權正史。
- Produces: 賽芙拉初始信任、跨席位制衡及昭黎第一次重大過失的狀態鏈。

- [ ] **Step 1: 逐幕填寫九欄並標出每人已知／未知／誤解／隱瞞**
- [ ] **Step 2: 第 07 幕寫清逐項同意、彌菈中止與伊嵐降速互不取代**
- [ ] **Step 3: 第 10 幕把救港成功與程序越權同時保留，禁止功過相抵**
- [ ] **Step 4: 靜態確認第 06–10 幕無缺號且幕末狀態可連到第 11 幕審查**
- [ ] **Step 5: 提交 `docs: map character states for scenes 06 to 10`**

---

### Task 4: 完成第三階段第 11–15 幕狀態表

**Files:**
- Create: `docs/worldbuilding/characters/first-major-arc-v0.3/scene-states/phase-03-scenes-11-15.md`
- Read: `docs/worldbuilding/first-major-arc-novel-v0.2/scene-11-her-first-question.md` through `scene-15-body-remembers.md`

**Interfaces:**
- Consumes: 公開審查、偽造舊訊息、分手真相、案件迴避與第一段 R18 正史。
- Produces: 晏泠與昭黎由問責到私人重建、且官權不回流的狀態鏈。

- [ ] **Step 1: 逐幕填寫九欄，區分公務問句與私人潛台詞**
- [ ] **Step 2: 固定第 14 幕交還案件印與迴避先於第 15 幕親密**
- [ ] **Step 3: 第 15 幕寫入自由離開、重新確認同意、至少三張 CG 節點及事後職務交接**
- [ ] **Step 4: 確認 R18 不提供戰鬥加成，且晏泠知道另外兩段關係的可能性**
- [ ] **Step 5: 提交 `docs: map character states for scenes 11 to 15`**

---

### Task 5: 完成第四階段第 16–20 幕狀態表

**Files:**
- Create: `docs/worldbuilding/characters/first-major-arc-v0.3/scene-states/phase-04-scenes-16-20.md`
- Read: `docs/worldbuilding/first-major-arc-novel-v0.2/scene-16-seventh-log.md` through `scene-20-when-she-could-leave.md`

**Interfaces:**
- Consumes: 北行、主船訊號隱瞞、白痕證據、實害追責與第二段 R18 正史。
- Produces: 賽芙拉由佔有性隱瞞到可追責、自主留下且仍保留離船權的狀態鏈。

- [ ] **Step 1: 逐幕填寫九欄並追蹤主船訊號由私人資訊變成共同航安風險**
- [ ] **Step 2: 第 19 幕具名記錄船體、船員與任務代價，創傷不能免責**
- [ ] **Step 3: 第 20 幕固定情報先完整交出、自由行動恢復後才開始親密，至少三張 CG 節點**
- [ ] **Step 4: 確認獨立艙室、主船目標、離船權與晏泠的嫉妒全數延續**
- [ ] **Step 5: 提交 `docs: map character states for scenes 16 to 20`**

---

### Task 6: 完成第五階段第 21–25 幕狀態表

**Files:**
- Create: `docs/worldbuilding/characters/first-major-arc-v0.3/scene-states/phase-05-scenes-21-25.md`
- Read: `docs/worldbuilding/first-major-arc-novel-v0.2/scene-21-false-chosen-one.md` through `scene-25-reason-not-to-stop.md`

**Interfaces:**
- Consumes: 假天選證據、醫療利益衝突、三種救援方案、無旗獵艦與第三段 R18 正史。
- Produces: 彌菈由偏袒申報到轉交日常醫療、仍保留緊急中止的狀態鏈。

- [ ] **Step 1: 逐幕填寫九欄，讓三名女主的方案由各自專業與恐懼產生**
- [ ] **Step 2: 第 22 幕固定日常醫療轉交，不削弱緊急／檢疫／全船中止**
- [ ] **Step 3: 第 24 幕記錄戰鬥參戰者、敵傷救援窗口、主使逃離與政治代價**
- [ ] **Step 4: 第 25 幕固定非醫療空間、清楚同意、至少三張 CG 節點及主動告知另外兩人**
- [ ] **Step 5: 提交 `docs: map character states for scenes 21 to 25`**

---

### Task 7: 完成第六階段第 26–30 幕狀態表

**Files:**
- Create: `docs/worldbuilding/characters/first-major-arc-v0.3/scene-states/phase-06-scenes-26-30.md`
- Read: `docs/worldbuilding/first-major-arc-novel-v0.2/scene-26-three-dark-anchors.md` through `scene-30-first-deep-sea-license.md`

**Interfaces:**
- Consumes: 分區疏散、共同中止航線、獨占幻象、終局切斷追跡及限制航照正史。
- Produces: 八名角色章末人物、職務、情報、船權與關係的完整收束狀態。

- [ ] **Step 1: 逐幕填寫九欄並列出八人各自是否在船、在岸或遠端支援**
- [ ] **Step 2: 第 27 幕逐席記錄預寫中止條件；伊嵐僅獨立行使模型降速，三輪停船由相關席共同確認**
- [ ] **Step 3: 第 28–29 幕讓三名女主及昭黎各自以可觀察行動拒絕獨占、被遺棄、永遠正確與獨自承擔的幻象**
- [ ] **Step 4: 第 30 幕固定功過並存、限制航照、船員配置、公開三段關係與未解威脅**
- [ ] **Step 5: 提交 `docs: map character states for scenes 26 to 30`**

---

### Task 8: 跨文件一致性審查與索引更新

**Files:**
- Modify: `docs/worldbuilding/characters/first-major-arc-v0.3/README.md`
- Modify if inconsistent: `docs/worldbuilding/characters/first-major-arc-v0.3/relationship-matrix.md`
- Modify if inconsistent: `docs/worldbuilding/characters/first-major-arc-v0.3/scene-states/*.md`

**Interfaces:**
- Consumes: 一份 28 組關係矩陣及六份狀態表。
- Produces: 可供第一幕垂直樣板直接使用、沒有幕號斷裂或權限回退的第二階段正準。

- [ ] **Step 1: 檢查精確 28 組關係與 30 幕唯一覆蓋**

```powershell
$root = 'docs/worldbuilding/characters/first-major-arc-v0.3'
$relationText = Get-Content -Raw -Encoding UTF8 "$root/relationship-matrix.md"
$sceneText = (Get-ChildItem "$root/scene-states" -Filter '*.md' | Sort-Object Name | Get-Content -Encoding UTF8) -join "`n"
$relations = [regex]::Matches($relationText, '(?m)^### R\d{2}｜')
$scenes = [regex]::Matches($sceneText, '(?m)^## 第 (\d{2}) 幕') | ForEach-Object { $_.Groups[1].Value }
if ($relations.Count -ne 28) { throw "關係組數：$($relations.Count)" }
if (($scenes | Sort-Object -Unique).Count -ne 30) { throw '幕號不是唯一 30 幕' }
```

- [ ] **Step 2: 逐幕核對視點與不可逆結果**

將六份狀態表的視點序列與 `first-major-arc-thirty-scenes-outline-v0.2.md` 逐項對照；每幕幕末更新必須能成為下一幕資訊、情緒或職務起點。

- [ ] **Step 3: 核對職權與關係護欄**

確認晏泠無航照／事故單獨審批、彌菈保留緊急中止、賽芙拉保留離船與主船目標、伊嵐保留模型降速、韓澤可阻止啟動與接舵、洛恩保留岸本反證、晦岑無決策與航線否決。

- [ ] **Step 4: 更新 README 索引及階段狀態**

加入關係矩陣與六份狀態表的相對連結，將「下一階段」更新為第一幕垂直樣板；明寫本階段只完成演出正準，遊戲資料尚未套用。

- [ ] **Step 5: 自我審查並提交**

```powershell
rg -n '伊蘭|韓則|惠岑|T[B]D|T[O]DO|待[補]|之後[補]' 'docs/worldbuilding/characters/first-major-arc-v0.3'
git diff --check -- 'docs/worldbuilding/characters/first-major-arc-v0.3'
git add -- 'docs/worldbuilding/characters/first-major-arc-v0.3'
git commit -m 'docs: complete relationship and scene state canon'
```

預期：錯名與佔位搜尋無結果，格式檢查無輸出，提交不含 `art-drop/` 或 `.superpowers/sdd/.../task-4-report.md`。

---

### Task 9: 推送並完成遠端 QA

**Files:**
- No repository content changes unless remote QA exposes a real issue.

**Interfaces:**
- Consumes: 第二階段所有提交。
- Produces: 固定 Pages URL、Actions run URL、部署 SHA 與遠端 QA 結果。

- [ ] **Step 1: 核對分支與提交範圍**
- [ ] **Step 2: 推送 `codex/relationship-matrix-scene-states`**
- [ ] **Step 3: 等待對應 SHA 的 `Remote QA - GitHub Pages` 完成，失敗只依遠端記錄除錯**
- [ ] **Step 4: 以固定 Pages URL 確認 HTTP 200、標題與主內容可讀**
- [ ] **Step 5: 報告文件連結、QA run、部署 SHA、結果及下一階段「第一幕垂直 AVG 樣板」**
