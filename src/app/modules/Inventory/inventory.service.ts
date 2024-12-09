import { Prisma, StockAction } from "@prisma/client";
import { httpStatus, prisma } from "../../../shared";
import QueryBuilder from "../../builder/QueryBuilder";
import ApiError from "../../errors/ApiError";
import { TAuthUser } from "../../interfaces";

const getAllInventoryFromDB = async (query: Record<string, any>) => {
  const queryInventories = new QueryBuilder<Prisma.InventoryWhereInput>(query)
    .addSearchCondition(["sku"])
    .addFilterConditions()
    .setPagination()
    .setSorting();

  const whereConditions = queryInventories.buildWhere();
  const pagination = queryInventories.getPagination();
  const sorting = queryInventories.getSorting();

  const result = await prisma.inventory.findMany({
    where: whereConditions,
    ...pagination,
    orderBy: sorting,
    include: {
      shop: true,
      histories: true,
      product: true,
    },
  });

  const total = await prisma.inventory.count({
    where: whereConditions,
  });

  return {
    meta: {
      page: queryInventories.paginationOptions.page,
      limit: queryInventories.paginationOptions.limit,
      total,
    },
    data: result,
  };
};

const updateQuantityIntoDB = async (
  id: string,
  payload: {
    actionType: "RESTOCK" | "ADJUSTMENT";
    quantity: number;
    note?: string;
  }
) => {
  const { actionType, quantity, note } = payload;

  const inventory = await prisma.inventory.findUnique({ where: { id } });
  if (!inventory) {
    throw new ApiError(httpStatus.NOT_FOUND, "Inventory not found.");
  }

  const result = await prisma.$transaction(async (txClient) => {
    switch (actionType) {
      case "RESTOCK":
        const restockQty = inventory.availableQuantity! + quantity;

        await txClient.inventory.update({
          where: { id },
          data: {
            availableQuantity: restockQty,
          },
        });

        return await txClient.history.create({
          data: {
            inventoryId: id,
            actionType: "RESTOCK",
            quantityChanged: quantity,
            newQuantity: restockQty,
            lastQuantity: inventory.availableQuantity!,
            note: note,
          },

          include: { inventory: true },
        });

      case "ADJUSTMENT":
        if (inventory.availableQuantity! < quantity) {
          throw new ApiError(
            httpStatus.NOT_FOUND,
            "Requested quantity exceeds the available stock."
          );
        }

        const adjustmentQty = inventory.availableQuantity! - quantity;

        await txClient.inventory.update({
          where: { id },
          data: {
            availableQuantity: adjustmentQty,
          },
        });

        return await txClient.history.create({
          data: {
            inventoryId: id,
            actionType: "ADJUSTMENT",
            quantityChanged: quantity,
            newQuantity: adjustmentQty,
            lastQuantity: inventory.availableQuantity!,
            note: note,
          },
          include: { inventory: true },
        });

      default:
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid stock action.");
    }
  });

  return result;
};

const getMyInventoriesFromDB = async (user: TAuthUser) => {
  const vendorData = await prisma.vendor.findUniqueOrThrow({
    where: { userId: user?.id },
  });

  const shopData = await prisma.shop.findUnique({
    where: { vendorId: vendorData?.id },
  });

  if (!shopData) {
    throw new ApiError(httpStatus.NOT_FOUND, "No shop created.");
  }

  const result = await prisma.inventory.findMany({
    where: { shopId: shopData.id },

    include: {
      product: true,
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "No inventory found.");
  }

  return result;
};

export const InventoryService = {
  getAllInventoryFromDB,
  updateQuantityIntoDB,

  getMyInventoriesFromDB,
};
