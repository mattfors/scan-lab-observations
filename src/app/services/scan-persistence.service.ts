import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import { ScanRow } from '../models/scan.models';

// Global variable to override adapter for testing
declare global {
  interface Window {
    __POUCHDB_TEST_ADAPTER__?: string;
  }
}

@Injectable({
  providedIn: 'root'
})
export class ScanPersistenceService {
  private db: PouchDB.Database;

  constructor() {
    this.db = this.createDatabase();
  }

  private createDatabase(): PouchDB.Database {
    const adapter = typeof window !== 'undefined' ? window.__POUCHDB_TEST_ADAPTER__ : undefined;
    const options = adapter ? { adapter } : {};
    return new PouchDB('scan-lab-observations', options);
  }

  async saveScans(scans: ScanRow[]): Promise<void> {
    if (scans.length === 0) {
      return;
    }

    const docs = scans.map(scan => ({
      ...scan,
      _id: `${scan.experimentId}_${scan.scanIndex}`
    }));

    await this.db.bulkDocs(docs);
  }

  async getAllScans(): Promise<ScanRow[]> {
    const result = await this.db.allDocs<ScanRow>({ include_docs: true });
    return result.rows
      .filter((row: any) => row.doc)
      .map((row: any) => row.doc as ScanRow);
  }

  async getTotalScanCount(): Promise<number> {
    const result = await this.db.allDocs();
    return result.total_rows;
  }

  async getTotalExperimentCount(): Promise<number> {
    const scans = await this.getAllScans();
    const uniqueExperimentIds = new Set(scans.map(scan => scan.experimentId));
    return uniqueExperimentIds.size;
  }

  async exportToCSV(): Promise<void> {
    const scans = await this.getAllScans();
    
    if (scans.length === 0) {
      alert('No data to export');
      return;
    }

    // Sort by timestampMs ascending, then scanIndex ascending, then experimentId
    scans.sort((a, b) => {
      if (a.timestampMs !== b.timestampMs) {
        return a.timestampMs - b.timestampMs;
      }
      if (a.scanIndex !== b.scanIndex) {
        return a.scanIndex - b.scanIndex;
      }
      return a.experimentId.localeCompare(b.experimentId);
    });

    // Build CSV with exact column order from spec
    const headers = [
      'experimentId',
      'userName',
      'targetScanStyle',
      'targetClusterSize',
      'scanIndex',
      'timestampMs',
      'deltaMs',
      'elapsedMs',
      'barcode'
    ];

    const csvRows = [headers.join(',')];
    
    for (const scan of scans) {
      const row = [
        scan.experimentId,
        this.escapeCSV(scan.userName),
        scan.targetScanStyle,
        scan.targetClusterSize !== null ? scan.targetClusterSize.toString() : '',
        scan.scanIndex.toString(),
        scan.timestampMs.toString(),
        scan.deltaMs !== null ? scan.deltaMs.toString() : '',
        scan.elapsedMs.toString(),
        this.escapeCSV(scan.barcode)
      ];
      csvRows.push(row.join(','));
    }

    const csv = csvRows.join('\n');
    
    // Generate filename with timestamp
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const filename = `scan-lab-observations_${year}-${month}-${day}_${hours}${minutes}${seconds}.csv`;
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  async deleteAllData(): Promise<void> {
    await this.db.destroy();
    this.db = this.createDatabase();
  }
}
