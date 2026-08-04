# Land Expedition Chapter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved four-node land chapter with story scenes, regenerating AP, deterministic farming rewards, Lv.1–10 character and weapon growth, defeat refunds, v1 save migration, and the existing tidal boss as the unlocked sea route.

**Architecture:** Keep authored content in `src/content`, transactional rules in pure expedition and growth modules, and state transitions in the reducer. React screens render the map, story, growth, loadout, battle, and results from GameState; the save repository migrates v1 input into a validated v2 state before rendering.

**Tech Stack:** React 19.2.8, TypeScript 7.0.2, Zod 4.4.3, Vitest 4.1.10, Testing Library 16.3.2, Playwright 1.62.1, Vite 8.2.0.

## Global Constraints

- Work directly on the existing `codex/web-slice` branch because the user explicitly requested the lightweight workflow without another worktree or PR.
- Use Traditional Chinese for all user-facing text.
- Keep the project frontend-only with local save data; add no backend, account, payment, daily-task, shop, auto-repeat, random-affix, or limit-break systems.
- Use the existing 63 user art assets and generated UI backgrounds; no new art is required.
- Keep adult collection content optional and mechanically separate from story progression and combat stats.
- Preserve v1 relation, gallery, party, roster, loadout, and captain data during migration.
- Follow red-green-refactor for every production behavior.
- Verify 1280×720, 1440×810, and 1920×1080 desktop flows before completion.

---

### Task 1: Expedition content registry

**Files:**
- Modify: `src/domain/types.ts`
- Modify: `src/domain/schemas.ts`
- Modify: `src/content/encounters.ts`
- Modify: `src/content/index.ts`
- Create: `src/content/stages.ts`
- Create: `src/content/stories.ts`
- Create: `src/content/expedition-content.test.ts`

**Interfaces:**
- Produces `StageId`, `StorySceneId`, `RewardBundle`, `StageDefinition`, `StoryLineDefinition`, and `StorySceneDefinition`.
- Produces `content.stages` with four nodes and `content.stories` with eight scenes.
- Expands `EncounterId` with `enc_surface_ruins`, `enc_orbital_outpost`, and `enc_leyline_core`.

- [x] **Step 1: Write the failing content tests**

```ts
it('defines the approved linear land route and deterministic rewards', () => {
  expect(content.stages.map((stage) => stage.id)).toEqual([
    'land_01_port_defense',
    'land_02_surface_ruins',
    'land_03_orbital_outpost',
    'land_04_leyline_core',
  ]);
  expect(content.stages.map((stage) => stage.apCost)).toEqual([5, 5, 5, 10]);
  expect(content.stages[3].clearRewards.leylineCore).toBe(1);
  expect(content.stories).toHaveLength(8);
});

it('validates every authored registry entry', () => {
  expect(() => contentRegistrySchema.parse(content)).not.toThrow();
});
```

- [x] **Step 2: Run the focused test and verify RED**

Run: `pnpm test -- src/content/expedition-content.test.ts`

Expected: FAIL because `content.stages`, `content.stories`, and the new encounter IDs do not exist.

- [x] **Step 3: Add exact content types and records**

```ts
export type StageId =
  | 'land_01_port_defense'
  | 'land_02_surface_ruins'
  | 'land_03_orbital_outpost'
  | 'land_04_leyline_core';

export type StorySceneId =
  | 'story_land_01_pre' | 'story_land_01_post'
  | 'story_land_02_pre' | 'story_land_02_post'
  | 'story_land_03_pre' | 'story_land_03_post'
  | 'story_land_04_pre' | 'story_land_04_post';

export interface RewardBundle {
  expeditionPoints: number;
  surfaceAlloy: number;
  ruinChip: number;
  leylineCore: number;
  fieldRation: number;
}

export interface StageDefinition {
  id: StageId;
  name: string;
  summary: string;
  encounterId: EncounterId;
  apCost: 5 | 10;
  prerequisite: StageId | null;
  preStoryId: StorySceneId;
  postStoryId: StorySceneId;
  clearRewards: RewardBundle;
  firstClearRewards: RewardBundle;
}
```

