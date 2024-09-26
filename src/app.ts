import { App, LogLevel } from '@slack/bolt';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { AppDataSource } from './data-source';
import registerListeners from './listeners';

dotenv.config();

const app = new App({
  //TODO: pegar do configjs
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  logLevel: LogLevel.DEBUG,
});

registerListeners(app);

/** Start Bolt App */
(async () => {
  try {
    //TODO: add docker
    //TODO: add docker for db
    await AppDataSource.initialize();
    await app.start(process.env.PORT || 3000);
    console.log('⚡️ Bolt app is running! ⚡️');
  } catch (error) {
    console.error('Unable to start App', error);
  }
})();
