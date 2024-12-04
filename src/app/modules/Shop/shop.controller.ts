import { Request, Response } from "express";
import { apiResponse, catchAsync, httpStatus } from "../../../shared";
import { ShopService } from "./shop.service";

const getAllShop = catchAsync(async (req: Request, res: Response) => {
  const result = await ShopService.getAllShopFromDB(req.query);

  apiResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "All shops retrieved successfully.",
    meta: result.meta,
    data: result.data,
  });
});

export const ShopController = {
  getAllShop,
};
