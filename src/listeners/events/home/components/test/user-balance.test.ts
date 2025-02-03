import { RecognitionController, WalletController } from '@/controllers';
import { getUserBalanceSection } from '../user-balance';

describe('getUserBalanceSection()', () => {
  it('Should return the user balance section', async () => {
    jest
      .spyOn(RecognitionController.prototype, 'getTotal')
      .mockResolvedValueOnce(25);
    jest
      .spyOn(WalletController.prototype, 'getBalance')
      .mockResolvedValueOnce(550);

    const userBalance = await getUserBalanceSection({
      user: 'U12345',
      teamId: 'T12345',
    });

    expect(userBalance).toMatchSnapshot();
  });
});
