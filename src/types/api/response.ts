export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    correlationId?: string;
    context?: Record<string, unknown>;
  };
}

export interface PaginatedResponse<T> extends ApiResponse {
  data?: T[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ListResponse<T> {
  items: T[];
  count: number;
  total: number;
}
