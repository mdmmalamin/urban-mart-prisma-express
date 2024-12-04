import { Request, Response } from "express";
import { apiResponse, catchAsync, httpStatus } from "../../../shared";
import { ShopService } from "./shop.service";
import { TAuthUser } from "../../interfaces";

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

const createShop = catchAsync(
  async (req: Request & { user?: TAuthUser }, res: Response) => {
    const user = req.user;
    const file = req.file;
    const data = req.body;
    const result = await ShopService.createShopIntoDB(
      user as TAuthUser,
      file,
      data
    );

    apiResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Shop has been created successfully.",
      data: result,
    });
  }
);

export const ShopController = {
  getAllShop,
  createShop,
};
