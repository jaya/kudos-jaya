import { AppDataSource } from '@/data-source';
import { User } from '@/entity/user';

export class UserController {
  private readonly userRepository = AppDataSource.getRepository(User);

  public async findUser(id: string): Promise<User> {
    return await this.userRepository.findOneBy({ id });
  }
}
