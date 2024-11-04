import config from 'config';
import pino, { Logger as PinoLogger } from 'pino';

enum LoggerSeverity {
  debug = 'debug',
  error = 'error',
  info = 'info',
  warn = 'warning',
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

  public info(message: string, meta = {}): void {
    this.logger.info(meta, message);
  }

  public warn(message: string, meta = {}): void {
    this.logger.warn(meta, message);
  }

  public error(message: string, meta = {}): void {
    this.logger.error(meta, message);
  }

  public debug(message: string, meta = {}): void {
    this.logger.debug(meta, message);
  }
}

export default new Logger(
  config.get<keyof typeof LoggerSeverity>('app.slackConfig.logLevel')
);
