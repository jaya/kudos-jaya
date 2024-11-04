import { RecognitionController } from '@/controllers/recognition';
import { matchVibe } from '@/utils/find-gif';
import logger from '@/utils/logger';
import giveKudosViewCallback from '../give-kudos';

jest.mock('@/controllers/recognition');
jest.mock('@/utils/find-gif');

const mockAck = jest.fn();
const mockPostMessage = jest.fn();

const mockClient = {
  chat: {
    postMessage: mockPostMessage,
  },
};

describe('giveKudosViewCallback', () => {
  const body = {
    user: {
      id: 'U12345',
    },
  };

  const view = {
    state: {
      values: {
        to_id_block: {
          to_id: {
            selected_user: 'U67890',
          },
        },
        kudo_channel_block: {
          kudo_channel: {
            selected_channel: 'C12345',
          },
        },
        kudo_message_block: {
          kudo_message: {
            value: 'Great job on the project!',
          },
        },
        kudo_vibe_block: {
          kudo_vibe: {
            value: 'celebration',
          },
        },
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send kudos to the correct channel and user', async () => {
    const mockGif = { URL: 'https://mock-gif-url.com' };
    (matchVibe as jest.Mock).mockReturnValue(mockGif);
    const mockSave = jest.fn().mockResolvedValue({ ok: true });

    (RecognitionController as jest.Mock).mockImplementation(() => ({
      save: mockSave,
    }));

    await giveKudosViewCallback({
      ack: mockAck,
      view,
      client: mockClient,
      body,
    });

    expect(mockPostMessage).toHaveBeenCalledWith({
      channel: '#wearejaya',
      text: `*<@U12345> is recognizing <@U67890>!* :party-jaya:\n> Great job on the project!\n<https://mock-gif-url.com>`,
    });

    expect(mockPostMessage).toHaveBeenCalledWith({
      channel: 'U67890',
      text: 'Hey <@U67890> Jaya is sending you a gift, check your balance! ',
    });
  });

  it('should handle errors from RecognitionController and notify the user', async () => {
    const mockGif = { URL: 'https://mock-gif-url.com' };
    (matchVibe as jest.Mock).mockReturnValue(mockGif);
    const mockSave = jest.fn().mockResolvedValue({ ok: false });

    (RecognitionController as jest.Mock).mockImplementation(() => ({
      save: mockSave,
    }));

    await giveKudosViewCallback({
      ack: mockAck,
      view,
      client: mockClient,
      body,
    });

    expect(mockPostMessage).toHaveBeenCalledWith({
      channel: 'U12345',
      text: 'An error occurred while giving <@U67890> a kudos :cry:',
    });
  });

  it('should log a non mapped error', async () => {
    const mockSave = jest.fn().mockRejectedValue(new Error());

    (RecognitionController as jest.Mock).mockImplementation(() => ({
      save: mockSave,
    }));
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

  it('should handle a missing kudo vibe by defaulting to "plants"', async () => {
    const modifiedView = {
      ...view,
      state: {
        values: {
          ...view.state.values,
          kudo_vibe_block: {
            kudo_vibe: {
              value: undefined,
            },
          },
        },
      },
    };

    const mockGif = { URL: 'https://mock-gif-url.com' };
    (matchVibe as jest.Mock).mockReturnValue(mockGif);

    await giveKudosViewCallback({
      ack: mockAck,
      view: modifiedView,
      client: mockClient,
      body,
    });

    expect(matchVibe).toHaveBeenCalledWith('plants');
  });
});
