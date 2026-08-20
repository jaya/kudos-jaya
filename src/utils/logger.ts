import config from 'config';
import pino, { Logger as PinoLogger } from 'pino';
import { RequestContext } from '@/context/RequestContext';

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
  error?: string;
  stack?: string;
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

  private enrichMetaWithContext(meta: LogMeta): LogMeta {
    try {
      const context = RequestContext.get();
      return {
        correlationId: meta.correlationId || context.correlationId,
        teamId: meta.teamId || context.teamId,
        userId: meta.userId || context.userId,
        ...meta,
      };
    } catch {
      // RequestContext not available, return meta as-is
      return meta;
    }
  }

  private parseMeta(
    messageOrMeta: string | LogMeta | undefined,
    meta?: LogMeta | Error,
  ): { message: string; meta: LogMeta } {
    if (typeof messageOrMeta === 'string') {
      const parsedMeta = this.normalizeError(meta) || {};
      return { message: messageOrMeta, meta: parsedMeta };
    }
    if (messageOrMeta && typeof messageOrMeta === 'object') {
      const message =
        typeof messageOrMeta.message === 'string' ? messageOrMeta.message : '';
      return { message, meta: messageOrMeta };
    }
    return { message: '', meta: {} };
  }

  private normalizeError(meta?: LogMeta | Error): LogMeta | undefined {
    if (!meta) return undefined;
    if (meta instanceof Error) {
      return {
        error: meta.message,
        stack: meta.stack,
      };
    }
    return meta as LogMeta;
  }

  public info(
    messageOrMeta: string | LogMeta | undefined,
    meta?: LogMeta,
  ): void {
    const { message, meta: parsedMeta } = this.parseMeta(messageOrMeta, meta);
    const enrichedMeta = this.enrichMetaWithContext(parsedMeta);
    this.logger.info(enrichedMeta, message);
  }

  public warn(
    messageOrMeta: string | LogMeta | undefined,
    meta?: LogMeta,
  ): void {
    const { message, meta: parsedMeta } = this.parseMeta(messageOrMeta, meta);
    const enrichedMeta = this.enrichMetaWithContext(parsedMeta);
    this.logger.warn(enrichedMeta, message);
  }

  public error(
    messageOrMeta: string | LogMeta | undefined,
    meta?: LogMeta | Error,
  ): void {
    const { message, meta: parsedMeta } = this.parseMeta(messageOrMeta, meta);
    const enrichedMeta = this.enrichMetaWithContext(parsedMeta);
    this.logger.error(enrichedMeta, message);
  }

  public debug(
    messageOrMeta: string | LogMeta | undefined,
    meta?: LogMeta,
  ): void {
    const { message, meta: parsedMeta } = this.parseMeta(messageOrMeta, meta);
    const enrichedMeta = this.enrichMetaWithContext(parsedMeta);
    this.logger.debug(enrichedMeta, message);
  }
}

export default new Logger(
  config.get<keyof typeof LoggerSeverity>('app.slackConfig.logLevel'),
);
