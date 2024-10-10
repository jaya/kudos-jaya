import { TodoCartoes } from '@/clients/todo-cartoes/todo-cartoes';

const productPagesCallback = async ({ ack, client, body }) => {
  try {
    await ack();
    const params = body.actions[0].value;
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
    console.error(error);
  }
};

async function mountBlocks(page: number) {
  const service = new TodoCartoes();
  const size = service.getCatalogSize();
  const products = await service.fetchProducts(page);

  const lastPage = Math.ceil(size / 15);
  const previous = page - 1;
  const next = page + 1;

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
    value: 'update,' + String(previous),
    action_id: 'products_page_previous',
  };

  const nextButton = {
    type: 'button',
    text: {
      type: 'plain_text',
      text: 'Próxima Página',
      emoji: true,
    },
    value: 'update,' + String(next),
    action_id: 'products_page_next',
  };

  const pageButtonsElements = [];

  if (page === 1) {
    pageButtonsElements.push(nextButton);
  }

  if (page > 1 && page < lastPage) {
    pageButtonsElements.push(previousButton, nextButton);
  }

  if (page === lastPage) {
    pageButtonsElements.push(previousButton);
  }

  const paginationButtons = {
    type: 'actions',
    elements: pageButtonsElements,
  };

  blocks.push(paginationButtons);

  return blocks;
}

export default productPagesCallback;
