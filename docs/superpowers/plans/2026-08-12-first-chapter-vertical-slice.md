# 第一章第1–2幕＋戰鬥1垂直切片 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 將新版唯一正史入口接入現有網頁 RPG，完成成年確認後的第1幕、第2幕、六屬性主手準備及兩人教學戰鬥1，且美術全缺時仍可在遠端完整遊玩。

**Architecture:** 新版第一章建立獨立 `src/chapter-one/` 內容包與 v3 章節狀態，舊內容暫留但不再作為新玩家入口。戰鬥引擎改為依 `contentSet` 解析舊版或第一章定義，避免複製第二套引擎；AVG 與美術透過穩定 Asset ID、三人舞台及 fallback 呈現。

**Tech Stack:** React 19、TypeScript 7、Zod 4、Vitest、Testing Library、Vite、GitHub Actions、GitHub Pages。

## Global Constraints

- 唯一正史來源：`docs/worldbuilding/first-major-arc-novel-v0.2/scene-01-port-bell-old-flame.md` 與 `scene-02-black-ship-returns.md`。
- 正史顯示名：昭黎、晏泠、洛恩；素材 ID 使用 `zhaoli`、`yanling`、`luoen`。
- 固定主角昭黎，不顯示男女艦長選擇。
- 保留既有 RPG 引擎；不得新增第二套獨立戰鬥規則。
- B1 固定昭黎＋洛恩兩人，首通0 AP、重播5 AP、戰敗全退。
- 昭黎元素由六屬性入門主手決定，戰鬥中不可切換。
- 美術與音訊可以全部缺少，但不得造成破圖、白畫面或流程中斷。
- 不新增依賴。
- 不在本機執行 unit、integration、E2E、art validation、production build 或本機伺服器。
- 所有紅燈與綠燈證據都由 `Remote QA - GitHub Pages` 提供。
- 遠端瀏覽器 QA 只使用 `https://lialialialia1211-debug.github.io/astra-voyage-slice/`。

---

## File Structure

### 新增

- `src/chapter-one/types.ts`：第一章人物、場景、劇本命令、武器與遭遇型別。
- `src/chapter-one/content.ts`：昭黎、晏泠、洛恩、第1–2幕、六把入門主手與 B1 定義。
- `src/chapter-one/content.test.ts`：第一章內容完整性與成年設定測試。
- `src/chapter-one/flow.ts`：線性節點、首通／重播 AP 與下一節點純函式。
- `src/chapter-one/flow.test.ts`：節點與 AP 規則測試。
- `src/features/audio/audio-controller.ts`：BGM、環境音、SFX 與四組音量控制。
- `src/features/audio/audio-controller.test.ts`：缺檔靜默及音量計算測試。
- `src/features/story/AssetArtwork.tsx`：圖片存在時顯示圖片，不存在時顯示同尺寸 fallback。
- `src/features/chapter/ChapterPrepScreen.tsx`：六屬性入門主手選擇與 B1 開始畫面。
- `src/features/chapter/ChapterMilestoneScreen.tsx`：垂直切片完成與重播入口。

### 修改

