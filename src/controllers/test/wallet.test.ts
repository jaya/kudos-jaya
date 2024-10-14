import { WalletController } from '@/controllers/wallet';
import { AppDataSource } from '@/data-source';

jest.mock('@/data-source');

describe('WalletController', () => {
  let walletController: WalletController;
  let mockWalletRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    mockWalletRepository = {
      findOneBy: jest.fn(),
      save: jest.fn(),
    };
    (AppDataSource.getRepository as jest.Mock).mockReturnValue(
      mockWalletRepository
    );

    walletController = new WalletController();
  });

  describe('deposit', () => {
    it('should create a new wallet if none exists for the owner and deposit the amount', async () => {
      mockWalletRepository.findOneBy.mockResolvedValueOnce(null);
      mockWalletRepository.save.mockResolvedValueOnce({
        ownerId: 'user1',
        balance: 100,
      });

      await walletController.deposit('user1', 100);

      expect(mockWalletRepository.save).toHaveBeenCalledWith({
        ownerId: 'user1',
        balance: 100,
      });
    });

    it('should add the amount to the existing wallet balance and save it', async () => {
      const existingWallet = { ownerId: 'user1', balance: 50 };
      mockWalletRepository.findOneBy.mockResolvedValueOnce(existingWallet);

      await walletController.deposit('user1', 100);

      expect(existingWallet.balance).toBe(150);
      expect(mockWalletRepository.save).toHaveBeenCalledWith(existingWallet);
    });
  });

  describe('withdraw', () => {
    it('should return if no wallet exists for the owner', async () => {
      mockWalletRepository.findOneBy.mockResolvedValueOnce(null);

      await walletController.withdraw('user1', 50);

      expect(mockWalletRepository.save).not.toHaveBeenCalled();
    });

    it('should subtract the amount from the wallet balance and save it', async () => {
      const existingWallet = { ownerId: 'user1', balance: 150 };
      mockWalletRepository.findOneBy.mockResolvedValueOnce(existingWallet);

      await walletController.withdraw('user1', 50);

      expect(existingWallet.balance).toBe(100);
      expect(mockWalletRepository.save).toHaveBeenCalledWith(existingWallet);
    });
  });

  describe('getBalance', () => {
    it('should return the balance if the wallet exists', async () => {
      const existingWallet = { ownerId: 'user1', balance: 200 };
      mockWalletRepository.findOneBy.mockResolvedValueOnce(existingWallet);

      const balance = await walletController.getBalance('user1');

      expect(balance).toBe(200);
    });

    it('should return 0 if no wallet exists for the owner', async () => {
      mockWalletRepository.findOneBy.mockResolvedValueOnce(null);

      const balance = await walletController.getBalance('user1');

      expect(balance).toBe(0);
    });
  });
});
