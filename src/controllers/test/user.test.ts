import { AppDataSource } from '@/data-source';
import UserController from '../user';
import { storedUser } from './samples/user';

jest.mock('@/data-source');

describe('UserController()', () => {
  let userController: UserController;
  let mockUserRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRepository = {
      findOneBy: jest.fn(),
      save: jest.fn(),
    };
    (AppDataSource.getRepository as jest.Mock).mockReturnValue(
      mockUserRepository
    );
    userController = new UserController();
  });
  describe('find()', () => {
    it('Should return the user from the parameters', async () => {
      mockUserRepository.findOneBy.mockResolvedValueOnce(storedUser);
      const user = await userController.find({
        userId: 'U12345',
        teamId: 'T12345',
      });
      expect(user).toEqual(storedUser);
    });
  });
});
