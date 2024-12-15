import { Secret } from "jsonwebtoken";
import config from "../../../config";
import {
  comparePassword,
  hashedPassword,
  jwtSecure,
  sendEmail,
} from "../../../helpers";
import { httpStatus, prisma } from "../../../shared";
import ApiError from "../../errors/ApiError";
import { TLogin } from "./auth.interface";
import { UserRole } from "@prisma/client";
import { TAuthUser } from "../../interfaces";

const loginUserFromDB = async (payload: TLogin) => {
  const { phone, password } = payload;
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      phone: phone,
      status: "ACTIVE",
    },
  });

  if (!(await comparePassword(password, user.password))) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid email or password.");
  }

  let profileInfo;

  switch (user.role) {
    case UserRole.CUSTOMER:
      profileInfo = await prisma.customer.findUnique({
        where: { userId: user.id },
      });
      break;

    case UserRole.VENDOR:
      profileInfo = await prisma.vendor.findUnique({
        where: { userId: user.id },
      });
      break;

    case UserRole.SUPER_ADMIN:
      profileInfo = await prisma.admin.findUnique({
        where: { userId: user.id },
      });
      break;

    case UserRole.ADMIN:
      profileInfo = await prisma.admin.findUnique({
        where: { userId: user.id },
      });
      break;

    default:
      throw new ApiError(httpStatus.FORBIDDEN, "Forbidden.");
  }

  const jwtPayload = {
    id: user.id,
    fullName: profileInfo?.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    avatar: profileInfo?.avatar,
  };

  const accessToken = jwtSecure.generateToken(
    jwtPayload,
    config.jwt.access_secret as Secret,
    config.jwt.access_expires_in as string
  );

  const refreshToken = jwtSecure.generateToken(
    jwtPayload,
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
  };
};

const refreshTokenFromCookies = async (token: string) => {
  const decoded = jwtSecure.verifyToken(
    token,
    config.jwt.refresh_secret as Secret
  );

  if (!decoded) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Your are not authorized.");
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: decoded?.email,
      status: "ACTIVE",
    },
  });

  let profileInfo;

  switch (user.role) {
    case UserRole.CUSTOMER:
      profileInfo = await prisma.customer.findUnique({
        where: { userId: user.id },
      });
      break;

    case UserRole.VENDOR:
      profileInfo = await prisma.vendor.findUnique({
        where: { userId: user.id },
      });
      break;

    case UserRole.SUPER_ADMIN:
      profileInfo = await prisma.admin.findUnique({
        where: { userId: user.id },
      });
      break;

    case UserRole.ADMIN:
      profileInfo = await prisma.admin.findUnique({
        where: { userId: user.id },
      });
      break;

    default:
      throw new ApiError(httpStatus.FORBIDDEN, "Forbidden.");
  }

  const jwtPayload = {
    id: user.id,
    fullName: profileInfo?.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    avatar: profileInfo?.avatar,
  };

  const accessToken = jwtSecure.generateToken(
    jwtPayload,
    config.jwt.access_secret as Secret,
    config.jwt.access_expires_in as string
  );

  return { accessToken };
};

const changePasswordIntoDB = async (user: any, payload: any) => {
  const { oldPassword, newPassword } = payload;

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id: user.id,
    },
  });

  if (!(await comparePassword(oldPassword, userData.password))) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password incorrect.");
  }

  if (await comparePassword(newPassword, userData.password)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You cannot reuse your previous password. Please choose a new password."
    );
  }

  const updateNewPassword = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: await hashedPassword(newPassword),
      passwordChangedAt: new Date().toISOString(),
    },
  });

  if (!updateNewPassword) {
    throw new ApiError(httpStatus.NOT_MODIFIED, "Somethings went wrong.");
  }
};

const forgetPassword = async (payload: { email: string }) => {
  const { email } = payload;

  const userData = await prisma.user.findFirstOrThrow({
    where: {
      email,
      status: "ACTIVE",
    },
  });

  const resetPasswordToken = jwtSecure.generateToken(
    {
      email: userData.email,
      role: userData.role,
      type: "Forget_Password",
    },
    config.jwt.reset_password_secret as Secret,
    config.jwt.reset_password_expires_in as string
  );

  const resetPassLink = `${config.resetPassLink}?userId=${userData.id}&token=${resetPasswordToken}`;

  await sendEmail(
    email,
    "Your reset password link validate 5 minutes",
    `<div>
      <p>Dear User,</p>
        <p>Your Reset Password Link: </p>
        <a href=${resetPassLink}>
        <button>
          Reset Password
        </button>
      </a>
    </div>`
  );
};

const resetPassword = async (
  token: string,
  payload: { id: string; password: string; confirmPassword: string }
) => {
  if (payload.password !== payload.confirmPassword) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Passwords do not match. Please try again."
    );
  }

  await prisma.user.findFirstOrThrow({
    where: {
      id: payload.id,
      status: "ACTIVE",
    },
  });

  const isValidToken = jwtSecure.verifyToken(
    token,
    config.jwt.reset_password_secret as Secret
  );

  console.log(isValidToken);

  if (!isValidToken) {
    throw new ApiError(httpStatus.FORBIDDEN, "Forbidden.");
  }

  await prisma.user.update({
    where: {
      id: payload.id,
      status: "ACTIVE",
    },
    data: {
      password: await hashedPassword(payload.password),
      passwordChangedAt: new Date().toISOString(),
    },
  });

  return {
    message: "Password reset successfully. Please login...",
  };
};

const changeEmailIntoDB = async (user: TAuthUser, email: string) => {
  await prisma.user.findUniqueOrThrow({ where: { id: user?.id } });

  const isEmailExist = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (isEmailExist) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `${email} already exist into database.`
    );
  }

  return await prisma.user.update({
    where: { id: user?.id },
    data: { email },
  });
};

export const AuthService = {
  loginUserFromDB,
  refreshTokenFromCookies,
  changePasswordIntoDB,
  forgetPassword,
  resetPassword,
  changeEmailIntoDB,
};
