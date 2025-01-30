import './utils/module-alias';
//module alias must be on top
import { fetchInstallation, storeInstallation } from '@/utils/installation';
import logger from '@/utils/logger';
import { App } from '@slack/bolt';
import axios from 'axios';
import config from 'config';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import manifest from '../manifest.json';
import { AppDataSource } from './data-source';
import registerListeners from './listeners';
import { SlackConfig } from './types';
import { customRoutes } from './utils/custom-routes';
dotenv.config();

const slackConfig = config.get<SlackConfig>('app.slackConfig');
const scopes = [...manifest.oauth_config.scopes.bot];

const app = new App({
  signingSecret: slackConfig.signingSecret,
  clientId: slackConfig.clientId,
  clientSecret: slackConfig.clientSecret,
  stateSecret: slackConfig.stateSecret,
  scopes,
  installerOptions: {
    stateVerification: false,
  },
  installationStore: {
    storeInstallation,
    fetchInstallation,
  },
  customRoutes: customRoutes,
});

registerListeners(app);

/** Start Bolt App */
(async () => {
  try {
    await AppDataSource.initialize();
    await app.start(config.get<number>('app.port'));
    logger.info('⚡️ Bolt app is running! ⚡️');

    const res = await axios.get('https://curlmyip.org');
    logger.info('The app public IP is: ' + res.data);
  } catch (error) {
    logger.error('Unable to start App', error);
  }
})();
//TODO: atualizar deps
