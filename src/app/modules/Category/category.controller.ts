import { Request, Response } from "express";
import { apiResponse, catchAsync, httpStatus } from "../../../shared";
import { CategoryService } from "./category.service";

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const { name } = req.body;
  console.log(req.body)

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

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const result = await CategoryService.updateCategoryIntoDB(id, data);

  apiResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: `The category ${data.name} has been successfully updated.`,
    data: result,
  });
});
const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CategoryService.deleteCategoryIntoDB(id);

  apiResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: `The category ${result.name} has been successfully deleted`,
    data: result,
  });
});

export const CategoryController = {
  createCategory,
  getAllCategory,
  updateCategory,
  deleteCategory,
};
