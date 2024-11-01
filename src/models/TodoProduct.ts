import { TodoProductLineResponse } from '../clients/todo-cartoes/types';
import { BaseProduct, IProduct } from './IProduct';

export class TodoProduct implements IProduct {
  readonly products: BaseProduct[];
  constructor(params: TodoProductLineResponse) {
    this.products = this.productsHandler(params.product_lines);
  }

  private productsHandler(
    product_lines: TodoProductLineResponse['product_lines']
  ): BaseProduct[] {
    const products: BaseProduct[] = [];

    for (const item of product_lines) {
      if (!item?.brand_name || !item?.logo_url) continue;
      if (item?.products.length <= 0) continue;

      const { minValue, maxValue } = this.getMinMaxCardValue(item?.products);

      const product: BaseProduct = {
        id: item.products?.[0].card_identificator,
        name: item.brand_name,
        description:
          item?.product_line_description?.length > 0
            ? item.product_line_description.substring(0, 197) + '...'
            : item.brand_name,
        terms: item?.terms_and_conditions
          ? item?.terms_and_conditions.substring(0, 200)
          : ' ',
        logo: item?.logo_url,
        minValue: minValue === 0 ? 1 : minValue,
        maxValue,
      };
      products.push(product);
    }

    return products.sort((a, b) => (a.name > b.name ? 1 : -1));
  }

  private getMinMaxCardValue(
    cards: TodoProductLineResponse['product_lines'][number]['products']
  ) {
    const { minMinValue, maxMaxValue } = cards.reduce(
      (acc, product) => {
        const minValue =
          product?.min_value != null ? parseFloat(product?.min_value) : 1;
        const maxValue =
          product?.max_value != null ? parseFloat(product?.max_value) : 0;

        return {
          minMinValue: Math.min(acc.minMinValue, minValue),
          maxMaxValue: Math.max(acc.maxMaxValue, maxValue),
        };
      },
      { minMinValue: Infinity, maxMaxValue: 1 }
    );
    return { minValue: minMinValue, maxValue: maxMaxValue };
  }
}
