import { runTransaction, updateDoc } from 'firebase/firestore';
import { executeDemoCallFlow } from './demoCallService';

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(() => ({ id: 'mock-demo-call-id' })),
  getDoc: jest.fn(),
  runTransaction: jest.fn(),
  serverTimestamp: jest.fn(() => 'mock-timestamp'),
  updateDoc: jest.fn(),
}));

jest.mock('@/src/lib/firebase', () => ({
  db: {},
}));

describe('executeDemoCallFlow - Guard Logic', () => {
  const mockRunTransaction = runTransaction as jest.Mock;
  const mockFetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  it('should throw error if userId is not provided', async () => {
    await expect(executeDemoCallFlow('')).rejects.toThrow('User ID is required');
  });

  it('should throw error if user does not exist', async () => {
    mockRunTransaction.mockImplementation(async (_db, callback) => {
      const mockTransaction = {
        get: jest.fn().mockResolvedValue({ exists: () => false }),
        set: jest.fn(),
        update: jest.fn(),
      };
      await callback(mockTransaction);
    });

    await expect(executeDemoCallFlow('user123', {
      targetName: 'Test User',
      targetPhone: '+919876543210',
    })).rejects.toThrow('User not found');
  });

  it('should throw error if demo has already been used', async () => {
    mockRunTransaction.mockImplementation(async (_db, callback) => {
      const mockTransaction = {
        get: jest.fn().mockResolvedValue({
          exists: () => true,
          data: () => ({
            demoUsed: true,
            demoEligible: true,
          }),
        }),
        set: jest.fn(),
        update: jest.fn(),
      };
      await callback(mockTransaction);
    });

    await expect(executeDemoCallFlow('user123', {
      targetName: 'Test User',
      targetPhone: '+919876543210',
    })).rejects.toThrow(
      'Demo call has already been used for this account'
    );
  });

  it('should throw error if user is not eligible for demo', async () => {
    mockRunTransaction.mockImplementation(async (_db, callback) => {
      const mockTransaction = {
        get: jest.fn().mockResolvedValue({
          exists: () => true,
          data: () => ({
            demoUsed: false,
            demoEligible: false,
          }),
        }),
        set: jest.fn(),
        update: jest.fn(),
      };
      await callback(mockTransaction);
    });

    await expect(executeDemoCallFlow('user123', {
      targetName: 'Test User',
      targetPhone: '+919876543210',
    })).rejects.toThrow(
      'User is not eligible for demo call'
    );
  });

  it('should proceed if user is eligible and has not used demo', async () => {
    const mockUpdateDoc = updateDoc as jest.Mock;
    mockUpdateDoc.mockResolvedValue(undefined);
    mockFetch.mockResolvedValue({
      status: 200,
    });

    mockRunTransaction.mockImplementation(async (_db, callback) => {
      const mockTransaction = {
        get: jest.fn().mockResolvedValue({
          exists: () => true,
          data: () => ({
            demoUsed: false,
            demoEligible: true,
          }),
        }),
        set: jest.fn(),
        update: jest.fn(),
      };
      await callback(mockTransaction);
    });

    const result = await executeDemoCallFlow('user123', {
      targetName: 'Test User',
      targetPhone: '+919876543210',
    });

    expect(result).toHaveProperty('demoCallId');
    expect(result).toHaveProperty('status', 'in_progress');
    expect(result).toHaveProperty('transcript', '');

    expect(mockFetch).toHaveBeenCalledWith(
      'http://165.22.222.202:5678/webhook/ringg-init',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetName: 'Test User',
          targetPhone: '+919876543210',
          demoCallId: 'mock-demo-call-id',
          userId: 'user123',
        }),
      }
    );
  });

});
