import './utils/module-alias';
//module alias must be on top
import { sendFinishInstallMessage } from '@/utils/installation/installationWizard';
import { saveUserOrgInstall } from '@/utils/installation/userOrgInstall';
import { saveUserWorkspaceInstall } from '@/utils/installation/userWorkspaceInstall';
import { App, Installation } from '@slack/bolt';
import axios from 'axios';
import config from 'config';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import manifest from '../manifest.json';
import { TodoCartoes } from './clients/todo-cartoes/todo-cartoes';
import { UserController } from './controllers/user';
import { AppDataSource } from './data-source';
import registerListeners from './listeners';
import { SlackConfig } from './types';
import logger from './utils/logger';
dotenv.config();

const slackConfig = config.get<SlackConfig>('app.slackConfig');

const oauthRedirect = manifest.oauth_config.redirect_urls[0];
const botScopes = manifest.oauth_config.scopes.bot;
const userScopes = manifest.oauth_config.scopes.bot;

const workspaceInstallHtml = `<a href="https://slack.com/oauth/v2/authorize?client_id=${process.env.SLACK_CLIENT_ID}&scope=${botScopes}&redirect_uri=${oauthRedirect}" style="align-items:center;color:#000;background-color:#fff;border:1px solid #ddd;border-radius:4px;display:inline-flex;font-family:Lato, sans-serif;font-size:16px;font-weight:600;height:48px;justify-content:center;text-decoration:none;width:236px"><svg xmlns="http://www.w3.org/2000/svg" style="height:20px;width:20px;margin-right:12px" viewBox="0 0 122.8 122.8"><path d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zm6.5 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z" fill="#e01e5a"></path><path d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zm0 6.5c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z" fill="#36c5f0"></path><path d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zm-6.5 0c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z" fill="#2eb67d"></path><path d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zm0-6.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z" fill="#ecb22e"></path></svg>Add to Slack</a>`;
const userScopesInstallHtml = `<a href='https://slack.com/oauth/v2/authorize?client_id=${process.env.SLACK_CLIENT_ID}&scope=&user_scope=${userScopes}&redirect_uri=${oauthRedirect}' style='align-items:center;color:#fff;background-color:#4A154B;border:0;border-radius:4px;display:inline-flex;font-family:Lato,sans-serif;font-size:40px;font-weight:600;height:112px;justify-content:center;text-decoration:none;width:552px'><svg xmlns='http://www.w3.org/2000/svg' style='height:48px;width:48px;margin-right:12px' viewBox='0 0 122.8 122.8'><path d='M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zm6.5 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z' fill='#e01e5a'></path><path d='M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zm0 6.5c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z' fill='#36c5f0'></path><path d='M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zm-6.5 0c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z' fill='#2eb67d'></path><path d='M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zm0-6.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z' fill='#ecb22e'></path></svg>Add to Slack</a>`;

const userController = new UserController();

const customRoutes = [
  {
    path: '/slack/install/workspace',
    method: ['GET'],
    handler: (req, res) => {
      res.writeHead(200);
      res.end(workspaceInstallHtml);
    },
  },
  {
    path: '/slack/install/orgadmin',
    method: ['GET'],
    handler: (req, res) => {
      res.writeHead(200);
      res.end(userScopesInstallHtml);
    },
  },
];

const app = new App({
  signingSecret: slackConfig.signingSecret,
  clientId: slackConfig.clientId,
  clientSecret: slackConfig.clientSecret,
  stateSecret: slackConfig.stateSecret,
  scopes: manifest.oauth_config.scopes[0],
  installerOptions: {
    stateVerification: false,
  },
  installationStore: {
    storeInstallation: async (installation) => {
      if (installation.isEnterpriseInstall && installation.enterprise) {
        //TODO: Mudar de user para installation
        await saveUserOrgInstall(installation);
      } else if (installation.team) {
        await saveUserWorkspaceInstall(installation);
      }

      if (installation.bot?.token && installation.team?.id) {
        const client = app.client;
        await sendFinishInstallMessage(
          client,
          installation.bot.token,
          installation.user.id
        );
      }
    },
    fetchInstallation: async (installQuery) => {
      console.log('fetchInstallation');
      console.log(installQuery);
      if (
        installQuery.isEnterpriseInstall &&
        installQuery.enterpriseId !== undefined
      ) {
        return (await userController.findUser(
          installQuery.enterpriseId
        )) as Installation<'v1' | 'v2', boolean>;
      }
      if (installQuery.teamId !== undefined) {
        const storedInstallation = await userController.findUser(
          installQuery.teamId
        );
        if (!storedInstallation) {
          throw new Error('Failed fetching installation');
        } else return storedInstallation as Installation<'v1' | 'v2', boolean>;
      }
      throw new Error('Failed fetching installation');
    },
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
    await new TodoCartoes().fetchProducts();
  } catch (error) {
    logger.error('Unable to start App', error);
  }
})();
