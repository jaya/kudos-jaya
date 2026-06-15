import { LogLevel } from '@slack/bolt';

export type * from './api';
export type * from './domain';
export type * from './errors';
export type * from './slack';

export type SlackConfig = {
  signingSecret: string;
  clientId: string;
  clientSecret: string;
  stateSecret: string;
  token: string;
  appToken: string;
  logLevel: LogLevel;
};

export type DbConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  name: string;
};
