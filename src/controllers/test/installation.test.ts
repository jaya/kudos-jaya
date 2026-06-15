import { AppDataSource } from '@/data-source';
import { InstallationController } from '../installation';
import {
  installationPayload,
  storedInstallation,
} from './samples/installation';

jest.mock('@/data-source');

describe('InstallationController', () => {
  let installController: InstallationController;
  let mockInstallRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    mockInstallRepository = {
      findOneBy: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      find: jest.fn(),
    };
    (AppDataSource.getRepository as jest.Mock).mockReturnValue(
      mockInstallRepository,
    );
    installController = new InstallationController();
  });
  describe('find()', () => {
    it('should return the installation of the given parameters', async () => {
      mockInstallRepository.findOneBy.mockResolvedValueOnce(storedInstallation);

      const res = await installController.find('T081PEJ3G9F');

      expect(res).toEqual(storedInstallation);
      expect(mockInstallRepository.findOneBy).toHaveBeenCalledWith({
        teamId: 'T081PEJ3G9F',
      });
    });
  });

  describe('findMany()', () => {
    it('should return the installation of the given parameters', async () => {
      mockInstallRepository.find.mockResolvedValueOnce([storedInstallation]);

      const res = await installController.findMany({
        params: { teamId: 'T081PEJ3G9F' },
      });

      expect(res).toEqual([storedInstallation]);
      expect(mockInstallRepository.find).toHaveBeenCalledWith({
        where: { teamId: 'T081PEJ3G9F' },
      });
    });
  });

  describe('create()', () => {
    it('should create an installation based on the given paylaod', async () => {
      mockInstallRepository.save.mockResolvedValueOnce(storedInstallation);
      const res = await installController.create(installationPayload);
      expect(res).toEqual(storedInstallation);
      expect(mockInstallRepository.save).toHaveBeenCalledWith(
        installationPayload,
      );
    });
  });
  describe('update()', () => {
    describe('when update is performed successfully', () => {
      it('should return the updated installation', async () => {
        mockInstallRepository.update.mockResolvedValueOnce(storedInstallation);
        mockInstallRepository.findOneBy.mockResolvedValueOnce({
          ...storedInstallation,
          giftCardApiToken: 'hashed-token',
        });

        const res = await installController.update({
          teamId: 'T081PEJ3G9F',
          giftCardApiToken: 'tokenabcde',
        });

        expect(res).toEqual({
          ...storedInstallation,
          giftCardApiToken: 'hashed-token',
        });
      });
    });
    describe('when there is an error trying to update', () => {
      it('should throw InternalError when update fails', async () => {
        const error = new Error('DB error');
        mockInstallRepository.update.mockRejectedValue(error);
        await expect(
          installController.update({ teamId: 'T12345' }),
        ).rejects.toThrow();
      });
    });
  });

  describe('getCurrentSettings()', () => {
    describe('When it is the first time setting up the app', () => {
      it('Should build the settings with default texts', async () => {
        mockInstallRepository.findOneBy.mockResolvedValueOnce({
          ...storedInstallation,
          giftCardApiToken: null,
          defaultRecognitionChannel: null,
        });
        const res = await installController.getCurrentSettings('T12345');
        expect(res).toEqual({
          alreadyInstalled: false,
          companyValuesHint: 'Separate by comma',
          defaultAmountHint: 'Ex: 100.',
          defaultChannelHint:
            'Enter the default Slack channel id (ex: C93LZNJ64, #bots).',
          giftCardApiTokenHint: 'Ex: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          monthlyKudosLimitHint:
            'Leave empty for unlimited. Ex: 5 (users can give at most 5 kudos per month).',
        });
      });
    });
    describe('When it is already installed', () => {
      it('Should build the settings with default texts and the current settings', async () => {
        mockInstallRepository.findOneBy.mockResolvedValueOnce(
          storedInstallation,
        );
        const res = await installController.getCurrentSettings('T12345');
        expect(res).toEqual({
          alreadyInstalled: true,
          defaultAmountHint: 'Ex: 100.\nCurrent: 100',
          defaultChannelHint:
            'Enter the default Slack channel id (ex: C93LZNJ64, #bots).\nCurrent: #bots',
          giftCardApiTokenHint:
            'Ex: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\nCurrent: testetoken...',
          companyValuesHint: 'Separate by comma\nCurrent: ',
          monthlyKudosLimitHint:
            'Leave empty for unlimited. Ex: 5 (users can give at most 5 kudos per month).\nCurrent: unlimited',
        });
      });
    });
  });
});