Populate the four stage records with the exact reward table in the approved design. Add the three encounter definitions using the existing enemy asset IDs. Add eight authored story scenes with complete Traditional Chinese dialogue, captain portrait tokens, role positions, and character expression asset IDs.

- [x] **Step 4: Run content tests and verify GREEN**

Run: `pnpm test -- src/content/expedition-content.test.ts src/content/index.test.ts`

Expected: PASS with five Encounter records, four Stage records, and eight Story records accepted by Zod.

- [x] **Step 5: Commit the content layer**

```powershell
git add src/domain src/content
git commit -m "feat: define land expedition content"
```

---

### Task 2: AP and route progression rules

**Files:**
- Create: `src/features/expedition/progression.ts`
- Create: `src/features/expedition/progression.test.ts`

**Interfaces:**
- Consumes `StageDefinition`, `StageId`, and `RewardBundle` from Task 1.
- Produces `syncAp(ap, now)`, `isStageUnlocked(stage, firstClears)`, `addRewards(inventory, rewards)`, and `emptyRewards()`.

- [x] **Step 1: Write failing progression tests**

```ts
it('restores one AP per five minutes while preserving partial elapsed time', () => {
  expect(syncAp({ current: 20, lastRecoveredAt: 1_000 }, 601_000)).toEqual({
    current: 22,
    lastRecoveredAt: 601_000,
  });
  expect(syncAp({ current: 20, lastRecoveredAt: 1_000 }, 151_000)).toEqual({
    current: 20,
    lastRecoveredAt: 1_000,
  });
});

it('caps AP at 30 and rejects clock rollback', () => {
  expect(syncAp({ current: 29, lastRecoveredAt: 1_000 }, 901_000)).toEqual({ current: 30, lastRecoveredAt: 901_000 });
  expect(syncAp({ current: 12, lastRecoveredAt: 1_000 }, 500)).toEqual({ current: 12, lastRecoveredAt: 1_000 });
});

it('unlocks only the first stage or a stage whose prerequisite is cleared', () => {
  expect(isStageUnlocked(content.stages[0], [])).toBe(true);
  expect(isStageUnlocked(content.stages[1], [])).toBe(false);
  expect(isStageUnlocked(content.stages[1], ['land_01_port_defense'])).toBe(true);
});
```

- [x] **Step 2: Run focused tests and verify RED**

Run: `pnpm test -- src/features/expedition/progression.test.ts`

Expected: FAIL because the expedition progression module does not exist.

- [x] **Step 3: Implement pure progression helpers**

```ts
export const AP_MAX = 30;
export const AP_RECOVERY_MS = 300_000;

export function syncAp(ap: ApState, now: number): ApState {
  if (now < ap.lastRecoveredAt) return ap;
  if (ap.current >= AP_MAX) return { current: AP_MAX, lastRecoveredAt: now };
  const restored = Math.floor((now - ap.lastRecoveredAt) / AP_RECOVERY_MS);
  if (restored < 1) return ap;
  const current = Math.min(AP_MAX, ap.current + restored);
  return {
    current,
    lastRecoveredAt: current === AP_MAX ? now : ap.lastRecoveredAt + restored * AP_RECOVERY_MS,
  };
}
```

Implement reward addition with safe nonnegative integers and a route helper based only on prerequisites and first-clear IDs.

- [x] **Step 4: Run focused tests and verify GREEN**

Run: `pnpm test -- src/features/expedition/progression.test.ts`

Expected: PASS for AP recovery, cap, clock rollback, reward addition, and route unlocking.

- [x] **Step 5: Commit progression rules**

```powershell
git add src/features/expedition
git commit -m "feat: add expedition AP and route rules"
```

---

### Task 3: Character and weapon growth rules

