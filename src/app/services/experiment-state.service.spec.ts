import { TestBed } from '@angular/core/testing';
import { ExperimentStateService } from './experiment-state.service';

describe('ExperimentStateService', () => {
  let service: ExperimentStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExperimentStateService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start in CONFIG mode', () => {
    expect(service.mode()).toBe('CONFIG');
  });

  it('should have scan count of 0 initially', () => {
    expect(service.scanCount()).toBe(0);
  });

  describe('Form Validation', () => {
    it('should not allow start when form is incomplete', () => {
      expect(service.canStart()).toBe(false);
    });

    it('should not allow start when userName is empty', () => {
      service.updateTargetScanStyle('compliant');
      service.updateTargetClusterSize(5);
      expect(service.canStart()).toBe(false);
    });

    it('should not allow start when targetScanStyle is not selected', () => {
      service.updateUserName('TestUser');
      service.updateTargetClusterSize(5);
      expect(service.canStart()).toBe(false);
    });

    it('should not allow start when targetClusterSize is null', () => {
      service.updateUserName('TestUser');
      service.updateTargetScanStyle('compliant');
      expect(service.canStart()).toBe(false);
    });

    it('should allow start when targetClusterSize is 1 for compliant', () => {
      service.updateUserName('TestUser');
      service.updateTargetScanStyle('compliant');
      service.updateTargetClusterSize(1);
      expect(service.canStart()).toBe(true);
    });

    it('should allow start when all fields are valid', () => {
      service.updateUserName('TestUser');
      service.updateTargetScanStyle('compliant');
      service.updateTargetClusterSize(5);
      expect(service.canStart()).toBe(true);
    });
  });

  describe('Experiment Lifecycle', () => {
    beforeEach(() => {
      service.updateUserName('TestUser');
      service.updateTargetScanStyle('compliant');
      service.updateTargetClusterSize(5);
    });

    it('should transition to RUNNING state when started', () => {
      service.startExperiment();
      expect(service.mode()).toBe('RUNNING');
    });

    it('should ignore scans when in CONFIG mode', () => {
      service.recordScan('BARCODE123');
      expect(service.scanCount()).toBe(0);
    });

    it('should record scans when in RUNNING mode', () => {
      service.startExperiment();
      service.recordScan('BARCODE123');
      expect(service.scanCount()).toBe(1);
    });

    it('should return to CONFIG mode when completed', () => {
      service.startExperiment();
      service.completeExperiment();
      expect(service.mode()).toBe('CONFIG');
    });

    it('should clear scans when completed', () => {
      service.startExperiment();
      service.recordScan('BARCODE123');
      service.completeExperiment();
      expect(service.scanCount()).toBe(0);
    });

    it('should preserve userName when completed', () => {
      service.startExperiment();
      service.completeExperiment();
      expect(service.userName()).toBe('TestUser');
    });

    it('should reset targetScanStyle when completed', () => {
      service.startExperiment();
      service.completeExperiment();
      expect(service.targetScanStyle()).toBe('');
    });

    it('should reset targetClusterSize when completed', () => {
      service.startExperiment();
      service.completeExperiment();
      expect(service.targetClusterSize()).toBe(null);
    });

    it('should return scans array when completed', () => {
      service.startExperiment();
      service.recordScan('BARCODE123');
      service.recordScan('BARCODE456');
      const scans = service.completeExperiment();
      expect(scans.length).toBe(2);
    });
  });

  describe('Scan Timing', () => {
    beforeEach(() => {
      service.updateUserName('TestUser');
      service.updateTargetScanStyle('compliant');
      service.updateTargetClusterSize(5);
      service.startExperiment();
    });

    it('should set deltaMs to null for first scan', () => {
      service.recordScan('FIRST');
      const scans = service.completeExperiment();
      expect(scans[0].deltaMs).toBe(null);
    });

    it('should set elapsedMs to 0 for first scan', () => {
      service.recordScan('FIRST');
      const scans = service.completeExperiment();
      expect(scans[0].elapsedMs).toBe(0);
    });

    it('should set scanIndex to 0 for first scan', () => {
      service.recordScan('FIRST');
      const scans = service.completeExperiment();
      expect(scans[0].scanIndex).toBe(0);
    });

    it('should increment scanIndex for each scan', () => {
      service.recordScan('FIRST');
      service.recordScan('SECOND');
      service.recordScan('THIRD');
      const scans = service.completeExperiment();
      expect(scans[0].scanIndex).toBe(0);
      expect(scans[1].scanIndex).toBe(1);
      expect(scans[2].scanIndex).toBe(2);
    });

    it('should calculate deltaMs for subsequent scans', async () => {
      service.recordScan('FIRST');
      await new Promise(resolve => setTimeout(resolve, 10));
      service.recordScan('SECOND');
      const scans = service.completeExperiment();
      expect(scans[1].deltaMs).toBeGreaterThan(0);
    });

    it('should calculate elapsedMs for subsequent scans', async () => {
      service.recordScan('FIRST');
      await new Promise(resolve => setTimeout(resolve, 10));
      service.recordScan('SECOND');
      const scans = service.completeExperiment();
      expect(scans[1].elapsedMs).toBeGreaterThan(0);
    });

    it('should store barcode exactly as provided', () => {
      service.recordScan('  BARCODE WITH SPACES  ');
      const scans = service.completeExperiment();
      expect(scans[0].barcode).toBe('  BARCODE WITH SPACES  ');
    });

    it('should include experiment metadata in each scan', () => {
      service.recordScan('BARCODE123');
      const scans = service.completeExperiment();
      expect(scans[0].userName).toBe('TestUser');
      expect(scans[0].targetScanStyle).toBe('compliant');
      expect(scans[0].targetClusterSize).toBe(5);
      expect(scans[0].experimentId).toBeTruthy();
    });
  });

  describe('LocalStorage Persistence', () => {
    it('should save userName to localStorage', () => {
      service.updateUserName('TestUser');
      expect(localStorage.getItem('scan-lab-userName')).toBe('TestUser');
    });

    it('should load userName from localStorage on init', () => {
      localStorage.setItem('scan-lab-userName', 'SavedUser');
      // Create a fresh service instance
      const freshService = new ExperimentStateService();
      expect(freshService.userName()).toBe('SavedUser');
    });
  });
});
