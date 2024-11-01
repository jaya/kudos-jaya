import CacheUtil from '@/utils/cache';
import logger from '@/utils/logger';
import * as HTTPUtil from '@/utils/request';
import { AxiosError } from 'axios';
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
      const response = await todoCartoes.fetchProducts();
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
        cardId: '0000014281781487',
        transactionId: 'jayatech203232',
        amount: 200,
      });
      expect(response).toEqual({ url: giftCardResponse.magic_link });
    });

    it('Should log the error when there is a trouble to emit the gift card', async () => {
      mockedRequest.post.mockRejectedValueOnce(new AxiosError());
      logger.error = jest.fn();

      const todoCartoes = new TodoCartoes(mockedRequest);
      const response = await todoCartoes.emitGiftCard({
        cardId: '0000014281781487',
        transactionId: 'jayatech11',
        amount: 5,
      });
      expect(response).toEqual(undefined);
      expect(logger.error).toHaveBeenCalledWith(
        'TodoCartoes.emitGiftCard() - Error while trying to generate gift card',
        {}
      );
    });
  });
});
