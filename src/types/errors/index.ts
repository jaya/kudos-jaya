export interface DomainError {
  code: string;
  message: string;
  statusCode: number;
  context?: Record<string, unknown>;
  cause?: unknown;
}

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'CONFLICT'
  | 'INTERNAL_ERROR';

export type HttpStatus = 400 | 401 | 403 | 404 | 409 | 500;
