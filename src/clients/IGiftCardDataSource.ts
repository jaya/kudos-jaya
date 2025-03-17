import { IGiftCard, IGiftCardPayload } from '@/models/IGiftCard';

export interface IGiftCardDataSource {
  fetchProducts(page: number): Promise<{ data: unknown; status: number }>;
  emitGiftCard(payload: IGiftCardPayload): Promise<IGiftCard>;
}
