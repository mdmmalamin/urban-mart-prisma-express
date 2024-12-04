import { Request, Response } from "express";
import { apiResponse, catchAsync, httpStatus } from "../../../shared";
import { CustomerService } from "./customer.service";

const getAllCustomer = catchAsync(async (req: Request, res: Response) => {
  const result = await CustomerService.getAllCustomerFromDB(req.query);

  apiResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "All customers retrieved successfully.",
    meta: result.meta,
    data: result.data,
  });
});

export const CustomerController = {
  getAllCustomer,
};
