import { WebAPICallResult } from '@slack/web-api';
import * as fs from 'fs';
import path from 'path';
import logger from './logger';

type SlackFile = {
  id: string;
  created: Date;
  timestamp: Date;
  name: string;
  title: string;
  mimetype: string;
  filetype: string;
  pretty_type: string;
  user: string;
  user_team: string;
  editable: boolean;
  size: number;
  mode: string;
  is_external: boolean;
  external_type: string;
  is_public: boolean;
  public_url_shared: boolean;
  display_as_bot: boolean;
  username: string;
  url_private: string;
  url_private_download: string;
  media_display_type: string;
  permalink: string;
  permalink_public: string;
  comments_count: number;
  is_starred: boolean;
  shares: object;
  has_more_shares: boolean;
  has_rich_preview: boolean;
  file_access: string;
};

type UploadFileResponse = {
  files: { ok: boolean; files: SlackFile[] }[];
} & WebAPICallResult;

export async function uploadFile({ client, channelId }): Promise<string> {
  const dirPath = path.join(__dirname, '../assets');
  const filePath = path.join(dirPath, 'file.csv');
  let channel_id: string;
  try {
    if (channelId.startsWith('U')) {
      const conversationsResponse = await client.conversations.open({
        users: channelId,
      });
      channel_id = conversationsResponse.channel.id;
    }

    const fileUploadResponse = await client.files.uploadV2({
      channel_id,
      file: fs.createReadStream(filePath),
      filename: 'file.csv',
    });
    fs.unlinkSync(filePath);
    const data = fileUploadResponse as UploadFileResponse;
    return data?.files[0]?.files[0]?.url_private_download;
  } catch (error) {
    logger.error('uploadFile()', error);
    throw error;
  }
}
