# 第一大章人物演出聖經 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立第一大章八名重要角色的 v0.3 人物演出聖經，固定姓名、年齡、人格、決策、語氣、動作、資訊與關係演出規則，供下一階段人物關係矩陣及三十幕 AVG 編劇使用。

**Architecture:** 保留 v0.2 人物卡與小說作為來源證據，在新的 first-major-arc-v0.3 目錄建立一份總索引及八份角色卡。README 固定共用資料正準與卡片結構；每張卡獨立承擔單一角色的完整演出規則，關係章只記錄該角色面對其他七人的表現，完整 28 組雙向關係留給下一階段。

**Tech Stack:** UTF-8 Markdown、PowerShell 靜態檢查、Git、GitHub Actions Remote QA - GitHub Pages。

## Global Constraints

- 回覆及文件使用繁體中文；專有名詞依小說 v0.2。
- 本計畫只建立人物演出聖經，不改遊戲程式、生成器、三十幕台詞、戰鬥、資產或 v0.2 文件。
- 不修改或納入 art-drop/chapter01/；該目錄是使用者既有美術資產。
- 來源優先序固定為：核准設計規格 → 三十幕細綱固定結果 → 小說 v0.2 正文 → 人物卡 v0.2 → 美術規格。
- 小說只提供已發生事件與可觀察行為；人物卡可補足不矛盾的 v0.3 演出規則，但不得改變三十幕固定事件。
- 姓名正準固定為昭黎、晏泠、賽芙拉、彌菈·森、伊嵐·拓衡、韓澤、洛恩、晦岑。
- 明確年齡固定為：昭黎 22、晏泠 24、彌菈·森 30、伊嵐·拓衡 30、韓澤 29、洛恩 46、晦岑 218。
- 賽芙拉分列：外表年齡約 27、本人可確認的主觀經歷年齡 29、曆法年齡因深洋時間差無法確認；三項不得合併成假精確值。
- 所有主要人物均為能自由決定的成年人。親密、醫療、情報與職權護欄沿用既有正史。
- 每張卡都必須包含正確／錯誤台詞、正確／錯誤動作、五類情境演出及逐項一致性檢查表。
- 每張卡的「身體與舞台演出」必須把現有立繪表情 ID 對應到可觀察觸發條件及禁用情況；主要四人使用 neutral、happy、tense、angry、hurt、soft，支援四人使用 neutral、happy、tense、angry、hurt。
- 美術規格中的角色字樣「羅恩」視為舊錯字；文字正準固定為「洛恩」，既有資產 ID `chr_luoen` 不改。
- 不使用「冷靜」「溫柔」「理性」作為沒有可觀察行為的結論；每個性格判斷都要落到選擇、台詞或動作。
- 不啟動本機伺服器，不執行本機測試、建置、E2E 或美術驗證作為驗收。
- 本機只做讀取、編輯、Git 及非驗收的靜態檢查；完成後推送目前分支並使用 Remote QA - GitHub Pages。
- 固定 QA 網址為 https://lialialialia1211-debug.github.io/astra-voyage-slice/ 。

---

## 文件結構

建立下列檔案：

~~~text
docs/worldbuilding/characters/first-major-arc-v0.3/
├─ README.md
├─ zhaoli.md
├─ yanling.md
├─ saifula.md
├─ mila-sen.md
├─ yilan-tuoheng.md
├─ hanze.md
├─ luoen.md
└─ huicen.md
~~~

README 只保存共同規則、資料正準、來源順序、索引與卡片欄位定義。每個人物檔只描述單一人物，避免把雙向關係矩陣或逐幕狀態提前塞進角色卡。

每張人物卡使用相同章節：

1. 正史基本資料
2. 外觀與生活辨識
3. 人格核心
4. 價值順位與決策演算法
5. 說話方式
6. 身體與舞台演出
7. 能力、權限與資訊邊界
8. 面對其他七人的關係限定表現
9. 六階段成長軸
10. 禁止偏離
11. 台詞校準
12. 動作校準
13. 五類情境演出
14. 人物一致性檢查表
15. 正史來源索引

---

### Task 1: 建立 v0.3 人物聖經總索引與資料正準

**Files:**
- Create: docs/worldbuilding/characters/first-major-arc-v0.3/README.md
- Read: docs/superpowers/specs/2026-08-12-character-driven-avg-design.md
- Read: docs/worldbuilding/characters/first-major-arc-v0.2/README.md
- Read: docs/worldbuilding/first-major-arc-thirty-scenes-outline-v0.2.md
- Read: outputs/chapter-01-art-production-spec-v2.md

**Interfaces:**
- Consumes: 核准設計中的八人範圍、姓名正準、卡片欄位及來源優先序。
- Produces: 後續八張卡共同引用的年齡表、名稱表、資料層級、欄位定義及索引。

- [ ] **Step 1: 建立目錄與 README**

README 必須直接寫入以下資料正準：

| ID | 正式姓名 | 年齡正準 | 第一章職務定位 |
| --- | --- | --- | --- |
| zhaoli | 昭黎 | 22 | 初級引航救難員 → 遠溟三號正式船長 |
| yanling | 晏泠 | 24 | 航安事故審查官 → 試航團航務與對外協調 |
| saifula | 賽芙拉 | 外表約 27；主觀經歷 29；曆法未知 | 倖存者與深洋航跡顧問 |
| mila | 彌菈·森 | 30 | 跨國檢疫醫官與全船安全中止席 |
| yilan | 伊嵐·拓衡 | 30 | 岱岳盟觀測官與模型降速席 |
| hanze | 韓澤 | 29 | 北灣資深移泊舵手 → 第一航次第二操作者 |
| luoen | 洛恩 | 46 | 折蘆船長、職業導師與岸上航誌校驗者 |
| huicen | 晦岑 | 218 | 固定錨歷史見證人與非常駐歷史顧問 |

