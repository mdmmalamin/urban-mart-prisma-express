import { NextFunction, Request, Response } from "express";
import { httpStatus } from "../../shared";

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // console.log(req.rawHeaders);

  res.status(httpStatus.NOT_FOUND).json({
    status: httpStatus.NOT_FOUND,
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not valid!",
    },
  });
};
