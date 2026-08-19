export interface MessagePublisher {
  postMessage(params: {
    channel: string;
    text: string;
    blocks?: Record<string, unknown>[];
    thread_ts?: string;
    metadata?: Record<string, unknown>;
  }): Promise<{ ts: string; channel: string }>;

  updateMessage(params: {
    channel: string;
    ts: string;
    text: string;
    blocks?: Record<string, unknown>[];
  }): Promise<void>;

  deleteMessage(params: { channel: string; ts: string }): Promise<void>;
}
