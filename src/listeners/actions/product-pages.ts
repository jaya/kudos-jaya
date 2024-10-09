import { TodoCartoes } from '@/clients/todo-cartoes/todo-cartoes';

const productPagesButtonCallback = async ({ ack, client, body }) => {
  try {
    await ack();

    const service = new TodoCartoes();
    const size = service.getCatalogSize();
    const lastPage = Math.ceil(size / 15);

    const page = Number(body.actions[0].value);
    const previous = page - 1;
    const next = page + 1;

    const products = await service.fetchProducts(page);

    const blocks = [];

    for (const product of products) {
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
            value:
              product.products[0].card_identificator +
              ',' +
              product.products[0].min_value +
              ',' +
              product.products[0].max_value,
            action_id: 'choose_card',
          },
        ],
      };

      const divider = {
        type: 'divider',
      };

      blocks.push(image, description, terms, values, button, divider);
    }

    const previousButton = {
      type: 'button',
      text: {
        type: 'plain_text',
        text: 'Página Anterior',
        emoji: true,
      },
      value: String(previous),
      action_id: 'products_page_previous',
    };

    const nextButton = {
      type: 'button',
      text: {
        type: 'plain_text',
        text: 'Próxima Página',
        emoji: true,
      },
      value: String(next),
      action_id: 'products_page_next',
    };

    const pageButtonsElements = [nextButton];

    if (previous > 0) {
      pageButtonsElements.unshift(previousButton);
    }

    if (next > lastPage) {
      pageButtonsElements.pop();
    }

    const paginationButtons = {
      type: 'actions',
      elements: pageButtonsElements,
    };

    blocks.push(paginationButtons);

    await client.views.update({
      view_id: body.view!.id,
      hash: body.view!.hash,
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
  }
};

export default productPagesButtonCallback;
