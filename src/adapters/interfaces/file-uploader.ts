import type { Stream } from 'node:stream';

export interface FileUploader {
  uploadFile(params: {
    filename: string;
    filetype: string;
    channels: string[];
    file: Buffer | Stream | string;
    title?: string;
    initialComment?: string;
  }): Promise<{
    fileId: string;
    url: string;
  }>;

  deleteFile(params: { fileId: string }): Promise<void>;
}
