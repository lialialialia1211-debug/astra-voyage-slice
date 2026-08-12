# Chapter One AVG Dialogue Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert all 30 canonical novel scenes into short, speaker-labelled AVG beats and keep navigation reachable at 1280×720.

**Architecture:** Keep the Markdown novels as canonical sources. Replace the current 520-character paragraph packer with a focused AVG tokenizer that separates quoted speech from narration, attributes explicit speakers, and sentence-packs prose to a hard display limit. Add a CSS/markup safety boundary so unexpected long text scrolls inside the prose area while controls remain visible.

**Tech Stack:** Node.js ESM content generator, React 19, TypeScript, Vitest, Testing Library, CSS, GitHub Actions Pages QA.

## Global Constraints

- Do not alter story events, scene order, artwork, audio, adult-scene count, or battle placement.
- The 30 Markdown files in `docs/worldbuilding/first-major-arc-novel-v0.2/` remain canonical.
- Normal generated beats target 35–100 characters and never exceed 120 characters unless a single indivisible sentence is longer.
- Unknown dialogue speakers must use an honest readable label; never assign a known actor without evidence.
- Do not run local tests, builds, servers, or art validation. Every red/green acceptance check uses `Remote QA - GitHub Pages`.
- Manual browser QA uses only `https://lialialialia1211-debug.github.io/astra-voyage-slice/`.

---

### Task 1: AVG Story Generator

**Files:**
- Modify: `scripts/build-chapter-one-story.test.mjs`
- Modify: `scripts/build-chapter-one-story.mjs`
- Modify: `src/generated/chapter-one-scenes.json`

**Interfaces:**
- Consumes: canonical Markdown bodies and `CHAPTER_ONE_SCENE_METADATA`.
- Produces: `buildChapterOneStory({ novelRoot })` with short `lines[]` containing `speakerId`, `speakerName`, `text`, staging, CG, tone, and adult metadata.

- [ ] **Step 1: Write failing generator tests**

Add assertions equivalent to:

```js
for (const scene of scenes) {
  expect(Math.max(...scene.lines.map((line) => line.text.length))).toBeLessThanOrEqual(120)
  expect(scene.lines.some((line) => line.speakerId !== 'narrator')).toBe(true)
}

expect(scenes[0].lines).toEqual(expect.arrayContaining([
  expect.objectContaining({ speakerId: 'luoen', text: '你查第二次才看見？' }),
  expect.objectContaining({ speakerId: 'zhaoli', text: '第一次確認它在，第二次確認它能用。' }),
]))
```

Remove the obsolete `10..24` packed-block expectation. Retain all 30-scene order and adult-CG ordering assertions.

- [ ] **Step 2: Push the test-only commit and verify RED remotely**

Push the working commit to the QA branch and run `Remote QA - GitHub Pages`. Expected result: generator assertions fail because current lines reach 520 characters and all speakers are `narrator`.

- [ ] **Step 3: Implement the AVG tokenizer**

Implement focused helpers in `build-chapter-one-story.mjs`:

```js
const TARGET_BEAT_LENGTH = 100
const MAX_BEAT_LENGTH = 120

function splitQuotedSegments(paragraph) {
  // Return ordered { kind: 'narration' | 'dialogue', text, before, after } segments.
}

function splitNarration(text) {
  // Split on Chinese sentence punctuation, then pack complete sentences up to 100 chars.
  // Split an oversized sentence again on comma/semicolon/colon boundaries.
}

function inferDialogueSpeaker({ before, after, metadata, recentSpeakers }) {
  // Prefer explicit actor name + speech verb nearest the quote.
  // Use pronoun context only when the prior named subject is unambiguous.
  // Return { speakerId: 'narrator', speakerName: '不明聲音' } when unresolved.
}

function buildAvgBeats(body, metadata) {
  // Preserve source order, separate mixed prose/dialogue, and attach speaker metadata.
}
```

