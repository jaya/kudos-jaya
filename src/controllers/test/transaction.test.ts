import { AppDataSource } from '@/data-source';
import { TransactionController } from '../transaction';
import { fetchPrizesReportResponse } from './samples/transaction';

describe('TransactionController()', () => {
  let transactionController: TransactionController;
  let mockRepository;
  const teamId = 'T1234';
  const start = new Date(new Date().setDate(1));
  const end = new Date(new Date().setDate(new Date().getDate() + 1));
  const mockSaveTransaction = {
    teamId,
    walletId: 1,
    amount: 100,
    productId: 'product123',
  };
  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getRawOne: jest.fn(),
  };

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnThis(),
    };

    jest.spyOn(AppDataSource, 'getRepository').mockReturnValue(mockRepository);
    transactionController = new TransactionController();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register()', () => {
    describe('success', () => {
      it('Should save a transaction', async () => {
        mockRepository.save.mockResolvedValueOnce(undefined);
        await transactionController.register(mockSaveTransaction);
        expect(mockRepository.save).toHaveBeenCalledWith(mockSaveTransaction);
      });
    });
    describe('error', () => {
      it('Should throw InternalError when save fails', async () => {
        const error = new Error('DB error');
        mockRepository.save.mockRejectedValueOnce(error);

        await expect(
          transactionController.register(mockSaveTransaction),
        ).rejects.toThrow();
      });
    });
  });
  describe('fetchPrizesReport()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    });
    describe('success', () => {
      it('Should return the prizes report data', async () => {
        mockQueryBuilder.getRawMany.mockResolvedValueOnce(
          fetchPrizesReportResponse,
        );
        const prizes = await transactionController.fetchPrizesReport({
          teamId,
          start,
          end,
        });
        expect(prizes).toEqual(fetchPrizesReportResponse);
      });
    });
  });
  describe('redeemed()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    });
    describe('with date parameters', () => {
      it('Should return the data between the date passed', async () => {
        mockQueryBuilder.getRawOne.mockResolvedValueOnce({ total: 200 });
        const result = await transactionController.redeemed({
          teamId,
          start,
          end,
        });
        expect(result).toBe(200);
      });
    });
    describe('without data for the supplied parameters', () => {
      it('Should return 0', async () => {
        mockQueryBuilder.getRawOne.mockResolvedValueOnce({ total: null });
        const result = await transactionController.redeemed({
          teamId,
          start,
          end,
        });
        expect(result).toBe(0);
      });
    });
  });
});
