import { Request, Response } from "express";
import { apiResponse, catchAsync, httpStatus } from "../../../shared";
import { ProductService } from "./product.service";

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

export const ProductController = {
  getAllProduct,
};
