import { Customer, Prisma } from "@prisma/client";
import { prisma } from "../../../shared";
import QueryBuilder from "../../builder/QueryBuilder";
import { vendorSearchableFields } from "./vendor.constant";
import { TAuthUser } from "../../interfaces";

const getAllVendorFromDB = async (query: Record<string, any>) => {
  const queryBuilder = new QueryBuilder<Prisma.VendorWhereInput>(query)
    .addSearchCondition(vendorSearchableFields)
    .addFilterConditions()
    .setPagination()
    .setSorting();

  const whereConditions = queryBuilder.buildWhere();
  const pagination = queryBuilder.getPagination();
  const sorting = queryBuilder.getSorting();

  const result = await prisma.vendor.findMany({
    where: whereConditions,
    ...pagination,
    orderBy: sorting,
    include: {
      user: true,
      address: true,
      shop: true,
    },
  });

  const total = await prisma.vendor.count({
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

const updateMyInfoIntoDB = async (
  user: TAuthUser,
  payload: Partial<Customer>
) => {
  // console.log(payload);
  const customerData = await prisma.vendor.update({
    where: {
      userId: user?.id,
    },

    data: payload,
  });

  return customerData;
};

export const VendorService = {
  getAllVendorFromDB,

  updateMyInfoIntoDB,
};
