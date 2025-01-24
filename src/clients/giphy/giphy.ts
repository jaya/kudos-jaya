import { keywords } from '@/assets/gifs';
import { getLocalGif } from '@/utils/find-gif';
import logger from '@/utils/logger';
import * as HTTPUtil from '@/utils/request';
import config from 'config';
import { GiphyResponse } from './types';

const { baseUrl, apiKey } = config.get<{ baseUrl: string; apiKey: string }>(
  'externalClients.giphy'
);

export class Giphy {
  constructor(protected request = new HTTPUtil.Request()) {}
  public async fetchGif(): Promise<string> {
    const keyword = this.getGifKeyword();
    try {
      const response = await this.request.get<GiphyResponse>(
        `${baseUrl}/v1/gifs/random?api_key=${apiKey}&tag=${keyword}&rating=g`
      );
      return response?.data?.data?.images?.original.webp;
    } catch (e) {
      logger.error('Giphy.fetchGif()', {
        message: e?.message,
        code: e?.code,
        status: e?.response?.status,
        data: e?.response?.data,
      });

      const gif = getLocalGif(keyword);
      return gif.URL;
    }
  }

  private getGifKeyword(): string {
    const index = Math.floor(Math.random() * (keywords.length - 1) + 0);
    return keywords[index];
  }
}
