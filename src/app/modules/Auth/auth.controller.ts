import { Request, Response } from "express";
import { apiResponse, catchAsync, httpStatus } from "../../../shared";
import { AuthService } from "./auth.server";
import config from "../../../config";
import { TAuthUser } from "../../interfaces";

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.loginUserFromDB(req.body);

  const { accessToken, refreshToken } = result;

  res.cookie("refreshToken", refreshToken, {
    secure: config.env === "production",
    httpOnly: true,
  });

  apiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged in successfully.",
    data: {
      accessToken,
    },
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  const result = await AuthService.refreshTokenFromCookies(refreshToken);

  apiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User token refresh successfully.",
    data: result,
  });
});

const changePassword = catchAsync(
  async (req: Request & { user?: TAuthUser }, res: Response) => {
    const result = await AuthService.changePasswordIntoDB(req.user, req.body);

    apiResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message:
        "Your password has been changed successfully. Please log in again to continue.",
      data: result,
    });
  }
);

const forgetPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.forgetPassword(req.body);

  apiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Your email verification link send.",
    data: result,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization || "";
  const result = await AuthService.resetPassword(token, req.body);

  apiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password reset successfully.",
    data: result,
  });
});

const changeEmail = catchAsync(
  async (req: Request & { user?: TAuthUser }, res: Response) => {
    const user = req.user;
    const { email } = req.body;

    const result = await AuthService.changeEmailIntoDB(
      user as TAuthUser,
      email
    );

    apiResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My email changed successfully.",
      data: result,
    });
  }
);

export const AuthController = {
  loginUser,
  refreshToken,
  changePassword,
  forgetPassword,
  resetPassword,
  changeEmail,
};
