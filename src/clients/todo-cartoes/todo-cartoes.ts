import config from 'config';
import * as HTTPUtil from '../../utils/request';
import { TodoProductLineResponse } from './types';

const { token, baseUrl } = config.get<{ token: string; baseUrl: string }>(
  'externalClients.todoCartoes'
);

export class TodoCartoes {
  constructor(protected request = new HTTPUtil.Request()) {}

  public async fetchStores() {
    const response = await this.request.get<TodoProductLineResponse>(
      `${baseUrl}/product_lines`,
      {
        headers: {
          Authorization: `${token}`,
        },
      }
    );
    return response.data;
  }
}
