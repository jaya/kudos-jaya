import { ProductController } from '@/controllers/product';
import { IGiftCard, IGiftCardPayload } from '@/models/IGiftCard';
import { TodoProduct } from '@/models/TodoProduct';
import logger from '@/utils/logger';
import * as HTTPUtil from '@/utils/request';
import config from 'config';
import { IGiftCardDataSource } from '../IGiftCardDataSource';
import {
  EmitGiftCardPayload,
  TodoGiftCardResponse,
  TodoProductLineResponse,
} from './types';

const { token, baseUrl } = config.get<{ token: string; baseUrl: string }>(
  'externalClients.todoCartoes'
);

export class TodoCartoes implements IGiftCardDataSource {
  constructor(protected request = new HTTPUtil.Request()) {}

  public async fetchProducts(): Promise<void> {
    const productController = new ProductController();

    const isCatalogUpdated = await productController.isCatalogUpdated();

    if (!isCatalogUpdated) {
      const response = await this.request.get<TodoProductLineResponse>(
        `${baseUrl}/product_lines`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      const { products } = new TodoProduct(response.data);

      await productController.save(products);
    }
  }

  public async emitGiftCard(payload: IGiftCardPayload): Promise<IGiftCard> {
    const todoPayload: EmitGiftCardPayload = {
      card_identificator: payload.cardId,
      external_partner_load_id: payload.transactionId,
      total: payload.amount,
    };
    try {
      const response = await this.request.post<TodoGiftCardResponse>(
        `${baseUrl}/orders`,
        {
          headers: {
            Authorization: `${token}`,
          },
          timeout: 35000,
        },
        todoPayload
      );
      return { url: response?.data?.magic_link };
    } catch (e) {
      console.log(e);
      logger.error(
        'TodoCartoes.emitGiftCard() - Error while trying to generate gift card',
        {
          message: e?.message,
          code: e?.code,
          status: e?.response?.status,
          data: e?.response?.data,
        }
      );
    }
  }
}
