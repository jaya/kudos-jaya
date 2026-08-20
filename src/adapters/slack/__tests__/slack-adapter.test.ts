import { SlackAdapter } from '../slack-adapter';
import { WebClient } from '@slack/web-api';

jest.mock('@slack/web-api');
jest.mock('@/utils/logger');

describe('SlackAdapter', () => {
  let mockWebClient: jest.Mocked<WebClient>;
  let adapter: SlackAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    mockWebClient = {
      chat: {
        postMessage: jest
          .fn()
          .mockResolvedValue({ ts: 'msg-123', channel: 'C123' }),
        update: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({}),
        postEphemeral: jest.fn().mockResolvedValue({}),
      },
      views: {
        open: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
        push: jest.fn().mockResolvedValue({}),
        publish: jest.fn().mockResolvedValue({}),
      },
      users: {
        info: jest.fn().mockResolvedValue({
          user: {
            id: 'U123',
            name: 'john',
            real_name: 'John Doe',
            profile: {
              email: 'john@example.com',
              image_72: 'https://avatar.jpg',
            },
          },
        }),
        list: jest.fn().mockResolvedValue({
          members: [
            {
              id: 'U1',
              name: 'user1',
              real_name: 'User One',
              profile: { email: 'user1@example.com' },
            },
          ],
        }),
      },
      conversations: {
        info: jest.fn().mockResolvedValue({
          ok: true,
          channel: { id: 'C123', name: 'general', is_private: false },
        }),
        open: jest.fn().mockResolvedValue({
          ok: true,
          channel: { id: 'D123' },
        }),
      },
      files: {
        upload: jest.fn().mockResolvedValue({
          ok: true,
          file: { id: 'F123', permalink: 'https://files.slack.com/file' },
        }),
        uploadV2: jest.fn().mockResolvedValue({
          ok: true,
          file: {
            id: 'F123',
            url_private_download: 'https://files.slack.com/file',
          },
        }),
        delete: jest.fn().mockResolvedValue({ ok: true }),
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (WebClient as any).mockImplementation(() => mockWebClient);
    adapter = new SlackAdapter(mockWebClient);
  });

  describe('postMessage', () => {
    it('should post a message to a channel', async () => {
      const result = await adapter.postMessage({
        channel: 'C123',
        text: 'Hello',
        blocks: [{ type: 'section', text: { type: 'mrkdwn', text: 'Hello' } }],
      });

      expect(mockWebClient.chat.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: 'C123',
          text: 'Hello',
          blocks: expect.any(Array),
        }),
      );
      expect(result).toEqual({ ts: 'msg-123', channel: 'C123' });
    });

    it('should post a message with thread_ts', async () => {
      await adapter.postMessage({
        channel: 'C123',
        text: 'Reply',
        thread_ts: 'msg-456',
      });

      expect(mockWebClient.chat.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          thread_ts: 'msg-456',
        }),
      );
    });

    it('should handle postMessage errors', async () => {
      mockWebClient.chat.postMessage = jest
        .fn()
        .mockRejectedValue(new Error('API error'));

      await expect(
        adapter.postMessage({ channel: 'C123', text: 'Hello' }),
      ).rejects.toThrow('API error');
    });
  });

  describe('updateMessage', () => {
    it('should update an existing message', async () => {
      await adapter.updateMessage({
        channel: 'C123',
        ts: 'msg-123',
        text: 'Updated',
        blocks: [
          { type: 'section', text: { type: 'mrkdwn', text: 'Updated' } },
        ],
      });

      expect(mockWebClient.chat.update).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: 'C123',
          ts: 'msg-123',
          text: 'Updated',
        }),
      );
    });

    it('should handle update errors', async () => {
      mockWebClient.chat.update = jest
        .fn()
        .mockRejectedValue(new Error('Message not found'));

      await expect(
        adapter.updateMessage({
          channel: 'C123',
          ts: 'msg-123',
          text: 'Updated',
        }),
      ).rejects.toThrow('Message not found');
    });
  });

  describe('deleteMessage', () => {
    it('should delete a message', async () => {
      await adapter.deleteMessage({ channel: 'C123', ts: 'msg-123' });

      expect(mockWebClient.chat.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: 'C123',
          ts: 'msg-123',
        }),
      );
    });

    it('should handle delete errors', async () => {
      mockWebClient.chat.delete = jest
        .fn()
        .mockRejectedValue(new Error('Message not found'));

      await expect(
        adapter.deleteMessage({ channel: 'C123', ts: 'msg-123' }),
      ).rejects.toThrow('Message not found');
    });
  });

  describe('postEphemeral', () => {
    it('should post an ephemeral message to a user', async () => {
      await adapter.postEphemeral({
        channel: 'C123',
        user: 'U123',
        text: 'Private message',
        blocks: [
          { type: 'section', text: { type: 'mrkdwn', text: 'Private' } },
        ],
      });

      expect(mockWebClient.chat.postEphemeral).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: 'C123',
          user: 'U123',
          text: 'Private message',
        }),
      );
    });

    it('should handle postEphemeral errors', async () => {
      mockWebClient.chat.postEphemeral = jest
        .fn()
        .mockRejectedValue(new Error('User not found'));

      await expect(
        adapter.postEphemeral({
          channel: 'C123',
          user: 'U123',
          text: 'Private',
        }),
      ).rejects.toThrow('User not found');
    });
  });

  describe('openModal', () => {
    it('should open a modal', async () => {
      const view = { type: 'modal', blocks: [] };
      await adapter.openModal({ triggerId: 'trigger-123', view });

      expect(mockWebClient.views.open).toHaveBeenCalledWith(
        expect.objectContaining({
          trigger_id: 'trigger-123',
          view: expect.objectContaining({ type: 'modal' }),
        }),
      );
    });

    it('should handle openModal errors', async () => {
      mockWebClient.views.open = jest
        .fn()
        .mockRejectedValue(new Error('Trigger expired'));

      await expect(
        adapter.openModal({
          triggerId: 'trigger-123',
          view: { type: 'modal', blocks: [] },
        }),
      ).rejects.toThrow('Trigger expired');
    });
  });

  describe('updateModal', () => {
    it('should update a modal', async () => {
      const view = { type: 'modal', blocks: [] };
      await adapter.updateModal({ viewId: 'view-123', view });

      expect(mockWebClient.views.update).toHaveBeenCalledWith(
        expect.objectContaining({
          view_id: 'view-123',
          view: expect.objectContaining({ type: 'modal' }),
        }),
      );
    });

    it('should handle updateModal errors', async () => {
      mockWebClient.views.update = jest
        .fn()
        .mockRejectedValue(new Error('View not found'));

      await expect(
        adapter.updateModal({
          viewId: 'view-123',
          view: { type: 'modal', blocks: [] },
        }),
      ).rejects.toThrow('View not found');
    });
  });

  describe('pushModal', () => {
    it('should push a modal on top of current one', async () => {
      const view = { type: 'modal', blocks: [] };
      await adapter.pushModal({ triggerId: 'trigger-123', view });

      expect(mockWebClient.views.push).toHaveBeenCalledWith(
        expect.objectContaining({
          trigger_id: 'trigger-123',
          view: expect.objectContaining({ type: 'modal' }),
        }),
      );
    });

    it('should handle pushModal errors', async () => {
      mockWebClient.views.push = jest
        .fn()
        .mockRejectedValue(new Error('Trigger expired'));

      await expect(
        adapter.pushModal({
          triggerId: 'trigger-123',
          view: { type: 'modal', blocks: [] },
        }),
      ).rejects.toThrow('Trigger expired');
    });
  });

  describe('closeModal', () => {
    it('should close a modal', async () => {
      await adapter.closeModal({ viewId: 'view-123' });

      expect(mockWebClient.views.update).toHaveBeenCalledWith(
        expect.objectContaining({
          view_id: 'view-123',
          view: expect.objectContaining({
            type: 'modal',
            private_metadata: 'closed',
          }),
        }),
      );
    });

    it('should handle closeModal errors', async () => {
      mockWebClient.views.update = jest
        .fn()
        .mockRejectedValue(new Error('View not found'));

      await expect(adapter.closeModal({ viewId: 'view-123' })).rejects.toThrow(
        'View not found',
      );
    });
  });

  describe('publishHomeTab', () => {
    it('should publish home tab view', async () => {
      const view = { type: 'home', blocks: [] };
      await adapter.publishHomeTab({ userId: 'U123', view });

      expect(mockWebClient.views.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'U123',
          view: expect.objectContaining({ type: 'home' }),
        }),
      );
    });

    it('should handle publishHomeTab errors', async () => {
      mockWebClient.views.publish = jest
        .fn()
        .mockRejectedValue(new Error('User not found'));

      await expect(
        adapter.publishHomeTab({
          userId: 'U123',
          view: { type: 'home', blocks: [] },
        }),
      ).rejects.toThrow('User not found');
    });
  });

  describe('getUserInfo', () => {
    it('should fetch user information', async () => {
      const result = await adapter.getUserInfo({ userId: 'U123' });

      expect(mockWebClient.users.info).toHaveBeenCalledWith(
        expect.objectContaining({ user: 'U123' }),
      );
      expect(result).toEqual({
        id: 'U123',
        name: 'john',
        email: 'john@example.com',
        avatar: 'https://avatar.jpg',
      });
    });

    it('should fallback to real_name if name not available', async () => {
      mockWebClient.users.info = jest.fn().mockResolvedValue({
        user: {
          id: 'U123',
          real_name: 'John Doe',
          profile: { email: 'john@example.com' },
        },
      });

      const result = await adapter.getUserInfo({ userId: 'U123' });

      expect(result.name).toBe('John Doe');
    });

    it('should handle getUserInfo errors', async () => {
      mockWebClient.users.info = jest
        .fn()
        .mockRejectedValue(new Error('User not found'));

      await expect(adapter.getUserInfo({ userId: 'U123' })).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('getConversationInfo', () => {
    it('should fetch conversation information', async () => {
      const result = await adapter.getConversationInfo({
        conversationId: 'C123',
      });

      expect(mockWebClient.conversations.info).toHaveBeenCalledWith(
        expect.objectContaining({ channel: 'C123' }),
      );
      expect(result).toEqual({
        id: 'C123',
        name: 'general',
        isPrivate: false,
      });
    });

    it('should handle getConversationInfo errors', async () => {
      mockWebClient.conversations.info = jest
        .fn()
        .mockRejectedValue(new Error('Channel not found'));

      await expect(
        adapter.getConversationInfo({ conversationId: 'C123' }),
      ).rejects.toThrow('Channel not found');
    });
  });

  describe('getUserList', () => {
    it('should fetch list of users', async () => {
      const result = await adapter.getUserList();

      expect(mockWebClient.users.list).toHaveBeenCalled();
      expect(result).toEqual([
        {
          id: 'U1',
          name: 'user1',
          email: 'user1@example.com',
        },
      ]);
    });

    it('should handle empty user list', async () => {
      mockWebClient.users.list = jest.fn().mockResolvedValue({ members: [] });

      const result = await adapter.getUserList();

      expect(result).toEqual([]);
    });

    it('should handle getUserList errors', async () => {
      mockWebClient.users.list = jest
        .fn()
        .mockRejectedValue(new Error('API error'));

      await expect(adapter.getUserList()).rejects.toThrow('API error');
    });
  });

  describe('uploadFile', () => {
    it('should upload a file', async () => {
      const result = await adapter.uploadFile({
        filename: 'report.csv',
        filetype: 'csv',
        channels: ['C123'],
        file: Buffer.from('data'),
        title: 'Report',
      });

      expect(mockWebClient.files.uploadV2).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: 'report.csv',
          channel_id: 'C123',
          title: 'Report',
        }),
      );
      expect(result).toEqual({
        fileId: 'F123',
        url: 'https://files.slack.com/file',
      });
    });

    it('should handle uploadFile errors', async () => {
      mockWebClient.files.uploadV2 = jest
        .fn()
        .mockRejectedValue(new Error('Upload failed'));

      await expect(
        adapter.uploadFile({
          filename: 'report.csv',
          filetype: 'csv',
          channels: ['C123'],
          file: Buffer.from('data'),
        }),
      ).rejects.toThrow('Upload failed');
    });
  });

  describe('deleteFile', () => {
    it('should delete a file', async () => {
      await adapter.deleteFile({ fileId: 'F123' });

      expect(mockWebClient.files.delete).toHaveBeenCalledWith(
        expect.objectContaining({ file: 'F123' }),
      );
    });

    it('should handle deleteFile errors', async () => {
      mockWebClient.files.delete = jest
        .fn()
        .mockRejectedValue(new Error('File not found'));

      await expect(adapter.deleteFile({ fileId: 'F123' })).rejects.toThrow(
        'File not found',
      );
    });
  });

  describe('getPlatformName', () => {
    it('should return "slack" as platform name', () => {
      expect(adapter.getPlatformName()).toBe('slack');
    });
  });
});
