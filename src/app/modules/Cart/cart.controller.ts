import { Request, Response } from "express";
import { apiResponse, catchAsync, httpStatus } from "../../../shared";
import { CartService } from "./cart.service";
import { TAuthUser } from "../../interfaces";

const getAllCart = catchAsync(async (req: Request, res: Response) => {
  const result = await CartService.getAllCartFromDB(req.query);

  apiResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "All carts retrieved successfully.",
    meta: result.meta,
    data: result.data,
  });
});

const addToCart = catchAsync(
  async (req: Request & { user?: TAuthUser }, res: Response) => {
    const result = await CartService.addToCartIntoDB(
      req.user as TAuthUser,
      req.params.id,
      req.body
    );

    apiResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `Product add to cart successfully.`,
      data: result,
    });
  }
);

const changeCartItemQuantity = catchAsync(
  async (req: Request & { user?: TAuthUser }, res: Response) => {
    const result = await CartService.changeCartItemQuantityIntoDB(
      req.user as TAuthUser,
      req.params.id,
      req.body
    );

    apiResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `Product quantity updated successfully.`,
      data: result,
    });
  }
);

const getMyCarts = catchAsync(
  async (req: Request & { user?: TAuthUser }, res: Response) => {
    const result = await CartService.getMyCartsFromDB(req.user as TAuthUser);

    apiResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `My all carts retrieved successfully.`,
      data: result,
    });
  }
);

const deletedCartItem = catchAsync(
  async (req: Request & { user?: TAuthUser }, res: Response) => {
    const result = await CartService.deletedCartItemFromDB(
      req.user as TAuthUser,
      req.params.id
    );

    apiResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `Your cart item deleted successfully.`,
      data: result,
    });
  }
);

export const CartController = {
  getAllCart,
  addToCart,
  changeCartItemQuantity,

  getMyCarts,
  deletedCartItem,
};
