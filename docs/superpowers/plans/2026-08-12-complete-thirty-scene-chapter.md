# Complete Thirty-Scene Chapter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the two-scene milestone flow with the complete canonical 30-scene, 15-battle Chapter 01 while preserving the existing RPG engine and all approved adult-story rules.

**Architecture:** The canonical Markdown novels remain the only prose source. A tested Node generator packs every source paragraph into committed AVG JSON without deleting or rewriting text, while a hand-maintained metadata catalog supplies scene IDs, viewpoints, backgrounds, cast, CG timing, and battle insertion points. The chapter reducer advances through a linear catalog of scene and battle nodes; all battles reuse the existing engine and differ only through content definitions, tutorial focus, party availability, and enemy assets.

**Tech Stack:** React 19, TypeScript 7, Vite 8, Vitest 4, Zod 4, Node ESM scripts, existing GitHub Pages remote QA.

## Global Constraints

- The only canonical prose source is `docs/worldbuilding/first-major-arc-novel-v0.2/`.
- Mainline order is fixed: 30 scenes, 15 battles, one ending, no route choices.
- Battles occur after scenes 2, 5, 8, 10, 12, 13, 16, 17, 19, 23, 24, 26, 27, 28, and 29.
- Scenes 15, 20, and 25 are fixed mainline adult scenes, require no affinity, and each uses three approved CGs.
- Zhao Li remains slot one and changes element through the selected main weapon.
- Existing RPG engine, six elements, skills, cooldowns, ougi, chain, guard, support, boss modes, snapshot, retry, growth, AP, and legacy content stay intact.
- Existing Chapter 01 art IDs are authoritative; missing audio remains silent fallback.
- Do not create a worktree. Work directly on `codex/add-world-bible` as explicitly approved by the user.
- Do not run local tests, builds, art validation, E2E, Vite, preview servers, or localhost QA.
- Every red/green acceptance cycle runs through `Remote QA - GitHub Pages` on `codex/web-slice`.
- Manual browser QA uses only `https://lialialialia1211-debug.github.io/astra-voyage-slice/`.

---

### Task 1: Canonical Novel-to-AVG Generator

**Files:**
- Create: `scripts/chapter-one-scene-metadata.mjs`
- Create: `scripts/build-chapter-one-story.mjs`
- Create: `scripts/build-chapter-one-story.test.mjs`
- Create: `src/generated/chapter-one-scenes.json`
- Modify: `package.json`

**Interfaces:**
- Consumes: 30 files matching `docs/worldbuilding/first-major-arc-novel-v0.2/scene-*.md`.
- Produces: `CHAPTER_ONE_SCENE_METADATA`, `buildChapterOneStory({ novelRoot })`, and committed `ChapterGeneratedScene[]` JSON.
- Each generated line contains `speakerId`, `speakerName`, `text`, `actors`, optional `backgroundAssetId`, optional `cgAssetId`, `tone`, and `adult`.

- [ ] **Step 1: Write failing generator tests**

```js
it('generates all 30 scenes in canonical order without losing prose', async () => {
  const scenes = await buildChapterOneStory({ novelRoot });
  expect(scenes).toHaveLength(30);
  expect(scenes.map((scene) => scene.number)).toEqual(Array.from({ length: 30 }, (_, index) => index + 1));
  for (const scene of scenes) {
    expect(normalize(scene.lines.map((line) => line.text).join('\n\n')))
      .toBe(normalize(await canonicalBody(scene.sourceFile)));
    expect(scene.lines.length).toBeGreaterThanOrEqual(10);
    expect(scene.lines.length).toBeLessThanOrEqual(24);
  }
});

it('maps the three adult scenes to three ordered CGs each', async () => {
  const scenes = await buildChapterOneStory({ novelRoot });
  expect(adultCgs(scenes[14])).toEqual(['cg_r18_yanling_15_01', 'cg_r18_yanling_15_02', 'cg_r18_yanling_15_03']);
  expect(adultCgs(scenes[19])).toEqual(['cg_r18_saifula_20_01', 'cg_r18_saifula_20_02', 'cg_r18_saifula_20_03']);
  expect(adultCgs(scenes[24])).toEqual(['cg_r18_mila_25_01', 'cg_r18_mila_25_02', 'cg_r18_mila_25_03']);
});
```

- [ ] **Step 2: Push the tests and verify RED remotely**

```powershell
git add -- scripts/build-chapter-one-story.test.mjs
git commit -m "test: specify canonical thirty-scene generation"
git push origin codex/add-world-bible
git push origin HEAD:codex/web-slice
```