- `src/domain/types.ts`：加入可注入戰鬥內容的泛型 ID，不改壞舊 `CharacterId`。
- `src/features/battle/types.ts`：加入 `contentSet`、章節角色 ID、元素覆寫。
- `src/features/battle/engine.ts`：依 `contentSet` 解析定義，支援兩人隊與昭黎元素覆寫。
- `src/features/battle/BattleScreen.tsx`：支援新版 B1、缺圖 fallback 及教學步驟。
- `src/features/battle/ResultsScreen.tsx`：支援第一章戰果與里程碑分流。
- `src/game/initial-state.ts`：升級為 v3 並加入 `chapterOne`、音訊與劇情設定。
- `src/game/reducer.ts`：加入第一章逐句、完成幕、選武器、開始／完成 B1、重播行為。
- `src/game/storage.ts`：v1／v2 → v3 安全遷移及 v3 schema。
- `src/features/story/StoryScreen.tsx`：同時解析新版與舊版故事，改為保存台詞索引、三人同台與 backlog。
- `src/features/onboarding/AdultGate.tsx`：確認後由 reducer 直接進第1幕。
- `src/app/App.tsx`：加入章節準備與里程碑畫面，舊艦長選擇不再可達。
- `src/app/app.css`：三人舞台、fallback、準備畫面與 B1 教學樣式。
- `src/app/App.test.tsx`：新入口整合測試。
- `src/features/story/StoryScreen.test.tsx`：新版 AVG 行為測試。
- `src/features/battle/engine.test.ts`：兩人隊與元素覆寫測試。
- `src/features/battle/BattleScreen.test.tsx`：B1 教學整合測試。
- `src/game/reducer.test.ts`：第一章流程測試。
- `src/game/storage.test.ts`：v3 round-trip 與舊存檔遷移測試。
- `README.md`：更新目前可玩入口與第一里程碑狀態。

---

### Task 1: 第一章內容包與線性流程

**Files:**
- Create: `src/chapter-one/types.ts`
- Create: `src/chapter-one/content.ts`
- Create: `src/chapter-one/content.test.ts`
- Create: `src/chapter-one/flow.ts`
- Create: `src/chapter-one/flow.test.ts`
- Modify: `src/domain/types.ts`

**Interfaces:**
- Produces: `ChapterActorId`, `ChapterSceneId`, `StarterWeaponId`, `ChapterEncounterId`, `ChapterStoryScene`, `ChapterProgress`。
- Produces: `chapterOneContent` 與 `nextChapterNode(progress)`、`chapterBattleApCost(progress, encounterId)`。
- Consumes: 既有 `Element`、`SkillDefinition`、`CharacterDefinition` 與 `EnemyDefinition`。

- [ ] **Step 1: 寫入內容與流程失敗測試**

```ts
it('contains the approved first vertical slice', () => {
  expect(chapterOneContent.scenes.map((scene) => scene.id)).toEqual([
    'ch01_scene_01_port_bell',
    'ch01_scene_02_black_ship',
  ]);
  expect(chapterOneContent.encounters[0]).toMatchObject({
    id: 'ch01_b01_outer_bay_rescue',
    fixedPartyIds: ['zhaoli', 'luoen'],
  });
  expect(chapterOneContent.actors.every((actor) => actor.age >= 18)).toBe(true);
  expect(chapterOneContent.starterWeapons.map((weapon) => weapon.element)).toEqual([
    'fire', 'water', 'earth', 'wind', 'light', 'dark',
  ]);
});

it('routes scene 1 to scene 2 and scene 2 to battle prep', () => {
  expect(nextChapterNode('scene-1')).toBe('scene-2');
  expect(nextChapterNode('scene-2')).toBe('battle-1-prep');
});
```

- [ ] **Step 2: 推送紅燈測試到遠端**

```powershell
git add -- src/chapter-one src/domain/types.ts
git commit -m "test: define first chapter vertical slice"
git push origin HEAD:codex/web-slice
gh run list --workflow qa-pages.yml --branch codex/web-slice --limit 1
```

Expected: `Remote QA - GitHub Pages` 在 TypeScript／Vitest 階段失敗，錯誤指出第一章模組或匯出尚不存在。

- [ ] **Step 3: 建立第一章型別**

```ts
export type ChapterActorId = 'zhaoli' | 'yanling' | 'luoen';
export type ChapterSceneId = 'ch01_scene_01_port_bell' | 'ch01_scene_02_black_ship';
export type ChapterEncounterId = 'ch01_b01_outer_bay_rescue';
export type StarterWeaponId =
  | 'wpn_fire_01' | 'wpn_water_01' | 'wpn_earth_01'
  | 'wpn_wind_01' | 'wpn_light_01' | 'wpn_dark_01';
export type ChapterNodeId = 'scene-1' | 'scene-2' | 'battle-1-prep' | 'battle-1' | 'milestone-complete';
```

