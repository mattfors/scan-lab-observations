import { Injectable, signal, effect } from '@angular/core';
import { ExperimentStateService } from './experiment-state.service';

@Injectable({
  providedIn: 'root'
})
export class TextToSpeechService {
  private readonly mutedSignal = signal<boolean>(false);
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  
  readonly muted = this.mutedSignal.asReadonly();

  constructor(private stateService: ExperimentStateService) {
    // Load muted state from localStorage
    const savedMuted = localStorage.getItem('scan-lab-tts-muted');
    if (savedMuted !== null) {
      this.mutedSignal.set(savedMuted === 'true');
    }

    // Watch for scan count changes and announce them
    effect(() => {
      const count = this.stateService.scanCount();
      const mode = this.stateService.mode();
      
      // Only announce when in RUNNING mode and not muted
      if (mode === 'RUNNING' && !this.mutedSignal() && count > 0) {
        this.announceScanCount(count);
      }
    });
  }

  toggleMute(): void {
    const newMuted = !this.mutedSignal();
    this.mutedSignal.set(newMuted);
    localStorage.setItem('scan-lab-tts-muted', newMuted.toString());
    
    // Cancel any ongoing speech when muting
    if (newMuted) {
      this.cancelSpeech();
    }
  }

  setMuted(muted: boolean): void {
    this.mutedSignal.set(muted);
    localStorage.setItem('scan-lab-tts-muted', muted.toString());
    
    if (muted) {
      this.cancelSpeech();
    }
  }

  private announceScanCount(count: number): void {
    // Cancel any ongoing speech to prevent stacking
    this.cancelSpeech();

    // Create new utterance
    const text = `${count}`;
    this.currentUtterance = new SpeechSynthesisUtterance(text);
    
    // Configure speech properties for quick, clear announcements
    this.currentUtterance.rate = 1.2;
    this.currentUtterance.pitch = 1.0;
    this.currentUtterance.volume = 1.0;
    
    // Clean up reference when speech ends
    this.currentUtterance.onend = () => {
      this.currentUtterance = null;
    };

    // Speak the count
    window.speechSynthesis.speak(this.currentUtterance);
  }

  private cancelSpeech(): void {
    // Cancel all pending and ongoing speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
  }
}
