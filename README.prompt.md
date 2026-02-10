# 🧪 scan-lab-observations
Experimental Scan Timing Capture Tool

---

## Purpose

Build a small, offline-friendly Angular web application used as a **research tool** to collect experimental scan timing data from a barcode scanner acting as keyboard input.

The application performs **no analysis**. It only:

1. Captures scan events.
2. Stores them locally.
3. Exports scans to CSV.
4. Allows clearing local data.

All analysis occurs later in Jupyter or other tools.

The application must feel like a **laboratory or industrial instrument**, not a marketing web application.

---

## Development Environment

Provide a **devcontainer configuration** (`.devcontainer/devcontainer.json`) for consistent development environment setup with:

- Node.js 20+
- Angular CLI and TypeScript extensions
- Automatic port forwarding for development server (port 4200)
- Pre-configured formatting and linting tools
- Automatic `npm install` on container creation

This ensures all developers have the same tooling and environment.

---

## Technology Requirements

- Framework: Angular (latest stable)
- Language: TypeScript with strict mode enabled
- Build tooling: Angular CLI project
- Persistence: PouchDB in browser
- No backend services
- No authentication
- No server-side rendering required

Use standard Angular patterns:

- Components for UI sections
- Services for experiment state and persistence
- Angular Signals for application state
- Reactive Forms for experiment configuration
- Strong typing throughout

Prefer minimal dependencies.

---

## Styling Requirements

Use **CSS custom properties (variables)** for all colors, fonts, and common spacing values:

- Define all theme colors in `:root` (backgrounds, text colors, borders, accents)
- Define typography variables (font families, sizes)
- Define spacing scale for consistent padding/margins
- All component CSS files should reference these variables
- This allows easy theme customization and maintains consistency

---

## Core Workflow (must match exactly)

1. User completes experiment entry form:
   - `userName` (last value persisted for convenience)
   - `targetScanStyle` (REQUIRED explicit choice): `compliant` or `non_compliant`
   - `targetClusterSize`:
     - For `compliant`: REQUIRED integer >= 1
     - For `non_compliant`: OPTIONAL (can be null)
   - `muteAudio` (checkbox to disable text-to-speech announcements)

2. **Start** button is disabled until:
   - `targetScanStyle` explicitly selected (no default)
   - For `compliant`: `targetClusterSize` valid integer >= 1
   - For `non_compliant`: `targetClusterSize` is optional
   - `userName` non-empty

3. User clicks **Start** → application enters RUNNING state.

4. User performs scans.
   - Each scan triggers audio announcement of current scan count (unless muted)
   - Text-to-speech automatically cancels previous utterances to prevent stacking during rapid scanning

5. User clicks **Complete**:
   - experiment scans persisted to local PouchDB
   - form resets EXCEPT `userName` and `muteAudio`
   - application returns to CONFIG state

In-progress experiments are never persisted.

Reloading or closing the browser discards in-progress runs.

---

## Text-to-Speech Feature

Implement a **TextToSpeechService** that:

- Announces the current scan count after each scan during RUNNING state
- Uses browser's native `SpeechSynthesis` API
- Automatically cancels previous speech utterances to prevent stacking when scanning rapidly
- Provides a mute toggle that persists across sessions in localStorage
- Speech is only active during RUNNING mode
- Mute checkbox available in configuration form
- Speech properties: rate=1.2, pitch=1.0, volume=1.0 for quick, clear announcements

Key implementation requirements:
- Watch scan count changes using Angular effects
- Call `speechSynthesis.cancel()` before each new utterance
- Store mute preference in localStorage as `scan-lab-tts-muted`
- Only announce when mode === 'RUNNING' and not muted

---

## State Machine

States:

CONFIG → RUNNING → CONFIG

Rules:

- CONFIG: form editable; scans ignored.
- RUNNING: form locked; scans recorded.
- Complete: scans saved; return to CONFIG.
- In-memory scan buffer and scan list cleared on completion.

Scans MUST be ignored unless state == RUNNING.

---

## Scan Capture Rules

Maintain an internal character buffer.

On key input:

- If Enter / CR / LF received:
  - If buffer is non-empty:
    - record scan with `barcode = buffer` exactly as typed
    - clear buffer
  - If buffer empty:
    - ignore input
- Otherwise:
  - append character to buffer

Rules:

- Do NOT trim, normalize, debounce, or deduplicate
- Allow manual keyboard entry
- Timestamp recorded when terminator received

---

## Timing Fields (per scan)

For each scan:

- `timestampMs` = Date.now() at terminator receipt
- `deltaMs` = current timestamp − previous scan timestamp
- `elapsedMs` = current timestamp − first scan timestamp

First scan:

- deltaMs = null
- elapsedMs = 0
- scanIndex = 0

