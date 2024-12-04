import { Request, Response } from "express";
import { apiResponse, catchAsync, httpStatus } from "../../../shared";
import { UserService } from "./user.service";
import { TAuthUser } from "../../interfaces";

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

const getAllUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUserFromDB(req.query);

  apiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All users retrieved successfully.",
    meta: result.meta,
    data: result.data,
  });
});

const changeUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.changeUserStatusIntoDB(id, req.body);

  apiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User status changed successfully.",
    data: result,
  });
});

const getMyProfile = catchAsync(
  async (req: Request & { user?: TAuthUser }, res: Response) => {
    const user = req.user;

    const result = await UserService.getMyProfileFromDB(user as TAuthUser);

    apiResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My profile data retrieved successfully.",
      data: result,
    });
  }
);

export const UserController = {
  createAdmin,
  createVendor,
  createCustomer,

  getAllUser,
  changeUserStatus,
  getMyProfile,
};