README 同時寫明：

- v0.3 是 AVG 演出的直接人物正準，v0.2 保留作來源歷史。
- 三十幕事件仍以小說 v0.2 及細綱為準。
- 程式中的伊蘭／韓則／惠岑及錯誤年齡屬待第三階段修正的下游資料，本階段不改程式。
- 角色卡不等於關係矩陣；雙向衝突與逐幕狀態留待第二階段。
- 上列 15 個固定章節不可刪減或合併。

README 加入現有美術辨識正準，供八張卡的外觀與舞台章節引用：

| 角色 | 現有服裝及輪廓辨識 |
| --- | --- |
| 昭黎 | 艦長型長衣、海圖與羅盤結構、可替換元素核心掛點；衣裝不綁單一元素色 |
| 晏泠 | 海風與儀式感、不對稱長布片、精準俐落的航務剪裁 |
| 賽芙拉 | 異域航海與黑潮獵手感、輕裝分層、繩結及侵蝕材質 |
| 彌菈·森 | 白崖醫療／祈禱風格、暖白與青金、藥袋、護袖及柔軟面料 |
| 伊嵐·拓衡 | 測繪師與計算者、地圖層片、工具腰帶、土屬幾何結構 |
| 韓澤 | 港區短外套、防熱金屬、維修與戰鬥兩用構造 |
| 洛恩 | 資深救難員、厚實防水布料、磨損救生織帶、實務性最強 |
| 晦岑 | 學者式長袍、檔案封緘配件、端整且具歷史席權威感 |

人物卡可以補足穿著方式、整理習慣及道具使用，但不得把已交付的外觀替換成另一套服裝設計。

- [ ] **Step 2: 加入八張人物卡索引**

索引必須列出八個相對連結、每人的一句演出核心及文件狀態「待本階段完成」。完成某張卡時，把該列狀態改為「已完成 v0.3 初稿」。

- [ ] **Step 3: 靜態檢查 README**

執行：

~~~powershell
Get-Content -Raw -Encoding UTF8 'docs/worldbuilding/characters/first-major-arc-v0.3/README.md'
rg -n '伊蘭|韓則|惠岑|T[B]D|T[O]DO|待[補]' 'docs/worldbuilding/characters/first-major-arc-v0.3/README.md'
git diff --check -- 'docs/worldbuilding/characters/first-major-arc-v0.3/README.md'
~~~

預期：第一個命令可讀取完整繁體中文；第二個命令沒有結果；第三個命令沒有格式錯誤。這是靜態檢查，不作本機驗收。

- [ ] **Step 4: 提交總索引**

~~~powershell
git add -- 'docs/worldbuilding/characters/first-major-arc-v0.3/README.md'
git commit -m "docs: establish v0.3 character canon"
~~~

---

### Task 2: 建立昭黎人物演出卡

**Files:**
- Create: docs/worldbuilding/characters/first-major-arc-v0.3/zhaoli.md
- Modify: docs/worldbuilding/characters/first-major-arc-v0.3/README.md
- Read: docs/worldbuilding/characters/first-major-arc-v0.2/zhaoli.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-01-port-bell-old-flame.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-10-forty-seven-breaths.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-19-price-of-silence.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-24-ship-without-a-flag.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-27-route-everyone-can-stop.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-29-question-for-deep-ocean.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-30-first-deep-sea-license.md

**Interfaces:**
- Consumes: README 資料正準及昭黎在三十幕的固定錯誤、問責與成長。
- Produces: 主角在所有後續 AVG 場景中的決策、語氣、動作、資訊與關係演出規則。

- [ ] **Step 1: 寫入昭黎的正史與人格核心**

固定以下內容，不得換成泛用英雄模板：

- 22 歲潮生港人；章初為折蘆初級引航救難員，章末為遠溟三號正式船長。
- 公開欲望是自己的船、合法深海航照及可校驗航誌。
- 私人錯誤信念是「只有能解決問題時才值得被需要」。
- 壓力越大越少話，會縮短覆核、檢查繩結／儀表／航誌，並把願意負責錯認成有權替人承擔。
- 第一章核心錯誤是第 10 幕四十七息表決未完即轉舵；成功救港不抵銷越權。
- 成長證據是逐席詢問、把中止權交到他人手上、接受韓澤接舵及答不出依據時停船。

- [ ] **Step 2: 寫入語氣、動作與關係限定**

語氣規則至少包含：

- 先報可觀察事實，再給下一個可執行動作；不用演說證明勇敢。
- 不知道時說「未確認」「我答不出」，不能用直覺包裝成確定。
- 命令短、具時間與條件；私人示弱比工作語句更短、更慢。
- 對晏泠使用過度正式稱呼掩飾熟悉；對賽芙拉先問是否願意；對彌菈起初只報傷勢，後期會問她需要什麼；對伊嵐提供可反駁的船況；對韓澤接受獨立覆核；對洛恩使用工作短語；對晦岑要求歷史證詞與當代證據分開。

身體演出至少包含：

- 判斷水勢時看實物，不看舉牌者的權威。
- 壓力時手會停在繩結、舵輪或紀錄板；被指出越權時先收手而非搶答。
- 對熟悉的人以記得細小動作表達關切，不用突然擁抱替代溝通。

- [ ] **Step 3: 加入校準範例與五類情境**

正確台詞至少收錄並解釋：

