import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExperimentStateService } from '../../services/experiment-state.service';

@Component({
  selector: 'app-scan-grid',
  imports: [CommonModule],
  templateUrl: './scan-grid.html',
  styleUrl: './scan-grid.css',
})
export class ScanGrid {
  private readonly stateService = inject(ExperimentStateService);

  readonly scansReversed = computed(() => {
    const scans = this.stateService.scans();
    return [...scans].reverse();
  });
}
