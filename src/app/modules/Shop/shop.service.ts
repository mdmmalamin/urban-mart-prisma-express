import { Prisma, ShopStatus } from "@prisma/client";
import { fileUploader } from "../../../helpers";
import { httpStatus, prisma } from "../../../shared";
import QueryBuilder from "../../builder/QueryBuilder";
import ApiError from "../../errors/ApiError";
import { TAuthUser, TFile } from "../../interfaces";

const getAllShopFromDB = async (query: Record<string, any>) => {
  const queryShops = new QueryBuilder<Prisma.ShopWhereInput>(query)
    .addSearchCondition(["name"])
    .addFilterConditions()
    .setPagination()
    .setSorting();

  const whereConditions = queryShops.buildWhere();
  const pagination = queryShops.getPagination();
  const sorting = queryShops.getSorting();

  const result = await prisma.shop.findMany({
    where: { ...whereConditions, status: "ACTIVE" },
    ...pagination,
    orderBy: sorting,
    include: {
      inventory: {
        include: {
          product: {
            include: {
              images: true,
            },
          },
        },
      },
    },
  });

  const total = await prisma.shop.count({
    where: whereConditions,
  });

  return {
    meta: {
      page: queryShops.paginationOptions.page,
      limit: queryShops.paginationOptions.limit,
      total,
    },
    data: result,
  };
};

const getShopFromDB = async (id: string) => {
  return await prisma.shop.findUniqueOrThrow({
    where: { id, status: "ACTIVE" },

    include: {
      inventory: {
        include: {
          product: true,
        },
      },
    },
  });
};

const createShopIntoDB = async (
  user: TAuthUser,
  file: TFile | undefined,
  payload: any
) => {
  const vendorData = await prisma.vendor.findUniqueOrThrow({
    where: { userId: user?.id, isDeleted: false },
  });

  const shopData = await prisma.shop.findUnique({
    where: {
      vendorId: vendorData.id,
    },
  });

  if (shopData) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "You already have a shop associated with your account."
    );
  }

  if (file) {
    const fileName = `${payload?.name}-${user?.phone}-logo`;
    const { secure_url } = await fileUploader.uploadToCloudinary(
      file,
      fileName,
      "shop"
    );

    payload.logo = secure_url;
  }

  const result = await prisma.shop.create({
    data: {
      vendorId: vendorData.id,
      ...payload,
    },
  });

  return result;
};

const getMyShopFormDB = async (user: TAuthUser) => {
  const vendorData = await prisma.vendor.findUniqueOrThrow({
    where: { userId: user?.id },
  });

  const result = await prisma.shop.findUnique({
    where: { vendorId: vendorData?.id },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "No shop created.");
  }

  return result;
};

const changeShopStatusIntoDB = async (
  id: string,
  payload: { status: ShopStatus }
) => {
  return await prisma.shop.update({
    where: { id },

    data: payload,
  });
};

export const ShopService = {
  getAllShopFromDB,
  createShopIntoDB,
  getShopFromDB,

  getMyShopFormDB,
  changeShopStatusIntoDB,
};
