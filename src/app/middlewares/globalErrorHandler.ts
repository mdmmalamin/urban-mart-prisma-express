import { NextFunction, Request, Response } from "express";
import { httpStatus } from "../../shared";

export const globalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // console.log(req.rawHeaders);

  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    status: httpStatus.INTERNAL_SERVER_ERROR,
    success: false,
    message: error?.message || "Something went wrong.",
    error: error,
  });
};
