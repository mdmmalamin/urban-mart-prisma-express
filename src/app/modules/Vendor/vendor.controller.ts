import { Request, Response } from "express";
import { apiResponse, catchAsync, httpStatus } from "../../../shared";
import { VendorService } from "./vendor.service";
import { TAuthUser } from "../../interfaces";

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

const updateMyInfo = catchAsync(
  async (req: Request & { user?: TAuthUser }, res: Response) => {
    const result = await VendorService.updateMyInfoIntoDB(
      req.user as TAuthUser,
      req.body
    );

    apiResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "All vendors retrieved successfully.",
      data: result,
    });
  }
);

export const VendorController = {
  getAllVendor,
  updateMyInfo,
};
