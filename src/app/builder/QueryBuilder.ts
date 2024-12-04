class QueryBuilder<TWhereInput> {
  private andConditions: TWhereInput[];
  public paginationOptions: { page: number; limit: number; skip: number };
  private sortOptions: { sortBy: string; sortOrder: "asc" | "desc" };

  constructor(private query: Record<string, any>) {
    this.andConditions = [];
    this.paginationOptions = { page: 1, limit: 10, skip: 0 };
    this.sortOptions = { sortBy: "createdAt", sortOrder: "desc" };
  }

  addSearchCondition(searchableFields: string[]): this {
    const searchTerm = this.query.searchTerm;
    if (searchTerm) {
      this.andConditions.push({
        OR: searchableFields.map((field) => ({
          [field]: { contains: searchTerm, mode: "insensitive" },
        })),
      } as TWhereInput);
    }
    return this;
  }

  addFilterConditions(): this {
    const queryObj = { ...this.query };
    const excludeFields = [
      "searchTerm",
      "sortBy",
      "sortOrder",
      "limit",
      "page",
      "fields",
    ];
    excludeFields.forEach((el) => delete queryObj[el]);

    if (Object.keys(queryObj).length > 0) {
      this.andConditions.push({
        AND: Object.keys(queryObj).map((key) => ({
          [key]: { equals: queryObj[key] },
        })),
      } as TWhereInput);
    }
    return this;
  }

  setPagination(): this {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    this.paginationOptions.page = page;
    this.paginationOptions.limit = limit;
    this.paginationOptions.skip = (page - 1) * limit;
    return this;
  }

  setSorting(): this {
    const sortBy = this.query.sortBy || "createdAt";
    const sortOrder: "asc" | "desc" =
      this.query.sortOrder === "asc" ? "asc" : "desc";
    this.sortOptions.sortBy = sortBy;
    this.sortOptions.sortOrder = sortOrder;

    console.log(this);
    return this;
  }

  buildWhere(): TWhereInput {
    return this.andConditions.length > 0
      ? ({ AND: this.andConditions } as TWhereInput)
      : ({} as TWhereInput);
  }

  getPagination(): { skip: number; take: number } {
    const { skip, limit } = this.paginationOptions;
    return { skip, take: limit };
  }

  getSorting(): Record<string, "asc" | "desc"> {
    const { sortBy, sortOrder } = this.sortOptions;

    return { [sortBy]: sortOrder };
  }
}

export default QueryBuilder;
