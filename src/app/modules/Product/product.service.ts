import { fileUploader, generateSku } from "../../../helpers";
import { httpStatus, prisma } from "../../../shared";
import ApiError from "../../errors/ApiError";
import { TAuthUser, TFile } from "../../interfaces";
import { TCreateProduct } from "./product.interface";

const getAllProductFromDB = async (query: Record<string, any>) => {
  return {
    meta: {
      page: 1,
      limit: 1,
      total: 1,
    },
    data: "result",
  };
};

const createProductIntoDB = async (
  user: TAuthUser,
  files: TFile[] | undefined,
  payload: TCreateProduct
) => {
  const vendorData = await prisma.vendor.findUniqueOrThrow({
    where: {
      userId: user?.id,
      isDeleted: false,
    },
  });

  const shopData = await prisma.shop.findUniqueOrThrow({
    where: {
      vendorId: vendorData.id,
      status: "ACTIVE",
    },
  });

  const categoryData = await prisma.category.findUniqueOrThrow({
    where: {
      id: payload.categoryId,
    },
  });

  let productImages: string[];

  if (files?.length) {
    const uploadImages = await Promise.all(
      files?.map(async (file, idx) => {
        const fileName = `${fileUploader.folderName(payload?.name)}-${idx + 1}`;

        //? Attempt to upload to Cloudinary
        const { secure_url } = await fileUploader.uploadToCloudinary(
          file,
          fileName,
          `product/${shopData.id}`
        );

        return secure_url;
      })
    );

    productImages = uploadImages;

    if (!uploadImages.length) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Failed to upload product images."
      );
    }
  }

  const result = await prisma.$transaction(async (txClient) => {
    const createInventory = await txClient.inventory.create({
      data: {
        shopId: shopData.id,
        availableQuantity: payload.quantity || 0,
      },
    });

    await txClient.history.create({
      data: {
        inventoryId: createInventory.id,
        quantityChanged: payload.quantity || 0,
        newQuantity: payload.quantity || 0,
      },
    });

    const createProduct = await txClient.product.create({
      data: {
        categoryId: payload.categoryId,
        inventoryId: createInventory.id,
        name: payload.name,

        description: payload.description || null,
        price: payload.price || 0.0,
        status: payload.status || "DRAFTED",
      },
    });

    const images = productImages?.map((item, idx) => ({
      productId: createProduct.id,
      url: item,
      isPrimary: idx === 0 && true,
    }));

    await txClient.image.createMany({
      data: images,
    });

    await txClient.inventory.update({
      where: { id: createInventory.id },
      data: {
        sku: await generateSku(
          shopData.name,
          categoryData.name,
          createProduct.id
        ),
      },
    });

    return createProduct;
  });

  const product = await prisma.product.findUnique({
    where: { id: result.id },
    include: {
      category: true,
      images: true,
      inventory: {
        include: {
          histories: true,
        },
      },
    },
  });

  return product;
};

export const ProductService = {
  getAllProductFromDB,
  createProductIntoDB,
};
