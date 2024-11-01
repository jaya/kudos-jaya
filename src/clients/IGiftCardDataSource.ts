import { IGiftCard, IGiftCardPayload } from '@/models/IGiftCard';
import { BaseProduct } from '@/models/IProduct';

export interface IGiftCardDataSource {
  fetchProducts(page: number): Promise<BaseProduct[]>;
  emitGiftCard(payload: IGiftCardPayload): Promise<IGiftCard>;
  getCatalogSize(): number;
}
