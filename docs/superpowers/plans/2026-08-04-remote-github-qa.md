# Remote GitHub QA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make GitHub Pages the project’s single fixed QA target, enforce that all acceptance checks run in GitHub Actions, and deliver the first working public QA URL.

**Architecture:** A repository policy and package-script guard reject local QA commands. GitHub Actions installs dependencies, runs unit checks and a production build, deploys `dist/` to one fixed Pages environment, then runs Playwright against the deployed URL at three desktop viewports. Runtime asset paths are made Pages-base-aware so the existing art library loads below `/astra-voyage-slice/`.

**Tech Stack:** GitHub Actions, GitHub Pages, pnpm, Vite 8, Vitest 4, Playwright 1.62, React 19, TypeScript 7.

## Global Constraints

- Never run Vite, Vitest, Playwright, a local production build, localhost, `127.0.0.1`, or local-file browser QA.
- Local work is limited to reading, editing, Git operations, and non-acceptance static inspection.
- Every QA result must come from GitHub Actions and every browser check must target the fixed GitHub Pages URL.
- The deployed artifact intentionally includes the project’s complete approved R18 art set.
- If private-repository Pages is unavailable, stop and report the platform limitation; do not change repository visibility or create another repository.

---

### Task 1: Install the remote-only QA boundary

**Files:**
- Create: `AGENTS.md`
- Create: `scripts/require-github-actions.mjs`
- Modify: `package.json`
- Create: `.github/workflows/qa-pages.yml`
- Modify: `playwright.config.ts`

- [ ] **Step 1: Add the repository policy**

Write `AGENTS.md` with explicit prohibitions on local servers, local builds/tests/E2E, localhost browser checks, and fallback to local QA. Require the completion report to contain the Pages URL, Actions run URL, commit SHA, and remote result.

- [ ] **Step 2: Add an executable package-script guard**

Create `scripts/require-github-actions.mjs`:

```js
if (process.env.GITHUB_ACTIONS !== 'true') {
  console.error('QA commands are disabled locally. Push to GitHub and use the fixed Pages QA URL.');
  process.exit(1);
}
```

Prefix `dev`, `build`, `test`, `test:watch`, `test:e2e`, and `validate:art` with `pnpm qa:guard &&`; add `"qa:guard": "node scripts/require-github-actions.mjs"`. Leave art generation available because it is production work, not acceptance QA.

- [ ] **Step 3: Make Playwright remote-only**

Replace the hard-coded loopback `baseURL` and the entire `webServer` block. Read `QA_BASE_URL`, throw during configuration when it is missing, retain the existing Chromium viewport projects, screenshots, and traces.

- [ ] **Step 4: Add the GitHub Pages workflow**

Create `.github/workflows/qa-pages.yml` for every branch push and manual dispatch. Use one cancel-in-progress concurrency group and permissions `contents: read`, `pages: write`, `id-token: write`.

The jobs must run in this order:

1. `verify-and-build`: checkout, pnpm/Node setup, frozen install, `pnpm test`, `pnpm build`, `actions/configure-pages@v6`, and `actions/upload-pages-artifact@v5` for `dist/`.
2. `deploy`: deploy to the `github-pages` environment using `actions/deploy-pages@v5` and expose `page_url` as a job output.
3. `remote-e2e`: reinstall from the lockfile, install Chromium, run `pnpm test:e2e` with `QA_BASE_URL` set to the deployed `page_url`, and append URL/SHA/branch/results to the Actions summary.

- [ ] **Step 5: Commit the QA boundary**

```powershell
git add AGENTS.md scripts/require-github-actions.mjs package.json playwright.config.ts .github/workflows/qa-pages.yml
git commit -m "ci: enforce remote GitHub QA"
```

Do not invoke any QA command locally.

### Task 2: Prove and implement Pages-safe asset routing

**Files:**
- Create: `src/lib/base-path.test.ts`
- Create: `src/lib/base-path.ts`
- Modify: `src/lib/user-assets.ts`
- Modify: `vite.config.ts`

- [ ] **Step 1: Write the failing URL-prefix test**

