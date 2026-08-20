import { ProductController } from '@/controllers/product';
import config from 'config';
import { Product } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildProductBlock(product: Product): any[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const image: any = {
    type: 'image',
    title: {
      type: 'plain_text',
      text: product.name,
      emoji: true,
    },
    image_url: product.logo,
    alt_text: 'Store Card Image',
  };

  const description = {
    type: 'rich_text',
    elements: [
      {
        type: 'rich_text_section',
        elements: [
          {
            type: 'text',
            text: product.description,
          },
        ],
      },
    ],
  };

  const terms = {
    type: 'rich_text',
    elements: [
      {
        type: 'rich_text_quote',
        elements: [
          {
            type: 'text',
            text: product.terms,
          },
        ],
      },
    ],
  };

  const values = {
    type: 'rich_text',
    elements: [
      {
        type: 'rich_text_section',
        elements: [
          {
            type: 'text',
            text: 'Valores: ',
            style: {
              bold: true,
            },
          },
          {
            type: 'text',
            text: `Min: R$${String(product.minValue)}`,
          },
          {
            type: 'text',
            text: `     |     Max: R$${String(product.maxValue)}`,
          },
        ],
      },
    ],
  };

  const button = {
    type: 'actions',
    elements: [
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'Choose',
          emoji: true,
        },
        value: `${product.id},${product.minValue},${product.maxValue}`,
        action_id: 'choose_card',
      },
    ],
  };

  const divider = {
    type: 'divider',
  };

  return [image, description, terms, values, button, divider];
}

async function buildPaginationBlock(
  page: number,
  lastPage: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paginationOptions: any[] = [];
  for (let i = 1; i <= lastPage; i++) {
    const option = {
      text: {
        type: 'plain_text',
        text: `Page ${String(i)}`,
        emoji: true,
      },
      value: `update,${String(i)}`,
    };
    paginationOptions.push(option);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pagination: any = {
    type: 'actions',
    elements: [
      {
        type: 'static_select',
        placeholder: {
          type: 'plain_text',
          text: 'Go to page',
          emoji: true,
        },
        options: paginationOptions,
        action_id: 'products_page',
      },
    ],
  };

  const paginationText = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `You are on page ${String(page)}`,
    },
  };

  return [paginationText, pagination];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getProductListBlocks(page: number): Promise<any[]> {
  const productController = new ProductController();
  const size = await productController.getCatalogSize();
  const productsPageSize = config.get<number>('app.productsPageSize');

  const products = await productController.get(
    (page - 1) * productsPageSize,
    productsPageSize,
  );

  const lastPage = Math.ceil(size / productsPageSize);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blocks: any[] = [];

  for (const product of products) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    blocks.push(...buildProductBlock(product as any as Product));
  }

  blocks.push(...(await buildPaginationBlock(page, lastPage)));

  return blocks;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getProductListView(blocks: any[]): any {
  return {
    type: 'modal',
    callback_id: 'list_stores_view',
    title: {
      type: 'plain_text',
      text: 'Generate Gift Card',
    },
    close: {
      type: 'plain_text',
      text: 'Cancel',
    },
    blocks,
  };
}
