import { Request, Response } from "express";
import { apiResponse, catchAsync, httpStatus } from "../../../shared";
import { OrderService } from "./order.service";

const getAllOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getAllOrderFromDB(req.query);

  apiResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "All orders retrieved successfully.",
    meta: result.meta,
    data: result.data,
  });
});

export const OrderController = {
  getAllOrder,
};
