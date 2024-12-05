import { fileUploader, generateFolder } from "../../../helpers";
import { httpStatus, prisma } from "../../../shared";
import ApiError from "../../errors/ApiError";
import { TFile } from "../../interfaces";
import { FALLBACK_IMAGE_URL } from "../Product/product.constant";

const updateImagesIntoDB = async (
  id: string,
  files: TFile[],
  payload: { images: { id: string; isDeleted: boolean }[] } | undefined
) => {
  const imagesData = await prisma.image.findMany({
    where: { productId: id },
    include: { product: true },
  });

  const product = await prisma.product.findUniqueOrThrow({
    where: { id },
    include: {
      inventory: {
        include: {
          shop: true,
        },
      },
    },
  });

  if (payload?.images?.length) {
    return payload.images.map(async ({ id, isDeleted }) => {
      if (isDeleted) {
        return await prisma.image.delete({
          where: { id },
        });
      }
    });
  }

  if (files?.length) {
    const uploadImages = await Promise.all(
      files?.map(async (file, idx) => {
        const fileName = `${fileUploader.imageName(product.name)}-${idx + 1}`;

        //? Attempt to upload to Cloudinary
        const { secure_url } = await fileUploader.uploadToCloudinary(
          file,
          fileName,
          `product/${await generateFolder(
            product.inventory.shop.name,
            product.inventory.shop.id
          )}/${await generateFolder(product.name, product.id)}`
        );

        return secure_url;
      })
    );

    const images = uploadImages?.map((item, idx) => ({
      productId: product.id,
      url: item || FALLBACK_IMAGE_URL,
      isPrimary: idx === 0 && true,
    }));

    if (!uploadImages.length) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Failed to upload product images."
      );
    }

    return await prisma.image.createMany({
      data: images,
    });
  }

  return imagesData;
};

export const ProductImageService = {
  updateImagesIntoDB,
};
