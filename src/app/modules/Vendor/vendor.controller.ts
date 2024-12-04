import { Request, Response } from "express";
import { apiResponse, catchAsync, httpStatus } from "../../../shared";
import { VendorService } from "./vendor.service";

const getAllVendor = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorService.getAllVendorFromDB(req.query);

  apiResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "All vendors retrieved successfully.",
    meta: result.meta,
    data: result.data,
  });
});

export const VendorController = {
  getAllVendor,
};
