import { Request, Response } from "express";
import { apiResponse, catchAsync, httpStatus } from "../../../shared";
import { InventoryService } from "./inventory.service";

const getAllInventory = catchAsync(async (req: Request, res: Response) => {
  const result = await InventoryService.getAllInventoryFromDB(req.query);

  apiResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "All Inventories retrieved successfully.",
    meta: result.meta,
    data: result.data,
  });
});

const updateQuantity = catchAsync(async (req: Request, res: Response) => {
  const result = await InventoryService.updateQuantityIntoDB(
    req.params.id,
    req.body
  );

  apiResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: `Inventory quantity updated successfully by ${req.body.quantity}.`,
    data: result,
  });
});

export const InventoryController = {
  getAllInventory,
  updateQuantity,
};
