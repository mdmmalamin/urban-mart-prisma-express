import { Request, Response } from "express";
import { apiResponse, catchAsync, httpStatus } from "../../../shared";
import { ReviewService } from "./review.service";

const getAllReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getAllReviewFromDB(req.query);

  apiResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "All reviews retrieved successfully.",
    meta: result.meta,
    data: result.data,
  });
});

export const ReviewController = {
  getAllReview,
};
