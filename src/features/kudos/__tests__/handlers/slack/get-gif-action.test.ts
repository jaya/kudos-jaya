import getGifActionHandler from '../../../handlers/slack/get-gif-action';
import { GiveKudosService } from '../../../services/give-kudos.service';
import { RequestContext } from '@/context/RequestContext';

jest.mock('../../../services/give-kudos.service');
jest.mock('@/utils/logger');
jest.mock('@/context/RequestContext');

describe('getGifActionHandler', () => {
  let mockAck: jest.Mock;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockAdapter: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockBody: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockService: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAck = jest.fn().mockResolvedValue(undefined);
    mockAdapter = {
      updateModal: jest.fn().mockResolvedValue(undefined),
    };
    mockBody = {
      view: {
        id: 'view123',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'Some text',
            },
          },
          {
            block_id: 'gif_block',
            type: 'image',
            image_url: 'https://example.com/old-gif.gif',
            alt_text: 'Old gif',
          },
        ],
      },
    };

    mockService = {
      fetchGif: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    (GiveKudosService as jest.Mock).mockImplementation(() => mockService);

    // Mock RequestContext.get() to return context with adapter
    (RequestContext.get as jest.Mock).mockReturnValue({
      adapter: mockAdapter,
    });

    // Mock RequestContext.runAsync to call the handler directly
    (RequestContext.runAsync as jest.Mock).mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context: any, fn: any) => fn(),
    );
  });

  it('should update modal with fetched gif', async () => {
    const gifUrl = 'https://example.com/new-gif.gif';
    mockService.fetchGif.mockResolvedValue(gifUrl);

    await getGifActionHandler({
      ack: mockAck,
      body: mockBody,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(mockAck).toHaveBeenCalled();
    expect(mockService.fetchGif).toHaveBeenCalled();
    expect(mockAdapter.updateModal).toHaveBeenCalledWith(
      expect.objectContaining({
        viewId: 'view123',
        view: expect.objectContaining({
          blocks: expect.arrayContaining([
            expect.objectContaining({
              imageUrl: gifUrl,
            }),
          ]),
        }),
      }),
    );
  });

  it('should handle errors gracefully', async () => {
    const error = new Error('Failed to fetch gif');
    mockService.fetchGif.mockRejectedValue(error);

    await getGifActionHandler({
      ack: mockAck,
      body: mockBody,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(mockAck).toHaveBeenCalled();
    expect(mockAdapter.updateModal).not.toHaveBeenCalled();
  });

  it('should throw error if adapter is not available', async () => {
    (RequestContext.get as jest.Mock).mockReturnValue({
      adapter: undefined,
    });

    await getGifActionHandler({
      ack: mockAck,
      body: mockBody,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(mockAck).toHaveBeenCalled();
    expect(mockAdapter.updateModal).not.toHaveBeenCalled();
  });
});
