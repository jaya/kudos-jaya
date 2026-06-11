import { WalletController } from '@/controllers';
import { WalletService } from '../services/wallet.service';

jest.mock('@/controllers');
jest.mock('../utils/write-csv');

describe('WalletService', () => {
  let walletService: WalletService;
  let mockDeposit: jest.Mock;
  let mockWithdraw: jest.Mock;
  let mockGetBalance: jest.Mock;
  let mockFind: jest.Mock;
  let mockFetchWalletReport: jest.Mock;
  let mockGetBalanceToBeRedeemed: jest.Mock;

  const mockParams = {
    ownerId: 'user1',
    teamId: 'team123',
    amount: 100,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockDeposit = jest.fn().mockResolvedValue(undefined);
    mockWithdraw = jest.fn().mockResolvedValue(undefined);
    mockGetBalance = jest.fn().mockResolvedValue(100);
    mockFind = jest
      .fn()
      .mockResolvedValue({ ownerId: 'user1', teamId: 'team123', balance: 100 });
    mockFetchWalletReport = jest.fn().mockResolvedValue([
      { balance: 100, name: 'User 1' },
      { balance: 50, name: 'User 2' },
    ]);
    mockGetBalanceToBeRedeemed = jest.fn().mockResolvedValue(150);

    (WalletController as jest.Mock).mockImplementation(() => ({
      deposit: mockDeposit,
      withdraw: mockWithdraw,
      getBalance: mockGetBalance,
      getBalanceToBeRedeemed: mockGetBalanceToBeRedeemed,
      find: mockFind,
      fetchWalletReport: mockFetchWalletReport,
    }));

    walletService = new WalletService();
  });

  it('should delegate deposit to WalletController', async () => {
    await walletService.deposit(mockParams);
    expect(mockDeposit).toHaveBeenCalledWith(mockParams);
  });

  it('should delegate withdraw to WalletController', async () => {
    await walletService.withdraw(mockParams);
    expect(mockWithdraw).toHaveBeenCalledWith(mockParams);
  });

  it('should delegate getBalance to WalletController', async () => {
    const balance = await walletService.getBalance(mockParams);
    expect(mockGetBalance).toHaveBeenCalledWith(mockParams);
    expect(balance).toBe(100);
  });

  it('should delegate getBalanceToBeRedeemed to WalletController', async () => {
    const balance = await walletService.getBalanceToBeRedeemed({
      teamId: 'team123',
    });
    expect(mockGetBalanceToBeRedeemed).toHaveBeenCalledWith({
      teamId: 'team123',
    });
    expect(balance).toBe(150);
  });

  it('should delegate find to WalletController', async () => {
    const wallet = await walletService.find(mockParams);
    expect(mockFind).toHaveBeenCalledWith(mockParams);
    expect(wallet).toEqual({
      ownerId: 'user1',
      teamId: 'team123',
      balance: 100,
    });
  });

  it('should delegate fetchWalletReport to WalletController', async () => {
    const report = await walletService.fetchWalletReport({ teamId: 'team123' });
    expect(mockFetchWalletReport).toHaveBeenCalledWith({ teamId: 'team123' });
    expect(report).toEqual([
      { balance: 100, name: 'User 1' },
      { balance: 50, name: 'User 2' },
    ]);
  });
});
