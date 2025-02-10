import { WalletController } from '@/controllers/wallet';
import { AppDataSource } from '@/data-source';

jest.mock('@/data-source');

describe('WalletController', () => {
  let walletController: WalletController;
  let mockWalletRepository;

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  };

  const mockParams = {
    ownerId: 'user1',
    balance: 100,
    teamId: 'team123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockWalletRepository = {
      findOneBy: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnThis(),
    };
    (AppDataSource.getRepository as jest.Mock).mockReturnValue(
      mockWalletRepository,
    );

    walletController = new WalletController();
  });

  describe('deposit', () => {
    it('should create a new wallet if none exists for the owner and deposit the amount', async () => {
      mockWalletRepository.findOneBy.mockResolvedValueOnce(null);
      mockWalletRepository.save.mockResolvedValueOnce(mockParams);

      await walletController.deposit({
        amount: mockParams.balance,
        ...mockParams,
      });

      expect(mockWalletRepository.save).toHaveBeenCalledWith(mockParams);
    });

    it('should add the amount to the existing wallet balance and save it', async () => {
      const existingWallet = {
        ...mockParams,
        balance: 50,
      };

      mockWalletRepository.findOneBy.mockResolvedValueOnce(existingWallet);

      await walletController.deposit({
        ...mockParams,
        amount: mockParams.balance,
      });

      expect(existingWallet.balance).toBe(150);
      expect(mockWalletRepository.update).toHaveBeenCalledWith(
        { ownerId: mockParams.ownerId, teamId: mockParams.teamId },
        { balance: 150 },
      );
    });
  });

  describe('withdraw', () => {
    it('should return if no wallet exists for the owner', async () => {
      mockWalletRepository.findOneBy.mockResolvedValueOnce(null);

      await walletController.withdraw(mockParams);

      expect(mockWalletRepository.save).not.toHaveBeenCalled();
    });

    it('should subtract the amount from the wallet balance and save it', async () => {
      const existingWallet = { ...mockParams, balance: 150 };
      mockWalletRepository.findOneBy.mockResolvedValueOnce(existingWallet);

      await walletController.withdraw({
        ...mockParams,
        amount: mockParams.balance,
      });

      expect(existingWallet.balance).toBe(50);
      expect(mockWalletRepository.update).toHaveBeenCalledWith(
        { ownerId: mockParams.ownerId, teamId: mockParams.teamId },
        { balance: 50 },
      );
    });
  });

  describe('getBalance', () => {
    it('should return the balance if the wallet exists', async () => {
      const existingWallet = { ...mockParams, balance: 200 };
      mockWalletRepository.findOneBy.mockResolvedValueOnce(existingWallet);

      const balance = await walletController.getBalance({
        ...mockParams,
        amount: mockParams.balance,
      });

      expect(balance).toBe(200);
    });

    it('should return 0 if no wallet exists for the owner', async () => {
      mockWalletRepository.findOneBy.mockResolvedValueOnce(null);

      const balance = await walletController.getBalance({
        ...mockParams,
        amount: mockParams.balance,
      });

      expect(balance).toBe(0);
    });
  });

  describe('getBalanceToBeRedeemed', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockWalletRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    });
    it('should return the sum of all wallets', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ total: 3000 });

      const balance = await walletController.getBalanceToBeRedeemed({
        teamId: 'T1234',
      });

      expect(balance).toBe(3000);
    });

    it('should return 0 if there is no data to the team', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ total: null });

      const balance = await walletController.getBalanceToBeRedeemed({
        teamId: 'T1234',
      });

      expect(balance).toBe(0);
    });
  });

  describe('find', () => {
    it('Should return the wallet of given parameters', async () => {
      mockWalletRepository.findOneBy.mockResolvedValueOnce(mockParams);
      const wallet = await walletController.find(mockParams);
      expect(wallet).toEqual(mockParams);
    });
  });
});
