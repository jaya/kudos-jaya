import generateCardViewHandler from '../../../handlers/slack/generate-card-view';
import { RedeemGiftCardService } from '../../../services/redeem-gift-card.service';

jest.mock('../../../services/redeem-gift-card.service');
jest.mock('@/utils/logger');

describe('generateCardViewHandler', () => {
  let mockAck: jest.Mock;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockClient: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockBody: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockService: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAck = jest.fn().mockResolvedValue(undefined);
    mockClient = {
      chat: {
        postMessage: jest.fn(),
      },
    };
    mockBody = {
      user: {
        id: 'user1',
        team_id: 'team1',
      },
      view: {
        private_metadata: 'card1',
        state: {
          values: {
            card_amount_block: {
              card_amount_value: {
                value: '100',
              },
            },
          },
        },
      },
    };

    mockService = {
      emitGiftCard: jest.fn(),
      getAuditors: jest.fn(),
      getProductInfo: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    (RedeemGiftCardService as jest.Mock).mockImplementation(() => mockService);
  });

  it('should emit gift card successfully', async () => {
    mockService.emitGiftCard.mockResolvedValue({
      success: true,
      url: 'https://example.com/card',
      message: 'Card generated',
    });
    mockService.getAuditors.mockResolvedValue([]);

    await generateCardViewHandler({
      ack: mockAck,
      client: mockClient,
      body: mockBody,
      view: mockBody.view,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(mockAck).toHaveBeenCalled();
    expect(mockService.emitGiftCard).toHaveBeenCalledWith({
      userId: 'user1',
      cardId: 'card1',
      amount: 100,
      teamId: 'team1',
    });
    expect(mockClient.chat.postMessage).toHaveBeenCalled();
  });

  it('should handle insufficient balance error', async () => {
    mockService.emitGiftCard.mockResolvedValue({
      success: false,
      message: 'Insufficient balance',
    });

    await generateCardViewHandler({
      ack: mockAck,
      client: mockClient,
      body: mockBody,
      view: mockBody.view,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(mockAck).toHaveBeenCalled();
    expect(mockClient.chat.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'Insufficient balance',
      }),
    );
  });

  it('should notify auditors on successful redemption', async () => {
    mockService.emitGiftCard.mockResolvedValue({
      success: true,
      url: 'https://example.com/card',
      message: 'Card generated',
    });
    mockService.getAuditors.mockResolvedValue([
      { id: 'auditor1' },
      { id: 'auditor2' },
    ]);
    mockService.getProductInfo.mockResolvedValue({ name: 'Amazon' });

    await generateCardViewHandler({
      ack: mockAck,
      client: mockClient,
      body: mockBody,
      view: mockBody.view,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(mockClient.chat.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: 'auditor1',
        text: '<@user1> redeemed R$100 in Amazon.',
      }),
    );
    expect(mockClient.chat.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: 'auditor2',
        text: '<@user1> redeemed R$100 in Amazon.',
      }),
    );
  });
});
