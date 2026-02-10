# 🧪 Scan Lab Observations

Experimental Scan Timing Capture Tool - An offline-friendly Angular web application for collecting experimental scan timing data from barcode scanners.

![Initial View](https://github.com/user-attachments/assets/2975b0d7-748d-4363-9a3d-1ab0a7fd2e09)

## Purpose

This application is a research tool designed to:

1. Capture scan events from a barcode scanner (or manual keyboard input)
2. Store scan timing data locally using PouchDB
3. Export captured data to CSV for analysis
4. Manage local data storage

The application performs **no analysis** - it only collects raw timing data for later analysis in tools like Jupyter or Excel.

## Features

- **Offline-first**: Works completely offline with local browser storage
- **Real-time capture**: Captures scan timing with millisecond precision
- **Instrument panel UI**: Dark, minimalist interface designed like laboratory equipment
- **State machine**: Clear CONFIG → RUNNING → CONFIG workflow
- **Local persistence**: Data saved in browser using PouchDB
- **CSV export**: Deterministic CSV export with proper sorting
- **No backend required**: Runs entirely in the browser

## Technology Stack

- **Framework**: Angular 21+ with TypeScript (strict mode)
- **State Management**: Angular Signals
- **Forms**: Angular Reactive Forms
- **Persistence**: PouchDB (in-browser database)
- **Build Tool**: Angular CLI
- **Testing**: Vitest

## Quick Start

### Prerequisites

- Node.js 20+ and npm

### Installation

```bash
npm install
```

### Development Server

```bash
npm start
```

Navigate to `http://localhost:4200/`. The application will automatically reload when source files change.

### Build

```bash
npm run build
```

Build artifacts will be stored in the `dist/` directory.

### Production Build

```bash
npm run build -- --configuration production
```

### Run Tests

```bash
npm test
```

## Usage

### Starting an Experiment

1. Enter your **User Name**
2. Select **Target Scan Style** (Compliant or Non-Compliant)
3. Enter **Target Cluster Size** (must be > 1)
4. Click **Start** button

### Recording Scans

Once the experiment is running:

- Use a barcode scanner or type manually
- Each scan is captured when Enter/Return is pressed
- Scans are displayed in real-time in the grid (newest first)
- Timing data is calculated automatically:
  - `timestampMs`: Absolute timestamp when scan completed
  - `deltaMs`: Time since previous scan (null for first scan)
  - `elapsedMs`: Time since first scan (0 for first scan)

### Completing an Experiment

- Click **Complete** button
- Scans are saved to local database
- Form resets (except User Name, which persists)
- Ready to start a new experiment

### Exporting Data

- Click **Export All CSV** button
- Downloads all stored scans in CSV format
- Filename: `scan-lab-observations_YYYY-MM-DD_HHMMSS.csv`
- Data is sorted by timestamp, then scan index

### Deleting Data

- Click **Delete All Data** button
- Confirms before permanently deleting all local data
- Use to clear storage when needed

## Architecture

### Components

- **ExperimentConfigComponent**: Configuration form (username, scan style, cluster size)
- **ExperimentControlsComponent**: Action buttons (Start, Complete, Export, Delete)
- **ExperimentHudComponent**: Status display (mode, scan count)
- **ScanGridComponent**: Scan data table
- **ScanCaptureComponent**: Keyboard event handler

### Services

- **ExperimentStateService**: Application state management using Angular Signals
- **ScanPersistenceService**: PouchDB persistence and CSV export

### Data Model

```typescript
interface ScanRow {
  experimentId: string;        // UUID for experiment
  userName: string;
  targetScanStyle: 'compliant' | 'non_compliant';
  targetClusterSize: number;
  scanIndex: number;           // 0-based index
  timestampMs: number;         // Absolute timestamp
  deltaMs: number | null;      // Time since last scan
  elapsedMs: number;           // Time since first scan
  barcode: string;             // Captured barcode
}
```

## Testing

The application includes comprehensive unit tests:

- **State management tests**: Validates state transitions and scan logic
- **Timing calculation tests**: Ensures accurate deltaMs and elapsedMs
- **Persistence tests**: Verifies database operations and CSV export
- **Form validation tests**: Checks button enable/disable logic

Run tests with:

```bash
npm test
```

## Deployment

### GitHub Pages

The repository includes a GitHub Actions workflow that automatically:

1. Runs tests on push to main branch
2. Builds production bundle
3. Deploys to GitHub Pages

The application will be available at: `https://<user>.github.io/scan-lab-observations/`

## Browser Compatibility

- Modern browsers with ES2020+ support
- IndexedDB support required for PouchDB
- Local Storage required for username persistence

## License

See repository license file.

## Contributing

This is a research tool. For questions or issues, please open a GitHub issue.