**Files:**
- Create: `src/features/growth/growth.ts`
- Create: `src/features/growth/growth.test.ts`
- Modify: `src/features/loadout/calculate-loadout.ts`
- Modify: `src/features/loadout/calculate-loadout.test.ts`
- Modify: `src/features/battle/engine.ts`
- Modify: `src/features/battle/engine.test.ts`

**Interfaces:**
- Produces `characterUpgradeCost(level)`, `weaponUpgradeCost(level)`, `effectiveCharacter(definition, level)`, and `effectiveWeapon(definition, level)`.
- Extends `calculateLoadout(grid, weapons, weaponLevels?)` without breaking callers that omit levels.
- Extends `CreateBattleInput` with `characterLevels` and applies effective character stats.

- [x] **Step 1: Write failing growth tests**

```ts
it('applies the approved Lv.10 multipliers', () => {
  expect(effectiveCharacter(content.characters[0], 10).attack).toBe(Math.round(content.characters[0].attack * 1.36));
  expect(effectiveWeapon(content.weapons[0], 10).attack).toBe(Math.round(content.weapons[0].attack * 1.45));
});

it('returns exact high-level costs and no cost beyond Lv.10', () => {
  expect(characterUpgradeCost(9)).toEqual({ expeditionPoints: 1000, surfaceAlloy: 6, ruinChip: 5, leylineCore: 1 });
  expect(weaponUpgradeCost(9)).toEqual({ expeditionPoints: 800, surfaceAlloy: 5, ruinChip: 4, leylineCore: 1 });
  expect(characterUpgradeCost(10)).toBeNull();
});
```

Add focused assertions showing an equipped Lv.10 weapon and a Lv.10 party member increase loadout and battle stats.

- [x] **Step 2: Run focused tests and verify RED**

Run: `pnpm test -- src/features/growth/growth.test.ts src/features/loadout/calculate-loadout.test.ts src/features/battle/engine.test.ts`

Expected: FAIL because growth helpers and level-aware calculations are absent.

- [x] **Step 3: Implement the growth tables and effective stats**

```ts
export function effectiveCharacter(definition: CharacterDefinition, level: number): CharacterDefinition {
  const multiplier = 1 + 0.04 * (level - 1);
  return { ...definition, attack: Math.round(definition.attack * multiplier), maxHp: Math.round(definition.maxHp * multiplier) };
}

export function effectiveWeapon(definition: WeaponDefinition, level: number): WeaponDefinition {
  const multiplier = 1 + 0.05 * (level - 1);
  return { ...definition, attack: Math.round(definition.attack * multiplier), hp: Math.round(definition.hp * multiplier) };
}
```

Encode the two approved nine-row cost tables. Require integer levels from 1 through 10. Keep weapon skill percentages and main-hand power unchanged.

- [x] **Step 4: Run focused tests and verify GREEN**

Run: `pnpm test -- src/features/growth/growth.test.ts src/features/loadout/calculate-loadout.test.ts src/features/battle/engine.test.ts`

Expected: PASS with exact Lv.1 and Lv.10 stat calculations.

- [x] **Step 5: Commit growth rules**

```powershell
git add src/features/growth src/features/loadout src/features/battle
git commit -m "feat: add level-based combat growth"
```

---

### Task 4: Version 2 state and save migration

**Files:**
- Modify: `src/game/initial-state.ts`
- Modify: `src/game/storage.ts`
- Modify: `src/game/storage.test.ts`
- Modify: `src/game/GameProvider.tsx`
- Modify: `src/domain/schemas.ts`
- Modify: `e2e/helpers.ts`

**Interfaces:**
- Produces v2 `GameState` with `ap`, `inventory`, `characterLevels`, `weaponLevels`, `firstClears`, `viewedStories`, `activeStoryId`, `storyReturnScreen`, `selectedStageId`, `activeChallenge`, `battleSnapshot`, and `lastStageRewards`.
- Produces `migrateV1State(input, now): GameState`.
- Preserves the local-storage key `astra-save-v1` so installed saves are found and rewritten as v2.

