import { CancelKudosService } from '../services/cancel-kudos.service';
import { RecognitionController } from '@/controllers';
import { RequestContext } from '@/context';

jest.mock('@/controllers');
jest.mock('@/utils/logger');
jest.mock('@/context');

describe('CancelKudosService', () => {
  let service: CancelKudosService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockRecognitionController: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRecognitionController = {
      find: jest.fn(),
      delete: jest.fn(),
    };

    (RecognitionController as jest.Mock).mockImplementation(
      () => mockRecognitionController,
    );

    (RequestContext.get as jest.Mock).mockReturnValue({
      teamId: 'team123',
    });

    service = new CancelKudosService();
  });

  describe('getUserKudos', () => {
    it('should fetch user kudos with slack message id', async () => {
      const mockKudos = [
        {
          id: 1,
          fromId: 'user1',
          toId: 'user2',
          slackMessageId: 'msg123',
          slackChannelId: 'ch123',
        },
        {
          id: 2,
          fromId: 'user1',
          toId: 'user3',
          slackMessageId: 'msg456',
          slackChannelId: 'ch456',
        },
      ];

      mockRecognitionController.find.mockResolvedValue(mockKudos);

      const result = await service.getUserKudos('user1');

      expect(result).toEqual(mockKudos);
      expect(mockRecognitionController.find).toHaveBeenCalledWith({
        teamId: 'team123',
        params: expect.objectContaining({
          fromId: 'user1',
        }),
      });
    });

    it('should return empty array when no kudos found', async () => {
      mockRecognitionController.find.mockResolvedValue([]);

      const result = await service.getUserKudos('user1');

      expect(result).toEqual([]);
    });

    it('should return empty array on error', async () => {
      mockRecognitionController.find.mockRejectedValue(new Error('DB error'));

      const result = await service.getUserKudos('user1');

      expect(result).toEqual([]);
    });
  });

  describe('deleteKudos', () => {
    it('should delete kudos successfully', async () => {
      mockRecognitionController.delete.mockResolvedValue(undefined);

      const result = await service.deleteKudos('msg123', 'ch123');

      expect(result).toBe(true);
      expect(mockRecognitionController.delete).toHaveBeenCalledWith({
        teamId: 'team123',
        params: { slackChannelId: 'ch123', slackMessageId: 'msg123' },
      });
    });

    it('should return false on error', async () => {
      mockRecognitionController.delete.mockRejectedValue(
        new Error('Delete error'),
      );

      const result = await service.deleteKudos('msg123', 'ch123');

      expect(result).toBe(false);
    });
  });
});
