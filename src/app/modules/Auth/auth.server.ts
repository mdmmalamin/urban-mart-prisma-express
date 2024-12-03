import { Secret } from "jsonwebtoken";
import config from "../../../config";
import { comparePassword, jwtSecure } from "../../../helpers";
import { httpStatus, prisma } from "../../../shared";
import ApiError from "../../errors/ApiError";
import { TLogin } from "./auth.interface";
import { UserRole } from "@prisma/client";

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

  const tokenPayload = {
    id: user.id,
    fullName: profileInfo?.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    avatar: profileInfo?.avatar,
  };

  const accessToken = jwtSecure.generateToken(
    tokenPayload,
    config.jwt.access_secret as Secret,
    config.jwt.access_expires_in as string
  );

  const refreshToken = jwtSecure.generateToken(
    tokenPayload,
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
  };
};

const refreshTokenFromCookies = async (token: string) => {
  let decoded;
  try {
    decoded = jwtHelper.verifyToken(token, config.jwt.refresh_secret as Secret);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Your are not authorized.");
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: decoded?.email,
      status: "ACTIVE",
    },
  });

  const tokenPayload = {
    email: user.email,
    phone: user.phone,
    role: user.role,
  };

  const accessToken = jwtHelper.generateToken(
    tokenPayload,
    config.jwt.access_secret as Secret,
    config.jwt.access_expires_in as string
  );

  return {
    accessToken,
    needPasswordChange: user.needPasswordChange,
  };
};

const changePasswordIntoDB = async (user: any, payload: any) => {
  const { oldPassword, newPassword } = payload;

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const isCorrectPassword: boolean = await bcrypt.compare(
    oldPassword,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password incorrect.");
  }

  const hashedPassword: string = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt.salt_rounds)
  );

  await prisma.user.update({
    where: {
      email: user.email,
    },
    data: {
      password: hashedPassword,
      needPasswordChange: false,
    },
  });

  return {
    message: "Password changed successfully.",
  };
};

const forgetPassword = async (payload: { email: string }) => {
  const { email } = payload;

  const userData = await prisma.user.findFirstOrThrow({
    where: {
      email,
      status: "ACTIVE",
    },
  });

  const resetPasswordToken = jwtHelper.generateToken(
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
    userData.email,
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
  payload: { id: string; password: string }
) => {
  const userData = await prisma.user.findFirstOrThrow({
    where: {
      id: payload.id,
      status: "ACTIVE",
    },
  });

  const isValidToken = jwtHelper.verifyToken(
    token,
    config.jwt.reset_password_secret as Secret
  );

  if (!isValidToken) {
    throw new ApiError(httpStatus.FORBIDDEN, "Forbidden.");
  }

  const hashedPassword: string = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt.salt_rounds)
  );

  await prisma.user.update({
    where: {
      id: payload.id,
      status: "ACTIVE",
    },
    data: {
      password: hashedPassword,
      needPasswordChange: false,
    },
  });

  return {
    message: "Password reset successfully. Please login...",
  };
};

export const AuthService = {
  loginUserFromDB,
  refreshTokenFromCookies,
  changePasswordIntoDB,
  forgetPassword,
  resetPassword,
};