`ChapterStoryLine` 必須包含 `speakerId`、`text`、`expression`、`actors`、可選 `backgroundAssetId`、`cgAssetId` 與 `audio`。`actors` 是最多三筆的 `{ actorId, position: 'left' | 'center' | 'right', expression }`。

為避免新 ID 迫使舊存檔立即擴張，既有戰鬥定義改為泛型：

```ts
export interface CharacterDefinition<Id extends string = CharacterId> {
  id: Id;
  // 其餘欄位維持既有定義
}

export interface EncounterDefinition<Id extends string = EncounterId> {
  id: Id;
  // 其餘欄位維持既有定義
}
```

- [ ] **Step 4: 寫入第1–2幕 AVG 改編與 B1 定義**

第1幕至少24句，依序涵蓋拖纜檢查、洛恩交舵、三船衝突、責任紀錄、晏泠重逢及外灣出勤。第2幕至少24句，依序涵蓋三燈轉紅、長鐘、黑船現身、四號線封閉、利益衝突紀錄及救生艇生還者。不得新增改變正史結果的選項。

```ts
export const chapterOneContent = {
  actors: [zhaoli, yanling, luoen],
  scenes: [scene01, scene02],
  starterWeapons,
  encounters: [outerBayRescue],
} as const;
```

- [ ] **Step 5: 實作純流程函式**

```ts
export function nextChapterNode(current: ChapterNodeId): ChapterNodeId {
  if (current === 'scene-1') return 'scene-2';
  if (current === 'scene-2') return 'battle-1-prep';
  if (current === 'battle-1-prep') return 'battle-1';
  if (current === 'battle-1') return 'milestone-complete';
  return 'milestone-complete';
}

export function chapterBattleApCost(completedBattles: readonly ChapterEncounterId[]): 0 | 5 {
  return completedBattles.includes('ch01_b01_outer_bay_rescue') ? 5 : 0;
}
```

- [ ] **Step 6: 推送綠燈並確認遠端通過**

```powershell
git add -- src/chapter-one src/domain/types.ts
git diff --cached --check
git commit -m "feat: add first chapter content package"
git push origin HEAD:codex/web-slice
$run = gh run list --workflow qa-pages.yml --branch codex/web-slice --limit 1 --json databaseId | ConvertFrom-Json | Select-Object -First 1
gh run watch $run.databaseId --exit-status
```

Expected: unit／integration tests、TypeScript 與 production build 全部成功，Pages 部署完成。

---

### Task 2: v3 存檔與章節 reducer

**Files:**
- Modify: `src/game/initial-state.ts`
- Modify: `src/game/reducer.ts`
- Modify: `src/game/storage.ts`
- Modify: `src/game/reducer.test.ts`
- Modify: `src/game/storage.test.ts`

**Interfaces:**
- Consumes: `ChapterProgress`、`ChapterSceneId`、`ChapterEncounterId`、`StarterWeaponId`。
- Produces: `GameState.version: 3` 與 `GameState.chapterOne`。
- Produces actions: `ADVANCE_CHAPTER_LINE`、`RETREAT_CHAPTER_LINE`、`COMPLETE_CHAPTER_SCENE`、`SELECT_STARTER_WEAPON`、`START_CHAPTER_BATTLE`、`SAVE_CHAPTER_BATTLE_SNAPSHOT`、`FINISH_CHAPTER_BATTLE`、`REPLAY_CHAPTER_SCENE`。

- [ ] **Step 1: 寫入 reducer 與 storage 失敗測試**