- 「水位還差半掌。傷員船先進，十五分後還你泊位。」
- 「我答不出就當未證實。」
- 「你不回答，這一段就不開始。」

錯誤台詞至少收錄並解釋：

- 「相信我，我一定能救所有人。」
- 「責任都是我的，所以照我說的做。」
- 「核心選中了我。」

五類情境固定為：日常交班、事故指揮、公開問責、感情衝突、親密後的職務交接。每類都要寫出觸發、外顯動作、台詞策略及不能做的事。

- [ ] **Step 4: 完成人物一致性檢查表與來源索引**

檢查表至少驗證：是否先給事實、是否保留他人中止權、是否把沉默當同意、是否跨專業回答、是否以工作逃避情緒、是否讓成功抵銷過失。來源索引列出本 Task 指定場景及對應用途。

- [ ] **Step 5: 更新 README 並靜態檢查**

把昭黎狀態改為「已完成 v0.3 初稿」，執行：

~~~powershell
rg -n '^## ' 'docs/worldbuilding/characters/first-major-arc-v0.3/zhaoli.md'
rg -n '天選|核心認主|永遠正確|T[B]D|T[O]DO|待[補]' 'docs/worldbuilding/characters/first-major-arc-v0.3/zhaoli.md'
git diff --check -- 'docs/worldbuilding/characters/first-major-arc-v0.3/zhaoli.md' 'docs/worldbuilding/characters/first-major-arc-v0.3/README.md'
~~~

預期：15 個固定章節全部存在；禁用概念只出現在「禁止偏離／錯誤範例」脈絡；沒有佔位文字或格式錯誤。

- [ ] **Step 6: 提交昭黎演出卡**

~~~powershell
git add -- 'docs/worldbuilding/characters/first-major-arc-v0.3/zhaoli.md' 'docs/worldbuilding/characters/first-major-arc-v0.3/README.md'
git commit -m "docs: define Zhaoli performance card"
~~~

---

### Task 3: 建立晏泠人物演出卡

**Files:**
- Create: docs/worldbuilding/characters/first-major-arc-v0.3/yanling.md
- Modify: docs/worldbuilding/characters/first-major-arc-v0.3/README.md
- Read: docs/worldbuilding/characters/first-major-arc-v0.2/yanling.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-01-port-bell-old-flame.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-02-black-ship-returns.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-05-first-answering-anchor.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-11-her-first-question.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-14-the-seal-she-returned.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-15-body-remembers.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-26-three-dark-anchors.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-30-first-deep-sea-license.md

**Interfaces:**
- Consumes: 晏泠的官職、成年舊情、案件迴避及轉職正史。
- Produces: 晏泠在公務、舊情、嫉妒、失權與航務協調中的演出規則。

- [ ] **Step 1: 寫入晏泠的正史與人格核心**

固定：

- 24 歲；潮生港航安事故審查官，章末轉任試航團航務與對外協調，不是副船長。
- 她曾為官職及單一伴侶登記規則主動結束成年舊情，害怕再次選擇職位後仍失去昭黎。
- 缺點是借公務創造接近、把嫉妒包裝成風險審查、把熟悉誤認為仍有優先權。
- 第 14 幕交還案件印及迴避先於第 15 幕親密；不得倒置。
- 章末不得審批昭黎的航照、事故或豁免；轉職目的是建立民用深海秩序，不是追隨男人。

- [ ] **Step 2: 寫入語氣、動作與關係限定**

固定演出：

- 公務句精確、一次只問一個可追責問題；私人情緒越強，措辭越像公文。
- 不說空泛「我相信你」，而是留下窗口、證據、退路或正式迴避。
- 緊張時拇指按食指根部；準備作艱難決定時先整理袖口、印章或文件邊線。
- 對昭黎過度正式且避開目光；對賽芙拉質疑情報風險時必須保留真實專業理由；對彌菈尊重病歷權限但會比較誰更了解昭黎；對洛恩不要求替昭黎作答；對伊嵐把法規條件轉為模型可用邊界；對韓澤承認其第二操作者獨立性；對晦岑要求歷史證詞不能代替現行程序。

- [ ] **Step 3: 加入校準範例與五類情境**

正確台詞：

- 「你可以申請迴避，理由要寫。」
- 「我開的是一次救援窗口，不是無責任通行。」
- 「我不以關係換職位，也不以職位換你回來。」

錯誤台詞：

- 「因為我愛他，所以這次不記錄。」
- 「我是最早認識他的，你們應該讓開。」
- 「我辭職只是為了永遠陪著昭黎。」

五類情境：事故詢問、封港決斷、嫉妒混入專業、交還權限、迴避生效後的私人接近。

- [ ] **Step 4: 完成一致性檢查、索引、README 與提交**

檢查必須能阻止：官權換親密、未迴避即親密、為愛刪證據、固定正宮化、把尖銳質疑寫成無理由吃醋。

~~~powershell
rg -n '^## ' 'docs/worldbuilding/characters/first-major-arc-v0.3/yanling.md'
rg -n 'T[B]D|T[O]DO|待[補]' 'docs/worldbuilding/characters/first-major-arc-v0.3/yanling.md'
git diff --check -- 'docs/worldbuilding/characters/first-major-arc-v0.3/yanling.md' 'docs/worldbuilding/characters/first-major-arc-v0.3/README.md'
git add -- 'docs/worldbuilding/characters/first-major-arc-v0.3/yanling.md' 'docs/worldbuilding/characters/first-major-arc-v0.3/README.md'
git commit -m "docs: define Yanling performance card"
~~~

---

### Task 4: 建立賽芙拉人物演出卡

