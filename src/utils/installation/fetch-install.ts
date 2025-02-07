import { InstallationController } from '@/controllers/installation';
import { Installation } from '@slack/bolt';

const installationController = new InstallationController();

export const fetchInstallation = async (
  installQuery,
): Promise<Installation<'v1' | 'v2', boolean>> => {
  if (installQuery.isEnterpriseInstall && installQuery?.enterpriseId) {
    return (await installationController.find(
      installQuery.enterpriseId,
    )) as unknown as Installation<'v1' | 'v2', boolean>;
  }

  if (installQuery?.teamId) {
    const storedInstallation = await installationController.find(
      installQuery.teamId,
    );
    if (!storedInstallation) {
      throw new Error('Failed fetching installation');
    } else
      return storedInstallation as unknown as Installation<
        'v1' | 'v2',
        boolean
      >;
  }
  throw new Error('Failed fetching installation');
};
