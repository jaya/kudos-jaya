import { RecognitionController } from '@/controllers';
import { Recognition } from '@/entities';
import { authenticateApiKey } from '@/utils/authMiddleware';
import { getQueryParams, sendJsonResponse } from '@/utils/http-utils';
import { ParamsIncomingMessage } from '@slack/bolt/dist/receivers/ParamsIncomingMessage';
import { WebClient } from '@slack/web-api';
import http from 'http';
import { userHandler } from '../user';

jest.mock('@/utils/authMiddleware');
jest.mock('@slack/web-api', () => {
  const mSlack = {
    users: {
      lookupByEmail: jest.fn(),
    },
  };
  return { WebClient: jest.fn(() => mSlack) };
});
jest.mock('@/utils/http-utils');
jest.mock('@/controllers');

const mockGetQueryParams = getQueryParams as jest.Mock;
const mockAuthenticateApiKey = authenticateApiKey as jest.Mock;
const mockSendJsonResponse = sendJsonResponse as jest.Mock;
const mockedRecognitionController = jest.mocked(RecognitionController);

describe('userHandler', () => {
  let mockReq: Partial<ParamsIncomingMessage>;
  let mockRes: Partial<http.ServerResponse>;
  let slack: WebClient;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      params: { email: 'test@example.com' },
      url: '/kudos/user?page=1&pageSize=10',
      headers: {},
    };

    mockRes = {
      statusCode: 0,
      setHeader: jest.fn(),
      end: jest.fn(),
      writeHead: jest.fn(),
    } as Partial<http.ServerResponse>;

    mockGetQueryParams.mockReturnValue({ page: 1, pageSize: 10 });

    slack = new WebClient();
  });

  it('should return 401 if API key is invalid or missing', async () => {
    mockAuthenticateApiKey.mockResolvedValueOnce(null);

    await userHandler(
      mockReq as ParamsIncomingMessage,
      mockRes as http.ServerResponse,
    );

    expect(mockAuthenticateApiKey).toHaveBeenCalledWith(mockReq);
  });

  it('should return 404 if user is not found via Slack API', async () => {
    mockAuthenticateApiKey.mockResolvedValueOnce({
      teamId: 'T123',
      bot: { token: 'bot-token' },
    });

    (slack.users.lookupByEmail as jest.Mock).mockRejectedValueOnce(
      new Error('user_not_found'),
    );

    await userHandler(
      mockReq as ParamsIncomingMessage,
      mockRes as http.ServerResponse,
    );

    expect(mockAuthenticateApiKey).toHaveBeenCalledWith(mockReq);
    expect(mockSendJsonResponse).toHaveBeenCalledWith(mockRes, 404, {
      message: 'No kudos found with provided params',
    });
  });

  it('should return 404 if user is found but has no kudos', async () => {
    mockAuthenticateApiKey.mockResolvedValueOnce({
      teamId: 'T123',
      bot: { token: 'bot-token' },
    });

    (slack.users.lookupByEmail as jest.Mock).mockResolvedValueOnce({
      ok: true,
      user: { id: 'U123', team_id: 'T123', name: 'Test User' },
    });

    mockedRecognitionController.prototype.findWithPagination.mockResolvedValueOnce(
      {
        data: [],
        totalCount: 0,
        currentPage: 1,
        pageSize: 10,
        totalPages: 10,
      },
    );

    await userHandler(
      mockReq as ParamsIncomingMessage,
      mockRes as http.ServerResponse,
    );

    expect(mockSendJsonResponse).toHaveBeenCalledWith(mockRes, 404, {
      message: 'No kudos found with provided params',
    });
  });

  it('should return 200 with kudos if user and kudos are found', async () => {
    const mockKudosData = {
      data: [
        {
          id: 1,
          fromId: 'U07NLPYPEAF',
          fromName: 'Test User',
          toId: 'U07NLPYPEAF',
          toName: 'Test User 2',
          description: 'Yay',
          createdAt: '2025-05-15T00:00:07.171Z',
          teamId: 'T07N6AMAQRM',
          slackMessageId: '1747256407.643409',
          slackChannelId: 'C07NLQ1RHHR',
        } as unknown as Recognition,
      ],
      currentPage: 1,
      totalCount: 1,
      pageSize: 10,
      totalPages: 1,
    };
    mockAuthenticateApiKey.mockResolvedValueOnce({
      teamId: 'T123',
      bot: { token: 'bot-token' },
    });

    (slack.users.lookupByEmail as jest.Mock).mockResolvedValueOnce({
      ok: true,
      user: { id: 'U123', team_id: 'T123', name: 'Test User' },
    });

    mockedRecognitionController.prototype.findWithPagination.mockResolvedValueOnce(
      mockKudosData,
    );

    await userHandler(
      mockReq as ParamsIncomingMessage,
      mockRes as http.ServerResponse,
    );

    expect(mockSendJsonResponse).toHaveBeenCalledWith(
      mockRes,
      200,
      mockKudosData,
    );
  });

  it('should return 500 when an error occurs', async () => {
    mockAuthenticateApiKey.mockRejectedValueOnce(new Error());

    await userHandler(
      mockReq as ParamsIncomingMessage,
      mockRes as http.ServerResponse,
    );

    expect(mockSendJsonResponse).toHaveBeenCalledWith(mockRes, 500, {
      message: 'Internal Server Error',
    });
  });
});
