import logger from '@/utils/logger';
import { WebClient } from '@slack/web-api';
import { sendFinishInstallMessage } from '../send-finish-install';

jest.mock('@slack/web-api', () => {
  const mSlack = {
    chat: {
      postMessage: jest.fn(),
    },
  };
  return { WebClient: jest.fn(() => mSlack) };
});
jest.mock('@/utils/logger');

describe('sendFinishInstallMessage()', () => {
  let slack: WebClient;

  beforeAll(() => {
    slack = new WebClient();
  });
  describe('When sending the finish installation message', () => {
    it('Should send the message', async () => {
      (slack.chat.postMessage as jest.Mock).mockResolvedValue(undefined);

      await sendFinishInstallMessage('bot-token-test', 'userid123');
      expect(slack.chat.postMessage).toHaveBeenCalledWith({
        blocks: [
          {
            text: {
              text: 'Click the button below to finish installing the app',
              type: 'mrkdwn',
            },
            type: 'section',
          },
          {
            elements: [
              {
                action_id: 'app_settings',
                text: {
                  emoji: true,
                  text: 'Finish Install',
                  type: 'plain_text',
                },
                type: 'button',
              },
            ],
            type: 'actions',
          },
        ],
        channel: 'userid123',
        text: 'Click the button below to finish installing the app',
        token: 'bot-token-test',
      });
    });
  });
  describe('When there is an error while trying to send the message', () => {
    it('Should not send the message and log the error', async () => {
      (slack.chat.postMessage as jest.Mock).mockRejectedValue(new Error());
      await sendFinishInstallMessage('bot-token-test', 'userid123');
      expect(logger.error).toHaveBeenCalledWith(
        'Error while sending finish install message',
        new Error(),
      );
    });
  });
});
