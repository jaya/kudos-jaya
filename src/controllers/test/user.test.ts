import { AppDataSource } from '@/data-source';
import { UserController } from '../';
import { botToken, storedUser, teamId, userIds } from './samples/user';

jest.mock('@/data-source');
jest.mock('@/utils/user-slack-info', () => ({
  getSlackUserInfo: jest.fn(),
}));

describe('UserController()', () => {
  let userController: UserController;
  let mockUserRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRepository = {
      findOneBy: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      find: jest.fn(),
    };
    (AppDataSource.getRepository as jest.Mock).mockReturnValue(
      mockUserRepository,
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

  describe('setAuditors()', () => {
    it('Should save the auditors if not exist and update if exist', async () => {
      mockUserRepository.update.mockResolvedValueOnce();

      await userController.setAuditors({ botToken, teamId, userIds });
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('findMany()', () => {
    describe('When no parameters are passed', () => {
      it('Should return all the users from the team', async () => {
        mockUserRepository.find.mockResolvedValueOnce([storedUser, storedUser]);
        const user = await userController.findMany({
          teamId: 'T12345',
        });
        expect(user).toEqual([storedUser, storedUser]);
      });
    });
  });
});