- [x] **Step 1: Write failing migration tests**

```ts
it('migrates a tutorial-cleared v1 save into the land route', () => {
  const result = createSaveRepository(storage, () => 1_000).load();
  expect(result.state.version).toBe(2);
  expect(result.state.firstClears).toEqual(['land_01_port_defense']);
  expect(result.state.ap).toEqual({ current: 30, lastRecoveredAt: 1_000 });
  expect(result.state.inventory.fieldRation).toBe(1);
});

it('preserves a tidal-victory adult collection and marks all land content read', () => {
  expect(result.state.firstClears).toHaveLength(4);
  expect(result.state.viewedStories).toHaveLength(8);
  expect(result.state.viewedEvents).toEqual(['evt_chr02_bond03']);
});
```

- [x] **Step 2: Run storage tests and verify RED**

Run: `pnpm test -- src/game/storage.test.ts`

Expected: FAIL because the persisted schema only accepts version 1.

- [x] **Step 3: Implement v2 schema, initial state, and migration**

```ts
export interface ApState { current: number; lastRecoveredAt: number }
export interface Inventory extends RewardBundle {}
export interface ActiveChallenge { stageId: StageId; encounterId: EncounterId; apCost: number }

export function createInitialState(now = Date.now()): GameState {
  return {
    version: 2,
    screen: 'adult-gate',
    ap: { current: 30, lastRecoveredAt: now },
    inventory: { expeditionPoints: 0, surfaceAlloy: 0, ruinChip: 0, leylineCore: 0, fieldRation: 1 },
    characterLevels: { chr_01: 1, chr_02: 1, chr_03: 1, chr_04: 1 },
    weaponLevels: allWeaponLevels(1),
    firstClears: [],
    viewedStories: [],
    activeStoryId: null,
    storyReturnScreen: null,
    selectedStageId: 'land_01_port_defense',
    activeChallenge: null,
    battleSnapshot: null,
    lastStageRewards: null,
    ...existingInitialFields,
  };
}
```

Accept exact v1 input, migrate it, then parse the v2 output. Inject `now` into the repository for deterministic tests. Add a `focus` listener in GameProvider that dispatches AP synchronization.

- [x] **Step 4: Run storage and provider tests and verify GREEN**

Run: `pnpm test -- src/game/storage.test.ts src/app/App.test.tsx`

Expected: PASS for new saves, both migration paths, corrupt-save recovery, and focus synchronization.

- [x] **Step 5: Commit state migration**

```powershell
git add src/game src/domain/schemas.ts e2e/helpers.ts
git commit -m "feat: migrate saves to expedition state v2"
```

---

### Task 5: Atomic reducer transactions

**Files:**
- Modify: `src/game/reducer.ts`
- Modify: `src/game/reducer.test.ts`

**Interfaces:**
- Adds `SYNC_AP`, `USE_FIELD_RATION`, `SELECT_STAGE`, `START_STORY`, `COMPLETE_STORY`, `START_STAGE`, `SAVE_BATTLE_SNAPSHOT`, `FINISH_STAGE`, `UPGRADE_CHARACTER`, and `UPGRADE_WEAPON`.
- Removes direct new-flow use of `START_ENCOUNTER` and `FINISH_ENCOUNTER` while retaining migration compatibility where required.

- [x] **Step 1: Write failing transaction tests**

