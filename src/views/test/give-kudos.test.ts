import { openKudosView } from '../give-kudos';

describe('openKudosView', () => {
  it('should call client.views.open with the correct payload', async () => {
    const client = {
      views: {
        open: jest.fn(),
      },
    };

    const params = {
      client,
      body: {
        trigger_id: 'trigger_id_123',
      },
      context: {
        botToken: 'bot_token_abc',
      },
    };

    await openKudosView(params);

    expect(client.views.open).toHaveBeenCalledTimes(1);
    expect(client.views.open).toHaveBeenCalledWith({
      token: params.context.botToken,
      trigger_id: params.body.trigger_id,
      view: expect.any(Object),
    });

    expect(client.views.open.mock.calls[0][0].view).toMatchSnapshot();
  });
});
