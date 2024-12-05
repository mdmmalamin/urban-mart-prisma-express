import { Request, Response } from "express";
import { apiResponse, catchAsync, httpStatus } from "../../../shared";
import { ProductImageService } from "./ProductImage.service";
import { TFile } from "../../interfaces";

const updateImages = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductImageService.updateImagesIntoDB(
    req.params.id,
    req.files as TFile[],
    req.body
  );

  apiResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    // message: `${result.data.product.name.toUppercase()} images updated successfully.`,
    message: `images updated successfully.`,
    data: result,
  });
});

export const ProductImageController = {
  updateImages,
};
