# Copilot instructions

## Project snapshot
- Product spec lives in [README.prompt.md](README.prompt.md); current repo has no source code yet.
- Build an offline Angular app (TypeScript strict, Angular CLI) with PouchDB persistence and no backend.
- Use npm as the package manager.

## Architecture and data flow
- UI is split into components for config, controls, HUD, scan grid, and scan capture (see component list in [README.prompt.md](README.prompt.md)).
- Use Angular Signals as the single source of truth in `ExperimentStateService`; avoid duplicated state.
- Persistence and CSV export live in `ScanPersistenceService` using the `scan-lab-observations` PouchDB database.

## Core workflow and state machine
- Only two states: `CONFIG` → `RUNNING` → `CONFIG`; scans are ignored unless state is `RUNNING`.
- Start is disabled until `userName` is non-empty and both `targetScanStyle` and `targetClusterSize` are valid with no defaults.
- Complete persists all in-memory scans, resets the form except `userName`, and clears in-memory buffers.

## Scan capture and timing
- Maintain a character buffer; on Enter/CR/LF, record a scan only if the buffer is non-empty.
- Do not trim or normalize barcodes; timestamps are captured at terminator receipt.
- Timing fields follow the spec: `deltaMs` null for first scan, `elapsedMs` zero for first scan, `scanIndex` starts at 0.

## Data model and export
- Store scans as flat documents (no nested experiment docs) matching `ScanRow` in [README.prompt.md](README.prompt.md).
- CSV export must use the exact column order and sorting rules; filename format is `scan-lab-observations_YYYY-MM-DD_HHMMSS.csv`.

## UI and UX constraints
- Instrument-panel layout: top control strip + bottom scan grid; no card stacking.
- Avoid Angular Material and flashy UI; use flat, rectangular, data-first visuals.

## Testing and deployment
- Add tests for buffer handling, timing math, state gating, and CSV formatting/sorting.
- GitHub Pages workflow should build with base-href set to repo name and deploy from `gh-pages` on main pushes.

## Expected npm scripts (Angular CLI defaults)
- `npm start` for local dev (`ng serve`).
- `npm run build` for standard build; production build via `npm run build -- --configuration production`.
- `npm test` for unit tests (`ng test`).

## Gaps to confirm with maintainers
- Exact npm build/test commands once scaffolding exists.
