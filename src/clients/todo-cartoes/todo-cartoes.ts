import config from 'config';
import * as HTTPUtil from '../../utils/request';
import {
  EmitGiftCardPayload,
  TodoGiftCardResponse,
  TodoProductLineResponse,
} from './types';

const { token, baseUrl } = config.get<{ token: string; baseUrl: string }>(
  'externalClients.todoCartoes'
);

//TODO: add error validation
export class TodoCartoes {
  constructor(protected request = new HTTPUtil.Request()) {}

  //TODO: tipar resposta
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

  public async emitGiftCard(payload: EmitGiftCardPayload) {
    //TODO: confirmar se o store_cnpj é obrigatório, e de quem seria o CNPJ
    //TODO: definir timeout de acordo com a DOC
    const response = await this.request.post<TodoGiftCardResponse>(
      `${baseUrl}/orders`,
      {
        headers: {
          Authorization: `${token}`,
        },
      },
      payload
    );
    return response;
  }
}
