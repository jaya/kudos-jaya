import { Giphy } from '@/clients/giphy/giphy';
import { InstallationController } from '@/controllers';
import { RecognitionController } from '@/controllers/recognition';
import { handleGetAnotherGif, openKudosView } from '../give-kudos';

jest.mock('@/controllers/installation');
jest.mock('@/controllers/recognition');

describe('openKudosView', () => {
  const mockedGifUrl = 'https://test-url.gif.com';
  const baseParams = {
    body: {
      trigger_id: 'trigger_id_123',
      team_id: 'TEAM123',
      user_id: 'U12345',
    },
    context: {
      botToken: 'bot_token_abc',
    },
  };
  let client: {
    views: { open: jest.Mock; update: jest.Mock };
    chat: { postMessage: jest.Mock };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    client = {
      views: { open: jest.fn(), update: jest.fn() },
      chat: { postMessage: jest.fn() },
    };
    jest.spyOn(Giphy.prototype, 'fetchGif').mockResolvedValue(mockedGifUrl);
  });

  it('should call client.views.open with the correct payload', async () => {
    jest.spyOn(InstallationController.prototype, 'find').mockResolvedValueOnce({
      companyValues: 'Love your day, Connect yourself with the impact',
    });

    await openKudosView({ ...baseParams, client });

    expect(client.views.open).toHaveBeenCalledTimes(1);
    expect(client.views.open).toHaveBeenCalledWith({
      token: baseParams.context.botToken,
      trigger_id: baseParams.body.trigger_id,
      view: expect.any(Object),
    });
    expect(client.views.open.mock.calls[0][0].view).toMatchSnapshot();
    expect(InstallationController.prototype.find).toHaveBeenCalledWith(
      baseParams.body.team_id,
    );
  });

  describe('when monthlyKudosLimit is set', () => {
    it('should send a DM and not open the modal when the limit is reached', async () => {
      jest
        .spyOn(InstallationController.prototype, 'find')
        .mockResolvedValueOnce({ monthlyKudosLimit: 5 });
      jest
        .spyOn(RecognitionController.prototype, 'getMonthlyKudosGivenCount')
        .mockResolvedValueOnce(5);

      await openKudosView({ ...baseParams, client });

      expect(client.views.open).not.toHaveBeenCalled();
      expect(client.chat.postMessage).toHaveBeenCalledWith({
        channel: baseParams.body.user_id,
        text: 'You have reached your monthly kudos limit of 5. You can give more kudos next month! :pray:',
      });
    });

    it('should open the modal with max_selected_items set to the remaining budget', async () => {
      jest
        .spyOn(InstallationController.prototype, 'find')
        .mockResolvedValueOnce({ monthlyKudosLimit: 5 });
      jest
        .spyOn(RecognitionController.prototype, 'getMonthlyKudosGivenCount')
        .mockResolvedValueOnce(3);

      await openKudosView({ ...baseParams, client });

      expect(client.views.open).toHaveBeenCalledTimes(1);
      expect(client.chat.postMessage).not.toHaveBeenCalled();
      const view = client.views.open.mock.calls[0][0].view;
      const toIdBlock = view.blocks.find((b) => b.block_id === 'to_id_block');
      expect(toIdBlock.element.max_selected_items).toBe(2);
    });
  });

  describe('When clicking the button to get another gif', () => {
    it('Should update the view with a new gif', async () => {
      const mockAck = jest.fn();
      const updateGifBody = {
        view: {
          id: 'id1234',
          blocks: [{ block_id: 'gif_block' }, { block_id: 'other_block_id' }],
        },
      };

      await handleGetAnotherGif({
        ...baseParams,
        client,
        body: updateGifBody,
        ack: mockAck,
      });

      expect(Giphy.prototype.fetchGif).toHaveBeenCalled();
    });
  });
});
