import { Request, Response } from "express";
import { apiResponse, catchAsync, httpStatus } from "../../../shared";
import { AddressService } from "./address.service";

const getAllAddress = catchAsync(async (req: Request, res: Response) => {
  const result = await AddressService.getAllAddressFromDB(req.query);

  apiResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "All addresses retrieved successfully.",
    meta: result.meta,
    data: result.data,
  });
});

export const AddressController = {
  getAllAddress,
};