```ts
it('deducts AP once and creates an active challenge atomically', () => {
  const next = gameReducer(readyState({ ap: { current: 30, lastRecoveredAt: 0 } }), {
    type: 'START_STAGE', stageId: 'land_01_port_defense', now: 0,
  });
  expect(next.ap.current).toBe(25);
  expect(next.activeChallenge?.apCost).toBe(5);
  expect(next.screen).toBe('battle');
});

it('refunds all paid AP on defeat and grants nothing', () => {
  const next = gameReducer(activeState({ ap: { current: 20, lastRecoveredAt: 0 } }), {
    type: 'FINISH_STAGE', result: 'defeat', flags: [], enemyHp: 800,
  });
  expect(next.ap.current).toBe(25);
  expect(next.inventory).toEqual(activeState().inventory);
  expect(next.activeChallenge).toBeNull();
});

it('grants first-clear rewards only once', () => {
  const first = finishVictory(activeState());
  const repeated = finishVictory(activeState({ firstClears: first.firstClears, inventory: first.inventory }));
  expect(repeated.lastStageRewards?.firstClear).toEqual(emptyRewards());
});
```

Add tests for insufficient AP, locked stages, ration cap, story read idempotence, upgrade affordability, ownership, and max level.

- [x] **Step 2: Run reducer tests and verify RED**

Run: `pnpm test -- src/game/reducer.test.ts`

Expected: FAIL because expedition transaction actions are not defined.

- [x] **Step 3: Implement reducer transactions with pure helpers**

`START_STAGE` synchronizes AP with `now`, validates route and complete party, deducts the stage cost, and creates `activeChallenge`. `FINISH_STAGE` uses the active stage as the sole reward source; victory grants rewards and relation XP, defeat refunds AP, and both clear the battle snapshot. Upgrade actions retrieve the exact next-level cost, validate all inventory fields, subtract once, and increment one level.

- [x] **Step 4: Run reducer tests and verify GREEN**

Run: `pnpm test -- src/game/reducer.test.ts src/features/expedition/progression.test.ts src/features/growth/growth.test.ts`

Expected: PASS for all atomic transactions and invalid-action guards.

- [x] **Step 5: Commit transactions**

```powershell
git add src/game/reducer.ts src/game/reducer.test.ts
git commit -m "feat: add atomic expedition transactions"
```

---

### Task 6: Map, story, and growth screens

**Files:**
- Create: `src/features/expedition/ExpeditionMapScreen.tsx`
- Create: `src/features/expedition/ExpeditionMapScreen.test.tsx`
- Create: `src/features/story/StoryScreen.tsx`
- Create: `src/features/story/StoryScreen.test.tsx`
- Create: `src/features/growth/GrowthScreen.tsx`
- Create: `src/features/growth/GrowthScreen.test.tsx`
- Modify: `src/app/App.tsx`
- Modify: `src/app/app.css`
- Modify: `src/features/formation/FormationScreen.tsx`
- Modify: `src/features/cabin/CabinScreen.tsx`
- Modify: `src/features/cabin/GalleryScreen.tsx`
- Modify: `src/features/settings/SettingsScreen.tsx`

**Interfaces:**
- `ExpeditionMapScreen` reads Stage content and dispatches `SELECT_STAGE`, `SYNC_AP`, `USE_FIELD_RATION`, and navigation actions.
- `StoryScreen` renders the active pre/post scene and dispatches `MARK_STORY_VIEWED` plus the next destination.
- `GrowthScreen` dispatches character and weapon upgrade actions and renders effective stats.

- [x] **Step 1: Write failing component tests**

```tsx
it('shows only the first land node as initially available', () => {
  renderGame(<ExpeditionMapScreen />, readyState());
  expect(screen.getByRole('button', { name: /港都防衛演習/ })).toBeEnabled();
  expect(screen.getByRole('button', { name: /地表遺跡勘查/ })).toBeDisabled();
});

it('uses the selected captain portrait and can skip an unread scene', async () => {
  renderGame(<StoryScreen />, storyState({ captainId: 'cap_f' }));
  expect(screen.getByRole('img', { name: /女性艦長/ })).toBeVisible();
  await user.click(screen.getByRole('button', { name: '略過劇情' }));
  expect(mockDispatch).toHaveBeenCalledWith({ type: 'COMPLETE_STORY' });
});

it('disables an upgrade and lists missing materials', () => {
  renderGame(<GrowthScreen />, readyState());
  expect(screen.getByRole('button', { name: /提升焰衛至 Lv.2/ })).toBeDisabled();
  expect(screen.getByText(/缺少：遠征點數 100/)).toBeVisible();
});
```

