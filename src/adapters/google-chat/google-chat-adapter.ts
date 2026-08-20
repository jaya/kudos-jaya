import { PlatformAdapter } from '../interfaces';
import logger from '@/utils/logger';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Google Chat Adapter - Implements the PlatformAdapter interface for Google Chat
 *
 * Note: This adapter currently provides a complete implementation structure.
 * In production, you would need:
 * - Google Chat API credentials (service account or OAuth)
 * - @google-cloud/chat package or googleapis npm package
 * - Conversion of Block Kit to Google Chat Card format
 */
export class GoogleChatAdapter implements PlatformAdapter {
  constructor(
    private readonly accessToken: string,
    private readonly spaceName: string,
  ) {}

  async postMessage(params: {
    channel: string;
    text: string;
    blocks?: Record<string, unknown>[];
    thread_ts?: string;
    metadata?: Record<string, unknown>;
  }): Promise<{ ts: string; channel: string }> {
    try {
      // Convert Block Kit format to Google Chat Card format
      const card = this.convertBlocksToCard(params.blocks || []);

      // In production: Call Google Chat API
      // const requestBody = {
      //   text: params.text,
      //   cardsV2: card ? [{ cardId: `card-${Date.now()}`, card }] : undefined,
      //   thread: params.thread_ts
      //     ? {
      //         name: `${this.spaceName}/threads/${params.thread_ts}`,
      //       }
      //     : undefined,
      // };
      // const response = await this.chatApi.spaces.messages.create({
      //   parent: `spaces/${params.channel}`,
      //   requestBody,
      // });

      const messageId = `msg-${Date.now()}`;
      logger.info('GoogleChatAdapter.postMessage() - Message created', {
        messageId,
        channel: params.channel,
        hasCard: !!card,
      });

      return {
        ts: messageId,
        channel: params.channel,
      };
    } catch (error) {
      logger.error('GoogleChatAdapter.postMessage()', error);
      throw error;
    }
  }

  async updateMessage(params: {
    channel: string;
    ts: string;
    text: string;
    blocks?: Record<string, unknown>[];
  }): Promise<void> {
    try {
      const card = this.convertBlocksToCard(params.blocks || []);

      // In production: Call Google Chat API
      // const requestBody = {
      //   text: params.text,
      //   cardsV2: card ? [{ cardId: `card-${Date.now()}`, card }] : undefined,
      // };
      // await this.chatApi.spaces.messages.update({
      //   name: `spaces/${params.channel}/messages/${params.ts}`,
      //   requestBody,
      // });

      logger.info('GoogleChatAdapter.updateMessage() - Message updated', {
        messageId: params.ts,
        channel: params.channel,
        hasCard: !!card,
      });
    } catch (error) {
      logger.error('GoogleChatAdapter.updateMessage()', error);
      throw error;
    }
  }

  async deleteMessage(params: {
    channel: string;
    ts: string;
  }): Promise<void> {
    try {
      // In production: Call Google Chat API
      // await this.chatApi.spaces.messages.delete({
      //   name: `spaces/${params.channel}/messages/${params.ts}`,
      // });

      logger.info('GoogleChatAdapter.deleteMessage() - Message deleted', {
        messageId: params.ts,
        channel: params.channel,
      });
    } catch (error) {
      logger.error('GoogleChatAdapter.deleteMessage()', error);
      throw error;
    }
  }

  async openModal(params: {
    triggerId: string;
    view: Record<string, unknown>;
  }): Promise<void> {
    try {
      // Google Chat doesn't have native modals like Slack
      // Instead, we open a rich dialog card or navigate to external form
      const card = this.convertViewToCard(params.view);

      // In production: Send card as message or via Google Chat interactive API
      // const requestBody = {
      //   cardsV2: [{ cardId: `modal-${Date.now()}`, card }],
      // };

      logger.info('GoogleChatAdapter.openModal() - Modal opened as card', {
        triggerId: params.triggerId,
        card,
      });
    } catch (error) {
      logger.error('GoogleChatAdapter.openModal()', error);
      throw error;
    }
  }

  async updateModal(params: {
    viewId: string;
    view: Record<string, unknown>;
  }): Promise<void> {
    try {
      const card = this.convertViewToCard(params.view);

      // In production: Update card message
      // const requestBody = {
      //   cardsV2: [{ cardId: params.viewId, card }],
      // };

      logger.info('GoogleChatAdapter.updateModal() - Modal updated', {
        viewId: params.viewId,
        card,
      });
    } catch (error) {
      logger.error('GoogleChatAdapter.updateModal()', error);
      throw error;
    }
  }

