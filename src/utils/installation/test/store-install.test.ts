import { InstallationController } from '@/controllers/installation';
import { isUserAdmin } from '@/utils/user-slack-info';
import { sendFinishInstallMessage } from '../send-finish-install';
import { sendNotAdminMessage } from '../send-not-admin';
import { storeInstallation } from '../store-install';

jest.mock('@/controllers/installation');
jest.mock('@/utils/user-slack-info');
jest.mock('../send-finish-install');
jest.mock('../send-not-admin');

describe('storeInstallation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send not admin message if user is not admin', async () => {
    const installation = { user: { id: 'user1' }, bot: { token: 'bot-token' } };
    (isUserAdmin as jest.Mock).mockResolvedValue(false);

    const mockInstallController = jest
      .spyOn(InstallationController.prototype, 'create')
      .mockResolvedValueOnce(undefined);

    await storeInstallation(installation);

    expect(sendNotAdminMessage).toHaveBeenCalledWith('bot-token', 'user1');
    expect(mockInstallController).not.toHaveBeenCalled();
    expect(sendFinishInstallMessage).not.toHaveBeenCalled();
  });

  it('should store the installation if there is a team on payload', async () => {
    const mockInstallController = jest
      .spyOn(InstallationController.prototype, 'create')
      .mockResolvedValueOnce(undefined);

    const installation = {
      user: { id: 'user1' },
      bot: { token: 'bot-token' },
      team: { id: 'team-id' },
    };
    (isUserAdmin as jest.Mock).mockResolvedValue(true);

    await storeInstallation(installation);

    expect(mockInstallController).toHaveBeenCalledWith(installation);
    expect(sendFinishInstallMessage).toHaveBeenCalledWith('bot-token', 'user1');
  });

  it('should do nothing if there is no botToken', async () => {
    const installation = {
      user: { id: 'user1' },
      bot: { token: undefined },
      team: { id: 'team-id' },
    };
    (isUserAdmin as jest.Mock).mockResolvedValue(true);

    await storeInstallation(installation);

    expect(sendFinishInstallMessage).not.toHaveBeenCalled();
  });
});
