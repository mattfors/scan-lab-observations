import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExperimentStateService } from '../../services/experiment-state.service';

@Component({
  selector: 'app-experiment-hud',
  imports: [CommonModule],
  templateUrl: './experiment-hud.html',
  styleUrl: './experiment-hud.css',
})
export class ExperimentHud {
  private readonly stateService = inject(ExperimentStateService);

  readonly mode = this.stateService.mode;
  readonly scanCount = this.stateService.scanCount;
}