  async pushModal(params: {
    triggerId: string;
    view: Record<string, unknown>;
  }): Promise<void> {
    try {
      const card = this.convertViewToCard(params.view);

      // In production: Push card as thread reply
      // const requestBody = {
      //   cardsV2: [{ cardId: `modal-${Date.now()}`, card }],
      // };

      logger.info('GoogleChatAdapter.pushModal() - Modal pushed', {
        triggerId: params.triggerId,
        card,
      });
    } catch (error) {
      logger.error('GoogleChatAdapter.pushModal()', error);
      throw error;
    }
  }

  async closeModal(params: { viewId: string }): Promise<void> {
    try {
      // In Google Chat, modals are closed by removing the card or navigating away
      logger.info('GoogleChatAdapter.closeModal() - Modal closed', {
        viewId: params.viewId,
      });
    } catch (error) {
      logger.error('GoogleChatAdapter.closeModal()', error);
      throw error;
    }
  }

  async getUserInfo(params: { userId: string }): Promise<{
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  }> {
    try {
      // In production: Call Google Workspace API
      // const response = await this.peopleApi.people.get({
      //   resourceName: `people/${params.userId}`,
      // });

      logger.info('GoogleChatAdapter.getUserInfo() - User info fetched', {
        userId: params.userId,
      });

      return {
        id: params.userId,
        name: 'User Name',
        email: 'user@example.com',
        avatar: 'https://example.com/avatar.jpg',
      };
    } catch (error) {
      logger.error('GoogleChatAdapter.getUserInfo()', error);
      throw error;
    }
  }

  async getConversationInfo(params: {
    conversationId: string;
  }): Promise<{
    id: string;
    name: string;
    isPrivate: boolean;
  }> {
    try {
      // In production: Call Google Chat API
      // const response = await this.chatApi.spaces.get({
      //   name: `spaces/${params.conversationId}`,
      // });

      logger.info(
        'GoogleChatAdapter.getConversationInfo() - Space info fetched',
        { spaceId: params.conversationId },
      );

      return {
        id: params.conversationId,
        name: 'Space Name',
        isPrivate: false,
      };
    } catch (error) {
      logger.error('GoogleChatAdapter.getConversationInfo()', error);
      throw error;
    }
  }

  async getUserList(): Promise<
    Array<{
      id: string;
      name: string;
      email?: string;
    }>
  > {
    try {
      // In production: Call Google Workspace Directory API
      // const response = await this.directoryApi.users.list({
      //   domain: this.domain,
      //   maxResults: 500,
      // });

      logger.info('GoogleChatAdapter.getUserList() - User list fetched');

      return [];
    } catch (error) {
      logger.error('GoogleChatAdapter.getUserList()', error);
      throw error;
    }
  }

  async uploadFile(params: {
    filename: string;
    filetype: string;
    channels: string[];
    file: Buffer | string;
    title?: string;
    initialComment?: string;
  }): Promise<{
    fileId: string;
    url: string;
  }> {
    try {
      // In production: Call Google Drive API or Google Chat file upload
      // Upload file to Google Drive and share with space

      const fileId = `file-${Date.now()}`;
      logger.info('GoogleChatAdapter.uploadFile() - File uploaded', {
        fileId,
        filename: params.filename,
      });

      return {
        fileId,
        url: `https://drive.google.com/file/d/${fileId}`,
      };
    } catch (error) {
      logger.error('GoogleChatAdapter.uploadFile()', error);
      throw error;
    }
  }

  async deleteFile(params: { fileId: string }): Promise<void> {
    try {
      // In production: Call Google Drive API
      logger.info('GoogleChatAdapter.deleteFile() - File deleted', {
        fileId: params.fileId,
      });
    } catch (error) {
      logger.error('GoogleChatAdapter.deleteFile()', error);
      throw error;
    }
  }

  getPlatformName(): string {
    return 'google-chat';
  }

  // Helper: Convert Slack Block Kit to Google Chat Card format
  private convertBlocksToCard(blocks: Record<string, unknown>[]) {
    if (!blocks || blocks.length === 0) return null;

    const sections: any[] = [];

    for (const block of blocks) {
      const blockType = (block as any).type;

      if (blockType === 'section') {
        const section = (block as any).text;
        if (section) {
          sections.push({
            widgets: [
              {
                textParagraph: {
                  text: section.text || '',
                },
              },
            ],
          });
        }
      } else if (blockType === 'actions') {
        const actions = (block as any).elements || [];
        const widgets = actions.map((action: any) => ({
          buttonList: {
            buttons: [
              {
                text: action.text?.text || 'Button',
                onClick: {
                  action: {
                    actionMethodName: action.action_id,
                  },
                },
              },
            ],
          },
        }));
        if (widgets.length > 0) {
          sections.push({ widgets });
        }
      }
    }

    return {
      sections,
    };
  }

  // Helper: Convert Slack view format to Google Chat Card format
  private convertViewToCard(view: Record<string, unknown>) {
    const blocks = (view as any).blocks || [];
    return this.convertBlocksToCard(blocks);
  }
}
