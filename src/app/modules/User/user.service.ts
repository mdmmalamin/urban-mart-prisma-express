import { fileUploader } from "../../../helpers";
import { TFile } from "../../interfaces";
import { UserRole } from "@prisma/client";
import { httpStatus, prisma } from "../../../shared";
import {
  TCreateAdmin,
  TRegisterCustomer,
  TRegisterVendor,
} from "./user.interface";
import { hashedPassword } from "../../../helpers/hashedPassword";
import ApiError from "../../errors/ApiError";

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

export const UserService = {
  createAdminIntoDB,
  createVendorIntoDB,
  createCustomerIntoDB,
};
