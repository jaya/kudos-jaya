import { InstallationController } from '@/controllers';
import logger from '@/utils/logger';
import appSettingsButtonCallback from '../app-settings';
import { currentSettingsResponse, responseView } from './samples/app-settings';

const ack = jest.fn();
jest.mock('@/utils/logger');
const client = {
  views: {
    open: jest.fn(),
  },
};
const body = {
  user: {
    team_id: 'T12345',
  },
};

describe('appSettingsButtonCallback()', () => {
  it('Should build the settings modal', async () => {
    jest
      .spyOn(InstallationController.prototype, 'getCurrentSettings')
      .mockResolvedValueOnce(currentSettingsResponse);

    await appSettingsButtonCallback({ ack, client, body });
    expect(client.views.open).toHaveBeenCalledWith(responseView);
  });

  it('Should log the error when there is one', async () => {
    const error = new Error();
    jest
      .spyOn(InstallationController.prototype, 'getCurrentSettings')
      .mockRejectedValueOnce(error);

    await appSettingsButtonCallback({ ack, client, body });
    expect(logger.error).toHaveBeenCalledWith('finishInstallButtonCallback()', {
      error,
    });
  });
});
