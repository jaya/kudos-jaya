import NodeCache from 'node-cache';
import { RequestContext } from '@/context/RequestContext';

class CacheUtil {
  constructor(protected cacheService = new NodeCache()) {}

  private getTenantKey(key: string): string {
    try {
      const { teamId } = RequestContext.get();
      return `tenant:${teamId}:${key}`;
    } catch {
      // RequestContext not available, use key as-is for backward compatibility
      return key;
    }
  }

  // TTL in seconds
  public set<T>(key: string, value: T, ttl = 3600): boolean {
    return this.cacheService.set(this.getTenantKey(key), value, ttl);
  }

  public get<T>(key: string): T | undefined {
    return this.cacheService.get<T>(this.getTenantKey(key));
  }

  public clearAllCache(): void {
    return this.cacheService.flushAll();
  }
}

export default new CacheUtil();