Expected: the remote test suite fails because the generator module does not exist.

- [ ] **Step 3: Implement the metadata catalog and generator**

Define all 30 scene records with exact source filename, stable scene ID, title, viewpoint, location, background, at most three stage actors, optional main CG, optional adult CG triplet, tone, and audio cue. Parse the H1 as title, split the remaining body by blank paragraphs, then greedily pack consecutive paragraphs into lines of at most 520 characters. Join packed paragraphs with two newlines so concatenating all generated line text restores the canonical prose exactly.

For adult CGs, assign `_01`, `_02`, and `_03` to the first, middle, and final thirds of generated lines. Main CGs appear from their assigned line through the next line only.

- [ ] **Step 4: Generate and commit the JSON artifact**

```powershell
pnpm build:chapter-one-story
git add -- package.json scripts/chapter-one-scene-metadata.mjs scripts/build-chapter-one-story.mjs src/generated/chapter-one-scenes.json
git commit -m "feat: generate all canonical chapter scenes"
git push origin codex/add-world-bible
git push origin HEAD:codex/web-slice
```

Expected: generator tests pass remotely and every source paragraph survives in the artifact.

---

### Task 2: Thirty-Scene Content and Linear Flow Catalog

**Files:**
- Modify: `src/chapter-one/types.ts`
- Rewrite: `src/chapter-one/content.ts`
- Modify: `src/chapter-one/content.test.ts`
- Rewrite: `src/chapter-one/flow.ts`
- Modify: `src/chapter-one/flow.test.ts`

**Interfaces:**
- Produces: eight `ChapterActorDefinition` records, 30 `ChapterStoryScene` records, 15 `ChapterEncounterDefinition` records, and `chapterFlow`.
- Produces: `nodeAfterScene(sceneId)`, `nodeAfterBattle(encounterId)`, `sceneForNode(node)`, `encounterForNode(node)`, `chapterBattleApCost(encounterId, completedBattles)`.

- [ ] **Step 1: Write failing catalog and flow tests**

```ts
it('contains the complete canonical chapter', () => {
  expect(chapterOneContent.scenes).toHaveLength(30);
  expect(chapterOneContent.encounters).toHaveLength(15);
  expect(chapterOneContent.actors.map((actor) => actor.id)).toEqual([
    'zhaoli', 'yanling', 'saifula', 'mila', 'yilan', 'hanze', 'luoen', 'huicen',
  ]);
});

it('routes each scene through the approved battle insertion map', () => {
  expect(nodeAfterScene('ch01_scene_02_black_ship')).toBe('battle-1-prep');
  expect(nodeAfterBattle('ch01_b01_outer_bay_rescue')).toBe('scene-3');
  expect(nodeAfterScene('ch01_scene_29_question_for_deep_ocean')).toBe('battle-15-prep');
  expect(nodeAfterBattle('ch01_b15_question_for_deep_ocean')).toBe('scene-30');
  expect(nodeAfterScene('ch01_scene_30_first_deep_sea_license')).toBe('chapter-complete');
});
```

- [ ] **Step 2: Push and verify RED remotely**

- [ ] **Step 3: Implement actor, scene, encounter, and flow catalogs**

Use generated JSON for prose and scene presentation. Define battle insertion after scenes `2,5,8,10,12,13,16,17,19,23,24,26,27,28,29`. B1 costs zero only on first clear; every other chapter battle and B1 replay costs 5 AP.

- [ ] **Step 4: Push and verify GREEN remotely**

---

### Task 3: Save v4 and Generic Chapter Reducer

**Files:**
- Modify: `src/game/initial-state.ts`
- Modify: `src/game/reducer.ts`
- Modify: `src/game/storage.ts`
- Modify: `src/game/reducer.test.ts`
- Modify: `src/game/storage.test.ts`

**Interfaces:**
- Produces: `GameState.version: 4`.
- Adds: `chapterOne.selectedPartyIds`, `chapterOne.unlockedActorIds`, and generic active scene/battle routing.
- Migrates: v3 `milestone-complete` saves to `scene-3`; earlier v3 positions remain on their equivalent node.

- [ ] **Step 1: Write failing reducer and migration tests**

```ts
it('continues from every victorious chapter battle to its next scene', () => {
  const state = victoryState('ch01_b06_old_port_ambush');
  const next = gameReducer(state, { type: 'CONTINUE_CHAPTER' });
  expect(next.screen).toBe('story');
  expect(next.chapterOne.currentNode).toBe('scene-14');
});

it('migrates the completed vertical slice to scene three', () => {
  const migrated = repositoryFromV3({ currentNode: 'milestone-complete' }).load();
  expect(migrated.state.version).toBe(4);
  expect(migrated.state.chapterOne.currentNode).toBe('scene-3');
});
```

