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

export const InventoryController = {
  getAllInventory,
};
