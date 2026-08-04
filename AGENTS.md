# Repository QA Rules

These rules apply to every agent and every task in this repository.

## Remote-only QA

1. Never start Vite, a static file server, a preview server, or any other local web server for QA.
2. Never use `localhost`, `127.0.0.1`, or a local file URL for browser QA.
3. Never run unit, integration, end-to-end, art-validation, or production-build commands locally as acceptance checks.
4. Local work is limited to reading, editing, Git operations, and non-acceptance static inspection.
5. Push the working branch and use the `Remote QA - GitHub Pages` GitHub Actions workflow for every QA result.
6. Manual and automated browser QA must use only this fixed URL: `https://lialialialia1211-debug.github.io/astra-voyage-slice/`.
7. When remote QA fails, inspect GitHub Actions logs, edit, commit, and push. Never fall back to local QA.
8. Every completion report must include the fixed Pages URL, GitHub Actions run URL, deployed commit SHA, and remote QA result.

The fixed Pages environment is temporary QA infrastructure. A push from any branch may overwrite it.
