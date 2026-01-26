import { PaginationPayload } from '../interfaces/pagination/pagination.interface';

export class PaginationUtil<T> {
  constructor(
    private readonly items: T[],
    private readonly per_page: number = 12,
  ) {
    this.totalPages = Math.ceil(items.length / per_page);
  }

  private perPage: number = this.per_page;
  public currentPage: number = 1;
  public totalPages: number;

  public getPagination(payload: PaginationPayload<T>) {
    return this.paginate(payload);
  }

  public resetPagination() {
    this.currentPage = 1;
  }

  public setItems(items: T[]) {
    this.items.length = 0;
    this.items.push(...items);
    this.totalPages = Math.ceil(this.items.length / this.perPage);
  }

  public setPerPage(count: number) {
    this.perPage = count;
    this.totalPages = Math.ceil(this.items.length / this.perPage);
  }

  private paginate(payload: PaginationPayload<T>) {
    const { per_page = 12, page = 1 } = payload;

    if (per_page !== this.perPage) {
      this.setPerPage(per_page);
    }

    this.currentPage = page;

    const items = this.getItems();

    return {
      data: items,
      meta: {
        per_page,
        page,
        total_pages: this.totalPages,
      },
    };
  }

  private getItems() {
    return this.items.slice(
      (this.currentPage - 1) * this.perPage,
      this.currentPage * this.perPage,
    );
  }
}
