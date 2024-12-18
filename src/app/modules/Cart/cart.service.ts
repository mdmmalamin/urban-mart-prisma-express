import { httpStatus, prisma } from "../../../shared";
import ApiError from "../../errors/ApiError";
import { TAuthUser } from "../../interfaces";

const getAllCartFromDB = async (query: Record<string, any>) => {
  return {
    meta: {
      page: 1,
      limit: 1,
      total: 1,
    },
    data: "result",
  };
};

const addToCartIntoDB = async (
  user: TAuthUser,
  id: string,
  payload: { quantity: number }
) => {
  const customerData = await prisma.customer.findUniqueOrThrow({
    where: { userId: user?.id },

    include: { cart: true },
  });

  const productData = await prisma.product.findUniqueOrThrow({
    where: { id, status: "PUBLISHED" },
    include: {
      inventory: true,
      cartItems: {
        include: {
          cart: true,
        },
      },
    },
  });

  if (productData.inventory.availableQuantity === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Quantity not available.");
  }

  if (customerData.cart && productData) {
    const cartItemExists = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: customerData.cart.id,
          productId: productData.id,
        },
      },
    });

    if (cartItemExists) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "The item already exists in the cart. Please update the quantity if needed."
      );
    }
  }

  const result = await prisma.$transaction(async (txClient) => {
    if (!customerData.cart) {
      const createCart = await txClient.cart.create({
        data: {
          customerId: customerData.id,
        },
      });

      await txClient.cartItem.create({
        data: {
          cartId: createCart.id,
          productId: id,
          quantity: payload?.quantity,
        },
      });

      const totalAmount = productData.price * (payload?.quantity || 1);

      return await txClient.cart.update({
        where: { id: createCart.id },
        data: { totalAmount },

        include: {
          cartItems: {
            select: {
              quantity: true,
              product: true,
            },
          },
        },
      });
    }

    if (customerData.cart) {
      await txClient.cartItem.create({
        data: {
          cartId: customerData.cart.id,
          productId: id,
          quantity: payload?.quantity,
        },
      });

      const totalAmount =
        (customerData.cart.totalAmount as number) +
        productData.price * (payload?.quantity || 1);

      return await txClient.cart.update({
        where: { id: customerData.cart.id },
        data: { totalAmount },

        include: {
          cartItems: {
            select: {
              quantity: true,
              product: true,
            },
          },
        },
      });
    }
  });

  return result;
};

const changeCartItemQuantityIntoDB = async (
  user: TAuthUser,
  id: string, //? product id
  payload: { quantity: number }
) => {
  const myCart = await prisma.customer.findUniqueOrThrow({
    where: { userId: user?.id },
    select: {
      cart: {
        include: {
          cartItems: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });

  const inventoryLimit = await prisma.product.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      inventory: true,
    },
  });

  if (
    payload?.quantity > (inventoryLimit?.inventory?.availableQuantity as number)
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Quantity Over.");
  }

  if (payload?.quantity === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Minimum quantity 1.");
  }

  const result = await prisma.$transaction(async (txClient) => {
    const updateCartItem = await txClient.cartItem.update({
      where: {
        cartId_productId: {
          cartId: myCart?.cart?.id as string,
          productId: id,
        },
      },

      data: payload,
    });

    const totalCart = await txClient.cart.findUniqueOrThrow({
      where: { id: myCart?.cart?.id as string },
      select: {
        cartItems: {
          select: {
            quantity: true,
            product: true,
          },
        },
      },
    });

    const totalAmount = totalCart?.cartItems?.reduce(
      (acc, item) => acc + item.quantity * item.product.price,
      0
    );

    await txClient.cart.update({
      where: {
        id: myCart?.cart?.id as string,
      },

      data: {
        totalAmount,
      },
    });

    return updateCartItem;
  });

  return result;
};

const getMyCartsFromDB = async (user: TAuthUser) => {
  const customerData = await prisma.customer.findUniqueOrThrow({
    where: { userId: user?.id },

    select: { id: true },
  });

  const result = await prisma.cart.findUnique({
    where: {
      customerId: customerData.id,
    },

    include: {
      cartItems: {
        select: {
          quantity: true,
          product: {
            include: {
              inventory: true,
              images: {
                select: {
                  url: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "No cart available.");
  }

  const cartItems = result.cartItems?.map(({ quantity, product }) => ({
    quantity,
    total: product.price * quantity,
    product,
  }));

  return {
    ...result,
    totalItem: result.cartItems.length,
    cartItems,
  };
};

const deletedCartItemFromDB = async (
  user: TAuthUser,
  id: string //? Product ID
) => {
  //? check valid customer
  const customerData = await prisma.customer.findUniqueOrThrow({
    where: { userId: user?.id },

    select: {
      id: true,
      cart: {
        include: {
          cartItems: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });

  const result = await prisma.$transaction(async (txClient) => {
    //? Deleted cartItem
    const deletedCartItem = await txClient.cartItem.delete({
      where: {
        cartId_productId: {
          cartId: customerData?.cart?.id as string,
          productId: id,
        },
      },
    });

    //? Find My Cart
    const totalCart = await txClient.cart.findUnique({
      where: {
        customerId: customerData.id,
      },

      select: {
        cartItems: {
          include: {
            product: true,
          },
        },
      },
    });

    const totalAmount = totalCart?.cartItems?.reduce(
      (acc, item) => acc + item.quantity * item.product.price,
      0
    );

    // console.log(totalCart);

    if (!totalCart?.cartItems?.length) {
      await txClient.cart.delete({
        where: { customerId: customerData.id },
      });
    } else {
      await txClient.cart.update({
        where: {
          customerId: customerData.id,
        },

        data: {
          totalAmount,
        },
      });
    }

    return deletedCartItem;
  });

  return result;
};

export const CartService = {
  getAllCartFromDB,
  addToCartIntoDB,
  changeCartItemQuantityIntoDB,

  getMyCartsFromDB,
  deletedCartItemFromDB,
};
