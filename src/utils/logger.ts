import config from 'config';
import pino, { Logger as PinoLogger } from 'pino';

enum LoggerSeverity {
  debug = 'debug',
  error = 'error',
  info = 'info',
  warn = 'warning',
}

export interface LogMeta {
  correlationId?: string;
  teamId?: string;
  userId?: string;
  [key: string]: unknown;
}

class Logger {
  private logger: PinoLogger;
  constructor(level: keyof typeof LoggerSeverity) {
    this.logger = pino({
      level,
      formatters: {
        level(label) {
          return { severity: LoggerSeverity[label], level: label };
        },
      },
    });
  }

  private parseMeta(
    messageOrMeta: string | LogMeta | undefined,
    meta?: LogMeta,
  ): { message: string; meta: LogMeta } {
    if (typeof messageOrMeta === 'string') {
      return { message: messageOrMeta, meta: meta || {} };
    }
    if (messageOrMeta && typeof messageOrMeta === 'object') {
      const message =
        typeof messageOrMeta.message === 'string' ? messageOrMeta.message : '';
      return { message, meta: messageOrMeta };
    }
    return { message: '', meta: {} };
  }

  public info(
    messageOrMeta: string | LogMeta | undefined,
    meta?: LogMeta,
  ): void {
    const { message, meta: parsedMeta } = this.parseMeta(messageOrMeta, meta);
    this.logger.info(parsedMeta, message);
  }

  public warn(
    messageOrMeta: string | LogMeta | undefined,
    meta?: LogMeta,
  ): void {
    const { message, meta: parsedMeta } = this.parseMeta(messageOrMeta, meta);
    this.logger.warn(parsedMeta, message);
  }

  public error(
    messageOrMeta: string | LogMeta | undefined,
    meta?: LogMeta,
  ): void {
    const { message, meta: parsedMeta } = this.parseMeta(messageOrMeta, meta);
    this.logger.error(parsedMeta, message);
  }

  public debug(
    messageOrMeta: string | LogMeta | undefined,
    meta?: LogMeta,
  ): void {
    const { message, meta: parsedMeta } = this.parseMeta(messageOrMeta, meta);
    this.logger.debug(parsedMeta, message);
  }
}

export default new Logger(
  config.get<keyof typeof LoggerSeverity>('app.slackConfig.logLevel'),
);
