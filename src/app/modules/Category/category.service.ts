import { Prisma } from "@prisma/client";
import { httpStatus, prisma } from "../../../shared";
import QueryBuilder from "../../builder/QueryBuilder";
import ApiError from "../../errors/ApiError";

const createCategoryIntoDB = async (name: string) => {
  const item = await prisma.category.findUnique({
    where: { name },
  });

  if (item) {
    throw new ApiError(httpStatus.BAD_REQUEST, `${name} already created.`);
  }

  return prisma.category.create({
    data: { name },
  });
};

const getAllCategoryFromDB = async (query: Record<string, any>) => {
  const queryBuilder = new QueryBuilder<Prisma.CategoryWhereInput>(query)
    .addSearchCondition(["name"])
    .addFilterConditions()
    .setPagination()
    .setSorting();

  const whereConditions = queryBuilder.buildWhere();
  const pagination = queryBuilder.getPagination();
  const sorting = queryBuilder.getSorting();

  const result = await prisma.category.findMany({
    where: whereConditions,
    ...pagination,
    orderBy: sorting,
    include: {
      products: true,
    },
  });

  const total = await prisma.category.count({
    where: whereConditions,
  });

  return {
    meta: {
      page: queryBuilder.paginationOptions.page,
      limit: queryBuilder.paginationOptions.limit,
      total,
    },
    data: result,
  };
};

export const CategoryService = {
  createCategoryIntoDB,
  getAllCategoryFromDB,
};
