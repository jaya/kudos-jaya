export interface SlackConfig {
  signingSecret: string;
  clientId: string;
  clientSecret: string;
  stateSecret: string;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

export interface SlackUser {
  id: string;
  name: string;
  email?: string;
  isAdmin?: boolean;
  isActive?: boolean;
}

export interface SlackTeam {
  id: string;
  name: string;
  domain?: string;
}

export interface SlackMessage {
  text?: string;
  blocks?: unknown[];
  metadata?: Record<string, unknown>;
}
