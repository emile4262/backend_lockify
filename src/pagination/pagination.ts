class PageMeta {
  readonly page: number;
  readonly limit: number;
  readonly itemCount: number;
  readonly pageCount: number;
  readonly hasPreviousPage: boolean;
  readonly hasNextPage: boolean;

  constructor(page: number, limit: number, itemCount: number) {
    this.page = parseInt(String(page), 10);
    this.limit = parseInt(String(limit), 10);
    this.itemCount = itemCount;
    this.pageCount = Math.ceil(this.itemCount / this.limit);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}

export class PaginationService<T> {
  static Paginate(): PaginationService<any> | PromiseLike<PaginationService<any>> {
    throw new Error('Method not implemented.');
  }
  readonly result: T[];
  readonly meta: PageMeta;
  constructor(result: T[], page: number, limit: number, itemCount: number) {
    this.result = result;
    this.meta = new PageMeta(page, limit, itemCount);
  }
}



