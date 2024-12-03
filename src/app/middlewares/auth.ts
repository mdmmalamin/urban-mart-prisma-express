import { NextFunction, Request, Response } from "express";
import config from "../../config";
import { Secret } from "jsonwebtoken";
import ApiError from "../errors/ApiError";
import { httpStatus } from "../../shared";
import { jwtSecure } from "../../helpers";

export const auth = (...roles: string[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized.");
      }

      const verifiedUser = jwtSecure.verifyToken(
        token,
        config.jwt.access_secret as Secret
      );

      if (roles.length && !roles.includes(verifiedUser.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, "Forbidden.");
      }

      req.user = verifiedUser;

      next();
    } catch (error) {
      next(error);
    }
  };
};
