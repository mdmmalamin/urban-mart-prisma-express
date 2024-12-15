import { Prisma, ProductStatus } from "@prisma/client";
import { fileUploader, generateFolder, generateSku } from "../../../helpers";
import { httpStatus, prisma } from "../../../shared";
import QueryBuilder from "../../builder/QueryBuilder";
import ApiError from "../../errors/ApiError";
import { TAuthUser, TFile } from "../../interfaces";
import { TCreateProduct, TUpdateProduct } from "./product.interface";
import {
  FALLBACK_IMAGE_URL,
  productSearchableFields,
} from "./product.constant";

const getAllProductFromDB = async (query: Record<string, any>) => {
  const queryProducts = new QueryBuilder<Prisma.ProductWhereInput>(query)
    .addSearchCondition(productSearchableFields)
    .addFilterConditions()
    .setPagination()
    .setSorting();

  // doctor > doctorSpecialties > specialties -> title
  // product > category --> name

  const whereConditions = queryProducts.buildWhere();
  const pagination = queryProducts.getPagination();
  const sorting = queryProducts.getSorting();

  const result = await prisma.product.findMany({
    where: {
      ...whereConditions,
      status: "PUBLISHED",
    },
    ...pagination,
    orderBy: sorting,
    include: {
      images: true,
      category: true,
      inventory: {
        include: {
          histories: true,
        },
      },
    },
  });

  const total = await prisma.product.count({
    where: {
      ...whereConditions,
      status: "PUBLISHED",
    },
  });

  const maxPrice = await prisma.product.aggregate({
    _max: {
      price: true,
    },
  });

  return {
    meta: {
      page: queryProducts.paginationOptions.page,
      limit: queryProducts.paginationOptions.limit,
      total,
      maxPrice: maxPrice._max.price,
    },
    data: result,
  };
};

const getProductFromDB = async (id: string) => {
  const result = await prisma.product.findUniqueOrThrow({
    where: { id },

    include: {
      category: true,
      images: true,
      inventory: {
        include: {
          shop: true,
        },
      },
    },
  });

  return {
    ...result,
    quantity: result.inventory.availableQuantity as number,
    stock:
      (result.inventory.availableQuantity as number) > 0
        ? "IN STOCK"
        : "OUT OF STOCK",
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

    if (files?.length) {
      const uploadImages = await Promise.all(
        files?.map(async (file, idx) => {
          const fileName = `${fileUploader.imageName(payload?.name)}-${
            idx + 1
          }`;

          //? Attempt to upload to Cloudinary
          const { secure_url } = await fileUploader.uploadToCloudinary(
            file,
            fileName,
            `product/${await generateFolder(
              shopData.name,
              shopData.id
            )}/${await generateFolder(createProduct.name, createProduct.id)}`
          );

          return secure_url;
        })
      );

      const images = uploadImages?.map((item, idx) => ({
        productId: createProduct.id,
        url: item || FALLBACK_IMAGE_URL,
        isPrimary: idx === 0 && true,
      }));

      if (!uploadImages.length) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Failed to upload product images."
        );
      }

      await txClient.image.createMany({
        data: images,
      });
    } else {
      await txClient.image.create({
        data: {
          productId: createProduct.id,
          url: FALLBACK_IMAGE_URL,
          isPrimary: true,
        },
      });
    }

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

  const newProduct = await prisma.product.findUnique({
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

  return newProduct;
};

const duplicateProductIntoDB = async (id: string) => {
  const productData = await prisma.product.findUniqueOrThrow({
    where: { id },
    include: {
      category: true,
      images: true,
      inventory: true,
    },
  });

  const shopData = await prisma.shop.findUniqueOrThrow({
    where: { id: productData.inventory.shopId },
  });

  const categoryData = await prisma.category.findUniqueOrThrow({
    where: { id: productData.categoryId },
  });

  const result = await prisma.$transaction(async (txClient) => {
    const createInventory = await txClient.inventory.create({
      data: {
        shopId: productData.inventory.shopId,
      },
    });

    await txClient.history.create({
      data: {
        inventoryId: createInventory.id,
        note: `${productData.name} was duplicated to create this product.`,
      },
    });

    const createProduct = await txClient.product.create({
      data: {
        categoryId: productData.categoryId,
        inventoryId: createInventory.id,
        name: productData.name,
      },
    });

    // if (productData.images?.length) {
    //   const images = productData.images?.map(async ({ url }, idx) => {
    //     const originalFileName = await fileUploader.extractPublicId(url);

    //     // `product/${await generateFolder(
    //     //       shopData.name,
    //     //       shopData.id
    //     //     )}/${await generateFolder(createProduct.name, createProduct.id)}`

    //     // urban-mart/product/WEI-39CB8B41/MAC-54F52C6E/
    //     const newFileName = `urban-mart/product/${await generateFolder(
    //       shopData.name,
    //       shopData.id
    //     )}/${await generateFolder(
    //       createProduct.name,
    //       createProduct.id
    //     )}/${fileUploader.imageName(createProduct.name)}-${idx + 1}-copy`;

    //     const { secure_url } = await fileUploader.duplicateToCloudinary(
    //       originalFileName as string,
    //       newFileName
    //     );

    //     console.log("secure_url", secure_url);

    //     return {
    //       productId: createProduct.id,
    //       url: secure_url,
    //       isPrimary: idx === 0 && true,
    //     };
    //   });

    //   await txClient.image.createMany({
    //     data: images as [],
    //   });
    // }

    await txClient.image.create({
      data: {
        productId: createProduct.id,
        url: FALLBACK_IMAGE_URL,
        isPrimary: true,
      },
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

  const duplicateProduct = await prisma.product.findUnique({
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

  return duplicateProduct;
};

const updateProductIntoDB = async (id: string, payload: TUpdateProduct) => {
  await prisma.product.findUniqueOrThrow({ where: { id } });

  return await prisma.product.update({
    where: { id },

    data: payload,
  });
};

const StatusChangeIntoDB = async (
  id: string,
  payload: { status: ProductStatus }
) => {
  const result = await prisma.product.update({
    where: { id },
    data: { status: payload.status },
  });

  if (!result) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `The provided status '${payload.status}' is invalid or there was an error processing the request.`
    );
  }

  return result;
};

export const ProductService = {
  getAllProductFromDB,
  getProductFromDB,
  createProductIntoDB,
  duplicateProductIntoDB,
  updateProductIntoDB,
  StatusChangeIntoDB,
};
