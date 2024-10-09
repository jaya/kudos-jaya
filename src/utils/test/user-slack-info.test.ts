import { getSlackUserInfo } from '../user-slack-info';

describe('getSlackUserInfo', () => {
  const mockClient = {
    users: {
      info: jest.fn(),
    },
  };

  const userId = 'U12345';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the real name of the Slack user when the response is successful', async () => {
    const mockResponse = {
      ok: true,
      user: {
        profile: {
          real_name: 'John Doe',
        },
      },
    };

    mockClient.users.info.mockResolvedValue(mockResponse);

    const result = await getSlackUserInfo(mockClient, userId);

    expect(mockClient.users.info).toHaveBeenCalledWith({ user: userId });
    expect(result).toBe('John Doe');
  });

  it('should throw an error if the Slack API response is not ok', async () => {
    const mockErrorResponse = {
      ok: false,
      error: 'user_not_found',
    };

    mockClient.users.info.mockResolvedValue(mockErrorResponse);

    await expect(getSlackUserInfo(mockClient, userId)).rejects.toThrow(
      'user_not_found'
    );

    expect(mockClient.users.info).toHaveBeenCalledWith({ user: userId });
  });

  it('should throw an error if the Slack API throws an exception', async () => {
    const mockError = new Error('API failure');
    mockClient.users.info.mockRejectedValue(mockError);

    await expect(getSlackUserInfo(mockClient, userId)).rejects.toThrow(
      'API failure'
    );

    expect(mockClient.users.info).toHaveBeenCalledWith({ user: userId });
  });
});
