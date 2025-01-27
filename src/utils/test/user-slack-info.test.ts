import { WebClient } from '@slack/web-api';
import { getSlackUserInfo } from '../user-slack-info';

jest.mock('@slack/web-api', () => {
  const mSlack = {
    users: {
      info: jest.fn(),
    },
  };
  return { WebClient: jest.fn(() => mSlack) };
});

describe('getSlackUserInfo', () => {
  const botToken = 'bot-token-mocked';
  const userId = 'U123456';
  const mockRealName = 'John Doe';

  let slack: WebClient;

  beforeAll(() => {
    slack = new WebClient();
  });

  it('returns real name on successful response', async () => {
    (slack.users.info as jest.Mock).mockResolvedValue({
      ok: true,
      user: {
        profile: {
          real_name: mockRealName,
        },
      },
    });

    const realName = await getSlackUserInfo(botToken, userId);

    expect(realName).toBe(mockRealName);
    expect(slack.users.info).toHaveBeenCalledWith({ user: userId });
  });

  it('handles errors when Slack API fails', async () => {
    (slack.users.info as jest.Mock).mockRejectedValue(
      new Error('user_not_found')
    );

    await expect(getSlackUserInfo(botToken, userId)).rejects.toThrow(
      'user_not_found'
    );
    expect(slack.users.info).toHaveBeenCalledWith({ user: userId });
  });
});
