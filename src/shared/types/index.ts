export type Nullable<T> = T | null;

export interface PaginationQuery {
  limit?: number;
  offset?: number;
}