- [x] **Step 2: Run component tests and verify RED**

Run: `pnpm test -- src/features/expedition/ExpeditionMapScreen.test.tsx src/features/story/StoryScreen.test.tsx src/features/growth/GrowthScreen.test.tsx`

Expected: FAIL because the three screens do not exist.

- [x] **Step 3: Implement accessible screens and routing**

Add `expedition-map`, `story`, and `growth` router cases. Render map nodes as semantic buttons with a selected detail panel. Use `userAssetUrl` for portrait expressions and keep text controls in HTML. Growth tabs render every owned character and weapon with current level, effective stats, next cost, and exact missing items.

Update existing navigation so onboarding reaches the map after Formation and Cabin, Gallery, and Settings can return to it. Add responsive CSS using the existing brass/deep-blue design tokens.

- [x] **Step 4: Run component tests and verify GREEN**

Run: `pnpm test -- src/features/expedition/ExpeditionMapScreen.test.tsx src/features/story/StoryScreen.test.tsx src/features/growth/GrowthScreen.test.tsx src/app/App.test.tsx`

Expected: PASS with accessible buttons, correct portrait assets, route states, and no React warnings.

- [x] **Step 5: Commit chapter hub screens**

```powershell
git add src/app src/features/expedition src/features/story src/features/growth src/features/formation src/features/cabin src/features/settings
git commit -m "feat: add land chapter hub and story screens"
```

---

### Task 7: Stage-aware loadout, persistent battle, and rewards

**Files:**
- Modify: `src/features/loadout/LoadoutScreen.tsx`
- Modify: `src/features/loadout/LoadoutScreen.test.tsx`
- Modify: `src/features/battle/BattleScreen.tsx`
- Modify: `src/features/battle/BattleScreen.test.tsx`
- Modify: `src/features/battle/ResultsScreen.tsx`
- Create: `src/features/battle/ResultsScreen.test.tsx`

**Interfaces:**
- Loadout resolves only `state.selectedStageId` and dispatches `START_STAGE` after saving loadout.
- Battle initializes from `state.battleSnapshot` or creates a level-aware battle once, then dispatches `SAVE_BATTLE_SNAPSHOT` after every command.
- Results reads `lastStageRewards`, exposes story/map continuation, and retries through Loadout so AP is checked again.

- [x] **Step 1: Write failing integration component tests**

```tsx
it('starts the selected land stage instead of guessing from flags', async () => {
  renderGame(<LoadoutScreen />, readyState({ selectedStageId: 'land_03_orbital_outpost' }));
  await user.click(screen.getByRole('button', { name: '進入軌道升降機前哨' }));
  expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'START_STAGE', stageId: 'land_03_orbital_outpost' }));
});

it('persists a resolved turn snapshot', async () => {
  renderGame(<BattleScreen />, activeBattleState());
  await user.click(screen.getByRole('button', { name: '全隊防禦' }));
  expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'SAVE_BATTLE_SNAPSHOT' }));
});

it('shows refunded AP after defeat and routes retry through loadout', async () => {
  renderGame(<ResultsScreen />, defeatedStageState());
  expect(screen.getByText('已退還 AP 5')).toBeVisible();
  await user.click(screen.getByRole('button', { name: '調整艦裝後重試' }));
  expect(mockDispatch).toHaveBeenCalledWith({ type: 'NAVIGATE', screen: 'loadout' });
});
```

- [x] **Step 2: Run focused integration tests and verify RED**

Run: `pnpm test -- src/features/loadout/LoadoutScreen.test.tsx src/features/battle/BattleScreen.test.tsx src/features/battle/ResultsScreen.test.tsx`

