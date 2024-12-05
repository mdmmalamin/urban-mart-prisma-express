import { Request, Response } from "express";
import { apiResponse, catchAsync, httpStatus } from "../../../shared";
import { ProductService } from "./product.service";
import { TAuthUser, TFile } from "../../interfaces";

const getAllProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getAllProductFromDB(req.query);

  apiResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "All products retrieved successfully.",
    meta: result.meta,
    data: result.data,
  });
});

const createProduct = catchAsync(
  async (req: Request & { user?: TAuthUser }, res: Response) => {
    const user = req.user;
    const files = req.files;
    const data = req.body;

    console.log(user, files, data);

    const result = await ProductService.createProductIntoDB(
      user as TAuthUser,
      files as TFile[],
      data
    );

    apiResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "New product created successfully.",
      data: result,
    });
  }
);

export const ProductController = {
  getAllProduct,
  createProduct,
};
