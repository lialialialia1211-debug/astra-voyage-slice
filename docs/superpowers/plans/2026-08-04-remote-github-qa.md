# GitHub Pages QA Link Implementation Plan

**Goal:** Deploy the current web prototype to one fixed GitHub Pages URL for manual QA.

**Scope:** Keep this lightweight. No local QA, no local server, no automated E2E platform, and no additional repository.

## Implementation

- [x] Add `AGENTS.md` so future work uses only the GitHub Pages URL for QA.
- [x] Add one GitHub Actions workflow that installs, builds, and deploys `dist/` to Pages on every push.
- [x] Set Vite base path to `/astra-voyage-slice/`.
- [x] Prefix runtime user-art manifest URLs with the Vite base path.
- [ ] Commit and push `codex/web-slice`.
- [ ] Enable GitHub Pages with Actions as the source.
- [ ] Wait for the remote deployment build.
- [ ] Hand over `https://lialialialia1211-debug.github.io/astra-voyage-slice/` for the first QA.

If GitHub rejects Pages because the private repository or account plan does not support it, stop and report that exact platform limitation. Do not change visibility or create another repository.
