import { User } from '@/entity/user';
import { AppDataSource } from '../../data-source';

export async function saveUserWorkspaceInstall(installation) {
  const repository = AppDataSource.getRepository(User);
  const existUser = await repository.findOneBy({
    id: installation.enterprise.id,
  });

  if (!existUser) {
    await repository.save({
      id: installation.enterprise.id,
      team: { id: installation.team.id, name: installation.team.name },
      // enterprise id is null on workspace install
      enterprise: { id: 'null', name: 'null' },
      // user scopes + token is null on workspace install
      user: { token: 'null', scopes: ['null'], id: installation.user.id },
      tokenType: installation.tokenType,
      isEnterpriseInstall: installation.isEnterpriseInstall,
      appId: installation.appId,
      authVersion: installation.authVersion,
      bot: {
        scopes: installation.bot.scopes,
        token: installation.bot.token,
        userId: installation.bot.userId,
        id: installation.bot.id,
      },
    });
  }
}
