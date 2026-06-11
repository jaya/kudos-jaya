import { LogLevel } from '@slack/bolt';

// Re-export organized types by domain
export type * from './domain';
export type * from './slack';
export type * from './api';
export type * from './errors';

// Legacy types for backwards compatibility during migration
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