**Files:**
- Create: docs/worldbuilding/characters/first-major-arc-v0.3/saifula.md
- Modify: docs/worldbuilding/characters/first-major-arc-v0.3/README.md
- Read: docs/worldbuilding/characters/first-major-arc-v0.2/saifula.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-03-hand-that-would-not-let-go.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-06-the-right-to-stay-silent.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-16-seventh-log.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-17-signal-she-kept.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-19-price-of-silence.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-20-when-she-could-leave.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-28-beyond-last-light.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-30-first-deep-sea-license.md

**Interfaces:**
- Consumes: 倖存者、情報控制、主船目標、隱瞞傷害與自主留下正史。
- Produces: 賽芙拉在創傷、拒絕、信任、嫉妒、情報責任與親密中的演出規則。

- [ ] **Step 1: 寫入三層年齡與人格核心**

固定：

- 外表約 27、主觀經歷年齡 29、曆法年齡未知；她確定是具完整自主能力的成年人。
- 陌生空間先找出口、門鎖及死角；信任成長表現為主動補充未被問到的資訊。
- 她需要確認沒有情報時仍被當作人需要；恐懼是訊號害死同伴及失去最後情報後被留下。
- 第 17 幕隱瞞造成第 19 幕實害，不能以創傷或救命之恩免責。
- 第 20 幕是已恢復自由行動後的自主留下；獨立艙室、主船目標、情報控制與離船權保留。

- [ ] **Step 2: 寫入語氣、動作與關係限定**

固定演出：

- 句子偏短，先界定「我能回答哪一段」；信任不是突然健談。
- 拒絕不需解釋完整理由；願意補充時會清楚標示觀察、記憶與推測。
- 戒備時身體朝出口、手保留可離開空間；放鬆的可見變化是背部離開門、物品不全收在伸手可及處。
- 對昭黎測試沒有情報時是否仍留位置；對晏泠拒絕被舊情排序；對彌菈因前醫病權力更敏感；對伊嵐提供經驗但拒絕被模型吞沒；對韓澤尊重盲核；對洛恩觀察他是否把救援恩情當債；對晦岑拒絕被歷史倖存者代言。

- [ ] **Step 3: 加入校準範例與五類情境**

正確台詞：

- 「這一段我不回答。」
- 「我能確認節奏，不能確認來源。」
- 「沒有訊號，我也要自己決定留不留下。」

錯誤台詞：

- 「你救了我，所以我永遠聽你的。」
- 「我受過傷，你們不能追究這次隱瞞。」
- 「主船不重要了，我只想陪昭黎。」

五類情境：急性救援、正式詢問、主動補充、隱瞞曝光、可離開時的自主接近。

- [ ] **Step 4: 完成一致性檢查、索引、README 與提交**

檢查必須涵蓋：出口意識、回答範圍、資訊責任、是否被寫成設定資料庫、是否用報恩換忠誠、是否取消主船目標。

~~~powershell
rg -n '^## ' 'docs/worldbuilding/characters/first-major-arc-v0.3/saifula.md'
rg -n 'T[B]D|T[O]DO|待[補]' 'docs/worldbuilding/characters/first-major-arc-v0.3/saifula.md'
git diff --check -- 'docs/worldbuilding/characters/first-major-arc-v0.3/saifula.md' 'docs/worldbuilding/characters/first-major-arc-v0.3/README.md'
git add -- 'docs/worldbuilding/characters/first-major-arc-v0.3/saifula.md' 'docs/worldbuilding/characters/first-major-arc-v0.3/README.md'
git commit -m "docs: define Saifula performance card"
~~~

---

### Task 5: 建立彌菈·森人物演出卡

**Files:**
- Create: docs/worldbuilding/characters/first-major-arc-v0.3/mila-sen.md
- Modify: docs/worldbuilding/characters/first-major-arc-v0.3/README.md
- Read: docs/worldbuilding/characters/first-major-arc-v0.2/mila-sen.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-04-quarantine-line.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-07-second-heart.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-10-forty-seven-breaths.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-21-false-chosen-one.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-22-doctor-who-was-not-neutral.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-24-ship-without-a-flag.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-25-reason-not-to-stop.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-30-first-deep-sea-license.md

**Interfaces:**
- Consumes: 彌菈的病歷邊界、醫療中止、偏袒申報、日常醫療轉交及關係正史。
- Produces: 彌菈在醫療、照護、利益衝突、疲憊、嫉妒與親密中的演出規則。

- [ ] **Step 1: 寫入彌菈的正史與人格核心**

固定：

- 30 歲南泊裔跨國檢疫醫官，與昭黎存在明確經驗差。
- 公開目標是建立不迫使倖存者在永久隔離與交出全部身體資料間二選一的制度。
- 缺點是把自己放在永遠正確的守門人位置，以精準壓住偏袒，直到壓抑本身危及判斷。
- 第 22 幕公開申報私人傾向並轉交昭黎日常醫療；緊急醫療及全船中止權不轉交。
- 第 25 幕只能在非醫療空間、非處置途中、雙方意識清楚且可停止的狀態成立。

- [ ] **Step 2: 寫入語氣、動作與關係限定**

固定演出：

- 明確分開事實、推測及當事人原話；提問後真的等待回答。
- 照顧的表現是停手、說明下一步、保護拒絕及退出，不是自動溫柔安慰。
- 壓力時記錄變得更整齊、語速更平，疲憊洩漏在重複核對或忘記處理自己的需要。
- 對昭黎先看生命值也會看他用工作逃避；對晏泠守病歷邊界；對賽芙拉必須承接前醫病權力的不信任；對伊嵐要求模型標出生命限制；對韓澤能因傷勢停止其操船；對洛恩拒絕以導師身分取得病歷；對晦岑不因年長或力量跳過醫療撤退線。

