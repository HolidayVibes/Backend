import {
  PaginationMeta,
  PaginationPayload,
  PaginationResponse,
} from '../interfaces/pagination/pagination.interface';

export function paginate<T>(
  items: T[],
  payload: PaginationPayload,
): PaginationResponse<T> {
  const { per_page = 10, page = 1 } = payload;

  const paginatedItems = items.slice((page - 1) * per_page, page * per_page);
  const total_pages = Math.ceil(items.length / per_page);

  const meta: PaginationMeta = {
    per_page,
    page,
    total_pages,
    total_items: items.length,
    has_next: page < total_pages,
    has_prev: page > 1,
  };

  return {
    data: paginatedItems,
    meta,
  };
}
