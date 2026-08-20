import { GoogleChatAdapter } from '../google-chat-adapter';

jest.mock('@/utils/logger');

describe('GoogleChatAdapter', () => {
  let adapter: GoogleChatAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new GoogleChatAdapter('test-token', 'spaces/XXXXXX');
  });

  describe('postMessage', () => {
    it('should post a message', async () => {
      const result = await adapter.postMessage({
        channel: 'spaces/XXXXXX',
        text: 'Hello',
        blocks: [{ type: 'section', text: { type: 'mrkdwn', text: 'Hello' } }],
      });

      expect(result.channel).toBe('spaces/XXXXXX');
      expect(result.ts).toBeTruthy();
    });

    it('should handle message with empty blocks', async () => {
      const result = await adapter.postMessage({
        channel: 'spaces/XXXXXX',
        text: 'Hello',
        blocks: [],
      });

      expect(result.channel).toBe('spaces/XXXXXX');
    });
  });

  describe('updateMessage', () => {
    it('should update a message', async () => {
      await adapter.updateMessage({
        channel: 'spaces/XXXXXX',
        ts: 'msg-123',
        text: 'Updated',
        blocks: [
          { type: 'section', text: { type: 'mrkdwn', text: 'Updated' } },
        ],
      });

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('deleteMessage', () => {
    it('should delete a message', async () => {
      await adapter.deleteMessage({
        channel: 'spaces/XXXXXX',
        ts: 'msg-123',
      });

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('postEphemeral', () => {
    it('should post an ephemeral message', async () => {
      await adapter.postEphemeral({
        channel: 'spaces/XXXXXX',
        user: 'user-123',
        text: 'Private message',
        blocks: [
          { type: 'section', text: { type: 'mrkdwn', text: 'Private' } },
        ],
      });

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('openModal', () => {
    it('should open a modal', async () => {
      const view = { type: 'modal', blocks: [] };
      await adapter.openModal({ triggerId: 'trigger-123', view });

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('updateModal', () => {
    it('should update a modal', async () => {
      const view = { type: 'modal', blocks: [] };
      await adapter.updateModal({ viewId: 'view-123', view });

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('pushModal', () => {
    it('should push a modal', async () => {
      const view = { type: 'modal', blocks: [] };
      await adapter.pushModal({ triggerId: 'trigger-123', view });

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('closeModal', () => {
    it('should close a modal', async () => {
      await adapter.closeModal({ viewId: 'view-123' });

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('publishHomeTab', () => {
    it('should publish home tab', async () => {
      const view = { type: 'home', blocks: [] };
      await adapter.publishHomeTab({ userId: 'user-123', view });

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('getUserInfo', () => {
    it('should return stub user info', async () => {
      const result = await adapter.getUserInfo({ userId: 'user-123' });

      expect(result).toEqual({
        id: 'user-123',
        name: 'User Name',
        email: 'user@example.com',
        avatar: 'https://example.com/avatar.jpg',
      });
    });
  });

  describe('getConversationInfo', () => {
    it('should return stub conversation info', async () => {
      const result = await adapter.getConversationInfo({
        conversationId: 'space-123',
      });

      expect(result).toEqual({
        id: 'space-123',
        name: 'Space Name',
        isPrivate: false,
      });
    });
  });

  describe('getUserList', () => {
    it('should return empty user list', async () => {
      const result = await adapter.getUserList();

      expect(result).toEqual([]);
    });
  });

  describe('uploadFile', () => {
    it('should upload a file', async () => {
      const result = await adapter.uploadFile({
        filename: 'report.csv',
        filetype: 'csv',
        channels: ['space-123'],
        file: Buffer.from('data'),
        title: 'Report',
      });

      expect(result.fileId).toBeTruthy();
      expect(result.url).toContain('drive.google.com');
    });
  });

  describe('deleteFile', () => {
    it('should delete a file', async () => {
      await adapter.deleteFile({ fileId: 'file-123' });

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('getPlatformName', () => {
    it('should return "google-chat" as platform name', () => {
      expect(adapter.getPlatformName()).toBe('google-chat');
    });
  });
});
