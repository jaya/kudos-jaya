import { SlackAdapter } from '../slack/slack-adapter';
import { GoogleChatAdapter } from '../google-chat/google-chat-adapter';
import { WebClient } from '@slack/web-api';

/**
 * Adapter Contract Tests
 * Verify that both SlackAdapter and GoogleChatAdapter implement the same interface
 * and behave consistently for platform-agnostic code
 */

describe('Adapter Contract', () => {
  let slackAdapter: SlackAdapter;
  let googleChatAdapter: GoogleChatAdapter;

  beforeEach(() => {
    const mockWebClient = {
      chat: {
        postMessage: jest
          .fn()
          .mockResolvedValue({ ok: true, ts: 'ts1', channel: 'ch1' }),
        update: jest.fn().mockResolvedValue({ ok: true }),
        delete: jest.fn().mockResolvedValue({ ok: true }),
      },
      views: {
        open: jest.fn().mockResolvedValue({ ok: true }),
        update: jest.fn().mockResolvedValue({ ok: true }),
        push: jest.fn().mockResolvedValue({ ok: true }),
      },
      users: {
        info: jest
          .fn()
          .mockResolvedValue({ ok: true, user: { id: 'u1', name: 'User 1' } }),
      },
      conversations: {
        info: jest.fn().mockResolvedValue({
          ok: true,
          channel: { id: 'ch1', name: 'channel1' },
        }),
        members: jest
          .fn()
          .mockResolvedValue({ ok: true, members: ['u1', 'u2'] }),
      },
      files: {
        uploadV2: jest.fn().mockResolvedValue({
          ok: true,
          file: { id: 'f1', url_private: 'url' },
        }),
        delete: jest.fn().mockResolvedValue({ ok: true }),
      },
    } as unknown as WebClient;

    slackAdapter = new SlackAdapter(mockWebClient);
    googleChatAdapter = new GoogleChatAdapter('test-token', 'test-space');
  });

  describe('PlatformAdapter interface', () => {
    it('should have getPlatformName method', () => {
      expect(typeof slackAdapter.getPlatformName).toBe('function');
      expect(typeof googleChatAdapter.getPlatformName).toBe('function');
    });

    it('should return correct platform names', () => {
      expect(slackAdapter.getPlatformName()).toBe('slack');
      expect(googleChatAdapter.getPlatformName()).toBe('google-chat');
    });
  });

  describe('MessagePublisher interface', () => {
    it('should have postMessage method', () => {
      expect(typeof slackAdapter.postMessage).toBe('function');
      expect(typeof googleChatAdapter.postMessage).toBe('function');
    });

    it('should have updateMessage method', () => {
      expect(typeof slackAdapter.updateMessage).toBe('function');
      expect(typeof googleChatAdapter.updateMessage).toBe('function');
    });

    it('should have deleteMessage method', () => {
      expect(typeof slackAdapter.deleteMessage).toBe('function');
      expect(typeof googleChatAdapter.deleteMessage).toBe('function');
    });

    it('should have postEphemeral method', () => {
      expect(typeof slackAdapter.postEphemeral).toBe('function');
      expect(typeof googleChatAdapter.postEphemeral).toBe('function');
    });
  });

  describe('ModalManager interface', () => {
    it('should have openModal method', () => {
      expect(typeof slackAdapter.openModal).toBe('function');
      expect(typeof googleChatAdapter.openModal).toBe('function');
    });

    it('should have updateModal method', () => {
      expect(typeof slackAdapter.updateModal).toBe('function');
      expect(typeof googleChatAdapter.updateModal).toBe('function');
    });

    it('should have pushModal method', () => {
      expect(typeof slackAdapter.pushModal).toBe('function');
      expect(typeof googleChatAdapter.pushModal).toBe('function');
    });

    it('should have closeModal method', () => {
      expect(typeof slackAdapter.closeModal).toBe('function');
      expect(typeof googleChatAdapter.closeModal).toBe('function');
    });

    it('should have publishHomeTab method', () => {
      expect(typeof slackAdapter.publishHomeTab).toBe('function');
      expect(typeof googleChatAdapter.publishHomeTab).toBe('function');
    });
  });

  describe('UserInfoProvider interface', () => {
    it('should have getUserInfo method', () => {
      expect(typeof slackAdapter.getUserInfo).toBe('function');
      expect(typeof googleChatAdapter.getUserInfo).toBe('function');
    });

    it('should have getConversationInfo method', () => {
      expect(typeof slackAdapter.getConversationInfo).toBe('function');
      expect(typeof googleChatAdapter.getConversationInfo).toBe('function');
    });

    it('should have getUserList method', () => {
      expect(typeof slackAdapter.getUserList).toBe('function');
      expect(typeof googleChatAdapter.getUserList).toBe('function');
    });
  });

  describe('FileUploader interface', () => {
    it('should have uploadFile method', () => {
      expect(typeof slackAdapter.uploadFile).toBe('function');
      expect(typeof googleChatAdapter.uploadFile).toBe('function');
    });

    it('should have deleteFile method', () => {
      expect(typeof slackAdapter.deleteFile).toBe('function');
      expect(typeof googleChatAdapter.deleteFile).toBe('function');
    });
  });

  describe('Method signatures consistency', () => {
    it('postMessage should accept same parameters', async () => {
      const params = {
        channel: 'test-channel',
        text: 'test message',
        blocks: [],
      };

      const slackResult = slackAdapter.postMessage(params);
      const googleChatResult = googleChatAdapter.postMessage(params);

      expect(slackResult).toBeInstanceOf(Promise);
      expect(googleChatResult).toBeInstanceOf(Promise);
    });

    it('openModal should accept same parameters', async () => {
      const params = {
        triggerId: 'trigger123',
        view: { type: 'modal', title: 'Test' },
      };

      const slackResult = slackAdapter.openModal(params);
      const googleChatResult = googleChatAdapter.openModal(params);

      expect(slackResult).toBeInstanceOf(Promise);
      expect(googleChatResult).toBeInstanceOf(Promise);
    });

    it('getUserInfo should accept same parameters', async () => {
      const params = {
        userId: 'user123',
      };

      const slackResult = slackAdapter.getUserInfo(params);
      const googleChatResult = googleChatAdapter.getUserInfo(params);

      expect(slackResult).toBeInstanceOf(Promise);
      expect(googleChatResult).toBeInstanceOf(Promise);
    });
  });
});
