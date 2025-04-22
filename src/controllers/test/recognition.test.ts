import { AppDataSource } from '@/data-source';
import { Recognition } from '@/entities';
import logger from '@/utils/logger';
import { In } from 'typeorm';
import {
  InstallationController,
  RecognitionController,
  UserController,
} from '../';

jest.mock('@/utils/user-slack-info', () => ({
  getSlackUserInfo: jest.fn(),
}));

jest.mock('@/controllers/wallet', () => ({
  WalletController: jest.fn().mockImplementation(() => ({
    deposit: jest.fn().mockResolvedValue(undefined),
    withdraw: jest.fn().mockResolvedValue(undefined),
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

jest.mock('@/utils/logger');

describe('RecognitionController', () => {
  let recognitionController: RecognitionController;
  let mockRepository;

  const teamId = 'team123';
  const mockFromUser = {
    id: 'U1234AD',
    name: 'User from',
    teamId,
  };

  const mockToUser = {
    id: 'U4321AD',
    name: 'User To',
    teamId,
  };

  const message = 'message test';
  const botToken = 'bot-token-1234';

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      count: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
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
      jest.spyOn(UserController.prototype, 'find').mockResolvedValue(undefined);
      jest
        .spyOn(UserController.prototype, 'create')
        .mockResolvedValueOnce(mockFromUser);
      jest
        .spyOn(UserController.prototype, 'create')
        .mockResolvedValueOnce(mockToUser);

      const result = await recognitionController.save({
        fromId: mockFromUser.id,
        toId: mockToUser.id,
        message,
        teamId,
        botToken,
      });

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          fromId: mockFromUser.id,
          fromName: mockFromUser.name,
          toId: mockToUser.id,
          toName: mockToUser.name,
          description: 'message test',
          teamId,
        }),
      );
      expect(result).toEqual({ ok: true, id: 1 });
    });

    it('should return an error if recognition save fails', async () => {
      const fromId = 'user1';
      const toId = 'user2';

      mockRepository.save.mockRejectedValueOnce(new Error('Save failed'));

      const result = await recognitionController.save({
        fromId,
        toId,
        message,
        teamId,
        botToken,
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

      const summary =
        await recognitionController.getUsersRecognitionSummary(teamId);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith(
        'recognition',
      );
      expect(mockQueryBuilder.select).toHaveBeenCalledWith(
        'recognition.toId',
        'userId',
      );
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith(
        'COUNT(recognition.id)',
        'recognitionCount',
      );
      expect(mockQueryBuilder.groupBy).toHaveBeenCalledWith('recognition.toId');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'COUNT(recognition.id)',
        'DESC',
      );
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(20);

      expect(summary).toEqual(recognitionSummary);
    });

    it('should return an empty array if no recognitions are found', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValueOnce([]);

      const summary =
        await recognitionController.getUsersRecognitionSummary(teamId);

      expect(summary).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update a recognition', async () => {
      const recognitionId = 1;
      const updatedMessage = 'Updated message';

      const updatedRecognition = {
        id: recognitionId,
        description: updatedMessage,
      };

      mockRepository.update.mockResolvedValueOnce(updatedRecognition);
      await recognitionController.update({
        teamId,
        id: [recognitionId],
        params: { description: updatedMessage },
      });

      expect(mockRepository.update).toHaveBeenCalledWith(
        { teamId, id: In([recognitionId]) },
        { description: updatedMessage },
      );
    });
  });

  describe('find', () => {
    it('should find a recognition by ID', async () => {
      const recognitionId = 1;
      const mockRecognition = { id: recognitionId, message };

      mockRepository.find.mockResolvedValueOnce(mockRecognition);

      const recognition = await recognitionController.find({
        teamId,
        params: { id: recognitionId },
      });

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { id: recognitionId, teamId },
      });
      expect(recognition).toEqual(mockRecognition);
    });
  });

  describe('delete', () => {
    const paramsToDelete = {
      slackChannelId: 'test-channel-id',
      slackMessageId: 'test-message-id',
    };
    it('should delete recognitions and withdraw from associated wallets', async () => {
      const defaultAmount = 10;
      const mockRecognitionsToDelete = [
        { id: 1, teamId, toId: 'user-1' },
        { id: 2, teamId, toId: 'user-2' },
      ] as Recognition[];

      mockRepository.find.mockResolvedValueOnce(mockRecognitionsToDelete);
      jest
        .spyOn(InstallationController.prototype, 'find')
        .mockResolvedValueOnce({ defaultAmount });

      mockRepository.delete.mockResolvedValueOnce({
        affected: mockRecognitionsToDelete.length,
      });

      await recognitionController.delete({ teamId, params: paramsToDelete });

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { teamId, ...paramsToDelete },
      });
      expect(mockRepository.delete).toHaveBeenCalledWith({
        teamId,
        ...paramsToDelete,
      });

      expect(mockRepository.delete).toHaveBeenCalledWith({
        teamId,
        ...paramsToDelete,
      });
    });

    it('should handle errors during deletion', async () => {
      const errorMessage = 'Database error during delete';

      mockRepository.find.mockRejectedValueOnce(new Error(errorMessage));

      await expect(
        recognitionController.delete({ teamId, params: paramsToDelete }),
      ).resolves.toBeUndefined();

      expect(logger.error).toHaveBeenCalledWith(
        'RecognitionController.delete()',
        {
          error: new Error(errorMessage),
        },
      );
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });
});
