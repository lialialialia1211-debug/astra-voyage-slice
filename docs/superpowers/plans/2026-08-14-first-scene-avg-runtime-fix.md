# First Scene AVG Runtime Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the deployed prototype reopen at Scene 01 after the dialogue-content revision and replace Scene 01's novel-derived narration blocks with a hand-authored, character-driven AVG scene.

**Architecture:** Add a one-time v4-to-v5 save migration that preserves display/audio settings but resets canonical Chapter One progression to Scene 01. Introduce the first manual story scene as a typed TypeScript module and let `chapter-one/content.ts` replace only the generated Scene 01 while the other 29 scenes remain available during staged conversion.

**Tech Stack:** React 19, TypeScript, Zod, Vitest, Testing Library, GitHub Actions, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-08-12-character-driven-avg-design.md`

## Global Constraints

- The novel fixes events and outcomes, but its prose is not runtime dialogue.
- Scene 01 follows the approved v0.3 character cards, R01/R06 relationship rules, and the Scene 01 state table.
- Narration is limited to indispensable transitions; visible action is expressed by speaker changes, stage snapshots, expressions, and short playable beats.
- Yanling enters only after the port work is complete and exits when the outer-bay alarm sounds.
- Do not change battle placement, artwork, audio, adult scenes, or Scenes 02–30 in this fix.
- Do not run local acceptance tests, builds, servers, or art validation. Red and green evidence comes from `Remote QA - GitHub Pages`.
- Manual browser QA uses only `https://lialialialia1211-debug.github.io/astra-voyage-slice/`.

---

### Task 1: One-time Chapter Content Migration

**Files:**
- Modify: `src/game/initial-state.ts`
- Modify: `src/game/storage.ts`
- Test: `src/game/storage.test.ts`

**Interfaces:**
- Consumes: a valid version 4 `GameState` whose Chapter One progress may point to Scene 02 or later.
- Produces: version 5 `GameState`; `migrateV4State(input, now)` preserves adult display, story, audio, AP, and inventory settings while replacing `chapterOne` with `createInitialState(now).chapterOne` and routing confirmed adults to `story`.

- [ ] **Step 1: Write the failing migration test**

Add a literal v4 save at Scene 02, line 33 and assert that load returns version 5, `scene-1`, `ch01_scene_01_port_bell`, line 0, and empty completion arrays while preserving `adultMode`, `storySettings`, and `audioSettings`.

- [ ] **Step 2: Push the test-only commit and verify RED remotely**

Run `Remote QA - GitHub Pages`. Expected failure: the loaded save remains version 4 at Scene 02 line 33.

- [ ] **Step 3: Implement the v5 schema and migration**

Change `GameState.version` and `createInitialState()` to 5. Preserve the old v4 schema as `versionFourStateSchema`, make the current schema require version 5, and route `version === 4` through `migrateV4State()`.

- [ ] **Step 4: Keep earlier migrations targeting the current schema**

Update v1/v2/v3 migration expectations and implementations so they continue producing the current version 5 state without changing their existing safe-field behavior.

- [ ] **Step 5: Commit the migration**

```powershell
git add -- src/game/initial-state.ts src/game/storage.ts src/game/storage.test.ts
git commit -m "fix: restart chapter after dialogue revision"
```

### Task 2: Hand-authored Scene 01 AVG Sample

**Files:**
- Create: `src/chapter-one/story/scenes/scene-01.ts`
- Modify: `src/chapter-one/types.ts`
- Modify: `src/chapter-one/content.ts`
- Modify: `src/chapter-one/content.test.ts`
- Modify: `src/features/story/StoryScreen.tsx`
- Modify: `src/features/story/StoryScreen.test.tsx`
- Modify: `src/app/app.css`

**Interfaces:**
- Consumes: `ChapterStoryScene`, the Scene 01 novel event order, v0.3 cards for Zhaoli/Yanling/Luoen, and the Scene 01 state table.
- Produces: `scene01` as a complete typed stage snapshot sequence, optional `ChapterStageActor.action` cues rendered on the actor, and an override map in `content.ts` keyed by `ch01_scene_01_port_bell`.

- [ ] **Step 1: Write failing content tests**

Assert that playable Scene 01 has at most 70 beats, at most two narration beats total, begins with Zhaoli/Luoen only, does not include Yanling before her first spoken line, removes her again for the final alarm/departure beat, and keeps every speaking actor present in that beat's `actors` snapshot.

- [ ] **Step 2: Write the failing StoryScreen test**

Assert that a fresh Scene 01 visibly opens on a character line, shows exactly Zhaoli and Luoen, renders the current actor action as a stage cue, and does not render Yanling.

- [ ] **Step 3: Push the combined test-only commit and verify RED remotely**

Expected failures: generated Scene 01 has 142 beats, begins with narration, and places Yanling in all 142 stage snapshots.

- [ ] **Step 4: Author the typed Scene 01 module**

Write 45–70 short beats covering: damaged towline inspection, three-ship dispatch, old passenger ship/new map comparison, gangway rescue, Yanling's late inspection, evidence seal/exit-angle questions, alarm, and Yanling's exit from the duty line. Dialogue follows each card's sentence order and avoids reading character thoughts aloud. Visible actions live on `ChapterStageActor.action` and do not consume narrator beats.

- [ ] **Step 5: Override only Scene 01 in runtime content**

Import `scene01` in `content.ts` and select it by ID; generated Scenes 02–30 remain unchanged and reachable.

- [ ] **Step 6: Commit the manual scene**

```powershell
git add -- src/chapter-one/story/scenes/scene-01.ts src/chapter-one/types.ts src/chapter-one/content.ts src/chapter-one/content.test.ts src/features/story/StoryScreen.tsx src/features/story/StoryScreen.test.tsx src/app/app.css
git commit -m "feat: stage scene one as character-driven AVG"
```

### Task 3: Remote Green and Browser Regression

**Files:**
- No additional repository files.

**Interfaces:**
- Consumes: the pushed v5 migration and manual Scene 01.
- Produces: GitHub Actions and fixed Pages evidence for the completion report.

- [ ] **Step 1: Push the implementation commits and run remote QA**

Expected: all unit/integration tests, TypeScript, production build, Pages deployment, and smoke checks pass.

- [ ] **Step 2: Verify a pre-existing v4 browser save**

Open the fixed Pages URL and confirm it displays `第 1 幕 / 30`, a character speaker, and only Zhaoli/Luoen at the opening.

- [ ] **Step 3: Advance through the late entrance**

Confirm Yanling is absent during port work, appears for the final inspection, and is absent again after the outer-bay alarm.

- [ ] **Step 4: Record evidence**

Report the Pages URL, GitHub Actions run URL, deployed commit SHA, remote result, and browser observations.
