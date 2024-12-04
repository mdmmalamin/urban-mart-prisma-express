import { Request, Response } from "express";
import { apiResponse, catchAsync, httpStatus } from "../../../shared";
import { CartService } from "./cart.service";

const getAllCart = catchAsync(async (req: Request, res: Response) => {
  const result = await CartService.getAllCartFromDB(req.query);

  apiResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "All carts retrieved successfully.",
    meta: result.meta,
    data: result.data,
  });
});

export const CartController = {
  getAllCart,
};
