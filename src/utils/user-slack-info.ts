import { WebClient } from '@slack/web-api';
import config from 'config';
import logger from './logger';

const slackConfig = config.get<string>('app.slackConfig.token');

export async function getSlackUserInfo(userId: string) {
  try {
    const client = new WebClient(slackConfig);
    const response = await client.users.info({ user: userId });

    return response?.user?.profile?.real_name;
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
