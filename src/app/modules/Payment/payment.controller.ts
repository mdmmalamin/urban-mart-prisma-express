import { Request, Response } from "express";
import { apiResponse, catchAsync, httpStatus } from "../../../shared";
import { PaymentService } from "./payment.service";

const getAllPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getAllPaymentFromDB(req.query);

  apiResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "All payments retrieved successfully.",
    meta: result.meta,
    data: result.data,
  });
});

export const PaymentController = {
  getAllPayment,
};