scanIndex increments per scan.

Elapsed time must NOT include Start button delay.

---

## Persistence Rules

Database name: `scan-lab-observations`

Rules:

- Persist only when Complete pressed.
- No mid-run persistence.
- Reload discards run.
- Persist last username locally.

---

## Data Storage Shape

Each scan stored as flat document.

Each stored scan includes:

- experimentId (UUID v4)
- userName
- targetScanStyle
- targetClusterSize (number or null for non-compliant scans)
- scanIndex (starting at 0)
- timestampMs
- deltaMs
- elapsedMs
- barcode

No nested experiment documents.

Document `_id` scheme flexible.

---

## UI Requirements

Interface optimized for fast experiment execution.

CONFIG state shows:

- experiment entry form
- Start button
- Status HUD displaying:
  - Current state (CONFIG/RUNNING)
  - Current scan count (in-memory)
  - Total scans stored in database
  - Total unique experiments in database

RUNNING state shows:

- large scan counter
- recent scans table
- Complete button

On Complete:

- brief confirmation
- reset style and cluster fields
- preserve username and mute audio setting
- statistics refresh automatically

Recent scan table columns:

- scanIndex
- timestampMs
- deltaMs
- elapsedMs
- barcode

---

## CSV Export

Provide **Export All CSV** button.

Exports ALL stored scans.

CSV requirements:

One row per scan.

Column order must be:

1. experimentId
2. userName
3. targetScanStyle
4. targetClusterSize
5. scanIndex
6. timestampMs
7. deltaMs
8. elapsedMs
9. barcode

Sorting:

1. timestampMs ascending
2. scanIndex ascending
3. experimentId tie-breaker if needed

Filename:

scan-lab-observations_YYYY-MM-DD_HHMMSS.csv

---

## Delete All Data

Provide button with confirmation dialog:

"This will permanently delete all local data."

Implementation may destroy database or delete docs.

---

## Angular Architecture

### Components

ExperimentConfigComponent
Handles configuration form.

ExperimentControlsComponent
Contains Start, Complete, Export, Delete buttons.

ExperimentHudComponent
Displays large scan count and status.

ScanGridComponent
AG Grid displaying in-memory scans sorted newest-first.

ScanCaptureComponent
Dedicated scan capture input handler.

---

### Services

ExperimentStateService
Single source of truth using Angular Signals.

Responsibilities:

- experiment state
- scans list
- computed scan count
- experiment lifecycle

ScanPersistenceService
Handles:

- saving scans
- CSV export
- database clearing

---

## Models

export type TargetScanStyle = 'compliant' | 'non_compliant';
export type ExperimentMode = 'CONFIG' | 'RUNNING';

export interface ScanRow {
  experimentId: string;
  userName: string;
  targetScanStyle: TargetScanStyle;
  targetClusterSize: number | null;
  scanIndex: number;
  timestampMs: number;
  deltaMs: number | null;
  elapsedMs: number;
  barcode: string;
  _id?: string;
}

---

## Layout Requirement (Instrument Panel)

UI has exactly two vertical sections:

Top control strip:

- config form
- controls
- large scan counter

Bottom section:

- scan grid filling remaining space

Avoid card stacking layouts.

---

## Visual & UX Style Requirements

Application must resemble industrial or laboratory instrumentation.

Principles:

- functional minimal UI
- flat panels
- neutral muted palette
- minimal animation
- engineering typography
- large readable numeric HUD
- predictable layout

Avoid:

- gradients
- rounded cards
- heavy shadows
- flashy UI kits
- Angular Material visuals

Prefer rectangular controls and data-first layout.

---

## Angular Pitfalls to Avoid

- No Angular Material UI components.
- No duplicated state across components.
- No implicit defaults for scan style.
- No global keyboard interception.
- No mid-run persistence.
- Avoid unnecessary RxJS usage.
- Maintain strict typing.

---

## Testing Requirements

Add automated tests:

- buffering and terminator correctness
- timing math correctness
- state gating correctness
- CSV format and sorting correctness

Component tests optional but encouraged.

---

## GitHub Pages Deployment

Provide GitHub Actions workflow that:

1. Installs dependencies
2. Runs tests
3. Builds production bundle
4. Deploys to gh-pages branch

Requirements:

- Trigger on main branch push
- Build with base-href matching repository name
- Support hosting at:

https://<user>.github.io/<repository>/

Prefer no routing; if routing exists, use hash routing.

---

## Non-Goals

- No analytics
- No clustering detection
- No backend
- No scanner management
- No interrupted run recovery

---

## Quality Goals

- Deterministic export
- Correct timing math
- Clean Angular architecture
- Maintainable TypeScript code
- Minimal dependency surface
