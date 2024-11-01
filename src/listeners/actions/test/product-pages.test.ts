import { fetchProductsResponse } from '@/clients/todo-cartoes/test/samples';
import { TodoCartoes } from '@/clients/todo-cartoes/todo-cartoes';
import logger from '@/utils/logger';
import productPagesCallback from '../product-pages';

jest.mock('@/clients/todo-cartoes/todo-cartoes');

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
    (TodoCartoes as jest.Mock).mockImplementation(() => ({
      fetchProducts: jest
        .fn()
        .mockResolvedValue(
          fetchProductsResponse.flatMap((item) => Array(10).fill(item))
        ),
      getCatalogSize: jest.fn().mockReturnValue(50),
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch products from the first page', async () => {
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

    await productPagesCallback({ ack, client, body });

    expect(TodoCartoes).toHaveBeenCalled();
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

    expect(TodoCartoes).toHaveBeenCalled();
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
    (TodoCartoes as jest.Mock).mockImplementation(() => ({
      fetchProducts: jest.fn().mockRejectedValue(error),
      getCatalogSize: jest.fn().mockReturnValue(30),
    }));

    logger.error = jest.fn();

    await productPagesCallback({ ack, client, body });

    expect(logger.error).toHaveBeenCalledWith(
      'productPagesCallback() - Error trying to build structure',
      { error }
    );
  });
});
