import { InstallationController } from '@/controllers/installation';
import { storedInstallation } from '@/controllers/test/samples/installation';
import { Installation } from '@/entity';
import { fetchInstallation } from '../fetch-install';

jest.mock('@/controllers/installation');

describe('fetchInstallation', () => {
  describe('When the app is already installed', () => {
    describe('And is an enterprise installation', () => {
      it('Should return the proper installation', async () => {
        const mockInstallation: Partial<Installation> = {
          ...storedInstallation,
          isEnterpriseInstall: true,
          enterprise: { id: 'enterprise-123', name: 'enterprise name' },
          createdAt: new Date(),
        };

        const mockInstallController = jest
          .spyOn(InstallationController.prototype, 'find')
          .mockResolvedValueOnce(mockInstallation);

        const installQuery = {
          isEnterpriseInstall: true,
          enterpriseId: 'enterprise-123',
        };

        const result = await fetchInstallation(installQuery);

        expect(mockInstallController).toHaveBeenCalledWith('enterprise-123');
        expect(result).toEqual(mockInstallation);
      });
    });
    describe('And is a team installation', () => {
      describe('And the response is success', () => {
        it('Should return the proper installation', async () => {
          const mockInstallation: Partial<Installation> = {
            ...storedInstallation,
            isEnterpriseInstall: false,
            createdAt: new Date(),
          };

          const mockInstallController = jest
            .spyOn(InstallationController.prototype, 'find')
            .mockResolvedValueOnce(mockInstallation);

          const installQuery = {
            teamId: 'team-123',
          };

          const result = await fetchInstallation(installQuery);

          expect(mockInstallController).toHaveBeenCalledWith('team-123');
          expect(result).toEqual(mockInstallation);
        });
      });
      describe('And the installation is not stored', () => {
        it('Should throw the error', async () => {
          const mockInstallController = jest
            .spyOn(InstallationController.prototype, 'find')
            .mockResolvedValueOnce(undefined);

          const installQuery = {
            teamId: 'team-123',
          };

          await expect(fetchInstallation(installQuery)).rejects.toThrow(
            'Failed fetching installation'
          );
          expect(mockInstallController).toHaveBeenCalledWith('team-123');
        });
      });
    });
  });
  describe('When there is an error trying to fetch installation', () => {
    it('Should throw the error', async () => {
      await expect(fetchInstallation({})).rejects.toThrow(
        'Failed fetching installation'
      );
    });
  });
});
