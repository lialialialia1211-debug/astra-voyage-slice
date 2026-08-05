# Repository QA Rules

These rules apply whenever a task changes the playable game or its runtime output.

## Remote-only QA

1. Never start Vite, a static file server, a preview server, or any other local web server for QA.
2. Never use `localhost`, `127.0.0.1`, or a local file URL for browser QA.
3. Never run unit, integration, end-to-end, art-validation, or production-build commands locally as acceptance checks.
4. Local work is limited to reading, editing, Git operations, and non-acceptance static inspection.
5. Remote QA is required only when a change affects the playable game or its runtime output, including game code, game data, player-facing UI, gameplay content, or runtime assets.
6. Documentation, worldbuilding, plans, specifications, repository instructions, and other non-game updates that do not affect playable output are exempt from QA.
7. For QA-required changes, push the working branch and use the `Remote QA - GitHub Pages` GitHub Actions workflow. Manual and automated browser QA must use only this fixed URL: `https://lialialialia1211-debug.github.io/astra-voyage-slice/`.
8. When required remote QA fails, inspect GitHub Actions logs, edit, commit, and push. Never fall back to local QA.
9. Completion reports for QA-required changes must include the fixed Pages URL, GitHub Actions run URL, deployed commit SHA, and remote QA result. Completion reports for exempt changes only need to state why QA was not required.

The fixed Pages environment is temporary QA infrastructure. A push from any branch may overwrite it.
