import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExperimentStateService } from '../../services/experiment-state.service';
import { ScanPersistenceService } from '../../services/scan-persistence.service';

@Component({
  selector: 'app-stored-data-stats',
  imports: [CommonModule],
  templateUrl: './stored-data-stats.html',
  styleUrl: './stored-data-stats.css',
})
export class StoredDataStats implements OnInit {
  private readonly stateService = inject(ExperimentStateService);
  private readonly persistenceService = inject(ScanPersistenceService);
  
  readonly totalScans = signal<number>(0);
  readonly totalExperiments = signal<number>(0);

  constructor() {
    // Watch for statistics refresh signal changes
    effect(() => {
      this.stateService.statisticsRefresh();
      this.loadStatistics();
    });
  }

  async ngOnInit() {
    await this.loadStatistics();
  }

  async loadStatistics() {
    try {
      const [scans, experiments] = await Promise.all([
        this.persistenceService.getTotalScanCount(),
        this.persistenceService.getTotalExperimentCount()
      ]);
      this.totalScans.set(scans);
      this.totalExperiments.set(experiments);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  }
}