- [ ] **Step 3: 加入校準範例與五類情境**

正確台詞：

- 「這是觀察，不是結論。」
- 「你可以拒絕；拒絕不會取消治療。」
- 「日常醫療已轉交。全船中止權仍在我這裡。」

錯誤台詞：

- 「我是醫生，所以我知道你真正想要什麼。」
- 「因為我愛他，這次生命值可以不記。」
- 「我會替你們三個維持和平。」

五類情境：檢疫問診、事故中止、偏袒被指出、轉交權限、允許他人照顧自己。

- [ ] **Step 4: 完成一致性檢查、索引、README 與提交**

檢查必須阻止：道德裁判化、情感顧問化、病歷換親密、醫療依賴中親密、成為伴侶後放棄中止權。

~~~powershell
rg -n '^## ' 'docs/worldbuilding/characters/first-major-arc-v0.3/mila-sen.md'
rg -n 'T[B]D|T[O]DO|待[補]' 'docs/worldbuilding/characters/first-major-arc-v0.3/mila-sen.md'
git diff --check -- 'docs/worldbuilding/characters/first-major-arc-v0.3/mila-sen.md' 'docs/worldbuilding/characters/first-major-arc-v0.3/README.md'
git add -- 'docs/worldbuilding/characters/first-major-arc-v0.3/mila-sen.md' 'docs/worldbuilding/characters/first-major-arc-v0.3/README.md'
git commit -m "docs: define Mila Sen performance card"
~~~

---

### Task 6: 建立伊嵐·拓衡人物演出卡

**Files:**
- Create: docs/worldbuilding/characters/first-major-arc-v0.3/yilan-tuoheng.md
- Modify: docs/worldbuilding/characters/first-major-arc-v0.3/README.md
- Read: docs/worldbuilding/characters/first-major-arc-v0.2/yilan-tuoheng.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-07-second-heart.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-09-order-she-signed.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-24-ship-without-a-flag.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-27-route-everyone-can-stop.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-29-question-for-deep-ocean.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-30-first-deep-sea-license.md

**Interfaces:**
- Consumes: 模型、原始值、可反駁假設、降速權與資料利益衝突正史。
- Produces: 伊嵐在研究、現場決策、模型失效、撤離與跨專業合作中的演出規則。

- [ ] **Step 1: 寫入伊嵐的正史與人格核心**

固定：

- 30 歲岱岳盟觀測官；負責核心觀測、航線模型、原始值及數據超標降速權。
- 需要昭黎把船感翻成可校驗依據，也需要現場因素能推翻自己的模型。
- 恐懼是完整模型被政治力量當成新人體或核心試驗許可。
- 缺點是為保留完整數據拖延撤離，並低估不確定說法對非研究者的影響。
- 不加入主角親密關係，不是百科、冷血研究者或永遠正確預測者。

- [ ] **Step 2: 寫入語氣、動作與關係限定**

固定演出：

- 先說觀測值，再說誤差、假設及可推翻條件；不能只丟結論。
- 面對未知會說「沒有可用距離」而非硬造數字。
- 思考時會重排資料層片、把舊值保留在旁而非覆寫；壓力時縮短模型有效範圍。
- 對昭黎要求船感依據；對晏泠把法規轉成可計算限制；對賽芙拉標記經驗資料來源但不奪取私人記憶；對彌菈接受生命值優先縮短觀測；對韓澤提供可複誦條件；對洛恩保留模型與岸本分歧；對晦岑把歷史記憶列為高價值但可錯證詞。

- [ ] **Step 3: 加入校準範例與五類情境**

正確台詞：

- 「沒有可用距離。把它當成位置會誤導。」
- 「這是模型，不是船況。」
- 「超過這個值，我要求降速；原因和原始值都在這裡。」

錯誤台詞：

- 「模型永遠不會錯。」
- 「為了完整數據，撤離可以再等等。」
- 「昭黎的直覺比所有計算可靠。」

五類情境：低壓分析、時間不足的模型、數據與人命衝突、公開推翻自己、跨席位建立停止條件。

- [ ] **Step 4: 完成一致性檢查、索引、README 與提交**

檢查涵蓋：原始值、誤差、模型有效範圍、停止條件、利益衝突、是否越過醫療／操船／情報專業。

~~~powershell
rg -n '^## ' 'docs/worldbuilding/characters/first-major-arc-v0.3/yilan-tuoheng.md'
rg -n '伊蘭|T[B]D|T[O]DO|待[補]' 'docs/worldbuilding/characters/first-major-arc-v0.3/yilan-tuoheng.md'
git diff --check -- 'docs/worldbuilding/characters/first-major-arc-v0.3/yilan-tuoheng.md' 'docs/worldbuilding/characters/first-major-arc-v0.3/README.md'
git add -- 'docs/worldbuilding/characters/first-major-arc-v0.3/yilan-tuoheng.md' 'docs/worldbuilding/characters/first-major-arc-v0.3/README.md'
git commit -m "docs: define Yilan Tuoheng performance card"
~~~

---

### Task 7: 建立韓澤人物演出卡

**Files:**
- Create: docs/worldbuilding/characters/first-major-arc-v0.3/hanze.md
- Modify: docs/worldbuilding/characters/first-major-arc-v0.3/README.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-24-ship-without-a-flag.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-27-route-everyone-can-stop.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-29-question-for-deep-ocean.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-30-first-deep-sea-license.md
- Read: src/chapter-one/content.ts
- Read: outputs/chapter-01-art-production-spec-v2.md

