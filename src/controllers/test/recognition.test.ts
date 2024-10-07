import { RecognitionController } from '@/controllers/recognition';
import { WalletController } from '@/controllers/wallet';
import { AppDataSource } from '@/data-source';
import { getSlackUserInfo } from '@/utils/user-slack-info';
import { WebClient } from '@slack/web-api';
import config from 'config';

jest.mock('@/utils/user-slack-info', () => ({
  getSlackUserInfo: jest.fn(),
}));

jest.mock('@/controllers/wallet', () => ({
  WalletController: jest.fn().mockImplementation(() => ({
    deposit: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock('config');
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
  let mockRepository: any;
  let mockWalletController: any;
  let mockSlackClient: WebClient;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
    };

    jest.spyOn(AppDataSource, 'getRepository').mockReturnValue(mockRepository);

    recognitionController = new RecognitionController();
    mockWalletController = new WalletController();
    mockSlackClient = new WebClient();
    (config.get as jest.Mock).mockReturnValue(100);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should save recognition and make a deposit', async () => {
      const fromId = 'user1';
      const toId = 'user2';

      (getSlackUserInfo as jest.Mock)
        .mockResolvedValueOnce('User One')
        .mockResolvedValueOnce('User Two');

      mockRepository.save.mockResolvedValueOnce({ id: 1 });

      const result = await recognitionController.save(
        fromId,
        toId,
        mockSlackClient
      );

      expect(getSlackUserInfo).toHaveBeenCalledWith(mockSlackClient, fromId);
      expect(getSlackUserInfo).toHaveBeenCalledWith(mockSlackClient, toId);
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          fromId: 'user1',
          fromName: 'User One',
          toId: 'user2',
          toName: 'User Two',
        })
      );
      expect(result).toEqual({ ok: true });
    });

    it('should return an error if recognition save fails', async () => {
      const fromId = 'user1';
      const toId = 'user2';

      (getSlackUserInfo as jest.Mock)
        .mockResolvedValueOnce('User One')
        .mockResolvedValueOnce('User Two');

      mockRepository.save.mockRejectedValueOnce(new Error('Save failed'));

      const result = await recognitionController.save(
        fromId,
        toId,
        mockSlackClient
      );

      expect(result).toEqual({ ok: false });
    });
  });

  describe('getTotal', () => {
    it('should return the total count of recognitions for a specific user', async () => {
      const userId = 'user1';

      mockRepository.count.mockResolvedValueOnce(5);

      const total = await recognitionController.getTotal(userId);

      expect(mockRepository.count).toHaveBeenCalledWith({
        where: { toId: userId },
      });
      expect(total).toBe(5);
    });

    it('should return 0 when the count returns null', async () => {
      const userId = 'user1';

      mockRepository.count.mockResolvedValueOnce(null);

      const total = await recognitionController.getTotal(userId);

      expect(mockRepository.count).toHaveBeenCalledWith({
        where: { toId: userId },
      });
      expect(total).toBe(0);
    });
  });

  describe('getUsersRecognitionSummary', () => {
    const mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
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

      const summary = await recognitionController.getUsersRecognitionSummary();

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

      const summary = await recognitionController.getUsersRecognitionSummary();

      expect(summary).toEqual([]);
    });
  });
});
