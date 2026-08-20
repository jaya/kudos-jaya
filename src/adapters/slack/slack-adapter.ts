import { WebClient } from '@slack/web-api';
import type { Stream } from 'node:stream';
import { PlatformAdapter } from '../interfaces';
import logger from '@/utils/logger';

/* eslint-disable @typescript-eslint/no-explicit-any */

export class SlackAdapter implements PlatformAdapter {
  constructor(private readonly client: WebClient) {}

  async postMessage(params: {
    channel: string;
    text: string;
    blocks?: Record<string, unknown>[];
    thread_ts?: string;
    metadata?: Record<string, unknown>;
  }): Promise<{ ts: string; channel: string }> {
    try {
      const result = await this.client.chat.postMessage({
        channel: params.channel,
        text: params.text,
        blocks: params.blocks as any,
        thread_ts: params.thread_ts,
        metadata: params.metadata as any,
      } as any);
      return {
        ts: result?.ts || '',
        channel: result?.channel || params.channel,
      };
    } catch (error) {
      logger.error('SlackAdapter.postMessage()', error);
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
      await this.client.chat.update({
        channel: params.channel,
        ts: params.ts,
        text: params.text,
        blocks: params.blocks as any,
      } as any);
    } catch (error) {
      logger.error('SlackAdapter.updateMessage()', error);
      throw error;
    }
  }

  async deleteMessage(params: { channel: string; ts: string }): Promise<void> {
    try {
      await this.client.chat.delete({
        channel: params.channel,
        ts: params.ts,
      } as any);
    } catch (error) {
      logger.error('SlackAdapter.deleteMessage()', error);
      throw error;
    }
  }

  async postEphemeral(params: {
    channel: string;
    user: string;
    text: string;
    blocks?: Record<string, unknown>[];
  }): Promise<void> {
    try {
      await this.client.chat.postEphemeral({
        channel: params.channel,
        user: params.user,
        text: params.text,
        blocks: params.blocks as any,
      } as any);
    } catch (error) {
      logger.error('SlackAdapter.postEphemeral()', error);
      throw error;
    }
  }

  async openModal(params: {
    triggerId: string;
    view: Record<string, unknown>;
  }): Promise<void> {
    try {
      await this.client.views.open({
        trigger_id: params.triggerId,
        view: params.view as any,
      } as any);
    } catch (error) {
      logger.error('SlackAdapter.openModal()', error);
      throw error;
    }
  }

  async updateModal(params: {
    viewId: string;
    view: Record<string, unknown>;
  }): Promise<void> {
    try {
      await this.client.views.update({
        view_id: params.viewId,
        view: params.view as any,
      } as any);
    } catch (error) {
      logger.error('SlackAdapter.updateModal()', error);
      throw error;
    }
  }

  async pushModal(params: {
    triggerId: string;
    view: Record<string, unknown>;
  }): Promise<void> {
    try {
      await this.client.views.push({
        trigger_id: params.triggerId,
        view: params.view as any,
      } as any);
    } catch (error) {
      logger.error('SlackAdapter.pushModal()', error);
      throw error;
    }
  }

  async closeModal(params: { viewId: string }): Promise<void> {
    try {
      await this.client.views.update({
        view_id: params.viewId,
        view: {
          type: 'modal',
          blocks: [],
          private_metadata: 'closed',
        } as any,
      } as any);
    } catch (error) {
      logger.error('SlackAdapter.closeModal()', error);
      throw error;
    }
  }

  async publishHomeTab(params: {
    userId: string;
    view: Record<string, unknown>;
  }): Promise<void> {
    try {
      await this.client.views.publish({
        user_id: params.userId,
        view: params.view as any,
      } as any);
    } catch (error) {
      logger.error('SlackAdapter.publishHomeTab()', error);
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
      const result = await this.client.users.info({
        user: params.userId,
      } as any);
      const user = result.user as any;
      return {
        id: user.id,
        name: user.name || user.real_name,
        email: user.profile?.email,
        avatar: user.profile?.image_72,
      };
    } catch (error) {
      logger.error('SlackAdapter.getUserInfo()', error);
      throw error;
    }
  }

  async getConversationInfo(params: { conversationId: string }): Promise<{
    id: string;
    name: string;
    isPrivate: boolean;
  }> {
    try {
      const result = await this.client.conversations.info({
        channel: params.conversationId,
      } as any);
      const channel = result.channel as any;
      return {
        id: channel.id,
        name: channel.name,
        isPrivate: channel.is_private,
      };
    } catch (error) {
      logger.error('SlackAdapter.getConversationInfo()', error);
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
      const result = await (this.client.users.list as any)({});
      const users = (result.members as any[]) || [];
      return users.map((user: any) => ({
        id: user.id,
        name: user.name || user.real_name,
        email: user.profile?.email,
      }));
    } catch (error) {
      logger.error('SlackAdapter.getUserList()', error);
      throw error;
    }
  }

  async uploadFile(params: {
    filename: string;
    filetype: string;
    channels: string[];
    file: Buffer | Stream | string;
    title?: string;
    initialComment?: string;
  }): Promise<{
    fileId: string;
    url: string;
  }> {
    try {
      let channelId = params.channels[0];
      logger.info(`uploadFile: starting with channelId=${channelId}`);

      if (channelId.startsWith('U')) {
        logger.info('uploadFile: converting user ID to channel ID');
        const dmResult = await (this.client.conversations.open as any)({
          users: channelId,
        });
        if (!dmResult.ok) {
          throw new Error(
            `conversations.open failed: ${dmResult.error || 'Unknown error'}`,
          );
        }
        channelId = dmResult.channel.id as string;
        logger.info(`uploadFile: converted to channelId=${channelId}`);
      }

      logger.info(`uploadFile: uploading file with channelId=${channelId}`);
      const result = await (this.client.files.uploadV2 as any)({
        filename: params.filename,
        channel_id: channelId,
        file: params.file,
        title: params.title,
        initial_comment: params.initialComment,
      });

      if (!result.ok) {
        throw new Error(
          `Slack file upload failed: ${result.error || 'Unknown error'}`,
        );
      }

      const file = (result.files?.[0]?.files?.[0] || result.file) as any;

      if (!file) {
        throw new Error(
          'Invalid Slack response: file object not found in response',
        );
      }

      if (!file.id) {
        throw new Error('Invalid Slack response: file.id is missing');
      }

      const fileUrl = file.url_private_download;
      if (!fileUrl) {
        throw new Error(
          `Invalid Slack response: url_private_download is missing for file ${file.id}`,
        );
      }

      logger.info(`uploadFile: success, fileId=${file.id}`);
      return {
        fileId: file.id,
        url: fileUrl,
      };
    } catch (error) {
      logger.error('SlackAdapter.uploadFile()', error);
      throw error;
    }
  }

  async deleteFile(params: { fileId: string }): Promise<void> {
    try {
      await (this.client.files.delete as any)({ file: params.fileId });
    } catch (error) {
      logger.error('SlackAdapter.deleteFile()', error);
      throw error;
    }
  }

  getPlatformName(): string {
    return 'slack';
  }
}
