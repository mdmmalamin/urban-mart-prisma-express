import { TPaginationOptions } from "../app/interfaces";

type TPaginationOptionsResult = {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
};

export const paginationFormate = (
  options: TPaginationOptions
): TPaginationOptionsResult => {
  const page: number = Number(options.page) || 1;
  const limit: number = Number(options.limit) || 10;
  const skip: number = (Number(page) - 1) * limit;

  const sortBy: string = options.sortBy || "createdAt";
  const sortOrder: string = options.sortOrder || "desc";

  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
  };
};
