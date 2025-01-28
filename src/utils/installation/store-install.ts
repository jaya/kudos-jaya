import { InstallationController } from '@/controllers/installation';
import { isUserAdmin } from '@/utils/user-slack-info';
import { sendFinishInstallMessage } from './send-finish-install';
import { sendNotAdminMessage } from './send-not-admin';

const installationController = new InstallationController();

export const storeInstallation = async (installation): Promise<void> => {
  const userId = installation?.user?.id;
  const botToken = installation?.bot?.token;

  if (!botToken) {
    return;
  }

  const isAdmin = await isUserAdmin(botToken, userId);

  if (!isAdmin) {
    await sendNotAdminMessage(botToken, userId);
    return;
  }

  if (installation?.team?.id) {
    await installationController.create(installation);
    await sendFinishInstallMessage(botToken, userId);
  }
};
