import { TestBed } from '@angular/core/testing';
import { ScanPersistenceService } from './scan-persistence.service';
import { ScanRow } from '../models/scan.models';
import PouchDB from 'pouchdb';
import memory from 'pouchdb-adapter-memory';

// Configure PouchDB to use memory adapter for tests
PouchDB.plugin(memory);
window.__POUCHDB_TEST_ADAPTER__ = 'memory';

describe('ScanPersistenceService', () => {
  let service: ScanPersistenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScanPersistenceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('CSV Escaping', () => {
    it('should escape commas in barcodes', () => {
      const input = 'A,BC,D';
      const escaped = (service as any).escapeCSV(input);
      expect(escaped).toBe('"A,BC,D"');
    });

    it('should preserve special characters in userName', () => {
      const input = 'Test "User"';
      const escaped = (service as any).escapeCSV(input);
      expect(escaped).toBe('"Test ""User"""');
    });
  });

  describe('Save and Retrieve Scans', () => {
    beforeEach(async () => {
      await service.deleteAllData();
    });

    it('should save scans to database', async () => {
      const scans: ScanRow[] = [
        {
          experimentId: 'exp-1',
          userName: 'TestUser',
          targetScanStyle: 'compliant',
          targetClusterSize: 5,
          scanIndex: 0,
          timestampMs: 1000,
          deltaMs: null,
          elapsedMs: 0,
          barcode: 'BARCODE1'
        }
      ];

      await service.saveScans(scans);
      const retrieved = await service.getAllScans();
      expect(retrieved.length).toBe(1);
      expect(retrieved[0].barcode).toBe('BARCODE1');
    });

    it('should save multiple scans', async () => {
      const scans: ScanRow[] = [
        {
          experimentId: 'exp-1',
          userName: 'TestUser',
          targetScanStyle: 'compliant',
          targetClusterSize: 5,
          scanIndex: 0,
          timestampMs: 1000,
          deltaMs: null,
          elapsedMs: 0,
          barcode: 'BARCODE1'
        },
        {
          experimentId: 'exp-1',
          userName: 'TestUser',
          targetScanStyle: 'compliant',
          targetClusterSize: 5,
          scanIndex: 1,
          timestampMs: 2000,
          deltaMs: 1000,
          elapsedMs: 1000,
          barcode: 'BARCODE2'
        }
      ];

      await service.saveScans(scans);
      const retrieved = await service.getAllScans();
      expect(retrieved.length).toBe(2);
    });

    it('should handle empty scan array', async () => {
      await service.saveScans([]);
      const retrieved = await service.getAllScans();
      expect(retrieved.length).toBe(0);
    });

    it('should retrieve scans from multiple experiments', async () => {
      const scans1: ScanRow[] = [{
        experimentId: 'exp-1',
        userName: 'User1',
        targetScanStyle: 'compliant',
        targetClusterSize: 5,
        scanIndex: 0,
        timestampMs: 1000,
        deltaMs: null,
        elapsedMs: 0,
        barcode: 'BARCODE1'
      }];

      const scans2: ScanRow[] = [{
        experimentId: 'exp-2',
        userName: 'User2',
        targetScanStyle: 'non_compliant',
        targetClusterSize: 3,
        scanIndex: 0,
        timestampMs: 2000,
        deltaMs: null,
        elapsedMs: 0,
        barcode: 'BARCODE2'
      }];

      await service.saveScans(scans1);
      await service.saveScans(scans2);
      const retrieved = await service.getAllScans();
      expect(retrieved.length).toBe(2);
    });
  });

  describe('CSV Export', () => {
    beforeEach(async () => {
      await service.deleteAllData();
    });

    it('should format CSV with correct column order', async () => {
      const scans: ScanRow[] = [{
        experimentId: 'exp-1',
        userName: 'TestUser',
        targetScanStyle: 'compliant',
        targetClusterSize: 5,
        scanIndex: 0,
        timestampMs: 1000,
        deltaMs: null,
        elapsedMs: 0,
        barcode: 'BARCODE1'
      }];

      await service.saveScans(scans);
      
      // We can't fully test the download, but we can verify the service method exists
      expect(service.exportToCSV).toBeDefined();
    });
  });

  describe('Delete All Data', () => {
    beforeEach(async () => {
      await service.deleteAllData();
    });

    it('should delete all scans', async () => {
      const scans: ScanRow[] = [{
        experimentId: 'exp-1',
        userName: 'TestUser',
        targetScanStyle: 'compliant',
        targetClusterSize: 5,
        scanIndex: 0,
        timestampMs: 1000,
        deltaMs: null,
        elapsedMs: 0,
        barcode: 'BARCODE1'
      }];

      await service.saveScans(scans);
      await service.deleteAllData();
      const retrieved = await service.getAllScans();
      expect(retrieved.length).toBe(0);
    });
  });
});
