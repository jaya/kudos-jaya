import { WebClient } from '@slack/web-api';
import { getSlackUserInfo, isUserAdmin } from '../user-slack-info';

jest.mock('@slack/web-api', () => {
  const mSlack = {
    users: {
      info: jest.fn(),
    },
  };
  return { WebClient: jest.fn(() => mSlack) };
});

describe('user-slack-info', () => {
  const botToken = 'bot-token-mocked';
  const userId = 'U123456';
  const mockRealName = 'John Doe';
  const mockEmail = 'john@mail.com';

  let slack: WebClient;

  beforeAll(() => {
    slack = new WebClient();
  });
  describe('getSlackUserInfo()', () => {
    it('returns name and email on successful response', async () => {
      (slack.users.info as jest.Mock).mockResolvedValue({
        ok: true,
        user: {
          profile: {
            real_name: mockRealName,
            email: mockEmail,
          },
        },
      });

      const user = await getSlackUserInfo(botToken, userId);

      expect(user).toEqual({ name: mockRealName, email: mockEmail });
      expect(slack.users.info).toHaveBeenCalledWith({ user: userId });
    });

    it('handles errors when Slack API fails', async () => {
      (slack.users.info as jest.Mock).mockRejectedValue(
        new Error('user_not_found'),
      );

      await expect(getSlackUserInfo(botToken, userId)).rejects.toThrow(
        'user_not_found',
      );
      expect(slack.users.info).toHaveBeenCalledWith({ user: userId });
    });
  });

  describe('isUserAdmin()', () => {
    describe('When user is admin', () => {
      it('should return true', async () => {
        (slack.users.info as jest.Mock).mockResolvedValue({
          ok: true,
          user: {
            is_admin: true,
          },
        });

        const res = await isUserAdmin(botToken, userId);

        expect(res).toBe(true);
        expect(slack.users.info).toHaveBeenCalledWith({ user: userId });
      });
    });

    describe('When user is not admin', () => {
      it('should return false', async () => {
        (slack.users.info as jest.Mock).mockResolvedValue({
          ok: true,
          user: {
            is_admin: false,
          },
        });

        const res = await isUserAdmin(botToken, userId);

        expect(res).toBe(false);
        expect(slack.users.info).toHaveBeenCalledWith({ user: userId });
      });
    });

    describe('When there is an error', () => {
      it('should log and throw the error', async () => {
        (slack.users.info as jest.Mock).mockRejectedValue(
          new Error('user_not_found'),
        );

        await expect(isUserAdmin(botToken, userId)).rejects.toThrow(
          'user_not_found',
        );
        expect(slack.users.info).toHaveBeenCalledWith({ user: userId });
      });
    });
  });
});
