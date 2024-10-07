import { LogLevel } from '@slack/bolt';

export type SlackConfig = {
  token: string;
  appToken: string;
  signingSecret: string;
  logLevel: LogLevel;
};
