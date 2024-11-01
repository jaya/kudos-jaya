import './utils/module-alias';
//module alias must be on top
import { App } from '@slack/bolt';
import axios from 'axios';
import config from 'config';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { TodoCartoes } from './clients/todo-cartoes/todo-cartoes';
import { AppDataSource } from './data-source';
import registerListeners from './listeners';
import { SlackConfig } from './types';
import logger from './utils/logger';
dotenv.config();

const slackConfig = config.get<SlackConfig>('app.slackConfig');

const app = new App(slackConfig);

registerListeners(app);

/** Start Bolt App */
(async () => {
  try {
    await AppDataSource.initialize();
    await app.start(config.get<number>('app.port'));
    logger.info('⚡️ Bolt app is running! ⚡️');
    const res = await axios.get('https://curlmyip.org');
    logger.info('The app public IP is: ' + res.data);
    await new TodoCartoes().fetchProducts();
  } catch (error) {
    logger.error('Unable to start App', error);
  }
})();
