import logger from '@/utils/logger';
import saveSettingsViewHandler from '../../../handlers/slack/save-settings-view';
import { InstallationService } from '../../../services/installation.service';

jest.mock('@/utils/logger');
jest.mock('../../../services/installation.service');

const mockAck = jest.fn();
const mockClient = {
  token: 'bot-token-test-mock',
  chat: {
    postMessage: jest.fn(),
  },
};

const mockView = {
  team_id: 'TEAM1234',
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
      setup_monthly_kudos_limit: {
        monthly_kudos_limit: {
          value: '5',
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

const mockBody = {
  user: {
    id: 'U12345',
  },
};

describe('saveSettingsViewHandler()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should save settings and send confirmation message', async () => {
    const mockService = {
      saveSettings: jest.fn().mockResolvedValue(undefined),
    };
    (InstallationService as jest.Mock).mockImplementation(() => mockService);

    await saveSettingsViewHandler({
      ack: mockAck,
      view: mockView,
      client: mockClient,
      body: mockBody,
    });

    expect(mockAck).toHaveBeenCalled();
    expect(mockService.saveSettings).toHaveBeenCalledWith({
      teamId: 'TEAM1234',
      userId: 'U12345',
      botToken: 'bot-token-test-mock',
      todoToken: 'plain-token-mock',
      defaultChannelId: '#bots',
      defaultAmount: 100,
      companyValues: 'Love your day, Connect yourself with the impact',
      monthlyKudosLimit: 5,
      auditorUserIds: ['U123456', 'U654321'],
    });

    expect(mockClient.chat.postMessage).toHaveBeenCalledWith({
      channel: 'U12345',
      // prettier-ignore
      text: '*Awesome!* 🎉 Now that we\'re ready, type `/give-kudos` in chat and spread the *gratitude* and *love* with your colleagues.',
    });
  });

  it('should log error when service fails', async () => {
    const error = new Error('Save error');
    const mockService = {
      saveSettings: jest.fn().mockRejectedValue(error),
    };
    (InstallationService as jest.Mock).mockImplementation(() => mockService);

    await saveSettingsViewHandler({
      ack: mockAck,
      view: mockView,
      client: mockClient,
      body: mockBody,
    });

    expect(logger.error).toHaveBeenCalledWith(
      'saveSettingsViewHandler()',
      error,
    );
  });
});
