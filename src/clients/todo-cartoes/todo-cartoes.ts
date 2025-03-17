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

const { baseUrl } = config.get<{ token: string; baseUrl: string }>(
  'externalClients.todoCartoes',
);

export class TodoCartoes implements IGiftCardDataSource {
  constructor(
    protected request = new HTTPUtil.Request(),
    private todoToken,
  ) {}

  public async fetchProducts(): Promise<{ data: unknown; status: number }> {
    try {
      const productController = new ProductController();

      const isCatalogUpdated = await productController.isCatalogUpdated();

      if (!isCatalogUpdated) {
        const response = await this.request.get<TodoProductLineResponse>(
          `${baseUrl}/product_lines`,
          {
            headers: {
              Authorization: `Token ${this.todoToken}`,
            },
          },
        );

        const { products } = new TodoProduct(response.data);

        await productController.updateCatalog(products);
      }

      return { status: 200, data: undefined };
    } catch (e) {
      logger.error(
        'TodoCartoes.fetchProducts() - Error trying to fetch products',
        e,
      );
      return HTTPUtil.Request.extractErrorData(e);
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
            Authorization: `Token ${this.todoToken}`,
          },
          timeout: 35000,
        },
        todoPayload,
      );
      return { url: response?.data?.magic_link };
    } catch (e) {
      logger.error(
        'TodoCartoes.emitGiftCard() - Error while trying to generate gift card',
        {
          message: e?.message,
          code: e?.code,
          status: e?.response?.status,
          data: e?.response?.data,
        },
      );
    }
  }
}
