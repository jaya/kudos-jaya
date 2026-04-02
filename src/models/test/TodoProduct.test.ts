import { TodoProductLineResponse } from '@/clients/todo-cartoes/types';
import { TodoProduct } from '@/models/TodoProduct';

describe('TodoProduct', () => {
  describe('productsHandler()', () => {
    it('should remove SHOPEE products when minValue is lower than 30', () => {
      const payload: TodoProductLineResponse = {
        success: true,
        product_lines: [
          {
            id: 1,
            identificator: 'SHOPEE',
            online_redemption: true,
            store_redemption: false,
            categories: ['Varejo'],
            product_line_name: 'Shopee',
            brand_name: 'SHOPEE',
            logo_url: 'https://example.com/logo-shopee.png',
            product_line_description: 'Shopee cards',
            subscription: false,
            updated_at: '2026-01-01T00:00:00.000Z',
            terms_and_conditions: null,
            steps_to_use: null,
            card_images: [],
            products: [
              {
                updated_at: '2026-01-01T00:00:00.000Z',
                card_identificator: 'shopee-20',
                min_value: '20.0',
                max_value: '20.0',
                product_identifier: 'SHOPEE-20',
                subscription_period: null,
              },
              {
                updated_at: '2026-01-01T00:00:00.000Z',
                card_identificator: 'shopee-30',
                min_value: '30.0',
                max_value: '30.0',
                product_identifier: 'SHOPEE-30',
                subscription_period: null,
              },
            ],
          },
          {
            id: 2,
            identificator: 'OTHER',
            online_redemption: true,
            store_redemption: false,
            categories: ['Varejo'],
            product_line_name: 'Other Brand',
            brand_name: 'OTHER',
            logo_url: 'https://example.com/logo-other.png',
            product_line_description: 'Other cards',
            subscription: false,
            updated_at: '2026-01-01T00:00:00.000Z',
            terms_and_conditions: null,
            steps_to_use: null,
            card_images: [],
            products: [
              {
                updated_at: '2026-01-01T00:00:00.000Z',
                card_identificator: 'other-10',
                min_value: '10.0',
                max_value: '10.0',
                product_identifier: 'OTHER-10',
                subscription_period: null,
              },
            ],
          },
        ],
      };

      const todoProduct = new TodoProduct(payload);

      expect(todoProduct.products).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'shopee-30', name: 'SHOPEE' }),
          expect.objectContaining({ id: 'other-10', name: 'OTHER' }),
        ]),
      );
      expect(todoProduct.products).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'shopee-20', name: 'SHOPEE' }),
        ]),
      );
    });
  });
});
