import { RedeemGiftCardService } from '../services/redeem-gift-card.service';
import { RedeemController } from '@/controllers/redeem';
import { ProductController } from '@/controllers/product';
import { UserController } from '@/controllers/user';
import { RequestContext } from '@/context';

jest.mock('@/controllers/redeem');
jest.mock('@/controllers/product');
jest.mock('@/controllers/user');
jest.mock('@/utils/logger');
jest.mock('@/context');

describe('RedeemGiftCardService', () => {
  let service: RedeemGiftCardService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockRedeemController: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockProductController: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockUserController: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRedeemController = {
      emitGiftCard: jest.fn(),
    };

    mockProductController = {
      get: jest.fn(),
    };

    mockUserController = {
      findMany: jest.fn(),
    };

    (RedeemController as jest.Mock).mockImplementation(
      () => mockRedeemController,
    );
    (ProductController as jest.Mock).mockImplementation(
      () => mockProductController,
    );
    (UserController as jest.Mock).mockImplementation(() => mockUserController);

    (RequestContext.get as jest.Mock).mockReturnValue({
      teamId: 'team1',
    });

    service = new RedeemGiftCardService();
  });

  describe('emitGiftCard', () => {
    it('should emit gift card successfully', async () => {
      const mockResult = {
        success: true,
        url: 'https://example.com/card',
        message: 'Card generated',
      };

      mockRedeemController.emitGiftCard.mockResolvedValue(mockResult);

      const result = await service.emitGiftCard({
        userId: 'user1',
        cardId: 'card1',
        amount: 100,
      });

      expect(result).toEqual(mockResult);
      expect(mockRedeemController.emitGiftCard).toHaveBeenCalledWith({
        userId: 'user1',
        cardId: 'card1',
        amount: 100,
        teamId: 'team1',
      });
    });

    it('should return error message on failure', async () => {
      mockRedeemController.emitGiftCard.mockRejectedValue(
        new Error('API error'),
      );

      const result = await service.emitGiftCard({
        userId: 'user1',
        cardId: 'card1',
        amount: 100,
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('problem');
    });
  });

  describe('getProductInfo', () => {
    it('should return product name', async () => {
      mockProductController.get.mockResolvedValue([{ name: 'Amazon' }]);

      const result = await service.getProductInfo('card1');

      expect(result).toEqual({ name: 'Amazon' });
    });

    it('should return null when product not found', async () => {
      mockProductController.get.mockResolvedValue([]);

      const result = await service.getProductInfo('card1');

      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      mockProductController.get.mockRejectedValue(new Error('DB error'));

      const result = await service.getProductInfo('card1');

      expect(result).toBeNull();
    });
  });

  describe('getAuditors', () => {
    it('should return list of auditors', async () => {
      const mockAuditors = [{ id: 'user1' }, { id: 'user2' }];
      mockUserController.findMany.mockResolvedValue(mockAuditors);

      const result = await service.getAuditors();

      expect(result).toEqual(mockAuditors);
      expect(mockUserController.findMany).toHaveBeenCalledWith({
        teamId: 'team1',
        params: { isAuditor: true },
      });
    });

    it('should return empty array when no auditors found', async () => {
      mockUserController.findMany.mockResolvedValue([]);

      const result = await service.getAuditors();

      expect(result).toEqual([]);
    });

    it('should return empty array on error', async () => {
      mockUserController.findMany.mockRejectedValue(new Error('DB error'));

      const result = await service.getAuditors();

      expect(result).toEqual([]);
    });
  });
});
