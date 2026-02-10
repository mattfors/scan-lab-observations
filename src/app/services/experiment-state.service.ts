import { Injectable, signal, computed } from '@angular/core';
import { ExperimentMode, ScanRow, TargetScanStyle } from '../models/scan.models';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class ExperimentStateService {
  // State signals
  private readonly modeSignal = signal<ExperimentMode>('CONFIG');
  private readonly scansSignal = signal<ScanRow[]>([]);
  private readonly userNameSignal = signal<string>('');
  private readonly targetScanStyleSignal = signal<TargetScanStyle | ''>('');
  private readonly targetClusterSizeSignal = signal<number | null>(null);
  private readonly statisticsRefreshSignal = signal<number>(0);
  
  private currentExperimentId: string = '';
  private firstScanTimestamp: number = 0;
  private lastScanTimestamp: number = 0;

  // Public read-only signals
  readonly mode = this.modeSignal.asReadonly();
  readonly scans = this.scansSignal.asReadonly();
  readonly userName = this.userNameSignal.asReadonly();
  readonly targetScanStyle = this.targetScanStyleSignal.asReadonly();
  readonly targetClusterSize = this.targetClusterSizeSignal.asReadonly();
  readonly statisticsRefresh = this.statisticsRefreshSignal.asReadonly();

  // Computed signals
  readonly scanCount = computed(() => this.scansSignal().length);
  
  readonly canStart = computed(() => {
    const userName = this.userNameSignal();
    const style = this.targetScanStyleSignal();
    const size = this.targetClusterSizeSignal();
    
    // Username and style are always required
    if (userName.trim() === '' || style === '') {
      return false;
    }
    
    // For compliant scanning, cluster size must be >= 1
    if (style === 'compliant') {
      return size !== null && size >= 1;
    }
    
    // For non-compliant scanning, cluster size is optional
    if (style === 'non_compliant') {
      return true;
    }
    
    return false;
  });

  constructor() {
    // Load last username from localStorage
    const savedUserName = localStorage.getItem('scan-lab-userName');
    if (savedUserName) {
      this.userNameSignal.set(savedUserName);
    }
  }

  updateUserName(userName: string): void {
    this.userNameSignal.set(userName);
    localStorage.setItem('scan-lab-userName', userName);
  }

  updateTargetScanStyle(style: TargetScanStyle | ''): void {
    this.targetScanStyleSignal.set(style);
  }

  updateTargetClusterSize(size: number | null): void {
    this.targetClusterSizeSignal.set(size);
  }

  startExperiment(): void {
    if (!this.canStart()) {
      return;
    }

    this.currentExperimentId = uuidv4();
    this.firstScanTimestamp = 0;
    this.lastScanTimestamp = 0;
    this.scansSignal.set([]);
    this.modeSignal.set('RUNNING');
  }

  recordScan(barcode: string): void {
    if (this.modeSignal() !== 'RUNNING') {
      return;
    }

    const timestampMs = Date.now();
    const scanIndex = this.scansSignal().length;
    
    let deltaMs: number | null = null;
    let elapsedMs = 0;
    
    if (scanIndex === 0) {
      // First scan
      this.firstScanTimestamp = timestampMs;
      this.lastScanTimestamp = timestampMs;
      deltaMs = null;
      elapsedMs = 0;
    } else {
      deltaMs = timestampMs - this.lastScanTimestamp;
      elapsedMs = timestampMs - this.firstScanTimestamp;
      this.lastScanTimestamp = timestampMs;
    }

    const scan: ScanRow = {
      experimentId: this.currentExperimentId,
      userName: this.userNameSignal(),
      targetScanStyle: this.targetScanStyleSignal() as TargetScanStyle,
      targetClusterSize: this.targetClusterSizeSignal(),
      scanIndex,
      timestampMs,
      deltaMs,
      elapsedMs,
      barcode
    };

    this.scansSignal.update(scans => [...scans, scan]);
  }

  completeExperiment(): ScanRow[] {
    const scans = [...this.scansSignal()];
    
    // Reset for next experiment but preserve userName
    this.targetScanStyleSignal.set('');
    this.targetClusterSizeSignal.set(null);
    this.scansSignal.set([]);
    this.modeSignal.set('CONFIG');
    this.currentExperimentId = '';
    this.firstScanTimestamp = 0;
    this.lastScanTimestamp = 0;
    
    return scans;
  }

  resetForm(): void {
    this.userNameSignal.set('');
    this.targetScanStyleSignal.set('');
    this.targetClusterSizeSignal.set(null);
    localStorage.removeItem('scan-lab-userName');
  }

  triggerStatisticsRefresh(): void {
    this.statisticsRefreshSignal.update(v => v + 1);
  }
}