- [ ] **Step 2: Push and verify RED remotely**

- [ ] **Step 3: Implement generic actions and v4 migration**

Add `CONTINUE_CHAPTER`, `SET_CHAPTER_PARTY`, and generic implementations of `COMPLETE_CHAPTER_SCENE`, `START_CHAPTER_BATTLE`, `FINISH_CHAPTER_BATTLE`, `REPLAY_CHAPTER_SCENE`, and `REPLAY_CHAPTER_BATTLE`. Defeat refunds the paid AP and returns to the same battle prep. Victory records the active encounter and waits on Results until `CONTINUE_CHAPTER`.

Unlock actors after completing scenes 4 (`mila`), 5 (`yanling`), 7 (`yilan`), 16 (`saifula`), and 24 (`hanze`). Zhao Li remains selected and locked in slot one. Luo En is guest-only; Hui Cen is NPC-only.

- [ ] **Step 4: Push and verify GREEN remotely**

---

### Task 4: Fifteen Battles on the Existing RPG Engine

**Files:**
- Modify: `src/features/battle/types.ts`
- Modify: `src/features/battle/engine.ts`
- Modify: `src/features/battle/engine.test.ts`
- Modify: `src/features/battle/BattleScreen.tsx`
- Modify: `src/features/battle/BattleScreen.test.tsx`

**Interfaces:**
- Consumes: `ChapterEncounterDefinition.enemies`, `defaultPartyIds`, `partyMode`, and `tutorialFocus`.
- Produces: chapter battles with one to three enemies, correct art, normal/overdrive/break bosses, snapshots, and existing RPG commands.

- [ ] **Step 1: Write failing battle coverage tests**

```ts
it.each(chapterOneContent.encounters)('creates $id with its approved party and enemy set', (encounter) => {
  const battle = createBattle({
    contentSet: 'chapter-one',
    encounterId: encounter.id,
    partyIds: encounter.defaultPartyIds,
    elementOverrides: { zhaoli: 'water' },
    loadoutAttack: 0,
    loadoutHp: 0,
    summonId: encounter.supportAssetId ?? null,
  });
  expect(battle.party.map((actor) => actor.id)).toEqual(encounter.defaultPartyIds);
  expect(battle.enemies.map((enemy) => enemy.id)).toEqual(encounter.enemies.map((enemy) => enemy.id));
});
```

- [ ] **Step 2: Push and verify RED remotely**

- [ ] **Step 3: Implement chapter actors and encounters**

Use these primary visual mappings:

| Battle | Primary asset |
|---|---|
| B1 | `enemy_rescue_wreckage` |
| B2 | `boss_first_anchor_core` |
| B3 | `enemy_signal_interceptor` |
| B4 | `enemy_anchor_echo` |
| B5 | `enemy_signal_interceptor`, `enemy_old_port_raider` |
| B6 | `boss_old_port_commander` |
| B7 | `enemy_north_route_predator` |
| B8 | `enemy_white_cliff_echo` |
| B9 | `boss_black_tide_core` |
| B10 | `enemy_shipyard_security` |
| B11 | `boss_unflagged_ship` |
| B12 | `enemy_black_tide_spawn`, `enemy_unflagged_boarder` |
| B13 | `enemy_navigation_illusion` |
| B14 | `enemy_navigation_illusion` |
| B15 | `boss_tide_watcher` |

B1 alone uses the restricted basic-attack tutorial. B2–B6 show normal RPG commands plus their tutorial-focus message. B7–B15 use the complete battle UI.

- [ ] **Step 4: Push and verify GREEN remotely**

---

### Task 5: Full Chapter Prep, Results, and Completion UI

**Files:**
- Modify: `src/features/chapter/ChapterPrepScreen.tsx`
- Modify: `src/features/chapter/ChapterPrepScreen.test.tsx`
- Rewrite: `src/features/chapter/ChapterMilestoneScreen.tsx`
- Modify: `src/features/chapter/ChapterMilestoneScreen.test.tsx`
- Modify: `src/features/battle/ResultsScreen.tsx`
- Modify: `src/features/battle/ResultsScreen.test.tsx`
- Modify: `src/app/app.css`

**Interfaces:**
- Prep consumes current encounter, unlocked actors, selected party, selected main weapon, AP, and completion state.
- Results dispatches `CONTINUE_CHAPTER` after victory and returns to the same prep after defeat.
- Completion shows `30/30`, `15/15`, the final CG, and replay controls.

