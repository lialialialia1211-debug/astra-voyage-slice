# QA Adult CG Unlock Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one persistent QA control that unlocks all three adult CG events without changing unrelated game progress.

**Architecture:** Reuse the existing `UNLOCK_EVENT` reducer action, which stores `unlocked:<eventId>` flags. Teach the event predicate to honor those explicit override flags, then expose one button in `GalleryScreen` that dispatches the action for every registered adult event.

**Tech Stack:** React 19, TypeScript 7, Vitest 4, Testing Library, GitHub Actions, GitHub Pages.

## Global Constraints

- Never run Vite, Vitest, Playwright, a production build, or browser QA locally.
- Tests and the production build run only in GitHub Actions.
- Browser verification uses only `https://lialialialia1211-debug.github.io/astra-voyage-slice/`.
- The control may only add adult-event override flags; it must not change AP, growth, inventory, battles, stages, or rewards.

---

### Task 1: Specify the QA unlock behavior remotely

**Files:**
- Modify: `.github/workflows/qa-pages.yml`
- Modify: `src/features/cabin/relation.test.ts`
- Modify: `src/app/user-art-ui.test.tsx`

**Interfaces:**
- Consumes: existing `UNLOCK_EVENT` action and `isEventUnlocked(event, state): boolean`.
- Produces: failing specifications for manual override behavior and the gallery QA control.

- [ ] **Step 1: Add remote unit tests to the Pages workflow**

Insert this step after dependency installation and before the production build:

```yaml
      - name: Run unit and integration tests
        run: pnpm test
```

- [ ] **Step 2: Add the failing event-override test**

Import `eventConditionLabel`, then add:

```ts
it('honors an explicit QA unlock without changing progression', () => {
  const initial = createInitialState();
  const event = content.events.find((entry) => entry.id === 'evt_chr02_status')!;
  const overridden = { ...initial, flags: [`unlocked:${event.id}`] };

  expect(overridden.relation.chr_02).toEqual(initial.relation.chr_02);
  expect(isEventUnlocked(event, overridden)).toBe(true);
  expect(eventConditionLabel(event, overridden)).toBe('QA 已解鎖');
});
```

- [ ] **Step 3: Add the failing gallery-control test**

Add to `src/app/user-art-ui.test.tsx`:

```ts
it('unlocks all three adult CG events from the QA control', async () => {
  const user = userEvent.setup();
  renderAt({ screen: 'gallery', captainId: 'cap_f', roster: [...fullParty] });

  await user.click(screen.getByRole('button', { name: 'QA：解鎖全部 CG' }));

  expect(screen.getByRole('button', { name: 'QA：CG 已全解鎖' })).toBeDisabled();
  expect(screen.getAllByRole('button', { name: '開啟事件' })).toHaveLength(3);
  expect(screen.getAllByRole('img', { name: /預覽$/ })).toHaveLength(3);
});
```

- [ ] **Step 4: Commit and push the remote red phase**

```powershell
git add .github/workflows/qa-pages.yml src/features/cabin/relation.test.ts src/app/user-art-ui.test.tsx
git commit -m "test: specify QA adult CG unlock"
git push origin codex/web-slice
```

Use `gh run watch` and `gh run view --log-failed`. Expected: GitHub Actions fails because the QA override and button do not exist yet. Do not reproduce locally.

### Task 2: Implement the minimal unlock control

**Files:**
- Modify: `src/features/cabin/relation.ts`
- Modify: `src/features/cabin/GalleryScreen.tsx`

**Interfaces:**
- Consumes: `unlocked:<eventId>` flags created by the existing reducer action.
- Produces: an override-aware predicate and one gallery control.

- [ ] **Step 1: Honor explicit event overrides**

At the beginning of `isEventUnlocked`:

```ts
if (state.flags.includes(`unlocked:${event.id}`)) return true;
```

At the beginning of `eventConditionLabel`:

```ts
if (state.flags.includes(`unlocked:${event.id}`)) return 'QA 已解鎖';
```

- [ ] **Step 2: Add the gallery control**

Inside `GalleryScreen`, derive the state and handler:

```ts
const allAdultEventsUnlocked = content.events.every((event) => isEventUnlocked(event, state));
const unlockAllAdultEvents = useCallback(() => {
  for (const event of content.events) {
    dispatch({ type: 'UNLOCK_EVENT', eventId: event.id });
  }
}, [dispatch]);
```

Add this button to `.gallery-nav`:

```tsx
<button disabled={allAdultEventsUnlocked} type="button" onClick={unlockAllAdultEvents}>
  {allAdultEventsUnlocked ? 'QA：CG 已全解鎖' : 'QA：解鎖全部 CG'}
</button>
```

- [ ] **Step 3: Commit and push the green phase**

```powershell
git add src/features/cabin/relation.ts src/features/cabin/GalleryScreen.tsx
git commit -m "feat: add QA adult CG unlock control"
git push origin codex/web-slice
```

- [ ] **Step 4: Verify remotely**

Wait for the GitHub Actions run to report successful tests, production build, and Pages deployment. Inspect logs remotely if it fails; never fall back to local QA.

### Task 3: Unlock the user's deployed save

**Files:**
- No file changes.

**Interfaces:**
- Consumes: the deployed `QA：解鎖全部 CG` button.
- Produces: three available event CGs in the user's browser save.

- [ ] **Step 1: Open the fixed Pages URL**

Claim the existing QA tab or open the fixed URL after the successful deployment.

- [ ] **Step 2: Click the QA control**

Navigate to `事件收藏`, click `QA：解鎖全部 CG`, and confirm it changes to disabled `QA：CG 已全解鎖`.

- [ ] **Step 3: Confirm all assets**

Verify the collection has three enabled `開啟事件` buttons and that these images report `complete: true` with non-zero natural dimensions:

- `evt_chr02_bond03_cg01.webp`
- `evt_chr02_status_cg01.webp`
- `evt_chr02_defeat_cg01.webp`

- [ ] **Step 4: Report the handoff**

Return the Pages URL, Actions run URL, deployed SHA, and confirmation that the current browser save has all three adult CG events unlocked.