```ts
it('starts fixed-protagonist scene one after adult confirmation', () => {
  const state = gameReducer(createInitialState(0), { type: 'CONFIRM_ADULT' });
  expect(state.version).toBe(3);
  expect(state.screen).toBe('story');
  expect(state.chapterOne.currentNode).toBe('scene-1');
  expect(state.chapterOne.activeLineIndex).toBe(0);
});

it('makes the first chapter battle free and refunds replay AP on defeat', () => {
  const first = gameReducer(chapterPrepState(), { type: 'START_CHAPTER_BATTLE', now: 0 });
  expect(first.ap.current).toBe(30);
  const replay = gameReducer(completedBattlePrepState(), { type: 'START_CHAPTER_BATTLE', now: 0 });
  expect(replay.ap.current).toBe(25);
  const defeated = gameReducer(replay, { type: 'FINISH_CHAPTER_BATTLE', result: 'defeat', flags: [] });
  expect(defeated.ap.current).toBe(30);
});

it('migrates v2 settings but resets legacy story progress', () => {
  const result = repositoryFromV2({ adultMode: 'fade', firstClears: ['land_01_port_defense'] }).load();
  expect(result.state.version).toBe(3);
  expect(result.state.adultMode).toBe('fade');
  expect(result.state.chapterOne.currentNode).toBe('scene-1');
  expect(result.state.chapterOne.completedScenes).toEqual([]);
});
```

- [ ] **Step 2: 推送紅燈並確認遠端測試失敗**

```powershell
git add -- src/game
git commit -m "test: define chapter one save flow"
git push origin HEAD:codex/web-slice
$run = gh run list --workflow qa-pages.yml --branch codex/web-slice --limit 1 --json databaseId | ConvertFrom-Json | Select-Object -First 1
gh run watch $run.databaseId --exit-status
```

Expected: reducer/storage tests fail because v3 chapter state and actions are absent.

- [ ] **Step 3: 建立 v3 初始狀態**

```ts
chapterOne: {
  currentNode: 'scene-1',
  activeSceneId: 'ch01_scene_01_port_bell',
  activeLineIndex: 0,
  completedScenes: [],
  completedBattles: [],
  selectedStarterWeaponId: 'wpn_water_01',
  activeEncounterId: null,
  paidAp: 0,
  tutorialStep: 'attack',
  battleSnapshot: null,
  lastResult: null,
}
```

另加入 `storySettings`（auto、allowUnreadFastForward、textSpeed）與 `audioSettings`（master、bgm、ambience、sfx），音量初值皆為1。

- [ ] **Step 4: 實作章節 reducer**

`CONFIRM_ADULT` 直接設定 `screen: 'story'`，不再前往 `captain-select`。完成第1幕後切換第2幕並將台詞索引歸零；完成第2幕後前往 `chapter-prep`。`START_CHAPTER_BATTLE` 依首通狀態扣0或5 AP並建立戰前檢查點；戰敗全額退還 `paidAp`，勝利記錄 B1 並前往 `results`。

- [ ] **Step 5: 實作 v1／v2 → v3 遷移**

保留 `adultConfirmed`、`adultMode`、AP、補給劑及可解析設定；丟棄舊 captain、舊角色、舊關卡、舊劇情與舊收藏進度。`saveKey` 維持 `astra-save-v1`，以內部 `version` 判斷資料版本，避免瀏覽器留下兩份互相競爭的存檔。

- [ ] **Step 6: 推送綠燈並確認遠端通過**

```powershell
git add -- src/game
git diff --cached --check
git commit -m "feat: add chapter one v3 save flow"
git push origin HEAD:codex/web-slice
$run = gh run list --workflow qa-pages.yml --branch codex/web-slice --limit 1 --json databaseId | ConvertFrom-Json | Select-Object -First 1
gh run watch $run.databaseId --exit-status
```

Expected: 全部 reducer/storage 測試、TypeScript、build 與部署成功。

---

### Task 3: 三人 AVG、fallback 與音訊控制

