import { App } from '@slack/bolt';
import giveKudosCommandModule from '../index';

jest.mock('@slack/bolt', () => ({
  App: jest.fn(() => ({
    command: jest.fn(),
  })),
}));

jest.mock('@/features/kudos/handlers', () => ({
  giveKudosCommandHandler: jest.fn(),
}));

jest.mock('@/features/cancel-kudos/handlers', () => ({
  cancelKudosCommandHandler: jest.fn(),
}));

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
      expect.any(Function),
    );
  });

  it('should register the /cancel-kudos command with the correct callback', () => {
    giveKudosCommandModule.register(mockApp);

    expect(mockApp.command).toHaveBeenCalledWith(
      '/cancel-kudos',
      expect.any(Function),
    );
  });
});