Create `src/lib/base-path.test.ts` first with these cases:

```ts
expect(withBasePath('/assets/user/character.webp', '/astra-voyage-slice/'))
  .toBe('/astra-voyage-slice/assets/user/character.webp');
expect(withBasePath('/assets/user/character.webp', '/'))
  .toBe('/assets/user/character.webp');
expect(withBasePath('assets/user/character.webp', '/astra-voyage-slice/'))
  .toBe('/astra-voyage-slice/assets/user/character.webp');
```

Commit the test without its implementation:

```powershell
git add src/lib/base-path.test.ts
git commit -m "test: specify Pages asset routing"
git push origin codex/web-slice
```

This push publishes the QA workflow and the test together. Confirm the new GitHub Actions run fails in `pnpm test`. This is the remote red phase; do not reproduce it locally.

- [ ] **Step 2: Implement the base-path helper**

Create `src/lib/base-path.ts` with a pure `withBasePath(assetPath, basePath)` function that normalizes one slash at the join while preserving `/` as the root base.

- [ ] **Step 3: Route user art through the helper**

In `src/lib/user-assets.ts`, pass resolved manifest URLs through `withBasePath(resolved.url, import.meta.env.BASE_URL)`. Preserve `null` for missing asset IDs.

- [ ] **Step 4: Configure the production base**

Set `base: '/astra-voyage-slice/'` in `vite.config.ts`. Vite will rewrite compiled CSS references to public UI assets, while the runtime helper handles URLs originating in JSON manifests.

- [ ] **Step 5: Commit the Pages routing fix**

```powershell
git add src/lib/base-path.test.ts src/lib/base-path.ts src/lib/user-assets.ts vite.config.ts
git commit -m "fix: support GitHub Pages asset paths"
```

### Task 3: Publish and run the first remote QA

**Files:**
- Modify only if remote evidence requires a fix.

- [ ] **Step 1: Observe the remote red test**

```powershell
gh run list --workflow qa-pages.yml --branch codex/web-slice
gh run watch <run-id>
gh run view <run-id> --log-failed
```

Confirm that the test-only push fails because `src/lib/base-path.ts` does not yet exist. If it fails for a different reason, diagnose that remote evidence before implementing.

- [ ] **Step 2: Push the Pages routing implementation**

```powershell
git push origin codex/web-slice
```

- [ ] **Step 3: Configure Pages for Actions deployment**

Use the GitHub API to create the repository Pages configuration with `build_type=workflow`. If it already exists, update it to `workflow`. Do not change visibility or create another repository.

- [ ] **Step 4: Monitor the complete remote pipeline**

Use `gh run list` and `gh run watch` to monitor unit tests, production build, Pages deployment, and deployed-URL Playwright checks to completion.

- [ ] **Step 5: Diagnose only from GitHub evidence**

If a job fails, inspect Actions annotations and logs, make the smallest relevant edit, commit, and push again. Never fall back to a local server, build, test, or browser.

- [ ] **Step 6: Verify the deployed target**

After Actions is green, open only:

`https://lialialialia1211-debug.github.io/astra-voyage-slice/`

Confirm the actual deployed page loads and that the Action’s Playwright job passed all three configured desktop sizes.

### Task 4: Record the handoff

**Files:**
- Modify: `README.md`
- Modify: `outputs/delivery-summary.md`

- [ ] **Step 1: Document the single QA entry point**

Add the fixed Pages URL, the remote-only rule, the workflow name, and the rule that pushes from any branch overwrite the same temporary QA environment.

- [ ] **Step 2: Update the delivery summary**

Record the first successful Actions run URL, deployed commit SHA, Pages URL, unit/build result, and three-viewport E2E result. Do not claim checks without remote evidence.

- [ ] **Step 3: Commit and push documentation**

```powershell
git add README.md outputs/delivery-summary.md
git commit -m "docs: publish remote QA handoff"
git push origin codex/web-slice
```

- [ ] **Step 4: Wait for the documentation push QA**

Monitor its GitHub Actions run until it completes, then report the final Pages URL, final Actions run URL, final SHA, and remote QA status to the user.