**Files:**
- Create: `src/features/story/AssetArtwork.tsx`
- Create: `src/features/audio/audio-controller.ts`
- Create: `src/features/audio/audio-controller.test.ts`
- Modify: `src/features/story/StoryScreen.tsx`
- Modify: `src/features/story/StoryScreen.test.tsx`
- Modify: `src/app/app.css`

**Interfaces:**
- Consumes: `GameState.chapterOne.activeSceneId`、`activeLineIndex`、`chapterOneContent.scenes`。
- Produces: `AssetArtwork({ assetId, alt, fallbackLabel, className })`。
- Produces: `createAudioController(audioFactory)`，方法為 `setVolumes`、`playBgm`、`playAmbience`、`playSfx`、`stopAll`。

- [ ] **Step 1: 寫入 AVG 與音訊失敗測試**

```tsx
it('shows the canonical protagonist and never opens captain selection', async () => {
  renderAtChapterScene('ch01_scene_01_port_bell');
  expect(screen.getByRole('heading', { name: '港鐘與舊情' })).toBeVisible();
  expect(screen.getByText('昭黎')).toBeVisible();
  expect(screen.queryByText('選擇遠征艦長')).not.toBeInTheDocument();
});

it('renders up to three actor slots and highlights the current speaker', () => {
  renderAtChapterLineWithThreeActors();
  expect(screen.getAllByTestId('story-actor')).toHaveLength(3);
  expect(screen.getByTestId('story-actor-current')).toHaveTextContent('晏泠');
});

it('keeps missing audio silent', async () => {
  const controller = createAudioController(() => { throw new Error('missing'); });
  await expect(controller.playBgm('/missing.ogg')).resolves.toBeUndefined();
});
```

- [ ] **Step 2: 推送紅燈並確認遠端失敗**

```powershell
git add -- src/features/story src/features/audio src/app/app.css
git commit -m "test: define chapter one AVG presentation"
git push origin HEAD:codex/web-slice
$run = gh run list --workflow qa-pages.yml --branch codex/web-slice --limit 1 --json databaseId | ConvertFrom-Json | Select-Object -First 1
gh run watch $run.databaseId --exit-status
```

Expected: StoryScreen/fallback/audio tests fail because新版元件與 controller 尚未存在。

- [ ] **Step 3: 實作 `AssetArtwork`**

```tsx
const url = userAssetUrl(assetId);
return url
  ? <img alt={alt} className={className} src={url} />
  : <div aria-label={alt} className={`${className} asset-fallback`} role="img">
      <span>{fallbackLabel}</span><small>{assetId}</small>
    </div>;
```

- [ ] **Step 4: 改造 StoryScreen**

新版故事分支從章節狀態取得台詞索引，不使用本地 `useState` 保存進度。畫面同時渲染 `line.actors` 的左、中、右三個位置；說話者套用 `is-current`，其他角色套用 `is-listening`。上一句不得小於0，下一句在最後一行發出 `COMPLETE_CHAPTER_SCENE`。Backlog 顯示從第0行到當前行的全部內容。

- [ ] **Step 5: 實作音訊 controller**

音量計算為 `master × channel`。BGM 換曲時，舊音軌在300ms內降至0並停止，新音軌由0升至目標音量；任何 `Audio` 建立或 `play()` 失敗都捕捉並靜默處理。StoryScreen 只傳 Asset ID 經 Manifest 解析後的 URL，不在劇本寫死網址。

- [ ] **Step 6: 加入 AVG 與 fallback 樣式**

三個人物位置分別使用 `left: 4%`、`left: 50%`、`right: 4%`，中央以 `translateX(-50%)` 對齊。`is-current` 使用亮度1、縮放1.03、較高 z-index；`is-listening` 使用亮度0.58。fallback 必須與正式立繪占用相同容器。

- [ ] **Step 7: 推送綠燈並確認遠端通過**