- [ ] **Step 1: Write failing UI tests**

```tsx
it('offers the unlocked four-person roster from battle three onward', async () => {
  renderAtBattlePrep(3);
  expect(screen.getByRole('button', { name: /昭黎/ })).toBeDisabled();
  expect(screen.getByRole('button', { name: /晏泠/ })).toBeEnabled();
  expect(screen.getByRole('button', { name: /彌菈/ })).toBeEnabled();
  expect(screen.getByRole('button', { name: /伊嵐/ })).toBeEnabled();
});

it('shows the completed canonical chapter after scene thirty', () => {
  renderAtChapterComplete();
  expect(screen.getByRole('heading', { name: '第一張深海航照' })).toBeVisible();
  expect(screen.getByText('30 / 30 幕')).toBeVisible();
  expect(screen.getByText('15 / 15 戰')).toBeVisible();
});
```

- [ ] **Step 2: Push and verify RED remotely**

- [ ] **Step 3: Implement the generic prep, results, and completion screens**

Fixed-party encounters show the locked story party. Selectable encounters always keep Zhao Li in slot one and allow exactly three additional unlocked formal members. When fewer than four formal members exist, use the encounter default story party. All screens show `幕 X/30` or `戰 X/15` and the next canonical destination.

- [ ] **Step 4: Push and verify GREEN remotely**

---

### Task 6: Complete AVG Presentation and Adult CG Handling

**Files:**
- Modify: `src/features/story/StoryScreen.tsx`
- Modify: `src/features/story/StoryScreen.test.tsx`
- Modify: `src/app/app.css`
- Modify: `src/app/App.test.tsx`

**Interfaces:**
- Consumes: generated 30-scene content and `AdultDisplayMode`.
- Produces: scene/line progress, canonical prose, staged actors, background/main CG, and adult-CG display classes.

- [ ] **Step 1: Write failing story tests**

```tsx
it('renders any of the 30 generated scenes and advances to its battle or next scene', async () => {
  renderAtChapterScene('ch01_scene_28_beyond_last_light');
  expect(screen.getByText('第 28 幕 / 30')).toBeVisible();
  expect(screen.getByRole('img', { name: /觀潮巨影/ })).toBeVisible();
});

it('shows three canonical adult CGs without affinity gating', () => {
  const scene = chapterOneContent.scenes.find((entry) => entry.number === 20)!;
  expect(new Set(scene.lines.map((line) => line.cgAssetId).filter(Boolean))).toEqual(new Set([
    'cg_r18_saifula_20_01', 'cg_r18_saifula_20_02', 'cg_r18_saifula_20_03',
  ]));
});
```

- [ ] **Step 2: Push and verify RED remotely**

- [ ] **Step 3: Implement full scene rendering**

Display line progress, scene progress, title, location, viewpoint, and a canonical-source notice. `full` displays the adult CG normally; `fade` applies the existing adult fade treatment; `hidden-thumbnails` replaces the CG with a non-explicit adult-content card while leaving canonical text readable. No affinity or unlock check is allowed for scenes 15, 20, or 25.

Increase dialogue capacity for up to 520 Chinese characters and preserve paragraph breaks. Keep previous line, log, auto, read-fast-forward, and replay behavior.

- [ ] **Step 4: Push and verify GREEN remotely**

---

### Task 7: Documentation and Final Remote QA

**Files:**
- Modify: `README.md`
- Modify only if QA exposes defects: chapter, game, battle, story, or CSS files.

**Interfaces:**
- Produces: a deployed, replayable 30-scene/15-battle chapter at the fixed Pages URL.

- [ ] **Step 1: Update README status and QA instructions**

Document 30 scenes, 15 battles, v4 saves, canonical generator, three mainline adult scenes, and the existing 203-art manifest.

- [ ] **Step 2: Push the final commit to both branches**

```powershell
git push origin codex/add-world-bible
git push origin HEAD:codex/web-slice
```

- [ ] **Step 3: Verify the full remote workflow**

Required evidence:

- All unit/integration tests pass.
- TypeScript and Vite production build pass.
- Pages artifact upload and deployment pass.
- Deployed manifest contains 203 assets.
- Fixed Pages URL loads without console errors.
- A fresh-save browser reaches scene 1; automated reducer tests prove the complete scene/battle chain through chapter completion.

- [ ] **Step 4: Report exact QA evidence**

Include the fixed Pages URL, GitHub Actions run URL, deployed commit SHA, remote QA result, number of passing tests, and the local-only status of `art-drop/chapter01/`.
