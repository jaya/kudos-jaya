import chooseCardButtonCallback from '../choose-card';

describe('chooseCardButtonCallback', () => {
  const ack = jest.fn();
  const client = {
    views: {
      update: jest.fn(),
    },
  };
  it('Should update the view with card params values sent inside the button', async () => {
    const cardId = '1234';
    const min = '10';
    const max = '199';
    const body = {
      actions: [{ value: cardId + ',' + min + ',' + max }],
      view: {
        id: 'view1234',
        hash: 'hash1234',
      },
    };

    await chooseCardButtonCallback({
      ack,
      client,
      body,
    });

    expect(client.views.update).toHaveBeenCalledWith(
      expect.objectContaining({
        view: expect.objectContaining({
          blocks: expect.arrayContaining([
            expect.objectContaining({
              element: expect.objectContaining({
                min_value: min,
                max_value: max,
              }),
            }),
          ]),
          private_metadata: cardId,
        }),
      })
    );
  });
  it('should handle errors and log them', async () => {
    console.error = jest.fn();
    await chooseCardButtonCallback({
      ack,
      client,
      body: {},
    });
    expect(console.error).toHaveBeenCalledWith(expect.any(TypeError));
    expect((console.error as jest.Mock).mock.calls[0][0].message).toBe(
      "Cannot read properties of undefined (reading '0')"
    );
  });
});
