import logger from '@/utils/logger';
import { AppError } from './AppError';

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  correlationId?: string;
  context?: Record<string, unknown>;
}

export class ErrorHandler {
  static handle(error: unknown, correlationId?: string): ErrorResponse {
    const appError = this.normalize(error);

    if (AppError.isAppError(error)) {
      logger.warn({
        correlationId,
        error: error.code,
        message: error.message,
        context: error.context,
      });
    } else {
      logger.error({
        correlationId,
        error: appError.code,
        message: appError.message,
        originalError: error instanceof Error ? error.message : String(error),
      });
    }

    return {
      success: false,
      error: appError.code,
      message: appError.message,
      correlationId,
      context: AppError.isAppError(error) ? error.context : undefined,
    };
  }

  private static normalize(error: unknown): AppError {
    if (AppError.isAppError(error)) return error;
    if (error instanceof Error) {
      return new AppError('INTERNAL_ERROR', error.message, 500, {}, error);
    }
    return new AppError(
      'INTERNAL_ERROR',
      'Unknown error occurred',
      500,
      {},
      error,
    );
  }
}