```powershell
git add -- src/features/story src/features/audio src/app/app.css
git diff --cached --check
git commit -m "feat: add chapter one AVG presentation"
git push origin HEAD:codex/web-slice
$run = gh run list --workflow qa-pages.yml --branch codex/web-slice --limit 1 --json databaseId | ConvertFrom-Json | Select-Object -First 1
gh run watch $run.databaseId --exit-status
```

Expected: AVG、音訊、既有測試、TypeScript、build 與部署全部成功。

---

### Task 4: 六屬性準備、兩人 B1 與入口整合

**Files:**
- Create: `src/features/chapter/ChapterPrepScreen.tsx`
- Create: `src/features/chapter/ChapterMilestoneScreen.tsx`
- Modify: `src/features/battle/types.ts`
- Modify: `src/features/battle/engine.ts`
- Modify: `src/features/battle/engine.test.ts`
- Modify: `src/features/battle/BattleScreen.tsx`
- Modify: `src/features/battle/BattleScreen.test.tsx`
- Modify: `src/features/battle/ResultsScreen.tsx`
- Modify: `src/app/App.tsx`
- Modify: `src/app/App.test.tsx`
- Modify: `src/app/app.css`
- Modify: `README.md`

**Interfaces:**
- Consumes: `chapterOneContent.starterWeapons`、`chapterOneContent.encounters`、v3 chapter actions。
- Produces: `BattleState.contentSet: 'legacy' | 'chapter-one'`。
- Produces: `CreateBattleInput.elementOverrides?: Readonly<Record<string, Element>>`。
- Produces: `BattleContentSource` lookup，讓 `createBattle`、`useSkill`、`resolveTurn` 使用同一引擎。

```ts
type BattleActorId = CharacterId | ChapterActorId;
type BattleEncounterId = EncounterId | ChapterEncounterId;

interface BattleContentSource {
  characters: readonly CharacterDefinition<BattleActorId>[];
  encounters: readonly EncounterDefinition<BattleEncounterId>[];
}
```

- [ ] **Step 1: 寫入戰鬥與入口失敗測試**

```ts
it('creates the first chapter battle with two fixed actors', () => {
  const battle = createBattle({
    contentSet: 'chapter-one',
    encounterId: 'ch01_b01_outer_bay_rescue',
    partyIds: ['zhaoli', 'luoen'],
    elementOverrides: { zhaoli: 'fire' },
    loadoutAttack: 0,
    loadoutHp: 0,
    summonId: null,
  });
  expect(battle.party).toHaveLength(2);
  expect(battle.party[0]).toMatchObject({ id: 'zhaoli', element: 'fire' });
});
```

```tsx
it('runs adult gate to the first canonical scene', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: '我已年滿 18 歲' }));
  expect(screen.getByRole('heading', { name: '港鐘與舊情' })).toBeVisible();
  expect(screen.queryByRole('heading', { name: '選擇遠征艦長' })).not.toBeInTheDocument();
});
```

- [ ] **Step 2: 推送紅燈並確認遠端失敗**

```powershell
git add -- src/features/chapter src/features/battle src/app README.md
git commit -m "test: define first chapter battle integration"
git push origin HEAD:codex/web-slice
$run = gh run list --workflow qa-pages.yml --branch codex/web-slice --limit 1 --json databaseId | ConvertFrom-Json | Select-Object -First 1
gh run watch $run.databaseId --exit-status
```

Expected: engine、router 與 UI 測試失敗，指出 chapter-one contentSet、準備畫面或新版入口尚未實作。

- [ ] **Step 3: 讓戰鬥引擎解析兩套內容**

新增純函式：

```ts
function battleContentFor(contentSet: BattleState['contentSet']): BattleContentSource {
  return contentSet === 'chapter-one' ? chapterOneBattleContent : legacyBattleContent;
}
```

`createBattle` 不再要求四名角色，只要求至少一名；四人限制仍留在正式編隊與舊 `START_STAGE`。角色元素在建立 BattleActor 時套用 `elementOverrides?.[id] ?? character.element`，不修改角色靜態定義。

