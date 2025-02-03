import { TransactionController, WalletController } from '@/controllers';
import { isUserAdmin } from '@/utils/user-slack-info';
import { getAdminPanelSection } from '../admin-panel';

jest.mock('@/utils/user-slack-info');
jest.mock('@/controllers');

describe('getAdminPanelSection()', () => {
  let mockWalletController: jest.Mocked<WalletController>;
  let mockTransactionController: jest.Mocked<TransactionController>;
  const mockPayload = {
    token: 'xoxb-token-1234',
    user: 'U1234',
    teamId: 'T12345',
  };
  beforeEach(() => {
    jest.clearAllMocks();

    mockWalletController =
      new WalletController() as jest.Mocked<WalletController>;

    mockTransactionController =
      new TransactionController() as jest.Mocked<TransactionController>;
  });
  describe('When the user is admin', () => {
    it('Should return the admin section of the home page', async () => {
      (isUserAdmin as jest.Mock).mockResolvedValue(true);
      mockWalletController.getBalanceToBeRedeemed.mockResolvedValueOnce(1000);
      mockTransactionController.redeemed.mockResolvedValue(1500);

      const adminSection = await getAdminPanelSection(mockPayload);
      expect(adminSection).toMatchSnapshot();
    });
  });

  describe('When the user is not admin', () => {
    it('Should return an empty array', async () => {
      (isUserAdmin as jest.Mock).mockResolvedValue(false);
      const adminSection = await getAdminPanelSection(mockPayload);
      expect(adminSection).toEqual([]);
    });
  });
});
