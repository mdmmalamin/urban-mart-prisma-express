import { Request, Response } from "express";
import { apiResponse, catchAsync, httpStatus } from "../../../shared";
import { HistoryService } from "./history.service";

const getAllHistory = catchAsync(async (req: Request, res: Response) => {
  const result = await HistoryService.getAllHistoryFromDB(req.query);

  apiResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "All histories retrieved successfully.",
    meta: result.meta,
    data: result.data,
  });
});

export const HistoryController = {
  getAllHistory,
};
