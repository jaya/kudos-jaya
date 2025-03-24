import { Giphy } from '@/clients/giphy/giphy';
import { InstallationController } from '@/controllers';
import { handleGetAnotherGif, openKudosView } from '../give-kudos';

jest.mock('@/controllers/installation');

describe('openKudosView', () => {
  const installControllerMocked = jest
    .spyOn(InstallationController.prototype, 'find')
    .mockResolvedValueOnce({
      companyValues: 'Love your day, Connect yourself with the impact',
    });
  const mockedGifUrl = 'https://test-url.gif.com';
  const giphyMocked = jest
    .spyOn(Giphy.prototype, 'fetchGif')
    .mockResolvedValueOnce(mockedGifUrl);
  const client = {
    views: {
      open: jest.fn(),
      update: jest.fn(),
    },
  };

  const params = {
    client,
    body: {
      trigger_id: 'trigger_id_123',
      team_id: 'TEAM123',
    },
    context: {
      botToken: 'bot_token_abc',
    },
  };

  it('should call client.views.open with the correct payload', async () => {
    await openKudosView(params);

    expect(client.views.open).toHaveBeenCalledTimes(1);
    expect(client.views.open).toHaveBeenCalledWith({
      token: params.context.botToken,
      trigger_id: params.body.trigger_id,
      view: expect.any(Object),
    });
    expect(giphyMocked).toHaveBeenCalled();
    expect(client.views.open.mock.calls[0][0].view).toMatchSnapshot();
    expect(installControllerMocked).toHaveBeenCalledWith(params.body.team_id);
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
        ...params,
        body: updateGifBody,
        ack: mockAck,
      });

      expect(giphyMocked).toHaveBeenCalled();
    });
  });
});
