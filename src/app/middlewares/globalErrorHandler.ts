import { ErrorRequestHandler } from "express";
import { httpStatus } from "../../shared";
import { ZodError } from "zod";
import { TErrorMessages } from "../interfaces";
import { handleZodError } from "../errors";
import { Prisma } from "@prisma/client";
import config from "../../config";
import ApiError from "../errors/ApiError";
import handlePrismaError from "../errors/handlePrismaError";

export const globalErrorHandler: ErrorRequestHandler = (
  error,
  req,
  res,
  next
) => {
  //! Default error response
  let statusCode = httpStatus.INTERNAL_SERVER_ERROR;
  let message = "Something went wrong!";
  let errorMessages: TErrorMessages = [
    {
      path: "",
      message: "Something went wrong!",
    },
  ];

  //! Handle Zod validation errors
  if (error instanceof ZodError) {
    const simplifiedZodError = handleZodError(error);
    statusCode = simplifiedZodError?.statusCode || statusCode;
    message = simplifiedZodError?.message || message;
    errorMessages = simplifiedZodError?.errorSources || errorMessages;
  }

  //! Handle custom API errors
  else if (error instanceof ApiError) {
    statusCode = error?.statusCode || statusCode;
    message = error?.message || message;
    errorMessages = [
      {
        path: "",
        message: error?.message,
      },
    ];

    //! Special case for unauthorized errors
    if (statusCode === httpStatus.UNAUTHORIZED) {
      res.status(statusCode).json({
        success: false,
        statusCode,
        message: "You have no access to this route",
      });
    }
  }

  //! Handle Prisma known request errors
  else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const simplifiedPrismaError = handlePrismaError(error);
    statusCode = simplifiedPrismaError?.statusCode || statusCode;
    message = simplifiedPrismaError?.message || message;
    errorMessages = simplifiedPrismaError?.errorSources || errorMessages;
  }

  //! Handle general JavaScript errors
  else if (error instanceof Error) {
    message = error?.message || message;
    errorMessages = [
      {
        path: "",
        message: error?.message || message,
      },
    ];
  }

  //! Final response
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errorMessages,
    stack: config.env === "development" ? error?.stack : null, //? Include stack trace in development
  });

  return;
};
