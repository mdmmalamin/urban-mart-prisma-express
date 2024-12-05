import { NextFunction, Request, Response } from "express";

export const formDataParser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.body && req.body.data) {
    try {
      req.body = JSON.parse(req.body.data);
    } catch (error: any) {
      //? Proceed to the next middleware even if parsing fails
    }
  }

  next();
};