**Interfaces:**
- Consumes: 小說中已出現的資深移泊舵手、第二操作者、接舵及複誦職責；本角色沒有 v0.2 獨立卡。
- Produces: 韓澤第一份完整正史人物卡，不能只把他寫成昭黎的備用手或戰鬥前鋒。

- [ ] **Step 1: 固定韓澤的新增正史基準**

以下內容作為 v0.3 明確補完：

- 29 歲瀾國北灣人；資深移泊舵手，熟悉船塢、受損船、反向刻度及短距離事故操船。
- 章末接受第一航次第二操作者；職責是確認各席回答真的出現、在條件不成立時阻止啟動、昭黎漏接中止或離舵時實際接手。
- 公開目標是讓「後備」成為能真正中止與接手的職位，而不是替主操作者蓋章。
- 私人需要是被當作具有自身判斷的操作者，不是昭黎成熟的證明道具。
- 核心恐懼是所有人都以為有人會接手，實際上責任牌沒有任何人願意拿。
- 缺點是把能站住崗位當作可信度，受傷時傾向延後承認自己已不適任；第 24 幕接受彌菈中止是其成長起點。
- 戰鬥定位可保留火屬前鋒，但人物卡不得把玩法屬性當作性格。

- [ ] **Step 2: 寫入語氣、動作與關係限定**

固定演出：

- 語句短、偏覆核；他不替別人同意，只確認回答是否存在、條件是否完整。
- 不搶主角台詞；真正的重要動作是拿起／放下責任牌、封回操船牌、在中止成立時接舵。
- 受傷或壓力下先報方向、姓名、手部狀態及是否能操船，不以「沒事」帶過。
- 對昭黎保持同行操作者而非追隨者；對晏泠要求程序能落到實物；對賽芙拉接受盲核而不要求私人段；對彌菈會質疑但服從成立的醫療中止；對伊嵐要求把模型條件說成可複誦短句；對洛恩尊重岸本但不模仿導師位置；對晦岑只接受具體時間與退出條件。

- [ ] **Step 3: 加入校準範例與五類情境**

正確台詞：

- 「我不是替你點頭的人。我只確認回答是否真的出現。」
- 「回答完整。你可以下令，也可以選擇不下。」
- 「中止成立。舵交給我。」

錯誤台詞：

- 「昭黎說什麼，我就做什麼。」
- 「只是小傷，我死也不離舵。」
- 「我是第二操作者，所以其他席位先聽我的。」

五類情境：船塢移泊、帶傷自評、逐席覆誦、對主操作者中止、章末接受長期職務。

- [ ] **Step 4: 完成一致性檢查、索引、README 與提交**

檢查必須確認：不是橡皮圖章、不是無條件忠誠、能被醫療中止、接舵有條件、戰鬥火屬不取代職業人格。

~~~powershell
rg -n '^## ' 'docs/worldbuilding/characters/first-major-arc-v0.3/hanze.md'
rg -n '韓則|T[B]D|T[O]DO|待[補]' 'docs/worldbuilding/characters/first-major-arc-v0.3/hanze.md'
git diff --check -- 'docs/worldbuilding/characters/first-major-arc-v0.3/hanze.md' 'docs/worldbuilding/characters/first-major-arc-v0.3/README.md'
git add -- 'docs/worldbuilding/characters/first-major-arc-v0.3/hanze.md' 'docs/worldbuilding/characters/first-major-arc-v0.3/README.md'
git commit -m "docs: define Hanze performance card"
~~~

---

### Task 8: 建立洛恩人物演出卡

**Files:**
- Create: docs/worldbuilding/characters/first-major-arc-v0.3/luoen.md
- Modify: docs/worldbuilding/characters/first-major-arc-v0.3/README.md
- Read: docs/worldbuilding/characters/first-major-arc-v0.2/luoen.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-01-port-bell-old-flame.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-02-black-ship-returns.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-10-forty-seven-breaths.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-27-route-everyone-can-stop.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-30-first-deep-sea-license.md

**Interfaces:**
- Consumes: 折蘆船長、職業導師、獨立航誌及章末留岸正史。
- Produces: 洛恩以工作表達關心、維持反證及拒絕替昭黎回答的演出規則。

- [ ] **Step 1: 寫入洛恩的正史與人格核心**

固定：

- 46 歲瀾國沿岸資深引航救難員，折蘆船長。
- 公開目標是讓每班人能安全交班，事故判斷可被下一人理解、反對與接手。
- 對昭黎的需要是看他成為不必模仿自己的船長。
- 缺點是用工具、舵位及工作代替明說支持，保存原始紀錄時顯得不信任。
- 章末主動留岸保存獨立答案，不是膽怯、淘汰、父親替代或背棄。

- [ ] **Step 2: 寫入語氣、動作與關係限定**

固定演出：

- 句子短、實務、帶乾硬比喻；不長篇講哲理。
- 認可用交出半掌舵位、工具或單獨責任表示；反對時把紀錄留全，不替後輩擦除。
- 食指缺半截是可見身體特徵，但不得用作苦難裝飾；他用現有手部能力熟練完成工作。
- 對昭黎不替答；對晏泠交獨立紀錄；對賽芙拉不把救援當債；對彌菈尊重病歷；對伊嵐用實物校驗模型；對韓澤視為同業而非替代弟子；對晦岑要求歷史建議落成現場可交班項目。

- [ ] **Step 3: 加入校準範例與五類情境**

正確台詞：

- 「我會交自己的紀錄，不替他答。」
- 「先把能接手的人寫上去。」
- 「岸本已開，會記你每一次少問的地方。」

