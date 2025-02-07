import { Giphy } from '@/clients/giphy/giphy';
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
      },
    },
  };

  const mockedGifUrl = 'https://test-url.gif.com';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send kudos to the correct channel and users', async () => {
    const giphyMocked = jest
      .spyOn(Giphy.prototype, 'fetchGif')
      .mockResolvedValueOnce(mockedGifUrl);

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
      ],
    });
    expect(mockClient.chat.postMessage).toHaveBeenCalledTimes(3);
    expect(giphyMocked).toHaveBeenCalled();
    expect(installControllerMocked).toHaveBeenCalledWith(body.user.team_id);
  });

  it('should handle errors from RecognitionController and notify the user', async () => {
    jest.spyOn(Giphy.prototype, 'fetchGif').mockResolvedValueOnce(mockedGifUrl);
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
    jest.spyOn(Giphy.prototype, 'fetchGif').mockResolvedValueOnce(mockedGifUrl);
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
});
