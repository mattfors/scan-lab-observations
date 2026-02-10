export type TargetScanStyle = 'compliant' | 'non_compliant';
export type ExperimentMode = 'CONFIG' | 'RUNNING';

export interface ScanRow {
  experimentId: string;
  userName: string;
  targetScanStyle: TargetScanStyle;
  targetClusterSize: number;
  scanIndex: number;
  timestampMs: number;
  deltaMs: number | null;
  elapsedMs: number;
  barcode: string;
  _id?: string;
}

export interface ExperimentConfig {
  userName: string;
  targetScanStyle: TargetScanStyle | '';
  targetClusterSize: number | null;
}
