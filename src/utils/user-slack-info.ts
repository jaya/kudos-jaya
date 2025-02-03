import { WebClient } from '@slack/web-api';

import logger from './logger';

export async function getSlackUserInfo(botToken: string, userId: string) {
  try {
    const client = new WebClient(botToken);
    const response = await client.users.info({ user: userId });

    return {
      name: response?.user?.profile?.real_name,
      email: response?.user?.profile?.email,
    };
  } catch (e) {
    logger.error('getSlackUserInfo()', { error: e });
    throw e;
  }
}

export async function isUserAdmin(
  botToken: string,
  userId: string
): Promise<boolean> {
  try {
    const client = new WebClient(botToken);

    const response = await client.users.info({ user: userId });

    if (response?.user && response.user.is_admin) {
      return true;
    }
    return false;
  } catch (e) {
    logger.error('isAdmin()', { error: e });
    throw e;
  }
}
