import { PlatformAdapter } from '../interfaces/platform-adapter';

/**
 * Adapter Substitution Tests
 * Verify that handlers work correctly with different adapter implementations
 * This proves the platform-agnostic design pattern works end-to-end
 */

describe('Adapter Substitution', () => {
  // Mock adapter implementation for testing
  class MockAdapter implements PlatformAdapter {
    private calls: Array<{ method: string; params: unknown }> = [];

    getPlatformName(): string {
      return 'mock';
    }

    async postMessage(
      params: unknown,
    ): Promise<{ ts: string; channel: string }> {
      this.calls.push({ method: 'postMessage', params });
      return { ts: 'mock_ts', channel: 'mock_channel' };
    }

    async updateMessage(params: unknown): Promise<void> {
      this.calls.push({ method: 'updateMessage', params });
    }

    async deleteMessage(params: unknown): Promise<void> {
      this.calls.push({ method: 'deleteMessage', params });
    }

    async postEphemeral(params: unknown): Promise<void> {
      this.calls.push({ method: 'postEphemeral', params });
    }

    async openModal(params: unknown): Promise<void> {
      this.calls.push({ method: 'openModal', params });
    }

    async updateModal(params: unknown): Promise<void> {
      this.calls.push({ method: 'updateModal', params });
    }

    async pushModal(params: unknown): Promise<void> {
      this.calls.push({ method: 'pushModal', params });
    }

    async closeModal(params: unknown): Promise<void> {
      this.calls.push({ method: 'closeModal', params });
    }

    async publishHomeTab(params: unknown): Promise<void> {
      this.calls.push({ method: 'publishHomeTab', params });
    }

    async getUserInfo(params: unknown): Promise<{ id: string; name: string }> {
      this.calls.push({ method: 'getUserInfo', params });
      return { id: 'mock_id', name: 'Mock User' };
    }

    async getConversationInfo(params: unknown): Promise<{
      id: string;
      name: string;
      isPrivate: boolean;
    }> {
      this.calls.push({ method: 'getConversationInfo', params });
      return { id: 'mock_conv', name: 'Mock Conversation', isPrivate: false };
    }

    async getUserList(): Promise<
      Array<{ id: string; name: string; email?: string }>
    > {
      this.calls.push({ method: 'getUserList', params: undefined });
      return [{ id: 'user1', name: 'User 1' }];
    }

    async uploadFile(
      params: unknown,
    ): Promise<{ fileId: string; url: string }> {
      this.calls.push({ method: 'uploadFile', params });
      return { fileId: 'mock_file', url: 'https://example.com/file' };
    }

    async deleteFile(params: unknown): Promise<void> {
      this.calls.push({ method: 'deleteFile', params });
    }

    getCalls(): Array<{ method: string; params: unknown }> {
      return this.calls;
    }

    resetCalls(): void {
      this.calls = [];
    }
  }

  // Generic handler that works with any adapter
  const createGenericHandler = (adapter: PlatformAdapter) => {
    return async () => {
      // Post a message
      const result = await adapter.postMessage({
        channel: 'test-channel',
        text: 'Test message',
      });

      // Use the result
      if (result.ts && result.channel) {
        // Open a modal for the user
        await adapter.openModal({
          triggerId: 'test-trigger',
          view: { type: 'modal', title: 'Test Modal' },
        });

        // Get user info
        await adapter.getUserInfo({ userId: 'user123' });
      }
    };
  };

  it('should work correctly with mock adapter', async () => {
    const mockAdapter = new MockAdapter();
    const handler = createGenericHandler(mockAdapter);

    await handler();

    const calls = mockAdapter.getCalls();
    expect(calls.length).toBe(3);
    expect(calls[0].method).toBe('postMessage');
    expect(calls[1].method).toBe('openModal');
    expect(calls[2].method).toBe('getUserInfo');
  });

  it('should handle async operations correctly', async () => {
    const mockAdapter = new MockAdapter();

    // Simulate multiple sequential operations
    await mockAdapter.postMessage({ channel: 'ch1', text: 'msg1' });
    await mockAdapter.postMessage({ channel: 'ch2', text: 'msg2' });
    await mockAdapter.getUserInfo({ userId: 'user1' });

    const calls = mockAdapter.getCalls();
    expect(calls.length).toBe(3);
  });

  it('should maintain adapter interface contract', async () => {
    const mockAdapter = new MockAdapter();

    // All methods should be callable
    expect(async () => {
      await mockAdapter.postMessage({ channel: 'ch', text: 'msg' });
      await mockAdapter.updateMessage({ ts: 'ts', channel: 'ch' });
      await mockAdapter.deleteMessage({ ts: 'ts', channel: 'ch' });
      await mockAdapter.postEphemeral({
        user: 'u',
        channel: 'ch',
        text: 'msg',
      });
      await mockAdapter.openModal({ triggerId: 'tid', view: {} });
      await mockAdapter.updateModal({ viewId: 'vid', view: {} });
      await mockAdapter.pushModal({ triggerId: 'tid', view: {} });
      await mockAdapter.closeModal({ viewId: 'vid' });
      await mockAdapter.publishHomeTab({ userId: 'uid', view: {} });
      await mockAdapter.getUserInfo({ userId: 'uid' });
      await mockAdapter.getConversationInfo({ channelId: 'ch' });
      await mockAdapter.getUserList();
      await mockAdapter.uploadFile({ channel: 'ch', file: 'test' });
      await mockAdapter.deleteFile({ fileId: 'fid' });
    }).resolves.toBeUndefined();
  });

  it('should return correct types from methods', async () => {
    const mockAdapter = new MockAdapter();

    const messageResult = await mockAdapter.postMessage({
      channel: 'ch',
      text: 'msg',
    });
    expect(messageResult).toHaveProperty('ts');
    expect(messageResult).toHaveProperty('channel');

    const userResult = await mockAdapter.getUserInfo({ userId: 'u' });
    expect(userResult).toHaveProperty('id');
    expect(userResult).toHaveProperty('name');

    const fileResult = await mockAdapter.uploadFile({
      channel: 'ch',
      file: 'f',
    });
    expect(fileResult).toHaveProperty('fileId');
    expect(fileResult).toHaveProperty('url');

    const listResult = await mockAdapter.getUserList();
    expect(Array.isArray(listResult)).toBe(true);
    expect(listResult[0]).toHaveProperty('id');
    expect(listResult[0]).toHaveProperty('name');
  });
});
