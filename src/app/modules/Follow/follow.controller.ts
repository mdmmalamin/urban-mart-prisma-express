import { Request, Response } from "express";
import { apiResponse, catchAsync, httpStatus } from "../../../shared";
import { FollowService } from "./follow.service";

const getAllFollow = catchAsync(async (req: Request, res: Response) => {
  const result = await FollowService.getAllFollowFromDB(req.query);

  apiResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "All Follows retrieved successfully.",
    meta: result.meta,
    data: result.data,
  });
});

export const FollowController = {
  getAllFollow,
};
