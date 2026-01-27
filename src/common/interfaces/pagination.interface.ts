export interface PaginationResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  per_page: number;
  page: number;
  total_pages: number;
  total_items?: number;
  has_next?: boolean;
  has_prev?: boolean;
}

export interface PaginationPayload {
  per_page?: number;
  page?: number;
}

export interface PaginationOptions {
  orderBy?: Record<string, 'asc' | 'desc'>;
}
