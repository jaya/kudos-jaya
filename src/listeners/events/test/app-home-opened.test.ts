import { TodoCartoes } from '@/clients/todo-cartoes/todo-cartoes';
import { InstallationController } from '@/controllers';
import logger from '@/utils/logger';
import { WebClient } from '@slack/web-api';
import appHomeOpenedCallback from '../app-home-opened';
import { getAdminPanelSection } from '../home/components/admin-panel';
import { getRecognitionListSection } from '../home/components/recognition-list';
import { getUserBalanceSection } from '../home/components/user-balance';
import {
  adminPanelSectionResponse,
  appHomeResponse,
  mockEvent,
  recognitionListSectionResponse,
  userBalanceSectionResponse,
} from './samples/app-home-opened';

jest.mock('@slack/web-api', () => {
  const mSlack = {
    views: {
      publish: jest.fn(),
    },
  };
  return { WebClient: jest.fn(() => mSlack) };
});
jest.mock('@/utils/encrypt', () => ({
  decrypt: jest.fn(),
}));
jest.mock('../home/components/admin-panel');
jest.mock('../home/components/user-balance');
jest.mock('../home/components/recognition-list');
jest.mock('@/utils/logger');

describe('appHomeOpenedCallback()', () => {
  let client: WebClient;
  beforeEach(() => {
    jest.clearAllMocks();
    client = new WebClient() as jest.Mocked<WebClient>;
  });

  describe('When the event is app_home_opened', () => {
    it('Should build the app home structure', async () => {
      jest.spyOn(InstallationController.prototype, 'find').mockResolvedValue({
        giftCardApiToken: 'mocked-decrypted-token',
      });
      jest
        .spyOn(TodoCartoes.prototype, 'fetchProducts')
        .mockResolvedValue(undefined);
      (getAdminPanelSection as jest.Mock).mockResolvedValue(
        adminPanelSectionResponse
      );
      (getUserBalanceSection as jest.Mock).mockResolvedValue(
        userBalanceSectionResponse
      );
      (getRecognitionListSection as jest.Mock).mockResolvedValue(
        recognitionListSectionResponse
      );

      await appHomeOpenedCallback({ client, event: mockEvent });
      expect(client.views.publish).toHaveBeenCalledWith(appHomeResponse);
    });
  });

  describe('When the event is not app_home_opened', () => {
    it('Should return undefined', async () => {
      const res = await appHomeOpenedCallback({ client, event: 'wrong_event' });
      expect(res).toBeUndefined();
    });
  });

  describe('When there is an error while trying to build the home structure', () => {
    it('Should log the error', async () => {
      const error = new Error();
      jest
        .spyOn(InstallationController.prototype, 'find')
        .mockRejectedValue(error);

      await appHomeOpenedCallback({ client, event: mockEvent });

      expect(logger.error).toHaveBeenCalledWith('appHomeOpenedCallback()', {
        error,
      });
    });
  });
});
