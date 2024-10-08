import CacheUtil from '@/utils/cache';
import * as HTTPUtil from '@/utils/request';
import { TodoCartoes } from '../todo-cartoes';
import {
  fetchProductsResponse,
  giftCardResponse,
  todoProductsResponse,
} from './samples';

jest.mock('@/utils/request');
jest.mock('@/utils/cache');

describe('TodoCartoes client', () => {
  const MockedCacheUtil = CacheUtil as jest.Mocked<typeof CacheUtil>;
  const mockedRequest = new HTTPUtil.Request() as jest.Mocked<HTTPUtil.Request>;

  describe('fetchProducts()', () => {
    it('Should return product list from todo service', async () => {
      mockedRequest.get.mockResolvedValue({
        data: todoProductsResponse,
      } as HTTPUtil.Response);

      MockedCacheUtil.get.mockReturnValue(undefined);
      const todoCartoes = new TodoCartoes(mockedRequest, MockedCacheUtil);
      const response = await todoCartoes.fetchProducts(1);
      expect(response).toEqual(fetchProductsResponse);
    });

    it('Should return product list from cache', async () => {
      mockedRequest.get.mockResolvedValue({
        data: null,
      } as HTTPUtil.Response);

      MockedCacheUtil.get.mockReturnValue(fetchProductsResponse);
      const todoCartoes = new TodoCartoes(mockedRequest, MockedCacheUtil);
      const response = await todoCartoes.fetchProducts(1);
      expect(response).toEqual(fetchProductsResponse);
    });
  });

  describe('getCatalogSize()', () => {
    it('Should return the length of the products catalog greater than 0', async () => {
      mockedRequest.get.mockResolvedValue({
        data: null,
      } as HTTPUtil.Response);

      MockedCacheUtil.get.mockReturnValue(5);
      const todoCartoes = new TodoCartoes(mockedRequest, MockedCacheUtil);
      const response = await todoCartoes.getCatalogSize();
      expect(response).toEqual(5);
    });

    it('Should return 0 when there is no products in cache', async () => {
      mockedRequest.get.mockResolvedValue({
        data: null,
      } as HTTPUtil.Response);

      MockedCacheUtil.get.mockReturnValue(undefined);
      const todoCartoes = new TodoCartoes();
      const response = await todoCartoes.getCatalogSize();
      expect(response).toEqual(0);
    });
  });

  describe('emitGiftCard()', () => {
    it('Should return the gift card from todo', async () => {
      mockedRequest.post.mockResolvedValue({
        data: giftCardResponse,
      } as HTTPUtil.Response);

      const todoCartoes = new TodoCartoes(mockedRequest);
      const response = await todoCartoes.emitGiftCard({
        card_identificator: '0000014281781487',
        external_partner_load_id: 'jayatech203232',
        total: 200,
      });
      expect(response).toEqual({ data: giftCardResponse });
    });
  });
});
