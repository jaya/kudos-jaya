import { ProductController } from '@/controllers/product';
import logger from '@/utils/logger';
import config from 'config';

const productPagesCallback = async ({ ack, client, body }) => {
  try {
    await ack();

    const params =
      body.actions[0]?.value || body?.actions[0]?.selected_option?.value;
    const action = params.split(',')[0];
    const page = params.split(',')[1];

    const view = {
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
    };

    if (action === 'open') {
      const blocks = await mountBlocks(Number(page));
      await client.views.open({
        trigger_id: body.trigger_id,
        view: {
          ...view,
          blocks,
        },
      });
      return;
    }

    const blocks = await mountBlocks(Number(page));
    await client.views.update({
      view_id: body.view!.id,
      hash: body.view!.hash,
      view: {
        ...view,
        blocks,
      },
    });
  } catch (error) {
    logger.error('productPagesCallback() - Error trying to build structure', {
      error,
    });
  }
};

async function mountBlocks(page: number) {
  const productController = new ProductController();
  const size = await productController.getCatalogSize();
  const productsPageSize = config.get<number>('app.productsPageSize');

  const products = await productController.get(
    (page - 1) * productsPageSize,
    productsPageSize
  );

  const lastPage = Math.ceil(size / productsPageSize);

  const blocks = [];

  for (const product of products) {
    const image = {
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
              text: 'Min: R$' + product.minValue,
            },
            {
              type: 'text',
              text: '     |     Max: R$' + product.maxValue,
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
          value: product.id + ',' + product.minValue + ',' + product.maxValue,
          action_id: 'choose_card',
        },
      ],
    };

    const divider = {
      type: 'divider',
    };

    blocks.push(image, description, terms, values, button, divider);
  }

  const paginationOptions = [];
  for (let i = 1; i <= lastPage; i++) {
    const option = {
      text: {
        type: 'plain_text',
        text: 'Page ' + String(i),
        emoji: true,
      },
      value: 'update,' + String(i),
    };
    paginationOptions.push(option);
  }

  const pagination = {
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
      text: 'You are on page ' + String(page),
    },
  };

  blocks.push(paginationText, pagination);

  return blocks;
}

export default productPagesCallback;
