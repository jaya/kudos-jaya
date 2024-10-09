import CacheUtil from '@/utils/cache';
import * as HTTPUtil from '@/utils/request';
import config from 'config';
import {
  EmitGiftCardPayload,
  TodoGiftCardResponse,
  TodoProductLineResponse,
} from './types';

const { token, baseUrl } = config.get<{ token: string; baseUrl: string }>(
  'externalClients.todoCartoes'
);

export class TodoCartoes {
  constructor(
    protected request = new HTTPUtil.Request(),
    protected cacheUtil = CacheUtil
  ) {}

  public async fetchProducts(
    page: number
  ): Promise<TodoProductLineResponse['product_lines']> {
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

      const { product_lines } = response.data;

      this.setCatalogSize(product_lines.length);

      for (let i = 0; i < product_lines.length; i += 15) {
        const pageProducts = product_lines.slice(i, i + 15);
        const pageKey = Math.floor(i / 15) + 1;
        this.setProductsInCache(`products_page_${pageKey}`, pageProducts);
      }

      const start = (page - 1) * 15;
      const end = start + 15;
      return product_lines.slice(start, end);
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

  private setProductsInCache(
    key: string,
    products: TodoProductLineResponse['product_lines']
  ): boolean {
    console.info(`Updating cache to return products for key: ${key}`);
    return this.cacheUtil.set(
      key,
      products,
      config.get<number>('externalClients.todoCartoes.cacheTtl')
    );
  }

  protected getProductsFromCache(
    key: string
  ): TodoProductLineResponse['product_lines'] | undefined {
    const productsFromCache =
      this.cacheUtil.get<TodoProductLineResponse['product_lines']>(key);

    if (!productsFromCache) {
      return;
    }

    console.info(`Using cache to return products for key: ${key}`);
    return productsFromCache;
  }

  public async emitGiftCard(payload: EmitGiftCardPayload) {
    const response = await this.request.post<TodoGiftCardResponse>(
      `${baseUrl}/orders`,
      {
        headers: {
          Authorization: `${token}`,
        },
        timeout: 35000,
      },
      payload
    );
    return response;
  }
}
