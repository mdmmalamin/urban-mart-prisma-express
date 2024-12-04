import { fileUploader } from "../../../helpers";
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
import { userSearchableFields } from "./user.constant";

const createAdminIntoDB = async (
  file: TFile | undefined,
  payload: TCreateAdmin
) => {
  if (file) {
    const fileName = `${payload?.admin?.fullName}-${payload?.admin?.phone}`;
    const { secure_url } = await fileUploader.uploadToCloudinary(
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
    avatar: payload.admin.avatar,
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
      data: {
        ...userData,
        role: UserRole.VENDOR,
      },
    });

    const createdVendor = await txClient.vendor.create({
      data: {
        userId: createUser.id,
      },
      include: {
        user: true,
      },
    });

    return createdVendor;
  });

  return result;
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
      },
      include: {
        user: true,
      },
    });

    return createdCustomer;
  });

  return result;
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

  console.log(sorting);

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

export const UserService = {
  createAdminIntoDB,
  createVendorIntoDB,
  createCustomerIntoDB,

  getAllUserFromDB,
  changeUserStatusIntoDB,
  getMyProfileFromDB,
};
