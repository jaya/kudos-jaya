import { App } from '@slack/bolt';
import giveKudosCommandCallback from '../give-kudos';
import giveKudosCommandModule from '../index';

jest.mock('@slack/bolt', () => ({
  App: jest.fn(() => ({
    command: jest.fn(),
  })),
}));

jest.mock('../give-kudos', () => jest.fn());

describe('giveKudosCommandModule.register', () => {
  let mockApp: App;

  beforeEach(() => {
    mockApp = new App();
    jest.clearAllMocks();
  });

  it('should register the /give-kudos command with the correct callback', () => {
    giveKudosCommandModule.register(mockApp);

    expect(mockApp.command).toHaveBeenCalledWith(
      '/give-kudos',
      giveKudosCommandCallback,
    );
  });
});
