import { RecognitionController } from '@/controllers/recognition';
import { AppDataSource } from '@/data-source';
import { InstallationController } from '../installation';

jest.mock('@/utils/user-slack-info', () => ({
  getSlackUserInfo: jest.fn(),
}));

jest.mock('@/controllers/wallet', () => ({
  WalletController: jest.fn().mockImplementation(() => ({
    deposit: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock('@/controllers/installation');

jest.mock('@slack/web-api', () => ({
  ...jest.requireActual('@slack/web-api'),
  WebClient: jest.fn().mockImplementation(() => ({
    auth: {
      test: () => Promise.resolve({ ok: true }),
    },
    chat: {
      postMessage: () => Promise.resolve({ ok: false, error: 'invalid_auth' }),
    },
  })),
}));

describe('RecognitionController', () => {
  let recognitionController: RecognitionController;
  let mockRepository;

  const fromId = 'user1';
  const fromName = 'From Name';
  const toId = 'user2';
  const toName = 'To Name';
  const message = 'message test';
  const teamId = 'team123';

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
    };

    jest.spyOn(AppDataSource, 'getRepository').mockReturnValue(mockRepository);

    recognitionController = new RecognitionController();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should save recognition and make a deposit', async () => {
      mockRepository.save.mockResolvedValueOnce({ id: 1 });
      jest
        .spyOn(InstallationController.prototype, 'find')
        .mockResolvedValueOnce({ defaultAmount: 100 });

      const result = await recognitionController.save({
        fromId,
        fromName,
        toId,
        toName,
        message,
        teamId,
      });

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          fromId,
          fromName,
          toId,
          toName,
          message: 'message test',
        })
      );
      expect(result).toEqual({ ok: true });
    });

    it('should return an error if recognition save fails', async () => {
      const fromId = 'user1';
      const toId = 'user2';
      const message = 'message test';

      mockRepository.save.mockRejectedValueOnce(new Error('Save failed'));

      const result = await recognitionController.save({
        fromId,
        fromName,
        toId,
        toName,
        message,
        teamId,
      });

      expect(result).toEqual({ ok: false });
    });
  });

  describe('getTotal', () => {
    it('should return the total count of recognitions for a specific user', async () => {
      const userId = 'user1';

      mockRepository.count.mockResolvedValueOnce(5);

      const total = await recognitionController.getTotal({ teamId, userId });

      expect(mockRepository.count).toHaveBeenCalledWith({
        where: { toId: userId, teamId },
      });
      expect(total).toBe(5);
    });

    it('should return 0 when the count returns null', async () => {
      const userId = 'user1';

      mockRepository.count.mockResolvedValueOnce(null);

      const total = await recognitionController.getTotal({ teamId, userId });

      expect(mockRepository.count).toHaveBeenCalledWith({
        where: { toId: userId, teamId },
      });
      expect(total).toBe(0);
    });
  });

  describe('getUsersRecognitionSummary', () => {
    const mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    });

    it('should return a summary of user recognitions', async () => {
      const recognitionSummary = [
        { userId: 'user1', recognitionCount: 5 },
        { userId: 'user2', recognitionCount: 3 },
      ];

      mockQueryBuilder.getRawMany.mockResolvedValueOnce(recognitionSummary);

      const summary = await recognitionController.getUsersRecognitionSummary(
        teamId
      );

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith(
        'recognition'
      );
      expect(mockQueryBuilder.select).toHaveBeenCalledWith(
        'recognition.toId',
        'userId'
      );
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith(
        'COUNT(recognition.id)',
        'recognitionCount'
      );
      expect(mockQueryBuilder.groupBy).toHaveBeenCalledWith('recognition.toId');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'COUNT(recognition.id)',
        'DESC'
      );
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(20);

      expect(summary).toEqual(recognitionSummary);
    });

    it('should return an empty array if no recognitions are found', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValueOnce([]);

      const summary = await recognitionController.getUsersRecognitionSummary(
        teamId
      );

      expect(summary).toEqual([]);
    });
  });
});