Expected: FAIL because loadout is flag-driven, battle snapshots are local-only, and results have no expedition rewards.

- [x] **Step 3: Implement stage-aware battle flow**

Build effective loadout and character stats from saved levels. Dispatch snapshots from the BattleStage commit function before completion. On victory or defeat, dispatch only `FINISH_STAGE` with result, flags, and remaining enemy HP; the reducer determines rewards or refunds from `activeChallenge`.

Results displays fixed rewards, first-clear rewards, relation XP, sea-route unlock, or refunded AP. First-clear victory continues to post-story; repeats and defeats return to the map or Loadout.

- [x] **Step 4: Run integration and engine tests and verify GREEN**

Run: `pnpm test -- src/features/loadout/LoadoutScreen.test.tsx src/features/battle/BattleScreen.test.tsx src/features/battle/ResultsScreen.test.tsx src/features/battle/engine.test.ts`

Expected: PASS for selected stages, level-aware stats, persistent snapshots, victory rewards, defeat refund, and retry routing.

- [x] **Step 5: Commit the playable loop**

```powershell
git add src/features/loadout src/features/battle
git commit -m "feat: connect expedition stages to battle results"
```

---

### Task 8: Full-flow verification and delivery update

**Files:**
- Modify: `e2e/full-slice.spec.ts`
- Modify: `e2e/save-recovery.spec.ts`
- Create: `e2e/land-expedition.spec.ts`
- Modify: `README.md`
- Modify: `outputs/delivery-summary.md`
- Modify: `docs/superpowers/plans/2026-08-04-land-expedition-chapter.md`

**Interfaces:**
- Produces complete Playwright coverage for new-player route, farming and growth, defeat refund, challenge reload, and v1 migration.
- Leaves the plan checkboxes accurate and delivery documentation synchronized.

- [x] **Step 1: Write failing end-to-end scenarios**

```ts
test('clears the land route, farms materials, and unlocks the sea route', async ({ page }) => {
  await completeOnboarding(page);
  await clearLandStage(page, '港都防衛演習');
  await clearLandStage(page, '地表遺跡勘查');
  await upgradeCharacter(page, '焰衛');
  await clearLandStage(page, '軌道升降機前哨');
  await clearLandStage(page, '沉睡地脈核心');
  await expect(page.getByRole('button', { name: '進入海洋航線' })).toBeEnabled();
});

test('refunds AP after defeat and charges again on retry', async ({ page }) => {
  await seedActiveDefeatScenario(page);
  await loseCurrentBattle(page);
  await expect(page.getByText('已退還 AP 5')).toBeVisible();
  await retryFromLoadout(page);
  await expect(page.getByText('AP 25 / 30')).toBeVisible();
});
```

- [x] **Step 2: Run the new E2E file and verify RED**

Run: `pnpm exec playwright test e2e/land-expedition.spec.ts --project=desktop-720`

Expected: FAIL because the new map, growth, AP, and sea-route flow are absent.

- [x] **Step 3: Update helpers, prior flows, and documentation**

Adapt the existing full-slice tests to the new land route. Add v1 migration fixtures and an active challenge reload fixture. Update README and delivery summary with AP, deterministic drops, v2 migration, character/weapon Lv.10, and the land-to-sea route.

- [x] **Step 4: Run every verification command**

Run:

```powershell
pnpm test
pnpm build
pnpm test:e2e
git diff --check
```

Expected: all Vitest files pass, all three Playwright desktop projects pass, TypeScript and Vite build successfully, and `git diff --check` returns no errors.

- [x] **Step 5: Perform browser visual QA**

Inspect onboarding → map → story → loadout → all four stages → growth → sea unlock at 1440×810 and 1280×720. Confirm no horizontal overflow, no clipped primary action, correct portrait and enemy art, and no browser errors or warnings.

- [x] **Step 6: Commit and push the completed phase**

```powershell
git add -A
git commit -m "feat: add playable land expedition chapter"
git push origin codex/web-slice
```
