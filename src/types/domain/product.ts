export interface Product {
  id: string;
  name: string;
  value: number;
  imageUrl?: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface GiftCard {
  success: boolean;
  url?: string;
  message: string;
}

export interface GiftCardPayload {
  cardId: string;
  transactionId: string;
  amount: number;
}

export interface RedeemGiftCardParams {
  userId: string;
  cardId: string;
  amount: number;
  imageId?: string;
  teamId: string;
}

export interface RedeemGiftCardResult {
  success: boolean;
  url?: string;
  message: string;
}
