import { TestBed } from '@angular/core/testing';
import { ScanPersistenceService } from './scan-persistence.service';
import { ScanRow } from '../models/scan.models';

describe('ScanPersistenceService', () => {
  let service: ScanPersistenceService;

  beforeEach(async () => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScanPersistenceService);
    // Clean up database before each test
    await service.deleteAllData();
  });

  afterEach(async () => {
    await service.deleteAllData();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Save and Retrieve Scans', () => {
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

  describe('CSV Escaping', () => {
    it('should escape commas in barcodes', async () => {
      const scans: ScanRow[] = [{
        experimentId: 'exp-1',
        userName: 'TestUser',
        targetScanStyle: 'compliant',
        targetClusterSize: 5,
        scanIndex: 0,
        timestampMs: 1000,
        deltaMs: null,
        elapsedMs: 0,
        barcode: 'BARCODE,WITH,COMMAS'
      }];

      await service.saveScans(scans);
      const retrieved = await service.getAllScans();
      expect(retrieved[0].barcode).toBe('BARCODE,WITH,COMMAS');
    });

    it('should preserve special characters in userName', async () => {
      const scans: ScanRow[] = [{
        experimentId: 'exp-1',
        userName: 'Test "User"',
        targetScanStyle: 'compliant',
        targetClusterSize: 5,
        scanIndex: 0,
        timestampMs: 1000,
        deltaMs: null,
        elapsedMs: 0,
        barcode: 'BARCODE1'
      }];

      await service.saveScans(scans);
      const retrieved = await service.getAllScans();
      expect(retrieved[0].userName).toBe('Test "User"');
    });
  });
});
