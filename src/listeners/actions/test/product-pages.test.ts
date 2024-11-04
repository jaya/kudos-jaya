import { ProductController } from '@/controllers/product';
import { fetchProductsResponse } from '../../../clients/todo-cartoes/test/samples';
import logger from '../../../utils/logger';
import productPagesCallback from '../product-pages';

describe('productPagesCallback', () => {
  let ack: jest.Mock;
  let client;

  beforeEach(() => {
    ack = jest.fn();
    client = {
      views: {
        open: jest.fn(),
        update: jest.fn(),
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch products from the first page', async () => {
    const getCatalogSizeSpy = jest
      .spyOn(ProductController.prototype, 'getCatalogSize')
      .mockResolvedValue(60);
    const getProductsSpy = jest
      .spyOn(ProductController.prototype, 'get')
      .mockResolvedValue(fetchProductsResponse.slice(0, 5));

    const body = {
      trigger_id: 'mockTriggerId',
      actions: [{ value: 'open,1' }],
      view: {
        id: 'view123',
        hash: 'hash123',
      },
    };

    await productPagesCallback({
      ack,
      client,
      body,
    });

    expect(getCatalogSizeSpy).toHaveBeenCalled();
    expect(getProductsSpy).toHaveBeenCalled();
    expect(client.views.open).toHaveBeenCalledWith(
      expect.objectContaining({
        view: expect.objectContaining({
          blocks: expect.arrayContaining([
            expect.objectContaining({ type: 'image' }),
            expect.objectContaining({ type: 'rich_text' }),
            expect.objectContaining({ type: 'rich_text' }),
            expect.objectContaining({ type: 'rich_text' }),
            expect.objectContaining({ type: 'actions' }),
            expect.objectContaining({ type: 'divider' }),
          ]),
        }),
      })
    );
  });

  it('should fetch products from the second page', async () => {
    const getCatalogSizeSpy = jest
      .spyOn(ProductController.prototype, 'getCatalogSize')
      .mockResolvedValue(10);
    const getProductsSpy = jest
      .spyOn(ProductController.prototype, 'get')
      .mockResolvedValue(fetchProductsResponse);

    const body = {
      actions: [{ selected_option: { value: 'update,2' } }],
      view: {
        id: 'view123',
        hash: 'hash123',
      },
    };

    await productPagesCallback({
      ack,
      client,
      body,
    });

    await productPagesCallback({ ack, client, body });

    expect(getCatalogSizeSpy).toHaveBeenCalled();
    expect(getProductsSpy).toHaveBeenCalled();
    expect(client.views.update).toHaveBeenCalledWith(
      expect.objectContaining({
        view: expect.objectContaining({
          blocks: expect.arrayContaining([
            expect.objectContaining({ type: 'image' }),
            expect.objectContaining({ type: 'rich_text' }),
            expect.objectContaining({ type: 'rich_text' }),
            expect.objectContaining({ type: 'rich_text' }),
            expect.objectContaining({ type: 'actions' }),
            expect.objectContaining({ type: 'divider' }),
            expect.objectContaining({ type: 'actions' }),
            expect.objectContaining({ type: 'section' }),
          ]),
        }),
      })
    );
  });

  it('should throw an error and log if something goes wrong', async () => {
    const body = {
      trigger_id: 'mockTriggerId',
      actions: [{ value: 'open,1' }],
      view: {
        id: 'view123',
        hash: 'hash123',
      },
    };
    const error = new Error('Test Error');

    jest.spyOn(ProductController.prototype, 'get').mockRejectedValue(error);

    logger.error = jest.fn();

    await productPagesCallback({ ack, client, body });

    expect(logger.error).toHaveBeenCalledWith(
      'productPagesCallback() - Error trying to build structure',
      { error }
    );
  });
});
