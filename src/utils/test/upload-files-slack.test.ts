import { WebClient } from '@slack/web-api';
import * as fs from 'fs';
import path from 'path';
import { uploadFile } from '../upload-files-slack';

jest.mock('@slack/web-api', () => {
  const mSlack = {
    conversations: {
      open: jest.fn(),
    },
    files: {
      uploadV2: jest.fn(),
    },
  };
  return { WebClient: jest.fn(() => mSlack) };
});
jest.mock('fs');
jest.mock('path');

describe('uploadFile()', () => {
  let client: WebClient;
  let mockReadStream: jest.Mock;

  beforeEach(() => {
    client = new WebClient() as jest.Mocked<WebClient>;
    mockReadStream = jest.fn();
    (fs.createReadStream as jest.Mock).mockReturnValue(mockReadStream);
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.unlinkSync as jest.Mock).mockReturnValue(undefined);
    (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));
  });

  it('Should upload the file to slack conversation and return the url', async () => {
    const channelId = 'U12345';
    const expectedChannelId = 'C67890';
    (client.conversations.open as jest.Mock).mockResolvedValueOnce({
      channel: { id: expectedChannelId },
    });
    (client.files.uploadV2 as jest.Mock).mockResolvedValueOnce({
      ok: true,
      file: { url_private_download: 'https://download.url' },
    });

    const url = await uploadFile({ client, channelId });

    expect(client.conversations.open).toHaveBeenCalledWith({
      users: channelId,
    });
    expect(client.files.uploadV2).toHaveBeenCalledWith({
      channel_id: expectedChannelId,
      file: mockReadStream,
      filename: 'file.csv',
    });
    expect(url).toBe('https://download.url');
  });
});
