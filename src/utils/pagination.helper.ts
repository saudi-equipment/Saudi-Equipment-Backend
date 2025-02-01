import {
  PaginationParams,
  PaginationResult,
} from 'src/interfaces/pagination/pagination.interface';

export function getPagination(params: PaginationParams): PaginationResult {
  const page = params.page && params.page > 0 ? params.page : 1;
  const limit =
    params.limit && params.limit > 0 ? Math.min(params.limit, 100) : 10;

  const skip = (page - 1) * limit;

  return { skip, limit };
}
