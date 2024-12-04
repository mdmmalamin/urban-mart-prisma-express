import { Request, Response } from "express";
import { apiResponse, catchAsync, httpStatus } from "../../../shared";
import { CategoryService } from "./category.service";

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const { name } = req.body;

  const result = await CategoryService.createCategoryIntoDB(name);

  apiResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "New category created successfully.",
    data: result,
  });
});

const getAllCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.getAllCategoryFromDB(req.query);

  apiResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "All categories retrieved successfully.",
    meta: result.meta,
    data: result.data,
  });
});

export const CategoryController = {
  createCategory,
  getAllCategory,
};
