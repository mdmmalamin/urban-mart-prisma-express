import { fileUploader, jwtSecure } from "../../../helpers";
import { TAuthUser, TFile, TQueryReturn } from "../../interfaces";
import { Prisma, UserRole, UserStatus } from "@prisma/client";
import { httpStatus, prisma } from "../../../shared";
import {
  TCreateAdmin,
  TRegisterCustomer,
  TRegisterVendor,
} from "./user.interface";
import { hashedPassword } from "../../../helpers";
import ApiError from "../../errors/ApiError";
import QueryBuilder from "../../builder/QueryBuilder";
import {
  FALLBACK_ADMIN,
  FALLBACK_CUSTOMER,
  FALLBACK_VENDOR,
  userSearchableFields,
} from "./user.constant";
import config from "../../../config";
import { Secret } from "jsonwebtoken";

const createAdminIntoDB = async (
  file: TFile | undefined,
  payload: TCreateAdmin
) => {
  if (file) {
    const fileName = `${payload?.admin?.fullName}-${payload?.admin?.phone}`;
    const { secure_url }: any = await fileUploader.uploadToCloudinary(
      file,
      fileName,
      "profile/admin"
    );

    payload.admin.avatar = secure_url;
  }

  const userData = {
    email: payload.admin.email.toLowerCase(),
    phone: payload.admin.phone,
    password: await hashedPassword(payload.password),
    role: UserRole.ADMIN,
  };

  const adminData = {
    fullName: payload.admin.fullName,
    gender: payload.admin.gender,
    dateOfBirth: payload.admin.dateOfBirth,
    avatar: payload.admin.avatar || FALLBACK_ADMIN,
  };

  const result = await prisma.$transaction(async (txClient) => {
    const createUser = await txClient.user.create({
      data: userData,
    });

    const createdAdmin = await txClient.admin.create({
      data: {
        userId: createUser.id,
        ...adminData,
      },
      include: {
        user: true,
      },
    });

    return createdAdmin;
  });

  return result;
};

const createVendorIntoDB = async (payload: TRegisterVendor) => {
  const { fullName, dateOfBirth, gender, email, phone, password } = payload;

  if (
    [fullName, dateOfBirth, gender, email, phone, password].some(
      (field) => field === ""
    )
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, "All fields are required");
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: email || undefined }, { phone: phone }],
    },
  });

  if (existingUser) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "Your phone or email already exists."
    );
  }

  const userData = {
    email: email.toLowerCase(),
    phone,
    password: await hashedPassword(password),
  };

  const result = await prisma.$transaction(async (txClient) => {
    const createUser = await txClient.user.create({
      data: {
        ...userData,
        role: UserRole.VENDOR,
      },
    });

    const createdVendor = await txClient.vendor.create({
      data: {
        userId: createUser.id,
        fullName,
        gender,
        dateOfBirth,
        avatar: FALLBACK_VENDOR || null,
      },
      include: {
        user: true,
      },
    });

    return createdVendor;
  });

  const jwtPayload = {
    id: result.userId,
    fullName: result.fullName,
    email: result.user.email,
    phone: result.user.phone,
    role: result.user.role,
    status: result.user.status,
    avatar: result?.avatar,
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

const createCustomerIntoDB = async (payload: TRegisterCustomer) => {
  const { email, phone, password } = payload;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: email || undefined }, { phone: phone }],
    },
  });

  if (existingUser) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "Your phone or email already exists."
    );
  }

  const userData = {
    email: email.toLowerCase(),
    phone,
    password: await hashedPassword(password),
  };

  const result = await prisma.$transaction(async (txClient) => {
    const createUser = await txClient.user.create({
      data: userData,
    });

    const createdCustomer = await txClient.customer.create({
      data: {
        userId: createUser.id,
        avatar: FALLBACK_CUSTOMER || null,
      },
      include: {
        user: true,
      },
    });

    return createdCustomer;
  });

  const jwtPayload = {
    id: result.userId,
    fullName: result.fullName,
    email: result.user.email,
    phone: result.user.phone,
    role: result.user.role,
    status: result.user.status,
    avatar: result?.avatar,
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

const getAllUserFromDB = async (
  query: Record<string, any>
): Promise<TQueryReturn> => {
  const queryBuilder = new QueryBuilder<Prisma.UserWhereInput>(query)
    .addSearchCondition(userSearchableFields)
    .addFilterConditions()
    .setPagination()
    .setSorting();

  const whereConditions = queryBuilder.buildWhere();
  const pagination = queryBuilder.getPagination();
  const sorting = queryBuilder.getSorting();

  const result = await prisma.user.findMany({
    where: whereConditions,
    ...pagination,
    orderBy: sorting,
    select: {
      id: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      passwordChangedAt: true,
      createdAt: true,
      updatedAt: true,
      admin: true,
      vendor: true,
      customer: true,
    },
  });

  const total = await prisma.user.count({
    where: whereConditions,
  });

  return {
    meta: {
      page: queryBuilder.paginationOptions.page,
      limit: queryBuilder.paginationOptions.limit,
      total,
    },
    data: result,
  };
};

const changeUserStatusIntoDB = async (
  id: string,
  payload: { status: UserStatus }
) => {
  await prisma.user.findUniqueOrThrow({ where: { id } });

  return await prisma.user.update({
    where: { id },
    data: payload,
  });
};

const getMyProfileFromDB = async (user: TAuthUser) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      id: user?.id,
      status: "ACTIVE",
    },
    select: {
      id: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      passwordChangedAt: true,
    },
  });

  let profileInfo;

  switch (user?.role) {
    case UserRole.CUSTOMER:
      profileInfo = await prisma.customer.findUnique({
        where: {
          userId: user.id,
        },
      });
      break;

    case UserRole.VENDOR:
      profileInfo = await prisma.vendor.findUnique({
        where: {
          userId: user.id,
        },
      });
      break;

    case UserRole.ADMIN:
      profileInfo = await prisma.admin.findUnique({
        where: {
          userId: user.id,
        },
      });
      break;

    case UserRole.SUPER_ADMIN:
      profileInfo = await prisma.admin.findUnique({
        where: {
          userId: user.id,
        },
      });
      break;

    default:
      throw new ApiError(httpStatus.FORBIDDEN, "Forbidden.");
  }

  return {
    ...userInfo,
    ...profileInfo,
  };
};

const getMyShopFromDB = async (user: TAuthUser) => {
  await prisma.user.findUniqueOrThrow({
    where: {
      id: user?.id,
      status: "ACTIVE",
    },
    select: { id: true },
  });

  const vendorData = await prisma.vendor.findUniqueOrThrow({
    where: { userId: user?.id },
  });

  return await prisma.shop.findUniqueOrThrow({
    where: { vendorId: vendorData.id, status: { in: ["ACTIVE", "INACTIVE"] } },

    include: { inventory: true, addresses: true },
  });
};

export const UserService = {
  createAdminIntoDB,
  createVendorIntoDB,
  createCustomerIntoDB,

  getAllUserFromDB,
  changeUserStatusIntoDB,
  getMyProfileFromDB,
  getMyShopFromDB,
};
