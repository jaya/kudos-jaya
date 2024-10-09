import { fetchProductsResponse } from '@/clients/todo-cartoes/test/samples';
import { TodoCartoes } from '@/clients/todo-cartoes/todo-cartoes';
import productPagesButtonCallback from '@/listeners/actions/product-pages';

jest.mock('@/clients/todo-cartoes/todo-cartoes');

describe('productPagesButtonCallback', () => {
  let ack: jest.Mock;
  let client: any;
  let body: any;

  beforeEach(() => {
    ack = jest.fn();
    client = {
      views: {
        update: jest.fn(),
      },
    };

    body = {
      actions: [{ value: '1' }],
      view: {
        id: 'view123',
        hash: 'hash123',
      },
    };
    (TodoCartoes as jest.Mock).mockImplementation(() => ({
      fetchProducts: jest.fn().mockResolvedValue(fetchProductsResponse),
      getCatalogSize: jest.fn().mockReturnValue(30),
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch products from the first page and not show previous button', async () => {
    await productPagesButtonCallback({
      ack,
      client,
      body,
    } as any);

    await productPagesButtonCallback({ ack, client, body });

    expect(TodoCartoes).toHaveBeenCalled();
    expect(client.views.update).toHaveBeenCalledWith(
      expect.objectContaining({
        view: expect.objectContaining({
          blocks: expect.arrayContaining([
            expect.objectContaining({
              elements: expect.not.arrayContaining([
                expect.objectContaining({
                  action_id: 'products_page_previous',
                }),
              ]),
            }),
          ]),
        }),
      })
    );
  });

  it('should fetch products from the second page', async () => {
    const body = {
      actions: [{ value: '2' }],
      view: {
        id: 'view123',
        hash: 'hash123',
      },
    };

    await productPagesButtonCallback({
      ack,
      client,
      body,
    } as any);

    await productPagesButtonCallback({ ack, client, body });

    expect(TodoCartoes).toHaveBeenCalled();
    expect(client.views.update).toHaveBeenCalledWith(
      expect.objectContaining({
        view: expect.objectContaining({
          blocks: expect.arrayContaining([
            expect.objectContaining({
              elements: expect.arrayContaining([
                expect.objectContaining({
                  action_id: 'products_page_previous',
                }),
              ]),
            }),
          ]),
        }),
      })
    );
  });

  it('should fetch products from the last page and not show next button', async () => {
    const body = {
      actions: [{ value: '2' }],
      view: {
        id: 'view123',
        hash: 'hash123',
      },
    };

    await productPagesButtonCallback({
      ack,
      client,
      body,
    } as any);

    await productPagesButtonCallback({ ack, client, body });

    expect(TodoCartoes).toHaveBeenCalled();
    expect(client.views.update).toHaveBeenCalledWith(
      expect.objectContaining({
        view: expect.objectContaining({
          blocks: expect.arrayContaining([
            expect.objectContaining({
              elements: expect.not.arrayContaining([
                expect.objectContaining({
                  action_id: 'products_page_next',
                }),
              ]),
            }),
          ]),
        }),
      })
    );
  });

  it('should throw an error and log if something goes wrong', async () => {
    const error = new Error('Test Error');
    (TodoCartoes as jest.Mock).mockImplementation(() => ({
      fetchProducts: jest.fn().mockRejectedValue(error),
      getCatalogSize: jest.fn().mockReturnValue(30),
    }));

    console.error = jest.fn();

    await productPagesButtonCallback({ ack, client, body });

    expect(console.error).toHaveBeenCalledWith(error);
  });
});
