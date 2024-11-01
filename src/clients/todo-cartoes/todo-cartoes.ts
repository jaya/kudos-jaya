import { IGiftCard, IGiftCardPayload } from '@/models/IGiftCard';
import { BaseProduct } from '@/models/IProduct';
import { TodoProduct } from '@/models/TodoProduct';
import CacheUtil from '@/utils/cache';
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
const productsPageSize = config.get<number>('app.productsPageSize');

export class TodoCartoes implements IGiftCardDataSource {
  constructor(
    protected request = new HTTPUtil.Request(),
    protected cacheUtil = CacheUtil
  ) {}

  public async fetchProducts(page: number = 1): Promise<BaseProduct[]> {
    const cachedProducts = this.getProductsFromCache(`products_page_${page}`);

    if (!cachedProducts) {
      const response = await this.request.get<TodoProductLineResponse>(
        `${baseUrl}/product_lines`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      const { products } = new TodoProduct(response.data);

      this.setCatalogSize(products.length);

      for (let i = 0; i < products.length; i += productsPageSize) {
        const pageProducts = products.slice(i, i + productsPageSize);
        const pageKey = Math.floor(i / productsPageSize) + 1;
        this.setProductsInCache(`products_page_${pageKey}`, pageProducts);
      }

      const start = (page - 1) * productsPageSize;
      const end = start + productsPageSize;
      return products.slice(start, end);
    }

    return cachedProducts;
  }

  public getCatalogSize(): number {
    const size = this.cacheUtil.get<number>('catalog-size');
    if (!size) return 0;
    return size;
  }

  private async setCatalogSize(size) {
    return this.cacheUtil.set(
      'catalog-size',
      size,
      config.get<number>('externalClients.todoCartoes.cacheTtl')
    );
  }

  private setProductsInCache(key: string, products: BaseProduct[]): boolean {
    logger.info(`Updating cache to return products for key: ${key}`);
    return this.cacheUtil.set(
      key,
      products,
      config.get<number>('externalClients.todoCartoes.cacheTtl')
    );
  }

  protected getProductsFromCache(key: string): BaseProduct[] | undefined {
    const productsFromCache = this.cacheUtil.get<BaseProduct[]>(key);

    if (!productsFromCache) {
      return;
    }

    logger.info(`Using cache to return products for key: ${key}`);
    return productsFromCache;
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
      return { url: response.data.magic_link };
    } catch (e) {
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
