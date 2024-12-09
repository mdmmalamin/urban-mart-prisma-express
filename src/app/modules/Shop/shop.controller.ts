import { Request, Response } from "express";
import { apiResponse, catchAsync, httpStatus } from "../../../shared";
import { ShopService } from "./shop.service";
import { TAuthUser } from "../../interfaces";

const getAllShop = catchAsync(async (req: Request, res: Response) => {
  const result = await ShopService.getAllShopFromDB(req.query);

  apiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All shops retrieved successfully.",
    meta: result.meta,
    data: result.data,
  });
});

const getShop = catchAsync(async (req: Request, res: Response) => {
  const result = await ShopService.getShopFromDB(req.params.id);

  apiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `${result.name.toLocaleUpperCase()} shop data retrieved successfully.`,
    data: result,
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

const getMyShop = catchAsync(
  async (req: Request & { user?: TAuthUser }, res: Response) => {
    const result = await ShopService.getMyShopFormDB(req.user as TAuthUser);

    apiResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `My '${result.shop?.name}' shop retrieved successfully.`,
      data: result,
    });
  }
);

const changeShopStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await ShopService.changeShopStatusIntoDB(
    req.params.id,
    req.body
  );

  apiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `'${result.name}' shop status changed successfully.`,
    data: result,
  });
});

export const ShopController = {
  getAllShop,
  getShop,
  createShop,

  getMyShop,
  changeShopStatus,
};
