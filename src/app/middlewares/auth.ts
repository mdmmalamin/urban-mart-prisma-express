import { NextFunction, Request, Response } from "express";
import config from "../../config";
import { Secret } from "jsonwebtoken";
import ApiError from "../errors/ApiError";
import { catchAsync, httpStatus, prisma } from "../../shared";
import { jwtSecure } from "../../helpers";
import { UserRole } from "@prisma/client";

export const auth = (...requiredRoles: UserRole[]) => {
  return catchAsync(
    async (
      req: Request & { user?: any },
      res: Response,
      next: NextFunction
    ) => {
      const token = req.headers.authorization;
      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized.");
      }

      const decoded = jwtSecure.verifyToken(
        token,
        config.jwt.access_secret as Secret
      );

      const { role, id, iat } = decoded;
      const userData = await prisma.user.findUniqueOrThrow({ where: { id } });

      if (userData.status === "DELETED") {
        throw new ApiError(httpStatus.FORBIDDEN, "This user is deleted.");
      }

      if (userData.status === "SUSPENDED") {
        throw new ApiError(httpStatus.FORBIDDEN, "This user is suspended.");
      }

      console.log(userData);

      if (
        userData.passwordChangedAt &&
        jwtSecure.isJWTIssuedBeforePasswordChanged(
          userData.passwordChangedAt,
          iat as number
        )
      ) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          "Your password has recently been changed. Please log in again to continue."
        );
      }

      if (requiredRoles.length && !requiredRoles.includes(role)) {
        throw new ApiError(httpStatus.FORBIDDEN, "Forbidden.");
      }

      req.user = decoded;
      next();
    }
  );
};
