import { User } from '@/entity/user';
import { AppDataSource } from '../../data-source';

export async function saveUserOrgInstall(installation) {
  const repository = AppDataSource.getRepository(User);
  const existUser = await repository.findOneBy({
    id: installation.enterprise.id,
  });

  if (!existUser) {
    await repository.save({
      id: installation.enterprise.id,
      team: {},
      enterprise: {
        id: installation.enterprise.id,
        name: installation.enterprise.name,
      },
      user: {
        token: installation.user.token,
        scopes: installation.user.scopes,
        id: installation.user.id,
      },
      tokenType: installation.tokenType,
      isEnterpriseInstall: installation.isEnterpriseInstall,
      appId: installation.appId,
      authVersion: installation.authVersion,
      bot: {},
    });
  }
}
