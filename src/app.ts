import './utils/module-alias';
import { App } from '@slack/bolt';
import config from 'config';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { AppDataSource } from './data-source';
import registerListeners from './listeners';
import { SlackConfig } from './types';


dotenv.config();

const slackConfig = config.get<SlackConfig>('app.slackConfig');

const app = new App(slackConfig);

registerListeners(app);

/** Start Bolt App */
(async () => {
  try {
    await AppDataSource.initialize();
    await app.start(config.get<number>('app.port'));
    console.log('⚡️ Bolt app is running! ⚡️');
  } catch (error) {
    console.error('Unable to start App', error);
  }
})();