錯誤台詞：

- 「我一直把你當親生兒子。」
- 「你成功了，紀錄就不用留。」
- 「聽老人家的就對了。」

五類情境：日常帶教、讓出舵位、越權後拒絕護短、遠端反證、章末主動留岸。

- [ ] **Step 4: 完成一致性檢查、索引、README 與提交**

檢查涵蓋：是否只講哲理、是否無條件相信、是否父親化、是否替昭黎善後、留岸是否仍有主動價值。

~~~powershell
rg -n '^## ' 'docs/worldbuilding/characters/first-major-arc-v0.3/luoen.md'
rg -n 'T[B]D|T[O]DO|待[補]' 'docs/worldbuilding/characters/first-major-arc-v0.3/luoen.md'
git diff --check -- 'docs/worldbuilding/characters/first-major-arc-v0.3/luoen.md' 'docs/worldbuilding/characters/first-major-arc-v0.3/README.md'
git add -- 'docs/worldbuilding/characters/first-major-arc-v0.3/luoen.md' 'docs/worldbuilding/characters/first-major-arc-v0.3/README.md'
git commit -m "docs: define Luo'en performance card"
~~~

---

### Task 9: 建立晦岑人物演出卡

**Files:**
- Create: docs/worldbuilding/characters/first-major-arc-v0.3/huicen.md
- Modify: docs/worldbuilding/characters/first-major-arc-v0.3/README.md
- Read: docs/worldbuilding/characters/first-major-arc-v0.2/huicen.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-09-order-she-signed.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-21-false-chosen-one.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-26-three-dark-anchors.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-29-question-for-deep-ocean.md
- Read: docs/worldbuilding/first-major-arc-novel-v0.2/scene-30-first-deep-sea-license.md

**Interfaces:**
- Consumes: 固定錨建造史、海禁災難證詞、十九息上限、模型修正及非常駐顧問正史。
- Produces: 晦岑作為有限、可錯、可被中止的歷史見證者演出規則。

- [ ] **Step 1: 寫入晦岑的正史與人格核心**

固定：

- 218 歲，海禁災難時代的成年親歷者及最早固定錨建造參與者。
- 證詞有分量但無單獨決策權；章末只列歷史顧問，不常駐、不持有航線否決權。
- 目標是避免固定錨由救命工具反轉成追跡路徑。
- 恐懼是自己當年的正確救命選擇變成新災難；缺點是相信受控小步試驗並把不完整記憶當完整因果。
- 終局界域十九息是能力上限，十七息開始撤；不得出現「老人再撐一下」。

- [ ] **Step 2: 寫入語氣、動作與關係限定**

固定演出：

- 說歷史時標記「我親眼所見／我後來得知／我推測」；不用神祕警告代替因果。
- 語速穩、少搶話，當新證據推翻舊模型時公開修正。
- 不以高齡要求服從；接受彌菈的提前撤離與伊嵐的數據反駁。
- 對昭黎要求承認野心與代價；對晏泠把歷史風險交給現行程序；對賽芙拉不代表所有倖存者；對彌菈接受醫療退出；對伊嵐分享原始工法但標記記憶缺口；對韓澤提供可複誦時間；對洛恩認同保留岸本反證。

- [ ] **Step 3: 加入校準範例與五類情境**

正確台詞：

- 「我記得的是建造，不是今日的答案。」
- 「十九息後我的界域先失去方向。我必須退。」
- 「決定屬於持有各方，不屬於我的懷念。」

錯誤台詞：

- 「我活得最久，所以照我說的做。」
- 「古老預言早已說明一切。」
- 「再給我一息，我能替你們解決。」

五類情境：歷史作證、舊模型被推翻、制度要求他定奪、力量上限與撤退、章末拒絕導師位置。

- [ ] **Step 4: 完成一致性檢查、索引、README 與提交**

檢查涵蓋：是否全知、是否神祕導師化、是否用力量解決主角選擇、是否承認記憶缺口、是否真能被中止。

~~~powershell
rg -n '^## ' 'docs/worldbuilding/characters/first-major-arc-v0.3/huicen.md'
rg -n '惠岑|T[B]D|T[O]DO|待[補]' 'docs/worldbuilding/characters/first-major-arc-v0.3/huicen.md'
git diff --check -- 'docs/worldbuilding/characters/first-major-arc-v0.3/huicen.md' 'docs/worldbuilding/characters/first-major-arc-v0.3/README.md'
git add -- 'docs/worldbuilding/characters/first-major-arc-v0.3/huicen.md' 'docs/worldbuilding/characters/first-major-arc-v0.3/README.md'
git commit -m "docs: define Huicen performance card"
~~~

---

### Task 10: 全角色交叉一致性審查

**Files:**
- Modify if needed: docs/worldbuilding/characters/first-major-arc-v0.3/README.md
- Modify if needed: docs/worldbuilding/characters/first-major-arc-v0.3/zhaoli.md
- Modify if needed: docs/worldbuilding/characters/first-major-arc-v0.3/yanling.md
- Modify if needed: docs/worldbuilding/characters/first-major-arc-v0.3/saifula.md
- Modify if needed: docs/worldbuilding/characters/first-major-arc-v0.3/mila-sen.md
- Modify if needed: docs/worldbuilding/characters/first-major-arc-v0.3/yilan-tuoheng.md
- Modify if needed: docs/worldbuilding/characters/first-major-arc-v0.3/hanze.md
- Modify if needed: docs/worldbuilding/characters/first-major-arc-v0.3/luoen.md
- Modify if needed: docs/worldbuilding/characters/first-major-arc-v0.3/huicen.md

