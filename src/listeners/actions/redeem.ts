import {
  AllMiddlewareArgs,
  BlockAction,
  SlackActionMiddlewareArgs,
} from '@slack/bolt';
import { TodoCartoes } from '../../clients/todo-cartoes/todo-cartoes';

const redeemButtonCallback = async ({
  ack,
  client,
  body,
}: AllMiddlewareArgs & SlackActionMiddlewareArgs<BlockAction>) => {
  try {
    await ack();
    const stores = await new TodoCartoes().fetchStores();

    const blocks = [];

    for (const product of stores.product_lines) {
      const image = {
        type: 'image',
        title: {
          type: 'plain_text',
          text: product.brand_name,
          emoji: true,
        },
        image_url: product.logo_url,
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
                text:
                  product.product_line_description.length > 0
                    ? product.product_line_description
                    : product.brand_name,
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
                text:
                  product.terms_and_conditions.length > 0
                    ? product.terms_and_conditions
                    : '   ',
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
                text: 'Min: R$' + product.products[0].min_value,
              },
              {
                type: 'text',
                text: '     |     Max: R$' + product.products[0].max_value,
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
            value: 'choose_card',
            action_id: 'choose_card',
          },
        ],
      };

      const divider = {
        type: 'divider',
      };

      blocks.push(image, description, terms, values, button, divider);
    }

    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: 'modal',
        callback_id: 'list_stores_view',
        title: {
          type: 'plain_text',
          text: 'Generate Gift Card',
        },
        blocks,
        close: {
          type: 'plain_text',
          text: 'Cancel',
        },
      },
    });
  } catch (error) {
    console.error(error);
    console.error(JSON.stringify(error.data.response_metadata));
  }
};

export default redeemButtonCallback;
