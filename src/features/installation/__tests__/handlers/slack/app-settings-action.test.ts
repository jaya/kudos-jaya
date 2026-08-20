import logger from '@/utils/logger';
import appSettingsActionHandler from '../../../handlers/slack/app-settings-action';
import { InstallationService } from '../../../services/installation.service';
import { currentSettingsResponse, users } from '../../fixtures/samples';

jest.mock('@/utils/logger');
jest.mock('../../../services/installation.service');

const mockAck = jest.fn();
const mockClient = {
  views: {
    open: jest.fn(),
  },
};
const mockBody = {
  user: {
    team_id: 'T12345',
  },
  trigger_id: 'trigger-123',
};

describe('appSettingsActionHandler()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should open the settings modal with current settings and auditor users', async () => {
    const mockService = {
      getCurrentSettings: jest.fn().mockResolvedValue(currentSettingsResponse),
      getAuditorUsers: jest.fn().mockResolvedValue(users),
    };
    (InstallationService as jest.Mock).mockImplementation(() => mockService);

    await appSettingsActionHandler({
      ack: mockAck,
      client: mockClient,
      body: mockBody,
    });

    expect(mockAck).toHaveBeenCalled();
    expect(mockService.getCurrentSettings).toHaveBeenCalledWith();
    expect(mockService.getAuditorUsers).toHaveBeenCalledWith();
    expect(mockClient.views.open).toHaveBeenCalledWith(
      expect.objectContaining({
        trigger_id: 'trigger-123',
        view: expect.objectContaining({
          callback_id: 'settings_view',
          type: 'modal',
        }),
      }),
    );
  });

  it('should log error when service fails', async () => {
    const error = new Error('Service error');
    const mockService = {
      getCurrentSettings: jest.fn().mockRejectedValue(error),
    };
    (InstallationService as jest.Mock).mockImplementation(() => mockService);

    await appSettingsActionHandler({
      ack: mockAck,
      client: mockClient,
      body: mockBody,
    });

    expect(logger.error).toHaveBeenCalledWith(
      'appSettingsActionHandler()',
      error,
    );
  });
});
