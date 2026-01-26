export interface PaginationResponse<T> {
  data: T[];
  meta: paginationMeta;
}

export interface paginationMeta {
  per_page: number;
  page: number;
  total_pages: number;
  total_items?: number;
  has_next?: boolean;
  has_prev?: boolean;
}

export interface PaginationPayload<T> {
  options?: paginationOptions<T>;
  per_page?: number;
  page?: number;
}

export interface paginationOptions<T> {
  where?: Record<string, any>;
  orderBy?: Record<string, 'asc' | 'desc'>;
  select?: Partial<Record<keyof T, boolean>>;
}
