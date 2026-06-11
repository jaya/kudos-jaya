export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  limit?: number;
  offset?: number;
}

export interface FilterQuery {
  search?: string;
  filter?: Record<string, unknown>;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

export interface ApiRequest extends PaginationQuery, FilterQuery {
  correlationId?: string;
}
