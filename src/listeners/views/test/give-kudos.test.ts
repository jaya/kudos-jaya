import { InstallationController } from '@/controllers/installation';
import { RecognitionController } from '@/controllers/recognition';
import logger from '@/utils/logger';
import giveKudosViewCallback from '../give-kudos';

jest.mock('@/controllers/recognition');
jest.mock('@/controllers/installation');
jest.mock('@/utils/user-slack-info', () => ({
  getSlackUserInfo: jest.fn(),
}));

const mockAck = jest.fn();

const mockClient = {
  chat: {
    postMessage: jest.fn(),
  },
  token: 'bot-token-test-mock',
};

describe('giveKudosViewCallback', () => {
  const body = {
    user: {
      id: 'U12345',
      team_id: 'TEAM1234',
    },
  };
  const mockedGifUrl = 'https://test-url.gif.com';

  const view = {
    state: {
      values: {
        to_id_block: {
          to_id: {
            selected_users: ['U67890', 'U1234'],
          },
        },
        kudo_message_block: {
          kudo_message: {
            value: 'Great job on the project!',
          },
        },
        company_values_block: {
          company_values_select_action: {
            selected_options: [
              {
                text: {
                  type: 'plain_text',
                  text: 'Love your day',
                  emoji: true,
                },
                value: '0',
              },
              {
                text: {
                  type: 'plain_text',
                  text: 'Conect yourself with the impact',
                  emoji: true,
                },
                value: '1',
              },
              {
                text: {
                  type: 'plain_text',
                  text: 'Develop your next version',
                  emoji: true,
                },
                value: '2',
              },
            ],
          },
        },
      },
    },
    blocks: [
      {
        type: 'image',
        block_id: 'gif_block',
        image_url: mockedGifUrl,
        alt_text: 'Gif image that will be sent',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send kudos to the correct channel and users', async () => {
    const installControllerMocked = jest
      .spyOn(InstallationController.prototype, 'find')
      .mockResolvedValueOnce({ defaultRecognitionChannel: 'CHANNEL123' });

    jest
      .spyOn(RecognitionController.prototype, 'save')
      .mockResolvedValue({ ok: true });

    await giveKudosViewCallback({
      ack: mockAck,
      view,
      client: mockClient,
      body,
    });

    expect(mockClient.chat.postMessage).toHaveBeenCalledWith({
      channel: 'U67890',
      text: 'Hey <@U67890> Jaya is sending you a gift, check your balance! ',
    });

    expect(mockClient.chat.postMessage).toHaveBeenCalledWith({
      channel: 'U1234',
      text: 'Hey <@U1234> Jaya is sending you a gift, check your balance! ',
    });

    expect(mockClient.chat.postMessage).toHaveBeenCalledWith({
      channel: 'CHANNEL123',
      // eslint-disable-next-line quotes
      text: `*<@U12345> is recognizing <@U67890>, <@U1234>!* \n> Great job on the project!`,
      blocks: [
        {
          type: 'image',
          image_url: mockedGifUrl,
          alt_text: 'GIF',
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            // eslint-disable-next-line quotes
            text: `*<@U12345> is recognizing <@U67890>, <@U1234>!* \nGreat job on the project!`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '> Love your day, Conect yourself with the impact, Develop your next version',
          },
        },
      ],
    });
    expect(mockClient.chat.postMessage).toHaveBeenCalledTimes(3);
    expect(installControllerMocked).toHaveBeenCalledWith(body.user.team_id);
  });

  it('should handle errors from RecognitionController and notify the user', async () => {
    jest
      .spyOn(InstallationController.prototype, 'find')
      .mockResolvedValueOnce({ defaultRecognitionChannel: 'CHANNEL123' });
    jest
      .spyOn(RecognitionController.prototype, 'save')
      .mockResolvedValue({ ok: false });

    await giveKudosViewCallback({
      ack: mockAck,
      view,
      client: mockClient,
      body,
    });

    expect(mockClient.chat.postMessage).toHaveBeenCalledWith({
      channel: 'U12345',
      text: 'An error occurred while giving <@U67890> a kudos :cry:',
    });
  });

  it('should log a non mapped error', async () => {
    jest
      .spyOn(InstallationController.prototype, 'find')
      .mockResolvedValueOnce({ defaultRecognitionChannel: 'CHANNEL123' });

    jest
      .spyOn(RecognitionController.prototype, 'save')
      .mockRejectedValue(new Error());

    logger.error = jest.fn();

    await giveKudosViewCallback({
      ack: mockAck,
      view,
      client: mockClient,
      body,
    });

    expect(logger.error).toHaveBeenCalledWith('giveKudosViewCallback()', {
      error: new Error(),
    });
  });

  describe('When there is no company values set up in the app settings', () => {
    it('Should not send the company values in the kudo message', async () => {
      const installControllerMocked = jest
        .spyOn(InstallationController.prototype, 'find')
        .mockResolvedValueOnce({ defaultRecognitionChannel: 'CHANNEL123' });

      jest
        .spyOn(RecognitionController.prototype, 'save')
        .mockResolvedValue({ ok: true });

      await giveKudosViewCallback({
        ack: mockAck,
        view: {
          state: {
            values: {
              to_id_block: view.state.values.to_id_block,
              kudo_message_block: view.state.values.kudo_message_block,
            },
          },
          blocks: view.blocks,
        },
        client: mockClient,
        body,
      });

      expect(mockClient.chat.postMessage).toHaveBeenCalledWith({
        channel: 'U67890',
        text: 'Hey <@U67890> Jaya is sending you a gift, check your balance! ',
      });

      expect(mockClient.chat.postMessage).toHaveBeenCalledWith({
        channel: 'U1234',
        text: 'Hey <@U1234> Jaya is sending you a gift, check your balance! ',
      });

      expect(mockClient.chat.postMessage).toHaveBeenCalledWith({
        channel: 'CHANNEL123',
        // eslint-disable-next-line quotes
        text: `*<@U12345> is recognizing <@U67890>, <@U1234>!* \n> Great job on the project!`,
        blocks: [
          {
            type: 'image',
            image_url: mockedGifUrl,
            alt_text: 'GIF',
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              // eslint-disable-next-line quotes
              text: `*<@U12345> is recognizing <@U67890>, <@U1234>!* \nGreat job on the project!`,
            },
          },
        ],
      });
      expect(mockClient.chat.postMessage).toHaveBeenCalledTimes(3);
      expect(installControllerMocked).toHaveBeenCalledWith(body.user.team_id);
    });
  });
});
