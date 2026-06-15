import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContextData {
  teamId: string;
  enterpriseId: string | null;
  userId: string;
  botToken: string;
  correlationId: string;
}

export class RequestContext {
  private static storage = new AsyncLocalStorage<RequestContext>();

  constructor(private data: RequestContextData) {}

  get teamId(): string {
    return this.data.teamId;
  }

  get enterpriseId(): string | null {
    return this.data.enterpriseId;
  }

  get userId(): string {
    return this.data.userId;
  }

  get botToken(): string {
    return this.data.botToken;
  }

  get correlationId(): string {
    return this.data.correlationId;
  }

  static get(): RequestContext {
    const context = this.storage.getStore();
    if (!context) {
      throw new Error(
        'RequestContext not available - handler must initialize context',
      );
    }
    return context;
  }

  static run<T>(context: RequestContext, fn: () => T): T {
    return this.storage.run(context, fn);
  }

  static async runAsync<T>(
    context: RequestContext,
    fn: () => Promise<T>,
  ): Promise<T> {
    return this.storage.run(context, fn);
  }
}
