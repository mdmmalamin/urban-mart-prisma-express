import { Request, Response } from "express";
import { apiResponse, catchAsync, httpStatus } from "../../../shared";
import { ProductService } from "./product.service";
import { TAuthUser, TFile } from "../../interfaces";

const getAllProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getAllProductFromDB(req.query);

  apiResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "All products retrieved successfully.",
    meta: result.meta,
    data: result.data,
  });
});

const getProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getProductFromDB(req.params.id);

  apiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `${result.name.toLocaleUpperCase()} data retrieved successfully.`,
    data: result,
  });
});

const createProduct = catchAsync(
  async (req: Request & { user?: TAuthUser }, res: Response) => {
    const user = req.user;
    const files = req.files;
    const data = req.body;

    const result = await ProductService.createProductIntoDB(
      user as TAuthUser,
      files as TFile[],
      data
    );

    apiResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "New product created successfully.",
      data: result,
    });
  }
);

const duplicateProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductService.duplicateProductIntoDB(id);

  apiResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Duplicate product created successfully.",
    data: result,
  });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.updateProductIntoDB(
    req.params.id,
    req.body
  );

  apiResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: `${result.name.toUpperCase()} was updated successfully.`,
    data: result,
  });
});

const statusChange = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.statusChangeIntoDB(
    req.params.id,
    req.body
  );

  apiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `The product status '${req.body.status}' has been updated successfully.`,
    data: result,
  });
});

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.deleteProductFromDB(req.params.id);

  apiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `The product '${result.name}' has been deleted successfully.`,
    data: result,
  });
});

export const ProductController = {
  getAllProduct,
  getProduct,
  createProduct,
  duplicateProduct,
  updateProduct,
  statusChange,
  deleteProduct,
};
