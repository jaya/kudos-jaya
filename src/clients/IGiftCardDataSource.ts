import { IGiftCard, IGiftCardPayload } from '@/models/IGiftCard';

export interface IGiftCardDataSource {
  fetchProducts(page: number): Promise<void>;
  emitGiftCard(payload: IGiftCardPayload): Promise<IGiftCard>;
}
