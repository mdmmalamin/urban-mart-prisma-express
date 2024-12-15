import { Prisma } from "@prisma/client";
import { httpStatus, prisma } from "../../../shared";
import QueryBuilder from "../../builder/QueryBuilder";
import ApiError from "../../errors/ApiError";

const createCategoryIntoDB = async (name: string) => {
  const item = await prisma.category.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive", //? Case-insensitive comparison
      },
    },
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
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          products: {
            where: {
              status: "PUBLISHED", //? Filter for products with status = "PUBLISHED"
            },
          },
        },
      },
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

const updateCategoryIntoDB = async (id: string, payload: { name: string }) => {
  await prisma.category.findUniqueOrThrow({ where: { id } });

  return await prisma.category.update({
    where: { id },
    data: payload,
  });
};

const deleteCategoryIntoDB = async (id: string) => {
  await prisma.category.findUniqueOrThrow({
    where: { id },
  });

  const isProductsExist = await prisma.product.findMany({
    where: {
      categoryId: id,
    },
  });

  if (isProductsExist.length > 0) {
    throw new ApiError(
      httpStatus.CONFLICT,
      `There ${isProductsExist.length === 1 ? "is" : "are"} ${
        isProductsExist.length
      } product${
        isProductsExist.length === 1 ? "" : "s"
      } already under this category. Action cannot be completed.`
    );
  }

  return await prisma.category.delete({
    where: { id },
  });
};

export const CategoryService = {
  createCategoryIntoDB,
  getAllCategoryFromDB,
  updateCategoryIntoDB,
  deleteCategoryIntoDB,
};
