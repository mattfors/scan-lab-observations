import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExperimentStateService } from '../../services/experiment-state.service';
import { ScanPersistenceService } from '../../services/scan-persistence.service';
import { StoredDataStats } from '../stored-data-stats/stored-data-stats';

@Component({
  selector: 'app-experiment-controls',
  imports: [CommonModule, StoredDataStats],
  templateUrl: './experiment-controls.html',
  styleUrl: './experiment-controls.css',
})
export class ExperimentControls {
  private readonly stateService = inject(ExperimentStateService);
  private readonly persistenceService = inject(ScanPersistenceService);

  readonly mode = this.stateService.mode;
  readonly canStart = this.stateService.canStart;

  onStart(): void {
    this.stateService.startExperiment();
  }

  async onComplete(): Promise<void> {
    const scans = this.stateService.completeExperiment();
    if (scans.length > 0) {
      await this.persistenceService.saveScans(scans);
      this.stateService.triggerStatisticsRefresh();
      alert(`Experiment completed. ${scans.length} scans saved.`);
    } else {
      alert('Experiment completed. No scans recorded.');
    }
  }

  async onExport(): Promise<void> {
    await this.persistenceService.exportToCSV();
  }

  async onDeleteAll(): Promise<void> {
    const confirmed = confirm('This will permanently delete all local data. Are you sure?');
    if (confirmed) {
      await this.persistenceService.deleteAllData();
      this.stateService.triggerStatisticsRefresh();
      alert('All data deleted.');
    }
  }
}
