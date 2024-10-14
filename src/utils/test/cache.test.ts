import NodeCache from 'node-cache';
import CacheUtil from '../cache';

describe('CacheUtil', () => {
  let cacheInstance: NodeCache;
  let mockSet;
  let mockGet;
  let mockFlushAll;

  beforeEach(() => {
    cacheInstance = new NodeCache();
    mockSet = jest.spyOn(cacheInstance, 'set').mockReturnValue(true);
    mockGet = jest.spyOn(cacheInstance, 'get').mockReturnValue(undefined);
    mockFlushAll = jest.spyOn(cacheInstance, 'flushAll').mockImplementation();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (CacheUtil as any).cacheService = cacheInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('set', () => {
    it('should set a value in the cache with default TTL', () => {
      const key = 'test-key';
      const value = { data: 'test-value' };
      const ttl = 3600;

      const result = CacheUtil.set(key, value);

      expect(mockSet).toHaveBeenCalledWith(key, value, ttl);
      expect(result).toBe(true);
    });

    it('should set a value in the cache with custom TTL', () => {
      const key = 'custom-key';
      const value = { data: 'custom-value' };
      const ttl = 600;

      const result = CacheUtil.set(key, value, ttl);

      expect(mockSet).toHaveBeenCalledWith(key, value, ttl);
      expect(result).toBe(true);
    });
  });

  describe('get', () => {
    it('should get a value from the cache', () => {
      const key = 'test-key';
      const cachedValue = { data: 'test-value' };

      mockGet.mockReturnValue(cachedValue);

      const result = CacheUtil.get<typeof cachedValue>(key);

      expect(mockGet).toHaveBeenCalledWith(key);
      expect(result).toEqual(cachedValue);
    });

    it('should return undefined if key is not found in cache', () => {
      const key = 'non-existing-key';

      const result = CacheUtil.get(key);

      expect(mockGet).toHaveBeenCalledWith(key);
      expect(result).toBeUndefined();
    });
  });

  describe('clearAllCache', () => {
    it('should clear all cache', () => {
      CacheUtil.clearAllCache();

      expect(mockFlushAll).toHaveBeenCalled();
    });
  });
});
