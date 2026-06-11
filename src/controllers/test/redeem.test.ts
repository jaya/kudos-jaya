import { TodoCartoes } from '@/clients/todo-cartoes/todo-cartoes';
import { InstallationController } from '@/controllers/installation';
import { RedeemController } from '@/controllers/redeem';
import { TransactionController } from '@/controllers/transaction';
import { WalletController } from '@/controllers/wallet';

jest.mock('@/controllers/wallet');
jest.mock('@/controllers/installation');
jest.mock('@/controllers/transaction');
jest.mock('@/utils/encrypt', () => ({
  decrypt: jest.fn(),
}));

describe('RedeemController', () => {
  let redeemController: RedeemController;
  let mockWalletController: jest.Mocked<WalletController>;
  let mockTransactionController: jest.Mocked<TransactionController>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockWalletController =
      new WalletController() as jest.Mocked<WalletController>;
    mockTransactionController =
      new TransactionController() as jest.Mocked<TransactionController>;
    redeemController = new RedeemController();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (redeemController as any).walletController = mockWalletController;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (redeemController as any).transactionController = mockTransactionController;
  });

  describe('emitGiftCard', () => {
    const params = {
      userId: 'user1',
      cardId: 'card123',
      amount: 100,
      imageId: 'img123',
      teamId: 'team1324',
    };

    it('should return an error if the user has insufficient balance', async () => {
      mockWalletController.find.mockResolvedValueOnce({
        id: 1,
        balance: 50,
      });

      const result = await redeemController.emitGiftCard(params);

      expect(result).toEqual({
        success: false,
        message:
          'You cannot request a gift card with a value greater than your current balance.',
      });

      expect(mockWalletController.find).toHaveBeenCalledWith({
        ownerId: params.userId,
        teamId: params.teamId,
      });
    });

    it('should call TodoCartoes.emitGiftCard and return success if all goes well', async () => {
      mockWalletController.find.mockResolvedValueOnce({
        balance: 200,
        id: 1,
      });

      const mockInstallController = jest
        .spyOn(InstallationController.prototype, 'find')
        .mockResolvedValueOnce({ giftCardApiToken: 'mocked-decrypted-token' });

      const mockEmitGiftCard = jest
        .spyOn(TodoCartoes.prototype, 'emitGiftCard')
        .mockResolvedValueOnce({
          url: 'http://giftcard.url',
        });

      const result = await redeemController.emitGiftCard(params);

      expect(result).toEqual({
        success: true,
        url: 'http://giftcard.url',
        message:
          ':tada: *Your Gift Card has arrived* :tada: \nClick to access your gift card',
      });

      expect(mockEmitGiftCard).toHaveBeenCalledWith({
        cardId: 'card123',
        transactionId: expect.stringContaining('jayatech'),
        amount: 100,
      });
      expect(mockInstallController).toHaveBeenCalledWith(params.teamId);
      expect(mockWalletController.withdraw).toHaveBeenCalledWith({
        amount: params.amount,
        ownerId: params.userId,
        teamId: params.teamId,
      });
    });

    it('should handle TodoCartoes API errors gracefully', async () => {
      mockWalletController.find.mockResolvedValueOnce({ balance: 200 });
      const mockInstallController = jest
        .spyOn(InstallationController.prototype, 'find')
        .mockResolvedValueOnce({ giftCardApiToken: 'mocked-decrypted-token' });

      const mockEmitGiftCardResponse = { url: undefined };

      jest
        .spyOn(TodoCartoes.prototype, 'emitGiftCard')
        .mockResolvedValueOnce(mockEmitGiftCardResponse);

      const result = await redeemController.emitGiftCard(params);

      expect(result).toEqual({
        success: false,
        message: 'We had a problem generating your card :cry:',
      });

      expect(mockWalletController.withdraw).not.toHaveBeenCalled();
      expect(mockInstallController).toHaveBeenCalledWith(params.teamId);
    });

    it('should handle exceptions during API calls', async () => {
      mockWalletController.find.mockResolvedValueOnce({ balance: 200 });
      const mockInstallController = jest
        .spyOn(InstallationController.prototype, 'find')
        .mockResolvedValueOnce({ giftCardApiToken: 'mocked-decrypted-token' });

      jest
        .spyOn(TodoCartoes.prototype, 'emitGiftCard')
        .mockRejectedValueOnce(new Error('API error'));

      const result = await redeemController.emitGiftCard(params);

      expect(result).toEqual({
        success: false,
        message: 'We had a problem generating your card :cry:',
      });
      expect(mockInstallController).toHaveBeenCalledWith(params.teamId);
      expect(mockWalletController.withdraw).not.toHaveBeenCalled();
    });
  });
});
