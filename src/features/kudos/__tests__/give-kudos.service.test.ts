import { GiveKudosService } from '../services/give-kudos.service';
import { InstallationController, RecognitionController } from '@/controllers';
import { Giphy } from '@/clients/giphy/giphy';

jest.mock('@/controllers');
jest.mock('@/clients/giphy/giphy');

describe('GiveKudosService', () => {
  let service: GiveKudosService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockInstallationController: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockRecognitionController: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockGiphy: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockInstallationController = {
      find: jest.fn(),
    };

    mockRecognitionController = {
      getMonthlyKudosGivenCount: jest.fn(),
      save: jest.fn(),
    };

    mockGiphy = {
      fetchGif: jest.fn(),
    };

    (InstallationController as jest.Mock).mockImplementation(
      () => mockInstallationController,
    );
    (RecognitionController as jest.Mock).mockImplementation(
      () => mockRecognitionController,
    );
    (Giphy as jest.Mock).mockImplementation(() => mockGiphy);

    service = new GiveKudosService();
  });

  describe('validateMonthlyLimit', () => {
    it('should allow giving kudos when no monthly limit is set', async () => {
      mockInstallationController.find.mockResolvedValue({
        monthlyKudosLimit: null,
      });

      const result = await service.validateMonthlyLimit('team123', 'user1');

      expect(result.canGive).toBe(true);
      expect(result.remaining).toBeUndefined();
    });

    it('should allow giving kudos when limit is not reached', async () => {
      mockInstallationController.find.mockResolvedValue({
        monthlyKudosLimit: 10,
      });
      mockRecognitionController.getMonthlyKudosGivenCount.mockResolvedValue(5);

      const result = await service.validateMonthlyLimit('team123', 'user1');

      expect(result.canGive).toBe(true);
      expect(result.remaining).toBe(5);
    });

    it('should prevent giving kudos when limit is reached', async () => {
      mockInstallationController.find.mockResolvedValue({
        monthlyKudosLimit: 5,
      });
      mockRecognitionController.getMonthlyKudosGivenCount.mockResolvedValue(5);

      const result = await service.validateMonthlyLimit('team123', 'user1');

      expect(result.canGive).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.message).toContain('reached your monthly kudos limit');
    });
  });

  describe('createRecognitions', () => {
    it('should create recognitions for all users', async () => {
      mockRecognitionController.save.mockResolvedValue({
        id: 'rec1',
        ok: true,
      });

      const results = await service.createRecognitions({
        fromId: 'user1',
        toIds: ['user2', 'user3'],
        message: 'Great work!',
        teamId: 'team123',
        botToken: 'token',
      });

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      expect(mockRecognitionController.save).toHaveBeenCalledTimes(2);
    });

    it('should handle recognition creation failures', async () => {
      mockRecognitionController.save
        .mockResolvedValueOnce({ id: 'rec1', ok: true })
        .mockRejectedValueOnce(new Error('Save failed'));

      const results = await service.createRecognitions({
        fromId: 'user1',
        toIds: ['user2', 'user3'],
        message: 'Great work!',
        teamId: 'team123',
        botToken: 'token',
      });

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
    });
  });

  describe('fetchGif', () => {
    it('should fetch a gif from Giphy', async () => {
      mockGiphy.fetchGif.mockResolvedValue('https://example.com/gif.gif');

      const gif = await service.fetchGif();

      expect(gif).toBe('https://example.com/gif.gif');
      expect(mockGiphy.fetchGif).toHaveBeenCalled();
    });

    it('should handle gif fetch errors', async () => {
      const error = new Error('Giphy API error');
      mockGiphy.fetchGif.mockRejectedValue(error);

      await expect(service.fetchGif()).rejects.toThrow('Giphy API error');
    });
  });

  describe('getCompanyValues', () => {
    it('should fetch company values from installation', async () => {
      mockInstallationController.find.mockResolvedValue({
        companyValues: 'Innovation, Teamwork, Excellence',
      });

      const values = await service.getCompanyValues('team123');

      expect(values).toBe('Innovation, Teamwork, Excellence');
    });

    it('should return undefined on error', async () => {
      mockInstallationController.find.mockRejectedValue(new Error('Not found'));

      const values = await service.getCompanyValues('team123');

      expect(values).toBeUndefined();
    });
  });

  describe('getDefaultRecognitionChannel', () => {
    it('should fetch default channel from installation', async () => {
      mockInstallationController.find.mockResolvedValue({
        defaultRecognitionChannel: 'C12345',
      });

      const channel = await service.getDefaultRecognitionChannel('team123');

      expect(channel).toBe('C12345');
    });

    it('should return undefined on error', async () => {
      mockInstallationController.find.mockRejectedValue(new Error('Not found'));

      const channel = await service.getDefaultRecognitionChannel('team123');

      expect(channel).toBeUndefined();
    });
  });
});
