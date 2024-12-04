import { Request, Response } from "express";
import { apiResponse, catchAsync, httpStatus } from "../../../shared";
import { DiscountService } from "./discount.service";

const getAllDiscount = catchAsync(async (req: Request, res: Response) => {
  const result = await DiscountService.getAllDiscountFromDB(req.query);

  apiResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "All Discounts retrieved successfully.",
    meta: result.meta,
    data: result.data,
  });
});

export const DiscountController = {
  getAllDiscount,
};
