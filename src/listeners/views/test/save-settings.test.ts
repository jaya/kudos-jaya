import { InstallationController } from '@/controllers/installation';
import { storedInstallation } from '@/controllers/test/samples/installation';
import logger from '@/utils/logger';
import saveSettingsCallback from '../save-settings';

jest.mock('@/controllers/installation');
const mockAck = jest.fn();

const mockClient = {
  chat: {
    postMessage: jest.fn(),
  },
  token: 'bot-token-test-mock',
};

describe('saveSettingsCallback()', () => {
  const view = {
    state: {
      values: {
        setup_todo_token: {
          todo_token: {
            value: 'plain-token-mock',
          },
        },
        setup_default_channel_id: {
          default_channel_id: {
            value: '#bots',
          },
        },
        setup_default_amount: {
          default_amount: {
            value: '100',
          },
        },
        setup_company_values: {
          company_values: {
            value: 'Love your day, Connect yourself with the impact',
          },
        },
        auditor_users: {
          auditor_users: {
            selected_users: ['U123456', 'U654321'],
          },
        },
      },
    },
  };
  const body = {
    user: {
      id: 'U12345',
      team_id: 'TEAM1234',
    },
  };
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Upon completion of the installation with all fields correctly filled in', () => {
    it('Should update the installation and send a message to the user', async () => {
      jest
        .spyOn(InstallationController.prototype, 'update')
        .mockResolvedValueOnce({
          ...storedInstallation,
          createdAt: new Date(),
        });

      await saveSettingsCallback({
        ack: mockAck,
        view,
        client: mockClient,
        body,
      });
      expect(mockClient.chat.postMessage).toHaveBeenCalledWith({
        channel: body.user.id,
        // eslint-disable-next-line quotes
        text: "*Awesome!* 🎉 Now that we're ready, type `/give-kudos` in chat and spread the *gratitude* and *love* with your colleagues.",
      });
    });
  });

  describe('When there is an error while trying to save the settings', () => {
    it('Should log the error', async () => {
      jest
        .spyOn(InstallationController.prototype, 'update')
        .mockRejectedValue(new Error());
      logger.error = jest.fn();

      await saveSettingsCallback({
        ack: mockAck,
        view,
        client: mockClient,
        body,
      });

      expect(logger.error).toHaveBeenCalledWith('saveSettingsCallback()', {
        error: new Error(),
      });
    });
  });
});
