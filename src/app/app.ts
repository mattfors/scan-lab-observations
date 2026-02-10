import { Component } from '@angular/core';
import { ExperimentConfig } from './components/experiment-config/experiment-config';
import { ExperimentControls } from './components/experiment-controls/experiment-controls';
import { ExperimentHud } from './components/experiment-hud/experiment-hud';
import { ScanGrid } from './components/scan-grid/scan-grid';
import { ScanCapture } from './components/scan-capture/scan-capture';
import { StoredDataStats } from './components/stored-data-stats/stored-data-stats';

@Component({
  selector: 'app-root',
  imports: [ExperimentConfig, ExperimentControls, ExperimentHud, ScanGrid, ScanCapture, StoredDataStats],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'Scan Lab Observations';
}
