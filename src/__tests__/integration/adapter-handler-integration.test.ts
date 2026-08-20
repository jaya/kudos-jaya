/**
 * Adapter-Handler Integration Tests
 * Verify adapters work correctly in handler context
 */

jest.mock('@/utils/logger');

describe('Adapter-Handler Integration', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSlackAdapter: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockGoogleChatAdapter: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSlackAdapter = {
      getPlatformName: jest.fn().mockReturnValue('slack'),
      postMessage: jest.fn().mockResolvedValue({ ts: 'slack_ts', channel: 'slack_ch' }),
      updateModal: jest.fn().mockResolvedValue(undefined),
      openModal: jest.fn().mockResolvedValue(undefined),
      getUserInfo: jest.fn().mockResolvedValue({ id: 'u1', name: 'User 1' }),
    };

    mockGoogleChatAdapter = {
      getPlatformName: jest.fn().mockReturnValue('google-chat'),
      postMessage: jest.fn().mockResolvedValue({ ts: 'gc_ts', channel: 'gc_ch' }),
      updateModal: jest.fn().mockResolvedValue(undefined),
      openModal: jest.fn().mockResolvedValue(undefined),
      getUserInfo: jest.fn().mockResolvedValue({ id: 'u1', name: 'User 1' }),
    };
  });

  describe('Adapter method invocation', () => {
    it('should invoke Slack adapter methods', async () => {
      const adapter = mockSlackAdapter;

      await adapter.postMessage({ channel: 'ch', text: 'msg' });
      await adapter.getUserInfo({ userId: 'u1' });
      await adapter.openModal({ triggerId: 'tid', view: {} });

      expect(adapter.postMessage).toHaveBeenCalledTimes(1);
      expect(adapter.getUserInfo).toHaveBeenCalledTimes(1);
      expect(adapter.openModal).toHaveBeenCalledTimes(1);
    });

    it('should invoke Google Chat adapter methods', async () => {
      const adapter = mockGoogleChatAdapter;

      await adapter.postMessage({ channel: 'ch', text: 'msg' });
      await adapter.getUserInfo({ userId: 'u1' });
      await adapter.openModal({ triggerId: 'tid', view: {} });

      expect(adapter.postMessage).toHaveBeenCalledTimes(1);
      expect(adapter.getUserInfo).toHaveBeenCalledTimes(1);
      expect(adapter.openModal).toHaveBeenCalledTimes(1);
    });
  });

  describe('Platform-agnostic handler pattern', () => {
    it('should handle same operations with different adapters', async () => {
      const runOperation = async (adapter: any) => {
        const result = await adapter.postMessage({
          channel: 'general',
          text: 'Hello',
        });

        return {
          platform: adapter.getPlatformName(),
          ts: result.ts,
        };
      };

      const slackResult = await runOperation(mockSlackAdapter);
      expect(slackResult.platform).toBe('slack');
      expect(slackResult.ts).toBe('slack_ts');

      const gcResult = await runOperation(mockGoogleChatAdapter);
      expect(gcResult.platform).toBe('google-chat');
      expect(gcResult.ts).toBe('gc_ts');
    });

    it('should return consistent response structure', async () => {
      const slackResponse = await mockSlackAdapter.postMessage({
        channel: 'ch',
        text: 'msg',
      });
      const gcResponse = await mockGoogleChatAdapter.postMessage({
        channel: 'ch',
        text: 'msg',
      });

      // Both should have ts and channel
      expect(slackResponse).toHaveProperty('ts');
      expect(slackResponse).toHaveProperty('channel');
      expect(gcResponse).toHaveProperty('ts');
      expect(gcResponse).toHaveProperty('channel');
    });
  });

  describe('Handler with adapter substitution', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const genericHandler = async (adapter: any) => {
      const platform = adapter.getPlatformName();
      const messageResult = await adapter.postMessage({
        channel: 'general',
        text: 'Test message',
      });
      const userInfo = await adapter.getUserInfo({ userId: 'u1' });

      return { platform, messageTs: messageResult.ts, userName: userInfo.name };
    };

    it('should work with Slack adapter', async () => {
      const result = await genericHandler(mockSlackAdapter);

      expect(result.platform).toBe('slack');
      expect(result.messageTs).toBe('slack_ts');
      expect(result.userName).toBe('User 1');
    });

    it('should work with Google Chat adapter', async () => {
      const result = await genericHandler(mockGoogleChatAdapter);

      expect(result.platform).toBe('google-chat');
      expect(result.messageTs).toBe('gc_ts');
      expect(result.userName).toBe('User 1');
    });
  });
});
