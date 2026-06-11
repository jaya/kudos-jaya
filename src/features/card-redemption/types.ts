export interface RedeemGiftCardRequest {
  userId: string;
  cardId: string;
  amount: number;
  teamId: string;
}

export interface GiftCardResult {
  success: boolean;
  url?: string;
  message: string;
}
