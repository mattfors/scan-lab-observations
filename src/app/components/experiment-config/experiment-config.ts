import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExperimentStateService } from '../../services/experiment-state.service';

@Component({
  selector: 'app-experiment-config',
  imports: [CommonModule, FormsModule],
  templateUrl: './experiment-config.html',
  styleUrl: './experiment-config.css',
})
export class ExperimentConfig {
  private readonly stateService = inject(ExperimentStateService);

  readonly mode = this.stateService.mode;
  readonly userName = this.stateService.userName;
  readonly targetScanStyle = this.stateService.targetScanStyle;
  readonly targetClusterSize = this.stateService.targetClusterSize;

  onUserNameChange(value: string): void {
    this.stateService.updateUserName(value);
  }

  onTargetScanStyleChange(value: string): void {
    this.stateService.updateTargetScanStyle(value as '' | 'compliant' | 'non_compliant');
  }

  onTargetClusterSizeChange(value: string): void {
    const num = parseInt(value, 10);
    this.stateService.updateTargetClusterSize(isNaN(num) ? null : num);
  }
}
