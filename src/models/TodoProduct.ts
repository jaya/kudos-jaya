import { TodoProductLineResponse } from '../clients/todo-cartoes/types';
import { BaseProduct, IProduct } from './IProduct';

export class TodoProduct implements IProduct {
  readonly products: BaseProduct[];
  constructor(params: TodoProductLineResponse) {
    this.products = this.productsHandler(params.product_lines);
  }

  private productsHandler(
    product_lines: TodoProductLineResponse['product_lines'],
  ): BaseProduct[] {
    const products: BaseProduct[] = [];

    for (const item of product_lines) {
      if (!item?.brand_name || !item?.logo_url) continue;
      if (item?.products.length <= 0 || !Array.isArray(item?.products))
        continue;

      const cards = this.getCards(item?.products);

      for (const card of cards) {
        const { min_value, max_value } = card;

        const product: BaseProduct = {
          id: card.card_identificator,
          name: item.brand_name,
          description: this.getProductDescription(
            item?.product_line_description,
            item.brand_name,
          ),
          terms: this.termsHandler(item, min_value, max_value),
          logo: item?.logo_url,
          minValue: min_value,
          maxValue: max_value,
          isActive: true,
        };
        products.push(product);
      }
    }

    return products.sort((a, b) => (a.name > b.name ? 1 : -1));
  }

  private termsHandler(
    item: TodoProductLineResponse['product_lines'][number],
    minValue: number,
    maxValue: number,
  ): string {
    const baseText = 'Os valores disponíveis para este produto são: ';
    if (item.brand_name !== 'SHOPEE') {
      return (
        baseText + this.getUniqueSortedValues(item.products).substring(0, 200)
      );
    }
    return baseText + minValue.toFixed(0) + ' - ' + maxValue.toFixed(0);
  }

  private getCards(
    cards: TodoProductLineResponse['product_lines'][number]['products'],
  ): { card_identificator: string; min_value: number; max_value: number }[] {
    const cardMap = cards.reduce((acc, product) => {
      const { card_identificator, min_value, max_value } = product;

      const currentMin =
        min_value === null ? 1 : Number.parseFloat(product?.min_value);
      const currentMax =
        max_value === null ? 0 : Number.parseFloat(product?.max_value);

      acc[card_identificator] ||= {
        card_identificator: card_identificator,
        min_value: min_value,
        max_value: max_value,
      };

      const existingMin =
        Number.parseFloat(acc[card_identificator]?.min_value) || 1;
      acc[card_identificator].min_value = Math.min(existingMin, currentMin);

      const existingMax =
        Number.parseFloat(acc[card_identificator].max_value) || 1;
      acc[card_identificator].max_value = Math.max(existingMax, currentMax);
      return acc;
    }, {});

    return Object.values(cardMap);
  }

  private getProductDescription(
    description: string | null,
    brandName: string,
  ): string {
    if (description && description.length > 0) {
      const cleanedDescription = this.cleanHtmlAndScripts(description);
      if (cleanedDescription.length > 200) {
        return cleanedDescription.substring(0, 197) + '...';
      }
      return cleanedDescription;
    }
    return brandName;
  }

  private getUniqueSortedValues(
    products: TodoProductLineResponse['product_lines'][number]['products'],
  ): string {
    const uniqueValues = new Set<number>();

    for (const product of products) {
      const minValue = parseFloat(product.min_value);
      const maxValue = parseFloat(product.max_value);

      uniqueValues.add(minValue);
      uniqueValues.add(maxValue);
    }

    const uniqueArray = Array.from(uniqueValues);

    uniqueArray.sort((a, b) => a - b);

    return uniqueArray.map((value) => value.toFixed(0)).join(' - ');
  }

  private cleanHtmlAndScripts(htmlText: string): string {
    let cleanedText = htmlText.replace(
      /<script\b[^>]*>([\s\S]*?)<\/script>/gi,
      '',
    );

    cleanedText = cleanedText.replace(/<[^>]*>/g, '');

    cleanedText = cleanedText
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');

    return cleanedText.trim();
  }
}
