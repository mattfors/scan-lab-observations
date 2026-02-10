import { Component, HostListener, inject } from '@angular/core';
import { ExperimentStateService } from '../../services/experiment-state.service';

@Component({
  selector: 'app-scan-capture',
  imports: [],
  templateUrl: './scan-capture.html',
  styleUrl: './scan-capture.css',
})
export class ScanCapture {
  private readonly stateService = inject(ExperimentStateService);
  private buffer = '';

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    // Only capture when in RUNNING mode
    if (this.stateService.mode() !== 'RUNNING') {
      return;
    }

    // Check for Enter/CR/LF
    if (event.key === 'Enter') {
      event.preventDefault();
      
      if (this.buffer.trim().length > 0) {
        this.stateService.recordScan(this.buffer);
        this.buffer = '';
      }
    } else if (event.key.length === 1) {
      // Only add printable characters
      this.buffer += event.key;
    } else if (event.key === 'Backspace' && this.buffer.length > 0) {
      this.buffer = this.buffer.slice(0, -1);
    }
  }
}
