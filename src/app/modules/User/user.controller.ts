import { Request, Response } from "express";
import { apiResponse, catchAsync, httpStatus } from "../../../shared";
import { UserService } from "./user.service";

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const file = req.file;
  const data = req.body;
  const result = await UserService.createAdminIntoDB(file, data);

  apiResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Administrator account has been created successfully.",
    data: result,
  });
});

const createVendor = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createVendorIntoDB(req.body);

  apiResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Your vendor account has been created successfully.",
    data: result,
  });
});

const createCustomer = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createCustomerIntoDB(req.body);

  apiResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Your account has been created successfully.",
    data: result,
  });
});

export const UserController = {
  createAdmin,
  createVendor,
  createCustomer,
};
