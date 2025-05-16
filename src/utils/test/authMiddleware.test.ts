import { InstallationController } from '@/controllers';
import { authenticateApiKey, generateApiKey } from '../authMiddleware';

const mockKeys = {
  apiKey: '402acf082535a729a97af9f7d61de8db08fe0ec5349724e84f19a08a31045aea',
  hashedApiKey:
    '0c0f08a63704e08f0ac5173fdfe4a4ea391fce70996323187397c275d531c4a8',
};

const mockInstallation = {
  teamId: 'T123',
  teamName: 'TESTE TEAM',
  bot: {
    id: 'B07NLU71KPU',
    token: 'xoxb-7754361364871-7754405040567',
    scopes: [
      'channels:history',
      'chat:write',
      'chat:write.public',
      'users:read',
      'team:read',
      'commands',
      'files:write',
      'channels:manage',
      'groups:write',
      'im:write',
      'mpim:write',
      'users:read.email',
    ],
    userId: 'U07N6BX16GP',
  },
};

describe('authMiddleware', () => {
  describe('generateApiKey', () => {
    it('Should generate an apiKey', () => {
      const key = generateApiKey();
      expect(key).toEqual(
        expect.objectContaining({
          apiKey: expect.any(String),
          hashedApiKey: expect.any(String),
        }),
      );
    });
  });

  describe('authenticateApiKey', () => {
    it('Should return the installation related to a token', async () => {
      jest
        .spyOn(InstallationController.prototype, 'findMany')
        .mockResolvedValue([mockInstallation]);
      const auth = await authenticateApiKey({
        headers: { 'x-api-key': mockKeys.hashedApiKey },
      });
      expect(auth).toEqual(mockInstallation);
    });

    it('Should return null when is an invalid token', async () => {
      jest
        .spyOn(InstallationController.prototype, 'findMany')
        .mockResolvedValue([]);
      const auth = await authenticateApiKey({
        headers: { 'x-api-key': 'invalid-api-token' },
      });
      expect(auth).toEqual(null);
    });

    it('Should return null when no token is sent', async () => {
      const auth = await authenticateApiKey({
        headers: {},
      });
      expect(auth).toBeNull();
    });
  });
});
