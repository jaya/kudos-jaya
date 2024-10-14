import { TodoCartoes } from '@/clients/todo-cartoes/todo-cartoes';
import { EmitGiftCardPayload } from '@/clients/todo-cartoes/types';
import { RedeemController } from '@/controllers/redeem';
import { WalletController } from '@/controllers/wallet';
import * as HTTPUtil from '@/utils/request';

jest.mock('@/controllers/wallet');

describe('RedeemController', () => {
  let redeemController: RedeemController;
  let mockWalletController: jest.Mocked<WalletController>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockWalletController =
      new WalletController() as jest.Mocked<WalletController>;
    redeemController = new RedeemController();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (redeemController as any).walletController = mockWalletController;
  });

  describe('emitGiftCard', () => {
    const params = {
      userId: 'user1',
      cardId: 'card123',
      amount: 100,
      imageId: 'img123',
    };

    it('should return an error if the user has insufficient balance', async () => {
      mockWalletController.getBalance.mockResolvedValueOnce(50);

      const result = await redeemController.emitGiftCard(params);

      expect(result).toEqual({
        success: false,
        message:
          'You cannot request a gift card with a value greater than your current balance.',
      });

      expect(mockWalletController.getBalance).toHaveBeenCalledWith('user1');
    });

    it('should call TodoCartoes.emitGiftCard and return success if all goes well', async () => {
      mockWalletController.getBalance.mockResolvedValueOnce(200);

      const mockEmitGiftCardResponse = {
        status: 201,
        data: {
          magic_link: 'http://giftcard.url',
        },
      } as HTTPUtil.Response;

      const mockEmitGiftCard = jest
        .spyOn(TodoCartoes.prototype, 'emitGiftCard')
        .mockResolvedValueOnce(mockEmitGiftCardResponse);

      const result = await redeemController.emitGiftCard(params);

      expect(result).toEqual({
        success: true,
        url: 'http://giftcard.url',
        message:
          ':tada: *Your Gift Card has arrived* :tada: \nClick to access your gift card',
      });

      expect(mockEmitGiftCard).toHaveBeenCalledWith({
        card_identificator: 'card123',
        external_partner_load_id: expect.stringContaining('jayatech'),
        total: 100,
        card_image_id: 'img123',
      } as EmitGiftCardPayload);

      expect(mockWalletController.withdraw).toHaveBeenCalledWith('user1', 100);
    });

    it('should handle TodoCartoes API errors gracefully', async () => {
      mockWalletController.getBalance.mockResolvedValueOnce(200);

      const mockEmitGiftCardResponse = {
        status: 500,
      } as HTTPUtil.Response;

      jest
        .spyOn(TodoCartoes.prototype, 'emitGiftCard')
        .mockResolvedValueOnce(mockEmitGiftCardResponse);

      const result = await redeemController.emitGiftCard(params);

      expect(result).toEqual({
        success: false,
        message: 'We had a problem generating your card :cry:',
      });

      expect(mockWalletController.withdraw).not.toHaveBeenCalled();
    });

    it('should handle exceptions during API calls', async () => {
      mockWalletController.getBalance.mockResolvedValueOnce(200);

      jest
        .spyOn(TodoCartoes.prototype, 'emitGiftCard')
        .mockRejectedValueOnce(new Error('API error'));

      const result = await redeemController.emitGiftCard(params);

      expect(result).toEqual({
        success: false,
        message: 'We had a problem generating your card :cry:',
      });

      expect(mockWalletController.withdraw).not.toHaveBeenCalled();
    });
  });
});
