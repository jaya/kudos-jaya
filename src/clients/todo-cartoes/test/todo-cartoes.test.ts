import { ProductController } from '@/controllers/product';
import { IGiftCardPayload } from '@/models/IGiftCard';
import logger from '@/utils/logger';
import * as HTTPUtil from '@/utils/request';
import config from 'config';
import { TodoCartoes } from '../todo-cartoes';
import {
  fetchProductsResponse,
  giftCardResponse,
  todoProductsResponse,
} from './samples';

jest.mock('@/controllers/product');
jest.mock('@/utils/logger');
jest.mock('@/utils/request');

const { token, baseUrl } = config.get<{ token: string; baseUrl: string }>(
  'externalClients.todoCartoes',
);

describe('TodoCartoes', () => {
  let todoCartoes: TodoCartoes;
  let requestMock: jest.Mocked<HTTPUtil.Request>;
  const requestStaticMock = HTTPUtil.Request as jest.Mocked<
    typeof HTTPUtil.Request
  >;

  beforeEach(() => {
    requestMock = new HTTPUtil.Request() as jest.Mocked<HTTPUtil.Request>;
    todoCartoes = new TodoCartoes(requestMock, token);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchProducts', () => {
    it('should fetch and save the products if catalog is out of date', async () => {
      const productControllerMock =
        ProductController.prototype as jest.Mocked<ProductController>;
      productControllerMock.isCatalogUpdated.mockResolvedValue(false);

      requestMock.get.mockResolvedValue({
        data: todoProductsResponse,
      } as HTTPUtil.Response);

      await todoCartoes.fetchProducts();

      expect(productControllerMock.isCatalogUpdated).toHaveBeenCalled();
      expect(requestMock.get).toHaveBeenCalledWith(`${baseUrl}/product_lines`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      expect(productControllerMock.updateCatalog).toHaveBeenCalledWith(
        expect.arrayContaining(fetchProductsResponse),
      );
    });

    it('should not fetch products if catalog is up to date', async () => {
      const productControllerMock =
        ProductController.prototype as jest.Mocked<ProductController>;
      productControllerMock.isCatalogUpdated.mockResolvedValue(true);

      await todoCartoes.fetchProducts();

      expect(productControllerMock.isCatalogUpdated).toHaveBeenCalled();
      expect(requestMock.get).not.toHaveBeenCalled();
      expect(productControllerMock.save).not.toHaveBeenCalled();
    });

    it('should log and return the error response', async () => {
      const productControllerMock =
        ProductController.prototype as jest.Mocked<ProductController>;
      productControllerMock.isCatalogUpdated.mockResolvedValue(false);

      class FakeAxiosError extends Error {
        constructor(public response: object) {
          super();
        }
      }
      const error = new FakeAxiosError({
        status: 401,
        data: undefined,
      });

      jest.spyOn(HTTPUtil.Request.prototype, 'get').mockRejectedValue(error);
      requestStaticMock.extractErrorData.mockReturnValue({
        status: 401,
        data: undefined,
      });

      const res = await todoCartoes.fetchProducts();
      expect(logger.error).toHaveBeenCalledWith(
        'TodoCartoes.fetchProducts() - Error trying to fetch products',
        error,
      );
      expect(res).toEqual({ status: 401 });
    });
  });

  describe('emitGiftCard', () => {
    it('should emit a gift card from todo', async () => {
      const payload: IGiftCardPayload = {
        cardId: '12345',
        transactionId: 'jayatech123',
        amount: 5000,
      };

      requestMock.post.mockResolvedValue({
        data: giftCardResponse,
      } as HTTPUtil.Response);

      const result = await todoCartoes.emitGiftCard(payload);

      expect(requestMock.post).toHaveBeenCalledWith(
        `${baseUrl}/orders`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
          timeout: 35000,
        },
        {
          card_identificator: '12345',
          external_partner_load_id: 'jayatech123',
          total: 5000,
        },
      );
      expect(result).toEqual({
        url: 'https://giftcard-hmg.todo.gift/_-Po7zh7pUB5kGXf9AgowAijgq-HIrIGdjYX',
      });
    });
    it('should log the error when there is a failure trying to emit the gift card', async () => {
      const payload: IGiftCardPayload = {
        cardId: '12345',
        transactionId: 'trans-123',
        amount: 5000,
      };

      const error = new Error('Request failed');
      error.message = 'Request failed';

      jest.spyOn(HTTPUtil.Request.prototype, 'post').mockRejectedValue(error);

      const todoInstance = new TodoCartoes(undefined, token);

      await todoInstance.emitGiftCard(payload);

      expect(logger.error).toHaveBeenCalledWith(
        'TodoCartoes.emitGiftCard() - Error while trying to generate gift card',
        {
          message: 'Request failed',
          code: undefined,
          status: undefined,
          data: undefined,
          payload: {
            card_identificator: '12345',
            external_partner_load_id: 'trans-123',
            total: 5000,
          },
        },
      );
    });
  });
});
