import { RedeemController } from '@/controllers/redeem';
import logger from '@/utils/logger';
import generateGiftCardCallback from '../generate-card';

jest.mock('@/controllers/redeem');
const mockAck = jest.fn();
const mockPostMessage = jest.fn();

const mockClient = {
  chat: {
    postMessage: mockPostMessage,
  },
};

describe('generateGiftCardCallback', () => {
  const body = {
    user: {
      id: 'U12345',
    },
    view: {
      private_metadata: 'CARD123',
    },
  };

  const view = {
    state: {
      values: {
        card_amount_block: {
          card_amount_value: {
            value: '100',
          },
        },
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call RedeemController with correct parameters', async () => {
    const mockEmitGiftCard = jest.fn().mockResolvedValue({
      message: 'Gift card generated successfully',
      url: 'https://giftcard.url',
    });

    (RedeemController as jest.Mock).mockImplementation(() => ({
      emitGiftCard: mockEmitGiftCard,
    }));

    await generateGiftCardCallback({
      ack: mockAck,
      view,
      client: mockClient,
      body,
    });

    expect(mockEmitGiftCard).toHaveBeenCalledWith({
      userId: 'U12345',
      cardId: 'CARD123',
      amount: 100,
    });
  });

  it('should send the message with the text and button link to gift card', async () => {
    const mockEmitGiftCard = jest.fn().mockResolvedValue({
      message: 'Click the button below to access your gift card',
      url: 'https://giftcard.url',
    });

    (RedeemController as jest.Mock).mockImplementation(() => ({
      emitGiftCard: mockEmitGiftCard,
    }));

    await generateGiftCardCallback({
      ack: mockAck,
      view,
      client: mockClient,
      body,
    });

    expect(mockPostMessage).toHaveBeenCalledWith({
      text: 'Click the button below to access your gift card',
      channel: 'U12345',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'Click the button below to access your gift card',
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Gift Card',
              },
              url: 'https://giftcard.url',
            },
          ],
        },
      ],
    });
  });

  it('should send the fail message when redeem controller not able to generate card', async () => {
    const mockEmitGiftCard = jest.fn().mockResolvedValue({
      message: 'We had a problem generating your card :cry:',
      url: undefined,
    });

    (RedeemController as jest.Mock).mockImplementation(() => ({
      emitGiftCard: mockEmitGiftCard,
    }));

    await generateGiftCardCallback({
      ack: mockAck,
      view,
      client: mockClient,
      body,
    });

    expect(mockPostMessage).toHaveBeenCalledWith({
      text: 'We had a problem generating your card :cry:',
      channel: 'U12345',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'We had a problem generating your card :cry:',
          },
        },
        undefined,
      ],
    });
  });

  it('should log errors if any exception is thrown', async () => {
    const mockConsoleError = jest.spyOn(logger, 'error').mockImplementation();
    const mockEmitGiftCard = jest
      .fn()
      .mockRejectedValue(new Error('Gift card error'));

    (RedeemController as jest.Mock).mockImplementation(() => ({
      emitGiftCard: mockEmitGiftCard,
    }));

    await generateGiftCardCallback({
      ack: mockAck,
      view,
      client: mockClient,
      body,
    });
    const error = new Error('Gift card error');
    expect(mockConsoleError).toHaveBeenCalledWith(
      'generateGiftCardCallback()',
      { error },
    );
  });
});