**Interfaces:**
- Consumes: 八張完成的 v0.3 人物卡。
- Produces: 可交給第二階段關係矩陣使用、名稱與權限無衝突的一致人物聖經。

- [ ] **Step 1: 檢查八卡結構完整**

執行以下非驗收靜態檢查：

~~~powershell
$characterRoot = 'docs/worldbuilding/characters/first-major-arc-v0.3'
$cards = @('zhaoli.md','yanling.md','saifula.md','mila-sen.md','yilan-tuoheng.md','hanze.md','luoen.md','huicen.md')
$requiredHeadings = @(
  '## 1. 正史基本資料',
  '## 2. 外觀與生活辨識',
  '## 3. 人格核心',
  '## 4. 價值順位與決策演算法',
  '## 5. 說話方式',
  '## 6. 身體與舞台演出',
  '## 7. 能力、權限與資訊邊界',
  '## 8. 面對其他七人的關係限定表現',
  '## 9. 六階段成長軸',
  '## 10. 禁止偏離',
  '## 11. 台詞校準',
  '## 12. 動作校準',
  '## 13. 五類情境演出',
  '## 14. 人物一致性檢查表',
  '## 15. 正史來源索引'
)
foreach ($card in $cards) {
  $text = Get-Content -Raw -Encoding UTF8 (Join-Path $characterRoot $card)
  foreach ($heading in $requiredHeadings) {
    if (-not $text.Contains($heading)) { Write-Output "$card missing $heading" }
  }
}
~~~

預期：沒有輸出。若有輸出，補回缺少章節與實際內容，不能只加空標題。

- [ ] **Step 2: 檢查姓名、年齡及職權**

逐卡確認：

- 昭黎 22、晏泠 24、彌菈 30、伊嵐 30、韓澤 29、洛恩 46、晦岑 218。
- 賽芙拉三層年齡分開。
- 晏泠無航照及事故單獨審批權。
- 彌菈保留緊急醫療與全船中止權。
- 賽芙拉保留情報、主船、艙室與離船權。
- 伊嵐保留模型降速權。
- 韓澤能真正阻止啟動及接舵。
- 洛恩保留岸上反證。
- 晦岑無單獨決策及航線否決權。

執行：

~~~powershell
rg -n '伊蘭|韓則|惠岑|T[B]D|T[O]DO|待[補]|之後[補]|另行[補]' 'docs/worldbuilding/characters/first-major-arc-v0.3'
git diff --check -- 'docs/worldbuilding/characters/first-major-arc-v0.3'
~~~

預期：搜尋沒有結果，格式檢查沒有錯誤。

- [ ] **Step 3: 檢查角色可區分性**

建立八人對照表並逐項核對，對照表至少包含：

- 壓力下句長。
- 最常用的證據類型。
- 第一個外顯動作。
- 拒絕方式。
- 道歉／修復方式。
- 最容易犯的錯。
- 絕不跨越的職權。

任何兩人若六項中有四項以上寫法相同，回到人物卡改成可觀察且符合正史的差異，避免所有人都只會「冷靜地指出風險」。

- [ ] **Step 4: 將 README 狀態全部改為完成並提交**

README 八列狀態改為「已完成 v0.3 初稿」，加入「下一階段：relationship-matrix.md 與六份 scene-states」但不建立那些檔案。

~~~powershell
git add -- 'docs/worldbuilding/characters/first-major-arc-v0.3'
git commit -m "docs: complete first arc performance bible"
~~~

---

### Task 11: 推送並完成遠端 QA

**Files:**
- No repository content changes unless remote QA exposes a real issue.

**Interfaces:**
- Consumes: 已提交的 README 與八張人物卡。
- Produces: GitHub Actions run URL、部署 commit SHA、固定 Pages URL 與遠端 QA 結果。

- [ ] **Step 1: 確認提交範圍**

~~~powershell
git status --short --branch
git log --oneline --decorate -12
~~~

預期：只有使用者既有的 art-drop/chapter01/ 保持未追蹤；人物聖經及本計畫均已提交，沒有其他未預期變更。

- [ ] **Step 2: 推送目前分支**

~~~powershell
git push origin codex/add-world-bible
~~~

預期：push 成功，Remote QA - GitHub Pages 因 push 自動啟動。

- [ ] **Step 3: 取得並等待對應工作流**

~~~powershell
$deployedSha = git rev-parse HEAD
$run = gh run list --workflow 'qa-pages.yml' --commit $deployedSha --limit 1 --json databaseId,url,headSha,status,conclusion | ConvertFrom-Json
$run
gh run watch $run.databaseId --exit-status
~~~

預期：headSha 等於 deployedSha，工作流 conclusion 為 success。若沒有立即找到 run，短暫重新查詢同一 commit；不得改用本機測試或伺服器。

- [ ] **Step 4: 遠端 Pages 靜態確認**

只使用固定網址：

~~~text
https://lialialialia1211-debug.github.io/astra-voyage-slice/
~~~

確認 Pages 可開啟且工作流 smoke check 成功。人物聖經是文件交付，本階段不宣稱遊戲人物已更新。

- [ ] **Step 5: 提交完成報告**

報告必須包含：

- v0.3 人物聖經目錄的完整本機連結。
- 八張人物卡完成清單及明確年齡。
- 本階段未修改的範圍：遊戲程式、三十幕台詞、v0.2、art-drop。
- 固定 Pages URL。
- GitHub Actions run URL。
- 部署 commit SHA。
- 遠端 QA 結果。
- 下一階段是 28 組人物關係矩陣及六份三十幕狀態表，等待使用者審閱人物卡後再開始。