- [ ] **Step 4: 建立六屬性準備畫面**

顯示六張入門主手卡，卡面不存在時使用元素色 fallback。選擇後 dispatch `SELECT_STARTER_WEAPON`，按「開始救援」dispatch `START_CHAPTER_BATTLE`。畫面明確顯示固定隊伍「昭黎／洛恩」及首通0 AP或重播5 AP。

- [ ] **Step 5: 建立 B1 教學與戰果分流**

B1 第1回合訊息為「選擇全隊攻擊，昭黎與洛恩會依序行動」；完成第一次攻擊後訊息說明敵方回合與 HP；勝利顯示正史繼續但第3幕尚未實裝，戰敗按鈕回到 `chapter-prep` 並已退還 AP。B1 不顯示尚未教學的技能、奧義、全隊防禦與舟域援護按鈕。

- [ ] **Step 6: 更新 App 入口與 README**

`GameRouter` 加入 `chapter-prep` 與 `chapter-milestone`。`captain-select` 元件保留於共存期，但新存檔與 v3 遷移後沒有任何 action 導向它。README 將目前入口改為固定昭黎與垂直切片，舊63張素材標示為共存期舊原型資產。

- [ ] **Step 7: 推送綠燈並確認遠端通過**

```powershell
git add -- src/features/chapter src/features/battle src/app src/game README.md
git diff --cached --check
git commit -m "feat: ship first chapter vertical slice"
git push origin HEAD:codex/web-slice
$run = gh run list --workflow qa-pages.yml --branch codex/web-slice --limit 1 --json databaseId | ConvertFrom-Json | Select-Object -First 1
gh run watch $run.databaseId --exit-status
```

Expected: 遠端測試、TypeScript、production build 及 Pages 部署成功。

---

### Task 5: 遠端瀏覽器驗收與交付

**Files:**
- Modify only if remote QA exposes a defect.

**Interfaces:**
- Consumes: 固定 Pages URL 與成功部署 SHA。
- Produces: 可重現的遠端 QA 結果與下一批美術匯入界面。

- [ ] **Step 1: 核對 Actions 結果與部署 SHA**

```powershell
$run = gh run list --workflow qa-pages.yml --branch codex/web-slice --limit 1 --json databaseId | ConvertFrom-Json | Select-Object -First 1
gh run view $run.databaseId --json status,conclusion,url,headSha,headBranch
git ls-remote --heads origin codex/web-slice
```

Expected: `status=completed`、`conclusion=success`，run `headSha` 與遠端 QA 分支 SHA 相同。

- [ ] **Step 2: 只在固定 Pages URL 執行人工流程**

驗收路徑：成年確認 → 第1幕逐句 → 上一句 → 對話紀錄 → 完成第1幕 → 完成第2幕 → 選火屬主手 → B1 全隊攻擊 → 勝利 → 里程碑畫面。

檢查：

- 不出現男女艦長選擇。
- 缺圖 fallback 沒有破圖圖示。
- 三人站位不壓住對話框。
- 重整後回到最近台詞或戰鬥快照。
- 昭黎在 B1 顯示選定元素。
- B1 只有目前教學允許的按鈕。
- 勝利後可重播，且顯示5 AP。

- [ ] **Step 3: 若發現問題，依遠端證據修正並重新推送**

每次修正先新增或更新能重現問題的測試，推送紅燈確認，再提交最小修正並重新跑 `Remote QA - GitHub Pages`。不得改用本機測試或本機瀏覽器。

- [ ] **Step 4: 完成交付回報**

回報必須包含：

- 設計規格與實作計畫路徑。
- 主要程式檔路徑。
- 固定 Pages URL。
- GitHub Actions run URL。
- 部署 commit SHA。
- 遠端 QA 結果。
- 美術方後續只需提供完整資料夾絕對路徑，無需逐檔傳送。
