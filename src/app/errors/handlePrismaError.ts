import { Prisma } from "@prisma/client";
import { TErrorMessages, TGenericErrorResponse } from "../interfaces";
import { httpStatus } from "../../shared";

const handlePrismaError = (err: any): TGenericErrorResponse => {
  let statusCode = httpStatus.INTERNAL_SERVER_ERROR; // Default to Internal Server Error
  let message = "An unexpected error occurred";
  const errorSources: TErrorMessages = [];

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    //? Handle known request errors
    switch (err.code) {
      case "P2002": //? Unique constraint violation
        statusCode = httpStatus.CONFLICT; //? Conflict is more suitable for unique violations
        message = "Unique constraint violation";
        errorSources.push({
          path: err.meta?.target ? String(err.meta.target) : "unknown_field",
          message: `${err.meta?.target} must be unique.`,
        });
        break;

      case "P2025": //? Record not found
        statusCode = httpStatus.NOT_FOUND;
        message = "Record not found";
        errorSources.push({
          path: "id", //? Assumed the path relates to `id` or primary key
          message: "The specified record does not exist.",
        });
        break;

      default:
        message = `Prisma error with code: ${err.code}`;
        errorSources.push({
          path: "unknown",
          message: `Unhandled Prisma error: ${err.code}`,
        });
        break;
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    //? Handle validation errors
    statusCode = httpStatus.BAD_REQUEST;
    message = "Prisma validation error";
    const errorDetails = err.message.split("\n").filter((line) => line.trim());
    errorDetails.forEach((detail) => {
      const match = detail.match(/Argument\s+(\w+):\s+(.*)$/i);
      if (match) {
        const [, path, errorMessage] = match;
        errorSources.push({ path, message: errorMessage });
      } else {
        errorSources.push({ path: "unknown", message: detail });
      }
    });
  } else if (err instanceof Prisma.PrismaClientRustPanicError) {
    //? Handle Rust panic errors
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = "Internal server error (Rust panic)";
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    //? Handle initialization errors
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = "Database connection initialization error";
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    //? Handle unknown request errors
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = "Unknown database request error";
  }

  //? Return the structured error response
  return {
    statusCode,
    message,
    errorSources: errorSources.length
      ? errorSources
      : [{ path: "", message: "" }],
  };
};

export default handlePrismaError;
