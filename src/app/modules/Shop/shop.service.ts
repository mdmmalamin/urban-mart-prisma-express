import { fileUploader } from "../../../helpers";
import { httpStatus, prisma } from "../../../shared";
import ApiError from "../../errors/ApiError";
import { TAuthUser, TFile } from "../../interfaces";

const getAllShopFromDB = async (query: Record<string, any>) => {
  return {
    meta: {
      page: 1,
      limit: 1,
      total: 1,
    },
    data: "result",
  };
};

const createShopIntoDB = async (
  user: TAuthUser,
  file: TFile | undefined,
  payload: any
) => {
  const vendorData = await prisma.vendor.findUniqueOrThrow({
    where: { userId: user?.id, isDeleted: false },
  });

  const shopData = await prisma.shop.findUnique({
    where: {
      vendorId: vendorData.id,
    },
  });

  if (shopData) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "You already have a shop associated with your account."
    );
  }

  if (file) {
    const fileName = `${payload?.name}-${user?.phone}-logo`;
    const { secure_url } = await fileUploader.uploadToCloudinary(
      file,
      fileName,
      "shop"
    );

    payload.logo = secure_url;
  }

  const result = await prisma.shop.create({
    data: {
      vendorId: vendorData.id,
      ...payload,
    },
  });

  return result;
};

export const ShopService = {
  getAllShopFromDB,
  createShopIntoDB,
};
