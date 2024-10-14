import { LogLevel } from '@slack/bolt';

export type SlackConfig = {
  token: string;
  appToken: string;
  signingSecret: string;
  logLevel: LogLevel;
};

export type DbConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  name: string;
};
