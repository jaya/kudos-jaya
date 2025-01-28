import logger from '@/utils/logger';
import { WebClient } from '@slack/web-api';
import { sendNotAdminMessage } from '../send-not-admin';

jest.mock('@slack/web-api', () => {
  const mSlack = {
    chat: {
      postMessage: jest.fn(),
    },
  };
  return { WebClient: jest.fn(() => mSlack) };
});
jest.mock('@/utils/logger');

describe('sendNotAdminMessage()', () => {
  let slack: WebClient;

  beforeAll(() => {
    slack = new WebClient();
  });
  describe('When sending the not admin message', () => {
    it('Should send the message', async () => {
      (slack.chat.postMessage as jest.Mock).mockResolvedValue(undefined);

      await sendNotAdminMessage('bot-token-test', 'userid123');
      expect(slack.chat.postMessage).toHaveBeenCalledWith({
        blocks: [
          {
            text: {
              text: 'Thank you for installing Kudos Jaya! \nFor the app to work correctly, you must be an admin workspace and access the app’s home page to complete the necessary configuration.',
              type: 'mrkdwn',
            },
            type: 'section',
          },
        ],
        channel: 'userid123',
        text: 'Thank you for installing Kudos Jaya!',
        token: 'bot-token-test',
      });
    });
  });
  describe('When there is an error while trying to send the message', () => {
    it('Should not send the message and log the error', async () => {
      (slack.chat.postMessage as jest.Mock).mockRejectedValue(new Error());
      await sendNotAdminMessage('bot-token-test', 'userid123');
      expect(logger.error).toHaveBeenCalledWith(
        'sendNotAdminMessage()',
        new Error()
      );
    });
  });
});