Known mappings include 昭黎→`zhaoli`, 晏泠→`yanling`, 賽芙拉→`saifula`, 彌菈→`mila`, 伊蘭→`yilan`, 韓澤→`hanze`, 洛恩→`luoen`, 慧岑→`huicen`, plus port-control/harbor voice aliases. Strip outer Chinese quote marks from displayed dialogue; retain meaningful narration and action text.

- [ ] **Step 4: Regenerate the JSON artifact**

Run the generator only as an implementation step:

```powershell
node scripts/build-chapter-one-story.mjs
```

Statically inspect generated line counts, maximum lengths, speaker distribution, scene count, and adult CG distribution without treating local output as acceptance QA.

- [ ] **Step 5: Push and verify GREEN remotely**

Run `Remote QA - GitHub Pages`. Expected result: all generator, TypeScript, and existing app tests pass; deployed Pages remains HTTP 200.

- [ ] **Step 6: Commit the generator fix**

```powershell
git add -- scripts/build-chapter-one-story.mjs scripts/build-chapter-one-story.test.mjs src/generated/chapter-one-scenes.json
git commit -m "fix: convert chapter prose into AVG dialogue beats"
```

### Task 2: Reachable Story Controls

**Files:**
- Modify: `src/features/story/StoryScreen.test.tsx`
- Modify: `src/features/story/StoryScreen.tsx`
- Modify: `src/app/app.css`

**Interfaces:**
- Consumes: any `ChapterStoryLine.text`, including defensive oversized inputs.
- Produces: `.story-dialogue-text` as the only scrollable prose region and persistent `.story-controls`.

- [ ] **Step 1: Write failing component tests**

Assert that canonical story rendering exposes structural safety hooks:

```tsx
expect(screen.getByTestId('story-dialogue-text')).toBeVisible()
expect(screen.getByTestId('story-controls')).toBeVisible()
```

The test fails before markup adds those stable regions.

- [ ] **Step 2: Push the test-only commit and verify RED remotely**

Run the remote workflow. Expected failure: neither story safety test ID exists.

- [ ] **Step 3: Add minimal markup and CSS safety**

Render the prose and controls as separate grid rows:

```tsx
<p className="story-dialogue-text" data-testid="story-dialogue-text">{chapterLine.text}</p>
<div className="story-controls" data-testid="story-controls">...</div>
```

Apply bounded layout rules:

```css
.story-dialogue {
  display: grid;
  min-height: 0;
  max-height: min(46vh, 340px);
  grid-template-rows: auto minmax(0, 1fr) auto;
}

.story-dialogue-text {
  min-height: 0;
  overflow-y: auto;
  scrollbar-gutter: stable;
}
```

Add `scrollbar-gutter: stable` to `.chapter-prep-screen` and make `.chapter-prep-actions` sticky at the bottom of its scroll container so `開始救援` remains reachable.

- [ ] **Step 4: Push and verify GREEN remotely**

Run the remote workflow. Expected result: component tests, complete suite, TypeScript, build, deployment, and Pages smoke check pass.

- [ ] **Step 5: Commit the layout fix**

```powershell
git add -- src/features/story/StoryScreen.test.tsx src/features/story/StoryScreen.tsx src/app/app.css
git commit -m "fix: keep AVG story controls reachable"
```

### Task 3: Remote Browser Regression QA

**Files:**
- No repository files; this task collects remote evidence for the completion report.

**Interfaces:**
- Consumes: deployed QA commit and fixed Pages URL.
- Produces: evidence for fresh-save story, battle-prep, and post-battle story layouts at 1280×720.

- [ ] **Step 1: Verify fresh story layout on Pages**

At 1280×720, confirm the first scene shows a short beat, speaker label, and visible `下一句` without body scrolling.

- [ ] **Step 2: Verify speaker and line progression**

Advance through the opening exchange. Confirm 洛恩 and 昭黎 appear as speakers and the line counter advances one beat at a time.

- [ ] **Step 3: Verify first battle preparation and return to story**

Confirm `開始救援` remains reachable, complete Battle 01, and confirm Scene 03 opens with visible controls.

- [ ] **Step 4: Record completion evidence**

Capture the fixed Pages URL, GitHub Actions run URL, deployed commit SHA, suite totals, and manual browser result in the final report.
