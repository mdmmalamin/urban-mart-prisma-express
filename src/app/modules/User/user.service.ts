import bcrypt from "bcrypt";
import { fileUploader } from "../../../helpers";
import { TFile } from "../../interfaces";
import config from "../../../config";
import { UserRole } from "@prisma/client";
import { prisma } from "../../../shared";

const createAdminIntoDB = async (file: TFile | undefined, payload: any) => {
  if (file) {
    const fileName = `${payload?.admin?.name}-${payload?.admin?.phone}`;
    const { secure_url } = await fileUploader.uploadToCloudinary(
      file,
      fileName,
      "profile/admin"
    );
    payload.admin.avatar = secure_url;
  }

  const hashedPassword: string = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt.salt_rounds)
  );

  const userData = {
    password: hashedPassword,
    email: payload.admin.email,
    phone: payload.admin.phone,
    role: UserRole.ADMIN,
  };

  const adminData = payload.admin;

  const result = await prisma.$transaction(async (txClient) => {
    await txClient.user.create({
      data: userData,
    });

    const createdAdminData = await txClient.admin.create({
      data: adminData,
    });

    return createdAdminData;
  });

  return result;
};

export const UserService = {
  createAdminIntoDB,
};
