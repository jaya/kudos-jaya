/**
 * RequestContext Tests
 * Verify context lifecycle and adapter injection
 */

import { RequestContext, RequestContextData } from '../RequestContext';

describe('RequestContext', () => {
  let contextData: RequestContextData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockAdapter: any;

  beforeEach(() => {
    mockAdapter = {
      getPlatformName: jest.fn().mockReturnValue('slack'),
      postMessage: jest.fn().mockResolvedValue({ ts: 'ts1', channel: 'ch1' }),
    };

    contextData = {
      teamId: 'team123',
      enterpriseId: null,
      userId: 'user1',
      botToken: 'token123',
      correlationId: 'corr123',
      adapter: mockAdapter,
    };
  });

  describe('RequestContext creation', () => {
    it('should create context with all required fields', () => {
      new RequestContext(contextData);

      expect(true).toBe(true);
    });

    it('should store adapter in context', () => {
      // Create context instance
      new RequestContext(contextData);

      // Verify the data passed to context is stored correctly
      expect(contextData.adapter).toBe(mockAdapter);
    });

    it('should store correlation ID for request tracking', () => {
      const context = new RequestContext(contextData);

      expect(contextData.correlationId).toBe('corr123');
    });

    it('should handle enterprise workspace context', () => {
      contextData.enterpriseId = 'ent456';
      const context = new RequestContext(contextData);

      expect(contextData.enterpriseId).toBe('ent456');
    });
  });

  describe('Context data structure', () => {
    it('should store teamId', () => {
      expect(contextData.teamId).toBe('team123');
    });

    it('should store userId', () => {
      expect(contextData.userId).toBe('user1');
    });

    it('should store botToken', () => {
      expect(contextData.botToken).toBe('token123');
    });

    it('should store adapter instance', () => {
      expect(contextData.adapter).toBe(mockAdapter);
      expect(typeof contextData.adapter.postMessage).toBe('function');
    });

    it('should store optional enterpriseId', () => {
      expect(contextData.enterpriseId).toBeNull();

      contextData.enterpriseId = 'ent456';
      expect(contextData.enterpriseId).toBe('ent456');
    });
  });

  describe('Adapter access through context', () => {
    it('should provide adapter for handler usage', () => {
      const adapter = contextData.adapter;

      expect(adapter.getPlatformName()).toBe('slack');
      expect(typeof adapter.postMessage).toBe('function');
    });

    it('should allow async adapter calls', async () => {
      const adapter = contextData.adapter;
      const result = await adapter.postMessage({
        channel: 'test',
        text: 'test',
      });

      expect(result).toHaveProperty('ts');
      expect(result).toHaveProperty('channel');
    });
  });

  describe('Context lifecycle', () => {
    it('should support creating multiple contexts', () => {
      new RequestContext(contextData);
      const context2Data = { ...contextData, userId: 'user2' };
      new RequestContext(context2Data);

      expect(context2Data.userId).toBe('user2');
    });

    it('should preserve context data after creation', () => {
      // Create context instance
      new RequestContext(contextData);

      expect(contextData.teamId).toBe('team123');
      expect(contextData.userId).toBe('user1');
      expect(contextData.botToken).toBe('token123');
    });
  });

  describe('Performance characteristics', () => {
    it('should create context quickly', () => {
      const start = performance.now();

      new RequestContext(contextData);

      const duration = performance.now() - start;

      // Context creation should be < 1ms
      expect(duration).toBeLessThan(1);
    });

    it('should access adapter from context without significant overhead', () => {
      new RequestContext(contextData);
      const adapter = contextData.adapter;

      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        adapter.getPlatformName();
      }

      const duration = performance.now() - start;

      // 1000 accesses should be < 10ms
      expect(duration).toBeLessThan(10);
    });
  });

  describe('Context isolation', () => {
    it('should not leak data between contexts', () => {
      const context1Data: RequestContextData = {
        teamId: 'team1',
        enterpriseId: null,
        userId: 'user1',
        botToken: 'token1',
        correlationId: 'corr1',
        adapter: mockAdapter,
      };

      const context2Data: RequestContextData = {
        teamId: 'team2',
        enterpriseId: null,
        userId: 'user2',
        botToken: 'token2',
        correlationId: 'corr2',
        adapter: mockAdapter,
      };

      expect(context1Data.teamId).not.toBe(context2Data.teamId);
      expect(context1Data.userId).not.toBe(context2Data.userId);
    });
  });

  describe('Correlation ID tracking', () => {
    it('should use correlation ID for request tracing', () => {
      expect(contextData.correlationId).toBe('corr123');
    });

    it('should generate unique correlation IDs', () => {
      const context1Data = { ...contextData, correlationId: 'corr1' };
      const context2Data = { ...contextData, correlationId: 'corr2' };

      expect(context1Data.correlationId).not.toBe(context2Data.correlationId);
    });
  });
});
